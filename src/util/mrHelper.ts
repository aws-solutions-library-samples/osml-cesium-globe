import {
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient
} from "@aws-sdk/client-sqs";

import {
  ACCOUNT,
  getAWSCreds,
  KINESIS_RESULTS_STREAM_PREFIX,
  MONITOR_IMAGE_STATUS_INTERVAL_SECONDS,
  MONITOR_IMAGE_STATUS_RETRIES,
  REGION,
  S3_RESULTS_BUCKET_PREFIX,
  SQS_IMAGE_REQUEST_QUEUE,
  SQS_IMAGE_STATUS_QUEUE
} from "@/config";

export interface ImageRequest {
  jobId: string;
  jobName: string;
  jobArn: string;
  imageUrls: string[];
  outputs: any[];
  imageProcessor: any;
  imageProcessorTileSize?: number;
  imageProcessorTileOverlap?: number;
  imageProcessorTileFormat?: string;
  imageProcessorTileCompression?: string;
  imageReadRole?: string;
  featureSelectionOptions?: any;
  regionOfInterest?: string;
  featureProperties?: string;
}

function getSQSClient() {
  return new SQSClient({ region: REGION, credentials: getAWSCreds() });
}

export async function runModelOnImage(
    jobId: string,
    s3Uri: string,
    imageReadRole: string,
    modelValue: string,
    modelInvokeModeValue: string,
    modelInvokeRole: string,
    selectedOutputs: any,
    tileSizeValue: number,
    tileOverlapValue: number,
    formatValue: string,
    compressionValue: string,
    roiWkt: string,
    featureProperties: string,
    imageRequestStatus: any,
    setImageRequestStatus: any,
    setShowCredsExpiredAlert: any
): Promise<void> {
  setImageRequestStatus({ state: "loading", data: {} });
  const imageProcessingRequest = buildImageProcessingRequest(
      jobId,
      s3Uri,
      imageReadRole,
      modelValue,
      modelInvokeModeValue,
      modelInvokeRole,
      selectedOutputs,
      tileSizeValue,
      tileOverlapValue,
      formatValue,
      compressionValue,
      roiWkt,
      featureProperties
  );
  await queueImageProcessingJob(
      imageProcessingRequest,
      setShowCredsExpiredAlert
  );
  const jobName = imageProcessingRequest.jobName;
  const outputs = imageProcessingRequest.outputs;

  // Recreate the image_id that will be associated with the image request
  // Note this logic must match the strategy used to construct the image ID in the Model Runner from the
  // image processing request. See AWSOversightMLModelRunner src/aws_oversightml_model_runner/model_runner_api.py
  const imageId = `${jobId}:${imageProcessingRequest.imageUrls[0]}`;
  const resultData = { outputs: outputs, jobId: jobId, jobName: jobName };

  // Monitor the job status queue for updates
  await monitorJobStatus(
      imageId,
      setImageRequestStatus,
      resultData,
      setShowCredsExpiredAlert
  );
}

async function monitorJobStatus(
    imageId: string,
    setImageRequestStatus: any,
    resultData: any,
    setShowCredsExpiredAlert: any
): Promise<boolean> {
  let done: boolean = false;
  try {
    const sqsClient = getSQSClient();
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let maxRetries: number = MONITOR_IMAGE_STATUS_RETRIES;
    const retryInterval: number = MONITOR_IMAGE_STATUS_INTERVAL_SECONDS;
    const getUrlCommand = new GetQueueUrlCommand({
      QueueName: SQS_IMAGE_STATUS_QUEUE
    });
    const getUrlResponse = await sqsClient.send(getUrlCommand);
    const queueUrl = getUrlResponse.QueueUrl;
    console.log("Listening to SQS ImageStatusQueue for progress updates...");

    while (!done && maxRetries > 0) {
      const messagesResponse = await sqsClient.send(
          new ReceiveMessageCommand({ QueueUrl: queueUrl })
      );
      const messages = messagesResponse.Messages;
      if (messages) {
        messages.forEach((message) => {
          if (message.Body) {
            const messageAttributes = JSON.parse(
                message.Body
            ).MessageAttributes;
            const messageImageId = messageAttributes.image_id.Value;
            const messageImageStatus = messageAttributes.image_status.Value;
            if (
                messageImageStatus == "IN_PROGRESS" &&
                messageImageId == imageId
            ) {
              setImageRequestStatus({ state: "in-progress", data: {} });
              console.log(
                  "\tIN_PROGRESS message found! Waiting for SUCCESS message..."
              );
            } else if (
                messageImageStatus == "SUCCESS" &&
                messageImageId == imageId
            ) {
              const processingDuration =
                  messageAttributes.processing_duration.Value;
              done = true;
              setImageRequestStatus({ state: "success", data: resultData });
              console.log(
                  `\tSUCCESS message found!  Image took ${processingDuration} seconds to process`
              );
              done = true;
            } else if (
                messageImageStatus == "FAILED" &&
                messageImageId == imageId
            ) {
              const failureMessage = JSON.parse(message.Body).Message;
              setImageRequestStatus({ state: "error", data: {} });
              console.log(`Failed to process image. ${failureMessage}`);
              done = true;
            }
            else if (
                messageImageStatus == "PARTIAL" &&
                messageImageId == imageId
            ) {
              const failureMessage = JSON.parse(message.Body).Message;
              setImageRequestStatus({ state: "warning", data: {} });
              console.log(`Image processed with errors. ${failureMessage}`);
              done = true;
            }
          }
        });
      } else {
        maxRetries = maxRetries - 1;
        await sleep(retryInterval * 1000);
      }
    }
    if (!done) {
      console.log(`Maximum retries reached waiting for ${imageId}`);
    }
    return done;
  } catch (e: any) {
    if (e.code === "ExpiredToken") {
      setShowCredsExpiredAlert(true);
    } else {
      throw e;
    }
    return done;
  }
}

async function queueImageProcessingJob(
    imageProcessingRequest: ImageRequest,
    setShowCredsExpiredAlert: any
): Promise<void> {
  try {
    const sqsClient = getSQSClient();
    const getUrlCommand = new GetQueueUrlCommand({
      QueueName: SQS_IMAGE_REQUEST_QUEUE
    });
    const getUrlResponse = await sqsClient.send(getUrlCommand);
    const queueUrl = getUrlResponse.QueueUrl;
    const input = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(imageProcessingRequest)
    };
    const sendMessageCommand = new SendMessageCommand(input);
    const sendMessageResponse = await sqsClient.send(sendMessageCommand);
    console.log(
        `Message queued to SQS with messageId=${sendMessageResponse.MessageId}`
    );
  } catch (e: any) {
    if (e.code === "ExpiredToken") {
      setShowCredsExpiredAlert(true);
    } else {
      throw e;
    }
  }
}

function buildImageProcessingRequest(
    jobId: string,
    s3Uri: string,
    imageReadRole: string,
    modelValue: string,
    modelInvokeModeValue: string,
    modelInvocationRole: string,
    selectedOutputs: any,
    tileSizeValue: number,
    tileOverlapValue: number,
    formatValue: string,
    compressionValue: string,
    roiWkt: string,
    featureProperties: string
): ImageRequest {
  const jobName: string = `test_${jobId}`;
  const jobArn: string = `arn:aws:oversightml:${REGION}:${ACCOUNT}:ipj/${jobName}`;
  const resultStream = `${KINESIS_RESULTS_STREAM_PREFIX}-${ACCOUNT}`;
  const resultBucket = `${S3_RESULTS_BUCKET_PREFIX}-${ACCOUNT}`;
  const processor = { name: modelValue, type: modelInvokeModeValue, assumedRole: modelInvocationRole };
  const outputList: any[] = [];
  selectedOutputs.forEach((selectedOutput: any) => {
    if (selectedOutput.value == "S3") {
      outputList.push({
        type: "S3",
        bucket: resultBucket,
        prefix: `${jobName}/`
      });
    } else if (selectedOutput.value == "Kinesis") {
      outputList.push({
        type: "Kinesis",
        stream: resultStream,
        batchSize: 1000
      });
    }
  });
  console.log(`Starting ModelRunner image job in ${REGION}`);
  console.log(`Image: ${s3Uri}`);
  console.log(`Model: ${modelValue}`);
  console.log(`Creating request job_id=${jobId}`);
  const imageRequest: ImageRequest = {
    jobId: jobId,
    jobName: jobName,
    jobArn: jobArn,
    imageUrls: [s3Uri],
    imageReadRole: imageReadRole,
    imageProcessor: processor,
    outputs: outputList,
    imageProcessorTileSize: tileSizeValue,
    imageProcessorTileOverlap: tileOverlapValue,
    imageProcessorTileFormat: formatValue,
    imageProcessorTileCompression: compressionValue,
  };
  if (roiWkt.length > 0) {
    imageRequest.regionOfInterest = roiWkt;
  }
  if (featureProperties.length > 0) {
    imageRequest.featureProperties = featureProperties;
  }
  console.log(imageRequest);
  return imageRequest;
}

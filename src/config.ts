import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { ConfigIniParser } from "config-ini-parser";
import { readFileSync } from "fs";
import { homedir } from "os";
import { Color } from "cesium";

// local resources
export const LOCAL_GEOJSON_FOLDER: string = "src/data/geojson/";
export const LOCAL_IMAGE_DATA_FOLDER: string = "src/data/images/";
export const CESIUM_IMAGERY_TILES_FOLDER: string = "src/data/tiles/imagery/";
export const CESIUM_TERRAIN_TILES_FOLDER: string = "src/data/tiles/terrain/";

export const DDB_JOB_STATUS_TABLE: string = "ImageProcessingJobStatus";

// queue names
export const SQS_IMAGE_REQUEST_QUEUE: string = "ImageRequestQueue";
export const SQS_IMAGE_STATUS_QUEUE: string = "ImageStatusQueue";

// bucket name prefixes
export const S3_RESULTS_BUCKET_PREFIX: string = "test-results";

// stream name prefixes
export const KINESIS_RESULTS_STREAM_PREFIX: string = "test-stream";

// deployment info
export const REGION: string = "us-west-2";

// grab the aws credentials
interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

export function getAWSCreds(): Credentials | undefined {
  try {
    const file = readFileSync(`${homedir}/.aws/credentials`, "utf-8");

    const parser = new ConfigIniParser();
    parser.parse(file);

    // looks for creds under the 'default' profile of the aws/credentials file
    const creds: Credentials = {
      accessKeyId: parser.get("default", "aws_access_key_id"),
      secretAccessKey: parser.get("default", "aws_secret_access_key"),
      sessionToken: parser.get("default", "aws_session_token")
    };

    return creds;
  } catch (e: any) {
    console.log(e);
  }
}

const getAWSAccountId = async (): Promise<string> => {
  const response = await new STSClient({
    region: REGION,
    credentials: getAWSCreds()
  }).send(new GetCallerIdentityCommand({}));
  return String(response.Account);
};

export const ACCOUNT: string = await getAWSAccountId();

// default image request values
export const DEFAULT_MODEL_INVOKE_MODE: string = "SM_ENDPOINT";
export const DEFAULT_TILE_FORMAT: string = "GTIFF";
export const DEFAULT_TILE_COMPRESSION: string = "NONE";
export const DEFAULT_TILE_SIZE: number = 512;
export const DEFAULT_TILE_OVERLAP: number = 128;
export const DEFAULT_RESULTS_COLOR_OPTION = {
  label: "Yellow",
  value: Color.YELLOW.toCssColorString()
};
export const DEFAULT_RESULTS_LINE_ALPHA: number = 0.9;
export const DEFAULT_RESULTS_FILL_ALPHA: number = 0.3;

export const ZOOM_MAX: number = 17;
export const ZOOM_MIN: number = 10;

// sqs retry
export const MONITOR_IMAGE_STATUS_RETRIES: number = 300;
export const MONITOR_IMAGE_STATUS_INTERVAL_SECONDS: number = 5;

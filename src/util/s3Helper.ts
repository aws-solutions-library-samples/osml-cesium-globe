// Copyright 2023-2024 Amazon.com, Inc. or its affiliates.

import {
  _Object,
  Bucket,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListBucketsCommand,
  ListBucketsCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client
} from "@aws-sdk/client-s3";

import CredsExpiredAlert from "@/components/alert/CredsExpiredAlert";
import { getAWSCreds, REGION } from "@/config";

const s3Client: S3Client = new S3Client({
  region: REGION,
  credentials: getAWSCreds()
});

/**
 * Fetch the list of S3 Buckets.
 * @param {Function} setShowCredsExpiredAlert - Function to handle alert showing for expiration credentials.
 * @returns {Promise<Array<Bucket | undefined> | null>} - A Promise that resolves with an Array of Buckets or undefined or null.
 */
export async function getListOfS3Buckets(
  setShowCredsExpiredAlert: (value: boolean) => void
): Promise<Array<Bucket | undefined> | null> {
  try {
    const s3Responses: ListBucketsCommandOutput = await s3Client.send(
      new ListBucketsCommand({})
    );

    if (s3Responses) {
      const s3BucketsObjectList: Bucket[] | undefined = s3Responses["Buckets"];
      const s3BucketsList: (Bucket | undefined)[] = [];

      if (s3BucketsObjectList) {
        s3BucketsObjectList.forEach((bucket: Bucket) => {
          s3BucketsList.push(bucket);
        });
        return s3BucketsList;
      } else {
        console.error("Your S3 account does not contain any buckets.");
      }
    } else {
      console.error(
        "Cannot fetch buckets from S3. Please verify your roles/permissions."
      );
    }
  } catch (e: unknown) {
    if (e instanceof CredsExpiredAlert) {
      setShowCredsExpiredAlert(true);
    } else {
      throw e;
    }
  }

  return null;
}

/**
 * Fetch the list of S3 Objects from a specified Bucket.
 * @param {string} bucketName - The name of the bucket to fetch Objects from.
 * @param {Function} setShowCredsExpiredAlert - Function to handle alert showing for expiration credentials.
 * @returns {Promise<Array<S3Object> | string | null>} - A Promise that resolves with an Array of S3 Objects or a string message or null.
 */
export async function getListOfS3Objects(
  bucketName: string,
  setShowCredsExpiredAlert: (value: boolean) => void
): Promise<Array<_Object> | string | null> {
  try {
    const s3Responses: ListObjectsV2CommandOutput = await s3Client.send(
      new ListObjectsV2Command({ Bucket: bucketName })
    );
    const s3ObjectsList: _Object[] | undefined = s3Responses["Contents"];

    if (s3ObjectsList) {
      return s3ObjectsList;
    } else {
      console.error("Cannot fetch S3 Objects from this bucket: " + bucketName);
    }
  } catch (e: unknown) {
    if (e instanceof CredsExpiredAlert) {
      setShowCredsExpiredAlert(true);
    } else {
      throw e;
    }
  }

  return null;
}

/**
 * Load a specified S3 Object.
 * @param {Object} s3Object - The S3 Object to load.
 * @param {string} s3Object.name - The name of the S3 Object.
 * @param {string} s3Object.bucket - The bucket that the S3 Object comes from.
 * @param {string} s3Object.date - The date that the S3 Object was created.
 * @param {Function} setShowCredsExpiredAlert - Function to handle alert showing for expiration credentials.
 * @param {boolean} asBinary - Optional flag, if true the object will be returned as Byte Array, otherwise as a String.
 * @returns {Promise<string | Uint8Array | null>} - A Promise that resolves with a string, ByteString or null.
 */
export async function loadS3Object(
  s3Object: {
    name: string;
    bucket: string;
    date: string;
  },
  setShowCredsExpiredAlert: (value: boolean) => void,
  asBinary?: boolean
): Promise<string | Uint8Array | null> {
  /**
   * TODO: Convert argument into List, implement foreach and download s3 to local drive
   */
  try {
    const response: GetObjectCommandOutput = await s3Client.send(
      new GetObjectCommand({ Bucket: s3Object.bucket, Key: s3Object.name })
    );

    if (response["Body"]) {
      if (asBinary) {
        return await response["Body"]?.transformToByteArray();
      } else {
        return new TextDecoder().decode(
          await response["Body"]?.transformToByteArray()
        );
      }
    }
  } catch (e: unknown) {
    if (e instanceof CredsExpiredAlert) {
      setShowCredsExpiredAlert(true);
    } else {
      throw e;
    }
  }

  return null;
}

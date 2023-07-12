import {Bucket, GetObjectCommand, ListBucketsCommand, ListObjectsV2Command, S3Client} from "@aws-sdk/client-s3";
import { getAWSCreds, REGION} from "@/config";

const credentialsExpired: string = "ExpiredToken: Refresh ADA Credentials"
const unknownException: string = "An unknown exception occurred."

async function getS3Client() {
    return new S3Client({
        region: REGION,
        credentials: getAWSCreds()
    });
}

export async function getListOfS3Buckets(setShowCredsExpiredAlert: any) {
    try {
        const s3Client = await getS3Client();
        const s3Responses = await s3Client.send(new ListBucketsCommand({}));
        if (s3Responses) {
            const s3BucketsObjectList = s3Responses["Buckets"];
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
    } catch (e: any) {
        console.log(`Exception caught: ${e}`)
        if (e.name === 'ExpiredToken') {
            setShowCredsExpiredAlert(true)
        }
    }


    return null;
}

export async function getListOfS3Objects(bucketName: string, setShowCredsExpiredAlert: any) {
    try {
        const s3Client = await getS3Client();
        const s3Responses = await s3Client.send(
            new ListObjectsV2Command({Bucket: bucketName})
        );
        const s3ObjectsList = s3Responses["Contents"];
        if (s3ObjectsList) {
            return s3ObjectsList;
        } else {
            console.error("Cannot fetch S3 Objects from this bucket: " + bucketName);
        }
    } catch (e: any) {
        if (e.code === 'ExpiredToken') {
            setShowCredsExpiredAlert(true)
            return credentialsExpired
        } else {
            return unknownException
        }
    }
}

export async function loadS3Object(s3Object: {
    name: string;
    bucket: string;
    date: string;
}, setShowCredsExpiredAlert: any, asBinary?: boolean) {
    /**
     * TODO: Convert argument into List, implement foreach and download s3 to local drive
     */
    try {
        const s3Client = await getS3Client();
        const response = await s3Client.send(
            new GetObjectCommand({
                Bucket: s3Object.bucket,
                Key: s3Object.name
            })
        );
        if (response["Body"]) {
            if (asBinary) {
                return await response["Body"].transformToByteArray();
            } else {
                return await response["Body"].transformToString();
            }
        }
    } catch (e: any) {
        if (e.code === 'ExpiredToken') {
            setShowCredsExpiredAlert(true)
            return credentialsExpired
        } else {
            return unknownException
        }
    }
}

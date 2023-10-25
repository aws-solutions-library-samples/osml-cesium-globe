import {
  ListEndpointsCommand,
  SageMakerClient
} from "@aws-sdk/client-sagemaker";

import { getAWSCreds, REGION } from "@/config";

async function getSageMakerClient() {
  return new SageMakerClient({
    region: REGION,
    credentials: getAWSCreds()
  });
}

export async function getListOfSMEndpoints(setShowCredsExpiredAlert: any) {
  try {
    const client = await getSageMakerClient();
    const response = await client.send(new ListEndpointsCommand({}));
    if (response) {
      const endpointObjectList = response["Endpoints"];
      const endpointList: any[] = [];
      if (endpointObjectList) {
        endpointObjectList.forEach((endpoint: any) => {
          endpointList.push(endpoint.EndpointName);
        });
        return endpointList;
      } else {
        console.error("Your account does not contain any sagemaker endpoints.");
      }
    } else {
      console.error(
        "Cannot fetch endpoints from SageMaker. Please verify your roles/permissions."
      );
    }
  } catch (e: any) {
    console.log(`Exception caught: ${e}`);
    if (e.name === "ExpiredToken") {
      setShowCredsExpiredAlert(true);
    }
  }
}

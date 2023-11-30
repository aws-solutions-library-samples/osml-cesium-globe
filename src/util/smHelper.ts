import {
  EndpointSummary,
  ListEndpointsCommand,
  SageMakerClient
} from "@aws-sdk/client-sagemaker";

import CredsExpiredAlert from "@/components/alert/CredsExpiredAlert";
import { getAWSCreds, REGION } from "@/config";

/**
 * Retrieves a list of all SageMaker endpoints
 * @param setShowCredsExpiredAlert {(arg0: boolean) => void} A function to set the state of the credential expired alert
 * @returns {Promise<(string | undefined)[] | undefined>} A Promise that resolves to array of endpoint names or undefined
 * @throws will throw an error if one occurs during the AWS call or if it's not instance of CredsExpiredAlert
 */
export async function getListOfSMEndpoints(
  setShowCredsExpiredAlert: (arg0: boolean) => void
): Promise<(string | undefined)[] | undefined> {
  try {
    const client: SageMakerClient = new SageMakerClient({
      region: REGION,
      credentials: getAWSCreds()
    });

    const { Endpoints: endpointObjectList }: { Endpoints?: EndpointSummary[] } =
      await client.send(new ListEndpointsCommand({}));

    if (!endpointObjectList || endpointObjectList.length === 0) {
      console.error("Your account does not contain any SageMaker endpoints.");
      return;
    }

    return endpointObjectList.map(
      (endpoint: EndpointSummary) => endpoint.EndpointName
    );
  } catch (e: unknown) {
    if (e instanceof CredsExpiredAlert) {
      setShowCredsExpiredAlert(true);
    } else {
      throw e;
    }
  }
  return;
}

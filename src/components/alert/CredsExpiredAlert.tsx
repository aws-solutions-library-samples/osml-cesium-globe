import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { Alert } from "@cloudscape-design/components";
import { useState } from "react";

import { getAWSCreds, REGION } from "@/config";

const startingAlertMessage =
  "Refresh your credentials before closing this alert.";

const CredsExpiredAlert = ({
  setShowCredsExpiredAlert
}: {
  setShowCredsExpiredAlert: any;
}) => {
  const [alertMessage, setAlertMessage] = useState(startingAlertMessage);

  const updateAlert = async () => {
    try {
      // check if the creds are still expired by making an API call
      const response = await new STSClient({
        region: REGION,
        credentials: getAWSCreds()
      }).send(new GetCallerIdentityCommand({}));
      // if the code reached this point then the token refreshed successfully
      setShowCredsExpiredAlert(false);
      // Reset the alert message for next time
      setAlertMessage(startingAlertMessage);
    } catch (e: any) {
      console.error(`Exception caught: ${e}`);
      if (e.name === "ExpiredToken") {
        setAlertMessage(
          "AWS token still is expired. Refresh credentials and try again."
        );
      } else {
        // Something else went wrong
        setAlertMessage(
          "Uknown error occurred when testing credentials. Restart application."
        );
      }
    }
  };
  return (
    <Alert
      statusIconAriaLabel="Error"
      type="error"
      header="Credentials have expired."
      dismissible
      onDismiss={() => updateAlert()}
    >
      {alertMessage}
    </Alert>
  );
};

export default CredsExpiredAlert;

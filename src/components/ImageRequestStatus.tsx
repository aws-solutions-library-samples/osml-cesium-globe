import StatusIndicator from "@cloudscape-design/components/status-indicator";

const ImageRequestStatus = ({
  imageRequestStatus
}: {
  imageRequestStatus: any;
  setImageRequestStatus: any;
}) => {
  const validImageRequestSatusValues = new Map<string, string>();
  validImageRequestSatusValues.set("loading", "Submitting image request...");
  validImageRequestSatusValues.set("pending", "Image request pending...");
  validImageRequestSatusValues.set("in-progress", "Request in progress...");
  validImageRequestSatusValues.set("success", "Request succeeded!");
  validImageRequestSatusValues.set("error", "Request failed!");
  validImageRequestSatusValues.set("warning", "Request partially succeeded!");
  if (validImageRequestSatusValues.has(imageRequestStatus.state)) {
    return (
      <div>
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 100,
            backgroundColor: "lightskyblue",
            opacity: 0.9,
            borderRadius: 5,
            padding: 5
          }}
        >
          <StatusIndicator type={imageRequestStatus.state}>
            {validImageRequestSatusValues.get(imageRequestStatus.state)}
          </StatusIndicator>
        </div>
      </div>
    );
  } else {
    return <div></div>;
  }
};

export default ImageRequestStatus;

import React from "react";

import ImageRequestStatus from "@/components/ImageRequestStatus";
import OsmlMenu from "@/components/OsmlMenu";

const OsmlTray = () => {
  const [imageRequestStatus, setImageRequestStatus] = React.useState({
    state: "idle",
    data: {}
  });
  return (
    <div>
      <OsmlMenu
        imageRequestStatus={imageRequestStatus}
        setImageRequestStatus={setImageRequestStatus}
      />
      <ImageRequestStatus
        imageRequestStatus={imageRequestStatus}
        setImageRequestStatus={setImageRequestStatus}
      />
    </div>
  );
};

export default OsmlTray;

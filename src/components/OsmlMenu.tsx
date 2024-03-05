// Copyright 2023-2024 Amazon.com, Inc. or its affiliates.

import { ButtonDropdown } from "@cloudscape-design/components";
import Icon from "@cloudscape-design/components/icon";
import { useState } from "react";

import ImageRequestModal from "@/components/modal/ImageRequestModal";

import CredsExpiredAlert from "./alert/CredsExpiredAlert";
import LoadDataModal from "./modal/LoadDataModal";

const OsmlMenu = ({
  imageRequestStatus,
  setImageRequestStatus
}: {
  imageRequestStatus: any;
  setImageRequestStatus: any;
}) => {
  // Set initial state
  const [showImageRequestModal, setShowImageRequestModal] = useState(false);
  const [showLoadDataModal, setShowLoadDataModal] = useState(false);
  const [showCredsExpiredAlert, setShowCredsExpiredAlert] = useState(false);
  return (
    <div>
      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <ButtonDropdown
          items={[
            { text: "Submit Image Request", id: "new_request" },
            {
              id: "load",
              text: "Load",
              items: [
                { id: "load_geojson", text: "GeoJSON" },
                { id: "load_image", text: "Image" }
              ]
            }
          ]}
          onItemClick={(e) => {
            if (e.detail.id == "load_geojson") {
              setShowLoadDataModal(true);
            } else if (e.detail.id == "new_request") {
              setShowImageRequestModal(true);
            }
          }}
          variant="primary"
        >
          <Icon name="menu" />
        </ButtonDropdown>
      </div>
      <div style={{ position: "absolute", top: 10, right: 10 }}>
        {showCredsExpiredAlert && (
          <CredsExpiredAlert
            setShowCredsExpiredAlert={setShowCredsExpiredAlert}
          />
        )}
      </div>

      <LoadDataModal
        showLoadDataModal={showLoadDataModal}
        setShowLoadDataModal={setShowLoadDataModal}
        showCredsExpiredAlert={showCredsExpiredAlert}
        setShowCredsExpiredAlert={setShowCredsExpiredAlert}
      />
      <ImageRequestModal
        showImageRequestModal={showImageRequestModal}
        setShowImageRequestModal={setShowImageRequestModal}
        imageRequestStatus={imageRequestStatus}
        setImageRequestStatus={setImageRequestStatus}
        showCredsExpiredAlert={showCredsExpiredAlert}
        setShowCredsExpiredAlert={setShowCredsExpiredAlert}
      />
    </div>
  );
};

export default OsmlMenu;

import "./styles.css";

import * as Cesium from "cesium";
import * as React from "react";
import { Viewer } from "resium";

import ImageRequestStatus from "@/components/ImageRequestStatus";
import OsmlMenu from "@/components/OsmlMenu";

function App() {
  const [imageRequestStatus, setImageRequestStatus] = React.useState({
    state: "idle",
    data: {}
  });
  return (
    <Viewer
      full
      imageryProvider={
        new Cesium.TileMapServiceImageryProvider({
          url: Cesium.buildModuleUrl("/cesium/Assets/Textures/NaturalEarthII")
        })
      }
    >
      <OsmlMenu
        imageRequestStatus={imageRequestStatus}
        setImageRequestStatus={setImageRequestStatus}
      />
      <ImageRequestStatus
        imageRequestStatus={imageRequestStatus}
        setImageRequestStatus={setImageRequestStatus}
      />
    </Viewer>
  );
}

export default App;

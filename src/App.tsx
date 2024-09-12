// Copyright 2023-2024 Amazon.com, Inc. or its affiliates.

import "./styles.css";

import React from "react";
import { Viewer } from "resium";

import OsmlTray from "@/components/OsmlTray";
import { generateImageryProviders } from "@/util/imageryProviders";

const App = () => {
  return (
    <Viewer
      full
      imageryProviderViewModels={generateImageryProviders()}
      // terrainProviderViewModels={generateTerrainProviders()}
    >
      <OsmlTray />
      {/*<Scene>*/}
      {/*  <Globe terrainExaggeration={1.5}></Globe>*/}
      {/*</Scene>*/}
    </Viewer>
  );
};

export default App;

// Copyright 2024 Amazon.com, Inc. or its affiliates.

import * as Cesium from "cesium";

export function generateTerrainProviders() {
  const terrainViewModels = [];
  const terrainUrl = "src/data/tiles/terrain";
  terrainViewModels.push(
    new Cesium.ProviderViewModel({
      name: "Test Terrain Stuff",
      iconUrl:
        "https://doc.arcgis.com/en/data-appliance/2022/maps/GUID-BBDE7FFC-3B4D-4CCC-8117-20F8102CA192-web.jpg",
      tooltip:
        "This terrain map add a single terrain tile to the globe for testing purposes",
      creationFunction: function () {
        return Cesium.CesiumTerrainProvider.fromUrl(terrainUrl, {
          requestVertexNormals: true,
          requestWaterMask: true
        });
      }
    })
  );
  return terrainViewModels;
}

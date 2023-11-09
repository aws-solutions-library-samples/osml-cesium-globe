import { exec } from "node:child_process";

import { DynamoDB } from "@aws-sdk/client-dynamodb";
import AWS from "aws-sdk";
import * as Cesium from "cesium";
import { Color, GeoJsonDataSource, Rectangle, Viewer } from "cesium";
import fs from "fs";
import path from "path";
import * as uuid from "uuid";

import {
  CESIUM_IMAGERY_TILES_FOLDER,
  DEFAULT_RESULTS_FILL_ALPHA, DEFAULT_RESULTS_LINE_ALPHA,
  LOCAL_GEOJSON_FOLDER,
  LOCAL_IMAGE_DATA_FOLDER,
  ZOOM_MAX,
  ZOOM_MIN
} from "@/config";
import { loadS3Object } from "@/util/s3Helper";
import * as gdal from 'gdal-async'


export async function loadGeoJson(map: Viewer, mapData: string, jobId: string, resultsColor: string): Promise<void> {
  const featureJsonParse = JSON.parse(mapData);
  const geojson = await GeoJsonDataSource.load(featureJsonParse, {
    fill: Color.fromCssColorString(resultsColor).withAlpha(DEFAULT_RESULTS_FILL_ALPHA),
    stroke: Color.fromCssColorString(resultsColor).withAlpha(DEFAULT_RESULTS_LINE_ALPHA),
    clampToGround: true,
  });
  geojson.name = jobId;
  await map.dataSources.add(geojson);
  await map.zoomTo(geojson);
}

export function getGeoExtentsRectangle(
  filePath: string
): Rectangle {
  // Open the .tif file
  const dataset = gdal.open(filePath);

  if (!dataset) {
    console.error(`Could not open the file: ${filePath}`);
    throw new Error(`Could not open the file: ${filePath}`);
  }

  if (!dataset.geoTransform) {
    console.error(
      `Could not retrieve geotransform parameters for: ${filePath}`
    );
    throw new Error(
      `Could not retrieve geotransform parameters for: ${filePath}`
    )
  }

  // Calculate the geographic extents (bounding box)
  const west = dataset.geoTransform[0];
  const north = dataset.geoTransform[3];
  const east = west + dataset.geoTransform[1] * dataset.rasterSize.x;
  const south = north + dataset.geoTransform[5] * dataset.rasterSize.y;

  // Clean up and close the dataset
  dataset.close();

  return Cesium.Rectangle.fromDegrees(
    west,
    south,
    east,
    north
  );
}

async function addImageLayer(
    cesium: any,
    tileUrl: string,
    filePath: string,
    setShowCredsExpiredAlert: any
): Promise<void> {
  try {
    let layers: any;
    if (cesium.viewer.scene) {
      layers = cesium.viewer.scene.imageryLayers;
    }
    console.log(
        `Loading image extents for image: ${filePath}.`
    );
    if (layers) {
      const rectangle = getGeoExtentsRectangle(filePath)
      console.log("Loading imagery tiles into Cesium...");
      const imageryLayers = layers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: tileUrl,
            tilingScheme: new Cesium.GeographicTilingScheme(),
            rectangle: rectangle,
            maximumLevel: ZOOM_MAX,
            minimumLevel: ZOOM_MIN,
            credit: filePath
          })
      );
      console.log("Finished loading imagery tiles into Cesium!");
    }
  } catch (e: any) {
    if (e.code === "ExpiredToken") {
      setShowCredsExpiredAlert(true);
    } else {
      throw e;
    }
  }
}

function stopAndRemoveContainer(containerName: string) {
  // now that we're done, stop and destroy the containerd, so we're not using up resources
  exec(`docker stop ${containerName}`, (err, output) => {
    if (err) {
      console.log("Could not stop container: ", err);
    } else {
      console.log("Stopped container ", output);
      exec(`docker rm ${containerName}`, (err, output) => {
        if (err) {
          console.log("Could not remove container: ", err);
        } else {
          console.log("Removed container ", output);
        }
      });
    }
  });
}

export async function convertImageToCesium(
    cesium: any,
    fileName: string,
    imageId: string,
    setShowCredsExpiredAlert: any
): Promise<void> {
  // sanitize the fileName
  fileName = fileName.replace(/^(\.\.(\/|\\|$))+/, "");
  const imageFilePath = path.resolve(LOCAL_IMAGE_DATA_FOLDER, fileName);
  const imageFolder = path.resolve(LOCAL_IMAGE_DATA_FOLDER);
  const tileFolder = path.resolve(CESIUM_IMAGERY_TILES_FOLDER);
  console.log(imageFilePath);

  exec("docker pull tumgis/ctb-quantized-mesh:alpine", async (err, output) => {
    if (err) {
      console.error("could not execute command: ", err);
      return;
    }
    if (output) {
      // create a unique job name for the translation run
      const jobName = "ctb-tile-creation-" + uuid.v4();
      // spin up a container with the ctb-quantized-mesh image
      exec(
          `docker run -d --name ${jobName} -v ${imageFolder}:/data/images/ -v ${tileFolder}:/data/tiles/ tumgis/ctb-quantized-mesh:alpine tail -f /dev/null`,
          async (err, output) => {
            if (err) {
              console.log("could not execute command: ", err);
            } else {
              console.log("running cbt container: ", output);
              // convert the tif image to png images
              exec(
                  `docker exec ${jobName} ctb-tile -f PNG -R -C -N -s ${ZOOM_MAX} -e ${ZOOM_MIN} -t 256 -o /data/tiles /data/images/${fileName}`,
                  async (err, output) => {
                    if (err) {
                      console.log("could not execute command: ", err);
                      stopAndRemoveContainer(jobName);
                    } else {
                      console.log("Converting image to cesium tiles: ", output);
                      try {
                        await addImageLayer(
                            cesium,
                            "http://localhost:5173/src/data/tiles/imagery/{z}/{x}/{reverseY}.png",
                            imageFilePath,
                            setShowCredsExpiredAlert
                        );
                      } finally {
                        stopAndRemoveContainer(jobName);
                      }
                    }
                  }
              );
            }
          }
      );
    } else {
      console.log(
          "The docker image tumgis/ctb-quantized-mesh has not been installed. Please run: docker pull tumgis/ctb-quantized-mesh"
      );
    }
  });
}

export async function loadImageInCesium(
    cesium: any,
    bucket: string,
    s3Object: string,
    imageId: string,
    setShowCredsExpiredAlert: any
): Promise<void> {
  const fileName = s3Object.split("/").pop();
  const outFilePath = LOCAL_IMAGE_DATA_FOLDER + fileName;
  if (fileName) {
    fs.open(outFilePath, "r", async function (err) {
      if (err) {
        const s3ImageObject = { name: s3Object, bucket: bucket, date: "" };
        console.log("Downloading image from S3...");
        const binData = await loadS3Object(s3ImageObject, true, true);
        if (binData) {
          fs.writeFile(outFilePath, binData, "binary", async function (err) {
            if (err) {
              console.log(err);
            }
            console.log(`Successfully download image to: ${outFilePath}!`);
            return await convertImageToCesium(
                cesium,
                fileName,
                imageId,
                setShowCredsExpiredAlert
            );
          });
        }
      } else {
        console.log(`${outFilePath} already exists!`);
        await convertImageToCesium(
            cesium,
            fileName,
            imageId,
            setShowCredsExpiredAlert
        );
      }
    });
  }
}

export async function loadS3GeoJson(
    cesium: any,
    bucket: string,
    s3Object: string,
    resultsColor: string,
    setShowCredsExpiredAlert: any
) {
  const fileName = s3Object.split("/").pop();
  const outFilePath = LOCAL_GEOJSON_FOLDER + fileName;
  if (fileName) {
    const s3ResultsObject = { name: s3Object, bucket: bucket, date: "" };
    const mapData = await loadS3Object(
        s3ResultsObject,
        setShowCredsExpiredAlert
    );
    if (typeof mapData === "string") {
      fs.open(outFilePath, "r", async function (err) {
        if (err) {
          console.log("Downloading results from S3...");
          fs.writeFile(outFilePath, mapData, async function (err) {
            if (err) {
              console.log(err);
            }
            console.log(`Successfully download results to: ${outFilePath}!`);
          });
        }
        const splitName = s3Object.split(".")[0].split("/");
        await loadGeoJson(cesium.viewer, mapData, splitName[splitName.length - 1], resultsColor);
        console.log(
            `Successfully loaded results for results for: ${fileName}!`
        );
      });
    }
  }
}

import * as Cesium from "cesium";

/**
 * Imagery provider data.
 */
interface ImageryProviderData {
  /**
   * The name of the imagery provider
   */
  name: string;

  /**
   * The URL of the provider's icon
   */
  iconUrl: string;

  /**
   * The tooltip of the provider
   */
  tooltip: string;

  /**
   * The URL for the imagery
   */
  url: string;
}

/**
 * Generates a Cesium.ProviderViewModel based on the provided imagery data
 *
 * @param data - The imagery data
 * @returns A Cesium.ProviderViewModel instance with the provided details
 */
function generateImageryProvider(
  data: ImageryProviderData
): Cesium.ProviderViewModel {
  return new Cesium.ProviderViewModel({
    name: data.name,
    iconUrl: data.iconUrl,
    tooltip: data.tooltip,
    creationFunction: function () {
      return Cesium.ArcGisMapServerImageryProvider.fromUrl(data.url);
    }
  });
}

/**
 * Generates imagery providers objects based on the predefined data.
 * @returns {Cesium.ProviderViewModel[]} - Array of ProviderViewModel objects.
 */
export function generateImageryProviders(): Cesium.ProviderViewModel[] {
  const imageryData: ImageryProviderData[] = [
    {
      name: "World Imagery",
      iconUrl:
        "https://doc.arcgis.com/en/data-appliance/2022/maps/GUID-BBDE7FFC-3B4D-4CCC-8117-20F8102CA192-web.jpg",
      tooltip:
        "This map is a compilation of satellite and aerial imagery worldwide. " +
        "https://doc.arcgis.com/en/data-appliance/2022/maps/world-imagery.htm",
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    },
    {
      name: "World Street Map",
      iconUrl:
        "https://doc.arcgis.com/en/data-appliance/2022/maps/GUID-D521640A-4B9F-4588-BB9B-D8CCF5B950C4-web.jpg",
      tooltip:
        "This map presents a street map with highway-level data for the world and detailed streets in many " +
        "populated areas of the world. https://doc.arcgis.com/en/data-appliance/2022/maps/world-street-map.htm",
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
    },
    {
      name: "World Light Grey Base",
      iconUrl:
        "https://doc.arcgis.com/en/data-appliance/2022/maps/GUID-AC8A1022-C5A4-45A0-9BF8-61E5C5C72C3F-web.jpg",
      tooltip:
        "This basemap provides a neutral background for your data with minimal colors, labels, and " +
        "features. https://doc.arcgis.com/en/data-appliance/2022/maps/world-light-gray-base.htm",
      url: "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer"
    },
    {
      name: "World Dark Gray Base",
      iconUrl:
        "https://doc.arcgis.com/en/data-appliance/2022/maps/GUID-9F6C8013-DCC6-4D20-8E5A-E8C7F8F262E9-web.jpg",
      tooltip:
        "This map draws attention to your thematic content by providing a neutral background with minimal " +
        "colors, labels, and features. https://doc.arcgis.com/en/data-appliance/2022/maps/world-dark-gray-base.htm",
      url: "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer"
    }
  ];

  return imageryData.map((data: ImageryProviderData) =>
    generateImageryProvider(data)
  );
}

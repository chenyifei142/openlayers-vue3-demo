import GeoJSON from 'ol/format/GeoJSON';

export default {
    readFeatures,
    addFeaturesByUrl,
}

/**
 * 读取geo json 数据
 * @returns {*}
 */
function readFeatures(features) {
    return new GeoJSON().readFeatures(
        features, {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
        }
    );
}


/**
 * 读取geo json 数据
 * @returns {*}
 */
async function addFeaturesByUrl(vector, geoJson, itemFn) {
    for (let i = 0; i < geoJson.features.length; i++) {
        let featureArr = readFeatures(geoJson.features[i]);
        vector.getSource().addFeatures(featureArr);
    }
    return vector
}
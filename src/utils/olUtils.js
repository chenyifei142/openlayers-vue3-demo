import GeoJSON from 'ol/format/GeoJSON';

/**
 * 读取geo json 数据
 * @returns {*}
 */
const readFeatures = (features) => {
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
const addFeaturesByUrl=(vector, geoJson, itemFn)=> {
    for (let i = 0; i < geoJson.features.length; i++) {
        let featureArr = readFeatures(geoJson.features[i]);
        vector.getSource().addFeatures(featureArr);
    }
    return vector
}

// 节流函数，用于减少频繁触发的事件次数
const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};


export default {
    readFeatures,
    addFeaturesByUrl,
    throttle
}
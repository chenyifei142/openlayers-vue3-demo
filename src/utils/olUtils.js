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
// 辅助函数：获取特性中心点坐标
const getFeatureCenter = (feature) => {
    const geometry = new GeoJSON().readFeature(feature).getGeometry();
    const extent = geometry.getExtent();
    const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
    return center;
};

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
    getFeatureCenter,
    throttle
}
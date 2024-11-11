import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

/**
 * 读取geo json 数据
 * @returns {*}
 */
export const readFeatures = (features) => {
    return new GeoJSON().readFeatures(
        features, {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
        }
    );
}
/**
 * 读取geoJson数据并添加到矢量图层中
 *
 * @param vector - 目标矢量图层，将要素添加到该图层中
 * @param  geoJson - 包含地理要素的GeoJSON对象
 * @param  itemFn - 可选的回调函数，用于对每个要素数组进行处理
 *
 * @returns  返回更新后的矢量图层对象
 */
const addFeaturesByUrl = (vector, geoJson, itemFn) => {
    // 遍历GeoJSON数据中的每个feature
    for (let i = 0; i < geoJson.features.length; i++) {
        // 使用readFeatures函数读取当前feature并转换为OpenLayers中的要素数组
        let featureArr = readFeatures(geoJson.features[i]);
        // 如果提供了itemFn回调函数，并且它是一个函数
        if (itemFn && typeof itemFn == 'function') {
            // 调用回调函数处理当前要素数组
            itemFn(featureArr);
        }

        // 将处理后的要素数组添加到矢量图层的source中
        vector.getSource().addFeatures(featureArr);
    }

    // 返回更新后的矢量图层
    return vector;
}
/**
 * 辅助函数：获取特性中心点坐标
 * @param feature
 * @returns {number[]}
 */
const getFeatureCenter = (feature) => {
    // const geometry = new GeoJSON().readFeature(feature).getGeometry();
    const geometry = feature.getGeometry();
    const extent = geometry.getExtent();
    return [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
};
/**
 * 创建矢量图层
 * @param style 样式
 * @param zIndex 层级
 * @returns {VectorLayer<import("../Feature.js").FeatureLike>}
 */
const createVectorLayer = (style, zIndex) => {
    return new VectorLayer({
        source: new VectorSource({
            features: [],
        }),
        style: style,
        zIndex: zIndex,
    })
}

/**
 * 节流函数，用于减少频繁触发的事件次数
 * @param func 函数
 * @param limit 时间
 * @returns {(function(): void)|*}
 */
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
    createVectorLayer,
    throttle
}

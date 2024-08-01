import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {inject} from "vue";

const map = inject('map')

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
const addFeaturesByUrl = (vector, geoJson, itemFn) => {
    for (let i = 0; i < geoJson.features.length; i++) {
        let featureArr = readFeatures(geoJson.features[i]);
        vector.getSource().addFeatures(featureArr);
    }
    return vector
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

// 计算上海图层在视窗中的可见性占比
const calculateVisibility = (targetLayer, contrastLayer) => {
    const view = contrastLayer.getView();
    // 主视图显示范围
    const extent = view.calculateExtent(contrastLayer.getSize());
    // 获取目标图层显示范围
    const targetExtent = targetLayer.getSource().getExtent();
    // 计算视窗和目标图层的交集区域
    const intersection = [
        Math.max(extent[0], targetExtent[0]), // 左边界的较大值
        Math.max(extent[1], targetExtent[1]), // 下边界的较大值
        Math.min(extent[2], targetExtent[2]), // 右边界的较小值
        Math.min(extent[3], targetExtent[3])  // 上边界的较小值
    ];
    // 检查是否有交集
    if (intersection[2] < intersection[0] || intersection[3] < intersection[1]) {
        return 0; // 如果没有交集，返回 0
    }
    // 计算交集面积和视窗面积
    const intersectionArea = (intersection[2] - intersection[0]) * (intersection[3] - intersection[1]);
    const viewArea = (extent[2] - extent[0]) * (extent[3] - extent[1]);
    // 返回交集面积与视窗面积的比值
    return intersectionArea / viewArea;
};

const handlePointerStyle = (targetLayer, map) => {
    // 添加鼠标指针移动事件，改变可点击区域的指针样式
    map.value.on('pointermove', (e) => {
        const hit = map.value.hasFeatureAtPixel(e.pixel, {
            layerFilter: (layer) => layer === targetLayer
        });
        map.value.getTargetElement().style.cursor = hit ? 'pointer' : ''; // 如果有可点击区域且没有选中的区县，显示手指样式
    });
}

export default {
    readFeatures,
    addFeaturesByUrl,
    getFeatureCenter,
    createVectorLayer,
    calculateVisibility,
    handlePointerStyle,
    throttle
}
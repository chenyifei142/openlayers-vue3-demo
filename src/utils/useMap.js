import {onMounted, ref} from "vue";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import olUtils from "@/utils/olUtils.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {Fill, Stroke, Style, Text} from "ol/style";
import GeoJSON from "ol/format/GeoJSON";

/**
 * 创建矢量图层并添加片区名字标注
 * @param {Object} geoJson - GeoJSON数据
 * @param {Object} style - 矢量图层样式
 * @param {Number} zIndex - 图层叠放次序
 * @returns {Object} - 矢量图层
 */
// 创建矢量图层
export const useCreateVectorLayer = (geoJson, style, zIndex) => {
    const layer = ref(null);
    layer.value = new VectorLayer({
        source: new VectorSource({features: []}),
        style: style,
        zIndex: zIndex,
    });

    olUtils.addFeaturesByUrl(layer.value, geoJson); // 通过 URL 添加特性

    return layer;
}


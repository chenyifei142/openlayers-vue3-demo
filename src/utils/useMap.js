import {onMounted, ref} from "vue";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import olUtils from "@/utils/olUtils.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {Fill, Stroke, Style, Text} from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import * as olProj from "ol/proj.js";

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
    // 遍历GeoJSON数据，添加标注
    geoJson.features.forEach((feature) => {
        const coordinates = olUtils.getFeatureCenter(feature);
        const name = feature.properties.name ?? feature.properties.NAME; // 假设片区名字在properties.name字段

        const textFeature = new Feature({
            geometry: new Point(olProj.fromLonLat(coordinates)),
            name: name,
        });

        // 设置文本样式
        const textStyle = new Style({
            text: new Text({
                font: '12px Calibri,sans-serif',
                fill: new Fill({color: '#000'}), // 设置文本填充颜色
                stroke: new Stroke({
                    color: '#fff', width: 2,
                }),
                text: name,
                overflow: true // 允许文字溢出
            }),
        });

        textFeature.setStyle(textStyle);
        layer.value.getSource().addFeature(textFeature);
    });
    return layer;
}


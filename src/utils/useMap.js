import {onMounted, provide, ref} from "vue";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import olUtils from "@/utils/olUtils.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {Fill, Stroke, Style, Text} from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import * as olProj from "ol/proj.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import {fromLonLat} from "ol/proj.js";
import mapConstants from "@/constants/map.constants.js";
import * as olControl from "ol/control.js";
import * as olInteraction from "ol/interaction.js";

/**
 * 创建初始话地图
 * @returns {Ref<UnwrapRef<null>>}
 */
export const useMap = () => {
    const map = ref(null)
    const initMap = () => {
        map.value = new Map({
            layers: [],
            view: new View({
                center: fromLonLat(mapConstants.CENTER), // 设置地图中心
                zoom: 9, // 初始缩放等级
                projection: 'EPSG:3857', // 投影方式 默认为'EPSG：3857'；
                maxZoom: 18, // 最大缩放等级
                minZoom: 4, // 最小缩放等级
            }),
            target: 'map', // 地图容器的 ID
            controls: olControl.defaults({
                attribution: false, // 不显示版权信息
                rotate: false, // 不允许旋转
                zoom: true, // 显示缩放控件
                zoomOptions: {delta: 5}, // 缩放控件的步长
            }),
            interactions: olInteraction.defaults({
                doubleClickZoom: false, // 禁用双击缩放
                pinchRotate: false, // 禁用触摸旋转
            }),
        });
    }
    onMounted(() => {
        initMap()
    })
    return map
}

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


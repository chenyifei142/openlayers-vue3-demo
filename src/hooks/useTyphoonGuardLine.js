import VectorSource from "ol/source/Vector";
import {LineString} from "ol/geom";
import {transform} from "ol/proj";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import {inject, ref} from "vue";
import {Fill, Stroke, Style,Text} from "ol/style";

/**
 * 台风警戒线功能
 * @returns {Object} 包含绘制与清除警戒线的函数
 */
export const useTyphoonGuardLine = () => {
    const map = inject('map')

    // 24小时与48小时警戒线坐标
    const coordinates24 = [[105, 0], [113, 4.5], [119, 11], [119, 18], [127, 22], [127, 34]];
    const coordinates48 = [[105, 0], [120, 0], [132, 15], [132, 34]];

    // 定义警戒线样式
    const TyphoonGuardLineStyles = {
        gl24: new Style({
            fill: new Fill({color: "rgba(255, 0, 0, 0.2)"}),
            stroke: new Stroke({
                color: "rgba(218, 73, 10, 1)",
                width: 1.5
            }),
            text: new Text({
                placement: "line", // 文本沿线展示
                offsetY: -2,
                textBaseline: "bottom",
                textAlign: "end",
                text: "24小时警戒线",
                font: "12px sans-serif",
                fill: new Fill({color: "rgba(255, 0, 0, 1)"})
            })
        }),
        gl48: new Style({
            fill: new Fill({color: "rgba(255, 153, 0, 0.2)"}),
            stroke: new Stroke({
                color: "rgba(52, 122, 182, 1)",
                lineDash: [6],
                width: 1.5
            }),
            text: new Text({
                placement: "line",
                offsetY: 2,
                textBaseline: "top",
                textAlign: "end",
                text: "48小时警戒线",
                font: "12px sans-serif",
                fill: new Fill({color: "rgba(0, 0, 255, 1)"})
            })
        })
    };

    // 使用 ref 跟踪警戒线图层状态
    const guardLineLayer = ref(null);

    /**
     * 绘制台风警戒线
     */
    const drawTyphoonGuardLine = () => {
        const source = new VectorSource();
        source.addFeature(buildFeature(coordinates24, 'gl24'));
        source.addFeature(buildFeature(coordinates48, 'gl48'));

        guardLineLayer.value = new VectorLayer({
            source,
            style: styleFunction,
            zIndex: 20
        });
        map.value.addLayer(guardLineLayer.value);
    };

    /**
     * 根据坐标构建警戒线特征
     * @param {Array} coordinates - 警戒线坐标数组
     * @param {string} type - 警戒线类型标识 ('gl24' 或 'gl48')
     * @returns {Feature} 构建的特征对象
     */
    const buildFeature = (coordinates, type) => {
        const geometry = new LineString(
            coordinates.map(coordinates => transform(coordinates, 'EPSG:4326', 'EPSG:3857'))
        );
        return new Feature({geometry, type});
    };

    /**
     * 获取警戒线样式
     * @param {Feature} feature - 要应用样式的特征
     * @returns {Array} 适用于特征的样式数组
     */
    const styleFunction = (feature) => {
        return [TyphoonGuardLineStyles[feature.get('type')]];
    };

    /**
     * 清除台风警戒线图层
     */
    const close = () => {
        if (guardLineLayer.value) {
            map.value.removeLayer(guardLineLayer.value);
            guardLineLayer.value = null;
        }
    };

    return {drawTyphoonGuardLine, close};
};

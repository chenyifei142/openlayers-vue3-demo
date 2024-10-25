import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import { transform } from "ol/proj";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { Cluster } from "ol/source";

// 自定义函数 usePointLayer，用于处理点图层及其聚合效果
export const usePointLayer = (pointLayer, map) => {
    let clusterLayer = null;  // 聚合图层的引用

    // 创建并添加聚合点图层
    const createPointLayer = (zIndex, style) => {
        // 如果点图层已存在，先移除它
        if (pointLayer.value) {
            removePointLayer();
        }

        // 创建矢量数据源用于存储点要素
        const vectorSource = new VectorSource({
            features: [],  // 初始为空
        });

        // 创建聚合源，将 vectorSource 作为聚合的基础数据源
        const clusterSource = new Cluster({
            source: vectorSource,  // 使用 vectorSource 作为基础源
            distance: 40,  // 聚合点的最大距离，单位为像素
        });

        // 创建聚合图层
        clusterLayer = new VectorLayer({
            source: clusterSource,  // 设置聚合源
            style: function (feature) {
                // 获取聚合的点数
                const size = feature.get('features').length;
                if (size > 1) {
                    // 样式：聚合点
                    return new Style({
                        image: new Circle({
                            radius: 15,  // 聚合点的半径
                            stroke: new Stroke({
                                color: '#fff',  // 聚合点的描边颜色
                            }),
                            fill: new Fill({
                                color: '#3399CC',  // 聚合点的填充颜色
                            }),
                        }),
                        text: new Text({
                            text: size.toString(),  // 显示聚合点的数量
                            fill: new Fill({
                                color: '#fff',  // 文本颜色
                            }),
                        }),
                    });
                } else {
                    // 样式：单个点
                    const originalFeature = feature.get('features')[0];  // 获取单个点的原始要素
                    const item = originalFeature.getProperties();  // 获取要素的属性
                    return new Style({
                        image: new Circle({
                            radius: 8,  // 单点的半径
                            fill: new Fill({ color: 'red' }),  // 单点的颜色
                        }),
                        text: new Text({
                            text: item.code,  // 显示单个点的代码
                            font: `12px sans-serif`,  // 文本样式
                            fill: new Fill({ color: '#FFFFFF' }),  // 文本颜色
                            offsetY: -15,  // 文本的 Y 轴偏移
                        }),
                    });
                }
            },
            zIndex: zIndex || 99999999,  // 设置图层的 zIndex 以控制渲染顺序
        });

        // 将聚合图层添加到地图上
        map.addLayer(clusterLayer);
        pointLayer.value = clusterLayer;  // 将 clusterLayer 引用存储到 pointLayer
    };

    // 移除点图层
    const removePointLayer = () => {
        if (map && clusterLayer) {
            map.removeLayer(clusterLayer);  // 从地图中移除聚合图层
            clusterLayer = null;  // 清空聚合图层引用
            pointLayer.value = null;  // 重置 pointLayer
        }
    };

    // 更新点图层的数据
    const setPointLayer = (resultData) => {
        // 获取矢量数据源以存储新添加的点要素
        const source = pointLayer.value?.getSource()?.getSource();
        source.clear();  // 清除源中的现有点

        const features = [];
        for (let item of resultData) {
            if (!item.lon || !item.lat) continue;  // 确保数据包含经纬度

            const lon = +item.lon;
            const lat = +item.lat;
            // 创建点的几何位置，并转换坐标系为地图坐标
            const geom = new Point(transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));
            const feature = new Feature({ geometry: geom });  // 创建新点要素
            feature.setProperties(item);  // 将数据属性添加到要素中
            features.push(feature);  // 将要素添加到列表
        }

        source.addFeatures(features);  // 将所有新要素添加到数据源中
    };

    // 返回创建、设置、移除图层的函数
    return { createPointLayer, setPointLayer, removePointLayer };
}

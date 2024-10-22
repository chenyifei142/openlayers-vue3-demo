import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import {transform} from "ol/proj";
import {Circle, Fill, Stroke, Style, Text} from "ol/style";
import {Cluster} from "ol/source.js";

export const usePointLayer = (pointLayer, map) => {
    let clusterLayer = null;

    // 创建图层
    const createPointLayer = (zIndex, style) => {
        if (pointLayer.value) {
            removePointLayer();
        }

        const vectorSource = new VectorSource({
            features: [],
        });

        // 创建聚合数据源
        const clusterSource = new Cluster({
            source: vectorSource,
            distance: 40, // 调整聚合距离
        });

        clusterLayer = new VectorLayer({
            source: clusterSource,
            style: function (feature) {
                const size = feature.get('features').length;
                if (size > 1) {
                    // 聚合点样式
                    return new Style({
                        image: new Circle({
                            radius: 15,
                            stroke: new Stroke({
                                color: '#fff',
                            }),
                            fill: new Fill({
                                color: '#3399CC',
                            }),
                        }),
                        text: new Text({
                            text: size.toString(),
                            fill: new Fill({
                                color: '#fff',
                            }),
                        }),
                    });
                } else {
                    // 单点样式
                    const originalFeature = feature.get('features')[0];
                    const item = originalFeature.getProperties();
                    return new Style({
                        image: new Circle({
                            radius: 8,
                            fill: new Fill({color: 'red'}),
                        }),
                        text: new Text({
                            text: item.code,
                            font: `12px sans-serif`,
                            fill: new Fill({color: '#FFFFFF'}),
                            offsetY: -15,
                        }),
                    });
                }
            },
            zIndex: zIndex || 99999999,
        });

        map.addLayer(clusterLayer);
        pointLayer.value = clusterLayer;
    };

    const removePointLayer = () => {
        if (map && clusterLayer) {
            map.removeLayer(clusterLayer);
            clusterLayer = null;
            pointLayer.value = null;
        }
    };

    // 设置图层
    const setPointLayer = (resultData) => {
        const source = pointLayer.value?.getSource()?.getSource();
        source.clear();  // 清除之前的点
        const features = [];
        for (let item of resultData) {
            if (!item.lon || !item.lat) continue;
            const lon = +item.lon;
            const lat = +item.lat;
            const geom = new Point(transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));
            const feature = new Feature({geometry: geom});
            feature.setProperties(item);
            features.push(feature);
        }
        source.addFeatures(features);
    };
    return {createPointLayer, setPointLayer, removePointLayer};
}

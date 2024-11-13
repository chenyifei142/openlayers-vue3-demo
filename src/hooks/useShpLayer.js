// 导入相关的模块
import VectorLayer from "ol/layer/Vector";          // OpenLayers 矢量图层
import VectorSource from "ol/source/Vector";        // OpenLayers 矢量数据源
import stylesMap from "@/view/map/compoents/style/stylesMap.js"; // 自定义样式地图模块
import {readFeatures} from '@/utils/olUtils.js';  // 读取矢量数据的工具方法
import {inject, watch} from "vue";
import {useLegendCfg} from "@/hooks/useLegendCfg.js";                       // Vue 的依赖注入方法

/**
 * 自定义 Hook，用于管理地图中的 shpLayer 矢量图层。
 * @param {Ref<null|VectorLayer>} shpLayer - 响应式变量，用于存储矢量图层对象的引用
 * @returns {Object} 包含管理矢量图层的三个方法：createShpLayer、setShpLayer 和 removeShpLayer
 */
export const useShpLayer = (shpLayer) => {
    // 从 Vue 的依赖注入中获取 map 实例
    const map = inject('map');

    /**
     * 创建新的 shpLayer 图层并添加到地图中。
     * @param {Number} zIndex - 图层的叠放顺序
     * @param {Function} mapStyle - 图层样式 (默认使用 stylesMap.shStyle)
     */
    const createShpLayer = (zIndex, mapStyle) => {
        // 如果已存在 shpLayer，则先移除旧图层
        if (shpLayer) {
            removeShpLayer();
        }

        // 创建新的矢量图层对象
        const shpLayerVector = new VectorLayer({
            source: new VectorSource({}),       // 创建空数据源
            style: mapStyle || stylesMap.shStyle, // 应用传入的样式或默认样式
            zIndex                                // 设置图层的 z-index
        });

        // 将新创建的图层添加到地图对象中，并设置为可见
        map.value.addLayer(shpLayerVector);
        shpLayerVector.setVisible(true);

        // 更新 shpLayer 的引用指向新创建的矢量图层
        shpLayer.value = shpLayerVector;
    };

    /**
     * 从地图中移除 shpLayer 图层。
     */
    const removeShpLayer = () => {
        // 如果地图对象存在并且 shpLayer 不为空，则从地图中移除该图层
        if (map.value && shpLayer) {
            map.value.removeLayer(shpLayer.value);
            shpLayer.value = null; // 释放对图层对象的引用
        }
    };

    /**
     * 设置 shpLayer 图层的数据源。
     * 将给定的 GeoJSON 数据转换为地图要素，并更新到 shpLayer 图层中。
     * @param {Array} JsonData - 包含 GeoJSON 数据的数组
     */
    const setShpLayer = (JsonData, type) => {
        const features = []; // 用于存储读取到的地图要素

        // 遍历每一个 GeoJSON 数据并解析为 OpenLayers 地图要素
        for (let i = 0; i < JsonData.length; i++) {
            const fArray = readFeatures(JsonData[i]); // 使用工具方法解析 GeoJSON 数据
            for (let j = 0; j < fArray.length; j++) {
                features.push(fArray[j]); // 将解析出的要素加入到 features 数组中
            }
        }

        // 更新 shpLayer 图层的矢量数据源
        shpLayer.value?.setSource(
            new VectorSource({
                features // 将解析后的要素集合作为图层的数据源
            })
        );
        // 创建图例
        const {createMapStyleFunction} = useLegendCfg(type)
        // console.log(createMapStyleFunction(),"createMapStyleFunction")
        // 设置shpLayer样式
        watch(
            createMapStyleFunction,
            (newStyleFunction) => {
                shpLayer.value?.setStyle(newStyleFunction);
            },
            {immediate: true}
        );
    };

    // 返回管理 shpLayer 的方法
    return {createShpLayer, setShpLayer, removeShpLayer};
};

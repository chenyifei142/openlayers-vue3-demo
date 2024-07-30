<script setup>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import {nextTick, onMounted, provide, ref} from "vue";
import {fromLonLat} from "ol/proj";
import * as olControl from 'ol/control';
import * as olInteraction from 'ol/interaction';
import mapConstants from '@/constants/map.constants.js';
import ShangHaiGeoJson from '@/assets/json/ShangHai.js';
import MapMousePosition from "@/view/map/compoents/MapMousePosition.vue";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import ChangJiangDeltaGeoJson from "@/assets/json/ChangjiangDelta.js";
import olUtils from "@/utils/olUtils.js";
import MapOverview from "@/view/map/compoents/MapOverview.vue";
import {Fill, Stroke, Style} from "ol/style";

// 创建 ref 对象来保存地图和图层的引用
const map = ref(null);
const visibleFeature = ref(null); // 用于存储当前显示的特性

// 创建一个完全透明的样式，用于隐藏未选中的区县
const hiddenStyle = new Style({
  fill: new Fill({
    color: 'rgba(0, 0, 0, 0)', // 完全透明
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0)', // 完全透明
  }),
});

// 计算上海图层在视窗中的可见性占比
const calculateVisibility = () => {
  const view = map.value.getView();
  // 获取当前主视图显示范围
  /*
  (minX, maxY)         (maxX, maxY)
  (10, 40)             (30, 40)
   +--------------------+
   |                    |
   |                    |
   |                    |
   +--------------------+
  (minX, minY)         (maxX, minY)
  (10, 20)             (30, 20)
  extent 数组中的四个坐标（左、下、右、上）表示的是一个矩形区域的边界
  左边界（minX）：矩形区域的最左侧的 x 坐标。
  下边界（minY）：矩形区域的最下侧的 y 坐标。
  右边界（maxX）：矩形区域的最右侧的 x 坐标。
  上边界（maxY）：矩形区域的最上侧的 y 坐标。
  */
  const extent = view.calculateExtent(map.value.getSize());
  // 获取上海显示范围
  const shanghaiExtent = sq_layerVector.value.getSource().getExtent();
  // 计算视窗和上海图层的交集区域
  const intersection = [
    Math.max(extent[0], shanghaiExtent[0]), // 左边界的较大值
    Math.max(extent[1], shanghaiExtent[1]), // 下边界的较大值
    Math.min(extent[2], shanghaiExtent[2]), // 右边界的较小值
    Math.min(extent[3], shanghaiExtent[3])  // 上边界的较小值
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
// 设置图层可见性
const setLayerVisibility = (isVisible) => {
  csj_layerVector.value.setVisible(isVisible); // 设置长三角图层的可见性
};
// 设置特性样式
const setFeatureStyles = (style, hiddenStyle) => {
  sq_layerVector.value.getSource().getFeatures().forEach((f) => {
    f.setStyle(f === visibleFeature.value ? style : hiddenStyle); // 为特性设置样式
  });
};

// 更新图层的可见性
const updateLayerVisibility = olUtils.throttle(() => {
  const visibilityRatio = calculateVisibility(); // 计算可见性占比
  const zoomLevel = map.value.getView().getZoom(); // 获取当前缩放等级

  if (visibilityRatio > 0.8 && zoomLevel >= 7) {
    setLayerVisibility(false); // 隐藏长三角图层
    if (visibleFeature.value !== null) {
      setFeatureStyles(stylesMap.shStyle, hiddenStyle); // 显示选中的区县，隐藏其他区县
    }
  } else {
    setLayerVisibility(true); // 显示长三角图层
    if (visibleFeature.value !== null) {
      setFeatureStyles(stylesMap.shStyle, stylesMap.csjStyle); // 显示选中的区县，使用长三角样式显示其他区县
    }
  }
}, 200); // 200 毫秒的节流时间
// 创建矢量图层
const csj_layerVector = useCreateVectorLayer(ChangJiangDeltaGeoJson, stylesMap.csjStyle, 716)
const sq_layerVector = useCreateVectorLayer(ShangHaiGeoJson, stylesMap.shStyle, 807)

// 初始化地图
const initMap = () => {
  // 创建地图对象
  map.value = new Map({
    layers: [csj_layerVector.value, sq_layerVector.value],
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

  // 监听地图移动结束事件，更新图层的可见性
  map.value.on('moveend', updateLayerVisibility);

  // 添加鼠标指针移动事件，改变可点击区域的指针样式
  map.value.on('pointermove', (e) => {
    const hit = map.value.hasFeatureAtPixel(e.pixel, {
      layerFilter: (layer) => layer === sq_layerVector.value
    });
    map.value.getTargetElement().style.cursor = hit && visibleFeature.value === null ? 'pointer' : ''; // 如果有可点击区域且没有选中的区县，显示手指样式
  });

  // 添加点击事件
  map.value.on('singleclick', (e) => {
    // 如果 visibleFeature.value 不为 null，则不处理点击事件
    if (visibleFeature.value !== null) {
      return;
    }

    // 处理点击事件
    map.value.forEachFeatureAtPixel(e.pixel, (feature) => {
      // 显示点击的区县，隐藏其他区县
      sq_layerVector.value.getSource().getFeatures().forEach((f) => {
        f.setStyle(f === feature ? stylesMap.shStyle : hiddenStyle);
      });
      visibleFeature.value = feature;

      // 获取点击特性的几何中心
      const geometry = feature.getGeometry();
      const extent = geometry.getExtent();
      const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];

      // 动画到点击特性中心，并放大
      map.value.getView().animate({
        center: center,
        zoom: 10, // 放大到 10 级
        duration: 1000 // 动画时长 1 秒
      });
    }, {
      layerFilter: (layer) => layer === sq_layerVector.value // 仅处理上海图层的点击事件
    });
  });
};
// 将 map 对象提供给子组件
provide('map', map);

// 组件挂载时初始化地图
onMounted(() => {
  initMap();
});
</script>

<template>
  <div id="map" class="map">
    <!--    <MapMousePosition/>-->
    <!--    <MapOverview/>-->
  </div>
</template>

<style>
@import "@/assets/style/ol-ext.css";

.map {
  width: 100vw;
  height: 100vh;
}
</style>

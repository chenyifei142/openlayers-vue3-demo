<script setup>
import "ol/ol.css";
import Map from "ol/Map";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import View from "ol/View";
import {nextTick, onMounted, provide, ref} from "vue";
import {fromLonLat} from "ol/proj";
import {XYZ} from "ol/source";
import * as olControl from 'ol/control';
import * as olInteraction from 'ol/interaction';
import mapConstants from '@/constants/map.constants.js'
import {MousePosition} from "ol/control";
import * as olCoordinate from "ol/coordinate";
import MapMousePosition from "@/view/map/compoents/MapMousePosition.vue";
import MapOverview from "@/view/map/compoents/MapOverview.vue";


const map = ref(null)

const initMap = () => {
  map.value = new Map({
    // 设置地图图层
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}',
        }),
      })
    ],
    // 设置显示地图的视图
    view: new View({
      center: fromLonLat(mapConstants.CENTER), // 上海
      zoom: 9, // 设置初始化时的地图缩放层级
      projection: 'EPSG:3857', // 坐标系
      maxZoom: 18, // 最大缩放层级
      minZoom: 4, // 最小缩放层级
    }),
    // 让id为map的div作为地图的容器
    target: 'map',
    // 最初添加到映射的控件。如果未指定，则使用模块: ol/control ~ defaults。
    controls: olControl.defaults({
      // 清除地图上的控件
      attribution: false, // 控件显示映射中与图层源关联的所有属性。此控件是映射中包含的默认控件之一。默认情况下，它将显示在地图的右下角，但是这可以通过使用 css 选择器。
      rotate: false,// 用于将旋转重置为0的按钮控件。
      zoom: true,
      zoomOptions: {
        delta: 5, // 每次单击时应用缩放增量
      },
    }),
    interactions: olInteraction.defaults({
      doubleClickZoom: false, // 允许用户通过双击地图来缩放。
      pinchRotate: false, // 允许用户在触摸屏上用两个手指旋转地图。
    }),
  });
}
provide('map', map)

onMounted(() => {
  initMap()
})
</script>

<template>
  <div id="map" class="map">
    <MapMousePosition/>
    <MapOverview/>
  </div>
</template>

<style scoped>
.map {
  width: 100vw;
  height: 100vh;
}

</style>
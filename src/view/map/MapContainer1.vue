<script setup>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import {ref, onMounted, provide} from "vue";
import {fromLonLat} from "ol/proj";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import * as olControl from 'ol/control';
import * as olInteraction from 'ol/interaction';
import mapConstants from '@/constants/map.constants.js';
import ShangHaiGeoJson from '@/assets/json/ShangHai.js';
import MapMousePosition from "@/view/map/compoents/MapMousePosition.vue";
import MapOverview from "@/view/map/compoents/MapOverview.vue";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import {getVectorContext} from "ol/render";
import {Stroke} from "ol/style";

const map = ref(null);


const initMap = () => {
// 裁剪需要的样式
  const style = new Style({
    fill: new Fill({
      color: '' // 设置为多少无所谓，设置了就行
    })
  });

  // const baseLayer = new TileLayer({
  //   source: new XYZ({
  //     url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}',
  //   }),
  //   opacity:0
  // })
  // 解析 Shanghai GeoJSON
  const formatGeoJSON = new GeoJSON({
    featureProjection: "EPSG:3857"
  });
  const shanghaiFeatures = formatGeoJSON.readFeatures(ShangHaiGeoJson);
  // const shanghaiGeometry = shanghaiFeatures[0].getGeometry();
  // const shanghaiExtent = shanghaiGeometry.getExtent();
  // 创建矢量源和图层
  const vectorSource = new VectorSource({
    features: shanghaiFeatures,
  });
  const hljBorderLayer = new VectorLayer({
    source: vectorSource,
    style: stylesMap.shStyle,
  });

  // hljBorderLayer.getSource().on('addfeature', () => {
  //   baseLayer.setExtent(hljBorderLayer.getSource().getExtent());
  // });
  //
  // // 地图渲染完成后触发
  // baseLayer.on('postrender', (e) => {
  //   const vectorContext = getVectorContext(e);
  //   e.context.globalCompositeOperation = 'destination-in';
  //   hljBorderLayer.getSource().forEachFeature(function (feature) {
  //     vectorContext.drawFeature(feature, style);
  //   });
  //   e.context.globalCompositeOperation = 'source-over';
  // });

  map.value = new Map({
    layers: [hljBorderLayer],
    view: new View({
      center: fromLonLat(mapConstants.CENTER), // 上海
      zoom: 9, // 设置初始化时的地图缩放层级
      projection: 'EPSG:3857', // 坐标系
      maxZoom: 18, // 最大缩放层级
      minZoom: 4, // 最小缩放层级
    }),
    target: 'map',
    controls: olControl.defaults({
      attribution: false,
      rotate: false,
      zoom: true,
      zoomOptions: {
        delta: 5,
      },
    }),
    interactions: olInteraction.defaults({
      doubleClickZoom: false,
      pinchRotate: false,
    }),
  });
};

provide('map', map);

onMounted(() => {
  initMap();
});
</script>


<template>
  <div id="map" class="map">
    <MapMousePosition/>
    <MapOverview/>
  </div>
</template>

<style>
@import "@/assets/style/ol-ext.css";

.map {
  width: 100vw;
  height: 100vh;
}
</style>
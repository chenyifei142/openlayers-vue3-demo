<script setup>
import {inject, nextTick, onMounted} from "vue";
import TileLayer from "ol/layer/Tile";
import {XYZ} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import Overview from 'ol-ext/control/Overview';
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import ShangHaiGeoJson from '@/assets/json/ShangHai.js'
import ChangJiangDeltaGeoJson from "@/assets/json/ChangjiangDelta.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import olUtils from "@/utils/olUtils.js";

const map = inject('map')
const createBaseTile = () => {
  let mapUrl = 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}';
  return new TileLayer({
    source: new XYZ({
      url: mapUrl,
      crossOrigin: "anonymous", // 加载图像的 crossOrigin 属性。
    }),
  });
}


const createOverviewMapControl = () => {
  //VectorLayer矢量图层
  //长三角图层
  const csj_layerVector = new VectorLayer({
    source: new VectorSource({features: []}), // 来源
    style: stylesMap.csjStyle,
    zIndex: 716,
  });
  olUtils.addFeaturesByUrl(csj_layerVector, ChangJiangDeltaGeoJson)

  //上海图层
  const sq_layerVector = new VectorLayer({
    source: new VectorSource({features: []}),
    style: stylesMap.shStyle,
    zIndex: 807,
  });
  olUtils.addFeaturesByUrl(sq_layerVector, ShangHaiGeoJson)

  const layersOVMap = [csj_layerVector, sq_layerVector];
  const ov = new Overview({
    layers: layersOVMap,
    projection: "EPSG:3857",
    minZoom: 0,
    maxZoom: 8,
    rotation: false,
    align: "bottom-right",
    panAnimation: false,
    style: [new Style({
      image: new CircleStyle({
        fill: new Fill({
          color: 'rgba(247, 12, 12, 1)'
        }),
        stroke: new Stroke({
          width: 2,
          color: 'rgba(247, 12, 12, 1)'
        }),
        radius: 5
      }),
      stroke: new Stroke({
        width: 2,
        color: "rgba(247, 12, 12, 1)",
        lineDash: [3, 3]
      })
    })]

  });
  map.value.addControl(ov)
}

onMounted(async () => {
  await nextTick(() => {
    createOverviewMapControl()
  })
})
</script>

<template>

</template>

<style>
@import "@/assets/style/ol-ext.css";

.ol-control.ol-overview {
  background: rgba(0, 160, 219, 0.2);
  bottom: 77px;
  /* left: 10px; */
  left: auto;
  right: 10px;
}

.ol-control.ol-overview .panel {
  background-color: transparent !important;
}

.ol-control button {
  background-color: rgba(0, 60, 136, 0.5);
}
</style>
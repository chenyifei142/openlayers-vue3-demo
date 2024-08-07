<script setup>

import {inject, nextTick, onMounted, ref} from "vue";
import olUtils from "@/utils/olUtils.js";
import {Fill, Icon, Stroke, Style} from "ol/style";
import mapConstants from "@/constants/map.constants.js";
import ChangjiangRadarJson from "@/assets/json/ChangjiangRadar.js";
import radarIcon from '@/assets/img/雷达站.png'
import Point from "ol/geom/Point";
import * as olProj from "ol/proj.js";
import Feature from "ol/Feature";

const map = inject('map')
const ldLayerVector = ref(null)

const createLayer = () => {
  ldLayerVector.value = olUtils.createVectorLayer(new Style({
    image: new Icon({
      opacity: 1,
      src: radarIcon
    })
  }), mapConstants.LAYER_Z_INDEX.RADAR_STATION);

  ldLayerVector.value.setProperties({
    featureClickFn: (feature) => {
        let popupHtml = '<div id="popup-sitepoint" class="popup-sitepoint popup-ldpoint">';
      popupHtml += "<code>" + feature.getProperties().value.name + "</code><br/>";
      popupHtml += "</div>";
      return {
        containerClass: "map-popup-sm map-popup-csjld",
        popupHtml: popupHtml
      }
    }
  })
  createFeatures()
  map.value.addLayer(ldLayerVector.value);
}

const createFeatures = () => {
  const features = [];
  for (let item of ChangjiangRadarJson) {
    const lon = item.lon;
    const lat = item.lat;
    const geom = new Point(olProj.fromLonLat([lon, lat]));
    const feature = new Feature(geom);
    feature.setProperties({
      value: {
        name: item.NAME || item.name,
        province: item.province,
      },
    });
    features.push(feature);
  }
  ldLayerVector.value.getSource().addFeatures(features);
}

onMounted(async () => {
  await nextTick(() => {
    createLayer()
  })
});
</script>

<template>
  <div id="map-mouse-position" class="mouse-position-container">
    <div id="custom-mouse-position" class="custom-mouse-position">&nbsp;</div>
  </div>
</template>

<style scoped>
.mouse-position-container {
  position: absolute;
  bottom: 10px; /* 设置鼠标位置控件容器的位置，例如在地图容器的底部 */
  left: 10px;
  z-index: 9999;
}

.custom-mouse-position {
  color: #333;
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.7); /* 背景色，方便阅读 */
  border-radius: 4px; /* 圆角 */
  text-align: center;
}
</style>
<script setup>
import {inject, nextTick, onMounted} from "vue";
import {useCreateVectorLayer} from "@/hooks/useMap.js";
import ChangJiangDeltaGeoJson from "@/assets/json/ChangjiangDelta.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import ShangHaiGeoJson from "@/assets/json/ShangHai.js";
import olUtils from "@/utils/olUtils.js";

const map = inject('map')

const csj_layerVector = useCreateVectorLayer(ChangJiangDeltaGeoJson, stylesMap.csjStyle, 716)
olUtils.addFeaturesByUrl(csj_layerVector.value, ShangHaiGeoJson)

// 更新图层的可见性
const updateLayerVisibility = olUtils.throttle(() => {
  const zoomLevel = map.value.getView().getZoom(); // 获取当前缩放等级
  if (zoomLevel >= 9) csj_layerVector.value.setVisible(false)
  else csj_layerVector.value.setVisible(true);
}, 200); // 200 毫秒的节流时间

onMounted(() => {
  nextTick(() => {
    map.value.addLayer(csj_layerVector.value)
    map.value.on('moveend', updateLayerVisibility);
  })
})
</script>

<template>

</template>

<style scoped>

</style>

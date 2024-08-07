<script setup>
import {inject, nextTick, onMounted, ref, watch} from "vue";
import {useCreateVectorLayer} from "@/utils/useMap.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import shanghaiDistrictGeoJson from "@/assets/json/ShanghaiDistrict.js";
import olUtils from "@/utils/olUtils.js";
import {useMapInfoStore} from "@/store/index.js";

const map = inject('map')
const visibleFeature = ref(null)
const mapInfoStore = useMapInfoStore()
// 上海图层
const shangHaiLayerVector = useCreateVectorLayer(shanghaiDistrictGeoJson, stylesMap.shStyle, 716)

// 设置是否允许点击
const setClickable = () => {
  shangHaiLayerVector.value.setProperties({
    featureClickFn: (feature) => {
      mapInfoStore.areaId = feature.getProperties().ID
      mapInfoStore.areaName = feature.getProperties().NAME
      console.log(mapInfoStore.areaName, "mapInfoStore.areaName")
      return false;
    },
  });
}

watch(() => mapInfoStore.areaName, (newValue, OldValue) => {
  console.log("数据变化了", `新值是：${newValue}`, `旧值是${OldValue}`);
});

onMounted(() => {
  nextTick(() => {
    map.value.addLayer(shangHaiLayerVector.value)
    setClickable()
  })
})
</script>

<template>

</template>

<style scoped>

</style>
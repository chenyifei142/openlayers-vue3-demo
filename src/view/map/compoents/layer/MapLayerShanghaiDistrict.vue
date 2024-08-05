<script setup>
import {inject, nextTick, onMounted, ref} from "vue";
import {useCreateVectorLayer} from "@/utils/useMap.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import shanghaiDistrictGeoJson from "@/assets/json/ShanghaiDistrict.js";
import olUtils from "@/utils/olUtils.js";
import {useCounterStore} from "@/store/index.js";

const map = inject('map')
const visibleFeature = ref(null)
const store = useCounterStore()
// 上海图层
const shangHaiLayerVector = useCreateVectorLayer(shanghaiDistrictGeoJson, stylesMap.shStyle, 716)


onMounted(() => {
  nextTick(() => {
    map.value.addLayer(shangHaiLayerVector.value)
  })
})
</script>

<template>

</template>

<style scoped>

</style>
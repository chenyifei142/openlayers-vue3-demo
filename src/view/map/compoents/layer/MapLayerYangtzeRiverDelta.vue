<script setup>
import {inject, nextTick, onMounted, reactive, ref} from "vue";
import {useCreateVectorLayer} from "@/hooks/useMap.js";
import ChangJiangDeltaGeoJson from "@/assets/json/ChangjiangDelta.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import ShangHaiGeoJson from "@/assets/json/ShangHai.js";
import olUtils from "@/utils/olUtils.js";
import {useImgLayer} from "@/hooks/useImgLayer.js";
// import img from '@/assets/img/123.png'
import img from '@/assets/img/3ccb370241b24348a44c2f44bd480837.png'
// import img from '@/assets/img/06756c30f52a434fa462282a2a354a43.png'
// import img from '@/assets/img/b3040999a20d4684be34b95c6c87df2c.png'
// import img from '@/assets/img/c983cbb8620640308c094fbaad2d6d59.png'
import {transformExtent} from "ol/proj.js";

const map = inject('map')
const imgLayer = ref(null)
const {createLayer, setImgLayer, removeImgLayer, setImgLayerOpacity} = useImgLayer(imgLayer)

const csj_layerVector = useCreateVectorLayer(ChangJiangDeltaGeoJson, stylesMap.csjStyle, 716)
olUtils.addFeaturesByUrl(csj_layerVector.value, ShangHaiGeoJson)

onMounted(() => {
  nextTick(() => {
    map.value.addLayer(csj_layerVector.value)
    createLayer()
    //  extent 数组中的四个坐标（左、下、右、上）表示的是一个矩形区域的边界
    setImgLayer(img, [72.502355, 6.516187, 135.50567, 56.80269]);
    // setImgLayer(img,  [73.291857, 13.2689, 135.22275, 53.756187]);
    const extent3857 = [8392583.131199298, 2057327.4948680997, 14774628.946682949, 6846580.563414273];

    // 将范围从 EPSG:3857 转换为 EPSG:4326
    const extent4326 = transformExtent(extent3857, 'EPSG:3857', 'EPSG:4326');
    console.log(extent4326, "extent4326")
  })
})
</script>

<template>

</template>

<style scoped>

</style>

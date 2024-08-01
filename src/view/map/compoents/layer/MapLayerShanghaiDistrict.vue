<script setup>
import {inject, nextTick, onMounted, ref} from "vue";
import {useCreateVectorLayer} from "@/utils/useMap.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import shanghaiDistrictGeoJson from "@/assets/json/ShanghaiDistrict.js";
import olUtils from "@/utils/olUtils.js";

const map = inject('map')
const visibleFeature = ref(null)
// 上海图层
const shangHaiLayerVector = useCreateVectorLayer(shanghaiDistrictGeoJson, stylesMap.shStyle, 716)
// 处理指针跟点击事件
const handleShangHaiLayerClick = () => {
  // // 添加鼠标指针移动事件，改变可点击区域的指针样式
  // map.value.on('pointermove', (e) => {
  //   const hit = map.value.hasFeatureAtPixel(e.pixel, {
  //     layerFilter: (layer) => layer === shangHaiLayerVector.value
  //   });
  //   map.value.getTargetElement().style.cursor = hit && visibleFeature.value === null ? 'pointer' : ''; // 如果有可点击区域且没有选中的区县，显示手指样式
  // });
  // 添加点击事件
  map.value.on('singleclick', (e) => {
    // 如果 visibleFeature.value 不为 null，则不处理点击事件
    if (visibleFeature.value !== null) {
      return;
    }
    // 处理点击事件
    map.value.forEachFeatureAtPixel(e.pixel, (feature) => {
      // 显示点击的区县，隐藏其他区县
      shangHaiLayerVector.value.getSource().getFeatures().forEach((f) => {
        f.setStyle(f === feature ? stylesMap.shStyle : stylesMap.hiddenStyle);
      });
      visibleFeature.value = feature;
      // 获取点击特性的几何中心
      const center = olUtils.getFeatureCenter(feature);
      // 动画到点击特性中心，并放大
      map.value.getView().animate({
        center: center,
        zoom: 10, // 放大到 10 级
        duration: 1000 // 动画时长 1 秒
      });
    }, {
      layerFilter: (layer) => layer === shangHaiLayerVector.value // 仅处理上海图层的点击事件
    });
  });
}

onMounted(() => {
  nextTick(() => {
    map.value.addLayer(shangHaiLayerVector.value)
    handleShangHaiLayerClick()
  })
})
</script>

<template>

</template>

<style scoped>

</style>
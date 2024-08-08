<script setup>
import {inject, nextTick, onMounted, ref, watch, watchEffect} from "vue";
import {useCreateVectorLayer} from "@/utils/useMap.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import shanghaiDistrictGeoJson from "@/assets/json/ShanghaiDistrict.js";
import {useMapInfoStore} from "@/store/index.js";
import * as olProj from "ol/proj.js";
import mapConstants from "@/constants/map.constants.js";

// 注入全局的 map 实例
const map = inject('map')
// 创建上海地区的矢量图层
const shangHaiLayerVector = useCreateVectorLayer(shanghaiDistrictGeoJson, stylesMap.shStyle, 716)
const isClick = ref(true)

// 使用 store 管理地图信息
const mapInfoStore = useMapInfoStore()
// 设置是否允许点击
const setClickable = () => {
  if (isClick.value) {
    // 设置图层的属性，定义点击 feature 时的行为
    shangHaiLayerVector.value.setProperties({
      featureClickFn: (feature) => {
        // 将点击的 feature 的 ID 和 NAME 保存到 store 中
        mapInfoStore.areaId = feature.getProperties().ID
        mapInfoStore.areaName = feature.getProperties().NAME
        return false;
      },
    });
  } else {
    shangHaiLayerVector.value.setProperties({
      featureClickFn: null,
    });
  }
}

// 监听 store 中 areaName 的变化
watch(() => mapInfoStore.areaName, (val) => {
  if (val) {
    selectArea()
    isClick.value = false
    setClickable()
  } else {
    setStyle(mapInfoStore.areaId)
    //定位到全市
    setViewCity();
    isClick.value = true
    setClickable()
  }
});
//定位到全市
const setViewCity = () => {
  map.value.getView().animate(
      {zoom: 9,},
      {center: olProj.fromLonLat(mapConstants.CENTER),}
  );
};

// 选中区域并调整地图视图
const selectArea = () => {
  const areaId = mapInfoStore.areaId;
  setStyle(areaId);
  const features = shangHaiLayerVector.value.getSource().getFeatures();
  const feature = features.find((item) => item.getProperties().ID === areaId);
  if (feature) {
    // 将地图视图调整到选中区域
    map.value.getView().fit(feature.getGeometry(), {
      size: map.value.getSize(),
      maxZoom: 11,
      padding: [50, 50, 50, 50],
      duration: 1000,
    });
  }
}

const setStyle = (areaId) => {
  if (areaId) {
    // 显示点击的区县，隐藏其他区县
    shangHaiLayerVector.value.getSource().getFeatures().forEach((f) => {
      f.setStyle(f.getProperties().ID === areaId ? stylesMap.shStyle : stylesMap.hiddenStyle);
    });
  } else {
    shangHaiLayerVector.value.getSource().getFeatures().forEach((f) => {
      f.setStyle(stylesMap.shStyle);
    });
  }
}

// 当组件挂载时执行
onMounted(() => {
  // 在下一个 DOM 更新周期后执行
  nextTick(() => {
    // 将上海矢量图层添加到地图中
    map.value.addLayer(shangHaiLayerVector.value)
    // 设置图层的可点击属性
    setClickable()
  })
})
</script>

<template>

</template>

<style scoped>

</style>

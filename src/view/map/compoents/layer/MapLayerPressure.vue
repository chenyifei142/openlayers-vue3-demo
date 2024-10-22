<script setup>
import {inject, nextTick, onMounted, ref, watch, watchEffect} from "vue";
import pressureGeoJson from "@/assets/json/pressure.js";
import {Fill, Stroke, Style} from "ol/style";
import olUtils from "@/utils/olUtils.js";
import mapConstants from "@/constants/map.constants.js";
import {Text} from "ol/style";

// 注入全局的 map 实例
const map = inject('map')
// 创建等压线的矢量图层
const pressureLayerVector = ref(null)

// 定义样式函数，在渲染每个区域时调用
const areaStyleFunction = (feature) => {
  const properties = feature.getProperties(); // 获取区域的属性
  const areaName = properties.val.toString()??'哈哈哈哈'; // 获取区域的名称
  const fillColor = "transparent"; // 根据 fallRisk 值获取填充颜色

  // 返回样式对象，用于渲染区域
  return new Style({
    // 创建一个基础的线条样式，用于为所有区域绘制边框
    stroke: new Stroke({
      width: 2, // 边框宽度
      color: properties.stroke_color || '#6beaff', // 边框颜色
    }),
    //设置区域填充颜色
    fill: new Fill({
      color: fillColor,
    }),
    // 创建一个基础的文本样式，用于显示区域名称
    text: new Text({
      font: '15px Arial', // 字体及大小
      text: areaName, // 设置显示的区域名称
      overflow: false, // 防止文本超出范围
      fill: new Fill({ color: '#fff' }), // 文本颜色
      offsetY: 10, // 文本的 Y 轴偏移量
      textBaseline: 'bottom', // 文本基线对齐方式
    }),
  });
};


// 初始化图层函数，创建矢量图层并添加到地图上
const initializeLayer = () => {
  try {
    // 创建矢量图层，并指定层级
    pressureLayerVector.value = olUtils.createVectorLayer(null, mapConstants.LAYER_Z_INDEX.TOWN);
    if (!pressureLayerVector.value) throw new Error("Failed to create vector layer");

    // 将矢量图层添加到地图上
    map.value.addLayer(pressureLayerVector.value);

    // 添加地理要素到矢量图层中
    olUtils.addFeaturesByUrl(pressureLayerVector.value, pressureGeoJson, (fArray) => {
    });

    // 设置图层的样式
    pressureLayerVector.value.setStyle(areaStyleFunction);
  } catch (error) {
    console.error("Error in initializeLayer:", error); // 如果发生错误，打印错误信息
  }
};

// 当组件挂载时执行
onMounted(() => {
  nextTick(() => {
    // 将等压线的矢量图层添加到地图中
    initializeLayer()
  })
})
</script>

<template>

</template>

<style scoped>

</style>

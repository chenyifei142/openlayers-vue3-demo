<script setup>
import {inject, onMounted, ref, computed, nextTick} from "vue";
import shanghaiTown from "@/assets/json/ShanghaiTown.js";
import mapConstants from "@/constants/map.constants.js";
import olUtils from "@/utils/olUtils.js";
import {Fill, Stroke, Style, Text} from "ol/style";

// 注入全局的 map 实例
const map = inject("map");

// townLayerVector 是我们将创建并添加到地图上的矢量图层
const townLayerVector = ref(null);

// 定义一些数据，这些数据将用于根据区域的 id 映射出对应的风险等级
const data = [
  {id: 31010601, name: "石门二路街道", fallRisk: 1},
  {id: 31010603, name: "江宁路街道", fallRisk: 2},
  {id: 31010605, name: "彭浦镇", fallRisk: 3},
  {id: 31010606, name: "彭浦新村街道", fallRisk: 2},
  {id: 31010608, name: "大宁路街道", fallRisk: 2},
  {id: 31010611, name: "共和新路街道", fallRisk: 1},
  {id: 31010610, name: "南京西路街道", fallRisk: 3},
  {id: 31010613, name: "临汾路街道", fallRisk: 1},
  {id: 31010612, name: "静安寺街道", fallRisk: 1},
];

// 使用 computed 创建一个映射，用于快速根据 id 查找对应的风险等级数据
const riskMap = computed(() => new Map(data.map((value) => [value.id, value])));

// 定义风险等级对应的颜色
const colorObj = {
  1: "#f59a23", // 颜色对应 fallRisk 为 1
  2: "#fff900", // 颜色对应 fallRisk 为 2
  3: "#02a7f0", // 颜色对应 fallRisk 为 3
};

// 定义样式函数，在渲染每个区域时调用
const areaStyleFunction = (feature) => {
  const properties = feature.getProperties(); // 获取区域的属性
  const code = +properties.id; // 获取区域的 id
  const areaName = properties.NAME; // 获取区域的名称
  const fallRiskData = riskMap.value.get(code); // 根据 id 获取对应的风险等级数据
  const value = fallRiskData ? fallRiskData.fallRisk : ""; // 获取 fallRisk 值
  const fillColor = colorObj[value] || "transparent"; // 根据 fallRisk 值获取填充颜色

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
      fill: new Fill({ color: '#000' }), // 文本颜色
      offsetY: 10, // 文本的 Y 轴偏移量
      textBaseline: 'bottom', // 文本基线对齐方式
    }),
  });
};

// 初始化图层函数，创建矢量图层并添加到地图上
const initializeLayer = () => {
  try {
    // 创建矢量图层，并指定层级
    townLayerVector.value = olUtils.createVectorLayer(null, mapConstants.LAYER_Z_INDEX.TOWN);
    if (!townLayerVector.value) throw new Error("Failed to create vector layer");

    // 将矢量图层添加到地图上
    map.value.addLayer(townLayerVector.value);

    // 添加地理要素到矢量图层中
    olUtils.addFeaturesByUrl(townLayerVector.value, shanghaiTown, (fArray) => {
      for (let j = 0; j < fArray.length; j++) {
        let f = fArray[j];
        if (f.getProperties().cnty !== "静安区") {
          fArray.splice(j--, 1); // 如果不是“静安区”，则从数组中移除该要素
        }
      }
    });

    // 设置图层的样式
    townLayerVector.value.setStyle(areaStyleFunction);
  } catch (error) {
    console.error("Error in initializeLayer:", error); // 如果发生错误，打印错误信息
  }
};

// 当组件挂载时执行的逻辑
onMounted(() => {
  nextTick(() => {
    initializeLayer(); // 初始化图层并添加到地图
  })
});
</script>

<template>
  <!-- 此处未定义任何模板内容 -->
</template>

<style scoped>
/* 此处未定义任何样式 */
</style>

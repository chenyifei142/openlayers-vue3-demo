<script setup>
import {MousePosition} from "ol/control";
import * as olCoordinate from "ol/coordinate";
import {inject, nextTick, onMounted, provide} from "vue";

const map = inject('map')

const addMousePosition = () => {
  const mousePositionControl = new MousePosition({
    // olCoordinate.createStringXY(n) 返回一个字符串坐标, n 为保留多少位小数
    coordinateFormat: olCoordinate.createStringXY(4), // 坐标格式
    projection: "EPSG:4326", // 投影。默认值是视图投影
    className: "custom-mouse-position",
    target: document.getElementById("custom-mouse-position"), // 如果您希望在地图的视区外呈现控件，请指定目标。
    undefinedHTML: "&nbsp;",
  });
  map.value.addControl(mousePositionControl);
}
onMounted(async () => {
  await nextTick(() => {
    addMousePosition()
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
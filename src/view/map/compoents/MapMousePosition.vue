<script setup>
import {MousePosition} from "ol/control";
import * as olCoordinate from "ol/coordinate";
import {inject, nextTick, onMounted} from "vue";

const map = inject('map')

const addMousePosition = () => {
  const mousePositionControl = new MousePosition({
    // olCoordinate.createStringXY(n) 返回一个字符串坐标, n 为保留多少位小数
    coordinateFormat: olCoordinate.createStringXY(4), // 坐标格式
    projection: "EPSG:4326", // 投影。默认值是视图投影
    className: "custom-mouse-position",
    target: document.getElementById("map-mouse-position"), // 如果您希望在地图的视区外呈现控件，请指定目标。
    undefinedHTML: "&nbsp;",
  });
  map.value.addControl(mousePositionControl);
}
onMounted(async () => {
  await nextTick()
  console.log(map.value,"map")
 await addMousePosition()
  console.log(map.value,"map")

});
</script>

<template>
  <div id="map-mouse-position">
    <div class="custom-mouse-position">&nbsp;</div>
  </div>
</template>

<style scoped>
</style>

<script setup>
import {inject, nextTick, onMounted, ref} from "vue";
import jinbohui_area from "@/assets/json/jinbohui_area.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import olUtils from "@/utils/olUtils.js";
import {Fill, Stroke, Style} from "ol/style";

const map = inject('map')
const warningrange_type = {
  color: {
    // "疏导区": "#00734c",
    疏导区: '#a3f00a',
    控制区: '#1d83b8',
    警戒区: '#dc8a3a',
    核心区: '#e60000',
  },
  width: {
    疏导区: 4,
    控制区: 3,
    警戒区: 2,
    核心区: 2,
  },
  fillcolor: {
    疏导区: [163, 240, 10, 0.05],
    控制区: [29, 131, 184, 0.1],
    警戒区: [220, 138, 58, 0.2],
    核心区: [230, 0, 0, 0.3],
  },
};
const weatherStation = ref(null)

const createLayer = () => {
  weatherStation.value = new VectorLayer({
    source: new VectorSource({features: []}),
  });
  olUtils.addFeaturesByUrl(weatherStation.value, jinbohui_area);

  for (let item of weatherStation.value.getSource().getFeatures()) {
    item.setStyle(setFeaturesStyle(item.get('type')))
  }
  map.value.addLayer(weatherStation.value);
}
const setFeaturesStyle = (type) => {
  return new Style({
    stroke: new Stroke({
      color: warningrange_type["color"][type],
      width: warningrange_type["width"][type]
    }),
    fill: new Fill({
      color: warningrange_type['fillcolor'][type]
    }),
  })

}

const handleShangHaiLayerClick = () => {

}

onMounted(() => {
  nextTick(() => {
    createLayer()
    handleShangHaiLayerClick()
  })
});
</script>

<template>
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

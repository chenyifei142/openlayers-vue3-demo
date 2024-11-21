<script setup>
import {inject, nextTick, onMounted, ref} from "vue";
import {WindLayer} from "ol-wind";
//本地风场数据Json文件
import {windJson} from "@/assets/json/wind.js"
// import WindyLayer from "@/assets/js/windy.js";

const map = inject('map')

const windLayer = ref(null)
const windFarm = ref(null)
const createWindLayer = () => {
  // const options= {};
  // options.velocityScale = 0.8;
  // options.particleMultiplier = 1 / 160;
  // options.colorScale = [
  //   [0, [82, 71, 141]],
  //   [2, [83, 82, 180]],
  //   [4, [68, 103, 195]],
  //   [6, [59, 143, 193]],
  //   [8, [73, 178, 158]],
  //   [10, [76, 196, 92]],
  //   [12, [92, 208, 74]],
  //   [14, [153, 220, 69]],
  //   [18, [235, 224, 53]],
  //   [22, [234, 168, 61]],
  //   [26, [227, 103, 87]],
  //   [30, [181, 47, 95]],
  //   [34, [131, 23, 67]],
  //   [38, [68, 10, 25]],
  //   [42, [43, 0, 1]]
  // ];
  // options.particleOpacity = 0.75;
  // options.particleLineLength = 0.18;
  // options.isColorSpot = true;
  // windFarm.value = new WindyLayer(windFarmData.value, options);
  // windFarm.value.appendTo(map);

  windLayer.value = new WindLayer(windJson, {
    windOptions: {
      velocityScale: 0.05,
      paths: 3200,
      // eslint-disable-next-line no-unused-vars
      colorScale: [
        "rgb(36,104, 180)",
        "rgb(60,157, 194)",
        "rgb(128,205,193 )",
        "rgb(151,218,168 )",
        "rgb(198,231,181)",
        "rgb(238,247,217)",
        "rgb(255,238,159)",
        "rgb(252,217,125)",
        "rgb(255,182,100)",
        "rgb(252,150,75)",
        "rgb(250,112,52)",
        "rgb(245,64,32)",
        "rgb(237,45,28)",
        "rgb(220,24,32)",
        "rgb(180,0,35)"
      ],
      lineWidth: 3,
      generateParticleOption: false
    },
    fieldOptions: {
      wrapX: false,
    },
  });

  map.value.addLayer(windLayer.value)
}

onMounted(async () => {
  await nextTick(() => {
    createWindLayer()
  })
});
</script>

<template>

</template>

<style scoped>

</style>

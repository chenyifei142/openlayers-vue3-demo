<script setup>
import {nextTick, onMounted} from "vue";
import {useTyphoonGuardLine} from "@/hooks/useTyphoonGuardLine.js";
import {useTyphoonLayer} from "@/hooks/useTyphoonLayer.js";
import {typhoonData} from "@/assets/data/typhoonData.js";

const {drawTyphoonLayer, destroyTyphoonLayer} = useTyphoonLayer({
  baseInfo: {
    "code": 201614,
    "tfbh": 201614,
    "name": "莫兰蒂",
    "eName": "Meranti",
    "isCurrent": 1
  },
  data: typhoonData.tracks,
  fData: typhoonData.trackFores,
})
const {drawTyphoonGuardLine, close} = useTyphoonGuardLine()

setTimeout(() => {
  // destroyTyphoonLayer()
}, 100000)
onMounted(async () => {
  await nextTick()
  await drawTyphoonGuardLine()
  await drawTyphoonLayer()
})
</script>

<template>

</template>

<style scoped>

</style>

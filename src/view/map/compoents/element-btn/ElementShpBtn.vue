<script setup>
import {inject, nextTick, onMounted, ref} from "vue";
import {useShpLayer} from "@/hooks/useShpLayer.js";
import {WuhanTemp} from "@/assets/json/WuhanTemp.js";

const shpLayer = ref(null)
const {createShpLayer, setShpLayer, removeShpLayer} = useShpLayer(shpLayer)
onMounted(async () => {
  await nextTick()
  await createShpLayer()
  await setShpLayer(WuhanTemp, 'temp')
})
</script>

<template>

</template>

<style scoped>

</style>

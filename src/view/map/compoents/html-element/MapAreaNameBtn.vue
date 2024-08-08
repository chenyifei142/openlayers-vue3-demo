<script setup>
import {useMapInfoStore} from "@/store/index.js";
import {computed, watch} from "vue";
import areaConstants from "@/constants/area.constants.js";
// 使用 store 管理地图信息
const mapInfoStore = useMapInfoStore()
// 创建一个计算属性 doubleCount，值是 count 的双倍
const areaId = computed(() => mapInfoStore.areaId);
const areaName = computed(() => mapInfoStore.areaName);
const show = computed(() => areaName.value && areaId.value != areaConstants.CITY_ID);

const back = () => {
  mapInfoStore.areaId = ''
  mapInfoStore.areaName = ''
}

</script>

<template>
  <div class="station-name" id="station-name" title="返回全市范围" v-show="show" @click="back">
    <!-- <i class="iconfont icon-qianzhituceng"></i> -->
    <img alt="返回" src="@/assets/img/icon_xsn.png">
    <span class="" id="station-name-text">{{ areaName }}</span>
  </div>
</template>

<style scoped>

</style>
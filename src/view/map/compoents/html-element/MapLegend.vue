<script setup>
import {onMounted, ref, watch} from "vue";
import {useLegendCfg} from "@/hooks/useLegendCfg.js";
import {useColorConfigStore} from "@/store/useColorConfigStore.js";

const {type, initActive} = defineProps({
  //图例类别 legendCfg.js 中 对象ProductElementConfig的key
  type: {type: String, required: true},
  //是否初始化就为激活状态（显示状态）
  initActive: {type: Boolean, default: false},
});

const active = ref(false);
const title = ref('')
const {colorConfig, getTitle, getStartIndex, getStep} = useLegendCfg('temp')
const colorWidth = ref(0);
const labelWidth = ref(0);
const legendNameArr = ref([]);

const getLegend = () => {
  title.value = getTitle()
  let i = getStartIndex()
  const step = getStep()
  colorWidth.value = 282 / colorConfig.value.length;
  labelWidth.value = colorWidth.value * step;
  legendNameArr.value = []
  for (; i < colorConfig.value.length; i += step) {
    legendNameArr.value.push({name: colorConfig.value[i].name})
  }
}

//是否换行
const isBr = (str) => {
  return typeof str == "string" && str.includes("br/");
};
const colorConfigStore = useColorConfigStore();

const changeColorLegend = () => colorConfigStore.isColorChange = !colorConfigStore.isColorChange

watch(colorConfig, (newVal, oldVal) => {
  getLegend()
})

onMounted(() => {
  getLegend();
  if (initActive) {
    active.value = true;
  }
});
</script>

<template>
  <div class="custom-legend-content" v-show="active" @click="changeColorLegend()">
    <div class="lgd_title">
      <div class="lgd_close" @click="close">×</div>
      <span style="">{{ title }}</span>
    </div>
    <div class="lgd_bottom">
      <div class="lgd_color lgd_color_padding">
        <div
            v-for="(item, index) in colorConfig"
            :key="index"
            :title="item.name || item.max.toString()"
            :style="{
						backgroundColor: item.color.replace(',1)', ',0.75)'),
						width: colorWidth + 'px',
						height: '12px',
						float: 'left'
					}"></div>
      </div>
      <div class="lgd_label" style="overflow: hidden">
        <div
            v-for="(item, index) in legendNameArr"
            :key="index"
            :style="{
						width: labelWidth + 'px',
						fontSize: '12px',
						float: 'left',
						textAlign: 'right',
						height: isBr(item.name) ? '28px' : '14px',
						transform: 'scale(0.85)'
					}">
          {{ isBr(item.name) ? item.name.split("br/")[0] : item.name }}
          <div v-if="isBr(item.name)">
            {{ item.name.split("br/")[1] }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>

</style>

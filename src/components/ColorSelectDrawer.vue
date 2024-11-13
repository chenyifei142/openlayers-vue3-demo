<script setup>
import {useColorConfigStore} from "@/store/useColorConfigStore.js";
import {computed, ref, watch} from "vue";
import {useLegendCfg} from "@/hooks/useLegendCfg.js";
import {Delete} from '@element-plus/icons-vue'

// 获取 colorConfigStore 实例
const colorConfigStore = useColorConfigStore();
// 计算属性：判断是否发生了颜色变化
const isColorChange = computed(() => colorConfigStore.isColorChange);
// 从 useLegendCfg 获取色卡配置
const {colorConfig} = useLegendCfg('temp')
// 定义响应式变量，用于存储色卡配置列表
const colorList = ref([])
// 关闭抽屉时触发的函数，设置颜色变化标志为 false
const handleClose = () => {
  colorConfigStore.isColorChange = false
}
// 当前激活的色卡项的索引
const currentItemIndex = ref(null)
const currentColor = ref('')
// 用于防抖的定时器
let debounceTimeout = null;
// 处理颜色变化的函数，500ms内只会执行一次（防抖）
const handleActiveChange = (val) => {
  // 清除之前的定时器
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  // 设置新的定时器
  debounceTimeout = setTimeout(() => {
    colorList.value[currentItemIndex.value].color = val; // 更新颜色
  }, 200); //  防抖间隔
}
// 点击色卡项时触发的函数，记录当前点击的色卡项索引
const handleClickItem = (index) => {
  currentItemIndex.value = index
}
// 删除色卡项的函数
const handleDel = (index) => {
  colorList.value = colorList.value.filter((_, i) => i !== index) // 删除指定索引的色卡项
  adjustMinMaxValues() // 调整最小最大值
}

// 监听输入框的按键事件，阻止非法字符输入
const handleKeyDown = (event) => {
  const key = event.key;
  const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "-"]; // 允许的特殊按键
  const isNumber = /^[0-9]$/.test(key); // 允许数字输入

  // 阻止非法按键的输入
  if (!isNumber && !allowedKeys.includes(key)) {
    event.preventDefault();
  }

  // 阻止非第一个字符输入负号
  if (key === "-" && event.target.selectionStart !== 0) {
    event.preventDefault();
  }
}
// 输入框失焦时触发的事件，排序并调整 min/max 值
const handleInputChange = () => {
  colorList.value.sort((a, b) => (a.min - b.min)); // 根据最小值排序
  adjustMinMaxValues() // 调整最小最大值
}

// 调整色卡的最小值和最大值
const adjustMinMaxValues = () => {
  colorList.value.forEach((item, index) => {
    if (index < colorList.value.length - 1) {
      item.max = colorList.value[index + 1].min; // 当前项的最大值为下一项的最小值
    } else {
      item.max = ''; // 最后一项没有最大值
      item.name = '≥' + item.min // 设置名称为最小值
    }
  });
};

// 转换 colorList 为需要的格式，准备保存到 store 中
const transformColorConfig = () => {
  return colorList.value.map((item, index) => {
    // 验证颜色字符串并提取 RGBA 值
    const rgba = item.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(\.\d+)?)\)/);
    if (!rgba) {
      console.error(`Invalid color format: ${item.color}`); // 如果颜色格式不正确，则打印错误
      return null;
    }

    const [_, R, G, B, A] = rgba; // 解构 RGBA 值

    // 转换成需要的数据结构
    const transformedItem = {
      GT: item.min.toString(), // 大于等于
      LTE: item.max.toString(), // 小于等于
      A: (parseFloat(A) * 255).toFixed(), // alpha 值转为 0-255 范围
      R: R, // 红色值
      G: G, // 绿色值
      B: B, // 蓝色值
      NAME: item?.name // 名称
    };

    // 将当前项的 max 赋值给下一项的 min（如果存在下一项）
    if (index < colorList.length - 1) {
      colorList[index + 1].min = item.max;
    }

    return transformedItem;
  }).filter(Boolean); // 过滤掉无效项（null）
};

watch(colorConfig, (value) => {
  colorList.value = value
  adjustMinMaxValues()
}, {deep: true, immediate: true, once: true})

watch(colorList, () => {
  const transformedData = transformColorConfig();
  colorConfigStore.setColorConfig('temp', transformedData)
}, {deep: true})

</script>


<template>
  <el-drawer v-model="isColorChange" direction="rtl" :before-close="handleClose" size="25%">
    <template #header>
      <h4>自定义色层</h4>
    </template>
    <template #default>
      <div class="color-box">
        <div class="item" v-for="(item,index) in colorList" :key="item.id" :style="{ '--bg-color': item.color }">
          <div>
            <div>
              <input class="svelte-1ipp6si" v-model="item.min" @keydown="handleKeyDown" @blur="handleInputChange"
                     style="width: 50px"/>
              <span style="color: white;font-weight: bold">℃</span>
            </div>
          </div>
          <el-color-picker v-model="item.color" show-alpha @click="handleClickItem(index)"
                           @active-change="handleActiveChange"/>
          <el-icon size="20" color="#fff" @click="handleDel(index)">
            <Delete/>
          </el-icon>
        </div>
      </div>
    </template>
    <template #footer>

    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
.color-box {
  width: 100%;
  height: 100%;

  .item {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 50px;
    background-color: var(--bg-color);;

    &:first-child {
      border-radius: 25px 25px 0 0;
    }

    &:last-child {
      border-radius: 0 0 25px 25px;
    }
  }
}

.svelte-1ipp6si {
  border: none;
  border-radius: 4px;
  font-size: 15px;
  text-align: center;
  width: 70px;
  padding: 2px 8px;
  margin: 3px 5px;
  background: rgba(248, 248, 248, 0.68);
}


</style>

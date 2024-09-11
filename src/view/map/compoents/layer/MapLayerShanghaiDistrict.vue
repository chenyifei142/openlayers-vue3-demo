<script setup>
import {inject, nextTick, onMounted, ref, watch, watchEffect} from "vue";
import {useCreateVectorLayer} from "@/utils/useMap.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import shanghaiDistrictGeoJson from "@/assets/json/ShanghaiDistrict.js";
import {useMapInfoStore} from "@/store/index.js";
import * as olProj from "ol/proj.js";
import mapConstants from "@/constants/map.constants.js";
import {Style} from "ol/style";

// 注入全局的 map 实例
const map = inject('map')
// 创建上海地区的矢量图层
const shangHaiLayerVector = useCreateVectorLayer(shanghaiDistrictGeoJson, stylesMap.shStyle, 716)
const isClick = ref(true)

// 使用 store 管理地图信息
const mapInfoStore = useMapInfoStore()
// 设置是否允许点击
const setClickable = () => {
  if (isClick.value) {
    // 设置图层的属性，定义点击 feature 时的行为
    shangHaiLayerVector.value.setProperties({
      featureClickFn: (feature) => {
        // 将点击的 feature 的 ID 和 NAME 保存到 store 中
        mapInfoStore.areaId = feature.getProperties().ID
        mapInfoStore.areaName = feature.getProperties().NAME
        return false;
      },
    });
  } else {
    shangHaiLayerVector.value.setProperties({
      featureClickFn: null,
    });
  }
}

// 监听 store 中 areaName 的变化
watch(() => mapInfoStore.areaName, (val) => {
  if (val) {
    selectArea()
    isClick.value = false
    setClickable()
  } else {
    setStyle(mapInfoStore.areaId)
    //定位到全市
    setViewCity();
    isClick.value = true
    setClickable()
  }
});
//定位到全市
const setViewCity = () => {
  map.value.getView().animate(
      {zoom: 9,},
      {center: olProj.fromLonLat(mapConstants.CENTER),}
  );
};

// 选中区域并调整地图视图
const selectArea = () => {
  const areaId = mapInfoStore.areaId;
  setStyle(areaId);
  const features = shangHaiLayerVector.value.getSource().getFeatures();
  const feature = features.find((item) => item.getProperties().ID === areaId);
  if (feature) {
    // 将地图视图调整到选中区域
    map.value.getView().fit(feature.getGeometry(), {
      size: map.value.getSize(),
      maxZoom: 11,
      padding: [50, 50, 50, 50],
      duration: 1000,
    });
  }
}

const setStyle = (areaId) => {
  if (areaId) {
    // 显示点击的区县，隐藏其他区县
    shangHaiLayerVector.value.getSource().getFeatures().forEach((f) => {
      f.setStyle(f.getProperties().ID === areaId ? setStyle2 : stylesMap.hiddenStyle);
    });
  } else {
    shangHaiLayerVector.value.getSource().getFeatures().forEach((f) => {
      f.setStyle(stylesMap.shStyle);
    });
  }
}
// 定义一个函数 setStyle2，用于根据传入的 areaId 创建自定义样式
const setStyle2 = (areaId) => {
  return new Style({
    // renderer 函数用于自定义地图上要素的渲染方式
    renderer(coordinate, state) {
      console.log('coordinate', coordinate);
      let arr = coordinate[0]; // 从坐标数组中提取第一个元素
      const ctx = state.context; // 获取 OpenLayers 使用的 canvas 的 2D 绘图上下文

      console.log(arr, "arr");
      console.log(ctx, "ctx");

      // 依次为 canvas 上下文应用不同的轮廓和阴影效果
      // 第一个阴影层，颜色为深蓝色
      addOutlineShadow(ctx, {
        fillStyle: "#093cc7", // 设置图形的填充颜色
        shadowOffsetY: 50, // 阴影的垂直偏移量
        shadowOffsetX: 2,  // 阴影的水平偏移量
        shadowColor: "#093cc7", // 阴影的颜色
        strokeStyle: "#093cc7", // 轮廓的颜色
        coodArr: arr, // 要绘制的坐标数组
      });

      // 第二个阴影层，填充为透明色
      addOutlineShadow(ctx, {
        fillStyle: "transparent", // 设置透明填充
        shadowOffsetY: 40,
        shadowOffsetX: 2,
        shadowColor: "#307fe4", // 较浅的蓝色阴影
        strokeStyle: "#transparent",
        coodArr: arr,
      });

      // 第三个阴影层，阴影为白色
      addOutlineShadow(ctx, {
        fillStyle: "transparent", // 设置透明填充
        shadowOffsetY: 60,
        shadowOffsetX: 2,
        shadowColor: "rgba(255,255,255,1)", // 白色阴影
        strokeStyle: "#307fe4",
        shadowBlur: 10, // 设置模糊效果，使阴影边缘柔和
        coodArr: arr,
      });

      // 第四个阴影层，颜色为浅蓝色
      addOutlineShadow(ctx, {
        fillStyle: "transparent",
        shadowOffsetY: 25,
        shadowOffsetX: 2,
        shadowColor: "#307fe4", // 浅蓝色阴影
        strokeStyle: "#307fe4",
        coodArr: arr,
      });

      // 第五个阴影层，白色阴影且模糊效果更强
      addOutlineShadow(ctx, {
        fillStyle: "#3f99ef",
        shadowOffsetY: 20,
        shadowOffsetX: 2,
        shadowColor: "#307fe4",
        strokeStyle: "#307fe4",
        shadowBlur: 10,
        coodArr: arr,
      });

      // 第六层，填充为蓝色，并带有阴影
      addOutlineShadow(ctx, {
        fillStyle: "#3f99ef",
        shadowOffsetY: 15,
        shadowOffsetX: 2,
        shadowColor: "#3f99ef", // 浅蓝色阴影
        strokeStyle: "#3f99ef",
        shadowBlur: 10,
        coodArr: arr,
      });

      // 最后一层，蓝色轮廓并带有白色阴影，形成发光效果
      addOutlineShadow(ctx, {
        fillStyle: "#2064d8", // 蓝色填充
        shadowOffsetY: 5,
        shadowOffsetX: 10,
        shadowColor: "rgba(255,255,255,.7)", // 白色阴影，产生发光效果
        strokeStyle: "rgba(255,255,255,.5)", // 浅色轮廓
        shadowBlur: 15,
        coodArr: arr,
        lineWidth: 2, // 增加线条宽度，使轮廓更明显
      });
    },
  });
}

// 定义一个函数 addOutlineShadow，用于在 canvas 上下文中绘制带有阴影和轮廓的图形
const addOutlineShadow = (ctx, option) => {
  // 根据传入的选项设置填充和轮廓样式
  ctx.fillStyle = option.fillStyle || "transparent"; // 默认填充为透明色
  ctx.strokeStyle = option.strokeStyle || "transparent"; // 默认轮廓为透明色
  ctx.lineWidth = option.lineWidth || 1; // 默认线条宽度为 1

  // 设置阴影属性
  ctx.shadowOffsetY = option.shadowOffsetY || 20; // 阴影的垂直偏移量
  ctx.shadowOffsetX = option.shadowOffsetX || 2; // 阴影的水平偏移量
  ctx.shadowBlur = option.shadowBlur || 2; // 阴影模糊效果
  ctx.shadowColor = option.shadowColor || "#000"; // 默认阴影颜色为黑色

  ctx.beginPath(); // 开始绘制新路径
  let arr = option.coodArr || []; // 使用传入的坐标数组或默认空数组
  for (let i = 0; i < arr.length; i++) {
    const data = arr[i];
    if (i === 0) {
      ctx.moveTo(data[0], data[1]); // 将画笔移动到第一个坐标点
    } else {
      ctx.lineTo(data[0], data[1]); // 绘制线条到后续的坐标点
    }
  }
  ctx.closePath(); // 闭合路径，形成完整的图形
  ctx.fill(); // 使用指定的填充颜色填充图形
  ctx.stroke(); // 使用指定的轮廓颜色描边图形
}


// 当组件挂载时执行
onMounted(() => {
  // 在下一个 DOM 更新周期后执行
  nextTick(() => {
    // 将上海矢量图层添加到地图中
    map.value.addLayer(shangHaiLayerVector.value)
    // 设置图层的可点击属性
    setClickable()
  })
})
</script>

<template>

</template>

<style scoped>

</style>

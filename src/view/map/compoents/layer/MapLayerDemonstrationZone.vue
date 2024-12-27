<script setup>
// 引入 Vue 相关方法及工具函数
import {inject, nextTick, onMounted, ref} from "vue";
import {useCreateVectorLayer} from "@/hooks/useMap.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js"; // 导入地图样式
import DemonstrationZoneGeoJson from "@/assets/json/DemonstrationZone.js"; // 示例区 GeoJSON 数据
import {fromUrl} from "geotiff"; // 用于处理 GeoTIFF 文件
import {toLonLat} from "ol/proj"; // OpenLayers 工具函数：将坐标从投影转换为经纬度
import olUtils from "@/utils/olUtils.js"; // OpenLayers 相关工具
import {Overlay} from "ol"; // OpenLayers Overlay，用于创建地图弹窗
import {useImgLayer} from "@/hooks/useImgLayer.js"; // 自定义钩子，用于操作影像图层

// 注入地图实例
const map = inject('map');

// 定义影像图层的引用
const imgLayer = ref(null);

// 解构钩子返回的操作函数
const {createLayer, setImgLayer, removeImgLayer, setImgLayerOpacity} = useImgLayer(imgLayer);

// 创建上海区域的矢量图层，并设置样式
const shangHaiLayerVector = useCreateVectorLayer(
    DemonstrationZoneGeoJson,
    stylesMap.shStyle,
    716
);

// 定义弹窗的相关引用
const overlay = ref(null); // 弹窗实例
const popupCom = ref(null); // 弹窗 DOM 元素引用
const value = ref(0); // 用于显示弹窗中的值

// 创建弹窗 Overlay
const creatPopup = () => {
  overlay.value = new Overlay({
    element: popupCom.value, // 绑定到弹窗 DOM 元素
    autoPan: true, // 自动平移地图以显示弹窗
    autoPanAnimation: {
      duration: 250, // 平移动画持续时间
    },
  });
  overlay.value.setPosition(null); // 初始化弹窗位置为空
  map.value.addOverlay(overlay.value); // 将弹窗添加到地图中
};

// TIFF 文件路径
const tifFile = new URL('@/assets/data/VEQI_SFQ_M_202405.tif', import.meta.url).href;

// 加载 TIFF 文件并监听鼠标移动事件
const loadTIFF = async (url) => {
  const tiff = await fromUrl(url); // 加载 TIFF 文件
  const image = await tiff.getImage(); // 获取 TIFF 图像
  const rasters = await image.readRasters(); // 读取栅格数据
  const [gx1, gy1, gx2, gy2] = image.getBoundingBox(); // 获取图像的边界
  const {ModelPixelScale: s, ModelTiepoint: t} = image.fileDirectory; // 获取像素比例和配准点
  let [sx, sy] = s; // 像素的水平和垂直分辨率
  let [px, py, k, gx, gy, gz] = t; // 地理配准点

  // 调整 Y 方向的比例
  sy = -sy;

  // 地理坐标到像素坐标的转换矩阵
  const gpsToPixel = [-gx / sx, 1 / sx, 0, -gy / sy, 0, 1 / sy];

  // 变换函数：将地理坐标转换为像素坐标
  const transform = (a, b, M, roundToInt = false) => {
    const round = (v) => (roundToInt ? v | 0 : v);
    return [
      round(M[0] + M[1] * a + M[2] * b),
      round(M[3] + M[4] * a + M[5] * b),
    ];
  };

  // 创建 Canvas，用于渲染 TIFF 数据
  const canvas = document.createElement('canvas');
  canvas.width = image.getWidth(); // 设置宽度
  canvas.height = image.getHeight(); // 设置高度
  const ctx = canvas.getContext('2d'); // 获取绘图上下文

  // 创建图像数据容器
  const imageData = ctx.createImageData(image.getWidth(), image.getHeight());
  const rgba = imageData.data; // RGBA 数据
  const samplesPerPixel = image.getSamplesPerPixel(); // 每像素的样本数

  // 遍历栅格数据，根据样本数渲染图像
  for (let i = 0, j = 0; i < rasters[0].length; i++, j += 4) {
    if (samplesPerPixel === 1) {
      // 灰度图像
      const value = rasters[0][i];
      rgba[j] = value;     // 红色通道
      rgba[j + 1] = value; // 绿色通道
      rgba[j + 2] = value; // 蓝色通道
      rgba[j + 3] = 255;   // Alpha 通道
    } else if (samplesPerPixel === 3) {
      // RGB 图像
      rgba[j] = rasters[0][i];     // 红色通道
      rgba[j + 1] = rasters[1][i]; // 绿色通道
      rgba[j + 2] = rasters[2][i]; // 蓝色通道
      rgba[j + 3] = 255;           // Alpha 通道
    } else {
      throw new Error(`不支持的样本数: ${samplesPerPixel}`); // 抛出错误
    }
  }

  ctx.putImageData(imageData, 0, 0); // 将图像数据渲染到 Canvas

  // 将 Canvas 转换为 base64 编码的 PNG
  const imageUrl = canvas.toDataURL('image/png');

  // 创建图层并设置影像数据及边界
  createLayer();
  setImgLayer(imageUrl, [gx1, gy1, gx2, gy2]);

  // 添加鼠标移动监听事件
  map.value.on(
      "pointermove",
      olUtils.throttle(async (evt) => {
        // 检查鼠标位置是否在指定图层上
        const features = map.value.getFeaturesAtPixel(evt.pixel, {
          layerFilter: (layer) => layer === shangHaiLayerVector.value,
        });

        // 如果鼠标不在目标图层上，则隐藏弹窗
        if (!features || features.length === 0) {
          overlay.value.setPosition(undefined);
          return;
        }

        // 获取鼠标的地理坐标
        const coordinate = toLonLat(evt.coordinate);
        overlay.value.setPosition(evt.coordinate); // 设置弹窗位置

        // 转换坐标到像素值
        const [x, y] = transform(
            coordinate[0].toFixed(4),
            coordinate[1].toFixed(4),
            gpsToPixel,
            true
        );

        // 计算对应栅格值
        const {width, [0]: raster} = rasters;
        const elevation = raster[x + y * width] || "N/A";

        // 如果栅格值有效，更新弹窗内容
        if (elevation && elevation !== -999) value.value = elevation;
        console.log(
            `The elevation at (${coordinate[0].toFixed(4)}, ${coordinate[1].toFixed(4)}) is ${elevation}m`
        );
      }, 0) // 节流延迟设置为 100ms
  );
};

// 关闭弹窗
const closePopup = () => {
  overlay.value.setPosition(undefined); // 隐藏弹窗
};

// 生命周期钩子
onMounted(async () => {
  await nextTick(); // 等待 DOM 更新
  map.value.addLayer(shangHaiLayerVector.value); // 添加矢量图层到地图
  creatPopup(); // 创建弹窗
  await loadTIFF(tifFile); // 加载 TIFF 数据
});
</script>

<template>
  <!-- 弹窗容器 -->
  <div ref="popupCom" class="popup">
    <div class="content">
      <div>{{ value }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.popup {
  width: 150px;
  height: 100px;
  background: #09354c;
  position: absolute;
  top: -115px;
  left: -75px;
  box-sizing: border-box;
  border-radius: 10px;
  padding: 10px;

  &::after {
    content: '';
    display: block;
    position: absolute;
    width: 20px;
    height: 20px;
    background: #09354c;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }

  .content {
    color: #ffffff;
    margin-top: 5px;
    text-align: left;
    margin-left: 8px;
  }
}
</style>

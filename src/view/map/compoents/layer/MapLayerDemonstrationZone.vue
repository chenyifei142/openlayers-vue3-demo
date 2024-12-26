<script setup>
// 引入 Vue 相关方法及工具函数
import {inject, nextTick, onMounted, ref} from "vue";
import {useCreateVectorLayer} from "@/hooks/useMap.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import DemonstrationZoneGeoJson from "@/assets/json/DemonstrationZone.js";
import {fromUrl} from "geotiff";
import {toLonLat} from "ol/proj";
import olUtils from "@/utils/olUtils.js";
import {Overlay} from "ol";

const map = inject('map');
const shangHaiLayerVector = useCreateVectorLayer(
    DemonstrationZoneGeoJson,
    stylesMap.shStyle,
    716
);
const overlay = ref(null);
const popupCom = ref(null);
const value = ref(0);

// 创建弹窗
const creatPopup = () => {
  overlay.value = new Overlay({
    element: popupCom.value,
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  });
  overlay.value.setPosition(null);
  map.value.addOverlay(overlay.value);
};

// TIFF 文件路径
const tifFile = new URL('@/assets/data/VEQI_SFQ_M_202405.tif', import.meta.url).href;

// 加载 TIFF 文件并监听鼠标移动事件
const loadTIFF = async (url) => {
  const tiff = await fromUrl(url);
  const image = await tiff.getImage();
  const {ModelPixelScale: s, ModelTiepoint: t} = image.fileDirectory;
  let [sx, sy] = s;
  let [px, py, k, gx, gy, gz] = t;
  sy = -sy;

  const gpsToPixel = [-gx / sx, 1 / sx, 0, -gy / sy, 0, 1 / sy];

  const transform = (a, b, M, roundToInt = false) => {
    const round = (v) => (roundToInt ? v | 0 : v);
    return [
      round(M[0] + M[1] * a + M[2] * b),
      round(M[3] + M[4] * a + M[5] * b),
    ];
  };

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

        const coordinate = toLonLat(evt.coordinate);
        overlay.value.setPosition(evt.coordinate);

        const [x, y] = transform(
            coordinate[0].toFixed(4),
            coordinate[1].toFixed(4),
            gpsToPixel,
            true
        );

        const rasters = await image.readRasters();
        const {width, [0]: raster} = rasters;
        const elevation = raster[x + y * width] || "N/A";

        if (elevation && elevation !== -999) value.value = elevation;
        console.log(
            `The elevation at (${coordinate[0].toFixed(4)}, ${coordinate[1].toFixed(4)}) is ${elevation}m`
        );
      }, 0) // 节流延迟设置为 100ms
  );
};

const closePopup = () => {
  overlay.value.setPosition(undefined);
};

// 生命周期钩子
onMounted(async () => {
  await nextTick();
  map.value.addLayer(shangHaiLayerVector.value);
  creatPopup();
  await loadTIFF(tifFile);
});
</script>

<template>
  <!-- 弹窗容器 -->
  <div ref="popupCom" class="popup">
<!--    <span class="icon-close" @click="closePopup">✖</span>-->
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

  .icon-close {
    position: absolute;
    top: 0;
    right: 8px;
    cursor: pointer;
    color: #ffffff;
  }

  .content {
    color: #ffffff;
    margin-top: 5px;
    text-align: left;
    margin-left: 8px;
  }
}
</style>

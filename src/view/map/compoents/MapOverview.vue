<script setup>
import {inject, nextTick, onMounted} from "vue";
import TileLayer from "ol/layer/Tile";
import {XYZ} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import Overview from 'ol-ext/control/Overview';
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import ShangHaiGeoJson from '@/assets/json/ShangHai.js'

const map = inject('map')
const createBaseTile = () => {
  let mapUrl = 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}';
  return new TileLayer({
    source: new XYZ({
      url: mapUrl,
      crossOrigin: "anonymous", // 加载图像的 crossOrigin 属性。
    }),
  });
}


const createOverviewMapControl = () => {
  //鹰眼的底图图层
  const base_layer = createBaseTile();

  //VectorLayer矢量图层
  //长三角图层
  const csj_layerVector = new VectorLayer({
    source: new VectorSource({features: []}), // 来源
    zIndex: 716,
  });
  map.value.addLayer(csj_layerVector)

  getMapData_ZXCQJJQ(csj_layerVector)
  console.log(csj_layerVector, "ssssssssss")
  // 添加图层
  const layersOVMap = [base_layer, csj_layerVector];

  const ov = new Overview({
    layers: layersOVMap,
    projection: "EPSG:3857",
    minZoom: 0,
    maxZoom: 8,
    rotation: false,
    align: "bottom-right",
    panAnimation: false,
    style: [new Style({
      image: new CircleStyle({
        fill: new Fill({
          color: 'rgba(247, 12, 12, 1)'
        }),
        stroke: new Stroke({
          width: 2,
          color: 'rgba(247, 12, 12, 1)'
        }),
        radius: 5
      }),
      stroke: new Stroke({
        width: 2,
        color: "rgba(247, 12, 12, 1)",
        lineDash: [3, 3]
      })
    })]

  });
  map.value.addControl(ov)
}
//中心城区级郊区图层【全市】【联动图层】
const getMapData_ZXCQJJQ = (vector) => {
  console.log(ShangHaiGeoJson, "ShangHaiGeoJson")
  for (let i = 0; i < ShangHaiGeoJson.features.length; i++) {
    let featureArr = readFeatures(ShangHaiGeoJson.features[i]);
    vector.getSource().addFeatures(featureArr);
  }
}
/**
 * 读取geo json 数据
 * @returns {*}
 */
const readFeatures = (geoJson) => {
  return new GeoJSON().readFeatures(
      geoJson, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      }
  );
}

onMounted(async () => {
  await nextTick(() => {
    createOverviewMapControl()
  })
})
</script>

<template>

</template>

<style scoped>

</style>
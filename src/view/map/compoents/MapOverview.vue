<script setup>
import {inject, nextTick, onMounted} from "vue";
import Overview from 'ol-ext/control/Overview';
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import ChangJiangDeltaGeoJson from "@/assets/json/ChangjiangDelta.js";
import stylesMap from "@/view/map/compoents/style/stylesMap.js";
import {useCreateVectorLayer} from "@/hooks/useMap.js";
import shanghaiDistrictGeoJson from "@/assets/json/ShanghaiDistrict.js";

const map = inject('map')
const csj_layerVector = useCreateVectorLayer(ChangJiangDeltaGeoJson, stylesMap.csjStyle, 716)
const sq_layerVector = useCreateVectorLayer(shanghaiDistrictGeoJson, stylesMap.shStyle, 807)

const createOverviewMapControl = () => {
  const layersOVMap = [csj_layerVector.value, sq_layerVector.value];
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

onMounted(async () => {
  await nextTick(() => {
    createOverviewMapControl()
  })
})
</script>

<template>

</template>

<style>
@import "@/assets/style/ol-ext.css";

.ol-control.ol-overview {
  background: rgba(0, 160, 219, 0.2);
  bottom: 77px;
  /* left: 10px; */
  left: auto;
  right: 10px;
}

.ol-control.ol-overview .panel {
  background-color: transparent !important;
}

.ol-control button {
  background-color: rgba(0, 60, 136, 0.5);
}
</style>

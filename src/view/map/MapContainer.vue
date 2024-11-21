<script setup>
import "ol/ol.css";
import {provide} from "vue";
import MapMousePosition from "@/view/map/compoents/MapMousePosition.vue";
import MapOverview from "@/view/map/compoents/MapOverview.vue";
import {useMap} from "@/hooks/useMap.js";
import ExtentBtnCIEE from "@/view/map/compoents/extent-btn/ExtentBtnCIEE.vue";
import ElementRadar from "@/view/map/compoents/element-btn/ElementRadar.vue";
import MapLayerYangtzeRiverDelta from "@/view/map/compoents/layer/MapLayerYangtzeRiverDelta.vue";
import MapLayerShanghaiDistrict from "@/view/map/compoents/layer/MapLayerShanghaiDistrict.vue";
import MapAreaNameBtn from "@/view/map/compoents/html-element/MapAreaNameBtn.vue";
import MapLayerAreaRisk from "@/view/map/compoents/layer/MapLayerAreaRisk.vue";
import MapLayerPressure from "@/view/map/compoents/layer/MapLayerPressure.vue";
import MapLayerPointAggregation from "@/view/map/compoents/layer/MapLayerPointAggregation.vue";
import ElementTyphoonBtn from "@/view/map/compoents/element-btn/ElementTyphoonBtn.vue";
import ElementShpBtn from "@/view/map/compoents/element-btn/ElementShpBtn.vue";
import MapLegend from "@/view/map/compoents/html-element/MapLegend.vue";
import ColorSelectDrawer from "@/components/ColorSelectDrawer.vue";
import ElementWindBtn from "@/view/map/compoents/element-btn/ElementWindBtn.vue";

const map = useMap()
// 将 map 对象提供给子组件
provide('map', map);

</script>

<template>
  <div id="map" class="map">
    <!--地图鼠标移动显示定位-->
    <MapMousePosition/>
    <!--地图概览控件-->
    <MapOverview/>
    <!--长三角流域区域显示-->
    <MapLayerYangtzeRiverDelta/>
    <!--上海区县显示-->
    <MapLayerShanghaiDistrict/>
    <!--静安区风险填色图层-->
    <MapLayerAreaRisk/>
    <!--等压线图层-->
    <MapLayerPressure/>
    <!--点聚合图层-->
    <MapLayerPointAggregation/>
    <!--地区返回按钮-->
    <MapAreaNameBtn/>
    <!--进博会-->
    <ExtentBtnCIEE/>
    <!--雷达按钮-->
    <ElementRadar/>
    <!--台风路径-->
    <ElementTyphoonBtn/>
    <!--风场粒子-->
    <ElementWindBtn/>
    <!--色斑图-->
    <ElementShpBtn/>
    <!--图例-->
    <div class="custom-legend-wrap" id="custom-legend-wrap" style="padding-bottom: 62px">
      <MapLegend type="temp" init-active/>
    </div>
    <!--颜色选择-->
    <ColorSelectDrawer/>
  </div>
</template>

<style lang="scss">
@import "@/assets/style/ol-ext.css";

.map {
  width: 100vw;
  height: 100vh;
}
</style>

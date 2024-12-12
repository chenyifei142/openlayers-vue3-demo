import {onMounted, ref} from "vue";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import olUtils from "@/utils/olUtils.js";
import {fromLonLat} from "ol/proj";
import Map from "ol/Map";
import View from "ol/View";
import mapConstants from "@/constants/map.constants.js";
import * as olControl from "ol/control";
import * as olInteraction from "ol/interaction";
import {Overlay} from "ol";
import TileLayer from "ol/layer/Tile.js";
import {XYZ} from "ol/source.js";

/**
 * 创建初始话地图
 * @returns {Ref<UnwrapRef<null>>}
 */
export const useMap = () => {
    const map = ref(null);
    const overlayPopup = ref(null);

    const initMap = () => {
        map.value = new Map({
            layers: [
                // new TileLayer({
                //     source: new XYZ({
                //         url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                //         crossOrigin: "anonymous",
                //         tileLoadFunction: function (imageTile, src) {
                //             // 使用滤镜 将白色修改为深色
                //             const img = new Image();
                //             // img.crossOrigin = ''
                //             // 设置图片不从缓存取，从缓存取可能会出现跨域，导致加载失败
                //             img.setAttribute("crossOrigin", "anonymous");
                //             img.onload = function () {
                //                 const canvas = document.createElement("canvas");
                //                 const w = img.width;
                //                 const h = img.height;
                //                 canvas.width = w;
                //                 canvas.height = h;
                //                 const context = canvas.getContext("2d");
                //                 context.filter = "grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)";
                //                 context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
                //                 imageTile.getImage().src = canvas.toDataURL("image/png");
                //             };
                //             img.src = src;
                //         }
                //     }),
                //     visible: true
                // })
            ],
            view: new View({
                center: fromLonLat(mapConstants.CENTER), // 设置地图中心
                zoom: 4, // 初始缩放等级
                // zoom: 4, // 初始缩放等级
                projection: 'EPSG:3857', // 投影方式 默认为'EPSG：3857'
                maxZoom: 18, // 最大缩放等级
                minZoom: 4, // 最小缩放等级
            }),
            target: 'map', // 地图容器的 ID
            controls: olControl.defaults({
                attribution: false, // 不显示版权信息
                rotate: false, // 不允许旋转
                zoom: true, // 显示缩放控件
                zoomOptions: {delta: 5}, // 缩放控件的步长
            }),
            interactions: olInteraction.defaults({
                doubleClickZoom: false, // 禁用双击缩放
                pinchRotate: false, // 禁用触摸旋转
            }),
        });
    };

    // 鼠标滑过的事件绑定
    const bindEventPointerMove = () => {
        map.value.on("pointermove", olUtils.throttle((evt) => {
            // 地图当前是否正在被拖动 是返回
            if (evt.dragging) return;
            // 获取单击事件发生时的位置，以像素为单位
            const pixel = map.value.getEventPixel(evt.originalEvent);
            // 检查单击位置是否存在要素
            const hit = map.value.hasFeatureAtPixel(pixel);
            // 获取渲染此地图的目标
            const mapTarget = document.getElementById(map.value.getTarget());

            if (hit) {
                mapTarget.style.cursor = "default";

                // map.forEachFeatureAtPixel 检测与视区中像素相交的特征，并对每个相交的特征执行回调
                // 第一个参数为像素
                // 第二个参数为功能回调， 第一个参数是像素处的一个特征或渲染特征，第二个参数是特征层，对于非托管层为空。若要停止检测，回调函数可以返回一个真实的值。
                const [feature, layer] = map.value.forEachFeatureAtPixel(pixel, (feature, layer) => {
                    return [feature, layer];
                });

                //不存在要素或是图层不处理，后续可能需要根据业务进行修改
                if (!feature || !layer) return;

                if (layer.getProperties().featureMouseoverFn) {
                    layer.getProperties().featureMouseoverFn(feature, evt);
                }
                const flag = layer.getProperties().isCommonPopup ||
                    feature.getProperties().clickFn ||
                    layer.getProperties().featureClickFn ||
                    layer.getProperties().featureMouseoverFn;
                if (flag) {
                    mapTarget.style.cursor = "pointer";
                }
            } else {
                mapTarget.style.cursor = "";
                //todo 待整理代码
                const label_id = "map_overlay_rainpopup_label_single"; //单显示
                const map_overlay_rainpopup_label = map.value.getOverlayById(label_id);
                if (map_overlay_rainpopup_label) {
                    map.value.removeOverlay(map_overlay_rainpopup_label);
                }
            }
        }, 300)); // 节流延迟设置为100ms
    };

    // 单击事件的绑定
    const bindEventPointerClick = () => {
        // 创建弹窗容器
        const overlayPopupContainer = document.createElement("div");
        overlayPopupContainer.className = "ol-popup"; // 设置弹窗容器的样式类名
        overlayPopupContainer.id = "map-popup"; // 设置弹窗容器的ID

        // 创建关闭按钮
        const overlayPopupCloser = document.createElement("a");
        overlayPopupCloser.className = 'ol-popup-closer'; // 设置关闭按钮的样式类名
        overlayPopupCloser.href = "#"; // 设置关闭按钮的链接地址为空

        // 创建弹窗内容容器
        const overlayPopupContent = document.createElement("div");
        overlayPopupContent.id = "map-popup-content"; // 设置弹窗内容容器的ID

        // 将关闭按钮和内容容器添加到弹窗容器中
        overlayPopupContainer.appendChild(overlayPopupCloser);
        overlayPopupContainer.appendChild(overlayPopupContent);

        // 创建Overlay对象
        const overlayPopup = new Overlay({
            id: 'commonOverlay',
            element: overlayPopupContainer, // 设置叠加元素为创建的弹窗容器
            autoPan: false, // 不自动平移以确保覆盖图完全可见
            autoPanAnimation: {
                duration: 250, // 设置动画持续时间为250毫秒
            },
        });
        overlayPopup.value = overlayPopup;

        // 设置关闭按钮的点击事件
        overlayPopupCloser.onclick = function () {
            // 如果有绑定关闭图层后的事件，则执行
            if (overlayPopup.popupCloseFn) {
                overlayPopup.popupCloseFn();
            }
            overlayPopup.popupCloseFn = null;
            overlayPopup.setPosition(undefined); // 隐藏弹窗
            overlayPopupCloser.blur();
            return false;
        };

        // 将Overlay添加到地图中
        map.value.addOverlay(overlayPopup.value);

        // 设置地图的单击事件
        map.value.on("singleclick", (evt) => {
            /**
             * 获取 点击的坐标
             * map.getEventPixel(evt.originalEvent) 获取单击事件发生时的位置，以像素为单位。
             */
            const pixel = map.value.getEventPixel(evt.originalEvent);
            // map.hasFeatureAtPixel(pixel) 检查单击位置是否存在要素
            const hit = map.value.hasFeatureAtPixel(pixel);
            if (!hit) return;

            // 修改弹出层所在的div，解决层级问题
            const overlayContainer = document.querySelector('.ol-overlaycontainer-stopevent');
            if (overlayContainer) overlayContainer.style.zIndex = 9999999;

            // 遍历单击位置处的所有要素，并返回第一个要素和其所属的图层
            const [feature, layer] = map.value.forEachFeatureAtPixel(pixel, (feature, layer) => {
                return [feature, layer];
            });
            // 如果不存在要素或图层，不处理
            if (!feature || !layer) return;

            let pointClickFn;
            // 判断是否为通用图层
            if (layer.getProperties().isCommonPopup) {
                pointClickFn = createPopupHtml(feature);
                feature.setProperties({
                    popupType: layer.getProperties().popupType,
                });
            } else {
                // 查找feature或者layer里是否含有点击的方法
                pointClickFn = feature.getProperties().clickFn || layer.getProperties().featureClickFn;
            }

            // 如果没有相关的弹出操作，直接返回
            if (!pointClickFn) return;

            // 调用自定义方法，判断是否生成弹出层，如果返回对象则进行处理
            const rs = pointClickFn(feature, evt);
            if (!rs) return;

            // 设置容器样式
            const containerClass = rs.containerClass;
            if (containerClass) overlayPopupContainer.className = "ol-popup " + containerClass;
            else overlayPopupContainer.className = "ol-popup";

            // 设置显示的内容
            overlayPopupContent.innerHTML = rs.popupHtml;

            // 获取特性的默认几何图形的坐标
            const coordinates = feature.getGeometry().getCoordinates();
            // 设置弹窗位置
            if (coordinates && coordinates.length && !Array.isArray(coordinates[0])) {
                overlayPopup.setPosition(coordinates);
            } else {
                overlayPopup.setPosition(evt.coordinate);
            }

            // 如果有绑定事件，绑定到overlayPopup中执行
            const popupCloseFn = feature.getProperties().popupCloseFn || layer.getProperties().popupCloseFn;
            if (popupCloseFn) overlayPopup.popupCloseFn = popupCloseFn;
        });
    };

    const closeOverlay = () => {
        overlayPopup.value && overlayPopup.value.setPosition(undefined);
    };

    const createPopupHtml = (feature) => {
        const properties = feature.getProperties();
        const popupData = properties.value.popupData;
        let popupHtml = "";
        let containerClass = "";
        if (popupData) {
            //popupType 目前仅有 ''、'detail'两种， 区别在于弹窗的样式不同
            if (properties.popupType && properties.popupType == 'detail') {
                containerClass = 'map-popup-normalPoint map-popup-normalDetailPoint';
                popupHtml += '<div id="popup-sitepoint" class="popup-sitepoint popup-normalPoint">';
                popupData.forEach((val) => {
                    popupHtml += "<div class='layui-form-item'>" +
                        "<div class='layui-form-label'>" + val.name + "：</div>" +
                        "<div class='layui-input-block'>" + (val.value || '-') + "</div></div>";
                });
                popupHtml += "</div>";
            } else {
                containerClass = 'map-popup-sm map-popup-normalPoint';
                popupHtml += '<div id="popup-sitepoint" class="popup-sitepoint popup-normalPoint map-popup-WGRXPoint">';
                popupData.forEach((val) => {
                    popupHtml += "<b>" + (val.name ? val.name + '：' : '') + "</b>" + "<code>" + (val.value || '-') + "</code><br/>";
                });
                popupHtml += "</div>";
            }
        }
        return {
            containerClass: containerClass,
            popupHtml: popupHtml,
        };
    };

    onMounted(() => {
        initMap(); // 初始化地图
        bindEventPointerMove(); // 绑定鼠标移动事件
        bindEventPointerClick(); // 绑定鼠标点击事件
    });

    return map;
};


/**
 * 创建矢量图层并添加片区名字标注
 * @param {Object} geoJson - GeoJSON数据
 * @param {Object} style - 矢量图层样式
 * @param {Number} zIndex - 图层叠放次序
 * @returns {Object} - 矢量图层
 */
// 创建矢量图层
export const useCreateVectorLayer = (geoJson, style, zIndex) => {
    const layer = ref(null);
    layer.value = new VectorLayer({
        source: new VectorSource({features: []}),
        style: style,
        zIndex: zIndex,
    });

    olUtils.addFeaturesByUrl(layer.value, geoJson); // 通过 URL 添加特性

    return layer;
}


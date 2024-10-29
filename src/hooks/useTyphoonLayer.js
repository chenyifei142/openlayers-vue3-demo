import {inject, ref} from "vue";
import VectorLayer from "ol/layer/Vector";
import {Overlay} from "ol";
import * as olProj from "ol/proj";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {LineString} from "ol/geom";
import {WKT} from "ol/format";

// 自定义台风图层钩子函数，主要功能为创建并绘制台风路径、实时位置和风圈
export const useTyphoonLayer = (options) => {
    // 获取在全局注入的地图实例，便于操作地图中的图层
    const map = inject("map");

    // 保存台风路径点的数据，用于绘制路径
    const points = ref([]);

    // 引用台风路径图层，用于绘制和更新台风路径
    const TyphoonLayer = ref(null);

    // 主函数：在地图上绘制台风图层，包括路径、标签和实时位置
    const drawTyphoonLayer = () => {
        processPoints(); // 初始化台风路径数据
        if (!points.value || points.value.length === 0) return; // 无有效数据时退出

        addCurrentMarker(); // 添加实时位置覆盖物
        createTyphoonLayer(); // 创建台风路径图层
        addLabel(options.baseInfo.tfbh + options.baseInfo.name, points.value[0].lon, points.value[0].lat); // 添加标签
        animateTyphoonPath(); // 启动路径动画
    };

    // 处理和初始化台风数据点，确保 `points` 中包含台风路径点的信息
    const processPoints = () => {
        points.value = options.data || []; // 若无数据，默认空数组
    };

    // 创建台风路径图层，将台风路径绘制到地图上
    const createTyphoonLayer = () => {
        TyphoonLayer.value = new VectorLayer({
            source: new VectorSource({features: []}), // 初始化数据源为空
            zIndex: 2019 // 设置图层的叠放次序
        });
        map.value.addLayer(TyphoonLayer.value); // 将图层添加到地图上
    };

    // 创建并添加实时位置的覆盖物（具有旋转动画效果的台风图标）
    const markerTyphoon = ref(null);
    const addCurrentMarker = () => {
        const html = document.createElement("div"); // 创建图标容器
        html.className = "iconfont icon-typhoon-g06 typhoon_marker ani_rotate360"; // 添加样式和旋转动画类
        markerTyphoon.value = new Overlay({
            id: "overlay_marker_" + options.baseInfo.tfbh, // 设置唯一ID
            position: [],
            positioning: "center-center", // 定位点在图标中心
            element: html, // 绑定HTML元素
            stopEvent: false // 允许事件穿透覆盖物
        });
        map.value.addOverlay(markerTyphoon.value); // 添加到地图覆盖物中
    };

    // 添加台风标签，用于标识台风名称和编号
    const label = ref({});
    const addLabel = (name, lon, lat, fontSize = "13px") => {
        const html = document.createElement("div"); // 创建标签容器
        html.style.height = "47px";
        html.style.width = "106px";
        html.innerHTML = `
            <div class='typhoon_label' style='font-size:${fontSize}; text-align:center; position:absolute; top:16px; width:114px; color:${getLabelColor(name)}; text-shadow: 1px 1px 1px #555;'>
                ${name}
            </div>`; // 设置标签内容、样式和颜色

        label.value[name] = new Overlay({
            id: "overlay_label_" + name, // 唯一ID
            position: olProj.fromLonLat([+lon, +lat]), // 标签位置，使用经纬度转换
            positioning: "center-left", // 标签靠左显示
            element: html, // 绑定HTML元素
            stopEvent: false // 允许事件穿透
        });
        map.value.addOverlay(label.value[name]); // 添加标签到地图
    };

    // 动态绘制台风路径，逐点动画显示路径点和连线
    const animateTyphoonPath = () => {
        const typhoonSource = TyphoonLayer.value.getSource();
        typhoonSource.clear(); // 清空上一次的路径以便重新绘制

        let currentIndex = 0; // 当前绘制到的路径点索引
        let delay = 500; // 初始延迟，控制动画速度，逐步减小实现加速

        // 递归绘制下一个路径点及其连线
        const drawNextSegment = () => {
            if (currentIndex >= points.value.length) return; // 超出路径点则停止绘制

            // 1. 绘制当前台风点
            const point = points.value[currentIndex]; // 当前路径点数据
            const pointFeature = new Feature({
                geometry: new Point(olProj.fromLonLat([+point.lon, +point.lat])) // 创建点特性
            });
            pointFeature.setStyle(new Style({
                image: new CircleStyle({
                    fill: new Fill({color: getTyphoonPointColor(point.speed)}), // 设置颜色取决于台风速度
                    stroke: new Stroke({color: "rgba(255,255,255,0.01)", width: 12}), // 半透明边框
                    radius: 4 // 设置点的半径
                })
            }));
            typhoonSource.addFeature(pointFeature); // 将点添加到图层数据源中

            // 2. 如果不是第一个点，则与前一个点连线
            if (currentIndex > 0) {
                const prevPoint = points.value[currentIndex - 1];
                const lineFeature = new Feature({
                    geometry: new LineString([
                        olProj.fromLonLat([+prevPoint.lon, +prevPoint.lat]), // 起点
                        olProj.fromLonLat([+point.lon, +point.lat]) // 终点
                    ])
                });
                lineFeature.setStyle(new Style({
                    stroke: new Stroke({
                        color: getTyphoonPointColor(Math.min(point.speed, prevPoint.speed)), // 设置线的颜色
                        width: 1 // 线宽
                    })
                }));
                typhoonSource.addFeature(lineFeature); // 将线添加到图层数据源
            }

            // 3. 更新台风实时位置和风圈覆盖层
            if (markerTyphoon.value) {
                markerTyphoon.value.setPosition(olProj.fromLonLat([+point.lon, +point.lat])); // 更新实时位置
                addWindCircleLayer(point); // 添加或更新风圈覆盖层
            }

            currentIndex++; // 增加索引，绘制下一个点
            delay = Math.max(100, delay * 0.9); // 逐步减小延迟
            setTimeout(drawNextSegment, delay); // 递归调用，产生动画效果
        };

        drawNextSegment(); // 开始绘制路径
    };

    // 添加风圈（如7级、10级、12级风圈）的覆盖层，表示台风影响范围
    const typhoonWindCircleLayer = ref({});
    const addWindCircleLayer = (point) => {
        [7, 10, 12].forEach(level => addWindCircle(level, point)); // 针对每种风圈级别调用
    };

    // 添加或更新特定风圈级别的覆盖层
    const addWindCircle = (level, point) => {
        const layerName = level + "CircleLayer"; // 图层名称
        const radiusStrokeColor = getWindCircleColorByLevel(level); // 根据风圈级别获取颜色
        const radiusFillColor = `rgba(${radiusStrokeColor.join(",")},0.2)`; // 半透明填充色

        const distances = {
            SE: point[`southeast${level}`] || 0,
            NE: point[`northeast${level}`] || 0,
            NW: point[`northwest${level}`] || 0,
            SW: point[`southwest${level}`] || 0
        }; // 获取各方向的风圈半径，默认值为0

        const centerMercator = olProj.fromLonLat([+point.lon, +point.lat]); // 转换中心坐标
        const wktPointArr = [];

        // 根据角度绘制风圈边界
        for (let i = 0; i <= 360; i++) {
            const _r = calculateWindRadius(i, distances) * 1000; // 将公里转换为米
            const [x, y] = calculateDestination(centerMercator, _r, i); // 计算每个角度的边界点
            wktPointArr.push(`${x} ${y}`); // 添加到边界数组
        }

        // 生成风圈图形的WKT格式
        const WKTData = `POLYGON((${wktPointArr.join(",")}))`;

        // 如果图层已存在，更新其图形
        if (typhoonWindCircleLayer.value[layerName]) {
            typhoonWindCircleLayer.value[layerName].getGeometry().setCoordinates(new WKT().readGeometry(WKTData).getCoordinates());
        } else {
            // 若无图层，创建新图层并添加到台风图层数据源
            const feature = new Feature(new WKT().readGeometry(WKTData));
            feature.setStyle(new Style({
                fill: new Fill({color: radiusFillColor}), // 填充色
                stroke: new Stroke({color: `rgb(${radiusStrokeColor.join(",")})`, width: 0.5}) // 轮廓色
            }));
            TyphoonLayer.value.getSource().addFeature(feature); // 将风圈图层加入台风图层
            typhoonWindCircleLayer.value[layerName] = feature;
        }
    };

    // 获取标签颜色
    const getLabelColor = (source) => {
        switch (source) {
            case "上海中心气象台":
                return "#ff9900";
            case "中央气象台":
                return "#43FF4B";
            case "日本气象厅":
                return "#ff0000";
            case "美国":
                return "#ffff00";
            default:
                return "#ccc";
        }
    };

    // 计算风圈半径：根据方向和风圈半径距离生成边界点
    const calculateWindRadius = (angle, distances) => {
        if (angle < 90) return distances.SE;
        if (angle < 180) return distances.SW;
        if (angle < 270) return distances.NW;
        return distances.NE;
    };

    // 计算指定距离和角度处的点坐标
    const calculateDestination = ([lon, lat], radius, angle) => {
        const rad = (angle * Math.PI) / 180;
        return [lon + radius * Math.cos(rad), lat + radius * Math.sin(rad)];
    };

    // 获取风圈颜色（依级别），返回RGB数组
    const getWindCircleColorByLevel = (level) => {
        switch (level) {
            case 7:
                return [0, 213, 203];
            case 10:
                return [253, 174, 13];
            case 12:
                return [251, 59, 0];
            default:
                return [0, 0, 0];
        }
    };

    // 根据台风点风速选择颜色
    const getTyphoonPointColor = (value) => {
        return value >= 50 ? "#f71f4b" : value >= 40 ? "#fc7923" : value >= 32 ? "#ffc909" : value >= 25 ? "#01aef0" : "#53f63d";
    };

    // 销毁台风图层并清理资源
    const destroyTyphoonLayer = () => {
        points.value = []; // 清空路径点
        TyphoonLayer.value && map.value.removeLayer(TyphoonLayer.value); // 删除路径图层
        TyphoonLayer.value = null; // 重置路径图层
        Object.keys(label.value).forEach(name => map.value.removeOverlay(label.value[name])); // 清除所有标签
        Object.keys(typhoonWindCircleLayer.value).forEach(layerName => map.value.removeLayer(typhoonWindCircleLayer.value[layerName])); // 清除所有风圈图层
        markerTyphoon.value && map.value.removeOverlay(markerTyphoon.value); // 清除台风实时位置标记
    };

    // 返回核心功能，以供外部调用
    return {drawTyphoonLayer, destroyTyphoonLayer};
};

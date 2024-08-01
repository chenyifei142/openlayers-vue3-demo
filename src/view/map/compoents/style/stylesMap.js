import {Fill, Stroke, Style, Icon, Text} from 'ol/style';
import CircleStyle from 'ol/style/Circle';

const page_fontSizeScale = 1;
export default {
    noborderSHStyle: new Style({
        stroke: new Stroke({
            color: [109, 246, 255, 0.0],
            width: 0.00000001,
        }),
        fill: new Fill({
            color: [0, 236, 239, 0.01],
        }),
    }),
    shStyle: new Style({
        stroke: new Stroke({
            color: [109, 246, 255, 0.7],
            width: 1,
        }),
        fill: new Fill({
            color: [0, 236, 239, 0.21],
        }),
    }),
    shHighlightStyle: new Style({
        stroke: new Stroke({
            color: [109, 246, 255, 0.8],
            width: page_fontSizeScale * 1,
        }),
        fill: new Fill({
            color: [0, 236, 239, 0.5],
        }),
    }),
    csjStyle: new Style({
        stroke: new Stroke({
            color: [109, 246, 255, 0.5],
            width: 1,
        }),
        fill: new Fill({
            color: [0, 236, 239, 0.1],
        }),
    }),
    freeTradeZoneStyle: new Style({
        stroke: new Stroke({
            color: [0, 240, 255, 1],
            width: page_fontSizeScale * 1,
        }),
        fill: new Fill({
            color: [255, 229, 153, 0.5],
        }),
    }),
    freeTradeZoneRangeLineStyle: new Style({
        stroke: new Stroke({
            color: [0, 0, 255, 1],
            width: page_fontSizeScale * 4,
        }),
        fill: new Fill({
            color: "transparent",
        }),
    }),
    gjhzzxStyle: new Style({
        stroke: new Stroke({
            color: [109, 246, 255, 1.0],
            width: 5,
        }),
        fill: new Fill({
            color: "transparent",
        }),
    }),
    shgdjtStyle: new Style({
        image: new CircleStyle({
            radius: 3,
            stroke: new Stroke({
                color: "rgba(107, 234, 255, 1)",
                width: page_fontSizeScale * 1,
            }),
            fill: new Fill({
                color: "rgba(255, 255, 255, 1)",
            }),
        }),
        stroke: new Stroke({
            color: [11, 166, 27, 1],
            width: page_fontSizeScale * 3,
        }),
        fill: new Fill({
            color: [11, 166, 27, 0],
        }),
    }),
    hiddenStyle: new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)', // 完全透明
        }),
        stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0)', // 完全透明
        }),
    }),
    pointBase: function (img) {
        return new Style({
            image: new Icon({
                opacity: 0.95,
                src: img,
            }),
            stroke: new Stroke({
                width: 1,
                color: "#3fdaff",
            }),
            fill: new Fill({color: [15, 52, 120, 0.8]}),
            text: new Text({
                text: "",
                fill: new Fill({color: "#86daff"}),
                stroke: new Stroke({color: "#86daff", width: 1}),
                offsetX: 0,
                offsetY: 0,
            })
        })
    },

}
import {nextTick, onMounted, ref} from "vue";
import {useColorConfigStore} from "@/store/useColorConfigStore.js";
import {Fill, Stroke, Style} from "ol/style";

export const useLegendCfg = (type) => {
    const colorConfigStore = useColorConfigStore();
    const config = colorConfigStore.getColorConfig(type)
    const colorAlpha = ref(1)
    // 定义色卡配置
    const colorConfig = ref([]);
    const createColorConfig = () => {
        const list = [];
        const ColorConfig = config.colorConfig

        ColorConfig.forEach(item => {
            let valueLow = +item['GT']
            let valueHigh = +item['LTE']

            list.push({
                color: `rgba(${item['R']},${item['G']},${item['B']},${colorAlpha.value})`,
                name: item['NAME'] || (config.nameOnly ? '' : valueHigh),
                min: valueLow,
                max: valueHigh
            })
        })
        colorConfig.value = list
    }

    const getTitle = () => {
        const label = config['label'];
        const unit = config['unit'];
        return label + (unit && '(' + unit + ')');
    }

    const getStartIndex = () => {
        return config.startIndex || 0;
    }

    const getStep = () => {
        return config.step || 0;
    }

    const createMapStyleFunction = () => {
        const styles = {};
        colorConfig.value.forEach(item => {
            styles[item.min] = new Style({
                stroke: new Stroke({
                    width: 1,
                    color: item.color
                }),
                fill: new Fill({
                    color: item.color
                })
            })
        })
        const keys = Object.keys(styles).sort((a, b) => Number(a) - Number(b));
        const valueKey = config.valueKey

        return function (feature) {
            const Value_Low = +feature.get(valueKey);
            let styleKey = keys.find((item) => Value_Low <= +item);

            if (!styleKey) {
                styleKey = keys[keys.length - 1];
            }
            return styles[styleKey];

        };
    }

    createColorConfig()

    return {colorConfig, getTitle, getStartIndex, getStep, createMapStyleFunction}
}

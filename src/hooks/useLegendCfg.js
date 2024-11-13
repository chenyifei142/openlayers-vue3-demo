import {computed, ref, watch} from "vue";
import {useColorConfigStore} from "@/store/useColorConfigStore.js";
import {Fill, Stroke, Style} from "ol/style";

// 定义一个组合式函数 useLegendCfg，用于生成图例配置
export const useLegendCfg = (type) => {
    // 使用 Pinia 状态管理，获取 colorConfigStore 实例
    const colorConfigStore = useColorConfigStore();
    // 根据传入的类型（type）获取该类型对应的配置信息
    const config = colorConfigStore.getColorConfig(type);
    // 定义透明度参数，默认值为 1（完全不透明）
    const colorAlpha = ref(1);

    // 定义一个响应式变量 colorConfig 用于存储色卡的配置项数组
    const colorConfig = ref([]);

    // 创建色卡配置函数
    const createColorConfig = () => {
        const list = [];
        const ColorConfig = config.colorConfig; // 获取 colorConfig 配置中的色卡数组

        // 遍历色卡配置数组，将每个配置项格式化并推入 list 中
        ColorConfig.forEach(item => {
            let valueLow = +item['GT']; // 色卡下限值
            let valueHigh = +item['LTE']; // 色卡上限值
            console.log(item,"item")
            // 格式化并存储色卡配置项
            list.push({
                color: `rgba(${item['R']},${item['G']},${item['B']},${colorAlpha.value})`, // 设置 RGBA 色值
                name: item['NAME'] || (config.nameOnly ? '' : valueHigh), // 如果有 nameOnly 配置，空值显示，否则显示上限值
                min: valueLow, // 最小值
                max: valueHigh // 最大值
            });
        });

        // 将生成的色卡配置数组赋值给 colorConfig
        colorConfig.value = list;
    };

    // 监听 config 的变化，自动更新色卡配置
    watch(
        () => config.colorConfig,
        () => {
            createColorConfig(); // 当 colorConfig 更新时重新生成色卡
        },
        {deep: true} // 深度监听，以便检测对象内属性的变化
    );

    // 获取图例标题，包括标签和单位
    const getTitle = () => {
        const label = config['label'];
        const unit = config['unit'];
        return label + (unit && '(' + unit + ')'); // 返回标题格式：标签(单位)
    };

    // 获取图例的起始索引，默认为 0
    const getStartIndex = () => config.startIndex || 0;


    // 获取图例的步长，默认为 0
    const getStep = () => config.step || 1;

    // 创建地图样式函数，用于根据数值选择相应的样式
    const createMapStyleFunction = computed(() => {
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
            });
        });
        const keys = Object.keys(styles).sort((a, b) => Number(a) - Number(b));
        const valueKey = config.valueKey;

        return (feature) => {
            const Value_Low = +feature.get(valueKey);
            let styleKey = keys.find((item) => Value_Low <= +item);

            if (!styleKey) {
                styleKey = keys[keys.length - 1];
            }
            return styles[styleKey];
        };
    });

    // 初始化色卡配置
    createColorConfig();

    // 返回组合式函数的各个方法和属性
    return {colorConfig, getTitle, getStartIndex, getStep, createMapStyleFunction};
};

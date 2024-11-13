import { defineStore } from "pinia";
import { ref } from "vue";

export const useColorConfigStore = defineStore('colorConfig', () => {

    const isColorChange = ref(false);

    // 初始化 tempColorConfig，首先从 localStorage 获取配置，如果没有则使用默认配置

    // 获取本地存储中的色卡配置
    const getLocalStorageColorConfig = (type) => {
        const colorList = JSON.parse(localStorage.getItem(type));
        return colorList && colorList.length ? colorList : false;  // 返回 colorList 或空数组
    };

    const tempColorConfig = ref({
        valueMinus: true,
        valueKey: "TEM1H_Low",
        name: "aws_tem",
        label: "温度",
        unit: "℃",
        colorConfig: getLocalStorageColorConfig('temp') || [
            {
                "GT": "-24",
                "LTE": "10",
                "A": "255",
                "R": "0",
                "G": "56",
                "B": "181"
            },
            {
                "GT": "10",
                "LTE": "11",
                "A": "255",
                "R": "0",
                "G": "36",
                "B": "206"
            },
            {
                "GT": "15",
                "LTE": "16",
                "A": "255",
                "R": "99",
                "G": "101",
                "B": "255"
            },
            {
                "GT": "20",
                "LTE": "21",
                "A": "255",
                "R": "234",
                "G": "235",
                "B": "252"
            },
            {
                "GT": "25",
                "LTE": "26",
                "A": "255",
                "R": "173",
                "G": "231",
                "B": "0"
            },
            {
                "GT": "30",
                "LTE": "31",
                "A": "255",
                "R": "255",
                "G": "186",
                "B": "0"
            },
            {
                "GT": "35",
                "LTE": "36",
                "A": "255",
                "R": "255",
                "G": "28",
                "B": "0"
            },
            {
                "GT": "40",
                "LTE": "100",
                "A": "255",
                "R": "120",
                "G": "0",
                "B": "0"
            }
        ]
    });



    // 获取指定类型的色卡配置
    const getColorConfig = (type) => {
        return tempColorConfig.value; // 直接返回 tempColorConfig 的值
    };

    // 设置指定类型的色卡配置并更新到 localStorage
    const setColorConfig = (type, colorList) => {
        if (type === 'temp') {
            tempColorConfig.value.colorConfig = colorList;
            // 将更新后的 colorConfig 保存到 localStorage
            localStorage.setItem('temp', JSON.stringify(tempColorConfig.value.colorConfig));
        }
    };

    // 设置是否发生了颜色变化的标志
    const setColorChange = (flag) => {
        isColorChange.value = flag;
    };

    return { getColorConfig, setColorConfig, setColorChange, isColorChange };
});

import {defineStore} from "pinia";
import {ref} from "vue";


export const useCounterStore = defineStore('counter', () => {
    const areaId = ref('310100') //区或者市中心ID
    const areaName = ref('') //区或者市中心名称
    const townId = ref('')//乡镇街道ID
    const townName = ref('') //乡镇街道名称
    const areaData = ref([])//地区所有数据，包含各级别的地区数据；数组成员例：{id: 310104, name: "徐汇区", airName: null, alias: "市区", aliasId: 310104, enName: null, type: 3, py: null,…}


    return {areaId, areaName, townId, townName, areaData}
})
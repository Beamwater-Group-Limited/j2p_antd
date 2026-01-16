import {v4} from "uuid";
import {BaseWebUrl} from "@/tools/BasePath";
import {
    checkChart,
    checkCustomCbtaiCompo,
    checkCustomPage, checkX,
    getInnerFromChartCompo,
    getInnerFromCompo, getInnerFromXCompo
} from "@/tools/ComesData";

const addNewComponent = () => {
    if (!process.env.REACT_APP_BASE_PREFIX) {
        // 生成新的 UUID
        const innerComponent = v4().replace(/-/g, '').slice(0, 8);
        window.open(`${BaseWebUrl}/component/${innerComponent}`, '_blank');
    }else{
        alert('禁止添加组件：无法执行此操作，只能在40环境上执行。');
    }
};

const addNewCustomComponent = () => {
    if (!process.env.REACT_APP_BASE_PREFIX) {
        // 生成新的 UUID
        const componentName = v4().replace(/-/g, '').slice(0,8);
        window.open(`${BaseWebUrl}/custom_component/CustomCbtai${componentName}`, '_blank')
    }else{
        alert('禁止添加组件：无法执行此操作，只能在40环境上执行。');
    }
};
const addNewCustomPage = () => {
    if (!process.env.REACT_APP_BASE_PREFIX) {
        // 生成新的 UUID
        const pageName = v4().replace(/-/g, '').slice(0,8);
        window.open(`${BaseWebUrl}/custom_page/CustomPage${pageName}`, '_blank')
    }else{
        alert('禁止添加组件：无法执行此操作，只能在40环境上执行。');
    }

};
const addNewChart = () => {
    if (!process.env.REACT_APP_BASE_PREFIX) {
        // 生成新的 UUID
        const chartName = v4().replace(/-/g, '').slice(0,8);
        window.open(`${BaseWebUrl}/chart/${chartName}`, '_blank')
    }else{
        alert('禁止添加组件：无法执行此操作，只能在40环境上执行。');
    }
};

const addNewX = () => {
    if (!process.env.REACT_APP_BASE_PREFIX) {
        // 生成新的 UUID
        const chartName = v4().replace(/-/g, '').slice(0,8);
        window.open(`${BaseWebUrl}/x/${chartName}`, '_blank')
    }else{
        alert('禁止添加组件：无法执行此操作，只能在40环境上执行。');
    }
};

// 页面跳转到组件设计页面
const handleOpenComponent = (componentId: string) => {
    console.log("点击的组件ID", componentId)
    if (checkCustomCbtaiCompo(componentId)){
        window.open(`${BaseWebUrl}/custom_component/${componentId}`, '_blank')
        return
    }
    if(checkCustomPage(componentId)) {
        window.open(`${BaseWebUrl}/custom_page/${componentId}`, '_blank')
        return
    }
    if(checkChart(componentId)) {
        window.open(`${BaseWebUrl}/chart/${getInnerFromChartCompo(componentId)}`, '_blank')
        return
    }
    if(checkX(componentId)) {
        window.open(`${BaseWebUrl}/x/${getInnerFromXCompo(componentId)}`, '_blank')
        return
    }
    window.open(`${BaseWebUrl}/component/${ getInnerFromCompo(componentId)}`, '_blank')
};

// 外部跳转
const openBpmnWithFlowID = (endpoint:string,queryParams?: URLSearchParams) => {
    const url = new URL(`${window.da.apiUrl}${endpoint}`);
    console.log(url.toString());
    if (queryParams && queryParams.toString()) {
        url.search = queryParams.toString();
    }
    window.open(url.toString(), '_blank')       // 此处为真实路径
};

export {
    addNewChart,
    addNewX,
    handleOpenComponent,
    addNewComponent,
    addNewCustomComponent,
    addNewCustomPage,
    openBpmnWithFlowID,
};

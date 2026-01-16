// 各种事件的限流配置
import {ComponentConfig, GlobalContextDict, PropFormItem} from "@/tools/interface";
import {getSonFromInner} from "@/tools/ComesData";
import * as CbtaiAntd from "antd";

export const getDebounceTime = (eventType: string) => {
    const debounceMap: { [key: string]: number } = {
        input: 300, // 适用于搜索框等
        click: 100, // 适用于按钮点击
        scroll: 500, // 降低滚动事件的触发频率
        keydown: 200, // 防止连续按键触发过快
        mousemove: 100, // 避免鼠标移动触发过于频繁
    };
    return debounceMap[eventType] || 0; // 默认不限制
};
export const EVENT_ATTRIBUTE = "data-event"; // 提取事件识别属性为常量
export const TARGET_ID_ATTRIBUTE = "data-targetid";
// export const TAILWINDCSS = "className"; // Tailwind CSS class attribute
export const CHILDREN = "children"; // 内部嵌套内容
export const EVENT_STATE_UPDATE = "stateUpdate"; // 状态更新事件名称 向右侧传送
export const EVENT_STATE_CHANGE = "stateChange"; // 状态改变事件名称 向左侧传送
export const MOCK_STATE_CHANGE = "mockStateChange"; // 触发节点全状态新值，用以模拟节点状态改变
export const EVENT_STATE_RESTORE = "stateRestore"; // 恢复状态事件
export const EVENT_PAGE_LOADED = "pageLoaded";     // 页面加载发出特定消息
export const USER_NAME = "Cbtai"; // 用户名
export const CUSTOM_PRE = "Custom"; // 前缀自定义
export const LOW_USER_NAME = "cbtai"; // 用户名
export const ANTD = "antd"; // antd module
export const ANTV = "@antv/g2plot"; // antd module
export const ANTX = "@ant-design/x"; // antx module
export const ND_JSON_SEPARATOR = '\n'; // JSON 分隔
export const stateKeyHeads = ["key", "defaultValue", "type"]

// 属性可用的类型 fromKey 用于原生组件 从所在父组件属性获取特定属性 用于属性解析匹配
export const propTypes = ["input", "inputNumber", "slider", "radio", "select",
    "checkbox", "switch", "textarea", "state","func","dict", "menuProps", "menuItems", "icon",
    "reference","transforRender","transforTarget","transforOnChange","tableOnRow",
    "function", "menuOnClick","typographyOnClick","tableColumns","eventTargetValue","info","eventTargetChecked",
    "dayjs","countProps","markProps","progressProps","tabsProps","XAgentContext",
    "timelineItems", "renderItem", "listSource","reactNode","pageChange","fileChange","filePreview","selectionProps"]
// 已知使用工具 todo 自动化增加
const tools = ["EventService", "getUserName", "parse_menuProps", "parse_menuItems","parse_func","parse_dict",
    "parse_icon", "parse_timelineItems", "parse_listSource", "parse_renderItem","parse_tableColumns",
    "parse_reference","parse_transforRender","parse_transforOnChange","parse_transforTarget",
    "parse_eventTargetValue","parse_info","parse_eventTargetChecked","parse_reactNode","parse_tableOnRow",
    "parse_dayjs","parse_countProps","parse_markProps","parse_progressProps","parse_tabsProps",
    "parse_menuOnClick", "parse_typographyOnClick","parse_function","parse_pageChange","parse_fileChange","parse_filePreview","parse_selectionProps"]
// 从属性类型获取状态值类型
export const getStateTypeFromPropType = (propType: string)=>  {
    switch (propType) {
        case "radio":
        case "checkbox":
        case "select":
        case "textarea":
        case "icon":
        case "state":
        case "input":
        case "typographyOnClick":
        case "eventTargetValue":
        case "eventTargetChecked":
        case "dayjs":
            return "string";
        case "switch":
            return "boolean";
        case "inputNumber":
        case "slider":
            return "number";
        case "menuItems":
        case "tableColumns":
        case "timelineItems":
        case "listSource":
        case "transforTarget":
            return "array";
        case "menuProps":
        case "countProps":
        case "markProps":
        case "progressProps":
        case "tabsProps":
        case "selectionProps":
            return "object";
        case "function":
        case "menuOnClick":
        case "reactNode":
        case "reference":
        case "renderItem":
        case "transforRender":
        case "pageChange":
        case "fileChange":
        case "filePreview":
        case "func":
        case "dict":
            return "any";
        default:
            return "any";
    }
};
// 从属性类型获取渲染方式类型 显示在 组件页面的 定制属性面板中
export const getRenderTypeFromPropType = (propType: string)=>  {
    switch (propType) {
        case "radio":
        case "checkbox":
        case "select":
            return "select";
        case "switch":
            return "switch";
        case "menuProps":
        case "countProps":
        case "textarea":
        case "markProps":
        case "progressProps":
        case "selectionProps":
            return "textarea";
        case "icon":
        case "slider":
        case "state":
        case "input":
        case "transforTarget":
            return "input";
        case "info":
        case "tableColumns":
        case "function":
        case "typographyOnClick":
        case "menuOnClick":
        case "eventTargetValue":
        case "eventTargetChecked":
        case "reactNode":
        case "dayjs":
        case "tabsProps":
        case "reference":
        case "renderItem":
        case "transforRender":
        case "transforOnChange":
        case "tableOnRow":
        case "XAgentContext":
        case "pageChange":
        case "fileChange":
        case "filePreview":
        case "func":
        case "dict":
            return "options";
        default:
            return "any";
    }
};
export const customPropFromComProps = (name:string):PropFormItem=> ({
    label: name,                       // 面板显示
    name,                              // 名称
    type: "input",                           // 属性类型，不是状态值类型
    options: [],                         // 可选项
    defaultValue: "",                      // 默认值
    isTemp: false,                        // 是否是 ***_temp属性
    isFunc: false,                        // 是否是 ***_func属性
    isDict: false,                        // 是否是 ***_dict属性
    isAsync: false,                       // 是否需要异步 方法
    isAsyncValue: false,                 // 是否需要异步值
    isState: false,                         // 是否为状态
})
// 创建默认配置
// 原生html元素
export const nativeOptions = [
    'div',
    'span',
    'p',
    'a',
    'button',
    'input',
    'textarea',
    'select',
    'ul',
    'ol',
    'li',
    'table',
    'tr',
    'td',
    'th',
    'form',
    'label',
    'img',
    'video',
    'audio',
    'section'
];
// 获取用户名称
export const getUserName = () => {
    return LOW_USER_NAME;
};

// CbtaiButton -> Cbtai and Button InnerComp   ->  parentComponentName sonComponentName
// 组件名称三部分  Cbtai  父组件名称（如果存在） 子组件名称
export const defaultCompConfig = (InnerComp: string, isNative: boolean, parentComponentName?: string): ComponentConfig => {
    const sonComp = getSonFromInner(InnerComp, parentComponentName)
    let parentComponent = ""
    // 默认导入组件部分
    const antdImports = ["Form", "Select", "Switch", "Radio", "Checkbox", "Slider", "Input", "Typography", "InputNumber","DatePicker"];
    const antdTypes = ["FormProps", "SelectProps", "SwitchProps", "RadioProps", "CheckboxProps", "SiderProps", "InputProps", "TypographyProps", "MenuProps"];
    const cbtaiParams = [ "sendEvent",   "nodeID",   "cbtState",   "setCbtState",   "sendStateChange",   "React",  "CbtaiAntd" ,"navigate" , "workMode","appConfig","projectConfig"]
    if (isNative) {
        parentComponent = ""
    } else {
        // 如果有父组件
        if (parentComponentName) {
            // 如果 InnerComp 不存在于 antdImports 数组中，则添加
            if (!antdImports.includes(parentComponentName)) {
                antdImports.push(parentComponentName);
            }
            parentComponent = parentComponentName;
        } else {
            // 如果 InnerComp 不存在于 antdImports 数组中，则添加
            if (!antdImports.includes(sonComp)) {
                antdImports.push(sonComp);
            }
            parentComponent = ""
        }
    }

    return {
        importNameModdule: {
            "@craftjs/core": ["useNode"],
            "uuid": ["v4"],
            [ANTD]: antdImports,
            "react": ["useEffect", "useState", "useContext"],
            "react-router-dom": ["useNavigate"],
            "@/tools": tools,
            "@/context": ["useAppConfig", "useWebSocket", "useProject","usePagesData"],
            "@/ide": ["DictItemTree","DoubleInput"],
            "@/hooks":["useCraftJS","useWebrtc"],
            "@/pipelines/cbtai": ["DynamicAntdIcon"],
        },
        importDefaultModdule: {"react": "React"},
        importType: {[ANTD]: antdTypes},
        parentComponent: parentComponent,
        sonComponent: sonComp,
        cbtaiParams: cbtaiParams,
        userName: USER_NAME,
        innerModule: ANTD,
        innerComponent: InnerComp,
        compProps: ["className", "dataevent", "children"],
        customProps: [],
        states: [],
        isCanvas: false,
        needWrap: false,
        haveChildren: true,
        isNative: isNative,                                 // 似乎存在原因，不进行配置，需要注意 //fixme
        defaultProps: {
            disabled: false,
        }
    }
};
// 远端服务器和本地初始化配置融合（有可能本地进行了修改，调整了默认组件配置的时候，远端需要一次性同步一下增加本地的配置，然后传递到远端）
export const syncLocalCompConfig = (compConfig: ComponentConfig) => {
    // 必须是应用了 comConfig。isNative的 因为可能导致生成的 自我组件作为 import导入项的 没有被排除
    const defaultConfig = defaultCompConfig(compConfig.innerComponent, compConfig.isNative, compConfig.parentComponent);
    console.log("本地生成的配置", defaultConfig)
    return {
        ...compConfig,
        innerComponent: (compConfig.parentComponent && !compConfig.innerComponent.startsWith(compConfig.parentComponent)) ? `${compConfig.parentComponent}${compConfig.innerComponent}` : defaultConfig.innerComponent,
        parentComponent: compConfig.parentComponent !== undefined ? compConfig.parentComponent : defaultConfig.parentComponent,
        // 如果服务器端没有，则需要添加
        // 是否为拖拽容器
        sonComponent: compConfig.sonComponent !== undefined ? compConfig.sonComponent : defaultConfig.sonComponent,
        cbtaiParams: compConfig.cbtaiParams !== undefined ? compConfig.cbtaiParams : defaultConfig.cbtaiParams,
        // 是否为拖拽容器
        isCanvas: compConfig.isCanvas !== undefined ? compConfig.isCanvas : defaultConfig.isCanvas,
        // 是否需要包装div
        needWrap: compConfig.needWrap !== undefined ? compConfig.needWrap : defaultConfig.needWrap,
        // 是否有内容
        haveChildren: compConfig.haveChildren !== undefined ? compConfig.haveChildren : defaultConfig.haveChildren,
        // 是否为原生
        isNative: compConfig.isNative !== undefined ? compConfig.isNative : defaultConfig.isNative,
        // 和默认配置保持一致，动态无法修改
        // 包括导入命名模块
        importNameModdule: defaultConfig.importNameModdule,
        // 导入默认模块
        importDefaultModdule: defaultConfig.importDefaultModdule,
        // 导入默认模块
        importType: defaultConfig.importType,
        // 导入用户名
        userName: defaultConfig.userName,
        // 导入内用库
        innerModule: defaultConfig.innerModule,
        // 导入通用属性
        compProps: defaultConfig.compProps,
    };
};

// 创建 自定义渲染组件项 自定义页面 的默认配置
export const defaultCustomCompConfig = (componentType:string):ComponentConfig => {
    // 默认导入组件部分
    const antdImports = ["Form", "Select", "Switch", "Radio", "Checkbox", "Slider", "Input", "Typography", "InputNumber","DatePicker"];
    const antdTypes = ["FormProps", "SelectProps", "SwitchProps", "RadioProps", "CheckboxProps", "SiderProps", "InputProps", "TypographyProps", "MenuProps"];
    // 已知使用工具
    const tools = ["EventService", "getUserName", "parse_menuProps", "parse_menuItems", "parse_icon", "parse_timelineItems","parse_func"]
    const cbtaiParams = [ "sendEvent",   "nodeID",   "cbtState",   "setCbtState",   "sendStateChange",   "React",  "CbtaiAntd" ,"navigate" , "workMode","appConfig","projectConfig"]

    return {
        importNameModdule: {
            "@craftjs/core": ["useNode"],
            "uuid": ["v4"],
            [ANTD]: antdImports,
            "react": ["useEffect", "useState", "useContext","ReactNode"],
            "react-router-dom": ["useNavigate"],
            "@/tools": tools,
            "@/context": ["useAppConfig","useProject"],
            "@/ide": ["DictItemTree","DoubleInput"],
            "@/hooks":["useCraftJS"],
            "@/pipelines/cbtai": ["DynamicAntdIcon"],
        },
        importDefaultModdule: {"react": "React"},
        importType: {[ANTD]: antdTypes},
        parentComponent: "",
        sonComponent: "",
        cbtaiParams: cbtaiParams,
        userName: USER_NAME,
        innerModule: ANTD,
        innerComponent: componentType,
        compProps: ["className","parentProps","children"],
        customProps: [],
        states: [],
        isCanvas: false,
        needWrap: false,
        haveChildren: true,
        isNative: false,
        defaultProps: {
            disabled: false,
        }
    }
};
export const syncLocalCustomCompConfig = (compConfig:ComponentConfig) => {
    const defaultConfig = defaultCustomCompConfig(compConfig.innerComponent);
    return {
        ...compConfig,
        // 如果服务器端没有，则需要添加
        // // 是否为拖拽容器
        // sonComponent: compConfig.sonComponent !== undefined ? compConfig.sonComponent : defaultConfig.sonComponent,
        // // 是否为拖拽容器
        // isCanvas: compConfig.isCanvas !== undefined ? compConfig.isCanvas : defaultConfig.isCanvas,
    };
}

// 创建图表组件的默认配置
export const defaultChartCompConfig = (InnerComp: string):ComponentConfig => {
    // 默认导入组件部分
    const antdImports = ["Form", "Select", "Switch", "Radio", "Checkbox", "Slider", "Input", "Typography", "InputNumber","DatePicker"];
    const antvImports = ["Line"];
    if (!antvImports.includes(InnerComp)) {
        antvImports.push(InnerComp);
    }
    // 类型
    const antdTypes = ["FormProps", "SelectProps", "SwitchProps", "RadioProps", "CheckboxProps", "SiderProps", "InputProps", "TypographyProps", "MenuProps"];
    // 已知使用工具
    const tools = ["EventService", "getUserName", "parse_menuProps", "parse_menuItems", "parse_icon", "parse_timelineItems","parse_func"]
    const cbtaiParams = [ "sendEvent",   "nodeID",   "cbtState",   "setCbtState",   "sendStateChange",   "React",  "CbtaiAntd" ,"navigate" , "workMode","appConfig","projectConfig"]

    return {
        importNameModdule: {
            "@craftjs/core": ["useNode"],
            "uuid": ["v4"],
            [ANTD]: antdImports,
            "react": ["useEffect", "useState", "useRef"],
            "react-router-dom": ["useNavigate"],
            [ANTV]: antvImports,
            "@/tools": tools,
            "@/context": ["useAppConfig","useProject","useWebSocket","usePagesData"],
            "@/ide": ["DictItemTree","DoubleInput"],
            "@/hooks":["useCraftJS"],
            "@/pipelines/cbtai": ["DynamicAntdIcon"],
        },
        importDefaultModdule: {"react": "React"},
        importType: {[ANTD]: antdTypes},
        parentComponent: "",
        sonComponent: "",
        cbtaiParams: cbtaiParams,
        userName: `Chart${USER_NAME}`,
        innerModule: ANTV,
        innerComponent: InnerComp,
        compProps: ["className", "dataevent","children","data"],
        customProps: [],
        states: [],
        isCanvas: false,
        needWrap: false,
        haveChildren: true,
        isNative: false,
        defaultProps: {
            disabled: false,
        }
    }
};
// 远端服务器和本地初始化配置融合（有可能本地进行了修改，调整了默认组件配置的时候，远端需要一次性同步一下增加本地的配置，然后传递到远端）
export const syncLocalChartConfig = (compConfig: ComponentConfig) => {
    // 必须是应用了 comConfig。isNative的 因为可能导致生成的 自我组件作为 import导入项的 没有被排除
    const defaultConfig = defaultChartCompConfig(compConfig.innerComponent);
    return {
        ...compConfig,
        // 和默认配置保持一致，动态无法修改
        // 包括导入命名模块
        importNameModdule: defaultConfig.importNameModdule,
        // 导入通用属性
        compProps: defaultConfig.compProps,
    };
};

// 创建AI前端组件
export const defaultXCompConfig = (InnerComp: string, parentComponentName?: string):ComponentConfig => {
    const sonComp = getSonFromInner(InnerComp, parentComponentName)
    let parentComponent = ""
    // 默认导入antd组件部分
    const antdImports = ["Form","message", "Button", "Space", "Select", "Switch", "Radio", "Checkbox", "Slider", "Input", "Typography", "InputNumber","DatePicker"];
    // 类型
    const antdTypes = ["FormProps", "SelectProps", "SwitchProps", "RadioProps", "CheckboxProps", "SiderProps", "InputProps", "TypographyProps", "MenuProps"];
    // 已知使用工具
    const tools = ["EventService", "getUserName", "parse_menuProps", "parse_menuItems", "parse_icon", "parse_timelineItems", "jsonErrorWithLineCol","parse_func"]
    const cbtaiParams = [ "sendEvent",   "nodeID",   "cbtState",   "setCbtState",   "sendStateChange",   "React",  "CbtaiAntd" ,"navigate" , "workMode","appConfig","projectConfig"]

    // X库中需要预设的部分
    const antxImports = [];
    // func和dict中所需要的导入的cbtai Params

    // 如果有父组件
    if (parentComponentName) {
        // 如果 InnerComp 不存在于 antxImports 数组中，则添加
        if (!antxImports.includes(parentComponentName)) {
            antxImports.push(parentComponentName);
        }
        parentComponent = parentComponentName;
    } else {
        // 如果 InnerComp 不存在于 antxImports 数组中，则添加
        if (!antxImports.includes(sonComp)) {
            antxImports.push(sonComp);
        }
        parentComponent = ""
    }
    return {
        importNameModdule: {
            "@craftjs/core": ["useNode"],
            "uuid": ["v4"],
            [ANTD]: antdImports,
            "react": ["useEffect", "useState", "useRef"],
            "react-router-dom": ["useNavigate"],
            [ANTX]: antxImports,
            "@/tools": tools,
            "@/context": ["useAppConfig","useProject","useWebSocket","usePagesData","useXAgentContext"],
            "@/ide": ["DictItemTree","DoubleInput"],
            "@/hooks":["useCraftJS"],
            "@/pipelines/cbtai": ["DynamicAntdIcon"],
        },
        importDefaultModdule: {"react": "React"},
        importType: {[ANTD]: antdTypes},
        parentComponent: parentComponent,
        sonComponent: sonComp,
        cbtaiParams: cbtaiParams,
        userName: `X${USER_NAME}`,
        innerModule: ANTX,
        innerComponent: InnerComp,
        compProps: ["className", "dataevent","children","data"],
        customProps: [],
        states: [],
        isCanvas: false,
        needWrap: false,
        haveChildren: true,
        isNative: false,
        defaultProps: {
            disabled: false,
        }
    }
};
// 远端服务器和本地初始化配置融合（有可能本地进行了修改，调整了默认组件配置的时候，远端需要一次性同步一下增加本地的配置，然后传递到远端）
export const syncLocalXConfig = (compConfig: ComponentConfig) => {
    // 必须是应用了 comConfig。isNative的 因为可能导致生成的 自我组件作为 import导入项的 没有被排除
    const defaultConfig = defaultXCompConfig(compConfig.innerComponent, compConfig.parentComponent);
    console.log("显示默认的配置", defaultConfig)
    return {
        ...compConfig,
        innerComponent: (compConfig.parentComponent && !compConfig.innerComponent.startsWith(compConfig.parentComponent)) ? `${compConfig.parentComponent}${compConfig.innerComponent}` : defaultConfig.innerComponent,
        parentComponent: compConfig.parentComponent !== undefined ? compConfig.parentComponent : defaultConfig.parentComponent,
        // 如果服务器端没有，则需要添加
        // 是否为拖拽容器
        sonComponent: compConfig.sonComponent !== undefined ? compConfig.sonComponent : defaultConfig.sonComponent,
        // 和默认配置保持一致，动态无法修改
        // 包括导入命名模块
        importNameModdule: defaultConfig.importNameModdule,
        // 导入通用属性
        compProps: defaultConfig.compProps,
    };
};

// 默认配置
export const defaultDynamicAppConfig = (): GlobalContextDict => ({
    userID: "",                                 // 用户 ID 默认值
    tokenID: "",
    token: "",
    userName: "",                               // 默认用户名
    clientID: "",
    isLoggedIn: "false",                        // 默认未登录
    globalName: "自动挡编程平台",                  // 应用名称
    globalDesc: "自动挡编程平台",                  // 应用描述
    globalIcon: "favicon.ico",                   // 应用图标路径或 URL
    globalVersion: "4.4",                       // 版本号
    globalAuthor: "henry",                      // 作者信息
    globalLicense: "MIT",                       // 许可证
    globalCopyright: "© 2025 束水智能科技有限公司", // 版权信息
})

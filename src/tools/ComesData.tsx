import {DaFormat, DataItem, DaType} from "@/entity";
import {USER_NAME} from "@/tools/config";
import {ModelInterfaceProp, Param, PipeConfigItem, PipelineInstance, PipeTaskFlow} from "@/tools/interface";
import {v4} from "uuid";
import {deserializeComponentTree} from "@/tools/fetch";
import {
    ArrowRightOutlined,
    ArrowLeftOutlined,
    CodeOutlined,
    DeploymentUnitOutlined,
    VideoCameraOutlined,
    FontSizeOutlined,
    SearchOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    FileSearchOutlined,
    FileAddOutlined,
    QuestionCircleOutlined,
    ReloadOutlined, EyeOutlined,
} from '@ant-design/icons';

const createDataItem = (
    {
        type = DaType.TEXT, // 默认为 TEXT 类型
        format = DaFormat.FSTRING, // 默认为 FSTRING 格式
        content = null, // 默认内容为空
    }: {
        type?: DaType;
        format?: DaFormat;
        content?: string | null;
    }
): DataItem => {
    return {
        type,   // 数据类型
        format, // 数据格式
        content // 数据内容
    };
};
// 数组转化为字典 用于推断类型
const array2Dict = (array: string[]) => {
    array.reduce((dict: Record<string, string>, item) => {
        dict[item] = item;
        return dict;
    }, {} as Record<string, string>);
}
// 字典转化为数组 用于推断类型
const dict2Array = (dict: Record<string, string>) => {
    return Object.keys(dict).map(key => {
        return {
            "stateName": key,
            "pipeID": dict[key]
        }
    });
}

// 首字母大写
const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// 生成首字母大写处理数组
const generateKeyCapitalizedObject = (strings: string[]): Record<string, string> =>
    strings.reduce((acc: Record<string, string>, str) => {
        acc[str] = capitalizeFirstLetter(str);
        return acc;
    }, {});


// 添加后缀
const getStateFromProp = (propName: string): string => {
    return propName + "State";
};

// 添加前缀
const getCallbackFromState = (stateKey: string): string => {
    return "on" + capitalizeFirstLetter(stateKey);
};
// 移除后缀
const getPropFromState = (stateKey: string): string => {
    if (stateKey.endsWith("State")) {
        return stateKey.slice(0, -"State".length);
    }
    return stateKey;
};

// 从内部名获取图表组件名
const getChartCompoFromInner = (innerComponent: string): string => {
    return `Chart${USER_NAME}${innerComponent}`;
};
// 从组件名获取内部名
const getInnerFromChartCompo = (compoType:string): string => {
    return compoType.slice(`Chart${USER_NAME}`.length);
}

// 从内部名获取大模型组件名
const getXCompoFromInner = (innerComponent:string): string => {
    return `X${USER_NAME}${innerComponent}`;
}
// 从组件名获取内部名
const getInnerFromXCompo = (compoType:string): string => {
    if (compoType.startsWith(`X${USER_NAME}`)) {
        return compoType.slice(`X${USER_NAME}`.length);
    }
    return compoType;
}
// 添加前缀
const getCompoFromInner = (innerComponent: string): string => {
    return USER_NAME + innerComponent;
};

// 从inner 获取 son
const getSonFromInner = (innerComponent: string, parentComponent?: string): string => {
    console.log("内部组件",innerComponent, parentComponent)
    if (!parentComponent) {
        console.log("外部组件为空",parentComponent)
        return innerComponent;
    } else {
        console.log("外部组件",parentComponent)
        return innerComponent.slice(parentComponent.length)
    }
};

// 移除指定前缀
const getInnerFromCompo = (compoType: string): string => {
    if (compoType.startsWith(USER_NAME)) {
        return compoType.slice(USER_NAME.length);
    }
    return compoType;
};

// 判断是否有前缀
const checkCustomCbtaiCompo = (compoType: string): boolean => {
    return compoType.startsWith(`Custom${USER_NAME}`)
};
// 判断是否为定制页面
const checkCustomPage = (compoType: string): boolean => {
    return compoType.startsWith(`CustomPage`)
};
// 判断是否为图表组件
const checkChart = (compoType: string): boolean => {
    return compoType.startsWith(`Chart${USER_NAME}`)
};
// 判断是否为大模型组件
const checkX = (compoType: string): boolean => {
    return compoType.startsWith(`X${USER_NAME}`)
};

// 返回组件类别
const getCompoType = (compoType: string): string => {
    if (checkCustomCbtaiCompo(compoType)) {
        return "定制渲染组件";
    } else if (checkCustomPage(compoType)) {
        return "定制页面";
    } else if (checkChart(compoType)){
        return "图表组件";
    } else if (checkX(compoType)){
        return "大模型组件";
    } else {
        return "通用组件"
    }
};

const randomString = (length: number): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const randomParam = (): Param => ({
    name: randomString(10),
    type: randomString(5),
    describe: randomString(10),
});
const randomConfigItem = (): PipeConfigItem => ({
    name: randomString(10),
    value: randomString(5),
    describe: randomString(10),
});

const randomParamArray = (length: number): Param[] => {
    const arr: Param[] = [];
    for (let i = 0; i < length; i++) {
        arr.push(randomParam());
    }
    return arr;
};
const randomConfigItemArray = (length: number): PipeConfigItem[] => {
    const arr: PipeConfigItem[] = [];
    for (let i = 0; i < length; i++) {
        arr.push(randomConfigItem());
    }
    return arr;
};

const generatePipelineInstance = (): PipelineInstance => ({
    id: v4(),
    author: "cbtai",
    pipe_type_id: "",
    pipe_instance_name: randomString(15),
    describe: randomString(30),
    pipe_input_data: randomParamArray(3),
    pipe_output_data: randomParamArray(2),
    pipe_config_items: randomConfigItemArray(2),
    pipe_mount_id: randomString(8),
    data_item_comes: randomParamArray(2),
    data_item_gos: randomParamArray(1),
});
// // 从二维数组中获取所在的x 和y
// const getPosition = (arr: any[], node_id: string) => {
//     let rowIndex = -1;
//     let colIndex = -1;
//     for (let i = 0; i < arr.length; i++) {
//         const j = arr[i].indexOf(node_id);
//         if (j !== -1) {
//             rowIndex = i;
//             colIndex = j;
//             break;
//         }
//     }
//     return {rowIndex, colIndex};
// }
// 从三维数组中获取所在的x 和y z
const getPosition = (arr: any[], node_id: string) => {
    let schedule = 0;
    // 行上的序数
    let rowIndex = -1;
    // 列上的层叠
    let colIndex = -1;
    for (let i = 0; i < arr.length; i++) {                   // 调度的数量
        let rowHeight = 0
        for (let j = 0; j < arr[i].length; j++) {            // 每一个调度 横向的列数
            const k = arr[i][j].indexOf(node_id);               // 每一个列的 竖直方向堆叠数量
            if (k !== -1) {                                         // 堆叠数为0
                rowIndex = j;
                rowHeight = k
                colIndex = schedule + k;
                console.log(node_id,"ID的计算", i,j,k)
                console.log(node_id,"ID的计算值", schedule,rowIndex,colIndex)
                break;
            } else {
                // console.log(node_id,"没找到对应的")
                rowHeight += 1
            }
        }
        schedule += rowHeight + 1                                   // 调度的起始位置
    }
    return {rowIndex, colIndex};
}
// 动态生成新的任务流
const generateTaskFlow = (): PipeTaskFlow => (
    {
        id: "",
        author: "cbtai",
        flow_describe: '描述' + randomString(10),
        flow_bpmn_path: "",
        pipe_id: "",
    }
)
// 深度相等
const deepEqual = (a:any, b:any):boolean => {
    return JSON.stringify(a) === JSON.stringify(b)
}
// 创建新增接口
const defaultModelTaskInterface = (index:number):ModelInterfaceProp => (
    {
        id: index,
        interface_name: "",
        api_endpoint: "/v1/process",
        method: "POST",
        headers: '{"Content-Type": "application/json"}',
        in_comes: '4',
        out_comes: '0',
        req_comes: [
            { type: DaType.TEXT, format: DaFormat.FSTRING, content: "process" },
            { type: DaType.APPLICATION, format: DaFormat.FSTRING, content: "" },
            { type: DaType.TEXT, format: DaFormat.FSTRING, content: "" },
            {
                type: DaType.TEXT,
                format: DaFormat.FSTRING,
                content: "You are Assistant, a professional programming prompt word generator, proficient in Python 3.10.12 language. Please generate high-quality, well-structured and best-practice prompt words according to user needs.",
            },
            { type: DaType.TEXT, format: DaFormat.FSTRING, content: "" },
        ],
        resp_comes: [{ type: DaType.TEXT, format: DaFormat.FSTRING, content: "" }],
        request_body_json: "{}",
        response_json: "{}",
    }
)
// 获取json的操作
const fetchDomJson = async (ownerID:string, domTreeID:string) => {
    let jsonLocal = sessionStorage.getItem(domTreeID)
    if (!jsonLocal){
        jsonLocal = await deserializeComponentTree(ownerID,domTreeID);
        sessionStorage.setItem(domTreeID, JSON.stringify(jsonLocal))
    }
    return JSON.parse(jsonLocal);
}

// 随机生成颜色
const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

// 管道名称图标
const PIPE_ICON_MAP: Record<string, React.ReactNode> = {
    'pipeline_template_output': <ArrowRightOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_input': <ArrowLeftOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_ai_code_common': <CodeOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_common': <DeploymentUnitOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_gstreamer_draw_frames': <VideoCameraOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_gstreamer_add_subtitle': <FontSizeOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_gstreamer_webrtc_stream_show': <EyeOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_gstreamer_draw_clip': <EyeOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_database_get': <SearchOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_database_add_common': <PlusCircleOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_database_del': <MinusCircleOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_cycle': <ReloadOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_read_in': <FileSearchOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_write_out': <FileAddOutlined className="text-blue-500 font-bold " />,
    'pipeline_template_user_login': <ReloadOutlined className="text-blue-500 font-bold " />,
    default: <QuestionCircleOutlined/>,
};
const PIPE_FILL_COLOR: Record<string, string> = {
    'pipeline_template_output':              '#95c7f6',
    'pipeline_template_input':               '#f6e58f',
    'pipeline_template_ai_code_common':      '#dac7a0',
    'pipeline_template_common':              '#d5d5d5',
    'pipeline_template_gstreamer_draw_frames':     '#f35050',
    'pipeline_template_gstreamer_add_subtitle':    '#f35050',
    'pipeline_template_gstreamer_webrtc_stream_show': '#f35050',
    'pipeline_template_gstreamer_draw_clip': '#f35050',
    'pipeline_template_database_get':        '#0680e7',
    'pipeline_template_database_add_common': '#46a5f5',
    'pipeline_template_database_del':        '#ee067c',
    'pipeline_template_cycle':               '#50f37e',
    'pipeline_template_read_in':             '#f69eca',
    'pipeline_template_write_out':           '#1bffec',
    'pipeline_template_user_login':          '#1b41ff',
    default:                                 '#ffffff',
};

// 计算 JSON 语法错误的大致行列（可选增强）
const jsonErrorWithLineCol = (raw: string, err: any)=> {
    const text = String(err?.message ?? '');
    const m = /position\s+(\d+)/i.exec(text);
    if (!m) return text;
    const pos = Number(m[1]);
    const up = raw.slice(0, pos);
    const lines = up.split(/\r?\n/);
    const line = lines.length;
    const col = (lines[lines.length - 1] ?? '').length + 1;
    return `${text}（第 ${line} 行，第 ${col} 列）`;
}

export {
    defaultModelTaskInterface,
    deepEqual,
    getPosition,
    generatePipelineInstance,
    getCallbackFromState,
    getStateFromProp,
    getPropFromState,
    createDataItem,
    getCompoType,
    checkChart,
    getChartCompoFromInner, getInnerFromChartCompo,getXCompoFromInner,getInnerFromXCompo,
    getCompoFromInner, getInnerFromCompo,checkCustomCbtaiCompo,checkCustomPage,checkX,
    array2Dict, dict2Array, generateKeyCapitalizedObject,
    generateTaskFlow,
    getSonFromInner,
    fetchDomJson,
    getRandomColor,
    PIPE_ICON_MAP,
    PIPE_FILL_COLOR,
    jsonErrorWithLineCol,
};

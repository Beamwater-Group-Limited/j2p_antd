import React, {Dispatch, SetStateAction} from "react";
import {EVENT_ATTRIBUTE, TARGET_ID_ATTRIBUTE} from "@/tools/config";
import {CellView, Markup} from "@antv/x6";
import Attr = CellView.Attr;
import {DataItem} from "@/entity";

export interface ListItem {
    id: string;
    tag?: string;
    description?: string;
}
// 定义绑定项的接口类型
export interface BindingItem {
    id: string;                             // 绑定的唯一ID
    componentId: string;                    // 触发事件的组件ID
    eventTrigger: string;                   // 事件触发器
    pipeline: string;                       // 管道
}
// ws上下文值
export interface WebSocketContextValue {
    ws: WebSocket | null;
    message: string;
    connectionStatus: "connected" | "disconnected" | "error" | "connecting";
}

// 传递组件类型接口
export interface ComponentType {
    InnerComp:string;
    setInnerCompType:Dispatch<SetStateAction<string>>
}
// 动态生成组件属性接口
export interface ComponentProps {
    [EVENT_ATTRIBUTE]: string;              // 需要被EventContext捕捉的事件属性列表
    [TARGET_ID_ATTRIBUTE]: string;           // 传输节点树中节点ID
    className:string;                        // tailwind样式 "px-4 py-2 bg-blue-500"
    children:any;
}
//  递归字典项
export type  NestedDataItem = {
    [key: string]: string | NestedDataItem | NestedDataItem[]
}
//  递归字典项
export type ComplexData =string| NestedDataItem | NestedDataItem[]

/**
 * 用于 `ComponentStatesDefinePanel` 的状态项和树节点统一结构
 */
export interface StateItem {
    key: string;       // 唯一标识
    capKey: string;    // Key 的首字母大写
    defaultValue: any; // 值
    type: "string" | "number" | "boolean" | "object" | "array" | "any";     // 类型（复杂结构支持）
    children?: StateItem[];    // 支持嵌套（递归结构）
}
// 编辑状态属性的接口
export interface StateItemProps {
    stateKey: string;
    stateType: string;
    stateValue: any;
    onItemUpdate: (name:string, any) => void;
}

// 组合接口
export interface CbtEditableTreeProps {
    initialTree: StateItem[]; // 初始的状态数据
    onTreeUpdate: (treeData: StateItem[]) => void; // 回调，返回编辑后的树数据
}
// 属性接口 定制属性的更改，会引发本地属性数据变化，不过会在远程和本地同步的时候，刷新远程的结构 ComponentConfig
export interface PropFormItem {
    label: string,                          // 面板显示
    name: string,                           // 名称
    type: string,                           // 类型
    options: any[],                         // 可选项
    defaultValue: any,                      // 默认值
    isTemp: boolean                         // 是否是 ***_temp属性
    isFunc: boolean                         // 是否是 ***_func属性
    isDict: boolean                         // 是否是 ***_dict属性
    isAsync: boolean                         // 是否需要异步 方法
    isAsyncValue: boolean                    // 是否需要异步值
    isState: boolean                         // 是否为状态
}

// 组件配置接口
export interface ComponentConfig {
    importNameModdule: Record<string, string[]>; // 按名导入的模块
    importType: Record<string, string[]>;    // 默认导入的模块
    importDefaultModdule: Record<string, string>;    // 默认导入的模块
    parentComponent: string;                           // 父组件
    sonComponent: string;                           // 子组件
    cbtaiParams: string[];                          //解析函数，解析字典通用参数
    innerComponent: string;                           // 绑定 antd 组件
    innerModule: string;                              // antd
    userName: string;                                // Cbtai
    compProps: string[];                             // 拖拽组件的属性暴露，通用到内部antd组件
    customProps: PropFormItem[];                     // 内部antd组件暴露
    states: StateItem[];                             // 暴露状态
    isCanvas: boolean;                              // 是否是容器
    needWrap: boolean;                              // 是否需要包裹，复杂组件需要包 div
    haveChildren: boolean ;                        // 是否含有内容
    isNative:boolean ;                             // 是否是原生
    defaultProps: Record<string, any>;               // 属性的默认值
}

// 组件的属性
export interface ComponentProp {
    owner_id: string;
    component_name: string;
}
// 定制化页面属性
export interface CustomPageProp {
    owner_id: string;
    page_type: string;
}

// 管道类型列表
export  interface DynamicPipelineListProps {
    headers: string[]; // 表头的字符串数组，每一项对应 data 对象中的字段名
    data: PipelineType[]; // 管道数据列表：每个对象的 key 应与 headers 中的字符串对应
}

//管道实例

export interface Param {
    name: string;
    type: string;
    describe: string;
}

export interface PipelineType {
    id: string;
    data_item_comes : Param[];
    data_item_gos : Param[];
    describe: string;
    pipe_config_items: PipeConfigItem[];
    pipe_input_data: Param[];
    pipe_output_data: Param[];
    pipe_type: string;
    pipe_type_name: string;
}

export interface PipelineInstance {
    id: string;
    author: string;
    pipe_type_id: string;
    pipe_instance_name: string;
    describe: string;
    pipe_input_data: Param[];
    pipe_output_data: Param[];
    pipe_config_items: PipeConfigItem[];
    pipe_mount_id :string;
    data_item_comes : Param[];
    data_item_gos : Param[];
}

// 管道类型列表
export  interface DynamicPipelineInstanceListProps {
    headers: string[]; // 表头的字符串数组，每一项对应 data 对象中的字段名
    data: PipelineInstance[]; // 管道数据列表：每个对象的 key 应与 headers 中的字符串对应
}
// 管道任务流
export interface PipeTaskFlow {
    id:string;
    author:string;
    flow_describe:string;
    flow_bpmn_path:string;
    pipe_id:string;
}
// 任务流列表
export  interface PipeTaskFlowListProps {
    headers: string[]; // 表头的字符串数组，每一项对应 data 对象中的字段名
    data: PipeTaskFlow[]; // 管道任务列表：每个对象的 key 应与 headers 中的字符串对应
}

//状态和特殊管道绑定关系
export interface StateBindItem {
    stateName: string; // 状态名称
    pipeID: string; // 当前绑定的管道ID
}
//本地状态绑定
export interface LocalStateBindItem {
    stateName: string; // 状态名称
    nodeID: string; // 绑定的组件ID
    nodeStateName: string // 绑定的组件状态名称
}

// Type for nested dictionary structure
export type Dictionary = {
    [key: string]: string | Dictionary; // A dictionary can have string values or other dictionaries as values
};

// 定义全局上下文的数据结构
export interface GlobalContextDict {
    userID: string;
    tokenID: string;
    token: string;
    isLoggedIn: string;
    userName?: string;
    clientID: string;
    globalName: string;
    globalDesc: string;
    globalIcon: string;
    globalVersion: string;
    globalAuthor: string;
    globalLicense: string;
    globalCopyright: string;
}

export interface LoginProps {
    onLogin: (value:{userid: string,password:string}) => void;
}
// 路由项
export interface RouteProp {
    title: string;                      // 标题
    path: string;                       // 匹配的路径
    pageID: string;                     // 页面ID
    children: RouteProp[];            // 子路由
}

//页面属性
export interface PageProp {
    pageID: string;
    nodesStated: string[];
}

// 项目数据接口定义
export interface ProjectData {
    project_id: string;                         // 该项目的ID
    name: string;                       // 项目名称
    description: string;                // 项目描述
    owner_id: string;                   // 项目使用的组件拥有者
    status: string;                     // 项目状态
    user_id: string;                    // 项目的创建者
    page_id: string;                    // 项目页面ID
    mode:string;                        // 模式 dev runtime
}

// 项目版本数据接口定义
export interface ProjectVersionData {
    project_id: string;                 // 该项目的ID
    version_id: string;                 // 版本名称
    updatetime: string;                   // 发布时间
}

// 项目版本运行状态接口定义
export interface ProjectRuntimeData {
    version_id: string;                 // 版本名称
    image_version: string;                 // 镜像版本
}

// 全局配置
export type DashboardAppConfig = {
    apiUrl: string;
    modelUrl?: string;
    turnUrl?: string;
};

// 算力模型
export type LlmProps = {
    model_id: string;
    model_name?: string;
    license?: string;
    tags?: string;
    language?: string;
    model_type?: string;
    datasets?: string;
    metrics?: string;
    inference?: string;
    model_index?: number;
    trained_by?: string;
    base_model?: string;
    model_size?: string;
    gpu_memory_requirement?: string;
    quantization?: string;
    intended_use?: string;
    limitations?: string;
    training_args?: string;
};
// cnn模型
export type CnnProps = {
    model_id: string;
    owner_id?: string;
    model_class?: string;
    model_name?: string;
    weight_path?: string
}
// longrun 属性
export type LongrunProps = {
    model_id: string;
    owner_id?: string;
    model_name?: string;
}
//  ExecuteTaskStateDao
export type ExecuteTaskStateDao = {
    task_name: string;
    http_url: string;
    comes: Record<string, DataItem>;
    goes: Record<string, DataItem>;
}
// scheduleProps 属性
export type ScheduleProps = {
    current_pipe_id: string;
    comes: Record<string, DataItem>;
    goes: Record<string, DataItem>;
    config: Record<string, DataItem>;
    task_list: ExecuteTaskStateDao[];
}

// scheduleProps 属性
export type ExecuteState = {
    main_pipe_id: string;
    is_record: boolean;
    datetime: string;
    run_state:ScheduleProps[]
}

// 调度执行状态
export  interface ScheduleExecuteStateProps {
    headers: string[]; // 表头的字符串数组，每一项对应 data 对象中的字段名
    scheduleProps: ExecuteState[]; // 调度执行状态列表：每个对象的 key 应与 headers 中的字符串对应
}

// 模型的下载参数
export interface DownloadProps {
    from_package: string;             // 包名称（例如 transformers 等）
    load_in_4bit: boolean;            // 是否以 4-bit 模式加载模型
    copy_4bit_model: boolean;         // 是否拷贝 4-bit 模型
    processor_class: string;          // 使用的处理器类，例如 AutoProcessor
    tokenizer_class: string;          // 使用的分词器类，例如 AutoTokenizer
    model_name: string;               // 模型名称，例如 huawei-noah/TinyBERT_4L_zh
    model_class: string;              // 模型类，例如 AutoModelForCausalLM
    sentence_transformers_class: string; // Sentence Transformers 的类
    sentence_transformers_name: string;  // Sentence Transformers 的名称
    user_id: string;                  // 用户 ID，例如 cbtai
}


// 模型的下载任务
export interface DownloadTask {
    "task_id": string,
    "model_name": string,
    "progress": number,
    "status": string,  // completed / error
    "error": string,
    "started_at": string
}


//管道配置项
export interface PipeConfigItem {
    describe :string;
    name :string;
    value : string;
}

// 定义上下文的类型
export interface CompStatesContextProps {
    compStates: Record<string,any>; // 当前组件的所有状态
    setCompStates: Dispatch<SetStateAction<Record<string,any>>>;
    addCompState: (name: string,newState: any) => void; // 添加状态的方法
    updateCompState: (name: string, updatedState: any) => void; // 更新状态的方法
    removeCompState: (name: string) => void; // 删除状态的方法
}

// 定义事件负载的结构接口
export interface EventPayload {
    message_id: string; // 消息唯一标识
    timestamp: string; // 事件生成的时间戳 (ISO 时间格式)
    user_id: string; // 用户 ID
    project_id: string; // DOM 树 ID (项目 ID)
    node_id: string; // 触发节点的 ID
    type: string; // 事件类型
    data: Record<string, any>; // 数据负载 (动态键值对，键和值类型可以自定义)
}

// 单条接口信息
export interface ModelInterfaceProp {
    id: number;         /** 数组下标或数据库自增 ID 等 */
    api_endpoint: string;                           // RESTful 地址，如 /v1/generate
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";  // GET / POST / ...
    headers: string;                               // 例如 { "Content-Type": "application/json" }，保留为 JSON 字符串，若想直接对象可改成 Record<string, string>
    interface_name: string;                        // 为人看的接口名称
    in_comes: string;                             // 逗号分隔的前置节点编号（可按需改成 number[]）
    out_comes: string;                            // 逗号分隔的后继节点编号
    req_comes: DataItem[];                                          // 请求样例（数组元素次序与后端约定）
    resp_comes: DataItem[];                                          // 响应样例
    request_body_json: string;                    // 自定义请求体 JSON（字符串保存，前端可 JSON.parse）
    response_json: string;                        // 响应示例 JSON（字符串保存）
}

// 整体模型数据
export interface ModelDataProp {
    company_name: string;
    model_class: string | null;      // 若以后有枚举可 tightening
    model_config_path: string;
    model_id: string;
    model_interfaces: ModelInterfaceProp[];
    model_name: string;
    model_path: string;
    revision: string;
}

// 进程执行数据
export interface ProjRunProp {
    PID: string;
    cmdLine: string;
}

// 模态框的状态
export interface ModalState {
    visible: boolean;
    nodeId: string | null;
}

// 消息
export interface CbtaiMessage {
    id?: string;
    role: string;
    content: string;
}

export interface CbtaiInput {
    messages: CbtaiMessage[];
}

export interface XAgentContextValue {
    // items: { key: string | number; role: 'ai' | 'local'; content: React.ReactNode }[];
    // parse_roles:(v:any) => void;
    parse_XAgentContext:(name:string,value?:any) => any;
}

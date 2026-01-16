import {cbtGet, cbtPost} from "./FetchUtils";
import {createDataItem} from "../ComesData";
import {DaFormat, DataItem, DaType} from "@/entity";
import {
    BindingItem,
    ComponentConfig,
    ComponentProp,
    DynamicPipelineInstanceListProps,
    DynamicPipelineListProps, LocalStateBindItem, ModelDataProp, Param,
    PipelineInstance,
    PipeTaskFlow,
    PipeTaskFlowListProps,
    ProjectData,
    ProjectRuntimeData,
    ProjectVersionData,
    RouteProp,
    StateBindItem
} from "@/tools/interface";

const getEventType = async (queryParams?: URLSearchParams): Promise<string[]> => {
    const comesEntity = await cbtGet('/v1/event_types', queryParams);
    console.log(" getEventType 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) return []
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 获取可用的组件名称列表
const getComponentNames = async (owner_id:string): Promise<string[]> => {
    const goes = [
        createDataItem({content: owner_id})
    ]
    const comesEntity = await cbtPost('/v1/comp_types_names',goes);
    console.log(" getComponentNames 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) return []
    const cheng = comesEntity.comes[0].content;
    console.log(" getComponentNames 返回数据", cheng)
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}
// 获取可用的组件名称列表
const getComponents = async (owner_id:string): Promise<ComponentProp[]> => {
    const goes = [
        createDataItem({content: owner_id})
    ]
    const comesEntity = await cbtPost('/v1/comp_types',goes);
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) return []
    const cheng = comesEntity.comes[0].content;
    console.log(" getComponents 返回数据", cheng)
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 获取可用的组件名称列表
const getRuntimeComponents = async (owner_id:string): Promise<ComponentProp[]> => {
    const goes = [
        createDataItem({content: owner_id})
    ]
    const comesEntity = await cbtPost('/v1/runtime_comp_types',goes);
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) return []
    const cheng = comesEntity.comes[0].content;
    console.log(" getRuntimeComponentNames 返回数据", cheng)
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 生成新组件文件
const updateComponent = async (userID:string,componentName: string, componentCode: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: componentName}),
        createDataItem({content: componentCode}),
    ]
    const comesEntity = await cbtPost('/v1/update_component', goes);
    console.log(" updateComponent 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {  return null; }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : null;
}
// 生成新组件配置文件
const updateComponentConfig = async (userID:string,componentName: string, componentConfig: ComponentConfig): Promise<string> => {
    const compConfigJson = JSON.stringify(componentConfig)
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: componentName}),
        createDataItem({content: compConfigJson}),
    ]
    const comesEntity = await cbtPost('/v1/update_component_json', goes);
    console.log(" updateComponentConfig 返回数据", comesEntity)
    return comesEntity.comes[0]?.content;
}
// 获取新组件配置文件
const fetchConfigForCompo = async (componentOwnerID:string,componentName: string): Promise<ComponentConfig> => {
    const goes = [
        createDataItem({content: componentOwnerID}),
        createDataItem({content: componentName}),
    ]
    const comesEntity = await cbtPost('/v1/get_component_json', goes);
    console.log(" fetchConfigForCompo 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0 || comesEntity.comes[0].content === "") {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}
// 更新索引文件
const updateComponentIndex = async (userID:string,componentCode: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: componentCode}),
    ]
    const comesEntity = await cbtPost('/v1/update_component_index', goes);
    return comesEntity.comes[0]?.content;
}
// 更新动态导入文件
const updateDynamicImport = async (userID:string,componentCode: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: componentCode}),
    ]
    const comesEntity = await cbtPost('/v1/update_ide', goes);
    return comesEntity.comes[0]?.content;
}

// 删除组件和配置文件
const deleteComponentType = async (userID:string,componentName: string ): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: componentName}),
    ]
    const comesEntity = await cbtPost('/v1/delete_component_config_index', goes);
    return comesEntity.comes[0]?.content;
}

// 根据管道获取输出项
const getIOItemsWithPipeID = async (userID:string,projectID:string,pipelineID: string): Promise<Record<string, DataItem[] | undefined>> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: pipelineID}),
    ]
    const comesEntity = await cbtPost('/v1/io_items_with_pipe_id', goes);
    const InputItems: DataItem[] = JSON.parse(comesEntity.comes[0]?.content)
    const OutputItems: DataItem[] = JSON.parse(comesEntity.comes[1]?.content)
    return {
        'InputItems': InputItems,
        'OutputItems': OutputItems,
    };
}

// 获取DOM树中存储的节点ID的事件
const getEventTypeWithID = async (userID:string,projectID:string,domtreeID: string, componentID: string): Promise<string[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: componentID}),
    ]
    const comesEntity = await cbtPost('/v1/fetch_event_type_with_id', goes);
    if (comesEntity.comes && comesEntity.comes.length > 0) {
        return JSON.parse(comesEntity.comes[0]?.content);
    }
    return [];
}

// 设置DOM树中存储的节点ID
const setEventTypeWithID = async (userID:string,projectID:string,domtreeID: string, componentID: string, event_type: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: componentID}),
        createDataItem({content: event_type}),
    ]
    const comesEntity = await cbtPost('/v1/set_event_type_with_id', goes);
    return comesEntity.comes[0]?.content;
}
// 更新事件触发
const updateEventTypeWithID = async (userID:string,projectID:string,domtreeID: string, componentID: string, event_types: string[]): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: componentID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(event_types),
        }),
    ]
    const comesEntity = await cbtPost('/v1/update_event_type_with_id', goes);
    return comesEntity.comes[0]?.content;
}

// 序列化编辑器
const serializeDom = async (userID:string,projectID:string,domtreeID: string, serializeData: string): Promise<void> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: serializeData}),
    ]
    await cbtPost('/v1/serialize_dom', goes);
    return
}
// 序列化编辑器
const serializeComponentTree = async (userID:string,compType: string, serializeData: string): Promise<void> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: compType}),
        createDataItem({content: serializeData}),
    ]
    await cbtPost('/v1/serialize_component_tree', goes);
    return
}
// 序列化编辑器
const deserializeComponentTree = async (userID:string,compType: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: compType}),
    ]
    const comesEntity = await cbtPost('/v1/deserialize_component_tree', goes);
    console.log(" deserializeComponentTree 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) { return null;  }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : null;
}

// 反序列化编辑器
const deserializeDom = async (userID:string,projectID:string,domtreeID: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
    ]
    const comesEntity = await cbtPost('/v1/deserialize_dom', goes);
    console.log(" deserializeDom 返回数据 ", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : "";
}
// 删除 dom
const removeDom = async (userID:string,projectID:string,domtreeID: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
    ]
    const comesEntity = await cbtPost('/v1/remove_dom', goes);
    console.log(" removeDom 返回数据 ", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : "";
}
// 增加 dom
const addDom = async (userID:string,projectID:string ): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/add_dom', goes);
    console.log(" addDom 返回数据 ", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return ''
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : "";
}
// 备份 dom
const backupDomTree = async (userID:string,projectID:string,domtreeID: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
    ]
    const comesEntity = await cbtPost('/v1/save_deserialize_dom', goes);
    console.log(" backupDomTree 返回数据 ", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return ''
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : "";
}
// 恢复 dom
const restoreDomTree = async (userID:string,projectID:string ,domtreeID: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
    ]
    const comesEntity = await cbtPost('/v1/restore_deserialize_dom', goes);
    console.log(" restoreDomTree 返回数据 ", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return ''
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : "";
}

// 获取节点 事件处理
const getNodeIDAndTag = async (userID:string,projectID:string,domtreeID: string): Promise<any[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
    ]
    const comesEntity = await cbtPost('/v1/get_nodes_id_tag', goes);
    const ids: [string] = JSON.parse(comesEntity.comes[0]?.content)
    const tags: [any] = JSON.parse(comesEntity.comes[1]?.content)
    return ids.map((id, index) => ({
        id,
        tag: tags[index] || id
    }));
}


// 设置节点的状态
const saveStateWithID = async (userID:string,projectID:string,domtreeID: string, nodeID: string, states: StateBindItem[]): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: nodeID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(states),
        }),
    ]
    const comesEntity = await cbtPost('/v1/set_states_with_id', goes);
    console.log(" saveStateWithID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return ''
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : "";
}

const getStateWithID = async (userID:string,projectID:string,domtreeID: string, nodeID: string): Promise<StateBindItem[]> => {

    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: nodeID}),
    ]
    const comesEntity = await cbtPost('/v1/get_state_with_id', goes);
    console.log(" getStateWithID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return [];
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 获取本地状态绑定
const getLocalStateWithID = async (userID:string,projectID:string,domtreeID: string, nodeID: string): Promise<LocalStateBindItem[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: nodeID}),
    ]
    const comesEntity = await cbtPost('/v1/get_local_states_with_id', goes);
    console.log(" getLocalStateWithID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return [];
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 设置节点的本地状态
const saveLocalStateWithID = async (userID:string,projectID:string,domtreeID: string, nodeID: string, states: LocalStateBindItem[]): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: nodeID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(states),
        }),
    ]
    const comesEntity = await cbtPost('/v1/set_local_states_with_id', goes);
    console.log(" saveLocalStateWithID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return ''
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : "";
}


// 获取节点事件绑定
const getEventBindPipeWithID = async (userID:string,projectID:string,domtreeID: string, nodeID: string,): Promise<BindingItem[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: nodeID}),
    ]
    const comesEntity = await cbtPost('/v1/get_event_bind_pipe_with_id', goes);
    console.log(" getEventBindPipeWithID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return [];
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng).map((bindEntityString:string) => ({
        id: bindEntityString.split('.')[0],
        componentId: bindEntityString.split('.')[1],
        eventTrigger: bindEntityString.split('.')[2],
        pipeline: bindEntityString.split('.')[3],
    })) : [];
}
// 设置 节点事件绑定
const setEventBindPipeWithID = async (userID:string,projectID:string,domtreeID: string, nodeID: string, binds: BindingItem[]): Promise<string> => {
    const da = binds.map(bind => {
       return [bind.id,bind.componentId, bind.eventTrigger, bind.pipeline].join(".")
    })
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domtreeID}),
        createDataItem({content: nodeID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(da),
        }),
    ]
    const comesEntity = await cbtPost('/v1/set_event_bind_pipe_with_id', goes);
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng:""
}

// 获取管道类别列表
const getPipeType = async (): Promise<DynamicPipelineListProps> => {
    const goes = []
    const comesEntity = await cbtPost('/v1/list_pipe_type', goes);
    console.log("getPipeType返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return {
            headers: [],
            data: [],
        }
    }
    return {
        headers: JSON.parse(comesEntity.comes[0].content),
        data: JSON.parse(comesEntity.comes[1].content),
    }
}

// 增加管道实例
const addPipeInstance = async (newPipeInstance: PipelineInstance,userID:string, projectID: string): Promise<PipelineInstance | undefined> => {
    const goes = [
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(newPipeInstance)
        }),
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/add_pipe_instance', goes);
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return undefined;
    }
    return JSON.parse(comesEntity.comes[0].content);
}
// 增加管道实例
const removePipelineInstance = async (instanceID: string, userID: string, projectID: string): Promise<string> => {
    const goes = [
        createDataItem({content: instanceID}),
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/remove_pipe_instance', goes);
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    return JSON.parse(comesEntity.comes[0].content);
}
// 更新管道实例
const updatePipelineInstance = async (dirtyPipeInstance: PipelineInstance, userID: string, projectID: string): Promise<PipelineInstance | undefined> => {
    const goes = [
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(dirtyPipeInstance)
        }),
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/update_pipe_instance', goes);
    console.log("updatePipelineInstance 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return undefined;
    }
    return JSON.parse(comesEntity.comes[0].content);
}

// 获取管道实例列表
const getPipeInstanceList = async (userID:string, projectID: string): Promise<DynamicPipelineInstanceListProps> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/list_pipe_instance', goes);
    console.log("getPipeInstanceList返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return {
            headers: [],
            data: [],
        }
    }
    return {
        headers: JSON.parse(comesEntity.comes[0].content),
        data: JSON.parse(comesEntity.comes[1].content),
    }
}
// 获取状态相关的管道实例列表
const getStatePipeInstanceList = async (userID:string, projectID: string): Promise<DynamicPipelineInstanceListProps> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/list_state_pipe_instance', goes);
    console.log(" getStatePipeInstanceList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return {
            headers: [],
            data: [],
        }
    }
    return {
        headers: JSON.parse(comesEntity.comes[0].content),
        data: JSON.parse(comesEntity.comes[1].content),
    }
}

// 增加挂载任务
const mountPipeInstanceTask = async (pipeID: string, taskID: string, userID: string, projectID: string): Promise<PipelineInstance | null> => {
    const goes = [
        createDataItem({content: pipeID}),
        createDataItem({content: taskID}),
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/pipe_instance_mount', goes);
    console.log("mountPipeInstanceTask 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}

// 获取调度列表
const getScheduleList = async (userID:string,projectID:string): Promise<string | Record<string, any>> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/list_pipe_schedule', goes);
    console.log("getScheduleList 返回数据", comesEntity)
    if (!(comesEntity?.comes?.length > 0)) return {edges: [], position: []};
    const edges_json = comesEntity.comes[0].content;
    const position_json = comesEntity.comes[1].content;
    return comesEntity.respon_status === "OK" ? {
        edges: JSON.parse(edges_json),
        position: JSON.parse(position_json),
    } : {edges: [], position: []};

}
// 获取调度列表
const getScheduleMainPipeList = async (userID:string,projectID:string ): Promise<PipelineInstance[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/list_schedule_main_pipe', goes);
    console.log("getScheduleMainPipeList 返回数据", comesEntity)
    if (!(comesEntity?.comes?.length > 0)) return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}

// 获取管道任务流列表
const ListPipeTaskFlow = async (userID:string): Promise<PipeTaskFlowListProps> => {
    const goes = [
        createDataItem({content: userID})
    ]
    const comesEntity = await cbtPost('/v1/list_pipe_task_flow', goes);
    console.log(" ListPipeTaskFlow 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return {
            headers: [],
            data: [],
        }
    }
    return {
        headers: JSON.parse(comesEntity.comes[0].content),
        data: JSON.parse(comesEntity.comes[1].content),
    }
}
// 创建管道任务流
const addPipeTaskFlow = async (newTaskFlow: PipeTaskFlow, userID:string): Promise<PipeTaskFlow | null> => {
    const goes = [
        createDataItem({content: JSON.stringify(newTaskFlow)}),
        createDataItem({content: userID}),
    ]
    const comesEntity = await cbtPost('/v1/add_pipe_task_flow', goes);
    console.log(" addPipeTaskFlow 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}
// 更新管道任务流
const updatePipeTaskFlow = async (newTaskFlow: PipeTaskFlow, userID:string): Promise<string> => {
    const goes = [
        createDataItem({content: JSON.stringify(newTaskFlow)}),
        createDataItem({content: userID}),
    ]
    const comesEntity = await cbtPost('/v1/update_pipe_task_flow', goes);
    console.log(" updatePipeTaskFlow 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : '';
}


// 删除管道任务流
const removePipeTaskFlow = async (flowID: string,userID: string): Promise<string> => {
    const goes = [
        createDataItem({content: flowID}),
        createDataItem({content: userID}),
    ]
    const comesEntity = await cbtPost('/v1/remove_pipe_task_flow', goes);
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : '';
}

// 创建新用户
const createUser = async (userID: string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
    ]
    const comesEntity = await cbtPost('/v1/create_user', goes);
    console.log(" createUser 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng: null;
}

// 获取项目列表
const getProjectList = async (userID: string): Promise<ProjectData[]> => {
    const goes = [
        createDataItem({content: userID}),
    ]
    const comesEntity = await cbtPost('/v1/projects_list', goes);
    console.log(" getProjectList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 获取项目版本列表
const getProjectVersionList = async (userID: string, projectID:string): Promise<ProjectVersionData[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/project_version_list', goes);
    console.log(" getProjectVersionList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}
// 重新发布 119版本
const reRunProject = async (userID: string ,imageName:string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: imageName}),
    ]
    const comesEntity = await cbtPost('/v1/project_change_image', goes);
    console.log(" reRunProject 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ?cheng : null;
}
// 删除版本
const deleteVersion = async (userID: string, projectID:string , versionID:string): Promise<ProjectVersionData[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: versionID}),
    ]
    const comesEntity = await cbtPost('/v1/delete_version', goes);
    console.log(" deleteVersion 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 增加项目
const addProject = async (project:ProjectData ): Promise<string> => {
    const goes = [
        createDataItem({content: project.user_id}),
        createDataItem({content: project.project_id}),
        createDataItem({content: project.name}),
        createDataItem({content: project.description}),
        createDataItem({content: project.status}),
        createDataItem({content: project.owner_id}),
    ]
    const comesEntity = await cbtPost('/v1/add_project', goes);
    console.log(" addProject 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : '';
}

// 删除项目
const deleteProject = async (userID:string, projectID:string ): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/delete_project', goes);
    console.log(" deleteProject 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : '';
}
// 发布项目
const publishProject = async (userID:string, projectID:string,imageVersion:string  ): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: imageVersion}),
    ]
    const comesEntity = await cbtPost('/v1/publish_project', goes);
    console.log(" publishProject 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : null;
}
// 获取项目信息
const getProjectRuntime = async (userID:string, projectID:string  ): Promise<ProjectRuntimeData> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID})
    ]
    const comesEntity = await cbtPost('/v1/get_project_runtime', goes);
    console.log(" getProjectRuntime 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}
// 获取路由信息
const getRoutes = async (userID:string, projectID:string ): Promise<RouteProp[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/get_routes', goes);
    console.log(" getRoutes 返回数据", comesEntity);
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return [];
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 更新路由信息
const updateRoutes = async (userID:string, projectID:string, routers:RouteProp[]): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(routers),
        }),
    ]
    const comesEntity = await cbtPost('/v1/update_routes', goes);
    console.log(" updateRoutes 更新数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : null;
}

// 获取Dom树列表
const getPages = async (userID:string, projectID:string ): Promise<string[]> => {
    console.log(" getPages 发出数据", userID, projectID);
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/get_pages', goes);
    console.log(" getPages 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 删除指定的树列表
const deletePageWithID = async (userID:string, projectID:string, pageID:string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: pageID}),
    ]
    const comesEntity = await cbtPost('/v1/delete_page_with_id', goes);
    console.log(" deletePageWithID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return '';
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : '';
}
// 根据模型ID获取属性
const getModelDataPropWithID = async (userID:string, modelID:string ): Promise<ModelDataProp> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: modelID}),
    ]
    const comesEntity = await cbtPost('/v1/get_model_data_prop_with_id', goes);
    console.log(" getModelDataPropWithID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return null;
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}
// 写入模型属性数据
const updateModelDataProp = async (userID:string, modelData:ModelDataProp): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(modelData),
        }),
    ]
    const comesEntity = await cbtPost('/v1/update_model_data_prop', goes);
    console.log(" updateModelDataPropWithID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return '';
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : '';
}

// 生成指定代码
const generateCode = async (userID:string, functionDescribe:string,pipe_input_data:Param[],pipe_output_data:Param[]): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: functionDescribe}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(pipe_input_data),
        }),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(pipe_output_data),
        }),
    ]
    const comesEntity = await cbtPost('/v1/cbtai_2af657c784f29739f66dc90e1a0e982a0a7687c2_3', goes);
    console.log(" generateCode 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return '';
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : '';
}
// 获取当前导入的包
const getImports = async (userID:string, projectID:string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/get_imports', goes);
    console.log(" GetImport 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return '';
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng).join('')  : '';
}
// 更新当前的包
const updateImports = async (userID:string, projectID:string,data:string[]): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(data)
        }),
    ]
    const comesEntity = await cbtPost('/v1/update_imports', goes);
    console.log(" updateImports 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0) {
        return '';
    }
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : '';
}

export {
    getPages,
    getRoutes,
    updateRoutes,
    addProject,
    deleteProject,
    createUser,
    getProjectList,
    getProjectVersionList,
    reRunProject,
    getEventType,
    getPipeType,
    getPipeInstanceList,
    getStatePipeInstanceList,
    publishProject,
    getProjectRuntime,
    deleteVersion,
    addPipeInstance,
    getScheduleList,
    getScheduleMainPipeList,
    addPipeTaskFlow,
    updatePipeTaskFlow,
    ListPipeTaskFlow,
    removePipeTaskFlow,
    removePipelineInstance,
    updatePipelineInstance,
    mountPipeInstanceTask,
    getComponents,
    getRuntimeComponents,
    getComponentNames,
    updateComponent,
    updateComponentIndex,
    deleteComponentType,
    fetchConfigForCompo,
    updateComponentConfig,
    updateDynamicImport,
    getIOItemsWithPipeID,
    getEventTypeWithID,
    setEventTypeWithID,
    updateEventTypeWithID,
    serializeDom,
    deserializeDom,
    removeDom,
    addDom,
    backupDomTree,
    restoreDomTree,
    getNodeIDAndTag,
    saveStateWithID,
    getStateWithID,
    getLocalStateWithID,
    saveLocalStateWithID,
    getEventBindPipeWithID,
    setEventBindPipeWithID,
    serializeComponentTree,
    deserializeComponentTree,
    updateModelDataProp,
    getModelDataPropWithID,
    deletePageWithID,
    generateCode,
    getImports,
    updateImports,
}

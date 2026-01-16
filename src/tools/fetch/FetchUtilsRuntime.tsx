import {createDataItem, cbtPost, ProjRunProp, ExecuteState, ScheduleExecuteStateProps} from "@/tools";
import {DaFormat, DaType} from "@/entity";
// 获取组件
const getComponentWithName = async (componentName: string, userID:string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: componentName}),
    ]
    const comesEntity = await cbtPost('/v1/get_component_with_name', goes);
    console.log(" getComponentWithName 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}
// 获取当前执行的调度的记录
const getScheduleStateList = async (userID:string, projectID:string): Promise<ScheduleExecuteStateProps> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/list_schedule_state', goes);
    console.log(" getScheduleStateList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const scheduleProps: ExecuteState[] = JSON.parse(comesEntity.comes[0]?.content)
    const headers: string[] = JSON.parse(comesEntity.comes[1]?.content)
    return comesEntity.respon_status === "OK" ? {
        scheduleProps,
        headers,
    } : null;
}
// 修改调度状态
const changeScheduleStateRecord = async (userID:string, projectID:string, scheduleID:string, isRecord:boolean): Promise<Record<string, any>> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: scheduleID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(isRecord),
        }),
    ]
    const comesEntity = await cbtPost('/v1/change_schedule_state_record', goes);
    console.log(" changeScheduleStateRecord 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}
// 登录
// 通用 用户密码校验
const authentication =  async (userID: string, password:string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: password}),
    ]
    const comesEntity = await cbtPost('/v1/authentication', goes);
    console.log(" authentication 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}

// 获取归属ID的组件库
const getComponentsOwnerIDs =  async (): Promise<string[]> => {
    const goes = []
    const comesEntity = await cbtPost('/v1/get_components_owner_ids', goes);
    console.log(" getComponentsOwnerIDs 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return [];
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}
// 获取归属ID的组件库
const getNodesStatedWithPageID =  async (userID:string, projectID:string,domPageID:string): Promise<string[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: domPageID}),
    ]
    const comesEntity = await cbtPost('/v1/get_nodes_stated_with_page_id', goes);
    console.log(" getNodesStatedWithPageID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return [];
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 启动生成的可执行任务
const createPipeRuntimeController =  async (userID:string, projectID:string ): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID})
    ]
    const comesEntity = await cbtPost('/v1/create_pipe_runtime_controller', goes);
    console.log(" createPipeRuntimeController 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return '';
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng : '';
}
// 获取指定项目当前执行的PID
const getPipeRuntimeControllerPID =  async (userID:string, projectID:string ): Promise<ProjRunProp[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID})
    ]
    const comesEntity = await cbtPost('/v1/get_pipe_runtime_pid_controller', goes);
    console.log(" getPipeRuntimeControllerPID 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return [];
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : [];
}

// 停止执行的PID
const stopPipeRuntimeController =  async (userID:string, projectID:string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtPost('/v1/stop_pipe_runtime_pid_controller', goes);
    console.log(" stopPipeRuntimeController 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return '';
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng: '';
}

export {
    getComponentsOwnerIDs,
    getNodesStatedWithPageID,
    getComponentWithName,
    authentication,
    createPipeRuntimeController,
    getPipeRuntimeControllerPID,
    stopPipeRuntimeController,
    getScheduleStateList,
    changeScheduleStateRecord,
}

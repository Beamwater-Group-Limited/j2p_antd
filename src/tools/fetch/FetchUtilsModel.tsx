import {createDataItem, LlmProps, cbtModelPost, DownloadTask, CnnProps, DownloadProps, LongrunProps} from "@/tools";
import {DaFormat, DaType} from "@/entity";

// 获取现有模型
const getLlmList = async (userID:string,projectID: string): Promise<Record<string, any>> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtModelPost('/v1/get_model_list', goes);
    console.log(" getLlmList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const llmProps: LlmProps[] = JSON.parse(comesEntity.comes[0]?.content)
    const headers: string[] = JSON.parse(comesEntity.comes[1]?.content)
    return comesEntity.respon_status === "OK" ? {
        llmProps,
        headers,
    } : null;
}

// 获取现有模型
const getCnnList = async (userID:string,projectID: string): Promise<Record<string, any>> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtModelPost('/v1/get_cnn_model_list', goes);
    console.log(" getCnnList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cnnProps: CnnProps[] = JSON.parse(comesEntity.comes[0]?.content)
    const headers: string[] = JSON.parse(comesEntity.comes[1]?.content)
    return comesEntity.respon_status === "OK" ? {
        cnnProps,
        headers,
    } : null;
}
// 获取现有长运行
const getLongrunList = async (userID:string,projectID: string): Promise<Record<string, any>> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtModelPost('/v1/get_longrun_list', goes);
    console.log(" getLongrunList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const longrunProps: LongrunProps[] = JSON.parse(comesEntity.comes[0]?.content)
    const headers: string[] = JSON.parse(comesEntity.comes[1]?.content)
    return comesEntity.respon_status === "OK" ? {
        longrunProps,
        headers,
    } : null;
}

// 获取模型的权重
const getCnnWeightList =  async (userID: string, projectID:string, modelID:string): Promise<string[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: modelID}),
    ]
    const comesEntity = await cbtModelPost('/v1/get_cnn_weight_list', goes);
    console.log(" getCnnWeightList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}


// 通用 获取模型版本列表
const getModelVersionList =  async (userID: string, projectID:string, modelID:string): Promise<string[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: modelID}),
    ]
    const comesEntity = await cbtModelPost('/v1/get_model_version_list', goes);
    console.log(" getModelVersionList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? JSON.parse(cheng) : null;
}

// 下载LLM模型
const downloadLlmModel =  async (userID: string, projectID:string,llmDownload:DownloadProps): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(llmDownload),
        }),
    ]
    const comesEntity = await cbtModelPost('/v1/download_model', goes);
    console.log(" downloadLlmModel 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng: null;
}
// 下载CNN模型
const downloadCnnModel =  async (userID: string, projectID:string,cnnDownload:DownloadProps): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(cnnDownload),
        }),
    ]
    const comesEntity = await cbtModelPost('/v1/download_cnn_model', goes);
    console.log(" downloadCnnModel 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng: null;
}
// 注册长运行模型
const downloadLongrunModel =  async (userID: string, projectID:string,longrunDownload:DownloadProps): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(longrunDownload),
        }),
    ]
    const comesEntity = await cbtModelPost('/v1/download_longrun_model', goes);
    console.log(" downloadLongrunModel 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng: null;
}

// 删除长运行模型
const removeLongrunModel =  async (userID: string, projectID:string,modelID:string): Promise<string> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({content: modelID}),
    ]
    const comesEntity = await cbtModelPost('/v1/remove_longrun_model', goes);
    console.log(" removeLongrunModel 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return null;
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ? cheng: null;
}

// 查询下载任务
const queryDownloadModelTask =  async (userID: string, projectID:string,downloadTaskIDS:string[]): Promise<DownloadTask[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
        createDataItem({
            type: DaType.APPLICATION,
            format: DaFormat.FSTRING,
            content: JSON.stringify(downloadTaskIDS),
        }),
    ]
    const comesEntity = await cbtModelPost('/v1/query_tasks', goes);
    console.log(" queryDownloadModelTask 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return [];
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ?  JSON.parse(cheng): [];
}

// 获取执行的任务
const tasksRunList =  async (userID: string, projectID:string): Promise<any[]> => {
    const goes = [
        createDataItem({content: userID}),
        createDataItem({content: projectID}),
    ]
    const comesEntity = await cbtModelPost('/v1/tasks_run_list', goes);
    console.log(" tasksRunList 返回数据", comesEntity)
    if (!comesEntity || !comesEntity.comes || comesEntity.comes.length === 0)  return [];
    const cheng = comesEntity.comes[0].content;
    return comesEntity.respon_status === "OK" ?  JSON.parse(cheng): [];
}

export {
    getLlmList,
    getCnnList,
    getLongrunList,
    downloadLlmModel,
    downloadCnnModel,
    downloadLongrunModel,
    removeLongrunModel,
    getModelVersionList,
    getCnnWeightList,
    queryDownloadModelTask,
    tasksRunList,
}

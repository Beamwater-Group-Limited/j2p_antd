import React, {useContext, useEffect, useRef, useState} from "react";
import {useEditor} from "@craftjs/core";
import {useAppConfig, usePagesData, useProject} from "@/context";
import {Alert, Button, Card, Form, List, Modal, Select, Spin} from "antd";
import {
    BindingItem, deepEqual,
    getEventBindPipeWithID,
    getEventTypeWithID, getNodeIDAndTag, getScheduleMainPipeList, getStatePipeInstanceList, ListItem, PipelineInstance,
    setEventBindPipeWithID,
} from "@/tools";
import {v4} from "uuid";

export const EventHandlerSettingPanel: React.FC = () => {
    // 使用 useContext 从全局上下文中获取 globalId
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    const {pageData} = usePagesData()
    const [loading, setLoading] = useState<boolean>(true);      // 加载状态
    const {selected, query} = useEditor(state => {
        const [currentNodeId] = state.events.selected;
        let selected: { id: string; };
        if (currentNodeId) {
            selected = {
                id: currentNodeId,
            };
        }
        return {selected};
    });
    // 指定事件处理器绑定
    const [handlerForm] = Form.useForm();
    // 来源事件触发器列表
    const [sourceEventTriggerList, setSourceEventTriggerList] = useState<string[]>()
    // 当编辑项为空时，表示新增
    const [editingItem, setEditingItem] = useState<BindingItem | null>(null);
    // 模块可视状态
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    // 组件列表
    const [componentList, setComponentList] = useState<ListItem[]>()
    // 组件选中状态
    const [comID, setComID] = useState<string | undefined>(undefined);
    // 获取页面上的所有组件
    useEffect(() => {
        const fetchComponentList = async () => {
            const data = await getNodeIDAndTag(appConfig.userID, projectConfig.project_id, pageData.pageID);
            const data_description = data.map(item => {
                return {
                    id: item.id,
                    tag: item.tag,
                    description: query.node(item.id).get().data.props.children || item.id,
                }
            })
            setComponentList(data_description);
        };
        fetchComponentList();
    }, []);
    // 获取组件的事件触发器
    useEffect(() => {
        setLoading(true);
        const fetchEventTriggerListWithID = async () => {
            const cheng = await getEventTypeWithID(appConfig.userID, projectConfig.project_id, pageData.pageID, comID);
            setSourceEventTriggerList(cheng);
            setLoading(false);
        }
        fetchEventTriggerListWithID();
    }, [comID]);
    // 组件选择后获取 事件绑定
    useEffect(() => {
        setLoading(true)
        const fetchEventBindPipeListWithID = async () => {
            const cheng: BindingItem[] = await getEventBindPipeWithID(appConfig.userID, projectConfig.project_id, pageData.pageID, selected.id);
            console.log('获取节点事件处理绑定管道', cheng)
            preBindgList.current = cheng;
            setBindingList(cheng);
            setLoading(false);
        }
        fetchEventBindPipeListWithID().then(console.log)
    }, [selected]);

    const updateEventBindPipeListWithID = async (bindings:BindingItem[]) => {
        try {
            console.log("保存绑定信息", appConfig.userID, projectConfig.project_id, pageData.pageID, selected.id, bindings)
            const cheng = await setEventBindPipeWithID(appConfig.userID, projectConfig.project_id, pageData.pageID, selected.id, bindings);
            console.log('保存事件绑定', cheng)
        } catch (error) {
            console.error(error)
        }
    };
    // 事件处理绑定列表
    const [bindingList, setBindingList] = useState<BindingItem[]>([]);
    const preBindgList = useRef(bindingList)
    // 存储事件绑定
    useEffect(() => {
        console.log("绑定数据", bindingList)
        // 防止 为0 的时候，或者返回空数组的时候 更新 为0不应该退出
        if (!bindingList) return;
        if(!deepEqual(bindingList, preBindgList.current)){
            console.log("更新绑定状态", bindingList)
            preBindgList.current = bindingList
            updateEventBindPipeListWithID(bindingList).then(console.log)
        }
    }, [bindingList]);

    // 删除事件触发器
    const handleAdd = () => {
        setEditingItem(null);
        handlerForm.resetFields();
        setIsModalVisible(true);
    };
    // 确定对话框时，保存新增或编辑的数据
    const handleOk = () => {
        handlerForm.validateFields()
            .then(values => {
                if (editingItem) {
                    // 编辑：更新现有项 从头过一遍
                    setBindingList(prev =>
                        prev.map(item => (item.id === editingItem.id ? {...item, ...values} : item))
                    );
                } else {
                    // 新增：生成一个唯一 id（此处仅作示例，可使用 uuid）
                    const newItem: BindingItem = {
                        id: v4().replace(/-/g, '').slice(0, 8),
                        ...values
                    };
                    setBindingList(prev => [...prev, newItem]);
                }
                setIsModalVisible(false);
            })
            .catch(info => {
                console.log("校验失败:", info);
            });
    };
    // 打开编辑对话框，将当前项数据填入表单
    const handleEdit = (item: BindingItem) => {
        setEditingItem(item);
        handlerForm.setFieldsValue(item);
        setIsModalVisible(true);
    };
    // 删除绑定项
    const handleDelete = (id: string) => {
        setBindingList(prev => prev.filter(item => item.id !== id));
    };
    // 取消对话框
    const handleCancel = () => {
        setIsModalVisible(false);
    };
    // 可绑定执行调度主管道
    const [scheduleMainPipeList, setScheduleMainPipeList] = useState<PipelineInstance[]>([]);
    useEffect(() => {
        const fetchScheduleMainPipeList = async () => {
            const cheng = await getScheduleMainPipeList(appConfig.userID, projectConfig.project_id);
            console.log("获取调度执行主管道ID列表", cheng)
            setScheduleMainPipeList(cheng)
        };
        fetchScheduleMainPipeList();
    }, []);
    // 管道实例列表
    const [pipeInstanceList, setPipeInstanceList] = useState<PipelineInstance[]>([]);
    // 获取状态相关的管道实例列表
    useEffect(() => {
        const getStateRelatedPipelineInstanceList = async () => {
            const cheng = await getStatePipeInstanceList(appConfig.userID, projectConfig.project_id)
            console.log("获取和状态相关的管道实例列表", cheng)
            if (cheng) {
                setPipeInstanceList(cheng.data)
            }
        };
        getStateRelatedPipelineInstanceList();
    }, []);
    // 可绑定管道列表
    return (
        // todo 修改布局
        <Card title="事件处理配置" className="w-full max-w-md shadow-md border rounded-lg mb-4">
            <Button type="primary" onClick={handleAdd} style={{marginBottom: 16}}>
                新增绑定项
            </Button>
            <List
                bordered
                dataSource={bindingList}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Button type="link" onClick={() => handleEdit(item)}> 编辑
                            </Button>,
                            <Button type="link" danger onClick={() => handleDelete(item.id)}> 删除
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            title={`组件ID：${item.componentId}，事件触发器：${item.eventTrigger}`}
                            description={`绑定管道：${item.pipeline}`}
                        />
                    </List.Item>
                )}
            />
            <Modal
                title={editingItem ? "编辑绑定项" : "新增绑定项"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    form={handlerForm}
                    layout="vertical">
                    <Form.Item
                        name="componentId"
                        label="组件ID"
                        rules={[{ required: true, message: "请选择组件ID" }]}
                    >
                        {loading ? (
                            <Spin />
                        ) : (
                            <Select
                                placeholder="请选择组件ID"
                                value={componentList?.[0]?.id} // 默认选第一个
                                onChange={(value) => setComID(value)}
                            >
                                {[...(componentList || [])]
                                    .sort((a, b) => {
                                        // 转小写保证忽略大小写
                                        const tagA = a.tag?.toLowerCase() || "";
                                        const tagB = b.tag?.toLowerCase() || "";

                                        // ① 按 tag 排序
                                        const tagCompare = tagA.localeCompare(tagB, "en");
                                        if (tagCompare !== 0) return tagCompare;

                                        // ② tag 一样时，按 id 排序（自然顺序 + 忽略大小写）
                                        const idA = a.id?.toLowerCase() || "";
                                        const idB = b.id?.toLowerCase() || "";
                                        return idA.localeCompare(idB, "en", { numeric: true });
                                    })
                                    .map((item) => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {`${item.tag}-${item.description}-${item.id}`}
                                        </Select.Option>
                                    ))}
                            </Select>
                        )}
                    </Form.Item>

                    {/*<Form.Item*/}
                    {/*    name="componentId"*/}
                    {/*    label="组件ID"*/}
                    {/*    rules={[{required: true, message: "请选择组件ID"}]}*/}
                    {/*>*/}
                    {/*    {loading ? ( // 如果仍在加载，显示 Spin 动画*/}
                    {/*        <Spin/>*/}
                    {/*    ) : (*/}
                    {/*        <Select*/}
                    {/*            value={componentList && componentList[0] && componentList[0].id} // 默认使用当前的状态值，或者 选择第一个选项*/}
                    {/*            onChange={(value) => {*/}
                    {/*                setComID(value);*/}
                    {/*            }}*/}
                    {/*        >*/}
                    {/*            {componentList?.map((item: ListItem) => (*/}
                    {/*                <Select.Option key={item.id} value={item.id}>*/}
                    {/*                    {`${item.tag}-${item.description}-${item.id}`}*/}
                    {/*                </Select.Option>*/}
                    {/*            ))}*/}
                    {/*        </Select>*/}
                    {/*    )}*/}
                    {/*</Form.Item>*/}
                    <Form.Item
                        name="eventTrigger"
                        label="来源事件触发器"
                        rules={[{required: true, message: "组件相关的事件触发器"}]}
                    >
                        {loading ? ( // 如果仍在加载，显示 Spin 动画
                            <Spin/>
                        ) : (
                            <Select
                                mode="tags"
                                value={sourceEventTriggerList && sourceEventTriggerList[0] ? sourceEventTriggerList[0] : undefined} // 默认使用当前的状态值，或者 选择第一个选项
                                disabled={!comID}
                            >
                                {sourceEventTriggerList?.map((option: string, index) => (
                                    <Select.Option
                                        key={`${option}_${index}`}
                                        value={option}
                                    >
                                        {option}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item
                        name="pipeline"
                        label="绑定管道"
                        rules={[{ required: true, message: "请选择绑定管道" }]}
                    >
                        <Select placeholder="请选择绑定管道">
                            {[...(scheduleMainPipeList ?? []), ...(pipeInstanceList ?? [])]
                                .sort((a, b) => {
                                    const nameA = a.pipe_instance_name;
                                    const nameB = b.pipe_instance_name;

                                    const isLetterA = /^[A-Za-z]/.test(nameA);
                                    const isLetterB = /^[A-Za-z]/.test(nameB);

                                    if (isLetterA && !isLetterB) return -1;
                                    if (!isLetterA && isLetterB) return 1;

                                    // 中文或混合按 Unicode 排序
                                    return nameA.localeCompare(nameB, 'zh');
                                })
                                .map((item) => (
                                    <Select.Option
                                        key={`pipe-${item.id}`}
                                        value={item.id}
                                    >
                                        {item.pipe_instance_name}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>

                    {/*<Form.Item*/}
                    {/*    name="pipeline"*/}
                    {/*    label="绑定管道"*/}
                    {/*    rules={[{required: true, message: "请选择绑定管道"}]}*/}
                    {/*>*/}
                    {/*    <Select placeholder="请选择绑定管道">*/}
                    {/*        {scheduleMainPipeList?.map((item) => (*/}
                    {/*            <Select.Option*/}
                    {/*                key={`main-${item.id}`}*/}
                    {/*                value={item.id}*/}
                    {/*            >{item.pipe_instance_name}*/}
                    {/*            </Select.Option>*/}
                    {/*        ))}*/}
                    {/*        {pipeInstanceList?.map((item) => (*/}
                    {/*            <Select.Option*/}
                    {/*                key={`state-${item.id}`}*/}
                    {/*                value={item.id}*/}
                    {/*            >{item.pipe_instance_name}*/}
                    {/*            </Select.Option>*/}
                    {/*        ))}*/}
                    {/*    </Select>*/}
                    {/*</Form.Item>*/}
                </Form>
            </Modal>
        </Card>
    );
};

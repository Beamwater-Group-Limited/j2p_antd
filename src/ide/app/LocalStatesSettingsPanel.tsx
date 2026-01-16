import React, {useEffect, useRef, useState} from "react";
import {Form, Select, Button, Modal, List, Card, Space, Spin} from "antd";
import {useEditor} from "@craftjs/core";
import {
    fetchConfigForCompo,
    deepEqual,
    LocalStateBindItem,
    saveLocalStateWithID,
    getLocalStateWithID,
    ListItem,
    getNodeIDAndTag,
    StateItem,
} from "@/tools";

import {useAppConfig, usePagesData, useProject} from "@/context";

export const LocalStatesSettingsPanel: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);      // 加载状态
    // 更多用于选择性获取节点
    const {selected,query} = useEditor((state,) => {
        const [currentNodeId] = state.events.selected;
        let selected: { id: string, name: string };
        if (currentNodeId) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.name,
            };
        }
        return {selected};
    });
    // 使用 useContext 从全局上下文中获取 globalId
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    const {pageData} =usePagesData()
    // 组件列表
    const [componentList, setComponentList] = useState<ListItem[]>()
    const [com, setCom] = useState<ListItem | undefined>(undefined);
    // 状态列表来自配置文件
    const [stateKey, setStateKey] = useState<string[]>([]);
    const [editingState, setEditingState] = useState<LocalStateBindItem | null>(null); // 当前编辑的状态绑定
    const [editingStateIndex, setEditingStateIndex] = useState(null) // 当前编辑的索引
    const [isModalVisible, setIsModalVisible] = useState(false); // 模态框可见性
    // 编辑还是新增
    const [isEdit, setIsEdit] = useState(false);
    // 选中组件对应的状态列表
    const [nodeStates, setNodeStates] = useState< StateItem[]>([]);
    const [form] = Form.useForm();
    // 编辑模态框
    const handleEdit = (state: LocalStateBindItem, index:number) => {
        setIsEdit(true);            // 设置编辑状态
        setEditingState(state); // 设置当前编辑的状态
        setEditingStateIndex(index); // 设置当前编辑的索引
        setIsModalVisible(true); // 显示模态框
        // 填充表单初始值
        form.setFieldsValue({
            state: state.stateName,
            nodeID: state.nodeID,
            nodeStateName: state.nodeStateName,
        });
    };
    //删除绑定项
    const removeBindItem = (state:LocalStateBindItem, index:number) => {
        const deletedStatesBind = statesBind.filter((item,i) => !(index === i))
        console.log("删除后的结果", deletedStatesBind)
        setStatesBind(deletedStatesBind)
    }

    // 保存编辑结果
    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                // values 是新输入的值
                if (editingState) {
                    console.log("需要被更新的内容/最新的内容/总内容", editingState, values, statesBind)
                    // 更新状态列表
                    setStatesBind((prev) =>
                        prev.map((state,index) =>
                           index === editingStateIndex
                                ? {...state, nodeID: values.nodeID, nodeStateName:values.nodeStateName} // 替换选中状态的组件ID和状态名称
                                : state
                        )
                    );
                    setEditingState(null); // 清空编辑项
                    setIsModalVisible(false); // 隐藏模态框
                }else {
                    const newBinder = {
                        stateName:values.state,
                        nodeID:values.nodeID,
                        nodeStateName:values.nodeStateName
                    }
                    setStatesBind([...statesBind, newBinder])
                    setEditingState(null); // 清空编辑项
                    setIsModalVisible(false); // 隐藏模态框
                }
            }).catch((error) => {
            console.log("表单校验失败:", error);
        });
    };
    // 获取状态相关的管道实例列表
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

    // 获取组件的状态
    useEffect(() => {
        const fetchConfigWithNodeID = async () => {
            console.log("获取组件", com)
            if (!com) return;
            const nodeConfig = await fetchConfigForCompo(projectConfig.owner_id,com.tag)
            if (!nodeConfig) return;
            // 设置选中组件的可选状态
            setNodeStates(nodeConfig.states)
        }
        fetchConfigWithNodeID();
    }, [com]);

    // 获取组件配置文件 用于 获取状态key
    useEffect(() => {
        setLoading(true);
        const fetchStates = async () => {
            const cheng = await getLocalStateWithID(appConfig.userID,projectConfig.project_id,pageData.pageID, selected.id);
            console.log("获取本地绑定状态", cheng)
            preStatesBind.current = cheng
            setStatesBind(cheng);
            setLoading(false)
        };
        fetchStates();
        const fetchConfig = async () => {
            const config = await fetchConfigForCompo(projectConfig.owner_id,selected.name)
            if (!config) return;
            console.log("从服务器加载配置文件", config)
            const stateKeys = config.states.map(state =>
                state.key
            )
            // 设置本组件的状态
            setStateKey(stateKeys)
        };
        fetchConfig();
    }, [selected]);

    const [statesBind, setStatesBind] = useState<LocalStateBindItem[]>(); // 状态列表
    const preStatesBind = useRef(statesBind)
    // 保存状态绑定的状态列表
    useEffect(() => {
        if (!statesBind) return;
        if(!deepEqual(statesBind, preStatesBind.current)){
            console.log("更新本地绑定状态", statesBind)
            saveLocalStateWithID(appConfig.userID, projectConfig.project_id,pageData.pageID, selected.id, statesBind)
            preStatesBind.current = statesBind;
        }
    }, [statesBind]);

    if (loading)
        return (
        <div className="loading-container">
            { appConfig.IS_SPIN?
                <Spin tip="加载中，请稍等..." size="large" />:
                <div/>
            }
        </div>
    );
    return (
        <Card title="状态本地绑定配置"
              className="w-full max-w-md shadow-md border rounded-lg mb-4">
            <Button
                type="primary"
                className="w-full my-2"
                onClick={() => {
                    form.resetFields();
                    setEditingState(null); // Clear the current editing state
                    setIsModalVisible(true); // Show the modal
                }}
            >
                添加新绑定
            </Button>
            <List
                bordered
                dataSource={statesBind}
                renderItem={(state,index) => (
                    <List.Item
                        actions={[
                            <Space>
                                <Button type="link"
                                        className="p-0 h-auto" // Tailwind
                                        onClick={() => handleEdit(state,index)}>
                                    编辑
                                </Button>,
                                <Button
                                    type="primary"
                                    onClick={() => removeBindItem(state,index)}
                                >
                                    删除绑定
                                </Button>
                            </Space>
                        ]}
                    >
                        {state.stateName}.{state.nodeID}.{state.nodeStateName}
                    </List.Item>
                )}
            />
            {/* 编辑模态框 */}
            <Modal
                title={isEdit ? "编辑本地状态绑定" : "新建本地状态绑定"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={handleSave}
            >
                <Form form={form}
                      layout="vertical">
                    {/* 状态选择 */}
                    <Form.Item
                        name="state"
                        label="需要被改变的本组件的状态"
                        rules={[{required: true, message: "请选择状态"}]}
                    >
                        <Select
                            placeholder="请选择状态"
                        >
                            {stateKey && stateKey.map(key => (
                                <Select.Option key={key} value={key}>
                                    {key}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {/* 状态选择 */}
                    <Form.Item
                        name="nodeID"
                        label="状态改变的来源组件"
                        rules={[{ required: true, message: "请选择组件" }]}
                    >
                        <Select
                            placeholder="请选择组件"
                            value={componentList?.[0]?.id} // 默认选第一个
                            onChange={(value) => {
                                const item = componentList?.find((item) => item.id === value);
                                setCom(item);
                            }}
                        >
                            {componentList &&
                                [...componentList]
                                    .sort((a, b) => {
                                        const tagA = a.tag?.toLowerCase() || "";
                                        const tagB = b.tag?.toLowerCase() || "";

                                        // ① 先按 tag 字母顺序排序
                                        const tagCompare = tagA.localeCompare(tagB, "en");
                                        if (tagCompare !== 0) return tagCompare;

                                        // ② tag 一样时，按 id 排序（保持稳定）
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
                    </Form.Item>

                    {/*<Form.Item*/}
                    {/*    name="nodeID"*/}
                    {/*    label="组件选择"*/}
                    {/*    rules={[{required: true, message: "请选择组件"}]}*/}
                    {/*>*/}
                    {/*    <Select*/}
                    {/*        value={componentList && componentList[0] && componentList[0].id} // 默认使用当前的状态值，或者 选择第一个选项*/}
                    {/*        onChange={(value) => {*/}
                    {/*            const item = componentList?.find(item => item.id === value) || undefined;*/}
                    {/*            setCom(item);*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        {componentList?.map((item: ListItem) => (*/}
                    {/*            <Select.Option key={item.id} value={item.id}>*/}
                    {/*                {`${item.tag}-${item.description}-${item.id}`}*/}
                    {/*            </Select.Option>*/}
                    {/*        ))}*/}
                    {/*    </Select>*/}
                    {/*</Form.Item>*/}
                    {/* 状态选择 */}
                    <Form.Item
                        name="nodeStateName"
                        label="状态改变的来源组件的来源状态"
                        rules={[{required: true, message: "请选择组件状态"}]}
                    >{
                        com && nodeStates && nodeStates.length > 0 && (
                            <Select
                                placeholder="请选择组件状态"
                            >
                                { nodeStates.map(stateItem => (
                                    <Select.Option key={stateItem.key} value={stateItem.key}>
                                        {`${com.id}.${stateItem.key}`}
                                    </Select.Option>
                                ))}
                            </Select>
                        )
                    }
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

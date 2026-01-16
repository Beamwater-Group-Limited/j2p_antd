import React, {useContext, useEffect, useRef, useState} from "react";
import {Form, Select, Button, Modal, List, Card, Space, Spin} from "antd";
import {useEditor} from "@craftjs/core";
import {
    getStateWithID,
    getStatePipeInstanceList,
    PipelineInstance,
    saveStateWithID,
    StateBindItem,
    fetchConfigForCompo, deepEqual,
} from "@/tools";

import {useAppConfig, usePagesData, useProject} from "@/context";

export const StatesSettingsPanel: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);      // 加载状态
    // 更多用于选择性获取节点
    const {selected} = useEditor((state,) => {
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
    // 状态列表来自配置文件
    const [stateKey, setStateKey] = useState<string[]>([]);
    const [editingState, setEditingState] = useState<StateBindItem | null>(null); // 当前编辑的状态绑定
    const [editingStateIndex, setEditingStateIndex] = useState(null) // 当前编辑的索引
    const [isModalVisible, setIsModalVisible] = useState(false); // 模态框可见性
    // 编辑还是新增
    const [isEdit, setIsEdit] = useState(false);
    const [form] = Form.useForm();
    // 编辑模态框
    const handleEdit = (state: StateBindItem, index:number) => {
        setIsEdit(true);            // 设置编辑状态
        setEditingState(state); // 设置当前编辑的状态
        setEditingStateIndex(index); // 设置当前编辑的索引
        setIsModalVisible(true); // 显示模态框
        // 填充表单初始值
        form.setFieldsValue({
            state: state.stateName,
            pipe: state.pipeID,
        });
    };
    //删除绑定项
    const removeBindItem = (state:StateBindItem, index:number) => {
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
                                ? {...state, pipeID: values.pipe} // 替换选中状态的管道和参数
                                : state
                        )
                    );
                    setEditingState(null); // 清空编辑项
                    setIsModalVisible(false); // 隐藏模态框
                }else {
                    const newBinder = {
                        stateName:values.state,
                        pipeID:values.pipe
                    }
                    setStatesBind([...statesBind, newBinder])
                    setEditingState(null); // 清空编辑项
                    setIsModalVisible(false); // 隐藏模态框
                }
            }).catch((error) => {
            console.log("表单校验失败:", error);
        });
    };
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

    // 获取组件配置文件 用于 获取状态key
    useEffect(() => {
        setLoading(true);
        const fetchStates = async () => {
            const cheng = await getStateWithID(appConfig.userID,projectConfig.project_id,pageData.pageID, selected.id);
            console.log("获取组件状态", cheng)
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
            setStateKey(stateKeys)
        };
        fetchConfig();
    }, [selected]);

    const [statesBind, setStatesBind] = useState<StateBindItem[]>(); // 状态列表
    const preStatesBind = useRef(statesBind)
    // 保存状态绑定的管道实例
    useEffect(() => {
        console.log("最新组件绑定状态", statesBind)
        if (!statesBind) return;
        if(!deepEqual(statesBind, preStatesBind.current)){
            console.log("更新组件状态", statesBind)
            saveStateWithID(appConfig.userID, projectConfig.project_id,pageData.pageID, selected.id, statesBind)
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
        <Card title="状态管道绑定配置"
              className="w-full max-w-md shadow-md border rounded-lg mb-4">
            <Button
                type="primary"
                className="w-full my-2"
                onClick={() => {
                    // Reset the form for a new state
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
                        {state.stateName}.{state.pipeID}
                    </List.Item>
                )}
            />
            {/* 编辑模态框 */}
            <Modal
                title={isEdit ? "编辑状态绑定" : "新建状态绑定"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={handleSave}
            >
                <Form form={form}
                      layout="vertical">
                    {/* 状态选择 */}
                    <Form.Item
                        name="state"
                        label="状态选择"
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
                    {/* 管道选择 */}
                    <Form.Item
                        name="pipe"
                        label="管道选择"
                        rules={[{ required: true, message: "请选择管道" }]}
                    >
                        <Select placeholder="请选择管道">
                            {pipeInstanceList &&
                                [...pipeInstanceList]
                                    .sort((a, b) => {
                                        const idA = a.id.toLowerCase().slice(0, 8);
                                        const idB = b.id.toLowerCase().slice(0, 8);

                                        const len = Math.max(idA.length, idB.length);

                                        for (let i = 0; i < len; i++) {
                                            const charA = idA[i] || "";
                                            const charB = idB[i] || "";

                                            // 数字优先：0–9 在前，a–z 在后
                                            const isNumA = /\d/.test(charA);
                                            const isNumB = /\d/.test(charB);

                                            if (isNumA && !isNumB) return -1;
                                            if (!isNumA && isNumB) return 1;

                                            // 如果同类型（都数字或都字母），则用 localeCompare 比较
                                            if (charA !== charB) {
                                                return charA.localeCompare(charB, "en");
                                            }
                                        }

                                        // 前8位完全相同 → 按 describe 排序（支持中文拼音）
                                        return a.describe.localeCompare(b.describe, "zh-Hans-CN");
                                    })
                                    .map((pipeline) => (
                                        <Select.Option key={pipeline.id} value={pipeline.id}>
                                            {`${pipeline.id}.${pipeline.describe}`}
                                        </Select.Option>
                                    ))}
                        </Select>

                    </Form.Item>


                    {/*<Form.Item*/}
                    {/*    name="pipe"*/}
                    {/*    label="管道选择"*/}
                    {/*    rules={[{required: true, message: "请选择管道"}]}*/}
                    {/*>*/}
                    {/*    <Select*/}
                    {/*        placeholder="请选择管道"*/}
                    {/*    >*/}
                    {/*        {pipeInstanceList && pipeInstanceList.map(pipeline => (*/}
                    {/*            <Select.Option key={pipeline.id} value={pipeline.id}>*/}
                    {/*                {`${pipeline.id}.${pipeline.describe}`}*/}
                    {/*            </Select.Option>*/}
                    {/*        ))}*/}
                    {/*    </Select>*/}
                    {/*</Form.Item>*/}
                </Form>
            </Modal>
        </Card>
    );
};

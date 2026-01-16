import React, {  useEffect, useState} from "react";
import {Button, Modal, Form, Table, Space, Input} from "antd";
import {
    addPipeTaskFlow,
    generateTaskFlow, openBpmnWithFlowID,
    Param, PipeTaskFlow, PipeTaskFlowListProps, removePipeTaskFlow, updatePipeTaskFlow
} from "@/tools";
import {useAppConfig, useProject} from "@/context";
interface AddPipeTaskFlowModalProps extends PipeTaskFlowListProps{
    onDataChange: () => void;
}

export const PipeTaskFlowList: React.FC<AddPipeTaskFlowModalProps> = ({ headers, data, onDataChange}) => {
    // 使用 useContext 从全局上下文中获取 globalId
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    // 管道任务流列表
    const [pipeTaskFlow, setPipeTaskFlow] = useState<PipeTaskFlow[]>([]);
    // 弹出对话框控制状态
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    // 当前正在配置的管道实例 key
    const [currentTaskFlowID, setCurrentTaskFlowID] = useState<string | null>(null);
    // 是否编辑
    const [isEditor, setIsEditor] = useState<boolean>(false);
    // 可用任务列表
    const [availableTasksList, setAvailableTasksList] = useState<PipeTaskFlow[]>([]);
    // 表单数据
    const [form] = Form.useForm();

    // 根据点击按钮显示对应类型的弹出对话框
    const createPipeTaskFlow = async () => {
        setIsEditor(false);
        setModalVisible(true);
    };
    // 根据点击按钮显示对应类型的弹出对话框
    const showModal = (flowID: string) => {
        setCurrentTaskFlowID(flowID);
        setIsEditor(true);
        setModalVisible(true);
    };

    // 确认选择后更新对应的管道实例任务
    const handleOk = () => {
        form
            .validateFields()
            .then((values: PipeTaskFlow) => {
                if (isEditor) {
                    updatePipeTaskFlow(values, appConfig.userID).then(()=>onDataChange());
                    setModalVisible(false);
                    form.resetFields();
                    return;
                }
                addPipeTaskFlow(values, appConfig.userID).then(()=>onDataChange());
                setModalVisible(false);
                form.resetFields();
            })
            .catch((error) => {
                console.log("表单校验失败:", error);
            });
    };

    // 关闭弹窗，并重置表单
    const closeModal = () => {
        setModalVisible(false);
        form.resetFields();
    };

    // 根据传入的 headers 动态生成 Table 列配置
    const columns_info = headers.map((header) => ({
        title: header,
        dataIndex: header,
        key: header,
        render: (value: any) => {
            if (typeof value === "object" && value !== null) {
                return (
                    <>
                        {value.map((item: Param, index: number) => (
                            <Space key={index} size="small"> {/* 使用 index 作为 key */}
                                {Object.entries(item).map(([key, val]) => (
                                    <span key={key}>
                                    {key}: {val === undefined || val === null || val === "" ? "空" : val}<br/>
                                 </span>
                                ))}
                            </Space>
                        ))}
                    </>
                )
            }
            return value;
        }
    }));

    const columns = [
        ...columns_info,
        {
            title: "操作",
            key: "action",
            render: (_: any, taskFlow: PipeTaskFlow) => (
                <Space>
                    <Button
                        type="primary"
                        style={{marginRight: 8}}
                        onClick={() => showModal(taskFlow.id)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="primary"
                        style={{marginRight: 8}}
                        onClick={() => removePipeTaskFlow(taskFlow.id, appConfig.userID).then(()=>onDataChange())}
                    >
                        删除任务流
                    </Button>
                    <Button
                        type="primary"
                        style={{marginRight: 8}}
                        onClick={() => openBpmnWithFlowID('/properties-panel-async-extension',new URLSearchParams({
                            'flow_id': taskFlow.id,
                            'user_id': taskFlow.author,
                            'project_id': projectConfig.project_id
                        }))}
                    >
                        修改流程图
                    </Button>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        if (!availableTasksList) return;
        setAvailableTasksList(availableTasksList);
        console.log("可用的管道任务流", availableTasksList)
    }, [availableTasksList]);

    useEffect(() => {
        if (!data) return;
        setPipeTaskFlow(data)
        setCurrentTaskFlowID(null)
    }, [data]);

    useEffect(() => {
        if (!currentTaskFlowID) return;
        console.log("监控 currentTaskFlowID ", currentTaskFlowID)
        if (isEditor) {
            form.setFieldsValue(
                pipeTaskFlow.find(pipe => pipe.id === currentTaskFlowID))
        }
    }, [currentTaskFlowID]);
    return (
        <>
            <Button
                type="primary"
                onClick={createPipeTaskFlow}
            >
                创建任务流
            </Button>
            <Table
                title={() => <div>管道实例列表</div>}
                dataSource={pipeTaskFlow}
                columns={columns}
                rowKey="id"
                bordered
                tableLayout="auto"
            />
            <Modal
                title={isEditor ? "编辑管道任务流" : "增加管道任务流"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={closeModal}
                okText="确定"
                cancelText="取消"
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={generateTaskFlow()}
                >
                    <Form.Item
                        name="id"
                        label="ID"
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="author"
                        label="作者"
                        rules={[{ required: true, message: '请输入作者' }]}
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="flow_describe"
                        label="流程描述"
                        rules={[{ required: true, message: '请输入流程描述' }]}
                    >
                        <Input.TextArea placeholder="请输入流程描述" />
                    </Form.Item>
                    <Form.Item
                        name="flow_bpmn_path"
                        label="BPMN路径"
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="pipe_id"
                        label="管道ID"
                    >
                        <Input disabled />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

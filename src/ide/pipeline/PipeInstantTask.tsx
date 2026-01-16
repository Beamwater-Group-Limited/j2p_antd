import React, {  useEffect, useState} from "react";
import {Button, Modal, Form, Select,   Table, Space} from "antd";
import {
    DynamicPipelineInstanceListProps, mountPipeInstanceTask,
    Param,
    PipelineInstance, PipeTaskFlow
} from "@/tools";
import {useAppConfig, useProject} from "@/context";

interface ExtendedPipelineInstantTaskProps extends DynamicPipelineInstanceListProps {
    availableTasks: PipeTaskFlow[]
}

export const PipelineInstantTask: React.FC<ExtendedPipelineInstantTaskProps> = ({headers, data, availableTasks}) => {
    // 全局 ID 的 State
    // 使用 useContext 从全局上下文中获取 globalId
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    // 示例管道实例列表
    const [instances, setInstances] = useState<PipelineInstance[]>([]);
    // 弹出对话框控制状态
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    // 当前正在配置的管道实例 key
    const [currentInstanceKey, setCurrentInstanceKey] = useState<string | null>(null);
    // 选中的任务值
    const [selectedTask, setSelectedTask] = useState<string | undefined>(undefined);
    // 可用任务列表
    const [availableTasksList, setAvailableTasksList] = useState<PipeTaskFlow[]>([]);
    // 根据点击按钮显示对应类型的弹出对话框
    const showModal = (instanceKey: string) => {
        setCurrentInstanceKey(instanceKey);
        setModalVisible(true);
    };
    // 确认选择后更新对应的管道实例任务
    const handleOk = () => {
        mountTask()
        setModalVisible(false);
    };
    const handleCancel = () => {
        setSelectedTask(undefined);
        setModalVisible(false);
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
            render: (_: any, instance: PipelineInstance) => (
                <Button
                    type="primary"
                    style={{marginRight: 8}}
                    onClick={() => showModal(instance.id)}
                >
                    绑定
                </Button>
            ),
        },
    ];

    const mountTask = async () => {
        const cheng = await mountPipeInstanceTask(currentInstanceKey, selectedTask,appConfig.userID, projectConfig.project_id);
        if (!cheng) return
        const updatedInstances = instances.map((instance) =>
            instance.id === currentInstanceKey ? {...instance, task: selectedTask} : instance)
        setInstances(updatedInstances);
    }

    useEffect(() => {
        if (!availableTasksList) return;
        setAvailableTasksList(availableTasksList);
        console.log("可用的管道任务流", availableTasksList)
    }, [availableTasksList]);

    useEffect(() => {
        if (!data) return;
        setInstances(data)
    }, [data]);

    return (
        <div>
            <Table
                title={() => <div>管道实例列表</div>}
                dataSource={instances}
                columns={columns}
                rowKey="id"
                bordered
                tableLayout="auto"
            />
            <Modal
                title={"配置任务"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
            >
                <Form layout="vertical">
                    <Form.Item label="选择任务" rules={[{required: true, message: "请选择任务"}]}>
                        <Select
                            placeholder="请选择任务"
                            value={selectedTask}
                            onChange={(value) => setSelectedTask(value)}
                        >
                            {availableTasks.map((task) => (
                                <Select.Option key={task.id} value={task.id}>
                                    {task.flow_describe}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

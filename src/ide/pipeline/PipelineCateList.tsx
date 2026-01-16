import React, {useEffect, useState} from "react";
import {Button, Modal, Form, Input, Table, Space} from "antd";
import {DynamicPipelineListProps, Param} from "@/tools";

export const PipelineCateList: React.FC<DynamicPipelineListProps> = ({data, headers}) => {
    const [pipelines, setPipelines] = useState<Record<string, any>[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();

    // 根据传入的 headers 动态生成 Table 列配置
    const columns = headers.map((header) => ({
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

    // 弹出对话框
    const showModal = () => {
        setIsModalVisible(true);
    };

    // 关闭对话框并重置表单
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    // 确认后，验证表单并动态增加管道类型
    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                // 创建一个新的管道类型，这里使用时间戳作为 key
                const newPipeline = {
                    key: Date.now().toString(),
                    name: values.name,
                };
                setPipelines([...pipelines, newPipeline]);
                setIsModalVisible(false);
                form.resetFields();
            })
            .catch((info) => {
                console.log("表单校验失败:", info);
            });
    };

    useEffect(() => {
        if( !data ) return;
        setPipelines(data)
    }, [data]);
    return (
        <>
            <Button type="primary" onClick={showModal}>
                增加管道类型
            </Button>
            <Table
                rowKey="id" // 设置每行数据的唯一标识符
                columns={columns}
                dataSource={pipelines}
                pagination={false}
            />
            <Modal
                title="增加管道"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    {headers.map((header) => (
                        <Form.Item
                            key={header}
                            name={header}
                            label={header}
                            rules={[{required: true, message: `请输入${header}`}]}
                        >
                            <Input placeholder={`请输入${header}`}/>
                        </Form.Item>
                    ))}
                </Form>
            </Modal>

        </>
    );
};

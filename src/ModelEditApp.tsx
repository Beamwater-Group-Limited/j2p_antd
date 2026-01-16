import React, {useMemo, useState} from "react";
import {Card, Table, Typography, Button, Form, Input, Modal, Space, Tag, Select, Alert, InputNumber} from "antd";
import {useParams} from "react-router-dom";
import {
    defaultModelTaskInterface,
    getModelDataPropWithID,
    ModelDataProp,
    ModelInterfaceProp, updateModelDataProp
} from "@/tools";
import {useAppConfig} from "@/context";
import {DaFormat, DaType} from "@/entity";
import {useHandle,useUpdateChange} from "@/hooks";

const { Title, Paragraph } = Typography;

const ModelEditApp: React.FC = () => {
    const {appConfig} = useAppConfig();
    // 获取模型ID
    const {modelTaskID} = useParams<{ modelTaskID: string }>(); // 获取路由参数 :modelTaskID
    const [companyName, model_name, version] = modelTaskID.split("--");
    // 模型数据（示例数据，可以通过接口动态加载）
    const initialModelData:ModelDataProp = {
        company_name: companyName,
        model_class: null,
        model_config_path: "",
        model_id: modelTaskID,
        model_interfaces: [],
        model_name: model_name,
        model_path: "",
        revision: version,
    };
    const [isModalVisible, setIsModalVisible] = useState(false); // 编辑模态框
    const [currentInterface, setCurrentInterface] = useState<ModelInterfaceProp>(null); // 当前选中的接口
    const [isEditor,setIsEditor] = useState(false)
    const [form] = Form.useForm();
    // 双向更新操作
    const {xData:modelData,setXData:setModelData} = useUpdateChange(
        initialModelData,
        updateModelDataProp,[appConfig.userID],
        useMemo(() => [modelTaskID], [modelTaskID]),
        getModelDataPropWithID,[appConfig.userID,modelTaskID])

    // 处理按键操作
    const {handleKeyDown} = useHandle()
    // 编辑接口
    const handleEditInterface = (record: ModelInterfaceProp) => {
        setIsEditor(true)
        setCurrentInterface(record);
        setIsModalVisible(true);
        form.setFieldsValue(record)
    };
    // 发起新增接口操作
    const handleAddInterface = () => {
        setIsEditor(false)
        console.log("输出的model_interfaces", modelData.model_interfaces)
        // 构造一个新的接口对象，id 使用时间戳，默认 method 为 POST，可以根据需求调整默认值
        const maxIndex = modelData.model_interfaces.length > 0
            ? Math.max(...modelData.model_interfaces.map((item) => Number(item.id)))
            : 0;
        // 默认新增最大序号
        const newInterface = defaultModelTaskInterface(maxIndex + 1)
        setCurrentInterface(newInterface);
        setIsModalVisible(true);
        form.setFieldsValue(newInterface)
    };

    // 提交接口编辑
    const handleSubmit = (values: any) => {
        const updatedInterfaces = modelData.model_interfaces.map((intf) =>
            intf.id === currentInterface.id ? { ...currentInterface, ...values } : intf
        );
        // 如果是新增则添加
        if (!isEditor) {
            updatedInterfaces.push({ ...currentInterface, ...values });
        }
        setModelData({ ...modelData, model_interfaces: updatedInterfaces });
        setIsModalVisible(false);
        form.resetFields()
    };

    // 新增删除接口的方法
    const handleDeleteInterface = (record: ModelInterfaceProp) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该接口吗？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                const updatedInterfaces = modelData.model_interfaces.filter(intf => intf.id !== record.id);
                setModelData({ ...modelData, model_interfaces: updatedInterfaces });
            }
        });
    };
    // 表格列定义
    const columns = [
        {
            title: "接口ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "接口名称",
            dataIndex: "interface_name",
            key: "interface_name",
        },
        {
            title: "API Endpoint",
            dataIndex: "api_endpoint",
            key: "api_endpoint",
        },
        {
            title: "HTTP 方法",
            dataIndex: "method",
            key: "method",
            render: (method: string) => <Tag color="blue">{method}</Tag>,
        },
        {
            title: "操作",
            key: "actions",
            render: (_: any, record: ModelInterfaceProp) => (
                <Space>
                    <Button type="link" onClick={() => handleEditInterface(record)}>
                    编辑接口
                    </Button>
                    <Button type="link" danger onClick={() => handleDeleteInterface(record)}>
                        删除接口
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <Title level={2}>模型任务编辑</Title>
            <Card style={{ marginBottom: "20px" }}>
                <Space direction="vertical">
                    <Paragraph>
                        <strong>公司名称:</strong> {modelData? modelData.company_name:""}
                    </Paragraph>
                    <Paragraph>
                        <strong>模型分类:</strong> {modelData? modelData.model_class :""}
                    </Paragraph>
                    <Paragraph>
                        <strong>模型ID:</strong> {modelData? modelData.model_id:""}
                    </Paragraph>
                    <Paragraph>
                        <strong>Model Path:</strong> {modelData? modelData.model_path:""}
                    </Paragraph>
                    <Paragraph>
                        <strong>Revision:</strong> {modelData? modelData.revision:""}
                    </Paragraph>
                    <Paragraph>
                        <strong>配置路径:</strong> {modelData? modelData.model_config_path:""}
                    </Paragraph>
                </Space>
            </Card>
            {/* 新增接口按钮 */}
            <Button type="primary" style={{ marginBottom: "16px" }} onClick={handleAddInterface}>
                新增接口
            </Button>
            <Table
                dataSource={modelData? modelData.model_interfaces:[]}
                columns={columns}
                rowKey="id"
                pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20"],
                }}
            />
            {/* 编辑模态框 */}
            <Modal
                title="编辑接口信息"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields()
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    initialValues={currentInterface}
                    onFinish={handleSubmit}
                    layout="vertical"
                >
                    {/* 隐藏的 ID 字段 */}
                    <Form.Item
                        name="id"
                        hidden={isEditor}
                        label="模型任务ID"
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        name="interface_name"
                        label="接口名称"
                        rules={[{ required: true, message: "请输入接口名称" }]}
                    >
                        <Input placeholder="接口名称" />
                    </Form.Item>
                    <Form.Item
                        name="api_endpoint"
                        label="API Endpoint"
                        rules={[{ required: true, message: "请输入API Endpoint" }]}
                    >
                        <Input placeholder="API Endpoint" />
                    </Form.Item>
                    <Form.Item
                        name="method"
                        label="HTTP 方法"
                        rules={[{ required: true, message: "请输入HTTP方法" }]}
                    >
                        <Input placeholder="HTTP 方法 (例如：POST)" />
                    </Form.Item>
                    <Form.Item name="headers" label="请求头">
                        <Input.TextArea rows={1} placeholder="请求头" />
                    </Form.Item>

                    <Form.Item
                        name="in_comes"
                        label="传入任务流的数据项"
                        rules={[{ required: true, message: "请输入逗号分割的序号 '3,4'" }]}
                    >
                        <Input placeholder="请输入逗号分割的序号  '3,4'" />
                    </Form.Item>

                    <Form.Item
                        name="out_comes"
                        label="传出任务流的数据项"
                        rules={[{ required: true, message: "请输入逗号分割的序号 " }]}
                    >
                        <Input placeholder="请输入逗号分割的序号 '0,2'" />
                    </Form.Item>
                    <Form.List name="req_comes">
                        {(fields, {add, remove}) => (
                            <>
                                <h3>接口请求数据</h3>
                                {/*每一个fields是由 key name 和值构成的*/}
                                { fields && fields.length > 0 ? (fields.map((field) => (
                                        <Space key={field.key} align="baseline"
                                               className="flex w-full px-4" // 使用 Tailwind 类实现占满整行及左右留白
                                        >
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-type`}
                                                name={[field.name, "type"]}
                                                rules={[{required: true, message: "请选择类型"}]}
                                            >
                                                <Select
                                                    placeholder="类型"
                                                    style={{width: 120}}
                                                    value={field.name || undefined}
                                                >
                                                    {Object.values(DaType).map(type => (
                                                        <Select.Option key={type} value={type}>
                                                            {type}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-format`}
                                                name={[field.name, "format"]}
                                                rules={[{required: true, message: "请选择格式"}]}
                                            >
                                                <Select
                                                    placeholder="格式"
                                                    style={{width: 120}}
                                                    value={field.name || undefined}
                                                >
                                                    {Object.values(DaFormat).map(format => (
                                                        <Select.Option key={format} value={format}>
                                                            {format}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-content`}
                                                name={[field.name, "content"]}
                                                rules={[{message: "请输入具体的值"}]}
                                            >
                                                <Input.TextArea
                                                    rows={1}
                                                    autoSize={{ minRows: 1, maxRows: 24 }}
                                                    onKeyDown={handleKeyDown}
                                                    style={{
                                                        fontFamily: 'SFMono-Regular, Menlo, monospace',
                                                        whiteSpace: 'pre',            // 保留缩进
                                                        width: 400
                                                    }}
                                                    placeholder="在此粘贴/编写 Python 代码…"
                                                />
                                            </Form.Item>
                                            <Button
                                                danger
                                                className="flex-none"
                                                onClick={() => remove(field.name)} // 删除当前字段
                                            >
                                                删除
                                            </Button>
                                        </Space>
                                    ))): <Alert
                                        message="无接口输入接口数据"
                                        type="info" // 设置为警告样式
                                        showIcon
                                        style={{ marginTop: "8px", fontSize: "16px" }}
                                    />
                                }
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block>
                                        新增输入数据项
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    <Form.List name="resp_comes">
                        {(fields, {add, remove}) => (
                            <>
                                <h3>接口响应数据</h3>
                                {
                                    fields && fields.length > 0 ? (fields.map((field) => (
                                        <Space key={field.key} align="baseline"
                                               className="flex w-full px-4" // 使用 Tailwind 类实现占满整行及左右留白
                                        >
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-type`}
                                                name={[field.name, "type"]}
                                                rules={[{required: true, message: "请选择类型"}]}
                                            >
                                                <Select
                                                    placeholder="类型"
                                                    style={{width: 120}}
                                                    value={field.name || undefined}
                                                >
                                                    {Object.values(DaType).map(type => (
                                                        <Select.Option key={type} value={type}>
                                                            {type}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-format`}
                                                name={[field.name, "format"]}
                                                rules={[{required: true, message: "请选择格式"}]}
                                            >
                                                <Select
                                                    placeholder="格式"
                                                    style={{width: 120}}
                                                    value={field.name || undefined}
                                                >
                                                    {Object.values(DaFormat).map(format => (
                                                        <Select.Option key={format} value={format}>
                                                            {format}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-content`}
                                                name={[field.name, "content"]}
                                                rules={[{message: "请输入具体的值"}]}

                                            >
                                                <Input.TextArea
                                                    rows={1}
                                                    autoSize={{ minRows: 1, maxRows: 24 }}
                                                    onKeyDown={handleKeyDown}
                                                    style={{
                                                        fontFamily: 'SFMono-Regular, Menlo, monospace',
                                                        whiteSpace: 'pre',            // 保留缩进
                                                        width: 400
                                                    }}
                                                    placeholder="在此粘贴/编写 Python 代码…"
                                                />
                                            </Form.Item>
                                            <Button
                                                danger
                                                className="flex-none"
                                                onClick={() => remove(field.name)} // 删除当前字段
                                            >
                                                删除
                                            </Button>
                                        </Space>
                                    ))): <Alert
                                        message="无接口输出数据"
                                        type="info" // 设置为警告样式
                                        showIcon
                                        style={{ marginTop: "8px", fontSize: "16px" }}
                                    />
                                }
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block>
                                        新增输出数据项
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    <Space className="w-full flex justify-between" >
                        <Button onClick={() => setIsModalVisible(false)}>取消</Button>
                        <Button type="primary" htmlType="submit"> 保存 </Button>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
};

export default ModelEditApp;

import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Tag,
    Select,
    Switch,
    Card,
    List,
    Progress, Typography, Tabs, Spin
} from "antd";
import {
    CnnProps,
    DownloadTask,
    getCnnList,
    getCnnWeightList,
    DownloadProps,
    LlmProps,
    Param,
    ProjectData,
    downloadLlmModel,
    downloadCnnModel,
    getLongrunList,
    LongrunProps,
    downloadLongrunModel,
    removeLongrunModel,
} from "@/tools";
import {
    getLlmList,
    getModelVersionList,
    queryDownloadModelTask,
    tasksRunList
} from "@/tools/fetch/FetchUtilsModel";
import {useAppConfig} from "@/context";
import {useLocation, useNavigate} from "react-router-dom";
import {useChange} from "@/hooks/useChange";

const {Text} = Typography

// 生成测试数据
export const generateMockTasks = (): DownloadTask[] => {
    return [
        {
            task_id: "task_001",
            model_name: "huawei-noah/TinyBERT_4L_zh",
            progress: 45,
            status: "downloading", // 可选值: 'downloading', 'completed', 'error'
            error: null, // 如果状态是 'error'，这里可以填充错误信息
            started_at: "2025-06-11 10:00:00", // 任务开始时间
        },
        {
            task_id: "task_002",
            model_name: "gpt-3",
            progress: 100,
            status: "completed",
            error: null,
            started_at: "2025-06-10 15:30:00",
        },
        {
            task_id: "task_003",
            model_name: "bert-base-uncased",
            progress: 0,
            status: "error",
            error: "网络连接失败",
            started_at: "2025-06-11 08:00:00",
        },
        {
            task_id: "task_004",
            model_name: "roberta-large",
            progress: 70,
            status: "downloading",
            error: null,
            started_at: "2025-06-11 09:20:00",
        },
    ];
};

export const ModelApp: React.FC = () => {
    const {appConfig} = useAppConfig();
    const location = useLocation();
    const navigate = useNavigate();
    const [projectConfig, setProjectConfig] = useState<ProjectData>();
    const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState(false); // 控制创建/编辑模型弹窗的显隐
    const [form] = Form.useForm();
    // 每个模型相关的版本列表
    const [versionData, setVersionData] = useState<Record<string, string[]>>({});
    // 存储各个模型选中的版本
    const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({});
    // 处理版本选择
    const handleVersionChange = (modelId: string, version: string) => {
        console.log("选中的行", modelId, version)
        setSelectedVersions(
            (prev) => {
               return  ({
                        ...prev,
                        [modelId]: version, // 存储当前模型的选中版本
                    })
            }
        );
    };
    // 打开模型创建模态框
    const openCreateModal = () => {
        setIsModalVisible(true);
        form.resetFields();
    };
    // 打开模型编辑模态框
    const openEditPage = (model: LlmProps) => {
        console.log("选中的行", selectedVersions)
        navigate(`/model/${model.trained_by}--${model.model_name}--${selectedVersions[model.model_id]}`)
    };
    // 下载模型处理
    const handleSubmit = (llmDownlaod: DownloadProps) => {
        console.log("准备下载的信息", llmDownlaod)
        downloadLlmModel(appConfig.userID, projectConfig.project_id, llmDownlaod).then(() => {
                setIsModalVisible(false);
                message.success(`${llmDownlaod.model_name}模型正在下载！`);
                form.resetFields();
                // 启动轮询
                // 仅在初始时设定轮询
                // 仅在初始时设定轮询
                if (!intervalRef.current) {
                    fetchTaskStatus() // 初始化先拉一次
                    intervalRef.current = setInterval(fetchTaskStatus, 1000)
                }
            }
        )
    };
    // 删除模型
    const handleDelete = (id: string) => {
        const newModels = modelDatas.llmProps.filter((m) => m.model_id !== id);
        setModelDatas(prev => ({
            ...prev,
            'llmProps': newModels
        }))
        message.success("模型需要手动删除！");
    };
    // 单击模型行 获取信息
    const fetchVersion = (record: any) => {
        getModelVersionList(appConfig.userID, projectConfig.project_id, record.model_id).then(v => {
            setVersionData(prev => {
                prev[record.model_id] = v
                return {...prev}
            })
        })
    }
    const {xData: modelDatas, setXData: setModelDatas} = useChange(
        useMemo(() => [appConfig, projectConfig], [appConfig, projectConfig]),
        getLlmList, [appConfig?.userID, projectConfig?.project_id]
    )
    useEffect(() => {
        if (!modelDatas || !modelDatas.headers || !versionData) return;
        // 表格列定义
        console.log("表头数据", modelDatas.headers)
        const fetchcolumns = () => {
            const columnsHeader = (modelDatas.headers as string[]).map((h) => ({
                title: h,
                dataIndex: h,
                key: h,
                sorter: (a: any, b: any) => {
                    const va = a[h];
                    const vb = b[h];
                    // 如果是字符串
                    if (typeof va === "string" && typeof vb === "string") {
                        return va.localeCompare(vb);
                    }
                    // 如果是数字
                    if (typeof va === "number" && typeof vb === "number") {
                        return va - vb;
                    }
                    return 0;
                },
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
            }))
            return [
                ...columnsHeader,
                {
                    title: "版本列表",
                    key: "versions",
                    render: (_: any, record: LlmProps) => (
                        <Select
                            style={{width: 150}}
                            placeholder="选择版本"
                            value={selectedVersions[record.model_id] || "选择版本"}
                            onChange={(value) => handleVersionChange(record.model_id, value)}
                        >
                            {(versionData[record.model_id] || []).map((version) => (
                                <Select.Option key={version} value={version}>
                                    {version}
                                </Select.Option>
                            ))}
                        </Select>
                    ),
                },

                {
                    title: "操作",
                    key: "action",
                    render: (_: any, record: LlmProps) => (
                        <Space size="middle">
                            <Button type="link" onClick={() => openEditPage(record)}>
                                编辑
                            </Button>
                            <Popconfirm
                                title="确定删除这个模型吗？"
                                onConfirm={() => handleDelete(record.model_id)}
                                okText="删除"
                                cancelText="取消"
                            >
                                <Button type="link" danger> 删除 </Button>
                            </Popconfirm>
                        </Space>
                    ),
                },]
        }
        setModelDatas(prev => ({
            ...prev,
            columns: fetchcolumns(),
        }))
        setIsModelLoading(false)
    }, [modelDatas?.headers, versionData])

    // CNN
    const [isCnnLoading, setIsCnnLoading] = useState<boolean>(true);
    const [isCnnModalVisible, setIsCnnModalVisible] = useState(false); // 控制创建/编辑模型弹窗的显隐
    const [cnnform] = Form.useForm();
    // 存储各个模型选中的权重
    const [selectedWeight, setSelectWeight] = useState<Record<string, string>>({});
    const {xData: cnnDatas, setXData: setCnnDatas} = useChange(
        useMemo(() => [appConfig, projectConfig], [appConfig, projectConfig]),
        getCnnList, [appConfig?.userID, projectConfig?.project_id]
    )
    // 打开cnn模型编辑模态框
    const openCnnEditPage = (model: CnnProps) => {
        console.log("选中的行", selectedWeight)
        navigate(`/model/${model.owner_id}--${model.model_name}--${selectedWeight[model.model_id]}`)
    };
    // 处理权重选择
    const handleWeightChange = (modelId: string, weight: string) => {
        console.log("选中的行", modelId, weight)
        setSelectWeight((prev) => ({
            ...prev,
            [modelId]: weight, // 存储当前模型的选中版本
        }));
    };
    // 每个模型相关的权重
    const [weightData, setWeightData] = useState<Record<string, string[]>>({});
    // 创建新的CNN模型
    const openCreateCnnModal = () => {
        setIsCnnModalVisible(true);
        cnnform.resetFields();
    };
    const handleCnnSubmit = (cnnDownload: DownloadProps) => {
        console.log("准备下载的信息", cnnDownload)
        downloadCnnModel(appConfig.userID, projectConfig.project_id, cnnDownload).then(() => {
                setIsCnnModalVisible(false);
                message.success(`${cnnDownload.model_name}模型正在下载！`);
                cnnform.resetFields();
                if (!intervalRef.current) {
                    fetchTaskStatus() // 初始化先拉一次
                    intervalRef.current = setInterval(fetchTaskStatus, 1000)
                }
            }
        )
    }
    // 删除cnn模型
    const handleCnnDelete = (id: string) => {
        const newModels = cnnDatas.cnnProps.filter((m) => m.model_id !== id);
        setCnnDatas(prev => ({
            ...prev,
            'cnnProps': newModels
        }))
        message.success("模型需要手动删除！");
    };
    // 获取权重信息
    const fetchWeight = (record: any) => {
        getCnnWeightList(appConfig.userID, projectConfig.project_id, record.model_id).then(v => {
            setWeightData(prev => {
                prev[record.model_id] = v
                return {...prev}
            })
        })
    }
    useEffect(() => {
        if (!cnnDatas || !cnnDatas.headers || !weightData) return;
        // 表格列定义
        console.log("cnn表头数据", cnnDatas.headers)
        const fetchCnnColumns = () => {
            const columnsHeader = (cnnDatas.headers as string[]).map((h) => ({
                title: h,
                dataIndex: h,
                key: h,
                sorter: (a: any, b: any) => {
                    const va = a[h];
                    const vb = b[h];
                    // 如果是字符串
                    if (typeof va === "string" && typeof vb === "string") {
                        return va.localeCompare(vb);
                    }
                    // 如果是数字
                    if (typeof va === "number" && typeof vb === "number") {
                        return va - vb;
                    }
                    return 0;
                },
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
            }))
            return [
                ...columnsHeader,
                {
                    title: "权重列表",
                    key: "versions",
                    render: (_: any, record: LlmProps) => (
                        <Select
                            style={{width: 150}}
                            placeholder="选择权重"
                            value={selectedWeight[record.model_id] || "选择权重"}
                            onChange={(value) => handleWeightChange(record.model_id, value)}
                        >
                            {(weightData[record.model_id] || []).map((weight) => (
                                <Select.Option key={weight} value={weight}>
                                    {weight}
                                </Select.Option>
                            ))}
                        </Select>
                    ),
                },
                {
                    title: "操作",
                    key: "action",
                    render: (_: any, record: LlmProps) => (
                        <Space size="middle">
                            <Button type="link" onClick={() => openCnnEditPage(record)}>
                                编辑
                            </Button>
                            <Popconfirm
                                title="确定删除这个模型吗？"
                                onConfirm={() => handleCnnDelete(record.model_id)}
                                okText="删除"
                                cancelText="取消"
                            >
                                <Button type="link" danger> 删除 </Button>
                            </Popconfirm>
                        </Space>
                    ),
                },]
        }
        setCnnDatas(prev => ({
            ...prev,
            columns: fetchCnnColumns(),
        }))
        setIsCnnLoading(false)
    }, [cnnDatas?.headers, weightData]);

    // LONGRUN
    const [isLongrunLoading, setIsLongrunLoading] = useState<boolean>(true);
    const [isLongrunModalVisible, setIsLongrunModalVisible] = useState(false); // 控制创建/编辑模型弹窗的显隐
    const [longrunform] = Form.useForm();
    const {xData: longrunDatas, setXData: setLongrunDatas} = useChange(
        useMemo(() => [appConfig, projectConfig], [appConfig, projectConfig]),
        getLongrunList, [appConfig?.userID, projectConfig?.project_id]
    )
    // 打开longrun模型编辑模态框
    const openLongrunEditPage = (model: LongrunProps) => {
        console.log("选中的行", selectedWeight)
        navigate(`/model/${model.owner_id}--${model.model_name}--${model.model_name}`)
    };
    // 创建新的Longrun
    const openCreateLongrunModal = () => {
        setIsLongrunModalVisible(true);
        longrunform.resetFields();
    };
    // 下载可执行模块
    const handleLongrunSubmit = (longrunDownload: DownloadProps) => {
        console.log("准备下载的信息", longrunDownload)
        downloadLongrunModel(appConfig.userID, projectConfig.project_id, longrunDownload).then(() => {
                setIsLongrunModalVisible(false);
                message.success(`${longrunDownload.model_name}模型正在下载！`);
                cnnform.resetFields();
                if (!intervalRef.current) {
                    fetchTaskStatus() // 初始化先拉一次
                    intervalRef.current = setInterval(fetchTaskStatus, 1000)
                }
            }
        )
    }
    // 删除longrun模型
    const handleLongrunDelete = (id: string) => {
        const newModels = longrunDatas.longrunProps.filter((m) => m.model_id !== id);
        removeLongrunModel(appConfig.userID, projectConfig.project_id, id).then(() => {
            setLongrunDatas(prev => ({
                ...prev,
                'longrunProps': newModels
            }))
        })
    };
    useEffect(() => {
        if (!longrunDatas || !longrunDatas.headers || !weightData) return;
        // 表格列定义
        console.log("longrun表头数据", longrunDatas.headers)
        const fetchLongrunColumns = () => {
            const columnsHeader = (longrunDatas.headers as string[]).map((h) => ({
                title: h,
                dataIndex: h,
                key: h,
                sorter: (a: any, b: any) => {
                    const va = a[h];
                    const vb = b[h];
                    // 如果是字符串
                    if (typeof va === "string" && typeof vb === "string") {
                        return va.localeCompare(vb);
                    }
                    // 如果是数字
                    if (typeof va === "number" && typeof vb === "number") {
                        return va - vb;
                    }
                    return 0;
                },
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
            }))
            return [
                ...columnsHeader,
                {
                    title: "操作",
                    key: "action",
                    render: (_: any, record: LlmProps) => (
                        <Space size="middle">
                            <Button type="link" onClick={() => openLongrunEditPage(record)}>
                                编辑
                            </Button>
                            <Popconfirm
                                title="确定删除这个长运行吗？"
                                onConfirm={() => handleLongrunDelete(record.model_id)}
                                okText="删除"
                                cancelText="取消"
                            >
                                <Button type="link" danger> 删除 </Button>
                            </Popconfirm>
                        </Space>
                    ),
                },]
        }
        setLongrunDatas(prev => ({
            ...prev,
            columns: fetchLongrunColumns(),
        }))
        setIsLongrunLoading(false)
    }, [longrunDatas?.headers]);

    // 模型下载任务管理
    const [tasks, setTasks] = useState<DownloadTask[]>(generateMockTasks())
    useEffect(() => {
        if (!projectConfig) return;
        // 仅在初始时设定轮询
        if (!intervalRef.current) {
            fetchTaskStatus() // 初始化先拉一次
            intervalRef.current = setInterval(fetchTaskStatus, 3000)
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [projectConfig]);
    const fetchTaskStatus = async () => {
        try {
            const res = await tasksRunList(appConfig.userID, projectConfig.project_id)
            console.log("返回的res", res)
            // 和任务主机名保持一致
            const works = res["celery@worker.tfweb"]
            // 若没有下载中的任务，停止轮询
            const hasActive = works.length
            console.log("返回的工作", works)
            const taskIDS = works.map((task: any) => task.id)
            if (!hasActive && intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
                console.log('🛑 没有下载任务，停止轮询')
                setTasks([])
            } else {
                const cheng = await queryDownloadModelTask(appConfig.userID, projectConfig.project_id, taskIDS)
                console.log("获取到任务", cheng)
                setTasks(cheng)
            }
        } catch (err) {
            console.error('获取任务失败', err)
        }
    }
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    // 初始执行
    useEffect(() => {
        // 如果是点击跳转过来的
        if (location.state) {
            console.log("跳转配置", location.state)
            setProjectConfig({...location.state, 'mode': 'dev'});
            sessionStorage.setItem("project_model", JSON.stringify(location.state))
        } else {
            // 刷新的场景
            if (sessionStorage.getItem('project_model')) {
                console.log("跳转配置为空，获取本地配置", location.state, sessionStorage.getItem('project_model'))
                setProjectConfig(JSON.parse(sessionStorage.getItem('project_model')))
            } else {
                Modal.error({
                    title: "项目ID错误",
                    content: "项目ID为空，请重新选择或创建一个项目。",
                    onOk: () => {
                        navigate(`/`); // 跳转到项目选择/创建项目页面
                    }
                })
            }
        }
    }, []);
    const onTabChange = () => {
        console.log("切换选择")
    }

    if (isCnnLoading || isModelLoading || isLongrunLoading) {
        return (
        <div className="loading-container">
            { appConfig.IS_SPIN?
                <Spin tip="加载中，请稍等..." size="large" />:
                <div/>
            }
        </div>
    );
    }
    const items = [
        {
            key: 'llm',
            label: '大语言模型管理',
            children:
                <>
                    <div style={{marginBottom: "20px"}}>
                        <Button type="primary" onClick={openCreateModal}>
                            下载新的模型
                        </Button>
                    </div>
                    <Table
                        dataSource={modelDatas.llmProps}
                        columns={modelDatas.columns}
                        rowKey="model_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                        onRow={(record) => {
                            return {
                                onClick: () => fetchVersion(record)
                            }
                        }}
                    />
                    {/* 模态框 */}
                    <Modal
                        title="下载新模型"
                        open={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        onOk={() => {
                            form
                                .validateFields()
                                .then(handleSubmit)
                                .catch((info) => {
                                    console.log("表单校验失败:", info);
                                });
                        }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                model_name: "Qwen/Qwen2.5-VL-3B-Instruct-AWQ",
                                model_class: "Qwen2_5_VLForConditionalGeneration",
                                tokenizer_class: "AutoTokenizer",
                                processor_class: "AutoProcessor",
                                load_in_4bit: true,
                                copy_4bit_model: true,
                                from_package: "",
                                sentence_transformers_class: "",
                                sentence_transformers_name: "",
                                user_id: appConfig.userID,
                            }}
                        >
                            <Form.Item
                                label="Model Name"
                                name="model_name"
                            >
                                <Input placeholder="请输入模型名称，例如 huawei-noah/TinyBERT_4L_zh"/>
                            </Form.Item>

                            <Form.Item label="Model Class" name="model_class">
                                <Input placeholder="请输入模型类，例如 AutoModelForCausalLM"/>
                            </Form.Item>
                            <Form.Item label="Tokenizer Class" name="tokenizer_class">
                                <Input placeholder="请输入分词器类，例如 AutoTokenizer"/>
                            </Form.Item>
                            {/* 字符串类型字段 */}
                            <Form.Item label="Processor Class" name="processor_class">
                                <Input placeholder="请输入处理器类，例如 AutoProcessor"/>
                            </Form.Item>
                            {/* 字符串类型字段 */}
                            <Form.Item label="From Package" name="from_package">
                                <Input placeholder="请输入包名，例如 transformers"/>
                            </Form.Item>
                            {/* 布尔值字段 */}
                            <Form.Item
                                label="加载成 4-bit"
                                name="load_in_4bit"
                                valuePropName="checked"
                            >
                                <Switch/>
                            </Form.Item>
                            <Form.Item
                                label="拷贝 4-bit 模型"
                                name="copy_4bit_model"
                                valuePropName="checked"
                            >
                                <Switch/>
                            </Form.Item>
                            <Form.Item
                                label="Sentence Transformers Class"
                                name="sentence_transformers_class"
                            >
                                <Input placeholder="请输入 Sentence Transformers 的类"/>
                            </Form.Item>

                            <Form.Item
                                label="Sentence Transformers Name"
                                name="sentence_transformers_name"
                            >
                                <Input placeholder="请输入 Sentence Transformers 名称"/>
                            </Form.Item>

                            <Form.Item
                                label="User ID"
                                name="user_id"
                                className="hidden"
                            >
                                <Input placeholder="请输入用户 ID"/>
                            </Form.Item>
                        </Form>
                    </Modal>
                </>
        },
        {
            key: 'cnn',
            label: 'CNN模型管理',
            children:
                <>
                    <div style={{marginBottom: "20px"}}>
                        <Button type="primary" onClick={openCreateCnnModal}>
                            下载新的CNN模型
                        </Button>
                    </div>
                    <Table
                        dataSource={cnnDatas.cnnProps}
                        columns={cnnDatas.columns}
                        rowKey="model_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                        onRow={(record) => {
                            return {
                                onClick: () => fetchWeight(record)
                            }
                        }}
                    />
                    <Modal
                        title="下载新CNN模型"
                        open={isCnnModalVisible}
                        onCancel={() => setIsCnnModalVisible(false)}
                        onOk={() => {
                            cnnform
                                .validateFields()
                                .then(handleCnnSubmit)
                                .catch((info) => {
                                    console.log("表单校验失败:", info);
                                });
                        }}
                    >
                        <Form
                            form={cnnform}
                            layout="vertical"
                            initialValues={{
                                model_name: "yolov8l-pose",
                                model_class: "",
                                tokenizer_class: "",
                                processor_class: "",
                                load_in_4bit: true,
                                copy_4bit_model: true,
                                from_package: "ultralytics==8.2.0",
                                sentence_transformers_class: "",
                                sentence_transformers_name: "",
                                user_id: appConfig.userID,
                            }}
                        >
                            <Form.Item
                                label="Model Name"
                                name="model_name"
                            >
                                <Input placeholder="请输入模型名称，例如 yolov8l_pose"/>
                            </Form.Item>
                            {/* 字符串类型字段 */}
                            <Form.Item label="From Package" name="from_package">
                                <Input placeholder="请输入包名，例如 ultralytics=8.2.0"/>
                            </Form.Item>
                            <Form.Item
                                label="User ID"
                                name="user_id"
                                className="hidden"
                            >
                                <Input placeholder="请输入用户 ID"/>
                            </Form.Item>
                        </Form>
                    </Modal>
                </>
        },
        {
            key: 'longrun',
            label: '长运行管理',
            children:
                <>
                    <div style={{marginBottom: "20px"}}>
                        <Button type="primary" onClick={openCreateLongrunModal}>
                            创建新的长运行
                        </Button>
                    </div>
                    <Table
                        dataSource={longrunDatas?.longrunProps}
                        columns={longrunDatas?.columns}
                        rowKey="model_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                    />
                    <Modal
                        title="创建新的长运行"
                        open={isLongrunModalVisible}
                        onCancel={() => setIsLongrunModalVisible(false)}
                        onOk={() => {
                            longrunform
                                .validateFields()
                                .then(handleLongrunSubmit)
                                .catch((info) => {
                                    console.log("表单校验失败:", info);
                                });
                        }}
                    >
                        <Form
                            form={longrunform}
                            layout="vertical"
                            initialValues={{
                                model_name: "file_operate",
                                model_class: "",
                                tokenizer_class: "",
                                processor_class: "",
                                load_in_4bit: true,
                                copy_4bit_model: true,
                                from_package: "",
                                sentence_transformers_class: "",
                                sentence_transformers_name: "",
                                user_id: appConfig.userID,
                            }}
                        >
                            <Form.Item
                                label="Run Name"
                                name="model_name"
                            >
                                <Input placeholder="请输入执行名称，例如 file_operate"/>
                            </Form.Item>
                            <Form.Item
                                label="User ID"
                                name="user_id"
                                className="hidden"
                            >
                                <Input placeholder="请输入用户 ID"/>
                            </Form.Item>
                        </Form>
                    </Modal>
                </>
        }
    ]
    return (
        <>
            {tasks.length > 0 && <Card title="模型下载任务进度">
                <List
                    dataSource={tasks}
                    renderItem={(task) => (
                        <List.Item className="flex items-center justify-between">
                            <div className="flex items-center gap-4 max-w-[600px]">
                                {/* 模型名 + 状态标签 */}
                                <div className="flex items-center gap-2 truncate max-w-[240px]">
                                    <span className="font-semibold truncate">{task.model_name}</span>
                                    {task.status === 'downloading' && <Tag color="blue">下载中</Tag>}
                                    {task.status === 'START' && <Tag color="green">准备中</Tag>}
                                    {task.status === 'error' && <Tag color="red">失败</Tag>}
                                </div>

                                {/* 错误信息（可选） */}
                                {task.error && (
                                    <Text type="danger" className="text-sm text-red-500">
                                        {task.error}
                                    </Text>
                                )}
                            </div>

                            {/* 进度条 */}
                            <Progress
                                percent={task.progress}
                                status={
                                    task.status === 'error'
                                        ? 'exception'
                                        : task.status === 'completed'
                                            ? 'success'
                                            : 'active'
                                }
                                className="w-52"
                            />
                        </List.Item>
                    )}
                />
            </Card>}
            <Tabs
                defaultActiveKey="llm"
                items={items}
                onChange={onTabChange}
            />
        </>
    );
};

import React, {useEffect, useState} from "react";
import {useAppConfig} from "@/context";
import {UserInfoStatus} from "@/common";
import {
    Button,
    Form,
    Layout,
    Modal,
    Space,
    Table,
    Tag,
    Input,
    Select,
    Collapse,
    List,
    Popconfirm, Card, message, Spin
} from "antd";
import {RobotOutlined, SendOutlined, EditOutlined, DeleteOutlined, EyeOutlined} from '@ant-design/icons';
import {ColumnsType} from "antd/es/table";
import {useNavigate} from "react-router-dom";
import {v4} from "uuid";
import dayjs from 'dayjs'; // 用于格式化和排序时间
import {
    addProject,
    BaseWebUrl,
    deleteProject, deleteVersion,
    getComponentsOwnerIDs,
    getProjectList, getProjectRuntime, getProjectVersionList,
    ProjectData,
    ProjectVersionData, publishProject, reRunProject
} from "@/tools";

const ProjectApp: React.FC = () => {
    const {appConfig} = useAppConfig();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    // 组件库所属IDS
    const [composOwnerIDs, setComposOwnerIDs] = useState<string[]>([]);
    // 获取状态对应的标签颜色
    const getStatusColor = (status: string) => {
        switch (status) {
            case '进行中':
                return 'processing';
            case '已完成':
                return 'success';
            case '计划中':
                return 'default';
            default:
                return 'default';
        }
    };

    // 表格列定义
    const columns: ColumnsType<ProjectData> = [
        {
            title: '项目ID',
            dataIndex: 'project_id',
            key: 'project_id',
            width: 500,
        },
        {
            title: '项目名称',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            ),
            filters: [
                {text: '进行中', value: '进行中'},
                {text: '已完成', value: '已完成'},
                {text: '计划中', value: '计划中'},
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: '操作',
            key: 'action',
            width: 250,
            render: (_, record) => (
                <Space size="middle">
                    {/* 预览按钮 */}
                    <Button
                        type="text"
                        icon={<EyeOutlined/>}
                        title="预览执行"
                        onClick={(e) => {
                            e.stopPropagation();
                            sessionStorage.setItem('project_runtime', JSON.stringify({...record,'mode':'runtime'}))
                            window.open(`${BaseWebUrl}/runtime`, "_blank")
                        }}
                    />
                    {/* 编辑按钮 */}
                    <Button
                        type="text"
                        icon={<EditOutlined/>}
                        title="编辑模型"
                        onClick={(e) => {
                            e.stopPropagation();
                            // 编辑逻辑
                            sessionStorage.setItem('project_pipeline', JSON.stringify(record))
                            window.open(`${BaseWebUrl}/pipeline`, "_blank")
                        }}
                    />
                    {/* 模型管理按钮 */}
                    <Button
                        type="text"
                        icon={<RobotOutlined />}
                        title="算力管理"
                        onClick={(e) => {
                            e.stopPropagation();
                            // 模型管理逻辑
                            sessionStorage.setItem('project_model', JSON.stringify(record));
                            window.open(`${BaseWebUrl}/model`, "_blank");
                        }}
                    />
                    <Popconfirm
                        title="确定要删除这个项目吗？"
                        description={`项目ID: ${record.project_id}`}
                        onConfirm={(e) => {
                            e?.stopPropagation(); // 防止冒泡
                            console.info('删除:', record.project_id);
                            deleteProject(appConfig.userID, record.project_id).then(() => {
                                fetchProjectList();
                            });
                        }}
                        onCancel={(e) => e?.stopPropagation()} // 可选：取消时阻止冒泡
                        okText="是"
                        cancelText="否"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined/>}
                            onClick={(e) => e.stopPropagation()} // 必须保留，防止父组件点击
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    // 删除项目
    const onDelete = async (projectID:string, versionID:string) =>  {
        setIsLoading(true)
        deleteVersion(appConfig.userID,projectID, versionID).then(r => {
            setIsLoading(false)
            getProjectVersionList(appConfig.userID,projectID).then(versions => {
                setProjectVersionMap({ ...projectVersionMap, [projectID]: versions }); // 存储版本数据
            })
        })
    }
    // 119 推送到 146
    const [pushVisible, setPushVisible] = useState(false);
    // 推送到 119 发布
    const [open, setOpen] = useState(false);
    const [imageVersion, setImageVersion] = useState("");
    const [versionID, setVersionID] = useState("");
    // 响应发布119
    const handleOk = () => {
        setIsLoading(true)
        if (!imageVersion.trim()) {
            Modal.warning({
                title: "请输入镜像版本号",
            });
            return;
        }
        // 启动指定的项目
        reRunProject(appConfig.userID,`cbtai-hao.tencentcloudcr.com/cbtai/pyj2p:${imageVersion}`).then(value => {
            message.success(`开发环境启动:${value}`);
        })
        setOpen(false);
        setImageVersion(""); // 清空输入
        setIsLoading(false)
    };
    // 响应推送
    const handlePush = (projectID:string) => {
        console.log("输入参数", versionID)
        setIsLoading(true)
        if (!imageVersion.trim()) {
            Modal.warning({
                title: "请输入镜像版本号",
            });
            return;
        }
        // 启动指定的项目
        setIsLoading(true)
        publishProject(appConfig.userID, projectID, imageVersion.trim()).then(versionID=> {
            console.log("输出的版本是",versionID)
            setIsLoading(false)
        })
        setPushVisible(false);
        setImageVersion(""); // 清空输入
        setIsLoading(false)
    };
    // 返回items
    const getAllCollapseItems = (record: ProjectData) => {
        const versions = projectVersionMap[record.project_id] || [];
        const sortedVersions = versions.sort((a, b) => dayjs(b.updatetime).valueOf() - dayjs(a.updatetime).valueOf());
        console.log("获取的最新镜像版本",projectImageVersions)
        console.log("获取的最新项目版本",projectVersions)
        return [{
            key: record.project_id,
            label: `【${record.name}】版本列表`,
            children: versions && versions.length > 0 ? (
                <List
                    size="small"
                    bordered
                    dataSource={sortedVersions}
                    renderItem={(version) => (
                        <List.Item >
                            <Space>
                                {version.version_id !== projectVersions[record.project_id]?
                                <strong>{version.version_id}</strong>:
                                <strong className="text-red-500">{version.version_id}</strong>}
                                <span style={{ marginLeft: "auto" }}>{version.updatetime}</span>
                                <span style={{ marginLeft: "auto" }}>{projectImageVersions[record.project_id]}</span>
                                <Popconfirm
                                    title="确定删除这个版本？"
                                    onConfirm={() => onDelete(record.project_id, version.version_id)}
                                    okText="删除"
                                    cancelText="取消"
                                >
                                    <Button danger size="small">删除</Button>
                                </Popconfirm>

                                {/* 发布按钮 */}
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("当前版本号", version.version_id)
                                        setVersionID(version.version_id)
                                        setImageVersion(projectImageVersions[record.project_id])
                                        setPushVisible(true)
                                    }}
                                >推送</Button>
                            </Space>
                            <Modal
                                open={pushVisible}
                                title="确认推送？"
                                onCancel={() => setPushVisible(false)}
                                onOk={() => handlePush(version.project_id)}
                                okText="确定"
                                cancelText="取消"
                            >
                                <p>如要修改镜像版本，请输入：</p>
                                <Input
                                    value={imageVersion}
                                    onChange={(e) => setImageVersion(e.target.value)}
                                    placeholder="请输入镜像版本"
                                />
                            </Modal>
                        </List.Item>
                    )}
                />
                ): ( <>
                    <Button
                        size="small"
                        type="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            setImageVersion(projectImageVersions[record.project_id])
                            setPushVisible(true)
                        }}
                    >推送</Button>
                    <Modal
                        open={pushVisible}
                        title="确认推送？"
                        onCancel={() => setPushVisible(false)}
                        onOk={() => handlePush(record.project_id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <p>如要修改镜像版本，请输入：</p>
                        <Input
                            value={imageVersion}
                            onChange={(e) => setImageVersion(e.target.value)}
                            placeholder="请输入镜像版本"
                        />
                    </Modal>
            </>
    )
        }];
    }
    // 表格嵌套行渲染（显示版本列表）
    const expandedRowRender = (record: ProjectData) => {
        // 获取当前项目对应的版本列表
        return (
            <Collapse
                items = {getAllCollapseItems(record)}
            />
        );
    };
    // 切换展开的行并加载版本数据
    const [projectVersionMap, setProjectVersionMap] = useState<Record<string, ProjectVersionData[]>>({}); // 项目ID对应的版本数据
    const handleCollapseChange = async (projectID: string) => {
        if (expandedRowKeys.includes(projectID)) {
            // 如果已展开，则关闭该行
            setExpandedRowKeys(expandedRowKeys.filter((id) => id !== projectID));
        } else {
            fetchRuntimeVersion(projectID).then(() => {
                // 如果未展开，新增到展开列表并加载数据
                if (!projectVersionMap[projectID]) {
                    getProjectVersionList(appConfig.userID,projectID).then((versions) => {
                        setProjectVersionMap({ ...projectVersionMap, [projectID]: versions }); // 存储版本数据
                    })
                }
                setExpandedRowKeys([...expandedRowKeys, projectID]); // 展开该行
            })
        }
    };

    // 跳转到项目开发
    const handleRowClick = (record: ProjectData) => {
        // 跳转到开发页面，例如路径为 /dev
        navigate(`/dev`, {state: record});
    };
    // 处理创建项目表单提交
    const handleCreateProject = (values: any) => {
        // 构造新的项目数据（此处简单示例，实际可调用 API 创建项目）
        const newProject: ProjectData = {
            project_id: v4(),
            name: values.name,
            description: values.description,
            owner_id: values.composOwnerID,
            status: "计划中",
            user_id: appConfig.userID,
            page_id:'',
            mode:'dev'
        };
        // 远程执行
         addProject(newProject).then(r => {
            console.log("增加了项目在用户下", r, newProject.project_id)
            fetchProjectList()
        })
        setCreateModalVisible(false);
        form.resetFields();
    };
    const fetchProjectList = async () => {
        const cheng =await getProjectList(appConfig.userID)
        console.log("获取的项目列表", cheng)
        setProjects(cheng);
    }
    useEffect(() => {
        fetchProjectList();
    }, [appConfig.userID]);

    const [projectVersions, setProjectVersions] = useState<Record<string,string>>();
    const [projectImageVersions, setProjectImageVersions] = useState<Record<string,string>>();

    const fetchRuntimeVersion = async (projectID:string) => {
        const projectRuntime = await getProjectRuntime(appConfig.userID,projectID);
        setProjectVersions(prev=> ({...prev ,[projectID]:projectRuntime.version_id}))
        setProjectImageVersions(prev =>( {...prev,[projectID]:projectRuntime.image_version}))
    }

    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]); // 当前展开行的项目ID

    useEffect(() => {
        const fetchComponentOwenerIDs = async () => {
            const cheng = await getComponentsOwnerIDs()
            setComposOwnerIDs(cheng)
        }
        fetchComponentOwenerIDs().then(()=> setIsLoading(false))

    }, []);
    if (isLoading)
        return (
        <div className="loading-container">
            { appConfig.IS_SPIN?
                <Spin tip="加载中，请稍等..." size="large" />:
                <div/>
            }
        </div>
    );
    return (
        <Layout className="min-h-screen">
            {/* Header */}
            <Layout.Header className="bg-gray-800 text-white p-0">
                <UserInfoStatus/>
            </Layout.Header>
            <Layout.Content>
                {/* 创建项目按钮 */}
                <Space >
                    <Button type="primary" onClick={() => setCreateModalVisible(true)}>
                        创建项目
                    </Button>
                    <Button  type="primary"
                            onClick={() => {
                                setOpen(true)
                            }}
                    >重新发布119</Button>
                    <Modal
                        open={open}
                        title="确认发布？"
                        onCancel={() => setOpen(false)}
                        onOk={() => handleOk()}
                        okText="确定"
                        cancelText="取消"
                    >
                        <p>如要修改镜像版本，请输入：</p>
                        <Input
                            value={imageVersion}
                            onChange={(e) => setImageVersion(e.target.value)}
                            placeholder="请输入镜像版本"
                        />
                    </Modal>
                </Space>
                <Table
                    dataSource={projects}
                    columns={columns}
                    rowKey="project_id"
                    expandedRowRender={(record) => expandedRowRender(record)} // 嵌套渲染
                    expandedRowKeys={expandedRowKeys} // 当前展开行的 key 列表
                    onExpand={(expanded, record) => handleCollapseChange(record.project_id)} // 展开/收起
                    loading={isLoading}
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                    })}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 个项目`
                    }}
                />
            </Layout.Content>
            <Card
                title="全局网络配置信息"
                className="w-full bg-white shadow-md rounded-md p-6"
            >
                <Space direction="vertical" size="middle">
                    <div>
                        <strong>GLOBAL_IP: </strong>
                        {appConfig?.GLOBAL_IP || "未配置"}
                    </div>
                    <div>
                        <strong>MODEL_IP: </strong>
                        {appConfig?.MODEL_IP || "未配置"}
                    </div>
                    <div>
                        <strong>MODEL_API_PORT: </strong>
                        {appConfig?.MODEL_API_PORT || "未配置"}
                    </div>
                    <div>
                        <strong>TURN_IP: </strong>
                        {appConfig?.TURN_IP || "未配置"}
                    </div>
                    <div>
                        <strong>TURN_PORT: </strong>
                        {appConfig?.TURN_PORT || "未配置"}
                    </div>
                    <div>
                        <strong>GLOBAL_DEV_PORT: </strong>
                        {appConfig?.GLOBAL_DEV_PORT || "未配置"}
                    </div>
                    <div>
                        <strong>GLOBAL_API_PORT: </strong>
                        {appConfig?.GLOBAL_API_PORT || "未配置"}
                    </div>
                    <div>
                        <strong>GLOBAL_WS_PORT: </strong>
                        {appConfig?.GLOBAL_WS_PORT || "未配置"}
                    </div>
                </Space>
            </Card>
            {/* 创建项目的 Modal */}
            <Modal
                title="创建项目"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => {
                    form
                        .validateFields()
                        .then(handleCreateProject)
                        .catch((info) => {
                            console.log("表单校验失败：", info);
                        });
                }}
                okText="确定"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="项目名称"
                        name="name"
                        rules={[{ required: true, message: "请输入项目名称" }]}
                    >
                        <Input placeholder="请输入项目名称" />
                    </Form.Item>
                    <Form.Item
                        label="描述"
                        name="description"
                    >
                        <Input.TextArea rows={4} placeholder="请输入项目描述" />
                    </Form.Item>
                    <Form.Item
                        label="组件库"
                        name="composOwnerID"
                        rules={[{ required: true, message: "组件库名称" }]}
                    >
                    <Select placeholder="请选择组件库所属ID">
                        {composOwnerIDs && composOwnerIDs.map(ID => (
                            <Select.Option value={ID} key={ID}>{ID}</Select.Option>
                        ))}
                    </Select>
                    </Form.Item>

                </Form>
            </Modal>
        </Layout>
    );
};

export default ProjectApp;

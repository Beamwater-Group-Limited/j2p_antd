import React, {Suspense, useCallback, useEffect, useMemo, useState} from "react";
import {Button, Layout, Menu, Modal, Space, Spin, Table, Typography} from "antd";
import {
    HomeOutlined,
    AppstoreAddOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    VerifiedOutlined,
    ToolOutlined,
} from '@ant-design/icons';
import {PipelineCateList, PipelineInstanceList, PipelineInstantTask, PipeTaskFlowList} from "@/ide";
import {
    createPipeRuntimeController,
    DynamicPipelineListProps,
    getPipeInstanceList, getPipeRuntimeControllerPID,
    getPipeType, getScheduleStateList,
    ListPipeTaskFlow,
    PipeTaskFlowListProps, ProjectData, ScheduleExecuteStateProps, stopPipeRuntimeController,
} from "@/tools";
import {ProjectProvider, useAppConfig} from "@/context";
import {useLocation, useNavigate} from "react-router-dom";
import {useChange} from "@/hooks";
import {ScheduleStateList} from "@/ide/pipeline/ScheduleStateList";

const PipelineApp: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {appConfig} = useAppConfig()
    const navigate = useNavigate();
    const location = useLocation();
    // 选定的项目
    const [projectConfig, setProjectConfig] = useState<ProjectData>();
    const [selectedMenu, setSelectedMenu] = useState(() => {
        return localStorage.getItem("selected_menu") || "1";
    }); // 用于跟踪选中的菜单项
    const handleMenuClick = (e) => {
        setSelectedMenu(e.key); // 更新选中的菜单项
        localStorage.setItem("selected_menu", e.key)
    };
    // 保存数据 管道类型列表
    const [pipeTypeList, setPipeTypeList] = useState<DynamicPipelineListProps>({
        headers: [],
        data: [],
    })
    // 保存管道实例
    const [pipeInstanceList, setPipeInstanceList] = useState({
        headers: [],
        data: [],
    })
    // 可用任务流
    const [availableTasks, setAvailableTasks] = useState<PipeTaskFlowListProps>({
        headers: [],
        data: [],
    });
    // 调度执行状态
    const [scheduleState, setScheduleState] = useState<ScheduleExecuteStateProps>({
        headers: [],
        scheduleProps: [],
    });
    // 当前执行的PID的字符串状态
    const [pidString,setPidstring] = useState<string>()
    const {xData:proIDS} = useChange(
        useMemo(() =>[appConfig, projectConfig,pidString], [appConfig, projectConfig,pidString]),
        getPipeRuntimeControllerPID,[appConfig?.userID, projectConfig?.project_id], () => {
            setIsLoading(false)
        }
    )
    // 终止进程
    const handleStop = (record) => {
        stopPipeRuntimeController(appConfig.userID, projectConfig.project_id).then(v => setPidstring(v))
    }
    // 表格列定义
    const ProcColumns = [
        {
            title: "序号",
            key: "index",
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "PID",
            dataIndex: "PID",
            key: "PID",
        },
        {
            title: "命令",
            dataIndex: "cmdLine",
            key: "cmdLine",
        },
        {
            title: "操作",
            key: "action",
            width: 100,
            render: (_, record) => (
                <Space>
                    <Button
                        danger
                        size="small"
                        onClick={() => handleStop(record)}
                    >
                        停止
                    </Button>
                </Space>
            ),
        },
    ];
    // 响应事件回调
    const handleDataChange = useCallback(() => {
        fetchAvailableTasksFlow().then(console.log);
    }, [])
    // 发布任务端点
    const handlePublish = () => {
        console.log("发布")
        fetchRunController().then(console.log)
    }
    // 根据选中的菜单项来更新内容区域
    const getContent = () => {
        switch (selectedMenu) {
            case "1":
                return <PipelineCateList data={pipeTypeList.data} headers={pipeTypeList.headers} />;
            case "2":
                return <PipelineInstanceList data={pipeInstanceList.data} headers={pipeInstanceList.headers}
                                             pipeTypes={pipeTypeList.data} />;
            case "3":
                return <PipelineInstantTask data={pipeInstanceList.data} headers={pipeInstanceList.headers}
                                            availableTasks={availableTasks.data}/>;
            case "4":
                return <PipeTaskFlowList data={availableTasks.data} headers={availableTasks.headers}
                                         onDataChange={handleDataChange}/>;
            case "5":
                return <ScheduleStateList headers={scheduleState.headers} scheduleProps={scheduleState.scheduleProps} />;
            default:
                return (
                    <div>
                        <h2>欢迎</h2>
                        <p>选择菜单项查看内容</p>
                    </div>
                );
        }
    };
    // 外置 获取有效任务流
    const fetchAvailableTasksFlow = async () => {
        const cheng = await ListPipeTaskFlow(appConfig.userID)
        console.log("可用任务列表:", cheng)
        if (cheng) {
            setAvailableTasks(cheng)
        }
    }
    // 执行任务启动命令
    const fetchRunController = async () => {
        const cheng = await createPipeRuntimeController(appConfig.userID, projectConfig.project_id)
        console.log("启动的controller主程序PID", cheng)
        setPidstring(cheng)
    }
    useEffect(() => {
        setPidstring("run")
        // 如果是点击跳转过来的
        if (location.state) {
            console.log("跳转配置", location.state)
            setProjectConfig({...location.state, 'mode': 'dev'});
            sessionStorage.setItem("project_pipeline", JSON.stringify(location.state))
        } else {
            // 刷新的场景
            if (sessionStorage.getItem('project_pipeline')) {
                console.log("跳转配置为空，获取本地配置", location.state, sessionStorage.getItem('project_pipeline'))
                setProjectConfig(JSON.parse(sessionStorage.getItem('project_pipeline')))
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
    const fetchPipeInstanceList = async () => {
        setIsLoading(true);
        const cheng = await getPipeInstanceList(appConfig.userID, projectConfig.project_id);
        console.log("管道实例列表:", cheng)
        if (cheng) {
            setPipeInstanceList(cheng)
        }
    }
    const fetchPipeCateList = async () => {
        const cheng = await getPipeType();
        console.log("管道类型加载:", cheng)
        if (cheng) {
            setPipeTypeList(cheng)
        }
    }
    const fetchScheduleList = async () => {
        const cheng = await getScheduleStateList(appConfig.userID, projectConfig.project_id);
        console.log("调度状态记录", cheng)
        if (cheng) {
            setScheduleState(cheng)
        }
    }
    useEffect(() => {
        if (!projectConfig) return;
        fetchPipeCateList().then(() => {
            fetchPipeInstanceList().then(() => {
                fetchAvailableTasksFlow().then(() => {
                    fetchScheduleList().then(() => {
                        setIsLoading(false);
                    })
                });
            })
        });
    }, [projectConfig]);
    const [collapsed, setCollapsed] = useState(false);
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };
    const menuItems = [
        {
            key: "1",
            icon: <HomeOutlined/>,
            label: "管道类型",
        },
        {
            key: "2",
            icon: <AppstoreAddOutlined/>,
            label: "管道调度",
        },
        {
            key: "3",
            icon: <UserOutlined/>,
            label: "任务挂载",
        },
        {
            key: "4",
            icon: <VerifiedOutlined/>,
            label: "任务流管理",
        },
        {
            key: "5",
            icon: <ToolOutlined/>,
            label: "调度执行状态",
        },

    ];
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
        <ProjectProvider defaultProjectConfig={projectConfig}>
            <div className="PipelineApp">
                <Layout className="min-h-screen">
                    {/* Header */}
                    <Layout.Header className="bg-gray-800 text-white h-16 px-4 flex items-center justify-between">
                        <Space className="flex items-center justify-between w-full px-4 gap-4">
                            <Button icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                                    onClick={toggleCollapsed}
                                    size="small"/>
                            <span className="text-2xl font-bold"> 超级简单的管道编排 - 项目ID：{projectConfig?.project_id ?? "未设置"}</span>
                            <Button type="primary" size="small"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                                    onClick={handlePublish}
                            >
                                部署管道
                            </Button>
                        </Space>
                    </Layout.Header>

                    <Layout>
                        {/* Sider (Sidebar Menu) */}
                        <Layout.Sider className="bg-gray-800" width={200} collapsed={collapsed}>
                            <Menu
                                mode="inline"
                                defaultSelectedKeys={[selectedMenu]}
                                className="h-full"
                                theme="dark"
                                items={menuItems}
                                onClick={handleMenuClick}  // 点击菜单时更新选中的菜单项
                            >
                            </Menu>
                        </Layout.Sider>

                        {/* Content */}
                        <Layout className="px-6 py-4">
                            {proIDS && proIDS.length > 0 && (
                                <Table
                                    rowKey={(_, i) => i}
                                    columns={ProcColumns}
                                    dataSource={proIDS}
                                    bordered
                                    size="small"
                                    pagination={false}
                                />
                            )}
                            <Suspense fallback={<div>加载组件中...</div>}>
                                {getContent()}
                            </Suspense>
                        </Layout>
                    </Layout>
                </Layout>
            </div>
        </ProjectProvider>
    );
};

export default PipelineApp;

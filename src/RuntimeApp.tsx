import React, {useEffect, useMemo, useState} from "react";
import {EventProvider, ProjectProvider, RoutesProvider, useAppConfig} from "@/context";
import {getRoutes, ProjectData} from "@/tools";
import {WebSocketProvider} from "@/context/WebSocketContext";
import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {Modal, Spin, Typography} from "antd";
import RuntimePage from "@/RuntimePage";
import {useChange} from "@/hooks/useChange";

const RuntimeApp: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {appConfig} = useAppConfig()
    const navigate = useNavigate();
    const location = useLocation();
    // 选定项目
    const [projectConfig, setProjectConfig] = useState<ProjectData>(null);
    // 渲染路由
    const renderRoutes = (routes: any[]) => {
        return routes.map((route, i) => {
            return (
                <Route key={route.path} path={route.path} element={<RuntimePage/>}>
                    {route.children && renderRoutes(route.children)}
                </Route>
            );
        })
    }

    const {xData:routes} = useChange(
        useMemo(() =>[appConfig, projectConfig], [appConfig, projectConfig]),
        getRoutes,[appConfig?.userID, projectConfig?.project_id], () => {
            setIsLoading(false)
        }
    )

    // 初始项目配置信息
    useEffect(() => {
        // 如果是本页面点击跳转
        if (location.state) {
            console.log("跳转配置", location.state)
            setProjectConfig({...location.state, 'mode': 'dev'});
            sessionStorage.setItem("project_runtime", JSON.stringify(location.state))
        }else{
            if (process.env.REACT_APP_RUNTIME === "1"){
                // 119测试 或者 146
                const loadConfig: ProjectData =  {
                    project_id: (process.env.REACT_APP_BASE_PREFIX || '').replace(/^\/+/, ''),
                    name: "动态项目",
                    description: "动态生成的项目",
                    owner_id: appConfig.userID,
                    status: "运行中",
                    user_id: appConfig.userID,
                    mode: "runtime",
                    page_id:""
                }
                sessionStorage.setItem("project_runtime", JSON.stringify(loadConfig))
                console.log("跳转配置为空，创建本地配置", location.state, sessionStorage.getItem('project_runtime'))
            }
            // 刷新的场景 新页面场景
            if (sessionStorage.getItem('project_runtime')) {
                console.log("跳转配置为空，加载本地配置", location.state, sessionStorage.getItem('project_runtime'))
                setProjectConfig(JSON.parse(sessionStorage.getItem('project_runtime')))
            }else{
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

    // 替换加载中的显示内容
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
            <WebSocketProvider>
                <EventProvider>
                <div className="App">
                    {/*<Typography.Title level={5} className="text-center">*/}
                    {/*    超级简单的页面编辑器 - 项目ID：{projectConfig.project_id}*/}
                    {/*</Typography.Title>*/}
                    <RoutesProvider defaultRoutes={routes}>
                        <Routes>
                            {/* 如果当前路径为 /runtime 且 routes 存在，则自动重定向至 routes[0] 定义的默认页面 */}
                            {routes && routes.length > 0 && (
                                <Route
                                    index
                                    element={<Navigate replace to={`/runtime${routes[0].path}`}/>}
                                />
                            )}
                            {renderRoutes(routes)}
                            <Route path="*" element={<RuntimePage/>}/>
                        </Routes>
                    </RoutesProvider>
                </div>
                </EventProvider>
            </WebSocketProvider>
        </ProjectProvider>
    );
};

export default RuntimeApp;

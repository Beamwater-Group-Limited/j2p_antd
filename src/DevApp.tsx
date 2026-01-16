import {Button, Col, List, Menu, Modal, Row, Typography, Card, Switch, Input, Spin} from "antd";
import React, {useEffect, useMemo, useState} from "react";
import {EventProvider, ProjectProvider, RoutesProvider, useAppConfig} from "@/context";
import {WebSocketProvider} from "@/context/WebSocketContext";
import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {DevPageFallback, DictItemTree} from "@/ide";
import {
    addDom,
    BaseWebUrl,
    getPages,
    getRoutes,
    ProjectData,
    removeDom, updateRoutes
} from "@/tools";
import DevPage from "@/DevPage";
import {useUpdateChange} from "@/hooks";
import {useChange} from "@/hooks/useChange";
import {ErrorBoundary} from "react-error-boundary";

function DevApp() {
    const [isPagesLoading, setIsPagesLoading] = useState<boolean>(true);
    const [isRoutesLoading, setIsRoutesLoading] = useState<boolean>(true);
    const {appConfig} = useAppConfig()
    const navigate = useNavigate();
    const location = useLocation();
    // 选定的项目
    const [projectConfig,setProjectConfig] = useState<ProjectData>();
    // 高亮菜单
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [showOutlet, setShowOutlet] = useState<boolean>(false);
    const [defaultPath, setDefaultPath] = useState<string>("/dev/home/main");
    // 新增页面的处理函数
    const handleAddPage = () => {
        addDom(appConfig.userID, projectConfig.project_id).then(newPage => {
            if (newPage && newPage.trim()) {
                setPageIDs([...pageIDs, newPage.trim()]);
            }
        })
    };
    // 删除页面的处理函数
    const handleDeletePage = (index: number) => {
        // 删除页面
        const pageID = pageIDs[index];
        removeDom(appConfig.userID, projectConfig.project_id, pageID).then(() => {
            setPageIDs(pageIDs.filter((_, i) => i !== index));
        })
    };
    // 渲染路由
    const renderRoutes = (routes: any[]) => {
        return routes.map((route, i) => {
            if(route.default){
               return (
                    <Route  key={`${route.path}-index-redirect`} index element={<Navigate replace to={route.default} />}  />
               )
            }
            return (
                <Route key={route.path} path={route.path} element={
                    <ErrorBoundary FallbackComponent={DevPageFallback}>
                    <DevPage label={`路径${route.path}`}/>
                    </ErrorBoundary>
                }>
                    {route.children && renderRoutes(route.children)}
                </Route>
            );
        })
    }

    // 递归生成 菜单的 item
    const generateMenuItems = (routes: any[], parentPath="") => {
        return routes.map(route => {
            const fullPath = [parentPath, route.path].filter(Boolean).join("/");
            const item = {
                label: route.title,
                key: fullPath
            };
            if (route.children && route.children.length > 0) {
                item['key'] =  fullPath + "-group"
                const children= generateMenuItems(route.children,fullPath);
                item['children'] = [...children, {label: `${route.title}（入口页）`, key: fullPath}]
            }
            return item;
        })
    }
    // 双向更新操作
    const {xData:routes, setXData:setRoutes } = useUpdateChange(
        null,
        updateRoutes,[appConfig?.userID, projectConfig?.project_id],
        useMemo(() =>[appConfig, projectConfig], [appConfig, projectConfig]),
        getRoutes,[appConfig?.userID, projectConfig?.project_id], () => setIsPagesLoading(false)
    )

    const {xData:pageIDs, setXData:setPageIDs} = useChange(
        useMemo(() =>[appConfig, projectConfig], [appConfig, projectConfig]),
        getPages,[appConfig?.userID, projectConfig?.project_id], () => setIsRoutesLoading(false)
    )
    // 初始项目配置信息
    useEffect(() => {
        // 如果是点击跳转过来的
        if (location.state) {
            console.log("跳转配置", location.state)
            setProjectConfig({...location.state, 'mode': 'dev'});
            sessionStorage.setItem("project_dev", JSON.stringify(location.state))
        }else{
            // 刷新的场景
            if (sessionStorage.getItem('project_dev')) {
                console.log("跳转配置为空，获取本地配置", location.state, sessionStorage.getItem('project_dev'))
                setProjectConfig(JSON.parse(sessionStorage.getItem('project_dev')))
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
    // 初始加载
    useEffect(() => {
        const path = location.pathname.replace(/^\/dev/, '') || '/';
        setSelectedKeys([path]);
    }, [location.pathname])

    if (isPagesLoading || isRoutesLoading) {  return (
        <div className="loading-container">
            { appConfig.IS_SPIN?
                <Spin tip="加载中，请稍等..." size="large" />:
                <div/>
            }
        </div>
    ) }
    return (
        <ProjectProvider defaultProjectConfig={projectConfig}>
            <WebSocketProvider>
                <EventProvider>
                    <div className="DevApp">
                        <Typography.Title level={5} className="text-center">
                            超级简单的页面编辑器 - 项目ID：{projectConfig.project_id}
                            状态: {JSON.stringify(location)}
                        </Typography.Title>
                        <div className="flex justify-between items-center w-full px-4 py-2 bg-white shadow">
                            {/* 左侧菜单 */}
                            <Menu
                                mode="horizontal"
                                items={generateMenuItems(routes)}
                                selectedKeys={selectedKeys}
                                onClick={({ key }) => {
                                    navigate(`/dev/${key}`.replace(/\/+/g, "/"), { state: projectConfig });
                                }}
                                className="flex-1"
                            />
                            {/* 右侧按钮区域 */}
                            <div className="flex gap-2 ml-4 shrink-0">
                            {/* 右侧按钮 */}
                            <Button
                                className="ml-4"
                                type="primary"
                                size="large"
                                onClick={() => {
                                    sessionStorage.setItem('project_runtime', JSON.stringify({ ...projectConfig, mode: 'runtime' }));
                                    window.open(`${BaseWebUrl}/runtime`, "_blank");
                                }}
                            >
                                预览
                            </Button>
                            {/* 右侧按钮 */}
                            <Button
                                className="ml-4"
                                type="primary"
                                size="large"
                                onClick={() => {
                                    sessionStorage.setItem('project_pipeline', JSON.stringify(projectConfig));
                                    window.open(`${BaseWebUrl}/pipeline`, "_blank")
                                }}
                            >
                                编辑管道
                            </Button>
                            <Button
                                className="ml-4"
                                type="primary"
                                size="large"
                                onClick={() => {
                                    sessionStorage.setItem('project_model',  JSON.stringify(projectConfig));
                                    window.open(`${BaseWebUrl}/model`, "_blank");
                                }}
                            >
                                编辑模型
                            </Button>
                            </div>
                        </div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <DictItemTree
                                    value={routes}
                                    defaultProp={[]}
                                    onChange={(value) => {
                                        const dictValue = JSON.parse(value);
                                        setRoutes(dictValue);
                                    }}
                                />
                            </Col>
                            <Col span={12}>
                                <List
                                    header={
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <span>可用页面</span>
                                            <Button type="primary" size="small" onClick={handleAddPage}>
                                                新增页面
                                            </Button>
                                        </div>
                                    }
                                    bordered
                                    dataSource={pageIDs}
                                    renderItem={(item:string, index) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key="delete"
                                                    size="small"
                                                    danger
                                                    onClick={() => handleDeletePage(index)}
                                                >
                                                    删除
                                                </Button>,
                                            ]}
                                        >
                                            {item}
                                        </List.Item>
                                    )}
                                />
                                <Card className="mt-4">
                                    <div className="flex justify-between items-center">
                                        <span>显示路由插槽</span>
                                        <Switch
                                            checked={showOutlet}
                                            onChange={(checked) => setShowOutlet(checked)}
                                            checkedChildren="显示路由插槽"
                                            unCheckedChildren="不显示路由插槽"
                                        />
                                    </div>
                                </Card>
                                <Card className="mt-4">
                                    <div className="flex justify-between items-center">
                                        <span>设置默认跳转路径</span>
                                        <Input
                                            value={ defaultPath }
                                            onChange={(e) => setDefaultPath(e.target.value)}
                                        />
                                    </div>
                                </Card>

                            </Col>
                        </Row>
                        <RoutesProvider defaultRoutes={routes} isShowOutlet={showOutlet}>
                            <Routes>
                                <Route
                                    path="*"  element={ <Navigate replace to={`${defaultPath}`.replace(/\/+/g, "/")}  /> }
                                />
                                {renderRoutes(routes)}
                            </Routes>
                        </RoutesProvider>
                    </div>
                </EventProvider>
            </WebSocketProvider>
        </ProjectProvider>
    );
}

export default DevApp;

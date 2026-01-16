import React, {useState, useEffect} from "react";
import {Row, Col, Typography, Card, Modal, Spin} from "antd";
import {Editor, Frame, Element} from "@craftjs/core";
import {useParams} from "react-router-dom";
import {
    createDivJson, deserializeComponentTree,
    serializeComponentTree,
} from "@/tools";
import {
    ComponentTypeProvider,
    WebSocketProvider,
    CompConfigProvider,
    useAppConfig,
    ProjectProvider,
    PagesProvider
} from "@/context";
import {loadComponents} from "@/tools";
import {CustomTopbar} from "@/ide/custom/CustomTopbar";
import {CustomSettings} from "@/ide/custom/CustomSettings";
import {CustomToolbox} from "@/ide/custom/CustomToolbox";
import {Layers} from "@craftjs/layers";
import {DevPageFallback} from "@/ide";
import {ErrorBoundary} from "react-error-boundary";

function CustomComponentApp() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {appConfig} = useAppConfig();
    // 获取节点类型
    const {componentType} = useParams<{ componentType: string }>(); // 获取路由参数 :componentType
    // 项目化配置
    const [projectConfig] = useState({
        project_id: componentType,
        name: "componentType",
        description: `渲染用组件配置${componentType}`,
        owner_id: "cbtai",
        status: "设计中",
        user_id: appConfig.userID,
        page_id: "home",
        mode:''
    });
    const [json, setJson] = useState<any>(() => {
        const saved = sessionStorage.getItem(componentType);
        console.log("加载的本地自定义组件序列化:",saved)
        if (!saved || Object.keys(saved).length === 0) {
            console.log("本地不存在组件结构序列化JSON")
        }
        if (saved) return JSON.parse(saved);
        return null
    });
    const [resolver, setResolver] = useState<Record<string, React.ElementType>>({});
    const onChange = (query: { serialize: () => any }) => {
        const json = query.serialize();
        if (json === "{}") return
        serializeComponentTree(projectConfig.owner_id, projectConfig.project_id, json).then(() => {
            sessionStorage.setItem(projectConfig.project_id, JSON.stringify(json));
        });
    };
    // 初始加载
    useEffect(() => {
        setIsLoading(true)
        const loadDomJson = async () => {
            let domJson = await deserializeComponentTree(projectConfig.owner_id,projectConfig.project_id);
            console.log("服务器定制组件结构", domJson)
            if (!domJson || domJson === "{}") {
                console.log("服务器组件结构JSON为空,生成", createDivJson())
                domJson = createDivJson()
            }
            sessionStorage.setItem(projectConfig.project_id, domJson)
            setJson(JSON.parse(domJson))
        };
        const fetchResolver = async () => {
            const loadedResolver = await loadComponents(null);
            if (!loadedResolver || Object.keys(loadedResolver).length === 0) {
                console.log("服务器加载解析器为空")
                return
            }
            setResolver(loadedResolver);
            console.log("设置解析器: ", loadedResolver);
        };
        loadDomJson().then( () => {
                fetchResolver().then(() => {
                    setIsLoading(false);
                })
            }
        );
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
        <ProjectProvider defaultProjectConfig={projectConfig}>
            <ComponentTypeProvider initialCompType={componentType}>
                <CompConfigProvider>
                    <WebSocketProvider>
                        <div className="CustomComApp">
                            <Typography.Title level={5} className="text-center">
                                自定义组件:{projectConfig.project_id}
                            </Typography.Title>
                            <PagesProvider defaultPages={{"pageID": "home","nodesStated":[]}}>
                                <ErrorBoundary FallbackComponent={DevPageFallback}>
                                {Object.keys(resolver).length > 0 && (
                                    <Editor resolver={resolver} enabled={true} onNodesChange={onChange}>
                                        <Row className="pt-2">
                                            <Col span={24}><CustomTopbar /></Col>
                                        </Row>
                                        <Row gutter={16} className="pt-2">
                                            <Col span={6}>
                                                <Layers/>
                                                <CustomToolbox/>
                                            </Col>
                                            <Col span={12}>
                                                <Row><Frame data={json}/></Row>
                                            </Col>
                                            <Col span={6}>
                                                <Card><CustomSettings/></Card>
                                            </Col>
                                        </Row>
                                    </Editor>
                                )}
                                </ErrorBoundary>
                            </PagesProvider>
                        </div>
                    </WebSocketProvider>
                </CompConfigProvider>
            </ComponentTypeProvider>
        </ProjectProvider>
    );
}

export default CustomComponentApp;

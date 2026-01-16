import React, {useState, useEffect} from "react";
import {Row, Col, Typography, Card, Spin} from "antd";
import {Editor, Frame} from "@craftjs/core";
import {Container} from "@/pipelines/cbtai/Container";
import {
    ComponentDefinePanel,
    ComponentStatesDefinePanel,
    XTopbar,
    XSettings, DevPageFallback
} from "@/ide";
import {useParams} from "react-router-dom";
import {
    getXCompoFromInner, ProjectData,
    serializeComponentTree
} from "@/tools";
import {
    ComponentTypeProvider,
    WebSocketProvider,
    CompConfigProvider,
    useAppConfig,
    ProjectProvider,
    PagesProvider
} from "@/context";
import {convertToJsonTree, createNodeTree, loadComponents} from "@/tools";
import {CompStatesProvider, XAgentNoDragProvider} from "@/context";
import {ErrorBoundary} from "react-error-boundary";

function XApp() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {appConfig} = useAppConfig()
    // 获取节点类型
    const {xType} = useParams<{ xType: string }>(); // 获取路由参数 :xType
    // 以组件为项目名称
    const [projectConfig] = useState<ProjectData>({
        project_id: getXCompoFromInner(xType),
        name: getXCompoFromInner(xType),
        description: getXCompoFromInner(xType),
        owner_id: 'cbtai',          // 所有权
        status: "计划中",
        user_id: appConfig.userID,
        page_id:'home',
        mode:''
    });
    // 加载组件解析器
    const [resolver, setResolver] = useState<Record<string, React.ElementType>>({});
    // 初始化节点树，可从本地存储读取配置
    const [json, setJson] = useState<any>(() => {
        const savedConfig = localStorage.getItem(getXCompoFromInner(xType));
        console.log("保存的节点树",savedConfig)
        if (savedConfig) {
            return JSON.parse(savedConfig);
        }
        // 可以预设一个默认配置
        const defaultConfig = convertToJsonTree(createNodeTree( "ROOT","Container" ))
        console.log("默认节点树",defaultConfig)
        return defaultConfig
    });
    // 当组件初始化属性变化时，保存到本地存储
    const onChange = (query: { serialize: () => any }) => {
        const json = query.serialize();
        console.log("组件配置发生变化", json);
        // 存储的条件是，组件正常加载了
        if (resolver[getXCompoFromInner(xType)]){
            serializeComponentTree(appConfig.userID,getXCompoFromInner(xType), json).then(() => {
            // 保存 JSON 数据到本地存储
                localStorage.setItem(getXCompoFromInner(xType), JSON.stringify(json));
            })
        }
    };
    // 组件解析器加载
    useEffect(() => {
        const fetchResolver = async () => {
            const loadedResolver = await loadComponents(getXCompoFromInner(xType));
            console.log("加载的解析器内容: ", Object.keys(loadedResolver)); // 输出解析器的键名
            console.log("完整解析器内容: ", loadedResolver); // 输出完整解析器信息
            if (Object.keys(loadedResolver).length === 0) {
                // 没有正常组件存在的情况下
                setResolver({Container})
                console.log("解析器内容",{Container})
            }else{
                // 组件正常存在
                setResolver(loadedResolver);
                console.log("设置解析器: ", loadedResolver);
                // 更新节点树
                const compTypeTree = createNodeTree("ROOT", getXCompoFromInner(xType));
                console.log("新节点树",compTypeTree)
                const compTypeJson = convertToJsonTree(compTypeTree);
                console.log("节点树 JSON 格式: ", JSON.stringify(compTypeJson, null, 2)); // JSON 树输出更清晰
                setJson(compTypeJson);
            }
            setIsLoading(false);
        };
        fetchResolver();
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
            <ComponentTypeProvider initialCompType={xType} >
                <CompConfigProvider >
                    <WebSocketProvider>
                        <CompStatesProvider>
                            <div className="ComponentApp">
                            <Typography.Title level={5} className="text-center">
                                组件配置 - 组件类型：{getXCompoFromInner(xType)}
                            </Typography.Title>
                            <PagesProvider defaultPages={{"pageID": getXCompoFromInner(xType),"nodesStated":[]}}>
                                <XAgentNoDragProvider modelapi={"http://xxx.xxx.xxx.xxx:18586/v1/process"}>
                            {Object.keys(resolver).length > 0 && (
                                <Editor
                                    resolver={resolver}
                                    enabled={true}
                                    onNodesChange={onChange}
                                >
                                    <Row className="pt-2">
                                        <Col span={24}>
                                            <XTopbar/>
                                        </Col>
                                    </Row>
                                    <Row gutter={16} className="pt-2">
                                        <Col span={16}>
                                            <Row>
                                                <ErrorBoundary FallbackComponent={DevPageFallback}>
                                                    <Frame data={json}/>
                                                </ErrorBoundary>
                                            </Row>
                                            <Row gutter={16} className="pt-2">
                                                <Col span={12}>
                                                    <ComponentDefinePanel/>
                                                </Col>
                                                <Col span={12}>
                                                    <ComponentStatesDefinePanel/>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col span={8}>
                                            <Card>
                                                <XSettings/>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row gutter={16} className="pt-2">
                                        <Col span={24}>
                                        </Col>
                                    </Row>
                                </Editor>

                            )}
                                </XAgentNoDragProvider>
                            </PagesProvider>
                        </div>
                        </CompStatesProvider>
                    </WebSocketProvider>
                </CompConfigProvider>
            </ComponentTypeProvider>
        </ProjectProvider>
    );
}

export default XApp;

import React, {useState, useEffect} from "react";
import {Row, Col, Typography, Card, Spin} from "antd";
import {Editor, Frame} from "@craftjs/core";
import {useParams} from "react-router-dom";
import {
    createDivJson, deserializeComponentTree,
    serializeComponentTree,
} from "@/tools";
import {
    ComponentTypeProvider,
    WebSocketProvider,
    useAppConfig,
    ProjectProvider,
    EventProvider,
    CompConfigProvider, PagesProvider
} from "@/context";
import {loadComponents} from "@/tools";
import {Layers} from "@craftjs/layers";
import {Toolbox, CustomPageSettings, CustomPageTopbar} from "@/ide";

// 定制页面
function CustomPageApp() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {appConfig} = useAppConfig();
    // 获取节点类型
    const {pageType} = useParams<{ pageType: string }>(); // 获取路由参数 :pageType
    // 项目化配置
    const [projectConfig] = useState({
        project_id: pageType,
        name: "pageType",
        description: `自定义页面配置${pageType}`,
        owner_id: appConfig.userID,
        status: "设计中",
        user_id: appConfig.userID,
        page_id: "home",
        mode:''
    });
    // 页面结构状态JSON树
    const [json, setJson] = useState<any>();
    const [resolver, setResolver] = useState<Record<string, React.ElementType>>({});
    // 响应结构改变
    const onChange = (query: { serialize: () => any }) => {
        const json = query.serialize();
        if (json === "{}") return
        serializeComponentTree(projectConfig.owner_id, projectConfig.project_id, json).then(() => {
            // console.log("服务器自定义组件结构存储: ")
            // sessionStorage.setItem(projectConfig.project_id, JSON.stringify(json));
        });
    };
    // 初始加载
    useEffect(() => {
        setIsLoading(true)
        const loadDomJson = async () => {
            let domJson = await deserializeComponentTree(projectConfig.owner_id, projectConfig.project_id);
            console.log("服务器定制组件结构", domJson)
            if (!domJson || domJson === "{}") {
                console.log("服务器组件结构JSON为空,生成", createDivJson())
                domJson = createDivJson()
            }
            // sessionStorage.setItem(projectConfig.project_id, domJson)
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
        loadDomJson().then(() => {
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
            <ComponentTypeProvider initialCompType={pageType}>
                <CompConfigProvider>
                    <WebSocketProvider>
                        <EventProvider>
                            <div className="CustomComApp">
                                <Typography.Title level={5} className="text-center">
                                    自定义页面:{projectConfig.project_id}
                                </Typography.Title>
                                <PagesProvider defaultPages={{"pageID": pageType,"nodesStated":[]}}>
                                {Object.keys(resolver).length > 0 && (
                                    <Editor
                                        resolver={resolver}
                                        enabled={true}
                                        onNodesChange={onChange}
                                    >
                                        <Row gutter={16} className="pt-2">
                                            <Col span={24}><CustomPageTopbar/></Col>
                                        </Row>
                                        <Row gutter={16} className="pt-2">
                                            <Col span={6}>
                                                <Layers/>
                                                <Toolbox/>
                                            </Col>
                                            <Col span={12}>
                                                <Frame data={json}/>
                                            </Col>
                                            <Col span={6}>
                                                <Card>
                                                    <CustomPageSettings/>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Editor>
                                )}
                                </PagesProvider>
                            </div>
                        </EventProvider>
                    </WebSocketProvider>
                </CompConfigProvider>
            </ComponentTypeProvider>
        </ProjectProvider>
    );
}

export default CustomPageApp;

import React, {useState, useEffect} from "react";
import {Row, Col, Typography, Card, Spin} from "antd";
import {Editor, Frame} from "@craftjs/core";
import {Container} from "@/pipelines/cbtai/Container";
import {
    ComponentDefinePanel,
    ComponentStatesDefinePanel,
    ChartTopbar,
    ChartSettings
} from "@/ide";
import {useParams} from "react-router-dom";
import {
    getChartCompoFromInner, ProjectData,
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

function ChartApp() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {appConfig} = useAppConfig()
    // 获取节点类型
    const {chartType} = useParams<{ chartType: string }>(); // 获取路由参数 :chartType
    // 以组件为项目名称
    const [projectConfig] = useState<ProjectData>({
        project_id: getChartCompoFromInner(chartType),
        name: getChartCompoFromInner(chartType),
        description: getChartCompoFromInner(chartType),
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
        const savedConfig = localStorage.getItem(getChartCompoFromInner(chartType));
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
        if (resolver[getChartCompoFromInner(chartType)]){
            serializeComponentTree(appConfig.userID,getChartCompoFromInner(chartType), json).then(() => {
            // 保存 JSON 数据到本地存储
                localStorage.setItem(getChartCompoFromInner(chartType), JSON.stringify(json));
            })
        }
    };
    // 组件解析器加载
    useEffect(() => {
        const fetchResolver = async () => {
            const loadedResolver = await loadComponents(getChartCompoFromInner(chartType));
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
                const compTypeTree = createNodeTree("ROOT", getChartCompoFromInner(chartType));
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
            <ComponentTypeProvider initialCompType={chartType} >
                <CompConfigProvider >
                <WebSocketProvider>
                <div className="ComponentApp">
                <Typography.Title level={5} className="text-center">
                    组件配置 - 组件类型：{getChartCompoFromInner(chartType)}
                </Typography.Title>
                    <PagesProvider defaultPages={{"pageID": getChartCompoFromInner(chartType),"nodesStated":[]}}>
                        {Object.keys(resolver).length > 0 && (
                            <Editor
                                resolver={resolver}
                                enabled={true}
                                onNodesChange={onChange}
                            >
                                <Row className="pt-2">
                                    {/* Topbar Component (assumed custom) */}
                                    <Col span={24}>
                                        <ChartTopbar/>
                                    </Col>
                                </Row>
                                <Row gutter={16} className="pt-2">
                                    <Col span={16}>
                                        <Row>
                                            <Frame data={json}/>
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
                                            <ChartSettings/>
                                        </Card>
                                    </Col>
                                </Row>
                                <Row gutter={16} className="pt-2">
                                    <Col span={24}>
                                    </Col>
                                </Row>
                            </Editor>
                        )}
                    </PagesProvider>
            </div>
            </WebSocketProvider>
            </CompConfigProvider>
            </ComponentTypeProvider>
        </ProjectProvider>
    );
}

export default ChartApp;

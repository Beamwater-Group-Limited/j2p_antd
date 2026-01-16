import {Row, Col, Typography, Card, Spin,} from "antd";
import {Editor, Frame, Element} from "@craftjs/core";
import React, {useEffect, useState} from "react";
import {EventProvider, useAppConfig, useProject, useWebSocket} from "@/context";
import {Topbar, Toolbox, SettingsPanel} from "@/ide";
import {
    createDivJson,
    deserializeDom, getNodesStatedWithPageID,
    loadComponents,
    matchRoute,
    PageProp,
    serializeDom
} from "@/tools";
import {Layers} from "@craftjs/layers";
import {matchPath, useLocation, useMatches, useOutlet, useResolvedPath} from "react-router-dom";
import {useRoutesData} from "@/context/RoutesContext";
import {PagesProvider} from "@/context/PageContext";
import { debounce } from 'lodash';

function DevPage({label}) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {appConfig} = useAppConfig()
    const {projectConfig} = useProject()
    const location = useLocation();
    const {routes,isShowOutlet} = useRoutesData()
    const [currentPage, setCurrentPage] = useState<PageProp>({
        pageID: "",
        nodesStated:[]
    });
    const {ws,sendPageLoaded} = useWebSocket()
    const resolvedPath = useResolvedPath(".");
    // 编辑器结构 JSON
    const [json, setJson] = useState<any>()
    // 加载组件解析器
    const [resolver, setResolver] = useState<Record<string, React.ElementType>>();
    // 防抖操作
    const saveDom = debounce((jsonDom) => {
        serializeDom(appConfig.userID, projectConfig.project_id, currentPage.pageID, jsonDom);
    }, 800); // 延迟 800ms 再执行，连续输入时只执行一次

    // 响应结构改变
    const onChange = (query: { serialize: () => any; }) => {
        const jsonDom = query.serialize();
        if (jsonDom === "{}") return
        saveDom(jsonDom)
    }
    // 初始加载
    useEffect(() => {
        if(!currentPage.pageID) return
        console.log("输出页面ID",currentPage)
        setIsLoading(true)
        const loadDomJson = async () => {
            let domJson = await deserializeDom(appConfig.userID,projectConfig.project_id,currentPage.pageID);
            // console.log("服务器组件结构", domJson)
            if (!domJson || domJson === "{}") {
                console.log("服务器组件结构JSON为空,生成", createDivJson())
                domJson = createDivJson()
            }
            // sessionStorage.setItem(currentPageID, domJson)
            setJson(JSON.parse(domJson))
        };
        // 解析器使用本地加载方式加载
        const fetchResolver = async () => {
            const loadedResolver = await loadComponents(null);
            if (!loadedResolver || Object.keys(loadedResolver).length === 0) {
                console.log("服务器加载解析器为空")
                return
            }
            setResolver(loadedResolver);
            console.log("设置解析器: ", loadedResolver);
        };
        // 读取数据
        const fetchNodesStated = async () => {
            const cheng = await getNodesStatedWithPageID(appConfig.userID, projectConfig.project_id,currentPage.pageID);
            // console.log("更新当前页面ID",currentPage,cheng)
            setCurrentPage(prevState => ({...prevState,nodesStated:cheng}));
        }

        loadDomJson().then( () => {
                fetchResolver().then(() => {
                   fetchNodesStated().then(() => {
                       setIsLoading(false);
                   })
                })
            }
        );
    }, [currentPage.pageID])

    useEffect(() => {
        console.log("当前页面路径", location.pathname, isShowOutlet, routes)
        // 1. 统一出用于匹配的路径
        const matchPathname = isShowOutlet ? resolvedPath.pathname : location.pathname;
        const currentPageID = matchRoute(routes, "/dev", matchPathname)?.pageID;
        if (!currentPageID) return;
        // 2. 更新 currentPage，但只在 pageID 真的变化时才更新
        setCurrentPage(prev => {
            if (prev.pageID === currentPageID) {
                console.log("pageID 未变化，不更新 currentPage");
                return prev;
            }
            console.log("更新 currentPage.pageID:", prev.pageID, "→", currentPageID);
            return {
                ...prev,
                pageID: currentPageID,
                nodesStated: [],    // 切换页面时重置节点状态
            };
        });
        // 3. 发送页面加载事件，用这次匹配出来的 currentPageID，而不是 state 里的旧值
        if (ws?.readyState === WebSocket.OPEN) {
            const pageKey = `${currentPageID}_${appConfig.clientID}`;
            console.log("DEV发送页面加载", pageKey);
            sendPageLoaded(pageKey);
        }
    }, [isShowOutlet,location.pathname]);

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
        <div className="Page">
            <Typography.Title level={5} className="text-center">
                超级简单的页面编辑器 - 页面ID：{currentPage.pageID}
            </Typography.Title>
            <Typography.Title level={5} className="text-center">
                定位：{JSON.stringify(location)}
            </Typography.Title>
            <PagesProvider defaultPages={currentPage}>
                <Editor
                    resolver={resolver}
                    enabled={true}
                    onNodesChange={onChange}
                >
                    {/* Main Grid Layout */}
                    <Row gutter={16} className="pt-2">
                        {/* Topbar Component (assumed custom) */}
                        <Col span={24}>
                            <Topbar/>
                        </Col>
                    </Row>
                    <Row gutter={16} className="pt-2">
                        <Col span={7}>
                            <Layers/>
                            <Toolbox/>
                        </Col>
                        {/* Left Section with Container */}
                        <Col span={11}>
                            <Frame data={json} />
                        </Col>
                        {/* Right Section with Toolbox and SettingsPanel */}
                        <Col span={6}>
                            <Card>
                                <SettingsPanel/> {/* Assuming SettingsPanel is a custom component */}
                            </Card>
                        </Col>
                    </Row>
                </Editor>
            </PagesProvider>
    </div>
    );
}

export default DevPage;

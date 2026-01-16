import {Modal, Spin, Typography,} from "antd";
import {Editor, Frame} from "@craftjs/core";
import React, {useEffect, useState} from "react";
import {PagesProvider, useAppConfig, useProject, useRoutesData, useWebSocket} from "@/context";
import {
    createDivJson,
    deserializeDom,
    getNodesStatedWithPageID,
    loadComponents,
    matchRoute,
    PageProp
} from "@/tools";
import {useLocation, useResolvedPath} from "react-router-dom";

function RuntimePage() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {appConfig} = useAppConfig()
    const {projectConfig} = useProject()
    const {routes} = useRoutesData()
    const resolvedPath = useResolvedPath(".");
    const [currentPage, setCurrentPage] = useState<PageProp>({
        pageID: "",
        nodesStated: []
    });
    const location = useLocation();
    const {ws,sendPageLoaded} = useWebSocket()
    // 编辑器结构 JSON
    const [json, setJson] = useState<any>()
    // 加载组件解析器
    const [resolver, setResolver] = useState<Record<string, React.ElementType>>();

    // 初始加载
    useEffect(() => {
        if (!currentPage.pageID) return
        setIsLoading(true)
        const loadDomJson = async () => {
            let domJson = await deserializeDom(appConfig.userID, projectConfig.project_id, currentPage.pageID);
            console.log("服务器组件结构", domJson)
            if (!domJson || domJson === "{}") {
                console.log("服务器组件结构JSON为空,生成", createDivJson())
                domJson = createDivJson()
            }
            sessionStorage.setItem(currentPage.pageID, domJson)
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
        // 读取数据
        const fetchNodesStated = async () => {
            const cheng = await getNodesStatedWithPageID(appConfig.userID, projectConfig.project_id, currentPage.pageID);
            setCurrentPage({...currentPage, nodesStated: cheng});
        }
        loadDomJson().then(() => {
                fetchResolver().then(() => {
                    fetchNodesStated().then(() => {
                            setIsLoading(false);
                        }
                    )
                })
            }
        );
    }, [currentPage.pageID])
    // 初始加载
    useEffect(() => {
        console.log("解析路径", resolvedPath)
        console.log("路由信息", routes)
        const currentPageID = matchRoute(routes, "/runtime", resolvedPath.pathname)?.pageID;
        console.log("启动匹配 当前页面ID: ", currentPageID)
        if (!currentPageID) return;
        setCurrentPage(prev => {
            if (prev.pageID === currentPageID) {
                return prev;   // 不变就别更新
            }
            return {
                ...prev,
                pageID: currentPageID,
                nodesStated: [],
            };
        });
        // 3. 发送页面加载事件，用这次匹配出来的 currentPageID，而不是 state 里的旧值
        if (ws?.readyState === WebSocket.OPEN) {
            const pageKey = `${currentPageID}_${appConfig.clientID}`;
            console.log("RT发送页面加载", pageKey);
            sendPageLoaded(pageKey);
        }
    }, [resolvedPath]);
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
            <PagesProvider defaultPages={currentPage}>
                <Editor
                    resolver={resolver}
                    enabled={false}
                >
                    <Frame data={json}/>
                </Editor>
            </PagesProvider>
        </div>
    );
}

export default RuntimePage;

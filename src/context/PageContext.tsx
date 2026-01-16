import React, {useState, useContext, useEffect, useRef, useMemo} from "react";
import {getLocalStateWithID, getPages, LocalStateBindItem, PageProp} from "@/tools";
import {useAppConfig} from "@/context/AppConfigContext";
import {useProject} from "@/context/ProjectContext";
// 保存项目的路由数据
const PagesContext = React.createContext<{ pageData:PageProp }>(null);

interface PageProviderProps {
    defaultPages?: PageProp;
    children: React.ReactNode;
}

// html形式的标签
const PagesProvider: React.FC<PageProviderProps> = ({
                                                             defaultPages = null,
                                                             children
                                                         }) => {
    // 完整的项目配置
    const [page] = useState<PageProp>(defaultPages);
    // 返回的是 上下文的提供器 用来作为标签被浏览器加载
    return (
        <PagesContext.Provider value={{pageData: page}}>
            {children}
        </PagesContext.Provider>
    );
};

// 自定义 Hook，简化子组件对 WebSocketContext 的使用
const usePagesData = () => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    const context = useContext(PagesContext);
    if (!context) {
        throw new Error("usePages 必须在 PageProvider 内部使用");
    }
    const [mainCompoID, setMainCompoID] = useState<string>("")
    const [nodeLocalState, setNodeLocalState] = useState<LocalStateBindItem[]>()

    useEffect(() => {
        if (!mainCompoID) return
        const fetchNodeLocalState = async () => {
            const cheng = await getLocalStateWithID(appConfig.userID,projectConfig.project_id,context.pageData.pageID,mainCompoID);
            console.log("获取本地绑定状态", cheng)
            setNodeLocalState(cheng)
        }
        fetchNodeLocalState()
    }, [mainCompoID]);

    return {
        ...context,
        nodeLocalState,
        setMainCompoID
    };
};

export {
    PagesProvider,
    usePagesData
};

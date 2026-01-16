import React, {useState, useContext, useEffect} from "react";
import { ProjectData } from "@/tools";

// 定义保存整个项目配置字典的上下文，默认值为空对象
const ProjectContext = React.createContext<{
    projectConfig:ProjectData,setProjectConfig:((config:ProjectData)=>void)|null
}>(null);

interface ProjectProviderProps {
    defaultProjectConfig?: ProjectData;
    children: React.ReactNode;
}

// html形式的标签
const ProjectProvider: React.FC<ProjectProviderProps> = ({
                                                             defaultProjectConfig = null,
                                                             children
                                                         }) => {
    // 完整的项目配置
    const [config, setConfig] = useState<ProjectData>(defaultProjectConfig);
    useEffect(() => {
        setConfig(defaultProjectConfig);
    }, [defaultProjectConfig]);
    // 返回的是 上下文的提供器 用来作为标签被浏览器加载
    return (
        <ProjectContext.Provider value={{projectConfig: config, setProjectConfig: setConfig}}>
            {children}
        </ProjectContext.Provider>
    );
};


// 自定义 Hook，简化子组件对 WebSocketContext 的使用
const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProject 必须在 ProjectProvider 内部使用");
    }
    return context;
};

export {ProjectProvider, useProject};

import React, {useState, useContext} from "react";

// 保存项目的路由数据
const CbtaiProviderContext = React.createContext<{ cbtaiData }>(null);

interface PageProviderProps {
    defaultCbtai?;
    children: React.ReactNode;
}

// 自定义 Hook，简化子组件对 WebSocketContext 的使用
export const useCbtaiData = () => {
    const context = useContext(CbtaiProviderContext);
    if (!context) {
        throw new Error("useCbtai 必须在 PageProvider 内部使用");
    }
    return context;
};

// html形式的标签
export const CbtaiProvider: React.FC<PageProviderProps> = ({
                                                        defaultCbtai = null,
                                                        children
                                                    }) => {
    // 完整的项目配置
    const [cbtai] = useState<any>(defaultCbtai);
    // 返回的是 上下文的提供器 用来作为标签被浏览器加载
    return (
        <CbtaiProviderContext.Provider value={{cbtaiData: cbtai}}>
            {children}
        </CbtaiProviderContext.Provider>
    );
};


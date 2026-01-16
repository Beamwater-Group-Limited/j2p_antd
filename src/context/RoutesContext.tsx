import React, {useState, useContext} from "react";
import {RouteProp} from "@/tools";

// 保存项目的路由数据
const RoutesContext = React.createContext<{ routes:RouteProp[] ,isShowOutlet?:boolean}>(null);

interface RouteProviderProps {
    defaultRoutes?: RouteProp[];
    children: React.ReactNode;
    isShowOutlet?: boolean;
}

// html形式的标签
const RoutesProvider: React.FC<RouteProviderProps> = ({
                                                             defaultRoutes = null,
                                                             children,
                                                             isShowOutlet=false,
                                                         }) => {
    // 完整的项目配置
    const [routes] = useState<RouteProp[]>(defaultRoutes);
    // 返回的是 上下文的提供器 用来作为标签被浏览器加载
    return (
        <RoutesContext.Provider value={{routes: routes,isShowOutlet:isShowOutlet}}>
            {children}
        </RoutesContext.Provider>
    );
};


// 自定义 Hook，简化子组件对 WebSocketContext 的使用
const useRoutesData = () => {
    const context = useContext(RoutesContext);
    if (!context) {
        throw new Error("useRoutes 必须在 RouteProvider 内部使用");
    }
    return context;
};

export {RoutesProvider, useRoutesData};

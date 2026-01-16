import React, {useState, useEffect, useContext, useCallback} from "react";
import {
    authentication, BaseApiUrl,
    defaultDynamicAppConfig,
    GlobalContextDict,
    loadConfig,
    LOW_USER_NAME,
    USER_NAME
} from "@/tools";
import {Login} from "@/ide";
import {v4} from "uuid";

// 定义保存整个配置字典的上下文，默认值为空对象
export const AppConfigContext = React.createContext<{
    appConfig: Record<string, any>, setContentAppConfig: ((config: GlobalContextDict) => void) | null
}>(null);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    // 保证配置文件被加载
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // 完整的程序配置
    const [config, setConfig] = useState<Record<string, any>>({});
    // 动态程序配置 动态的程序上下文
    const [dynamicAppConfig, setDynamicAppConfig] = useState<GlobalContextDict>(defaultDynamicAppConfig());
    // 登录回调
    const handleLogin = useCallback((values: any) => {
        // 向后台进行登录身份验证
        authentication(values.username, values.password).then(token => {
                if (token) {
                    const newDynamicAppConfig = {
                        ...dynamicAppConfig,
                        isLoggedIn: "true",
                        token: token,
                    }
                    setDynamicAppConfig(newDynamicAppConfig)
                }
            }
        )
    }, [])
    useEffect(() => {
        const existingClientID = sessionStorage.getItem("clientID");
        if (!existingClientID) {
            const newClientID = v4().replace(/-/g, ""); // 生成一个新的 clientID
            sessionStorage.setItem("clientID", newClientID); // 存储 clientID
        }

        async function fetchConfig() {
            // 本地配置加载
            const cheng = await loadConfig();
            const updatedLoadedConfig = {
                ...cheng,
                ...dynamicAppConfig,
                // todo 调试
                userID: LOW_USER_NAME,
                userName: USER_NAME,
                isLoggedIn: "true",
                token: v4().replace(/-/g, '').slice(0, 8),
                clientID: sessionStorage.getItem("clientID"),
                featuredNames: ["CbtaiButton", "CbtaiCard", "Cbtaidiv", "CbtaiTable", "CbtaiSelect",
                    "CbtaiBadge", "CbtaiAvatar", "CbtaiRow", "CbtaiCol", "CbtaiInput", "CbtaiInputSearch",
                    "CbtaiImage,", "CbtaiModal", "CbtaiMenu", "CbtaiList", "CbtaiUpload", "CbtaiTypographyLink",
                    "CbtaiTypographyTitle", "CbtaiTypographyText", "CbtaiTag"
                ],
                // todo 调试
            }
            // 全局配置数据 fixme 为了在工具函数中直接使用
            window.da = {
                "apiUrl": `https://${cheng.GLOBAL_IP}${BaseApiUrl}`,
                "modelUrl": `https://${cheng.MODEL_IP}:${cheng.MODEL_API_PORT}`,
                "turnUrl": `turn:${cheng.TURN_IP}:${cheng.TURN_PORT}?transport=udp`,
            }
            console.log("全局配置", updatedLoadedConfig)
            console.log("隧道URL", window.da.turnUrl)
            setConfig(updatedLoadedConfig);
        }

        // 加载成功
        fetchConfig().finally(() => setIsLoading(false));
    }, []);

    if (isLoading && config.isLoggedIn) {
        return <Login onLogin={handleLogin}/>;
    }

    return isLoading ? (<div>加载配置...</div>) : (
        <AppConfigContext.Provider value={{appConfig: config, setContentAppConfig: setDynamicAppConfig}}>
            {children}
        </AppConfigContext.Provider>
    );
};

// 自定义 Hook，简化子组件对 WebSocketContext 的使用
export const useAppConfig = () => {
    const context = useContext(AppConfigContext);
    if (!context) {
        throw new Error("useAppConfig 必须在 AppConfigProvider 内部使用");
    }
    return context;
};


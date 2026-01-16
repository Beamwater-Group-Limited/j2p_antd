import React, {createContext, useContext, useEffect, useRef, useState} from "react";
import {
    EVENT_PAGE_LOADED,
    EVENT_STATE_CHANGE, EVENT_STATE_RESTORE, EVENT_STATE_UPDATE,
    EventPayload,
    EventService, getChartCompoFromInner,
    getCompoFromInner, getXCompoFromInner, MOCK_STATE_CHANGE,
    WebSocketContextValue
} from "@/tools";
import {useAppConfig, useProject, useTypeConfig} from "@/context";
import {useLocation} from "react-router-dom";
import {BaseWsUrl} from "@/tools";
import {v4} from "uuid";
import {Spin} from "antd";

// 创建一个 WebSocketContext，用于在组件间共享 WebSocket 相关数据
const WebSocketContext = createContext<WebSocketContextValue|null>(null);

// WebSocketProvider 组件，用于管理 WebSocket 连接并将数据提供给子组件
export const WebSocketProvider = ({children}) => {
    // 使用 useContext 从全局上下文中获取 globalId
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    // 使用 useContext 从全局上下文中获取 globalId
    const {InnerComp} = useTypeConfig();
    // 路径位置
    const location = useLocation();
    const wsRef = useRef<WebSocket | null>(null); // 确保 WebSocket 不会重复创建
    // const isConnected = useRef(false);  // 追踪连接状态，防止重复连
    const statusCheckerRef = useRef<NodeJS.Timeout | null>(null); // 定期检查状态的定时器引用
    // 定义一个状态用于保存 WebSocket 实例
    const [ws, setWs] = useState(null);
    // ws连接状态
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "error" | "connecting">(
        "connecting"
    );
    // 定义一个状态用于保存接收到的 WebSocket 消息
    const [message, setMessage] = useState("");

    // 创建连接
    // 创建 WebSocket 连接
    const initWebSocket = () => {
        let wsUrl = "";
        console.log("1. 加载显示当前路径:", location.pathname);
        switch (true) {
            case location.pathname.startsWith("/component/"):
                wsUrl = `wss://${appConfig.GLOBAL_IP}${BaseWsUrl}/v1/ws?project_client_id=${getCompoFromInner(InnerComp)}.component`;
                break;
            case location.pathname.startsWith("/custom_component"):
                wsUrl = `wss://${appConfig.GLOBAL_IP}${BaseWsUrl}/v1/ws?project_client_id=${InnerComp}.custom_component`;
                break;
            case location.pathname.startsWith("/custom_page"):
                wsUrl = `wss://${appConfig.GLOBAL_IP}${BaseWsUrl}/v1/ws?project_client_id=${InnerComp}.custom_page`;
                break;
            case location.pathname.startsWith("/chart"):
                wsUrl = `wss://${appConfig.GLOBAL_IP}${BaseWsUrl}/v1/ws?project_client_id=${getChartCompoFromInner(InnerComp)}.chart`;
                break;
            case location.pathname.startsWith("/x"):
                wsUrl = `wss://${appConfig.GLOBAL_IP}${BaseWsUrl}/v1/ws?project_client_id=${getXCompoFromInner(InnerComp)}.x`;
                break;
            case location.pathname.startsWith("/dev"):
                wsUrl = `wss://${appConfig.GLOBAL_IP}${BaseWsUrl}/v1/ws?project_client_id=${projectConfig.project_id}.${appConfig.clientID}-dev`;
                break;
            case location.pathname.startsWith("/runtime"):
                wsUrl = `wss://${appConfig.GLOBAL_IP}${BaseWsUrl}/v1/ws?project_client_id=${projectConfig.project_id}.${appConfig.clientID}`;
                break;
            default:
                console.log("不匹配任何路径")
                return;
        }
        console.log("2. 首次运行，初始化新的 WebSocket 连接:", wsUrl);
        const socket = new WebSocket(wsUrl);
        const countSocket = Number(localStorage.getItem("countSocket")) || 0;
        localStorage.setItem("countSocket", `${countSocket + 1}`);
        console.log("执行次数:", countSocket, )
        // wsRef.current = socket;
        // 设置状态 ws
        setWs(socket);
        // 保持引用
        wsRef.current = socket;
        // 引用配置
        // isConnected.current = true;
        setConnectionStatus("connecting");

        socket.onopen = () => {
            console.log("🔗 WebSocket 连接成功！");
            setConnectionStatus("connected");
        };

        socket.onmessage = (event) => {
            console.log("收到消息:", event.data);
            const msg = event.data
            if (!msg) return;
            console.log("组件接收到消息:", msg);
            try {
                const parsedMessage = JSON.parse(msg); // 假定后端发送 JSON 消息
                if (parsedMessage.type === EVENT_STATE_CHANGE) {
                    // 只处理类型为 "event" 的消息
                    EventService.emit(parsedMessage.node_id,parsedMessage.type, parsedMessage.data); // 将事件数据分发到 RxJS 的 Subject 中
                    // console.log("📤 事件已发到事件流中:", parsedMessage);
                }
            } catch (error) {
                console.log("消息是非 JSON 格式，直接处理文本消息:", msg);
            }
            // 兼容使用message的值
            setMessage(msg)
        };

        socket.onerror = (error) => {
            console.error("❌ WebSocket 连接错误:", error);
            setConnectionStatus("error");
        };

        socket.onclose = (event) => {
            console.warn("🔌 WebSocket 连接关闭", {
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean,
            });
            // isConnected.current = false;
            setConnectionStatus("disconnected");
            // 如果连接断开，尝试重新连接
            reconnectWebSocket();
        };
    };
    // 重连逻辑
    const reconnectWebSocket = () => {
        // if (isConnected.current) return; // 防止重复重连
        console.warn("尝试重新连接 WebSocket...");
        setTimeout(() => {
            initWebSocket();
        }, 10000); // 延迟 3 秒重连
    };
    // 定期检查 WebSocket 连接状态
    const startStatusChecker = () => {
        if (statusCheckerRef.current) return; // 防止重复启动
        statusCheckerRef.current = setInterval(() => {
            // const socket = wsRef.current;
            // if (!socket) {
            //     console.warn("WebSocket 未初始化，尝试重新初始化...");
            //     reconnectWebSocket();
            //     return;
            // }
            //
            // const state = socket.readyState;
            // console.log("🔍 WebSocket 状态检查:", state);
            // console.log("外部WS状态:", socket)

            // 检查 WebSocket 状态是否异常
            // console.log("WS状态:",  wsRef.current)
            if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSING ) {
                console.warn("WebSocket 状态异常，尝试重新连接...");
                reconnectWebSocket();
            }
        }, 5000); // 每 5 秒检查一次
    };
    // 停止状态检查逻辑
    const stopStatusChecker = () => {
        if (statusCheckerRef.current) {
            clearInterval(statusCheckerRef.current);
            statusCheckerRef.current = null;
        }
    };

    // 初始化 WebSocket
    useEffect(() => {
        // 初始化WebSocket
        initWebSocket();
        // 启动状态检查
        startStatusChecker();
        return () => {
            console.log("3. 组件卸载，清理 WebSocket...");
            stopStatusChecker();
            if (wsRef.current) {
                wsRef.current.close();
            }
            wsRef.current = null;
            console.log("4. 组件卸载，清理 WebSocket...", wsRef.current);
        };
    }, []);
    // ws被设置
    useEffect(() => {
        console.log("websocket被设置了", ws)
    }, [ws]);

    if (!appConfig || Object.keys(appConfig).length === 0) {
        return (
            <div className="loading-container">
                { appConfig.IS_SPIN?
                    <Spin tip="加载中，请稍等..." size="large" />:
                    <div/>
                }
            </div>
        );;
    }
    // 将 WebSocket 实例和消息通过 Context 提供给子组件
    return (
        <WebSocketContext.Provider value={{ws, message, connectionStatus}}>
            {children}
        </WebSocketContext.Provider>
    );
};

// 自定义 Hook，简化子组件对 WebSocketContext 的使用
export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    if (!context) {
        throw new Error("useWebSocket 必须在 WebSocketProvider 内部使用");
    }
    // 发送状态改变数据
    const sendStateChange = (nodeID:string, nameState:string, nameStateValue:any) => {
        // 状态变化的组件ID，状态名称nameState，状态值 json
        const eventPayload:EventPayload = {
            message_id: v4().replace(/-/g, '').slice(0,8),
            timestamp: new Date().toISOString(),
            user_id: appConfig.userID,
            project_id: projectConfig.project_id,
            node_id: nodeID,
            type: EVENT_STATE_UPDATE,
            data: {
                [nameState]: JSON.stringify(nameStateValue)
            }
        }

        if (context.ws) {
            context.ws.send(JSON.stringify(eventPayload)); // 直接发送 JSON 数据到后端
            console.log("📤 WebSocket 已发送sendStateChange事件:", eventPayload);
        } else {
            console.warn("WebSocket 未连接，sendStateChange事件无法发送:", eventPayload);
        }
        // 同时广播给事件系统
        EventService.emit(nodeID,EVENT_STATE_UPDATE, eventPayload);
    }
    // 触发任何事件
    const sendEvent = (nodeID:string, eventType:string, eventData:any) => {
        console.log(`触发ID: ${nodeID} (类型: ${eventType})`);
        const eventPayload:EventPayload = {
            message_id: v4().replace(/-/g, '').slice(0,8),
            timestamp: new Date().toISOString(),
            user_id: appConfig.userID,
            project_id: projectConfig.project_id,
            node_id: nodeID,
            type: eventType,
            data: {
                message: JSON.stringify(eventData)
            }
        }
        if (context.ws) {
            context.ws.send(JSON.stringify(eventPayload)); // 直接发送 JSON 数据到后端
            console.log("📤 WebSocket 已发送事件:", eventPayload);
        } else{
            console.warn("WebSocket 未连接，sendStateChange事件无法发送:", eventPayload);
        }
    }
    // 发送模拟总状态改变
    const sendCbtState = (nodeID:string,cbtState:any) => {
        const eventPayload:EventPayload = {
            message_id: v4().replace(/-/g, '').slice(0,8),
            timestamp: new Date().toISOString(),
            user_id: appConfig.userID,
            project_id: projectConfig.project_id,
            node_id: nodeID,
            type: MOCK_STATE_CHANGE,
            data: Object.entries(cbtState).reduce((acc, cur) => {
                acc[cur[0]] = JSON.stringify(cur[1]);
                return acc;
            }, {} as Record<string, string>)
        }
        if (context.ws) {
            context.ws.send(JSON.stringify(eventPayload)); // 直接发送 JSON 数据到后端
            console.log("📤 WebSocket 已发送sendCbtState事件:", eventPayload);
        } else {
            console.warn("WebSocket 未连接，sendCbtState事件无法发送:", eventPayload);
        }
    }
    // 组件恢复状态
    const restoreCbtState = (nodeID:string,cbtState:any) => {
        if (context.ws && context.ws.readyState === WebSocket.OPEN) {
            const eventPayload:EventPayload = {
                message_id: v4().replace(/-/g, '').slice(0,8),
                timestamp: new Date().toISOString(),
                user_id: appConfig.userID,
                project_id: projectConfig.project_id,
                node_id: nodeID,
                type: EVENT_STATE_RESTORE,
                data: Object.entries(cbtState).reduce((acc, cur) => {
                    acc[cur[0]] = "";
                    return acc;
                }, {} as Record<string, string>)
            }
            context.ws.send(JSON.stringify(eventPayload)); // 直接发送 JSON 数据到后端
            console.log("📤 WebSocket 已发送restoreCbtState事件:", eventPayload);
        } else {
            console.warn("WebSocket 未连接，restoreCbtState事件无法发送:");
        }
    }
    // 发送“页面加载/路由切换”事件
    const sendPageLoaded = (pageID:string) => {
        const eventPayload: EventPayload = {
            message_id: v4().replace(/-/g, '').slice(0, 8),
            timestamp: new Date().toISOString(),
            user_id: appConfig.userID,
            project_id: projectConfig.project_id,
            node_id: "PAGE",
            type: EVENT_PAGE_LOADED,
            data: {
                page_id: pageID,
            },
        };
        if (context.ws && context.ws.readyState === WebSocket.OPEN) {
            context.ws.send(JSON.stringify(eventPayload));
            console.log("📤 WebSocket 已发送 sendPageLoaded 事件:", eventPayload);
        } else {
            console.warn("WebSocket 未连接，sendPageLoaded 事件无法发送:", eventPayload);
        }
    };
    return {
        ...context,
        sendStateChange,
        sendCbtState,
        restoreCbtState,
        sendPageLoaded,
        sendEvent
    };
};

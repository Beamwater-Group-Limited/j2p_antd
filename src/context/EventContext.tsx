// EventContext.tsx
import React, {createContext, useContext, useEffect} from "react";
import {Subscription, fromEvent} from "rxjs";
import {filter, debounceTime} from "rxjs/operators";
import {EVENT_ATTRIBUTE, TARGET_ID_ATTRIBUTE, getDebounceTime, getUserName, EventPayload,} from "@/tools";
import {useAppConfig, useProject, useWebSocket} from "@/context";
import {v4} from "uuid";

// 创建 Context
const EventContext = createContext<null>(null);

// 提供全局事件管理
export const EventProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const { ws, connectionStatus} = useWebSocket();
    // 使用 useContext 从全局上下文中获取 globalId
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    const getSafeTargetValue = (event)=> {
        const target = event?.target;
        if (!target) return null;
        // input, textarea, select
        if (typeof target.value !== "undefined") {
            return target.value;
        }
        // checkbox/radio
        if (typeof target.checked !== "undefined") {
            return target.checked;
        }
        // innerText fallback
        if (typeof target.innerText === "string") {
            return target.innerText.trim();
        }
        // data-* 属性（可选）
        if (target.dataset && Object.keys(target.dataset).length > 0) {
            return target.dataset;
        }
        return null; // 兜底
    }
    useEffect(() => {
        // 获取所有事件类型
        const eventTypes = Object.keys(window).filter((key) => key.startsWith("on")).map((key) => key.slice(2));
        // 声明所有事件类型的订阅，分别创建事件类型的可观察事件流并进行订阅
        const subscriptions: Subscription[] = eventTypes.map((eventType) => {
            return fromEvent<Event>(document, eventType)
                .pipe(
                    filter((event) => {
                        if (!(event.target instanceof HTMLElement)) {
                            return false;
                        }
                        const closestElement = event.target.closest(`[${EVENT_ATTRIBUTE}]`);
                        if (closestElement == null) return false;

                        const eventAttributeValues = closestElement.getAttribute(EVENT_ATTRIBUTE)?.split(",");
                        if (!eventAttributeValues || !eventAttributeValues.includes(event.type)) {
                            return false;
                        }
                        console.log("元素事件触发成功:", event.type,(event.target as HTMLInputElement).value)
                        return true;
                    }),
                    debounceTime(getDebounceTime(eventType)) // 自定义限流时间
                )
                .subscribe((event) => {
                    // 发出事件的元素
                    const target = event.target as HTMLElement;
                    // 元素的属性
                    const nodeID = target.closest(`[${EVENT_ATTRIBUTE}]`).getAttribute(TARGET_ID_ATTRIBUTE);
                    // 元素绑定的事件
                    const eventTriggers:string[] = target.closest(`[${EVENT_ATTRIBUTE}]`).getAttribute(EVENT_ATTRIBUTE)?.split(",");
                    // 判断是否有效的触发
                    const isInvalidTrigger = !eventTriggers || !eventTriggers.includes(event.type);
                    // console.log("事件触发",event, eventTriggers, event.type, isInvalidTrigger)
                    if (isInvalidTrigger) return;
                    // 日志
                    console.log(`触发ID: ${nodeID} (类型: ${event.type})`);
                    const eventPayload:EventPayload = {
                        message_id: v4().replace(/-/g, '').slice(0,8),
                        timestamp: new Date().toISOString(),
                        user_id: appConfig.userID,
                        project_id: projectConfig.project_id,
                        node_id: nodeID,
                        type: event.type,
                        data: {  message:JSON.stringify(getSafeTargetValue(event)) }
                    }
                    console.log("ws:", ws, "connectionStatus:", connectionStatus)
                    if (ws) {
                        ws.send(JSON.stringify(eventPayload)); // 直接发送 JSON 数据到后端
                        console.log("📤 WebSocket 已发送事件:", eventPayload);
                    } else {
                        console.warn("WebSocket 未连接，事件无法发送:", eventPayload);
                    }
                });
        });
        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe()); // 组件卸载时取消订阅
        };
    }, [ws]);
    return <EventContext.Provider value={null}> {children} </EventContext.Provider>;
};

// 提供 `useGlobalEvent`
export const useGlobalEvent = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error("useGlobalEvent must be used within an EventProvider");
    }
    return context;
};

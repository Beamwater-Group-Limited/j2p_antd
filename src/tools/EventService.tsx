// EventService.tsx
import { Subject } from "rxjs";
import {EVENT_STATE_CHANGE, EVENT_STATE_UPDATE} from "@/tools/config";
import {LocalStateBindItem} from "@/tools/interface";

// 创建一个 RxJS 事件流
const eventSubject = new Subject<{ nodeID: string; type: string; payload: any }>();

export const EventService = {
    // 发送事件流 {node_id: '6ExfI1MQFw', type: 'stateUpdate', data: 'O5JD0nuU6kbzw0kyz5YL'}
    emit(nodeID: string, type: string, payload: any) {
        eventSubject.next({ nodeID, type, payload });
    },
    // 所有组件都默认 订阅 反向事件流
    subscribe(nodeid: string, callback: (data: any) => void) {
        return eventSubject.subscribe(({ nodeID, type, payload }) => {
            // 订阅组件的状态左向更新
            if (type ===  EVENT_STATE_CHANGE  &&  nodeid === nodeID) {
                callback(payload);
            }
        });
    },
    // 所有组件都默认 订阅 反向事件流
    subscribeLocal(localStates: LocalStateBindItem[], callback: (data: any) => void) {
        return eventSubject.subscribe(({ nodeID, type, payload }) => {
            // 绑定的消息key 接收组件消息类型 发出组件ID 发出消息类型
            const targetKeys = localStates.map(localstate => {
                return `${localstate.nodeID}.${localstate.nodeStateName}`
            });
            // 订阅组件的状态左向更新 根据 nodeID type 和 payload 构造匹配用的key
            const messageKey = `${nodeID}.${Object.keys(payload.data)[0]}`;
            const index = targetKeys.findIndex(k => k === messageKey);
            const messageValue =Object.values(payload.data)[0];
            // 类型匹配，且消息key匹配
            if (type ===  EVENT_STATE_UPDATE && index !== -1) {
                callback({
                    [localStates[index].stateName]:messageValue,
                });
            }
        });
    },
};

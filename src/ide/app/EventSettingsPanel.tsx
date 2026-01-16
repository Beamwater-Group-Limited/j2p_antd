import React, {useContext, useEffect, useState} from "react";
import {Form, Select, Spin, Alert, Button, Card} from "antd";
import {useEditor} from "@craftjs/core";
import {
    getEventType, getEventTypeWithID,
    updateEventTypeWithID
} from "@/tools";

import {useAppConfig, usePagesData, useProject} from "@/context";

export const EventSettingsPanel: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);      // 加载状态
    const [error, setError] = useState<string | null>(null);    // 错误状态
    // 更多用于选择性获取节点
    const {actions,selected} = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected: { id: string};
        if (currentNodeId) {
            selected = {
                id: currentNodeId,
            };
        }
        return {selected};
    });
    const [eventTypes, setEventTypes] = useState<string[]>([]);
    // 事件触发器列表
    const [eventTriggerList, setEventTriggerList] = useState<string[]>()
    // 使用 useContext 从全局上下文中获取 globalId
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    const {pageData} = usePagesData()
    // 存储选择的 事件触发
    useEffect(() => {
        if (!eventTriggerList) return;
        setIsLoading(true);
        actions.setProp(selected.id,props=>{
            if (eventTriggerList.length === 1) {
                props.dataevent = eventTriggerList[0];
            } else {
                props.dataevent = eventTriggerList.join(",");
            }
        })
        const saveEventTriggerList = async () => {
            try {
                setIsLoading(true);
                const affect_row = await updateEventTypeWithID(appConfig.userID, projectConfig.project_id,pageData.pageID, selected.id, eventTriggerList);
                console.log('获取设置影响', affect_row)
            } catch (err) {
                setError("失败于设置事件，请重试");
            } finally {
                setIsLoading(false);
            }
        };
        saveEventTriggerList();
    }, [eventTriggerList]);

    // 获取组件的事件触发器
    useEffect(() => {
        if (!selected.id) return;
        const fetchEventTriggerListWithID = async () => {
            setIsLoading(true);
            try{
                const cheng = await getEventTypeWithID(appConfig.userID, projectConfig.project_id,pageData.pageID, selected.id);
                setEventTriggerList(cheng);
            } catch (err) {
                setError("获取失败，请重试!");
            }finally {
                setIsLoading(false);
            }
        }
        fetchEventTriggerListWithID();
    }, [selected.id]);

    // 删除事件触发器
    const removeEventRegister = (event: string) => {
        if (eventTriggerList) {
            const etList = eventTriggerList.filter(item => item !== event)
            console.log('取消绑定', etList)
            setEventTriggerList(etList)
        }
    }
    // 加载运行
    useEffect(() => {
        const loadEventTypes = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const event_types = await getEventType();
                setEventTypes(event_types);
            } catch (err) {
                setError("事件类型获取失败，请重试!");
            } finally {
                setIsLoading(false);
            }
        };
        loadEventTypes();
    }, []);

    // 增加事件触发器
    const addEventTrigger = (value:string)=>{
        if (!eventTriggerList?.includes(value)) {
            const updatedList = [...(eventTriggerList || []), value];
            setEventTriggerList(updatedList);
        } else {
            console.log('事件触发器已存在，无需重复添加');
        }
    }
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
        <Card title="事件配置" className="w-full max-w-md shadow-md border rounded-lg mb-4"  >
            <Form layout="vertical" className="space-y-4">
                <Form.Item label="事件触发器">
                    {isLoading ? ( // 如果仍在加载，显示 Spin 动画
                        <Spin/>
                    ) : error ? ( // 如果请求发生错误，显示错误信息
                        <Alert message="Error" description={error} type="error" showIcon/>
                    ) : (
                        <Select
                            value={(eventTypes && eventTypes[0])} // 默认使用当前的状态值，或者 选择第一个选项
                            onChange={value => {
                                addEventTrigger(value)
                            }} // 更新属性
                        >
                            {eventTypes && eventTypes.map((option: string) => (
                                <Select.Option key={option} value={option}>
                                    {option}
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                    {
                        (eventTriggerList && eventTriggerList.length > 0) ? (
                            <div className="mt-2">
                                <span>已绑定事件：</span>
                                <ul className="list-disc list-inside">
                                    {eventTriggerList.map((item, index) => (
                                        <li key={`${item}_${index}`}>
                                            <span>绑定事件: {item}</span>
                                            <Button
                                                type="link"
                                                onClick={() => removeEventRegister(item)}
                                                className="ml-2"
                                            > 取消绑定 </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="mt-2 text-gray-500">
                                <span>无绑定事件</span>
                            </div>
                        )}
                </Form.Item>
            </Form>
        </Card>
    );
};

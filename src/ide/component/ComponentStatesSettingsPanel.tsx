import React, {useEffect, useState} from "react";
import {Button, Card, Form, List, Modal, Space, Spin} from "antd";
import {StateItem, stateKeyHeads} from "@/tools";

import {useCompConfig} from "@/context/CompConfigContext";
import {useCompStates} from "@/context/CompStatesContext";
import {renderStateEditor} from "@/ide";
import {useAppConfig, useWebSocket} from "@/context";
export const ComponentStatesSettingsPanel: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);      // 加载状态
    const {appConfig} = useAppConfig()
    // 配置上下文
    const {compConfig} = useCompConfig();
    const {sendCbtState} = useWebSocket();
    const [states, setStates] = useState<string[]>([]); // 状态列表
    const [stateItems, setStateItems] = useState<Record<string, StateItem>>({}); // 状态定义列表
    const [modalVisible, setModalVisible] = useState<boolean>(false); // 控制模态框显示
    const [form] = Form.useForm(); // 使用Antd表单
    // 组件状态
    const {compStates, updateCompState}= useCompStates()
    // 当前状态
    const handleEdit = () => {
        setModalVisible(true); // 打开模态框
        console.log("组件的状态",compStates)
        form.setFieldsValue({ value: compStates }); // 设置表单的初始值
    };
    const handleModalOk = () => {
        form.validateFields()
            .then((values) => {
                sendCbtState("ROOT", values)
                setModalVisible(false); // 关闭模态框
            })
            .catch((info) => {
                console.log("校验失败:", info);
            });
    };

    const handleModalCancel = () => {
        setModalVisible(false); // 关闭模态框
    };
    // 从组件配置json中获取，和页面的状态绑定不同
    useEffect(() => {
        if(!compConfig) return;
        setStateItems(compConfig.states.reduce((acc, cur) => {
            acc[cur.key] = cur
            return acc
        },{} as Record<string, StateItem>))
        console.log("属性配置信息", compConfig.states)
        setLoading(false)
    }, [compConfig]);

    useEffect(() => {
        if(!stateItems) return;
        console.log("状态配置参数", stateItems)
        const cheng =stateItems? Object.values(stateItems).map(s=>(
            `${
                s.key  === undefined || s.key  === null || s.key  === "" ? "空" : s.key
            }-${
                s.defaultValue  === undefined || s.defaultValue  === null || s.defaultValue  === "" ? "空" : s.defaultValue
            }-${
                s.type  === undefined || s.type  === null ? "空" : s.type
            }`
        )): []
        setStates(cheng)
    }, [stateItems]);

    if (loading) return (
        <div className="loading-container">
            { appConfig.IS_SPIN?
                <Spin tip="加载中，请稍等..." size="large" />:
                <div/>
            }
        </div>
    );
    return (
        <Card title="组件状态配置"
              className="w-full max-w-md shadow-md border rounded-lg mb-4">
            <Button
                type="link"
                onClick={() => handleEdit()}
                key="edit"
            >
                模拟调度引发的总状态变化
            </Button>
            <Modal
                title="编辑状态"
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form form={form} layout="vertical">
                    { compStates && Object.keys(compStates).map(key => (
                            <Form.Item
                                key={key}
                                name={key}
                                label={key}
                                rules={[
                                    { required: true, message: "请输入需要编辑的状态值！" },
                                ]}
                            >
                                {stateItems && stateItems[key] && renderStateEditor(key,stateItems[key].type,compStates[key],updateCompState) }
                            </Form.Item>
                        ))
                    }
                </Form>
            </Modal>

            <List
                bordered
                header={
                    <Space>
                        {stateKeyHeads.map(title => (
                            <span
                                key={title}
                            >{title}</span>
                        ))}
                    </Space>
                }
                dataSource={states}
                renderItem={(state) => (
                    <List.Item>
                        {state}
                    </List.Item>
                )}
            />
        </Card>
    );
};

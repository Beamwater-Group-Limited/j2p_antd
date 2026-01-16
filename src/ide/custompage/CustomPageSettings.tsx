import React, {useState} from "react";
import {Row, Col, Typography, Tag, Button, Card, Modal, Spin} from 'antd';
import {useEditor} from "@craftjs/core";
import {EventSettingsPanel,EventHandlerSettingPanel} from "@/ide";
import {StatesSettingsPanel} from "@/ide/app/StatesSettingsPanel";
import {BaseWebUrl, getInnerFromCompo, handleOpenComponent} from "@/tools";
import {useAppConfig} from "@/context";


export const CustomPageSettings = () => {
    const [loading, setLoading] = useState<boolean>(false);      // 加载状态
    const {appConfig} = useAppConfig()
    const {actions, selected} = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected: {
            id: string;
            name: string;
            settings: "" | React.ElementType<any, keyof React.JSX.IntrinsicElements>;
            isDeletable: boolean;
            isCanvas: boolean;
            nodeData:any;
        };
        if (currentNodeId) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.name,
                settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
                isDeletable: query.node(currentNodeId).isDeletable(),
                isCanvas: state.nodes[currentNodeId].data.isCanvas,
                // nodeData: query.node(currentNodeId).get(),
                nodeData: state.nodes[currentNodeId].data,
            };
        }
        return {selected};
    });
    if (loading)
        return (
        <div className="loading-container">
            { appConfig.IS_SPIN?
                <Spin tip="加载中，请稍等..." size="large" />:
                <div/>
            }
        </div>
    );
    return selected ? (
        <>
        <Card>
            <Row className="w-full" justify="space-between" align="middle">
                <Col>
                    <Button
                        type="link"
                        onClick={() => handleOpenComponent(selected.name)} // 跳转到 /component/:nodeId
                    >
                        编辑组件:{selected.name}
                    </Button>
                </Col>
                <Col>
                    {
                        selected.isDeletable ? (
                            <Button
                                type="primary"
                                block
                                onClick={() => {
                                    Modal.confirm({
                                        title: "确认删除？",
                                        content: "你确定要删除该组件？",
                                        okText: "确定",
                                        cancelText: "取消",
                                        onOk() {
                                            actions.delete(selected.id);
                                        }
                                    });
                                }}
                            >
                                删除组件
                            </Button>
                        ) : null
                    }
                </Col>
            </Row>
        </Card>
        <Card title="基础属性" className="w-full max-w-md shadow-md border rounded-lg mb-4"  >
            <Row gutter={[0, 0]} >
                <Col span={24}>
                    <Row className="mb-4" justify="space-between" align="middle">
                        <Col>
                            <Typography.Text>{selected.id}</Typography.Text>
                        </Col>
                        <Col>
                            <Tag color="blue">{selected.name}</Tag>
                        </Col>
                        <Col>
                            <Tag color="blue">{selected.isCanvas?"容器组件":"元素组件"}</Tag>
                        </Col>
                    </Row>
                    <Row className="mb-4" justify="space-between" align="middle">
                        <Col>
                            <Typography.Text>节点数据</Typography.Text>
                        </Col>
                        <Col>
                            <pre>{JSON.stringify(selected.nodeData, null, 2)}</pre>
                        </Col>
                    </Row>
                    <Row className="mb-4" justify="space-between" align="middle">
                        <Col>
                            { selected.settings && React.createElement(selected.settings) }
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
        </>
    ) : null
}

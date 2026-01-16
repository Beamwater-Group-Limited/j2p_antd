import React, {useEffect, useState} from "react";
import {Row, Col, Typography, Tag, Button, Card, Spin} from 'antd';
import {useEditor} from "@craftjs/core";
import {useAppConfig} from "@/context";
export const CustomSettings = () => {
    const [loading, setLoading] = useState<boolean>(true);      // 加载状态
    const {appConfig} = useAppConfig()
    const [currentNode, setCurrentNode] = useState<string>('ROOT');
    const {actions, selected} = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected || ['ROOT'];
        console.log("选中的", currentNodeId)
        setCurrentNode(currentNodeId || 'ROOT');
        let selected: {
            id: string;
            name: string;
            settings: "" | React.ElementType<any, keyof React.JSX.IntrinsicElements>;
            isDeletable: boolean;
            isCanvas: boolean;
            props: any;
        };
        if (currentNode) {
            selected = {
                id: currentNode,
                name: state.nodes[currentNode].data.name,
                settings: state.nodes[currentNode].related && state.nodes[currentNode].related.settings,
                isDeletable: query.node(currentNode).isDeletable(),
                isCanvas: state.nodes[currentNode].data.isCanvas,
                props: state.nodes[currentNode].data.props,
            };
        }
        setLoading(false);
        console.log("选中的", selected)
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
    return (
        <>
            <Card title="组件属性面板" className="w-full max-w-md shadow-md border rounded-lg mb-4">
                <Row gutter={[0, 0]}>
                    <Col span={24}>
                        <Row className="mb-4" justify="space-between" align="middle">
                            <Col>
                                <Typography.Text>选择节点</Typography.Text>
                            </Col>
                            <Col>
                                <Typography.Text>{selected.id}</Typography.Text>
                            </Col>
                            <Col>
                                <Tag color="blue">{selected.name}</Tag>
                            </Col>
                        </Row>
                        <Row className="mb-4"
                             justify="space-between"
                             align="middle">
                            <Col>
                                {selected.settings && React.createElement(selected.settings)}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
            <Row className="w-full mb-4" justify="space-between" align="middle">
                <Col className="w-full">
                    {
                        selected.isDeletable ? (
                            <Button
                                type="primary"
                                block
                                onClick={() => {
                                    actions.delete(selected.id)
                                }}
                            >
                                删除组件
                            </Button>
                        ) : (
                            <Typography.Text type="secondary" className="block text-center">
                                当前节点不可删除
                            </Typography.Text>
                        )

                    }
                </Col>
            </Row>
        </>
    )
}

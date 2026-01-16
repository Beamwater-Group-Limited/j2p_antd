import React from "react";
import {Row, Col, Typography, Tag, Button, Card} from 'antd';
import {useEditor} from "@craftjs/core";

import {ComponentStatesSettingsPanel} from "@/ide";

export const ComponentSettingsPanel = () => {
    const {actions, selected} = useEditor((state, query) => {
        let currentNodeId = state.events.selected[0] || "ROOT"; // 如果没有选中节点，则默认选择 ROOT
        let selected: {
            id: string;
            name: string;
            settings: "" | React.ElementType<any, keyof React.JSX.IntrinsicElements>;
            isDeletable: boolean;
            props: any;
        };
        if (currentNodeId) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.name,
                settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
                isDeletable: query.node(currentNodeId).isDeletable(),
                props: state.nodes[currentNodeId].data.props,
            };
        }
        return {selected};
    });

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
            <ComponentStatesSettingsPanel/>
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
                        ) : null
                    }
                </Col>
            </Row>
        </>
    )
}

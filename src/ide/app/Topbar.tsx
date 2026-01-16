import React from "react";
import {Row, Col, Switch, Button, Form} from 'antd';
import { useEditor } from "@craftjs/core";
import {useWebSocket} from "@/context/WebSocketContext";
import {backupDomTree, restoreDomTree} from "@/tools";
import {useAppConfig, useProject} from "@/context";

export const Topbar: React.FC = () => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    const { actions, query, enabled } = useEditor((state) =>({
        enabled: state.options.enabled,
    }));
    // ws 连接状态
    const { connectionStatus } = useWebSocket();
    // 根据 WebSocket 连接状态显示的文本
    const getStatusText = () => {
        switch (connectionStatus) {
            case "connected":
                return "WebSocket: 已连接 ✅";
            case "disconnected":
                return "WebSocket: 已断开 ❌";
            case "error":
                return "WebSocket: 错误 ⚠️";
            case "connecting":
                return "WebSocket: 正在连接 🔄";
            default:
                return "未知状态";
        }
    };
    return (
        <div style={{padding: '8px', marginTop: '24px', marginBottom: '8px', backgroundColor: '#cbe8e7'}}>
            <Row align="middle">
                <Col flex="auto">
                    <Form.Item label="Enable">
                    <Switch
                        checked={enabled}
                        onChange={(value) => actions.setOptions(options => options.enabled= value)}
                    />
                    </Form.Item>
                </Col>
                <Col flex="auto">
                    <span>{getStatusText()}</span>
                </Col>
                <Col flex="auto">
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => backupDomTree(appConfig.userID, projectConfig.project_id,projectConfig.page_id)}
                    >
                        保存当前页面
                    </Button>
                </Col>
                <Col flex="auto">
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => restoreDomTree(appConfig.userID, projectConfig.project_id,projectConfig.page_id)}
                    >
                        恢复上次的页面
                    </Button>
                </Col>
                <Col>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                            console.log(query.serialize())
                        }}
                    >
                        串行化 JSON 到 控制台
                    </Button>
                </Col>
            </Row>
        </div>
    )
}

import React from "react";
import {Row, Col, Button, Input, message, Modal, Space  } from 'antd';
import { useAppConfig } from "@/context";
import {
    deleteComponentType,
} from "@/tools";
import {useParams} from "react-router-dom";

export const CustomTopbar: React.FC = () => {
    // 用户属性
    const {appConfig} = useAppConfig();
    // 配置组件类型 inner 只是为了和原先保持一致 不代表内在
    const {componentType:InnerComp} = useParams<{ componentType: string }>(); // 获取路由参数 :pageType
    return (
        <Row className="flex items-center gap-6 px-4 py-2 bg-gray-100 rounded shadow">
            {/* 中间输入框 */}
            <Col className="flex-grow">
                <Space>
                    <Input
                        placeholder="输入组件类型"
                        defaultValue={InnerComp}
                        disabled={true}
                    />
                </Space>
            </Col>
            {/* 按钮部分 */}
            <Col>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        Modal.confirm({
                            title: "确认清除",
                            content: `您确定要清除组件"${InnerComp}"吗?`,
                            onOk: () => {
                                deleteComponentType(appConfig.userID, InnerComp)
                                message.success("组件已清除");
                            },
                            okText: "是",
                            cancelText: "否",
                        });
                    }}
                    className="bg-white text-gray-700 hover:text-blue-500 hover:border-blue-500"
                >
                    清除组件
                </Button>
            </Col>
        </Row>
    )
}

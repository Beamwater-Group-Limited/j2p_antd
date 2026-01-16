import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import {LoginProps} from "@/tools";

export const Login: React.FC<LoginProps> = ({onLogin}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = (values: any) => {
    setLoading(true);
    // 模拟登录请求，这里可以替换为实际的接口调用
    onLogin(values);
  };

  return (
      <div className="login-container flex items-center justify-center min-h-screen bg-gray-100">
        <Card title="登录" style={{ width: 300 }}>
          <Typography.Title level={4} style={{ textAlign: "center" }}>
            欢迎登录
          </Typography.Title>
          <Form onFinish={handleLogin} layout="vertical">
            <Form.Item
                label="用户名"
                name="userid"
                rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
  );
};

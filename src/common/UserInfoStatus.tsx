import React from "react";
import {useAppConfig} from "@/context";
import {Button, Space, message} from "antd";
import {v4 as uuidv4} from 'uuid';
import {createUser} from "@/tools";

export const UserInfoStatus: React.FC  = () => {
    const {appConfig:gcd} = useAppConfig()
    // 创建用户的处理函数（示例）
    const handleCreateUser = () => {
        const newUserId = "cbtai";
        // const newUserId = "c85d30ee-3d71-4780-b020-cb18f240c0e0";
        createUser(newUserId).then(
            (v) => {
                message.success(`用户创建成功:${v}`);
            }
        )
    };

    return (
        <Space
            className="bg-white border border-gray-300 rounded-lg shadow-md p-4 flex justify-between items-center w-full">
            {/* 用户ID */}
            <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-600">用户ID：</span>
                <span className="text-gray-800">{gcd.userID}</span>
            </div>
            {/* 用户名 */}
            <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-600">用户名：</span>
                <span className="text-gray-800">{gcd.userName}</span>
            </div>
            {/* 状态 */}
            <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-600">登录状态：</span>
                <span className="text-gray-800">{gcd.isLoggedIn ? '已登录' : '未登录'}</span>
            </div>
            {/* 创建用户按钮 */}
            <Button type="primary" onClick={handleCreateUser}>
                创建新用户
            </Button>

        </Space>
    );

};

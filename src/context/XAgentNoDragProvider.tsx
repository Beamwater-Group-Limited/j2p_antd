// XAgentContext.tsx
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    CbtaiInput,
    CbtaiMessage,
    createDataItem,
    parseArrayOfObject,
    parseArrayOfPromptOrThoughtChain,
    XAgentContextValue
} from '@/tools';
import {Bubble, ConversationsProps, PromptsProps, ThoughtChainProps, useXAgent, useXChat} from '@ant-design/x';
import { v4 } from 'uuid';
import { DaFormat, DaType } from '@/entity';
import type { RequestFn } from '@ant-design/x/es/use-x-agent';
import { XAgentContext } from '@/context/XAgentContext';
import {Button, Form, GetProp, Input, Switch} from "antd";
import {
    MoreOutlined,
    BulbOutlined,
    InfoCircleOutlined,
    RocketOutlined,
    SmileOutlined,
    UserOutlined,
    WarningOutlined
} from "@ant-design/icons";
// 为组件编辑器提供provider
export const XAgentNoDragProvider= ({
    modelapi,children,
}) => {
    const currentAssistant = useRef<CbtaiMessage | null>(null);
    const XAgentRequest: RequestFn<CbtaiMessage, CbtaiInput, CbtaiMessage> = async (
        info,
        { onUpdate, onSuccess, onError, onStream },
        _
    ) => {
        const controller = new AbortController();
        onStream?.(controller);
        const requestParams = {
            model: 'Qwen2.5-vl-7b',
            messages: info.messages,
            stream: true
        };
        const comes = [
            createDataItem({ content: 'large_async' }),
            createDataItem({ content: 'cbtai_5f57944569812dfa4ee7fb3e5d99069fb5d7e224' }),
            createDataItem({
                type: DaType.APPLICATION,
                format: DaFormat.FSTRING,
                content: JSON.stringify(requestParams)
            })
        ];
        const comeEntity = {
            id: v4(),
            timestamp: new Date().toISOString(),
            respon_status: '',
            comes,
            context: {
                user: { name: 'cbtai' },
                metadata: { ID: '7f9960e526b0' }
            }
        };
        try {
            const resp = await fetch(modelapi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comeEntity),
                signal: controller.signal
            });
            const reader = resp.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() || '';

                for (const part of parts) {
                    if (!part.startsWith('data: ')) continue;
                    try {
                        const outer = JSON.parse(part.slice(6));
                        const inner = JSON.parse(outer.data);
                        const token = inner.choices?.[0]?.delta?.content ?? '';

                        if (token) {
                            if (!currentAssistant.current) {
                                currentAssistant.current = { role: 'assistant', content: token };
                            } else {
                                currentAssistant.current.content += token;
                            }
                            onUpdate({ ...currentAssistant.current });
                        }
                    } catch (err) {
                        console.warn('解析 SSE 失败', err, part);
                    }
                }
            }

            if (currentAssistant.current) {
                onSuccess([currentAssistant.current]);
            }
            currentAssistant.current = null;
        } catch (err) {
            onError(err as Error);
        }
    };
    const [history,setHistory] = useState<CbtaiMessage[]>([
        { role: 'system', content: '你是一个友好的 AI 助手。' },
    ]);
    const [content, setContent] = React.useState('');
    const [agent] = useXAgent<CbtaiMessage, CbtaiInput, CbtaiMessage>({
        request: XAgentRequest
    });
    // 基于 agent 创建的 请求和消息
    const { onRequest, messages } = useXChat({agent});
    useEffect(() => {
        if (!messages.length) return;
        const last = messages[messages.length - 1];

        // 只处理 assistant 消息
        if (last.status !== 'local') {
            setHistory((prev) => {
                const i = prev.findIndex((m) => m.id === last.id);
                if (i === -1) return [...prev, last.message];     // 新消息
                // 已存在：替换为更长内容
                const clone = [...prev];
                clone[i] = last.message;
                return clone;
            });
        }
    }, [messages]);
    // 解析消息为列表项
    const blItems = useMemo(
        () =>  messages.map(({ id, message, status }) => ({
            key: id,
            role: status === 'local' ? 'local' : 'ai',
            content: typeof message === 'string'
                ? message                                // 本地 user 气泡
                : (Array.isArray((message as any).messages) // 若你把整个 {messages:[…]} 传进来
                    ? (message as any).messages.at(-1)?.content
                    : (message as any).content),          // assistant 气泡
        })),
        [messages]
    )
    // 解析消息为列表项
    const tcItems:GetProp<ThoughtChainProps, 'items'> = [
        {
            title: 'Thought Chain Item Title',
            description: 'description',
            extra: <Button type="text" icon={<MoreOutlined />} />,
        },
        {
            title: 'Thought Chain Item Title',
            description: 'description',
            extra: <Button type="text" icon={<MoreOutlined />} />,
        },
        {
            title: 'Thought Chain Item Title',
            description: 'description',
            extra: <Button type="text" icon={<MoreOutlined />} />,
        },

        {
            title: 'Thought Chain Item Title',
            description: 'description',
            extra: <Button type="text" icon={<MoreOutlined />} />,
        }]
    const footerRender = () => {
        return (
            <Switch
                size="small"
                checked={isRag}
                onChange={(checked) => {
                    setIsRag(checked)
                }}
            />
        )
    }
    // 触发提交信息
    const handleSubmit = (nextContent: string) => {
        const userMsg: CbtaiMessage = { role: 'user', content: nextContent };
        const newHistory = [...history, userMsg];
        // ① 让 useXChat 产生本地气泡 + 发送请求
        onRequest({
            message: userMsg,
            messages: newHistory,
        });
        // ② 本地同步更新历史，以便下一次带上下文
        setHistory(newHistory);
        setContent('');
    };
    // 解析中心
    const parse_XAgentContext = (name:string, value?:string) => {
        switch (name){
            case "onSubmit":
                return handleSubmit
            case "footer":
                return footerRender
            case "setContent":
                return setContent
            case "content":
                return content
            case "agentLoading":
                return agent.isRequesting?.() ?? false;
            case "blItems":
                return blItems;
            case "csItems": return parseArrayOfObject(value) as GetProp<ConversationsProps, 'items'>;
            case "tcItems": return parseArrayOfPromptOrThoughtChain(value) as GetProp<ThoughtChainProps, "items">;
            case "pmItems": return parseArrayOfPromptOrThoughtChain(value) as GetProp<PromptsProps,'items'>;
            case "roles":
                return {
                    ai: {
                        placement: 'start',
                        avatar: {icon: <UserOutlined/>, style: {background: '#fde3cf'}},
                    },
                    local: {
                        placement: 'end',
                        avatar: {icon: <UserOutlined/>, style: {background: '#87d068'}},
                    },
                } as GetProp<typeof Bubble.List, 'roles'> ;
            default:
                throw new Error(`未知操作：${name}`);
        }
    }
    // 新增：RAG 开关状态
    const [isRag, setIsRag] = useState(false);
    const value = useMemo<XAgentContextValue>(
        () => ({parse_XAgentContext} as any),
        [parse_XAgentContext]
    );

    return (
        <XAgentContext.Provider value={value}>
            {children}
        </XAgentContext.Provider>
    );
};

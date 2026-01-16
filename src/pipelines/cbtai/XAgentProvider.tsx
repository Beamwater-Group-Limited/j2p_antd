// XAgentContext.tsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {useNode} from "@craftjs/core";
import {Form, type GetProp, Input, RadioChangeEvent, Select, Space, Switch, Radio, Button} from "antd";
import {MoreOutlined,UserOutlined,BulbOutlined,InfoCircleOutlined,RocketOutlined,SmileOutlined,WarningOutlined} from "@ant-design/icons";
export const XAgentProvider= ({
    modelapi,children,
}) => {
    const {id:nodeID, connectors: { connect, drag } } = useNode();
    const [mode,setMode] = useState("large_async")
    const [agentLoading, setAgentLoading] = useState(false);
    // 新增:模型下拉选框开关
    const [modelConfig, setModelConfig] = useState('cbtai_5f57944569812dfa4ee7fb3e5d99069fb5d7e224');
    const [history,setHistory] = useState<CbtaiMessage[]>([
        { role: 'system', content: '你是一个友好的 AI 助手。' },
    ]);
    const [content, setContent] = useState('');
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
            createDataItem({ content:  mode }),
            createDataItem({ content: modelConfig }),
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
    const [agent] = useXAgent<CbtaiMessage, CbtaiInput, CbtaiMessage>({
        request: XAgentRequest
    });
    // 基于 agent 创建的 请求和消息
    const { onRequest, messages } = useXChat({agent});
    // 触发提交信息
    const handleSubmit = (nextContent: string) => {
        setAgentLoading(true)
        const userMsg: CbtaiMessage = { role: 'user', content: nextContent };
        const newHistory = [...history, userMsg];
        // ① 让 useXChat 产生本地气泡 + 发送请求
        onRequest({
            message: userMsg,
            messages: newHistory,
        });
        setHistory(newHistory);
        setContent('');
    };
    useEffect(() => {
        if (agentLoading){
            setAgentLoading(false)
        }
    }, [agentLoading]);
    useEffect(() => {
        if (!messages.length) return;
        // 对最新消息进行判断
        const last = messages[messages.length - 1];
        // 只处理接收到的消息，只处理 assistant 消息
        if (last.status !== 'local') {
            if (last.status === 'success'){
                console.log("答案信息", last)
                setHistory((prev) => {
                    const i = prev.findIndex((m) => m.id === last.id);
                    if (i === -1)
                        console.log("添加新消息到history");
                        return [...prev, last.message];     // 新消息
                    // 已存在：替换为更长内容
                    console.log("更新已有消息")
                    const clone = [...prev];
                    clone[i] = last.message;
                    return clone;
                });
            }
        }
    }, [messages]);
    // 解析消息为列表项
    const blItems = useMemo(() => {
        console.log("正在解析消息为bl列表");
        return messages.map(({ id, message, status }) => ({
            key: id,
            role: status === 'local' ? 'local' : 'ai',
            content: typeof message === 'string'
                ? message    // 本地 user 气泡
                : (Array.isArray((message as any).messages) // 若你把整个 {messages:[...]} 传进来
                    ? (message as any).messages.at(-1)?.content
                    : (message as any).content),    // assistant 气泡
        }));
    }, [messages]
    );
    // 解析消息为列表项
    const csItems:GetProp<ConversationsProps, 'items'> = Array.from({ length: 1 }).map((_, index) => ({
        key: `item${index + 1}`,
    }));
    // 解析消息为列表项
    const tcItems:GetProp<ThoughtChainProps, 'items'> = [
        {
            title: '问题分类',
            description: '问题类型：资讯类；领域：企业管理；复杂度：中等',
            extra: <Button type="text" icon={<MoreOutlined />} />,
        },
        {
            title: '理解分析',
            description: '已提取关键词：团队效率、工作流程、管理优化；核心问题：如何提升团队整体工作效率',
            extra: <Button type="text" icon={<MoreOutlined />} />,
},
    {
        title: '知识匹配',
            description: '相关领域：项目管理、团队建设、流程优化；匹配度：85%',
        extra: <Button type="text" icon={<MoreOutlined />} />,
    },

    {
        title: '解答方向',
            description: '建议提供：具体可执行的优化方案；重点关注：实践性和可操作性',
        extra: <Button type="text" icon={<MoreOutlined />} />,
    }]
    const footerRender = () => {
        return (
            <Space>
                <Radio.Group
                    size="small"
                    buttonStyle="solid"
                    value={mode}
                    onChange={(e )=> setMode(e.target.value)}>
                    <Radio.Button value="large_async">问答</Radio.Button>
                    <Radio.Button value="large_async_rag">知识库 RAG</Radio.Button>
                    {
                       modelConfig !== "cbtai_5f57944569812dfa4ee7fb3e5d99069fb5d7e224" && (<Radio.Button value="large_async_think">深度思考</Radio.Button>)
                    }
                </Radio.Group>
            <Select<string>
                size="small"
                value={modelConfig}
                style={{ width: 160 }}
                onChange={(value) => setModelConfig(value)}
            >
                <Select.Option key="cbtai_412f1a46598c624a795a245e48ea50be32f28f46"
                               value="cbtai_412f1a46598c624a795a245e48ea50be32f28f46">DeepSeekR1-32B</Select.Option>
                <Select.Option key="cbtai_f259bbbdfbfa4f8f9eb8854c52520e969fe55fdb"
                               value="cbtai_f259bbbdfbfa4f8f9eb8854c52520e969fe55fdb">DeepSeekR1-7B</Select.Option>
                <Select.Option key="cbtai_5f57944569812dfa4ee7fb3e5d99069fb5d7e224"
                               value="cbtai_5f57944569812dfa4ee7fb3e5d99069fb5d7e224">通义千问2.5VL-7B</Select.Option>
            </Select>
            </Space>
        )
    }

    // 根据值更新
    const value = useMemo<XAgentContextValue>( () => {
            const parse_XAgentContext = (name:string, value?:any) => {
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
                        return agentLoading;
                    case "blItems":
                        return blItems;
                    case "csItems": return parseArrayOfObject(value) as GetProp<ConversationsProps, 'items'> ;
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
            };
            return {
                parse_XAgentContext
            }
        },
        [handleSubmit,footerRender,setContent,content,blItems,tcItems]
    );
    useEffect(() => {
        console.log("切换模型为", mode)
        agent.request = XAgentRequest
    }, [mode, modelConfig]);
    return (
        <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
            <XAgentContext.Provider value={ value }>
                <div>
                    {children}
                </div>
            </XAgentContext.Provider>
        </div>
    );
};

XAgentProvider.isCanvas = true

const XAgentProviderSettings = () => {
    const { actions:{setProp}, props} = useNode((node) =>({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol={{ span:24 }} wrapperCol={{ span:24 }}>
                <Form.Item label="Children">
                    <Input
                        value={ props.children }
                        onChange={(e) => setProp((props) => (props.children = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="TailWindCss">
                    <Input
                        value={ props.className }
                        onChange={(e) => setProp((props) => (props.className = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="模型API">
                    <Input
                        value={ props.modelapi }
                        onChange={(e) => setProp((props) => (props.modelapi = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
XAgentProvider.craft = {
    displayName: "XAgentProvider",
    props: {
        modelapi: 'http://xxx.xxx.xxx.xxx:18586/v1/process',
    },
    related: {
        settings: XAgentProviderSettings,
    }
};

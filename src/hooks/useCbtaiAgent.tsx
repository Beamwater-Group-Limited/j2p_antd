import {useEffect, useRef, useState} from "react";
import {CbtaiInput, CbtaiMessage, createDataItem} from "@/tools";
import { useXAgent} from "@ant-design/x";
import {v4} from "uuid";
import {DaFormat, DaType} from "@/entity";
import {RequestFn} from "@ant-design/x/es/use-x-agent";
const BASE_URL = 'http://xxx.xxx.xxx.xxx:18586'
const PATH = '/v1/process'

// 监视 yData 触发状态变化 更新引用
function useCbtaiAgent() {
    /** 用来在一次回复中累积 content，避免闭包过期 */
    const currentAssistant = useRef<CbtaiMessage | null>(null);
    // 一条一条返回的文本数据（chunk）
    const [lines, setLines] = useState<any[]>([]);
    // 遵循 泛型 Message Input和Output，参数 消息+历史累积，回调函数，自定义转换
    const CbtaiAgentRequest: RequestFn<CbtaiMessage,CbtaiInput,CbtaiMessage> = async (
        info,
        { onUpdate, onSuccess, onError, onStream },
        _) => {
        const controller = new AbortController();
        onStream?.(controller);

        const requestParams = {
            model: 'Qwen2.5-vl-7b',
            messages:info.messages,
            stream:true,
        }
        const goes = [
            createDataItem({content:'large_async'}),
            createDataItem({content:'cbtai_5f57944569812dfa4ee7fb3e5d99069fb5d7e224'}),
            createDataItem({
                type: DaType.APPLICATION,
                format: DaFormat.FSTRING,
                content: JSON.stringify(requestParams),
            }),
        ]
        // 🔧 构造 comeEntity 请求体
        const comeEntity = {
            id: v4(),
            timestamp: new Date().toISOString(),
            respon_status: '',
            comes: goes,
            context: {
                user: { name: 'cbtai' },
                metadata: { ID: '7f9960e526b0' }
            }
        };
        try {
            const resp = await fetch(BASE_URL + PATH, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comeEntity),
                signal: controller.signal,
            });

            const reader = resp.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                // 持续读取后端返回
                const { done, value } = await reader.read();
                if (done) break;
                // 累积缓存
                buffer += decoder.decode(value, { stream: true });
                // 分割为数组
                const parts = buffer.split('\n\n');
                buffer = parts.pop() || '';

                for (const part of parts) {
                    if (!part.startsWith('data: ')) continue;
                    try {
                        const outer = JSON.parse(part.slice(6));
                        const inner = JSON.parse(outer.data);
                        const token = inner.choices?.[0]?.delta?.content ?? '';

                        if (token) {
                            // ── 第一次收到 token：新建一条 assistant 消息 ──
                            if (!currentAssistant.current) {
                                currentAssistant.current = { role: 'assistant', content: token };
                            } else {
                                // ── 后续 token：追加内容 ──
                                currentAssistant.current.content += token;
                            }
                            // 每个 token 都触发 onUpdate（useXChat 会替换最后一条）
                            onUpdate({ ...currentAssistant.current });
                        }
                    } catch (err) {
                        console.warn('解析 SSE 失败', err, part);
                    }
                }
            }
            // 推流结束，把最后聚合好的 assistant 消息发送给 onSuccess
            if (currentAssistant.current) {
                onSuccess([currentAssistant.current]);
            }
            currentAssistant.current = null; // 清理
        } catch (err) {
            onError(err as Error);
        }
    }
    const [agent] = useXAgent<CbtaiMessage,CbtaiInput,CbtaiMessage>({
        request: CbtaiAgentRequest
    });

    return {
        agent
    }
}



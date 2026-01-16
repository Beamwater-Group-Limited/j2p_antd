// Cbtaiaudio
import { useNode } from "@craftjs/core";
import { v4 } from "uuid";
import { Form, Select, Switch, Radio, Checkbox, Slider, Input, Typography, InputNumber, DatePicker } from "antd";
import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { EventService, getUserName, parse_menuProps, parse_menuItems, parse_func, parse_dict, parse_icon, parse_timelineItems, parse_listSource, parse_renderItem, parse_tableColumns, parse_reference, parse_transforRender, parse_transforOnChange, parse_transforTarget, parse_eventTargetValue, parse_info, parse_eventTargetChecked, parse_reactNode, parse_tableOnRow, parse_dayjs, parse_countProps, parse_markProps, parse_progressProps, parse_tabsProps, parse_menuOnClick, parse_typographyOnClick, parse_function, parse_pageChange, parse_fileChange, parse_filePreview, parse_selectionProps } from "@/tools";
import { useAppConfig, useWebSocket, useProject, usePagesData } from "@/context";
import { DictItemTree, DoubleInput } from "@/ide";
import { useCraftJS, useWebrtc } from "@/hooks";
import { DynamicAntdIcon } from "@/pipelines/cbtai";
import * as CbtaiAntd from "antd";
import { FormProps, SelectProps, SwitchProps, RadioProps, CheckboxProps, SiderProps, InputProps, TypographyProps, MenuProps } from "antd";
import React from "react";

// 动态生成的基础组件
export const Cbtaiaudio = ({
                               className,
                               dataevent,
                               children,
                               controls,
                               src,
                               autoPlay,
                               loop,
                               muted,
                               preload,
                               onPlay,
                               onPlay_func,
                           }) => {
    const { appConfig } = useAppConfig();
    const { projectConfig } = useProject();
    // 动态生成的拖拽节点相关
    const {
        id: nodeID,
        connectors: { connect, drag },
    } = useNode();
    const { deleteCurrentNodeChildren, craftJsonToJSX } = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const ownerID = projectConfig.owner_id;
    const { pageData, nodeLocalState, setMainCompoID } = usePagesData();

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastAutoPlayedSrcRef = useRef<string>("");

    // 判断是否为脏数据
    const [isDirty, setIsDirty] = useState<boolean>(false);

    // 动态生成的状态
    const [srcState, setSrcState] = useState<any>("");
    const changeSrcState = (newStates: any) => {
        setIsDirty(true);
        setSrcState(newStates);
    };

    const [autoPlayState, setAutoPlayState] = useState<any>(false);
    const changeAutoPlayState = (newStates: any) => {
        setIsDirty(true);
        setAutoPlayState(newStates);
    };

    const [mutedState, setMutedState] = useState<any>(true);
    const changeMutedState = (newStates: any) => {
        setIsDirty(true);
        setMutedState(newStates);
    };

    const [isPlayingState, setIsPlayingState] = useState<any>("");
    const changeIsPlayingState = (newStates: any) => {
        setIsDirty(true);
        setIsPlayingState(newStates);
    };

    const [currentTimeState, setCurrentTimeState] = useState<any>("");
    const changeCurrentTimeState = (newStates: any) => {
        setIsDirty(true);
        setCurrentTimeState(newStates);
    };

    // 总状态
    const [cbtState, setCbtState] = useState<Record<string, any>>({
        srcState: "",
        autoPlayState: false,
        mutedState: true,
        isPlayingState: "",
        currentTimeState: "",
    });

    //    连接网络
    const { ws, sendStateChange, restoreCbtState, sendEvent } = useWebSocket();

    // 注册总状态改变事件
    useEffect(() => {
        const subscription = EventService.subscribe(nodeID, (data) => {
            // console.log("📌 收到事件:",nodeID, data.payload);
            setCbtState(data);
        });
        setMainCompoID(nodeID);
        // 触发订阅本地消息
        return () => {
            subscription.unsubscribe(); // 组件卸载时取消订阅
        };
    }, []);

    // 注册本地状态改变
    useEffect(() => {
        if (!nodeLocalState || nodeLocalState.length === 0) return;
        // 注册本地事件
        const subscriptionLocal = EventService.subscribeLocal(nodeLocalState, (data) => {
            // console.log("收到本地事件", data)
            setCbtState(data);
        });
        return () => {
            subscriptionLocal.unsubscribe(); // 卸载
        };
    }, [nodeLocalState]);

    useEffect(() => {
        if (ws?.readyState === WebSocket.OPEN && pageData.nodesStated.includes(nodeID)) {
            restoreCbtState(nodeID, cbtState);
        }
    }, [ws?.readyState]);

    // 根据总状态更新单个状态（✅ 不要用 truthy 判断，避免 false 被跳过/或 JSON.parse 非 string 报错）
    useEffect(() => {
        const safeParse = (v: any) => {
            if (v === undefined || v === null) return undefined;
            if (typeof v === "string") {
                try {
                    return JSON.parse(v);
                } catch (e) {
                    return v;
                }
            }
            return v;
        };

        const v1 = safeParse(cbtState["srcState"]);
        if (v1 !== undefined) setSrcState(v1);

        const v2 = safeParse(cbtState["autoPlayState"]);
        if (v2 !== undefined) setAutoPlayState(v2);

        const v3 = safeParse(cbtState["mutedState"]);
        if (v3 !== undefined) setMutedState(v3);

        const v4 = safeParse(cbtState["isPlayingState"]);
        if (v4 !== undefined) setIsPlayingState(v4);

        const v5 = safeParse(cbtState["currentTimeState"]);
        if (v5 !== undefined) setCurrentTimeState(v5);
    }, [cbtState]);

    // 动态生成发送状态变化
    useEffect(() => {
        console.log("状态变化:", "srcState", srcState, isDirty);
        if (isDirty) {
            sendStateChange(nodeID, "srcState", srcState);
            setIsDirty(false);
        }
    }, [srcState]);

    // 动态生成发送状态变化
    useEffect(() => {
        console.log("状态变化:", "autoPlayState", autoPlayState, isDirty);
        if (isDirty) {
            sendStateChange(nodeID, "autoPlayState", autoPlayState);
            setIsDirty(false);
        }
    }, [autoPlayState]);

    // 动态生成发送状态变化
    useEffect(() => {
        console.log("状态变化:", "mutedState", mutedState, isDirty);
        if (isDirty) {
            sendStateChange(nodeID, "mutedState", mutedState);
            setIsDirty(false);
        }
    }, [mutedState]);

    // 动态生成发送状态变化
    useEffect(() => {
        console.log("状态变化:", "isPlayingState", isPlayingState, isDirty);
        if (isDirty) {
            sendStateChange(nodeID, "isPlayingState", isPlayingState);
            setIsDirty(false);
        }
    }, [isPlayingState]);

    // 动态生成发送状态变化
    useEffect(() => {
        console.log("状态变化:", "currentTimeState", currentTimeState, isDirty);
        if (isDirty) {
            sendStateChange(nodeID, "currentTimeState", currentTimeState);
            setIsDirty(false);
        }
    }, [currentTimeState]);

    const parseParams = { sendEvent, nodeID, cbtState, setCbtState, sendStateChange, React, CbtaiAntd, navigate, workMode };

    // 状态属性
    useEffect(() => {
        setSrcState(src);
    }, [src]);

    // 状态属性
    useEffect(() => {
        setAutoPlayState(autoPlay);
    }, [autoPlay]);

    // 状态属性
    useEffect(() => {
        setMutedState(muted);
    }, [muted]);

    //  自动播放（不在 ref 回调里 play）
    useEffect(() => {
        const el = audioRef.current;
        const url = (srcState || "").toString();

        if (!el) return;
        if (!url) return;
        if (!autoPlayState) return;

        // 同一个 src 只自动播放一次
        if (lastAutoPlayedSrcRef.current === url) return;
        lastAutoPlayedSrcRef.current = url;

        const p = el.play();
        if (p && typeof (p as any).catch === "function") {
            (p as any).catch((err: any) => {
                console.warn("音频自动播放失败（浏览器限制）：", err);
            });
        }
    }, [srcState, autoPlayState]);

    // 播放结束时的回调函数： 清空 src
    const handleOnEnded = (e: any) => {
        console.log("音频播放结束", e);
        console.log("cbtState", cbtState);

        // 允许下次同一个地址再次触发
        lastAutoPlayedSrcRef.current = "";
        // 同步清空 src
        changeSrcState("");
    };

    return (
        <audio
            ref={(el) => {
                if (el) {
                    audioRef.current = el;
                    connect(drag(el));
                }
            }}
            className={className}
            data-event={dataevent}
            data-targetid={nodeID}
            controls={controls}
            src={srcState}
            autoPlay={autoPlayState}
            loop={loop}
            muted={mutedState}
            preload={preload}
            onPlay={onPlay_func ? onPlay_func : parse_func("Cbtaiaudio.onPlay", parseParams, onPlay)}
            onEnded={handleOnEnded}
        />
    );
};

//  是否是容器
Cbtaiaudio.isCanvas = false;

const CbtaiaudioSettings = () => {
    const {
        actions: { setProp },
        props,
    } = useNode((node) => ({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                <Form.Item label="Children">
                    <Input value={props.children} onChange={(e) => setProp((props) => (props.children = e.target.value))} />
                </Form.Item>
                <Form.Item label="TailWindCss">
                    <Input value={props.className} onChange={(e) => setProp((props) => (props.className = e.target.value))} />
                </Form.Item>
                <Form.Item label="显示播放控件">
                    <Switch checked={props.controls} onChange={(checked) => setProp((props) => (props.controls = checked))} />
                </Form.Item>
                <Form.Item label="音频文件地址">
                    <Input value={props.src} onChange={(e) => setProp((props) => (props.src = e.target.value))} />
                </Form.Item>
                <Form.Item label="自动播放">
                    <Switch checked={props.autoPlay} onChange={(checked) => setProp((props) => (props.autoPlay = checked))} />
                </Form.Item>
                <Form.Item label="音频播放完毕后自动循环">
                    <Switch checked={props.loop} onChange={(checked) => setProp((props) => (props.loop = checked))} />
                </Form.Item>
                <Form.Item label="静音播放">
                    <Switch checked={props.muted} onChange={(checked) => setProp((props) => (props.muted = checked))} />
                </Form.Item>
                <Form.Item label="页面加载时的预加载策略">
                    <Select value={props.preload} onChange={(value) => setProp((props) => (props.preload = value))}>
                        {["none", "metadata", "auto"].map((option) => (
                            <Select.Option key={option} value={option}>
                                {option}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="控制播放回调">
                    <DoubleInput
                        value={props.onPlay}
                        onChange={(value) => {
                            setProp((props) => (props.onPlay = value));
                        }}
                        bottomLabel="JS 代码"
                        jsValidation={{
                            maxLength: 5000,
                            forbidden: [/eval\s*\(/i, /new\s+Function\s*\(/i], // 可自定义
                            strict: true,
                            debounceMs: 250,
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    );
};

// 组件配置和默认属性
Cbtaiaudio.craft = {
    displayName: "Cbtaiaudio",
    props: {
        disabled: false,
    },
    related: {
        settings: CbtaiaudioSettings,
    },
};

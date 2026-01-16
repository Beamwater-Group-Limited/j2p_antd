
// CbtaiRecorder
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {StopOutlined,AudioOutlined}from"@ant-design/icons"
import {
    Form, Select, Switch, Radio, Checkbox, Slider, Input, Typography, InputNumber, DatePicker,
    ButtonProps, message, Button
} from "antd";
import {useEffect, useState, useContext, useRef} from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_func,    parse_dict,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_tableOnRow,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function,    parse_pageChange,    parse_fileChange,    parse_filePreview,    parse_selectionProps   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import * as CbtaiAntd from "antd";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件

export const CbtaiRecorder = ({ 
     className,  dataevent,  children,  maxDuration, onFinish, autoStart
    }) => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    // 动态生成的拖拽节点相关
    const {id:nodeID, connectors: { connect, drag } } = useNode();
    const {deleteCurrentNodeChildren,craftJsonToJSX} = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const ownerID = projectConfig.owner_id;
    const {pageData,nodeLocalState, setMainCompoID} = usePagesData()
    // 判断是否为脏数据
    const [isDirty, setIsDirty] = useState<boolean>(false);

    // 动态生成的状态
    const [blobState, setBlobState] = useState<any>( "" );
    const changeBlobState = (newStates:any) => {
        setIsDirty(true)
        setBlobState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
        blobState:  "" ,
    });
    //    连接网络
    const {ws, sendStateChange, restoreCbtState,sendEvent } = useWebSocket();
    // 注册总状态改变事件
    useEffect(() => {
        const subscription = EventService.subscribe(nodeID, (data) => {
            // console.log("📌 收到事件:",nodeID, data.payload);
            setCbtState(data);
        });
        setMainCompoID(nodeID)
        // 触发订阅本地消息
        return () => {
            subscription.unsubscribe(); // 组件卸载时取消订阅
        };
    }, []);
    // 注册本地状态改变
    useEffect(() => {
        if (! nodeLocalState || nodeLocalState.length === 0) return
        // 注册本地事件
        const subscriptionLocal = EventService.subscribeLocal(nodeLocalState, (data) => {
            // console.log("收到本地事件", data)
            setCbtState(data)
        })
        return () => {
            subscriptionLocal.unsubscribe(); // 卸载
        }
    }, [nodeLocalState]);
    
    useEffect(() => {
        if (ws?.readyState === WebSocket.OPEN && pageData.nodesStated.includes(nodeID)){
            restoreCbtState(nodeID,cbtState)
        }
    }, [ws?.readyState]);
    // 根据总状态更新单个状态
    useEffect(() => {
        if(cbtState["blobState"]) { setBlobState(JSON.parse(cbtState["blobState"])) }
    }, [cbtState]);
    useEffect(() => {
        console.log("状态变化:","blobState",blobState,isDirty)
        if (isDirty){
            sendStateChange(nodeID,"blobState",blobState);
            setIsDirty(false);
        }
    }, [blobState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   }
    
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [elapsed, setElapsed] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[] | null>(null);
    const timerRef = useRef<number | null>(null);
    const hasAutoStartedRef = useRef<boolean>(false);

    const cleanup = () => {
        if (timerRef.current !== null){
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (streamRef.current){
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        mediaRecorderRef.current = null;
    };

    const stopRecordInternal =() =>{
        if(mediaRecorderRef.current && mediaRecorderRef.current.state !=="inactive"){
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        if(timerRef.current !== null){
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    const onFinish_func = parse_func("CbtaiRecorder.onFinish",parseParams,onFinish)
    const startRecord =async () =>{
        if(!navigator.mediaDevices ||!navigator.mediaDevices.getUserMedia){
            message.error("不支持");
            return;
        }
        if(isRecording) return;

        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        setElapsed(0);

        recorder.ondataavailable = (e)=>{
            if(e.data && e.data.size>0){
                chunksRef.current.push(e.data);
            }
        };

        recorder.onstop = ()=>{
            const blob = new Blob(chunksRef.current,{type:"audio/webm"});
            chunksRef.current = [];
            console.log(onFinish_func);
            // @ts-ignore
            onFinish_func?.(blob);
            console.log("停止录音",blob);

            cleanup();
        };

        recorder.start();
        setIsRecording(true);

        timerRef.current = window.setInterval(() => {
            setElapsed((prev)=>{
                const next = prev +1;
                if (next >= maxDuration){
                    stopRecordInternal();
                }
                return next;
            });
        },1000);
    }
    const handleClick = (e) => {
        if (isRecording) {
            stopRecordInternal();
        }else {
            startRecord();
        }
    };

    useEffect(() => {
        if(autoStart&&!hasAutoStartedRef.current){
            hasAutoStartedRef.current = true;
            startRecord();
        }
    }, [autoStart]);
    useEffect(() => {
        return()=>{
            stopRecordInternal();
            cleanup();
        };
    },[])

    const label = isRecording?`录音中...${elapsed}s / ${maxDuration}s`:children ||"开始录音";
    const icon = isRecording?<StopOutlined />:<AudioOutlined />;
  return (
        <Button
            className = {className}
            type = {isRecording ? "primary" : "default"}
            danger = {isRecording}
            icon = {icon}
            onClick = {handleClick}
        >
            {label}
         </Button>
  );
};

//  是否是容器
CbtaiRecorder.isCanvas = false;
      
const CbtaiRecorderSettings = () => {
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
                <Form.Item label="最大录音时间">
                    <InputNumber
                        value={ props.maxDuration }
                        onChange={(value) => setProp((props) => (props.maxDuration = value))}
                    />
                </Form.Item>
                <Form.Item label="结束回调函数">
                    <DoubleInput
                        value={ props.onFinish }
                        onChange={(value) => {
                            setProp((props) => (props.onFinish = value));
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
                <Form.Item label="是否自动录音">
                    <Switch
                        checked={ props.autoStart }
                        onChange={(checked) => setProp((props ) => (props.autoStart = checked))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiRecorder.craft = {
  displayName: "CbtaiRecorder",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiRecorderSettings,
  },
};

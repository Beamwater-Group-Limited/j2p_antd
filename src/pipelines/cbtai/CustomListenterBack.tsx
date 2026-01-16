// CustomListenterBackComponent
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Button   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
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
export const CustomListenterBack = ({
                                             className,
                                             dataevent,
                                             children,
                                             backFunc,
                                         }) => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    // 动态生成的拖拽节点相关
    const {id:nodeID, connectors: { connect, drag } } = useNode();
    const {deleteCurrentNodeChildren,craftJsonToJSX} = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const {pageData,nodeLocalState, setMainCompoID} = usePagesData()
    // 判断是否为脏数据
    const [isDirty, setIsDirty] = useState<boolean>(false);

    // 定义您要求的 backChangeState 状态
    const [backChangeState, setBackChangeState] = useState<any>( "" );
    const changeBackChangeState = (newStates:any) => {
        setIsDirty(true)
        setBackChangeState(newStates)
    }

    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
        backChangeState:  "" ,
    });

    // 连接网络
    const {ws, sendStateChange, restoreCbtState, sendEvent } = useWebSocket();

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
        console.log("总状态变化:","cbtState",cbtState)
        if(cbtState["backChangeState"]) {
            console.log("状态变化:","backChangeState",backChangeState)
            setBackChangeState(JSON.parse(cbtState["backChangeState"])) }
    }, [cbtState]);

    // 动态生成发送状态变化
    useEffect(() => {
        console.log("状态变化:","backChangeState",backChangeState,isDirty)
        // if (isDirty){
        //     sendStateChange(nodeID,"backChangeState",backChangeState);
        //     setIsDirty(false);
        // }
        //执行回调函数
        const onBack = parse_func("CustomListenterBack.onBack", parseParams, backFunc);
        console.log("执行回调函数:",onBack)
    }, [backChangeState]);

    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   appConfig,   projectConfig,   }

    return (
        <div
            ref={ref => {
                if (ref) {
                    connect(drag(ref));
                }}}
            className={ className }
            data-event={dataevent}
            data-targetid={nodeID}
        >
            {children}
            {/* 显示当前 backChangeState 的值，便于调试 */}
            <div>BackChangeState: {JSON.stringify(backChangeState)}</div>
        </div>
    );
};

// 是否是容器
CustomListenterBack.isCanvas = false;

const CustomListenterBackSettings = () => {
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
                <Form.Item label="状态改变执行js函数">
                    <DoubleInput
                        value={ props.backFunc }
                        onChange={(value) => {
                            setProp((props) => (props.backFunc = value));
                        }}
                        bottomLabel="JS 代码"
                        jsValidation={{
                            maxLength: 100000,
                            forbidden: [/eval\s*\(/i, /new\s+Function\s*\(/i], // 可自定义
                            strict: true,
                            debounceMs: 250,
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CustomListenterBack.craft = {
    displayName: "CustomListenterBack",
    props: {
        children:  "" ,
        backFunc: "",
    },
    related: {
        settings: CustomListenterBackSettings,
    },
};
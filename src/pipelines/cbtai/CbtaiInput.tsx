
// CbtaiInput
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,Spin   } from "antd";
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
export const CbtaiInput = ({ 
     className,  dataevent,  children,  
    maxLength,   
    showCount,   
    status,   
    variant,   
    value,   
    onChange, onChange_temp,  
    count, count_temp,  
    addonAfter,   
    addonBefore	,   
    placeholder,   
    type,   
    disabled,   
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
    const [valueState, setValueState] = useState<any>( "" );
    const changeValueState = (newStates:any) => {
        setIsDirty(true)
        setValueState(newStates)
    }
    const [placeholderState, setPlaceholderState] = useState<any>( "" );
    const changePlaceholderState = (newStates:any) => {
        setIsDirty(true)
        setPlaceholderState(newStates)
    }
    const [disabledState, setDisabledState] = useState<any>( false );
    const changeDisabledState = (newStates:any) => {
        setIsDirty(true)
        setDisabledState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              valueState:  "" ,
              placeholderState:  "" ,
              disabledState:  false ,
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
      if(cbtState["valueState"]) { setValueState(JSON.parse(cbtState["valueState"])) }
      if(cbtState["placeholderState"]) { setPlaceholderState(JSON.parse(cbtState["placeholderState"])) }
      if(cbtState["disabledState"]) { setDisabledState(JSON.parse(cbtState["disabledState"])) }
    }, [cbtState]);

    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","valueState",valueState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"valueState",valueState);
            setIsDirty(false);
         }
    }, [valueState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","placeholderState",placeholderState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"placeholderState",placeholderState);
            setIsDirty(false);
         }
    }, [placeholderState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","disabledState",disabledState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"disabledState",disabledState);
            setIsDirty(false);
         }
    }, [disabledState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   appConfig,   projectConfig,   }
    
    // 状态属性
    useEffect(() => {
        setValueState( value )
    },[value])
    // 状态属性
    useEffect(() => {
        setPlaceholderState( placeholder )
    },[placeholder])
    // 状态属性
    useEffect(() => {
        setDisabledState( disabled )
    },[disabled])

    return (
        ws && ws.readyState !== WebSocket.OPEN ? (
            <div>
                <Spin tip="加载中..." />
            </div>
        ) : (
            <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
                <Input
                    className={ className }
                    data-event={dataevent}
                    data-targetid={nodeID}
                    maxLength={ maxLength }
                    showCount={ showCount }
                    status={ status }
                    variant={ variant }
                    value={ valueState }
                    onChange={ onChange_temp?onChange_temp:parse_eventTargetValue ( changeValueState , onChange) }
                    count={ count_temp?count_temp:parse_countProps ( count) }
                    addonAfter={ addonAfter }
                    addonBefore={ addonBefore }
                    placeholder={ placeholderState }
                    type={ type }
                    disabled={ disabledState }
                />
            </div>
        )
    );
};

//  是否是容器
CbtaiInput.isCanvas = false;
      
const CbtaiInputSettings = () => {
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
                <Form.Item label="最大长度">
                    <Input
                        value={ props.maxLength }
                        onChange={(e) => setProp((props) => (props.maxLength = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="是否展示数字">
                    
                    <Switch
                        checked={ props.showCount }
                        onChange={(checked) => setProp((props ) => (props.showCount = checked))}
                    />
                </Form.Item>
                <Form.Item label="校验状态">
                    
                    <Select
                        value={ props.status }
                        onChange={(value) => setProp((props) => (props.status = value))}
                    >
                        {  ["error","warning",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="形态变体">
                    
                    <Select
                        value={ props.variant }
                        onChange={(value) => setProp((props) => (props.variant = value))}
                    >
                        {  ["outlined","borderless","filled","underlined",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="输入框内容">
                    <Input
                        value={ props.value }
                        onChange={(e) => setProp((props) => (props.value = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="输入框内容变化时的回调">
                    
                </Form.Item>
                <Form.Item label="字符计数配置">
                    
                    <DictItemTree
                        value={ props.count }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.count = dictValue;
                                props.count_temp = parse_countProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="带标签的 input，设置后置标签">
                    <Input
                        value={ props.addonAfter }
                        onChange={(e) => setProp((props) => (props.addonAfter = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="带标签的 input，设置前置标签">
                    <Input
                        value={ props.addonBefore	 }
                        onChange={(e) => setProp((props) => (props.addonBefore	 = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="输入框默认内容">
                    <Input
                        value={ props.placeholder }
                        onChange={(e) => setProp((props) => (props.placeholder = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="输入框类型">
                    
                    <Select
                        value={ props.type }
                        onChange={(value) => setProp((props) => (props.type = value))}
                    >
                        {  ["text","password","email","number","tel","url","search","date",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="禁用状态">
                    
                    <Switch
                        checked={ props.disabled }
                        onChange={(checked) => setProp((props ) => (props.disabled = checked))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiInput.craft = {
  displayName: "CbtaiInput",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiInputSettings,
  },
};

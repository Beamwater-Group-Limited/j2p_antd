
// CbtaiButton
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
export const CbtaiButton = ({ 
     className,  dataevent,  children,  
    danger,   
    htmlType,   
    type,   
    variant,   
    size,   
    color,   
    icon, icon_temp,  
    disabled,   
    onClick,  onClick_func, 
    loading,   
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
    const [buttonClick, setButtonClick] = useState<any>( "" );
    const changeButtonClick = (newStates:any) => {
        setIsDirty(true)
        setButtonClick(newStates)
    }
    const [disabledState, setDisabledState] = useState<any>( false );
    const changeDisabledState = (newStates:any) => {
        setIsDirty(true)
        setDisabledState(newStates)
    }
    const [buttonValueState, setButtonValueState] = useState<any>( "" );
    const changeButtonValueState = (newStates:any) => {
        setIsDirty(true)
        setButtonValueState(newStates)
    }
    const [loadingState, setLoadingState] = useState<any>( false );
    const changeLoadingState = (newStates:any) => {
        setIsDirty(true)
        setLoadingState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              buttonClick:  "" ,
              disabledState:  false ,
              buttonValueState:  "" ,
              loadingState:  false ,
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
      if(cbtState["buttonClick"]) { setButtonClick(JSON.parse(cbtState["buttonClick"])) }
      if(cbtState["disabledState"]) { setDisabledState(JSON.parse(cbtState["disabledState"])) }
      if(cbtState["buttonValueState"]) { setButtonValueState(JSON.parse(cbtState["buttonValueState"])) }
      if(cbtState["loadingState"]) { setLoadingState(JSON.parse(cbtState["loadingState"])) }
    }, [cbtState]);

    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","buttonClick",buttonClick,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"buttonClick",buttonClick);
            setIsDirty(false);
         }
    }, [buttonClick]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","disabledState",disabledState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"disabledState",disabledState);
            setIsDirty(false);
         }
    }, [disabledState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","buttonValueState",buttonValueState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"buttonValueState",buttonValueState);
            setIsDirty(false);
         }
    }, [buttonValueState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","loadingState",loadingState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"loadingState",loadingState);
            setIsDirty(false);
         }
    }, [loadingState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   appConfig,   projectConfig,   }
    
    // 状态属性
    useEffect(() => {
        setDisabledState( disabled )
    },[disabled])
    // 状态属性
    useEffect(() => {
        setLoadingState( loading )
    },[loading])
   
  return (
        <Button
            ref={ref => {
                if (ref) {
                    connect(drag(ref));
                }}}
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          danger={ danger }    
          htmlType={ htmlType }    
          type={ type }    
          variant={ variant }    
          size={ size }    
          color={ color }    
          icon={ icon_temp?icon_temp:parse_icon ( icon) }
          disabled={ disabledState }
          onClick={ onClick_func?onClick_func:parse_func(  "CbtaiButton.onClick",  parseParams, onClick) }
          loading={ loadingState }
          >
         {children}
         </Button>
  );
};

//  是否是容器
CbtaiButton.isCanvas = false;
      
const CbtaiButtonSettings = () => {
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
                <Form.Item label="是否设为危险按钮">
                    
                    <Switch
                        checked={ props.danger }
                        onChange={(checked) => setProp((props ) => (props.danger = checked))}
                    />
                </Form.Item>
                <Form.Item label="按钮的交互类型">
                    
                    <Select
                        value={ props.htmlType }
                        onChange={(value) => setProp((props) => (props.htmlType = value))}
                    >
                        {  ["button","submit","reset",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="按钮的样式类型">
                    
                    <Select
                        value={ props.type }
                        onChange={(value) => setProp((props) => (props.type = value))}
                    >
                        {  ["default","dashed","link","text","primary",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="按钮的变体样式">
                    
                    <Select
                        value={ props.variant }
                        onChange={(value) => setProp((props) => (props.variant = value))}
                    >
                        {  ["outlined","dashed","solid","filled","text","link",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="按钮大小">
                    <Radio.Group
                        value={ props.size }
                        onChange={(e) => setProp((props) => (props.size = e.target.value))}
                    >
                        { ["large","middle","small",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    
                </Form.Item>
                <Form.Item label="按钮颜色">
                    <Radio.Group
                        value={ props.color }
                        onChange={(e) => setProp((props) => (props.color = e.target.value))}
                    >
                        { ["default","primary","danger",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    
                </Form.Item>
                <Form.Item label="图标">
                    <Input
                        value={ props.icon }
                        onChange={(e) => {
                            setProp((props) => (props.icon = e.target.value));
                            setProp((props) =>  (props.icon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                    
                </Form.Item>
                <Form.Item label="设置按钮失效状态">
                    
                    <Switch
                        checked={ props.disabled }
                        onChange={(checked) => setProp((props ) => (props.disabled = checked))}
                    />
                </Form.Item>
                <Form.Item label="点击按钮时的回调">
                    
                    <DoubleInput
                        value={ props.onClick }
                        onChange={(value) => {
                            setProp((props) => (props.onClick = value));
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
                <Form.Item label="设置按钮载入状态">
                    
                    <Switch
                        checked={ props.loading }
                        onChange={(checked) => setProp((props ) => (props.loading = checked))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiButton.craft = {
  displayName: "CbtaiButton",
  props: {
    disabled:  false ,
    children:  "" ,
  },
  related: {
    settings: CbtaiButtonSettings,
  },
};

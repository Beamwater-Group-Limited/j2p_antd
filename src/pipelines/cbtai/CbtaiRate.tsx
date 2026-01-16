
// CbtaiRate
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Rate   } from "antd";
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
export const CbtaiRate = ({ 
     className,  dataevent,  children,  
    allowClear,   
    allowHalf,   
    autoFocus,   
    character,   
    defaultValue,   
    disabled,   
    keyboard,   
    count,   
    value,   
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
    const [countState, setCountState] = useState<any>( "" );
    const changeCountState = (newStates:any) => {
        setIsDirty(true)
        setCountState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              valueState:  "" ,
              countState:  "" ,
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
      if(cbtState["countState"]) { setCountState(JSON.parse(cbtState["countState"])) }
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
         console.log("状态变化:","countState",countState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"countState",countState);
            setIsDirty(false);
         }
    }, [countState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   }
    
    // 状态属性
    useEffect(() => {
        setCountState( count )
    },[count])
    // 状态属性
    useEffect(() => {
        setValueState( value )
    },[value])
   
  return (
    <div ref={ref => { if (ref) { connect(drag(ref));                      }}}>
        <Rate
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          allowClear={ allowClear }    
          allowHalf={ allowHalf }    
          autoFocus={ autoFocus }    
          character={ character }    
          defaultValue={ defaultValue }    
          disabled={ disabled }    
          keyboard={ keyboard }    
          count={ countState }
          value={ valueState }
         />
    </div>
  );
};

//  是否是容器
CbtaiRate.isCanvas = false;
      
const CbtaiRateSettings = () => {
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
                <Form.Item label="是否允许再次点击后清除">
                    
                    <Switch
                        checked={ props.allowClear }
                        onChange={(checked) => setProp((props ) => (props.allowClear = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否允许半选">
                    
                    <Switch
                        checked={ props.allowHalf }
                        onChange={(checked) => setProp((props ) => (props.allowHalf = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否自动获取焦点">
                    
                    <Switch
                        checked={ props.autoFocus }
                        onChange={(checked) => setProp((props ) => (props.autoFocus = checked))}
                    />
                </Form.Item>
                <Form.Item label="自定义字符">
                    <Input
                        value={ props.character }
                        onChange={(e) => setProp((props) => (props.character = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="默认值">
                    <Input
                        value={ props.defaultValue }
                        onChange={(e) => setProp((props) => (props.defaultValue = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="是否只读，无法进行交互">
                    
                    <Switch
                        checked={ props.disabled }
                        onChange={(checked) => setProp((props ) => (props.disabled = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否支持使用键盘操作">
                    
                    <Switch
                        checked={ props.keyboard }
                        onChange={(checked) => setProp((props ) => (props.keyboard = checked))}
                    />
                </Form.Item>
                <Form.Item label="star总数">
                    <InputNumber
                        value={ props.count }
                        onChange={(value) => setProp((props) => (props.count = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="当前数">
                    <InputNumber
                        value={ props.value }
                        onChange={(value) => setProp((props) => (props.value = value))}
                    />
                    
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiRate.craft = {
  displayName: "CbtaiRate",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiRateSettings,
  },
};

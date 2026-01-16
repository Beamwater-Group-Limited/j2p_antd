
// CbtaiSpin
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Spin   } from "antd";
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
export const CbtaiSpin = ({ 
     className,  dataevent,  children,  
    delay,   
    fullscreen,   
    indicator, indicator_temp,  
    percent,   
    size,   
    spinning,   
    tip,   
    wrapperClassName,   
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
    const [spinningState, setSpinningState] = useState<any>( "" );
    const changeSpinningState = (newStates:any) => {
        setIsDirty(true)
        setSpinningState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              spinningState:  "" ,
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
      if(cbtState["spinningState"]) { setSpinningState(JSON.parse(cbtState["spinningState"])) }
    }, [cbtState]);

    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","spinningState",spinningState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"spinningState",spinningState);
            setIsDirty(false);
         }
    }, [spinningState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   }
    
    // 状态属性
    useEffect(() => {
        setSpinningState( spinning )
    },[spinning])
   
  return (
    <div ref={ref => { if (ref) { connect(drag(ref));                      }}}>
        <Spin
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          delay={ delay }    
          fullscreen={ fullscreen }    
          indicator={ indicator_temp?indicator_temp:parse_icon ( indicator) }
          percent={ percent }    
          size={ size }    
          spinning={ spinningState }
          tip={ tip }    
          wrapperClassName={ wrapperClassName }    
          >
         {children}
         </Spin>
    </div>
  );
};

//  是否是容器
CbtaiSpin.isCanvas = false;
      
const CbtaiSpinSettings = () => {
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
                <Form.Item label="延迟显示加载效果的时间（防止闪烁）	">
                    <InputNumber
                        value={ props.delay }
                        onChange={(value) => setProp((props) => (props.delay = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="显示带有 Spin 组件的背景">
                    
                    <Switch
                        checked={ props.fullscreen }
                        onChange={(checked) => setProp((props ) => (props.fullscreen = checked))}
                    />
                </Form.Item>
                <Form.Item label="加载指示符">
                    <Input
                        value={ props.indicator }
                        onChange={(e) => {
                            setProp((props) => (props.indicator = e.target.value));
                            setProp((props) =>  (props.indicator_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                    
                </Form.Item>
                <Form.Item label="展示进度">
                    <Input
                        value={ props.percent }
                        onChange={(e) => setProp((props) => (props.percent = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="组件大小">
                    
                    <Select
                        value={ props.size }
                        onChange={(value) => setProp((props) => (props.size = value))}
                    >
                        {  ["small","default","large",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否为加载中状态">
                    
                    <Switch
                        checked={ props.spinning }
                        onChange={(checked) => setProp((props ) => (props.spinning = checked))}
                    />
                </Form.Item>
                <Form.Item label="当作为包裹元素时，可以自定义描述文案">
                    <Input
                        value={ props.tip }
                        onChange={(e) => setProp((props) => (props.tip = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="包装器的类属性">
                    <Input
                        value={ props.wrapperClassName }
                        onChange={(e) => setProp((props) => (props.wrapperClassName = e.target.value))}
                    />
                    
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiSpin.craft = {
  displayName: "CbtaiSpin",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiSpinSettings,
  },
};

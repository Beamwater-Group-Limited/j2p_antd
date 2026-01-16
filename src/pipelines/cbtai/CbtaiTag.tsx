
// CbtaiTag
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Tag   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_func,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_tableOnRow,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiTag = ({ 
     className,  dataevent,  children,  
    bordered,   
    icon, icon_temp,  
    closeIcon, closeIcon_temp,  
    color,   
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
    const [childrenState, setChildrenState] = useState<any>( "" );
    const changeChildrenState = (newStates:any) => {
        setIsDirty(true)
        setChildrenState(newStates)
    }
    const [iconState, setIconState] = useState<any>( "" );
    const changeIconState = (newStates:any) => {
        setIsDirty(true)
        setIconState(newStates)
    }
    const [colorState, setColorState] = useState<any>( "" );
    const changeColorState = (newStates:any) => {
        setIsDirty(true)
        setColorState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              childrenState:  "" ,
              iconState:  "" ,
              colorState:  "" ,
    });
    //    连接网络
    const {ws, sendStateChange, restoreCbtState } = useWebSocket();
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
      if(cbtState["childrenState"]) { setChildrenState(JSON.parse(cbtState["childrenState"])) }
      if(cbtState["iconState"]) { setIconState(JSON.parse(cbtState["iconState"])) }
      if(cbtState["colorState"]) { setColorState(JSON.parse(cbtState["colorState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","childrenState",childrenState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"childrenState",childrenState);
            setIsDirty(false);
         }
    }, [childrenState]);
    useEffect(() => {
        if(!children) return;
        setChildrenState(children)
    }, [children])
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","iconState",iconState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"iconState",iconState);
            setIsDirty(false);
         }
    }, [iconState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","colorState",colorState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"colorState",colorState);
            setIsDirty(false);
         }
    }, [colorState]);
   
    // 状态属性
    useEffect(() => {
        setIconState( icon )
    },[icon])
    // 状态属性
    useEffect(() => {
        setColorState( color )
    },[color])
    
  return (
        <Tag
        ref={ref => { if (ref) { connect(drag(ref)); }}}
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          bordered={ bordered }    
          icon={ iconState }
          closeIcon={ closeIcon_temp?closeIcon_temp:parse_icon ( closeIcon) }
          color={ colorState }
          >
         {childrenState}
         </Tag>
  );
};

//  是否是容器
CbtaiTag.isCanvas = false;
      
const CbtaiTagSettings = () => {
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
                <Form.Item label="是否有边框">
                    <Switch
                        checked={ props.bordered }
                        onChange={(checked) => setProp((props ) => (props.bordered = checked))}
                    />
                </Form.Item>
                <Form.Item label="设置图标">
                    <Input
                        value={ props.icon }
                        onChange={(e) => {
                            setProp((props) => (props.icon = e.target.value));
                            setProp((props) =>  (props.icon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="自定义关闭按钮">
                    <Input
                        value={ props.closeIcon }
                        onChange={(e) => {
                            setProp((props) => (props.closeIcon = e.target.value));
                            setProp((props) =>  (props.closeIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="标签色">
                    <Input
                        value={ props.color }
                        onChange={(e) => setProp((props) => (props.color = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiTag.craft = {
  displayName: "CbtaiTag",
  props: {
    type:  "primary" ,
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiTagSettings,
  },
};

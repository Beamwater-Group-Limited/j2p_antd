
// CbtaiPopconfirm
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Popconfirm   } from "antd";
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
export const CbtaiPopconfirm = ({ 
     className,  dataevent,  children,  
    title,   
    description,   
    okText,   
    cancelText,   
    showCancel,   
    open,   
    onConfirm, onConfirm_temp,  
    onCancel, onCancel_temp,  
    okButtonProps, okButtonProps_temp,  
    cancelButtonProps, cancelButtonProps_temp,  
    icon, icon_temp,  
    okType,   
    placement,   
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
    const [openState, setOpenState] = useState<any>( "" );
    const changeOpenState = (newStates:any) => {
        setIsDirty(true)
        setOpenState(newStates)
    }
    const [titleState, setTitleState] = useState<any>( "" );
    const changeTitleState = (newStates:any) => {
        setIsDirty(true)
        setTitleState(newStates)
    }
    const [descriptionState, setDescriptionState] = useState<any>( "" );
    const changeDescriptionState = (newStates:any) => {
        setIsDirty(true)
        setDescriptionState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              openState:  "" ,
              titleState:  "" ,
              descriptionState:  "" ,
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
      if(cbtState["openState"]) { setOpenState(JSON.parse(cbtState["openState"])) }
      if(cbtState["titleState"]) { setTitleState(JSON.parse(cbtState["titleState"])) }
      if(cbtState["descriptionState"]) { setDescriptionState(JSON.parse(cbtState["descriptionState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","openState",openState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"openState",openState);
            setIsDirty(false);
         }
    }, [openState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","titleState",titleState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"titleState",titleState);
            setIsDirty(false);
         }
    }, [titleState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","descriptionState",descriptionState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"descriptionState",descriptionState);
            setIsDirty(false);
         }
    }, [descriptionState]);
   
    // 状态属性
    useEffect(() => {
        setTitleState( title )
    },[title])
    // 状态属性
    useEffect(() => {
        setDescriptionState( description )
    },[description])
    // 状态属性
    useEffect(() => {
        setOpenState( open )
    },[open])
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Popconfirm
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          title={ titleState }
          description={ descriptionState }
          okText={ okText }    
          cancelText={ cancelText }    
          showCancel={ showCancel }    
          open={ openState }
          onConfirm={ onConfirm_temp?onConfirm_temp:parse_function ( setOpenState , false , onConfirm) }
          onCancel={ onCancel_temp?onCancel_temp:parse_function ( setOpenState , false , onCancel) }
          okButtonProps={ okButtonProps_temp?okButtonProps_temp:parse_menuProps ( okButtonProps) }
          cancelButtonProps={ cancelButtonProps_temp?cancelButtonProps_temp:parse_menuProps ( cancelButtonProps) }
          icon={ icon_temp?icon_temp:parse_icon ( icon) }
          okType={ okType }    
          placement={ placement }    
          >
         {children}
         </Popconfirm>
    </div>
  );
};

//  是否是容器
CbtaiPopconfirm.isCanvas = true;
      
const CbtaiPopconfirmSettings = () => {
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
                <Form.Item label="确认框标题">
                    <Input
                        value={ props.title }
                        onChange={(e) => setProp((props) => (props.title = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="确认内容的详细描述">
                    <Input
                        value={ props.description }
                        onChange={(e) => setProp((props) => (props.description = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="确认按钮文字">
                    <Input
                        value={ props.okText }
                        onChange={(e) => setProp((props) => (props.okText = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="取消按钮文字">
                    <Input
                        value={ props.cancelText }
                        onChange={(e) => setProp((props) => (props.cancelText = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否显示取消按钮">
                    <Switch
                        checked={ props.showCancel }
                        onChange={(checked) => setProp((props ) => (props.showCancel = checked))}
                    />
                </Form.Item>
                <Form.Item label="气泡确认框是否可见">
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
                <Form.Item label="点击确认的回调">
                </Form.Item>
                <Form.Item label="点击取消的回调">
                </Form.Item>
                <Form.Item label="ok 按钮 props">
                    <DictItemTree
                        value={ props.okButtonProps }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.okButtonProps = dictValue;
                                props.okButtonProps_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="cancel 按钮 props">
                    <DictItemTree
                        value={ props.cancelButtonProps }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.cancelButtonProps = dictValue;
                                props.cancelButtonProps_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="自定义弹出气泡 Icon 图标">
                    <Input
                        value={ props.icon }
                        onChange={(e) => {
                            setProp((props) => (props.icon = e.target.value));
                            setProp((props) =>  (props.icon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="确认按钮类型">
                    <Select
                        value={ props.okType }
                        onChange={(value) => setProp((props) => (props.okType = value))}
                    >
                        {  ["primary","dashed","link","text","default",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="气泡框位置">
                    <Select
                        value={ props.placement }
                        onChange={(value) => setProp((props) => (props.placement = value))}
                    >
                        {  ["top","left","right","bottom","topLeft","topRight","bottomLeft","bottomRight","leftTop","leftBottom","rightTop","rightBottom",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiPopconfirm.craft = {
  displayName: "CbtaiPopconfirm",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiPopconfirmSettings,
  },
};

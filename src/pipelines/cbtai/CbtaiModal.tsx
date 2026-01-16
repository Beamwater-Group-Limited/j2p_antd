
// CbtaiModal
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Modal   } from "antd";
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
export const CbtaiModal = ({ 
     className,  dataevent,  children,  
    title,   
    width,   
    mask,   
    centered,   
    onOk, onOk_temp,  
    onCancel, onCancel_temp,  
    okText,   
    cancelText,   
    cancelButtonProps, cancelButtonProps_temp,  
    okButtonProps, okButtonProps_temp,  
    closable,   
    maskClosable,   
    keyboard,   
    open,   
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
    const [openState, setOpenState] = useState<any>( false );
    const changeOpenState = (newStates:any) => {
        setIsDirty(true)
        setOpenState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              openState:  false ,
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
   
    // 状态属性
    useEffect(() => {
        setOpenState( open )
    },[open])
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Modal
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          title={ title }    
          width={ width }    
          mask={ mask }    
          centered={ centered }    
          onOk={ onOk_temp?onOk_temp:parse_function ( setOpenState  , false , onOk) }
          onCancel={ onCancel_temp?onCancel_temp:parse_function ( setOpenState , false , onCancel) }
          okText={ okText }    
          cancelText={ cancelText }    
          cancelButtonProps={ cancelButtonProps_temp?cancelButtonProps_temp:parse_menuProps ( cancelButtonProps) }
          okButtonProps={ okButtonProps_temp?okButtonProps_temp:parse_menuProps ( okButtonProps) }
          closable={ closable }    
          maskClosable={ maskClosable }    
          keyboard={ keyboard }    
          open={ openState }
          >
         {children}
         </Modal>
    </div>
  );
};

//  是否是容器
CbtaiModal.isCanvas = true;
      
const CbtaiModalSettings = () => {
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
                <Form.Item label="标题">
                    <Input
                        value={ props.title }
                        onChange={(e) => setProp((props) => (props.title = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="宽度">
                    <InputNumber
                        value={ props.width }
                        onChange={(value) => setProp((props) => (props.width = value))}
                    />
                </Form.Item>
                <Form.Item label="是否遮罩">
                    <Switch
                        checked={ props.mask }
                        onChange={(checked) => setProp((props ) => (props.mask = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否垂直居中展示Modal">
                    <Switch
                        checked={ props.centered }
                        onChange={(checked) => setProp((props ) => (props.centered = checked))}
                    />
                </Form.Item>
                <Form.Item label="点击确定回调">
                </Form.Item>
                <Form.Item label="点击取消回调">
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
                <Form.Item label="是否显示右上角的关闭按钮">
                    <Switch
                        checked={ props.closable }
                        onChange={(checked) => setProp((props ) => (props.closable = checked))}
                    />
                </Form.Item>
                <Form.Item label="点击蒙层是否允许关闭">
                    <Switch
                        checked={ props.maskClosable }
                        onChange={(checked) => setProp((props ) => (props.maskClosable = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否支持键盘 esc 关闭">
                    <Switch
                        checked={ props.keyboard }
                        onChange={(checked) => setProp((props ) => (props.keyboard = checked))}
                    />
                </Form.Item>
                <Form.Item label="对话框是否可见">
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiModal.craft = {
  displayName: "CbtaiModal",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiModalSettings,
  },
};

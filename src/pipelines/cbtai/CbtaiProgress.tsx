
// CbtaiProgress
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Progress   } from "antd";
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
export const CbtaiProgress = ({ 
     className,  dataevent,  children,  
    percent,   
    showInfo,   
    status,   
    strokeLinecap,   
    type,   
    success, success_temp,  
    percentPosition, percentPosition_temp,  
    strokeColor,   
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
    const [statusState, setStatusState] = useState<any>( "" );
    const changeStatusState = (newStates:any) => {
        setIsDirty(true)
        setStatusState(newStates)
    }
    const [percentState, setPercentState] = useState<any>( "" );
    const changePercentState = (newStates:any) => {
        setIsDirty(true)
        setPercentState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              statusState:  "" ,
              percentState:  "" ,
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
      if(cbtState["statusState"]) { setStatusState(JSON.parse(cbtState["statusState"])) }
      if(cbtState["percentState"]) { setPercentState(JSON.parse(cbtState["percentState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","statusState",statusState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"statusState",statusState);
            setIsDirty(false);
         }
    }, [statusState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","percentState",percentState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"percentState",percentState);
            setIsDirty(false);
         }
    }, [percentState]);
   
    // 状态属性
    useEffect(() => {
        setPercentState( percent )
    },[percent])
    // 状态属性
    useEffect(() => {
        setStatusState( status )
    },[status])
    
  return (
        <Progress
        ref={ref => { if (ref) { connect(drag(ref)); }}}
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          percent={ percentState }
          showInfo={ showInfo }    
          status={ statusState }
          strokeLinecap={ strokeLinecap }    
          type={ type }    
          success={ success_temp?success_temp:parse_menuProps ( success) }
          percentPosition={ percentPosition_temp?percentPosition_temp:parse_menuProps ( percentPosition) }
          strokeColor={ strokeColor }    
          >
         {children}
         </Progress>
  );
};

//  是否是容器
CbtaiProgress.isCanvas = false;
      
const CbtaiProgressSettings = () => {
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
                <Form.Item label="百分比">
                    <InputNumber
                        value={ props.percent }
                        onChange={(value) => setProp((props) => (props.percent = value))}
                    />
                </Form.Item>
                <Form.Item label="是否显示进度数值或状态图标">
                    <Switch
                        checked={ props.showInfo }
                        onChange={(checked) => setProp((props ) => (props.showInfo = checked))}
                    />
                </Form.Item>
                <Form.Item label="状态">
                    <Radio.Group
                        value={ props.status }
                        onChange={(e) => setProp((props) => (props.status = e.target.value))}
                    >
                        { [].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="进度条的样式">
                    <Radio.Group
                        value={ props.strokeLinecap }
                        onChange={(e) => setProp((props) => (props.strokeLinecap = e.target.value))}
                    >
                        { ["round","butt","square",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="进度条类型">
                    <Radio.Group
                        value={ props.type }
                        onChange={(e) => setProp((props) => (props.type = e.target.value))}
                    >
                        { ["line","circle","dashboard",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="成功进度条相关配置">
                    <DictItemTree
                        value={ props.success }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.success = dictValue;
                                props.success_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="进度数值位置">
                    <DictItemTree
                        value={ props.percentPosition }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.percentPosition = dictValue;
                                props.percentPosition_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="进度条的色彩">
                    <Input
                        value={ props.strokeColor }
                        onChange={(e) => setProp((props) => (props.strokeColor = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiProgress.craft = {
  displayName: "CbtaiProgress",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiProgressSettings,
  },
};


// CbtaiSteps
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Steps   } from "antd";
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
export const CbtaiSteps = ({ 
     className,  dataevent,  children,  
    current,   
    direction,   
    initial,   
    labelPlacement,   
    percent,   
    responsive,   
    size,   
    status,   
    type,   
    items, items_temp,  
    onChange,  onChange_func, 
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
    const [currentState, setCurrentState] = useState<any>( "" );
    const changeCurrentState = (newStates:any) => {
        setIsDirty(true)
        setCurrentState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              currentState:  "" ,
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
      if(cbtState["currentState"]) { setCurrentState(JSON.parse(cbtState["currentState"])) }
    }, [cbtState]);

    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","currentState",currentState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"currentState",currentState);
            setIsDirty(false);
         }
    }, [currentState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   }
    
    // 状态属性
    useEffect(() => {
        setCurrentState( current )
    },[current])
   
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Steps
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          current={ currentState }
          direction={ direction }    
          initial={ initial }    
          labelPlacement={ labelPlacement }    
          percent={ percent }    
          responsive={ responsive }    
          size={ size }    
          status={ status }    
          type={ type }    
          items={ items_temp?items_temp:parse_menuItems ( items) }
          onChange={ onChange_func?onChange_func:parse_func(  "CbtaiSteps.onChange",  parseParams, onChange) }
          >
         {children}
         </Steps>
    </div>
  );
};

//  是否是容器
CbtaiSteps.isCanvas = false;
      
const CbtaiStepsSettings = () => {
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
                <Form.Item label="指定当前步骤，从 0 开始记数">
                    <InputNumber
                        value={ props.current }
                        onChange={(value) => setProp((props) => (props.current = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="指定步骤条方向">
                    <Radio.Group
                        value={ props.direction }
                        onChange={(e) => setProp((props) => (props.direction = e.target.value))}
                    >
                        { ["horizontal","vertical",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    
                </Form.Item>
                <Form.Item label="起始序号，从 0 开始记数">
                    <InputNumber
                        value={ props.initial }
                        onChange={(value) => setProp((props) => (props.initial = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="指定标签放置位置">
                    <Radio.Group
                        value={ props.labelPlacement }
                        onChange={(e) => setProp((props) => (props.labelPlacement = e.target.value))}
                    >
                        { ["horizontal","vertical",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    
                </Form.Item>
                <Form.Item label="当前 process 步骤显示的进度条进度（只对基本类型的 Steps 生效）">
                    <InputNumber
                        value={ props.percent }
                        onChange={(value) => setProp((props) => (props.percent = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="当屏幕宽度小于 532px 时自动变为垂直模式">
                    
                    <Switch
                        checked={ props.responsive }
                        onChange={(checked) => setProp((props ) => (props.responsive = checked))}
                    />
                </Form.Item>
                <Form.Item label="指定大小">
                    <Radio.Group
                        value={ props.size }
                        onChange={(e) => setProp((props) => (props.size = e.target.value))}
                    >
                        { ["default","small",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    
                </Form.Item>
                <Form.Item label="指定当前步骤的状态">
                    <Radio.Group
                        value={ props.status }
                        onChange={(e) => setProp((props) => (props.status = e.target.value))}
                    >
                        { ["wait","process","finish","error",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    
                </Form.Item>
                <Form.Item label="步骤条类型">
                    <Radio.Group
                        value={ props.type }
                        onChange={(e) => setProp((props) => (props.type = e.target.value))}
                    >
                        { ["default","navigation","inline",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    
                </Form.Item>
                <Form.Item label="配置选项卡内容">
                    
                    <DictItemTree
                        value={ props.items }
                        defaultProp={  []  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.items = dictValue;
                                props.items_temp = parse_menuItems(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="点击切换步骤时触发">
                    
                    <DoubleInput
                        value={ props.onChange }
                        onChange={(value) => {
                            setProp((props) => (props.onChange = value));
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
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiSteps.craft = {
  displayName: "CbtaiSteps",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiStepsSettings,
  },
};

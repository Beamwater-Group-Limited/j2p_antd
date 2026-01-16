
// CbtaiCollapse
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Collapse   } from "antd";
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
export const CbtaiCollapse = ({ 
     className,  dataevent,  children,  
    accordion,   
    activeKey,   
    bordered,   
    expandIcon, expandIcon_temp,  
    expandIconPosition,   
    ghost,   
    size,   
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
    const [activeKeyState, setActiveKeyState] = useState<any>( "" );
    const changeActiveKeyState = (newStates:any) => {
        setIsDirty(true)
        setActiveKeyState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              activeKeyState:  "" ,
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
      if(cbtState["activeKeyState"]) { setActiveKeyState(JSON.parse(cbtState["activeKeyState"])) }
    }, [cbtState]);

    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","activeKeyState",activeKeyState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"activeKeyState",activeKeyState);
            setIsDirty(false);
         }
    }, [activeKeyState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   }
    
    // 状态属性
    useEffect(() => {
        setActiveKeyState( activeKey )
    },[activeKey])
   
  return (
        <Collapse
        ref={ref => { if (ref) { connect(drag(ref)); }}}
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          accordion={ accordion }    
          activeKey={ activeKeyState }
          bordered={ bordered }    
          expandIcon={ expandIcon_temp?expandIcon_temp:parse_icon ( expandIcon) }
          expandIconPosition={ expandIconPosition }    
          ghost={ ghost }    
          size={ size }    
          items={ items_temp?items_temp:parse_menuItems ( items) }
          onChange={ onChange_func?onChange_func:parse_func(  "CbtaiCollapse.onChange",  parseParams, onChange) }
          >
         {children}
         </Collapse>
  );
};

//  是否是容器
CbtaiCollapse.isCanvas = true;
      
const CbtaiCollapseSettings = () => {
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
                <Form.Item label="手风琴模式">
                    
                    <Switch
                        checked={ props.accordion }
                        onChange={(checked) => setProp((props ) => (props.accordion = checked))}
                    />
                </Form.Item>
                <Form.Item label="当前激活 tab 面板的 key">
                    <Input
                        value={ props.activeKey }
                        onChange={(e) => setProp((props) => (props.activeKey = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="带边框风格的折叠面板">
                    
                    <Switch
                        checked={ props.bordered }
                        onChange={(checked) => setProp((props ) => (props.bordered = checked))}
                    />
                </Form.Item>
                <Form.Item label="自定义切换图标">
                    <Input
                        value={ props.expandIcon }
                        onChange={(e) => {
                            setProp((props) => (props.expandIcon = e.target.value));
                            setProp((props) =>  (props.expandIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                    
                </Form.Item>
                <Form.Item label="设置图标位置">
                    
                    <Select
                        value={ props.expandIconPosition }
                        onChange={(value) => setProp((props) => (props.expandIconPosition = value))}
                    >
                        {  ["start","end",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="使折叠面板透明且无边框">
                    
                    <Switch
                        checked={ props.ghost }
                        onChange={(checked) => setProp((props ) => (props.ghost = checked))}
                    />
                </Form.Item>
                <Form.Item label="设置折叠面板大小">
                    
                    <Select
                        value={ props.size }
                        onChange={(value) => setProp((props) => (props.size = value))}
                    >
                        {  ["large","middle","small",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="折叠项目内容">
                    
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
                <Form.Item label="切换面板的回调">
                    
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
CbtaiCollapse.craft = {
  displayName: "CbtaiCollapse",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiCollapseSettings,
  },
};

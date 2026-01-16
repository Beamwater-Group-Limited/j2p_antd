
// CbtaiCheckbox
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_func,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_tableOnRow,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function,    parse_pageChange,    parse_fileChange,    parse_filePreview   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiCheckbox = ({ 
     className,  dataevent,  children,  
    disabled,   
    onChange, onChange_temp,  
    autoFocus,   
    checked,   
    defaultChecked,   
    indeterminate,   
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
    const [checkedState, setCheckedState] = useState<any>( false );
    const changeCheckedState = (newStates:any) => {
        setIsDirty(true)
        setCheckedState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              checkedState:  false ,
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
      if(cbtState["checkedState"]) { setCheckedState(JSON.parse(cbtState["checkedState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","checkedState",checkedState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"checkedState",checkedState);
            setIsDirty(false);
         }
    }, [checkedState]);
   
    // 状态属性
    useEffect(() => {
        setCheckedState( checked )
    },[checked])
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Checkbox
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabled }    
          onChange={ onChange_temp?onChange_temp:parse_eventTargetChecked ( changeCheckedState , onChange) }
          autoFocus={ autoFocus }    
          checked={ checkedState }
          defaultChecked={ defaultChecked }    
          indeterminate={ indeterminate }    
          >
         {children}
         </Checkbox>
    </div>
  );
};

//  是否是容器
CbtaiCheckbox.isCanvas = false;
      
const CbtaiCheckboxSettings = () => {
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
                <Form.Item label="失效状态">
                    <Switch
                        checked={ props.disabled }
                        onChange={(checked) => setProp((props ) => (props.disabled = checked))}
                    />
                </Form.Item>
                <Form.Item label="变化时的回调函数">
                </Form.Item>
                <Form.Item label="自动获取焦点">
                    <Switch
                        checked={ props.autoFocus }
                        onChange={(checked) => setProp((props ) => (props.autoFocus = checked))}
                    />
                </Form.Item>
                <Form.Item label="指定当前是否选中">
                    <Switch
                        checked={ props.checked }
                        onChange={(checked) => setProp((props ) => (props.checked = checked))}
                    />
                </Form.Item>
                <Form.Item label="初始是否选中">
                    <Switch
                        checked={ props.defaultChecked }
                        onChange={(checked) => setProp((props ) => (props.defaultChecked = checked))}
                    />
                </Form.Item>
                <Form.Item label="设置 indeterminate 状态，只负责样式控制">
                    <Switch
                        checked={ props.indeterminate }
                        onChange={(checked) => setProp((props ) => (props.indeterminate = checked))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiCheckbox.craft = {
  displayName: "CbtaiCheckbox",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiCheckboxSettings,
  },
};

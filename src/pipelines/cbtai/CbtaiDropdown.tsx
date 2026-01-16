
// CbtaiDropdown
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Dropdown   } from "antd";
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
export const CbtaiDropdown = ({ 
     className,  dataevent,  children,  
    arrow,   
    autoAdjustOverflow,   
    autoFocus,   
    disabled,   
    destroyPopupOnHide,   
    dropdownRender,   
    placement,   
    open,   
    menu, menu_temp,  
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
    const [dropdownRenderState, setDropdownRenderState] = useState<any>( "" );
    const changeDropdownRenderState = (newStates:any) => {
        setIsDirty(true)
        setDropdownRenderState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              dropdownRenderState:  "" ,
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
      if(cbtState["dropdownRenderState"]) { setDropdownRenderState(JSON.parse(cbtState["dropdownRenderState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","dropdownRenderState",dropdownRenderState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"dropdownRenderState",dropdownRenderState);
            setIsDirty(false);
         }
    }, [dropdownRenderState]);
   
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Dropdown
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          arrow={ arrow }    
          autoAdjustOverflow={ autoAdjustOverflow }    
          autoFocus={ autoFocus }    
          disabled={ disabled }    
          destroyPopupOnHide={ destroyPopupOnHide }    
          dropdownRender={ dropdownRender }    
          placement={ placement }    
          open={ open }    
          menu={ menu_temp?menu_temp:parse_menuProps ( menu) }
          >
         {children}
         </Dropdown>
    </div>
  );
};

//  是否是容器
CbtaiDropdown.isCanvas = false;
      
const CbtaiDropdownSettings = () => {
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
                <Form.Item label="下拉箭头是否显示">
                    <Switch
                        checked={ props.arrow }
                        onChange={(checked) => setProp((props ) => (props.arrow = checked))}
                    />
                </Form.Item>
                <Form.Item label="下拉框被遮挡时是否自动调整位置">
                    <Switch
                        checked={ props.autoAdjustOverflow }
                        onChange={(checked) => setProp((props ) => (props.autoAdjustOverflow = checked))}
                    />
                </Form.Item>
                <Form.Item label="打开后是否自动聚焦下拉框">
                    <Switch
                        checked={ props.autoFocus }
                        onChange={(checked) => setProp((props ) => (props.autoFocus = checked))}
                    />
                </Form.Item>
                <Form.Item label="菜单是否禁用">
                    <Switch
                        checked={ props.disabled }
                        onChange={(checked) => setProp((props ) => (props.disabled = checked))}
                    />
                </Form.Item>
                <Form.Item label="关闭后是否销毁Dropdown">
                    <Switch
                        checked={ props.destroyPopupOnHide }
                        onChange={(checked) => setProp((props ) => (props.destroyPopupOnHide = checked))}
                    />
                </Form.Item>
                <Form.Item label="自定义下拉框内容">
                    <Typography.Text type="success">初始值:{ JSON.stringify(props.dropdownRender) }</Typography.Text>
                </Form.Item>
                <Form.Item label="菜单弹出位置">
                    <Select
                        value={ props.placement }
                        onChange={(value) => setProp((props) => (props.placement = value))}
                    >
                        {  ["bottom","bottomLeft","bttomRight","top","topLeft","topRight",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="菜单是否显示">
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
                <Form.Item label="菜单配置项">
                    <DictItemTree
                        value={ props.menu }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.menu = dictValue;
                                props.menu_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiDropdown.craft = {
  displayName: "CbtaiDropdown",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiDropdownSettings,
  },
};

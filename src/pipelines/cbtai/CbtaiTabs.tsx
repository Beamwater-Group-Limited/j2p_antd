
// CbtaiTabs
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Tabs   } from "antd";
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
export const CbtaiTabs = ({ 
     className,  dataevent,  children,  
    activeKey,   
    addIcon, addIcon_temp,  
    animated,   
    centered,   
    defaultActiveKey,   
    items, items_temp,  
    size,   
    tabBarGutter,   
    tabPosition,   
    type,   
    hideAdd,   
    removeIcon, removeIcon_temp,  
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
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
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
    }, [cbtState]);

    //动态生成发送状态变化 
   
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Tabs
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          activeKey={ activeKey }    
          addIcon={ addIcon_temp?addIcon_temp:parse_icon ( addIcon) }
          animated={ animated }    
          centered={ centered }    
          defaultActiveKey={ defaultActiveKey }    
          items={ items_temp?items_temp:parse_menuItems ( items) }
          size={ size }    
          tabBarGutter={ tabBarGutter }    
          tabPosition={ tabPosition }    
          type={ type }    
          hideAdd={ hideAdd }    
          removeIcon={ removeIcon_temp?removeIcon_temp:parse_icon ( removeIcon) }
         />
    </div>
  );
};

//  是否是容器
CbtaiTabs.isCanvas = false;
      
const CbtaiTabsSettings = () => {
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
                <Form.Item label="当前激活 tab 面板的 key">
                    <Input
                        value={ props.activeKey }
                        onChange={(e) => setProp((props) => (props.activeKey = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="自定义添加按钮">
                    <Input
                        value={ props.addIcon }
                        onChange={(e) => {
                            setProp((props) => (props.addIcon = e.target.value));
                            setProp((props) =>  (props.addIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="是否使用动画切换 Tabs">
                    <Switch
                        checked={ props.animated }
                        onChange={(checked) => setProp((props ) => (props.animated = checked))}
                    />
                </Form.Item>
                <Form.Item label="标签居中展示">
                    <Switch
                        checked={ props.centered }
                        onChange={(checked) => setProp((props ) => (props.centered = checked))}
                    />
                </Form.Item>
                <Form.Item label="初始化选中面板的 key，如果没有设置 activeKey">
                    <Input
                        value={ props.defaultActiveKey }
                        onChange={(e) => setProp((props) => (props.defaultActiveKey = e.target.value))}
                    />
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
                <Form.Item label="大小">
                    <Radio.Group
                        value={ props.size }
                        onChange={(e) => setProp((props) => (props.size = e.target.value))}
                    >
                        { ["large","middle","small",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="tabs 之间的间隙">
                    <InputNumber
                        value={ props.tabBarGutter }
                        onChange={(value) => setProp((props) => (props.tabBarGutter = value))}
                    />
                </Form.Item>
                <Form.Item label="页签位置">
                    <Radio.Group
                        value={ props.tabPosition }
                        onChange={(e) => setProp((props) => (props.tabPosition = e.target.value))}
                    >
                        { ["top","right","bottom","left",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="页签的基本样式">
                    <Radio.Group
                        value={ props.type }
                        onChange={(e) => setProp((props) => (props.type = e.target.value))}
                    >
                        { ["line","card","editable-card",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="是否隐藏加号图标，在type为editable-card时有效">
                    <Switch
                        checked={ props.hideAdd }
                        onChange={(checked) => setProp((props ) => (props.hideAdd = checked))}
                    />
                </Form.Item>
                <Form.Item label="自定义删除按钮，设置type为editable-card时有效">
                    <Input
                        value={ props.removeIcon }
                        onChange={(e) => {
                            setProp((props) => (props.removeIcon = e.target.value));
                            setProp((props) =>  (props.removeIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiTabs.craft = {
  displayName: "CbtaiTabs",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiTabsSettings,
  },
};

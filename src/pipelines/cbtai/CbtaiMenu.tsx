
// CbtaiMenu
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Menu   } from "antd";
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
export const CbtaiMenu = ({ 
     className,  dataevent,  children,  
    defaultSelectedKeys,   
    theme,   
    mode,   
    onClick, onClick_temp,  
    items, items_temp,  
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
        <Menu
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          defaultSelectedKeys={ defaultSelectedKeys }    
          theme={ theme }    
          mode={ mode }    
          onClick={ onClick_temp?onClick_temp:parse_menuOnClick ( navigate , workMode , onClick) }
          items={ items_temp?items_temp:parse_menuItems ( items) }
         />
    </div>
  );
};

//  是否是容器
CbtaiMenu.isCanvas = false;
      
const CbtaiMenuSettings = () => {
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
                <Form.Item label="初始选中的菜单项key数组">
                    <Input
                        value={ props.defaultSelectedKeys }
                        onChange={(e) => setProp((props) => (props.defaultSelectedKeys = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="主题颜色为深色">
                    <Radio.Group
                        value={ props.theme }
                        onChange={(e) => setProp((props) => (props.theme = e.target.value))}
                    >
                        { ["light","dark",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="菜单类型">
                    <Radio.Group
                        value={ props.mode }
                        onChange={(e) => setProp((props) => (props.mode = e.target.value))}
                    >
                        { ["vertical","horizontal","inline",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="点击 MenuItem 调用此函数">
                </Form.Item>
                <Form.Item label="菜单内容">
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
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiMenu.craft = {
  displayName: "CbtaiMenu",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiMenuSettings,
  },
};

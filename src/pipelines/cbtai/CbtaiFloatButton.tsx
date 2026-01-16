
// CbtaiFloatButton
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    FloatButton   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_dayjs,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree   } from "@/ide";
import {   useCraftJS   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiFloatButton = ({ 
     className,  dataevent,  children,  
    description, 
        type, 
        shape, 
        badge,  badge_temp, 
      }) => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    // 动态生成的拖拽节点相关
    const {id:nodeID, connectors: { connect, drag } } = useNode();
    const {deleteCurrentNodeChildren,craftJsonToJSX} = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const ownerID = projectConfig.owner_id;
    const {pageData} = usePagesData()
    // 判断是否为脏数据
    const [isDirty, setIsDirty] = useState<boolean>(false);
    // 动态生成的状态
    const [descriptionState, setDescriptionState] = useState<any>( "" );
    const changeDescriptionState = (newStates:any) => {
        setIsDirty(true)
        setDescriptionState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
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
        return () => {
            subscription.unsubscribe(); // 组件卸载时取消订阅
        };
    }, []);
    useEffect(() => {
        if (ws.readyState === WebSocket.OPEN && pageData.nodesStated.includes(nodeID)){
            restoreCbtState(nodeID,cbtState)
        }
    }, [ws.readyState]);
    // 根据总状态更新单个状态
    useEffect(() => {
      if(cbtState["descriptionState"]) { setDescriptionState(JSON.parse(cbtState["descriptionState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","descriptionState",descriptionState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"descriptionState",descriptionState);
            setIsDirty(false);
         }
    }, [descriptionState]);
   
    
  return (
        <FloatButton
        ref={ref => { if (ref) { connect(drag(ref)); }}}
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          description={ description }    
          type={ type }    
          shape={ shape }    
          badge={ badge_temp?badge_temp:parse_menuProps ( badge) }
          >
         {children}
         </FloatButton>
  );
};

//  是否是容器
CbtaiFloatButton.isCanvas = false;
      
const CbtaiFloatButtonSettings = () => {
    const { actions:{setProp}, props} = useNode((node) =>({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol={{ span:24 }} wrapperCol={{ span:24 }}>
                <Form.Item label="children">
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
                <Form.Item label="悬浮按钮中的文字">
                    <Typography.Text type="success">初始值:{ JSON.stringify(props.description) }</Typography.Text>
                </Form.Item>
                <Form.Item label="按钮类型">
                    <Select
                        value={ props.type }
                        onChange={(value) => setProp((props) => (props.type = value))}
                    >
                        {  ["default","primary",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="按钮形状">
                    <Select
                        value={ props.shape }
                        onChange={(value) => setProp((props) => (props.shape = value))}
                    >
                        {  ["circle","square",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="带徽标数字的悬浮按钮">
                    <DictItemTree
                        value={ props.badge }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.badge = dictValue;
                                props.badge_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiFloatButton.craft = {
  displayName: "CbtaiFloatButton",
  props: {
    type:  "primary" ,
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiFloatButtonSettings,
  },
};

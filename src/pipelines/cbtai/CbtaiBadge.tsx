
// CbtaiBadge
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Badge   } from "antd";
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
export const CbtaiBadge = ({ 
     className,  dataevent,  children,  
    color,   
    count,   
    classNames,   
    dot,   
    offset,   
    overflowCount,   
    showZero,   
    size,   
    status,   
    styles,   
    text,   
    title,   
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
        <Badge
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          color={ color }    
          count={ count }    
          classNames={ classNames }    
          dot={ dot }    
          offset={ offset }    
          overflowCount={ overflowCount }    
          showZero={ showZero }    
          size={ size }    
          status={ status }    
          styles={ styles }    
          text={ text }    
          title={ title }    
          >
         {children}
         </Badge>
    </div>
  );
};

//  是否是容器
CbtaiBadge.isCanvas = true;
      
const CbtaiBadgeSettings = () => {
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
                <Form.Item label="小圆点的颜色">
                    <Input
                        value={ props.color }
                        onChange={(e) => setProp((props) => (props.color = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="展示的数字">
                    <Input
                        value={ props.count }
                        onChange={(e) => setProp((props) => (props.count = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="语义化结构class">
                    <Input
                        value={ props.classNames }
                        onChange={(e) => setProp((props) => (props.classNames = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否不展示数字，只展示一个小红点">
                    <Switch
                        checked={ props.dot }
                        onChange={(checked) => setProp((props ) => (props.dot = checked))}
                    />
                </Form.Item>
                <Form.Item label="状态点的位置偏移">
                    <Input
                        value={ props.offset }
                        onChange={(e) => setProp((props) => (props.offset = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="封顶的数字值">
                    <Input
                        value={ props.overflowCount }
                        onChange={(e) => setProp((props) => (props.overflowCount = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="数值为0时是否展示Badge">
                    <Switch
                        checked={ props.showZero }
                        onChange={(checked) => setProp((props ) => (props.showZero = checked))}
                    />
                </Form.Item>
                <Form.Item label="小圆点大小">
                    <Select
                        value={ props.size }
                        onChange={(value) => setProp((props) => (props.size = value))}
                    >
                        {  ["default","small",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="Badge状态">
                    <Select
                        value={ props.status }
                        onChange={(value) => setProp((props) => (props.status = value))}
                    >
                        {  ["success","processing","default","error","warning",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="语义化结构style">
                    <Input
                        value={ props.styles }
                        onChange={(e) => setProp((props) => (props.styles = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="状态点的文本">
                    <Input
                        value={ props.text }
                        onChange={(e) => setProp((props) => (props.text = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="鼠标放在状态点上时显示的文字">
                    <Input
                        value={ props.title }
                        onChange={(e) => setProp((props) => (props.title = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiBadge.craft = {
  displayName: "CbtaiBadge",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiBadgeSettings,
  },
};

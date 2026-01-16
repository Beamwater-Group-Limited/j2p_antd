 // XCbtaiWelcome
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    message,    Button,    Space,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker   } from "antd";
import {   useEffect,    useState,    useRef   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   Welcome   } from "@ant-design/x";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    jsonErrorWithLineCol,    parse_func   } from "@/tools";
import {   useAppConfig,    useProject,    useWebSocket,    usePagesData,    useXAgentContext   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const XCbtaiWelcome = ({ 
     className,  dataevent,  children,  data,  
    title, 
        icon,  icon_temp, 
        description, 
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
    const { parse_XAgentContext } = useXAgentContext();
    // 判断是否为脏数据
    const [isDirty, setIsDirty] = useState<boolean>( false );
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
        return () => {
            subscription.unsubscribe(); // 组件卸载时取消订阅
        };
    }, []);
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
        <Welcome
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          title={ title }    
          icon={ icon_temp?icon_temp:parse_icon ( icon ) }
          description={ description }    
         />
    </div>
  );
};

//  是否是容器
XCbtaiWelcome.isCanvas = false;
      
const XCbtaiWelcomeSettings = () => {
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
                <Form.Item label="显示在提示列表顶部的标题。">
                    <Input
                        value={ props.title }
                        onChange={(e) => setProp((props) => (props.title = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="显示在提示列表前侧的图标。">
                    <Input
                        value={ props.icon }
                        onChange={(e) => {
                            setProp((props) => (props.icon = e.target.value));
                            setProp((props) =>  (props.icon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="显示在提示列表中的描述。">
                    <Input
                        value={ props.description }
                        onChange={(e) => setProp((props) => (props.description = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};
                        
// 组件配置和默认属性
XCbtaiWelcome.craft = {
   displayName: "XCbtaiWelcome",
   props: {
     disabled:  false ,
   },
    rules: {
        canDrop: (targetNode: Node, currentNode: Node) => {
            return targetNode["data"]["displayName"] === "XAgentProvider"
        }
    },
   related: {
    settings: XCbtaiWelcomeSettings,
   },
};

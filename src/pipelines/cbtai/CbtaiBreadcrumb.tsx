
// CbtaiBreadcrumb
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Breadcrumb   } from "antd";
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
export const CbtaiBreadcrumb = ({ 
     className,  dataevent,  children,  
    items,  items_temp, 
        params,  params_temp, 
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
        if (ws.readyState === WebSocket.OPEN && pageData.nodesStated.includes(nodeID)){
            restoreCbtState(nodeID,cbtState)
        }
    }, [ws.readyState]);
    // 根据总状态更新单个状态
    useEffect(() => {
    }, [cbtState]);

    //动态生成发送状态变化 
   
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Breadcrumb
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          items={ items_temp?items_temp:parse_menuItems ( items) }
          params={ params_temp?params_temp:parse_menuProps ( params) }
         />
    </div>
  );
};

//  是否是容器
CbtaiBreadcrumb.isCanvas = false;
      
const CbtaiBreadcrumbSettings = () => {
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
                <Form.Item label="路由栈信息">
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
                <Form.Item label="路由的参数">
                    <DictItemTree
                        value={ props.params }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.params = dictValue;
                                props.params_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiBreadcrumb.craft = {
  displayName: "CbtaiBreadcrumb",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiBreadcrumbSettings,
  },
};

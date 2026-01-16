
// Cbtaidiv
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_eventTargetValue,    parse_info,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject   } from "@/context";
import {   DictItemTree  } from "@/ide";
import {   useCraftJS } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const Cbtaidiv = ({
     className,  dataevent,  children,
  }) => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    // 动态生成的拖拽节点相关
    const {id:nodeID, connectors: { connect, drag } } = useNode();
    const {deleteCurrentNodeChildren,craftJsonToJSX} = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const ownerID = projectConfig.owner_id;
    // 判断是否为脏数据
    const [isDirty, setIsDirty] = useState<boolean>(false);
    // 动态生成的状态
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
    });
    //    连接网络
    const { sendStateChange, restoreCbtState } = useWebSocket();
    // 注册总状态改变事件
    useEffect(() => {
        const subscription = EventService.subscribe(nodeID, (data) => {
            // console.log("📌 收到事件:",nodeID, data.payload);
            setCbtState(data);
        });
        restoreCbtState(nodeID,cbtState)
        return () => {
            subscription.unsubscribe(); // 组件卸载时取消订阅
        };
    }, []);
    // 根据总状态更新单个状态
    useEffect(() => {
    }, [cbtState]);

    //动态生成发送状态变化


  return (
        <div
        ref={ref => { if (ref) { connect(drag(ref)); }}}
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          >
         {children}
         </div>
  );
};

//  是否是容器
Cbtaidiv.isCanvas = true;

const CbtaidivSettings = () => {
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
            </Form>
        </div>
    )
};

// 组件配置和默认属性
Cbtaidiv.craft = {
  displayName: "Cbtaidiv",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaidivSettings,
  },
};

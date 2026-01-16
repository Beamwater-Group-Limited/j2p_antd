
// CbtaiDropdownButton
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    Dropdown   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_eventTargetValue,    parse_info,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject   } from "@/context";
import {   DictItemTree  } from "@/ide";
import {   useCraftJS } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
const { Button } = Dropdown
// 动态生成的基础组件
export const CbtaiDropdownButton = ({
     className,  dataevent,  children,
    danger,
        type,
        arrow,
        autoAdjustOverflow,
        menu,  menu_temp,
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
    const [menuState, setMenuState] = useState<any>( "" );
    const changeMenuState = (newStates:any) => {
        setIsDirty(true)
        setMenuState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              menuState:  "" ,
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
      if(cbtState["menuState"]) { setMenuState(JSON.parse(cbtState["menuState"])) }
    }, [cbtState]);

    //动态生成发送状态变化
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","menuState",menuState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"menuState",menuState);
            setIsDirty(false);
         }
    }, [menuState]);

    // 状态属性
    useEffect(() => {
        setMenuState( menu )
    },[menu])

  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Button
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          danger={ danger }
          type={ type }
          arrow={ arrow }
          autoAdjustOverflow={ autoAdjustOverflow }
          menu={ menuState }
          >
         {children}
         </Button>
    </div>
  );
};

//  是否是容器
CbtaiDropdownButton.isCanvas = false;

const CbtaiDropdownButtonSettings = () => {
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
                <Form.Item label="是否设为危险按钮">
                    <Switch
                        checked={ props.danger }
                        onChange={(checked) => setProp((props ) => (props.danger = checked))}
                    />
                </Form.Item>
                <Form.Item label="按钮类型">
                    <Select
                        value={ props.type }
                        onChange={(value) => setProp((props) => (props.type = value))}
                    >
                        {  ["default","primary","dashed","link","text",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="下拉框箭头是否显示">
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
CbtaiDropdownButton.craft = {
  displayName: "CbtaiDropdownButton",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiDropdownButtonSettings,
  },
};


// CbtaiTypographyText
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_eventTargetValue,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject   } from "@/context";
import {   DictItemTree  } from "@/ide";
import {   useCraftJS } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
const { Text } = Typography
// 动态生成的基础组件
export const CbtaiTypographyText = ({
     className,  dataevent,  children,
    code,
        copyable,
        disabled,
        editable,
        ellipsis,
        keyboard,
        mark,
        strong,
        italic,
        type,
        underline,
        onClick,  onClick_temp,
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
    const [childrenState, setChildrenState] = useState<any>( "" );
    const changeChildrenState = (newStates:any) => {
        setIsDirty(true)
        setChildrenState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              childrenState:  "" ,
    });
    //    连接网络
    const { sendStateChange } = useWebSocket();
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
    // 根据总状态更新单个状态
    useEffect(() => {
      if(cbtState["childrenState"]) { setChildrenState(JSON.parse(cbtState["childrenState"])) }
    }, [cbtState]);

    //动态生成发送状态变化
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","childrenState",childrenState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"childrenState",childrenState);
            setIsDirty(false);
         }
    }, [childrenState]);
    useEffect(() => {
        if(!children) return;
        setChildrenState(children)
    }, [children])


  return (
        <Text
        ref={ref => { if (ref) { connect(drag(ref)); }}}
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          code={ code }
          copyable={ copyable }
          disabled={ disabled }
          editable={ editable }
          ellipsis={ ellipsis }
          keyboard={ keyboard }
          mark={ mark }
          strong={ strong }
          italic={ italic }
          type={ type }
          underline={ underline }
          onClick={ onClick_temp?onClick_temp:parse_typographyOnClick ( navigate , workMode , onClick) }
          >
         {childrenState}
         </Text>
  );
};

//  是否是容器
CbtaiTypographyText.isCanvas = false;

const CbtaiTypographyTextSettings = () => {
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
                <Form.Item label="是否添加代码样式">
                    <Switch
                        checked={ props.code }
                        onChange={(checked) => setProp((props ) => (props.code = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否可拷贝">
                    <Switch
                        checked={ props.copyable }
                        onChange={(checked) => setProp((props ) => (props.copyable = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否禁用文本">
                    <Switch
                        checked={ props.disabled }
                        onChange={(checked) => setProp((props ) => (props.disabled = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否可编辑">
                    <Switch
                        checked={ props.editable }
                        onChange={(checked) => setProp((props ) => (props.editable = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否自动溢出省略">
                    <Switch
                        checked={ props.ellipsis }
                        onChange={(checked) => setProp((props ) => (props.ellipsis = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否添加键盘样式">
                    <Switch
                        checked={ props.keyboard }
                        onChange={(checked) => setProp((props ) => (props.keyboard = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否添加标记样式">
                    <Switch
                        checked={ props.mark }
                        onChange={(checked) => setProp((props ) => (props.mark = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否加粗">
                    <Switch
                        checked={ props.strong }
                        onChange={(checked) => setProp((props ) => (props.strong = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否斜体">
                    <Switch
                        checked={ props.italic }
                        onChange={(checked) => setProp((props ) => (props.italic = checked))}
                    />
                </Form.Item>
                <Form.Item label="文本类型">
                    <Select
                        value={ props.type }
                        onChange={(value) => setProp((props) => (props.type = value))}
                    >
                        {  ["success","secondary","warning","danger",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否添加下划线">
                    <Switch
                        checked={ props.underline }
                        onChange={(checked) => setProp((props ) => (props.underline = checked))}
                    />
                </Form.Item>
                <Form.Item label="点击 Text 时的回调">
                    <Input
                        value={ props.onClick }
                        onChange={(e) => {
                            setProp((props) => (props.onClick = e.target.value));
                            }
                        }
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiTypographyText.craft = {
  displayName: "CbtaiTypographyText",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiTypographyTextSettings,
  },
};

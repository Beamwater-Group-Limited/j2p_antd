
// CbtaiInputSearch
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
const { Search } = Input
// 动态生成的基础组件
export const CbtaiInputSearch = ({
     className,  dataevent,  children,
    defaultValue,
        maxLength,
        showCount,
        value,
        variant,
        allowClear,
        enterButton,
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
    const [valueState, setValueState] = useState<any>( "" );
    const changeValueState = (newStates:any) => {
        setIsDirty(true)
        setValueState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              valueState:  "" ,
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
      if(cbtState["valueState"]) { setValueState(JSON.parse(cbtState["valueState"])) }
    }, [cbtState]);

    //动态生成发送状态变化
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","valueState",valueState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"valueState",valueState);
            setIsDirty(false);
         }
    }, [valueState]);


  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Search
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          defaultValue={ defaultValue }
          maxLength={ maxLength }
          showCount={ showCount }
          value={ value }
          variant={ variant }
          allowClear={ allowClear }
          enterButton={ enterButton }
         />
    </div>
  );
};

//  是否是容器
CbtaiInputSearch.isCanvas = false;

const CbtaiInputSearchSettings = () => {
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
                <Form.Item label="输入框默认内容">
                    <Input
                        value={ props.defaultValue }
                        onChange={(e) => setProp((props) => (props.defaultValue = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="最大长度">
                    <Input
                        value={ props.maxLength }
                        onChange={(e) => setProp((props) => (props.maxLength = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否展示字数">
                    <Switch
                        checked={ props.showCount }
                        onChange={(checked) => setProp((props ) => (props.showCount = checked))}
                    />
                </Form.Item>
                <Form.Item label="输入框内容">
                    <Typography.Text type="success">初始值:{ JSON.stringify(props.value) }</Typography.Text>
                </Form.Item>
                <Form.Item label="形态变体">
                    <Select
                        value={ props.variant }
                        onChange={(value) => setProp((props) => (props.variant = value))}
                    >
                        {  ["outlined","borderless","filled","underlined",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="可以点击清除图标删除内容">
                    <Switch
                        checked={ props.allowClear }
                        onChange={(checked) => setProp((props ) => (props.allowClear = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否有确认按钮">
                    <Switch
                        checked={ props.enterButton }
                        onChange={(checked) => setProp((props ) => (props.enterButton = checked))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiInputSearch.craft = {
  displayName: "CbtaiInputSearch",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiInputSearchSettings,
  },
};

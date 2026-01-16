
// CbtaiMentions
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    Mentions   } from "antd";
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
export const CbtaiMentions = ({
     className,  dataevent,  children,
    allowClear,
        autoFocus,
        autoSize,
        defaultValue,
        filterOption,
        getPopupContainer,
        notFoundContent,
        placement,
        prefix,
        split,
        status,
        validateSearch,
        value,
        variant,
        onBlur,
        onChange,
        onClear,
        onFocus,
        onResize,
        onSearch,
        onSelect,
        onPopupScroll,
        options,
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
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Mentions
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          allowClear={ allowClear }
          autoFocus={ autoFocus }
          autoSize={ autoSize }
          defaultValue={ defaultValue }
          filterOption={ filterOption }
          getPopupContainer={ getPopupContainer }
          notFoundContent={ notFoundContent }
          placement={ placement }
          prefix={ prefix }
          split={ split }
          status={ status }
          validateSearch={ validateSearch }
          value={ value }
          variant={ variant }
          onBlur={ onBlur }
          onChange={ onChange }
          onClear={ onClear }
          onFocus={ onFocus }
          onResize={ onResize }
          onSearch={ onSearch }
          onSelect={ onSelect }
          onPopupScroll={ onPopupScroll }
          options={ options }
         />
    </div>
  );
};

//  是否是容器
CbtaiMentions.isCanvas = false;

const CbtaiMentionsSettings = () => {
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
                <Form.Item label="是否允许点击清除图标删除内容">
                    <Switch
                        checked={ props.allowClear }
                        onChange={(checked) => setProp((props ) => (props.allowClear = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否自动获取焦点">
                    <Switch
                        checked={ props.autoFocus }
                        onChange={(checked) => setProp((props ) => (props.autoFocus = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否自适应内容高度">
                    <Switch
                        checked={ props.autoSize }
                        onChange={(checked) => setProp((props ) => (props.autoSize = checked))}
                    />
                </Form.Item>
                <Form.Item label="默认值">
                    <Input
                        value={ props.defaultValue }
                        onChange={(e) => setProp((props) => (props.defaultValue = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="自定义过滤逻辑">
                    <Input
                        value={ props.filterOption }
                        onChange={(e) => setProp((props) => (props.filterOption = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="指定建议框挂载的HTML节点">
                    <Input
                        value={ props.getPopupContainer }
                        onChange={(e) => setProp((props) => (props.getPopupContainer = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="下拉列表为空时显示的内容">
                    <Input
                        value={ props.notFoundContent }
                        onChange={(e) => setProp((props) => (props.notFoundContent = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="弹出层展示位置">
                    <Select
                        value={ props.placement }
                        onChange={(value) => setProp((props) => (props.placement = value))}
                    >
                        {  ["top","bottom",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="触发关键字">
                    <Input
                        value={ props.prefix }
                        onChange={(e) => setProp((props) => (props.prefix = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="选中项前后分隔符">
                    <Input
                        value={ props.split }
                        onChange={(e) => setProp((props) => (props.split = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="校验状态">
                    <Select
                        value={ props.status }
                        onChange={(value) => setProp((props) => (props.status = value))}
                    >
                        {  ["error","warning",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="自定义触发验证逻辑">
                    <Input
                        value={ props.validateSearch }
                        onChange={(e) => setProp((props) => (props.validateSearch = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="设置值">
                    <Input
                        value={ props.value }
                        onChange={(e) => setProp((props) => (props.value = e.target.value))}
                    />
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
                <Form.Item label="失去焦点时触发">
                    <Input
                        value={ props.onBlur }
                        onChange={(e) => setProp((props) => (props.onBlur = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="值改变时触发">
                    <Input
                        value={ props.onChange }
                        onChange={(e) => setProp((props) => (props.onChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="按下清除按钮的回调">
                    <Input
                        value={ props.onClear }
                        onChange={(e) => setProp((props) => (props.onClear = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="获得焦点时触发">
                    <Input
                        value={ props.onFocus }
                        onChange={(e) => setProp((props) => (props.onFocus = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="resize回调">
                    <Input
                        value={ props.onResize }
                        onChange={(e) => setProp((props) => (props.onResize = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="搜索时触发">
                    <Input
                        value={ props.onSearch }
                        onChange={(e) => setProp((props) => (props.onSearch = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="选择选项时触发">
                    <Input
                        value={ props.onSelect }
                        onChange={(e) => setProp((props) => (props.onSelect = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="滚动时触发">
                    <Input
                        value={ props.onPopupScroll }
                        onChange={(e) => setProp((props) => (props.onPopupScroll = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="选项配置">
                    <Input
                        value={ props.options }
                        onChange={(e) => setProp((props) => (props.options = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiMentions.craft = {
  displayName: "CbtaiMentions",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiMentionsSettings,
  },
};

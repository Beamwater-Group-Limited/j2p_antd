
// CbtaiAutoComplete
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    AutoComplete   } from "antd";
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
export const CbtaiAutoComplete = ({
     className,  dataevent,  children,
    disabled,
        allowClear,
        autoFocus,
        backfill,
        defaultActiveFirstOption,
        defaultOpen,
        defaultValue,
        dropdownRender,
        popupClassName,
        popupMatchSelectWidth,
        filterOption,
        getPopupContainer,
        notFoundContent,
        open,
        options,
        placeholder,
        status,
        size,
        value,
        variant,
        virtual,
        onBlur,
        onChange,
        onDropdownVisibleChange,
        onFocus,
        onSearch,
        onSelect,
        onClear,
        onInputKeyDown,
        onPopupScroll,
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
        <AutoComplete
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabled }
          allowClear={ allowClear }
          autoFocus={ autoFocus }
          backfill={ backfill }
          defaultActiveFirstOption={ defaultActiveFirstOption }
          defaultOpen={ defaultOpen }
          defaultValue={ defaultValue }
          dropdownRender={ dropdownRender }
          popupClassName={ popupClassName }
          popupMatchSelectWidth={ popupMatchSelectWidth }
          filterOption={ filterOption }
          getPopupContainer={ getPopupContainer }
          notFoundContent={ notFoundContent }
          open={ open }
          options={ options }
          placeholder={ placeholder }
          status={ status }
          size={ size }
          value={ value }
          variant={ variant }
          virtual={ virtual }
          onBlur={ onBlur }
          onChange={ onChange }
          onDropdownVisibleChange={ onDropdownVisibleChange }
          onFocus={ onFocus }
          onSearch={ onSearch }
          onSelect={ onSelect }
          onClear={ onClear }
          onInputKeyDown={ onInputKeyDown }
          onPopupScroll={ onPopupScroll }
         />
    </div>
  );
};

//  是否是容器
CbtaiAutoComplete.isCanvas = false;

const CbtaiAutoCompleteSettings = () => {
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
                <Form.Item label="是否禁用">
                    <Switch
                        checked={ props.disabled }
                        onChange={(checked) => setProp((props ) => (props.disabled = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否支持清除">
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
                <Form.Item label="使用键盘选择选项时是否把选中项回填到输入框中">
                    <Switch
                        checked={ props.backfill }
                        onChange={(checked) => setProp((props ) => (props.backfill = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否默认高亮第一个选项">
                    <Switch
                        checked={ props.defaultActiveFirstOption }
                        onChange={(checked) => setProp((props ) => (props.defaultActiveFirstOption = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否默认展开下拉菜单">
                    <Switch
                        checked={ props.defaultOpen }
                        onChange={(checked) => setProp((props ) => (props.defaultOpen = checked))}
                    />
                </Form.Item>
                <Form.Item label="指定默认选中的条目">
                    <Input
                        value={ props.defaultValue }
                        onChange={(e) => setProp((props) => (props.defaultValue = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="自定义下拉框内容">
                    <Input
                        value={ props.dropdownRender }
                        onChange={(e) => setProp((props) => (props.dropdownRender = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="下拉菜单的className属性">
                    <Input
                        value={ props.popupClassName }
                        onChange={(e) => setProp((props) => (props.popupClassName = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="下拉菜单和选择器是否同宽">
                    <Switch
                        checked={ props.popupMatchSelectWidth }
                        onChange={(checked) => setProp((props ) => (props.popupMatchSelectWidth = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否根据输入项进行筛选">
                    <Switch
                        checked={ props.filterOption }
                        onChange={(checked) => setProp((props ) => (props.filterOption = checked))}
                    />
                </Form.Item>
                <Form.Item label="菜单渲染父节点">
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
                <Form.Item label="是否展开下拉菜单">
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
                <Form.Item label="数据化配置选项内容">
                    <Input
                        value={ props.options }
                        onChange={(e) => setProp((props) => (props.options = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="输入框提示">
                    <Input
                        value={ props.placeholder }
                        onChange={(e) => setProp((props) => (props.placeholder = e.target.value))}
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
                <Form.Item label="控件大小">
                    <Select
                        value={ props.size }
                        onChange={(value) => setProp((props) => (props.size = value))}
                    >
                        {  ["large","middle","small",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="指定当前选中的条目">
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
                        {  ["outlined","borderless","filled",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否在设置false时关闭虚拟滚动">
                    <Switch
                        checked={ props.virtual }
                        onChange={(checked) => setProp((props ) => (props.virtual = checked))}
                    />
                </Form.Item>
                <Form.Item label="失去焦点时的回调">
                    <Input
                        value={ props.onBlur }
                        onChange={(e) => setProp((props) => (props.onBlur = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="选中option，或input的value变化时调用">
                    <Input
                        value={ props.onChange }
                        onChange={(e) => setProp((props) => (props.onChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="展开下拉菜单的回调">
                    <Input
                        value={ props.onDropdownVisibleChange }
                        onChange={(e) => setProp((props) => (props.onDropdownVisibleChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="获得焦点时的回调">
                    <Input
                        value={ props.onFocus }
                        onChange={(e) => setProp((props) => (props.onFocus = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="搜索补全项时调用">
                    <Input
                        value={ props.onSearch }
                        onChange={(e) => setProp((props) => (props.onSearch = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="被选中时调用">
                    <Input
                        value={ props.onSelect }
                        onChange={(e) => setProp((props) => (props.onSelect = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="清除内容时的回调">
                    <Input
                        value={ props.onClear }
                        onChange={(e) => setProp((props) => (props.onClear = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="按键按下时的回调">
                    <Input
                        value={ props.onInputKeyDown }
                        onChange={(e) => setProp((props) => (props.onInputKeyDown = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="下拉列表滚动时的回调">
                    <Input
                        value={ props.onPopupScroll }
                        onChange={(e) => setProp((props) => (props.onPopupScroll = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiAutoComplete.craft = {
  displayName: "CbtaiAutoComplete",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiAutoCompleteSettings,
  },
};

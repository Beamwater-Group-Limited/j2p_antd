
// CbtaiCascader
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Cascader   } from "antd";
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
export const CbtaiCascader = ({ 
     className,  dataevent,  children,  
    disabled,   
    allowClear,   
    autoFocus,   
    changeOnSelect,   
    expandTrigger,   
    maxTagCount,   
    maxTagTextLength,   
    open,   
    placeholder,   
    placement,   
    size,   
    status,   
    suffixIcon,   
    variant,   
    multiple,   
    removeIcon,   
    searchValue,   
    autoClearSearchValue,   
    expandIcon,   
    options, options_temp,  
    onChange,   
    onDropdownVisibleChange,   
    showCheckedStrategy,   
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
        <Cascader
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabled }    
          allowClear={ allowClear }    
          autoFocus={ autoFocus }    
          changeOnSelect={ changeOnSelect }    
          expandTrigger={ expandTrigger }    
          maxTagCount={ maxTagCount }    
          maxTagTextLength={ maxTagTextLength }    
          open={ open }    
          placeholder={ placeholder }    
          placement={ placement }    
          size={ size }    
          status={ status }    
          suffixIcon={ suffixIcon }    
          variant={ variant }    
          multiple={ multiple }    
          removeIcon={ removeIcon }    
          searchValue={ searchValue }    
          autoClearSearchValue={ autoClearSearchValue }    
          expandIcon={ expandIcon }    
          options={ options_temp?options_temp:parse_menuItems ( options) }
          onChange={ onChange }    
          onDropdownVisibleChange={ onDropdownVisibleChange }    
          showCheckedStrategy={ showCheckedStrategy }    
         />
    </div>
  );
};

//  是否是容器
CbtaiCascader.isCanvas = false;
      
const CbtaiCascaderSettings = () => {
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
                <Form.Item label="是否点选每级菜单选项值都发生变化">
                    <Switch
                        checked={ props.changeOnSelect }
                        onChange={(checked) => setProp((props ) => (props.changeOnSelect = checked))}
                    />
                </Form.Item>
                <Form.Item label="次级菜单的展开方式">
                    <Input
                        value={ props.expandTrigger }
                        onChange={(e) => setProp((props) => (props.expandTrigger = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="最多显示多少个tag">
                    <Input
                        value={ props.maxTagCount }
                        onChange={(e) => setProp((props) => (props.maxTagCount = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="最大显示的tag文本长度">
                    <Input
                        value={ props.maxTagTextLength }
                        onChange={(e) => setProp((props) => (props.maxTagTextLength = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="控制浮层显隐">
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
                <Form.Item label="输入框占位文本">
                    <Input
                        value={ props.placeholder }
                        onChange={(e) => setProp((props) => (props.placeholder = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="浮层预设位置">
                    <Select
                        value={ props.placement }
                        onChange={(value) => setProp((props) => (props.placement = value))}
                    >
                        {  ["bottomLeft","bottomRight","topLeft","topRight",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="输入框大小">
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
                <Form.Item label="选择框后缀图标">
                    <Input
                        value={ props.suffixIcon }
                        onChange={(e) => setProp((props) => (props.suffixIcon = e.target.value))}
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
                <Form.Item label="是否支持多选节点">
                    <Switch
                        checked={ props.multiple }
                        onChange={(checked) => setProp((props ) => (props.multiple = checked))}
                    />
                </Form.Item>
                <Form.Item label="多选框清除图标">
                    <Input
                        value={ props.removeIcon }
                        onChange={(e) => setProp((props) => (props.removeIcon = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="设置搜索的值">
                    <Input
                        value={ props.searchValue }
                        onChange={(e) => setProp((props) => (props.searchValue = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否在选中项后清空搜索框，只在 multiple 为 true 时有效">
                    <Switch
                        checked={ props.autoClearSearchValue }
                        onChange={(checked) => setProp((props ) => (props.autoClearSearchValue = checked))}
                    />
                </Form.Item>
                <Form.Item label="自定义次级菜单展开图标">
                    <Input
                        value={ props.expandIcon }
                        onChange={(e) => setProp((props) => (props.expandIcon = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="可选项数据源">
                    <DictItemTree
                        value={ props.options }
                        defaultProp={  []  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.options = dictValue;
                                props.options_temp = parse_menuItems(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="选择完成后的回调">
                    <Input
                        value={ props.onChange }
                        onChange={(e) => setProp((props) => (props.onChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="显示/隐藏浮层的回调">
                    <Input
                        value={ props.onDropdownVisibleChange }
                        onChange={(e) => setProp((props) => (props.onDropdownVisibleChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="定义选择项回填的方式">
                    <Input
                        value={ props.showCheckedStrategy }
                        onChange={(e) => setProp((props) => (props.showCheckedStrategy = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiCascader.craft = {
  displayName: "CbtaiCascader",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiCascaderSettings,
  },
};

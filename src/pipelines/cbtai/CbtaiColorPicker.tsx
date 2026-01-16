
// CbtaiColorPicker
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    ColorPicker   } from "antd";
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
export const CbtaiColorPicker = ({ 
     className,  dataevent,  children,  
    allowClear,   
    arrow,   
    defaultValue,   
    defaultFormat,   
    disabled,   
    disabledAlpha,   
    disabledFormat,   
    destroyTooltipOnHide,   
    format,   
    mode,   
    open,   
    placement,   
    showText,   
    size,   
    trigger,   
    value,   
    onChange,   
    onChangeComplete,   
    onFormatChange,   
    onOpenChange,   
    onClear,   
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
        <ColorPicker
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          allowClear={ allowClear }    
          arrow={ arrow }    
          defaultValue={ defaultValue }    
          defaultFormat={ defaultFormat }    
          disabled={ disabled }    
          disabledAlpha={ disabledAlpha }    
          disabledFormat={ disabledFormat }    
          destroyTooltipOnHide={ destroyTooltipOnHide }    
          format={ format }    
          mode={ mode }    
          open={ open }    
          placement={ placement }    
          showText={ showText }    
          size={ size }    
          trigger={ trigger }    
          value={ value }    
          onChange={ onChange }    
          onChangeComplete={ onChangeComplete }    
          onFormatChange={ onFormatChange }    
          onOpenChange={ onOpenChange }    
          onClear={ onClear }    
          >
         {children}
         </ColorPicker>
    </div>
  );
};

//  是否是容器
CbtaiColorPicker.isCanvas = false;
      
const CbtaiColorPickerSettings = () => {
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
                <Form.Item label="是否允许清除选择的颜色">
                    <Switch
                        checked={ props.allowClear }
                        onChange={(checked) => setProp((props ) => (props.allowClear = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否配置弹出的箭头">
                    <Switch
                        checked={ props.arrow }
                        onChange={(checked) => setProp((props ) => (props.arrow = checked))}
                    />
                </Form.Item>
                <Form.Item label="颜色默认的值">
                    <Input
                        value={ props.defaultValue }
                        onChange={(e) => setProp((props) => (props.defaultValue = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="颜色格式默认的值">
                    <Select
                        value={ props.defaultFormat }
                        onChange={(value) => setProp((props) => (props.defaultFormat = value))}
                    >
                        {  ["rgb","hex","hsb",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否禁用颜色选择器">
                    <Switch
                        checked={ props.disabled }
                        onChange={(checked) => setProp((props ) => (props.disabled = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否禁用透明度">
                    <Switch
                        checked={ props.disabledAlpha }
                        onChange={(checked) => setProp((props ) => (props.disabledAlpha = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否禁用选择颜色格式">
                    <Switch
                        checked={ props.disabledFormat }
                        onChange={(checked) => setProp((props ) => (props.disabledFormat = checked))}
                    />
                </Form.Item>
                <Form.Item label="关闭后是否销毁弹窗">
                    <Switch
                        checked={ props.destroyTooltipOnHide }
                        onChange={(checked) => setProp((props ) => (props.destroyTooltipOnHide = checked))}
                    />
                </Form.Item>
                <Form.Item label="颜色格式">
                    <Select
                        value={ props.format }
                        onChange={(value) => setProp((props) => (props.format = value))}
                    >
                        {  ["rgb","hex","hsb",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="选择器模式">
                    <Select
                        value={ props.mode }
                        onChange={(value) => setProp((props) => (props.mode = value))}
                    >
                        {  ["single","gradient","[&#x27;single&#x27;, &#x27;gradient&#x27;]",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否显示弹出窗口">
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
                <Form.Item label="弹出窗口的位置">
                    <Select
                        value={ props.placement }
                        onChange={(value) => setProp((props) => (props.placement = value))}
                    >
                        {  ["top","left","right","bottom","topLeft","topRight","bottomLeft","bottomRight",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否显示颜色文本">
                    <Switch
                        checked={ props.showText }
                        onChange={(checked) => setProp((props ) => (props.showText = checked))}
                    />
                </Form.Item>
                <Form.Item label="触发器大小">
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
                <Form.Item label="颜色选择器的触发模式">
                    <Select
                        value={ props.trigger }
                        onChange={(value) => setProp((props) => (props.trigger = value))}
                    >
                        {  ["hover","click",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="颜色的值">
                    <Input
                        value={ props.value }
                        onChange={(e) => setProp((props) => (props.value = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="颜色变化的回调">
                    <Input
                        value={ props.onChange }
                        onChange={(e) => setProp((props) => (props.onChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="颜色选择完成的回调">
                    <Input
                        value={ props.onChangeComplete }
                        onChange={(e) => setProp((props) => (props.onChangeComplete = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="颜色格式变化的回调">
                    <Input
                        value={ props.onFormatChange }
                        onChange={(e) => setProp((props) => (props.onFormatChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="当open被改变时的回调">
                    <Input
                        value={ props.onOpenChange }
                        onChange={(e) => setProp((props) => (props.onOpenChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="清除的回调">
                    <Input
                        value={ props.onClear }
                        onChange={(e) => setProp((props) => (props.onClear = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiColorPicker.craft = {
  displayName: "CbtaiColorPicker",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiColorPickerSettings,
  },
};

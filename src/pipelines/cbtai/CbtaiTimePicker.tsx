
// CbtaiTimePicker
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    TimePicker   } from "antd";
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
export const CbtaiTimePicker = ({ 
     className,  dataevent,  children,  
    disabled,   
    allowClear,   
    autoFocus,   
    changeOnScroll,   
    hideDisabledOptions,   
    hourStep,   
    inputReadOnly,   
    minuteStep,   
    needConfirm,   
    open,   
    placeholder,   
    placement,   
    popupClassName,   
    prefix,   
    secondStep,   
    showNow,   
    size,   
    status,   
    use12Hours,   
    variant,   
    suffixIcon, suffixIcon_temp,  
    value, value_temp, value_func, 
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
   
    // 状态属性
    useEffect(() => {
        setValueState( value )
    },[value])
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <TimePicker
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabled }    
          allowClear={ allowClear }    
          autoFocus={ autoFocus }    
          changeOnScroll={ changeOnScroll }    
          hideDisabledOptions={ hideDisabledOptions }    
          hourStep={ hourStep }    
          inputReadOnly={ inputReadOnly }    
          minuteStep={ minuteStep }    
          needConfirm={ needConfirm }    
          open={ open }    
          placeholder={ placeholder }    
          placement={ placement }    
          popupClassName={ popupClassName }    
          prefix={ prefix }    
          secondStep={ secondStep }    
          showNow={ showNow }    
          size={ size }    
          status={ status }    
          use12Hours={ use12Hours }    
          variant={ variant }    
          suffixIcon={ suffixIcon_temp?suffixIcon_temp:parse_icon ( suffixIcon) }
          value={ valueState }
          >
         {children}
         </TimePicker>
    </div>
  );
};

//  是否是容器
CbtaiTimePicker.isCanvas = false;
      
const CbtaiTimePickerSettings = () => {
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
                <Form.Item label="是否支持清除按钮">
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
                <Form.Item label="是否在滚动时改变选择值">
                    <Switch
                        checked={ props.changeOnScroll }
                        onChange={(checked) => setProp((props ) => (props.changeOnScroll = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否隐藏禁止选择的选项">
                    <Switch
                        checked={ props.hideDisabledOptions }
                        onChange={(checked) => setProp((props ) => (props.hideDisabledOptions = checked))}
                    />
                </Form.Item>
                <Form.Item label="小时选项间隔">
                    <Input
                        value={ props.hourStep }
                        onChange={(e) => setProp((props) => (props.hourStep = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否设置输入框为只读">
                    <Switch
                        checked={ props.inputReadOnly }
                        onChange={(checked) => setProp((props ) => (props.inputReadOnly = checked))}
                    />
                </Form.Item>
                <Form.Item label="分钟选项间隔">
                    <Input
                        value={ props.minuteStep }
                        onChange={(e) => setProp((props) => (props.minuteStep = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否需要确认按钮">
                    <Switch
                        checked={ props.needConfirm }
                        onChange={(checked) => setProp((props ) => (props.needConfirm = checked))}
                    />
                </Form.Item>
                <Form.Item label="面板是否打开">
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
                <Form.Item label="没有值时显示的内容">
                    <Input
                        value={ props.placeholder }
                        onChange={(e) => setProp((props) => (props.placeholder = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="选择框弹出的位置">
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
                <Form.Item label="弹出层类名">
                    <Input
                        value={ props.popupClassName }
                        onChange={(e) => setProp((props) => (props.popupClassName = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="自定义前缀">
                    <Input
                        value={ props.prefix }
                        onChange={(e) => setProp((props) => (props.prefix = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="秒选项间隔">
                    <Input
                        value={ props.secondStep }
                        onChange={(e) => setProp((props) => (props.secondStep = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="面板是否显示“此刻”按钮">
                    <Switch
                        checked={ props.showNow }
                        onChange={(checked) => setProp((props ) => (props.showNow = checked))}
                    />
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
                <Form.Item label="是否使用12小时制">
                    <Switch
                        checked={ props.use12Hours }
                        onChange={(checked) => setProp((props ) => (props.use12Hours = checked))}
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
                <Form.Item label="自定义的选择框后缀图标">
                    <Input
                        value={ props.suffixIcon }
                        onChange={(e) => {
                            setProp((props) => (props.suffixIcon = e.target.value));
                            setProp((props) =>  (props.suffixIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="当前时间">
                    <DatePicker
                        onChange={(date,dateString) => {
                            setProp((props) => (props.value_temp = parse_dayjs(dateString) ));
                            }
                        }
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiTimePicker.craft = {
  displayName: "CbtaiTimePicker",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiTimePickerSettings,
  },
};

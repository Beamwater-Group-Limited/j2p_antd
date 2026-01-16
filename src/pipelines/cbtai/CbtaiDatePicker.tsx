
// CbtaiDatePicker
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_func,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_tableOnRow,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function,    parse_pageChange,    parse_fileChange,    parse_filePreview   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiDatePicker = ({ 
     className,  dataevent,  children,  
    disabled,   
    format,   
    order,   
    inputReadOnly,   
    needConfirm,   
    open,   
    picker,   
    placeholder,   
    size,   
    status,   
    style,   
    variant,   
    suffixIcon, suffixIcon_temp,  
    prefix, prefix_temp,  
    onChange, onChange_temp,  
    value, value_temp,  
    allowClear,   
    mode,   
    nextIcon, nextIcon_temp,  
    prevIcon, prevIcon_temp,  
    superNextIcon, superNextIcon_temp,  
    superPrevIcon, superPrevIcon_temp,  
    placement,   
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
        <DatePicker
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabled }    
          format={ format }    
          order={ order }    
          inputReadOnly={ inputReadOnly }    
          needConfirm={ needConfirm }    
          open={ open }    
          picker={ picker }    
          placeholder={ placeholder }    
          size={ size }    
          status={ status }    
          style={ style }    
          variant={ variant }    
          suffixIcon={ suffixIcon_temp?suffixIcon_temp:parse_icon ( suffixIcon) }
          prefix={ prefix_temp?prefix_temp:parse_icon ( prefix) }
          onChange={ onChange_temp?onChange_temp:parse_info ( changeValueState , onChange) }
          value={ valueState }
          allowClear={ allowClear }    
          mode={ mode }    
          nextIcon={ nextIcon_temp?nextIcon_temp:parse_icon ( nextIcon) }
          prevIcon={ prevIcon_temp?prevIcon_temp:parse_icon ( prevIcon) }
          superNextIcon={ superNextIcon_temp?superNextIcon_temp:parse_icon ( superNextIcon) }
          superPrevIcon={ superPrevIcon_temp?superPrevIcon_temp:parse_icon ( superPrevIcon) }
          placement={ placement }    
         />
    </div>
  );
};

//  是否是容器
CbtaiDatePicker.isCanvas = false;
      
const CbtaiDatePickerSettings = () => {
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
                <Form.Item label="日期格式">
                    <Input
                        value={ props.format }
                        onChange={(e) => setProp((props) => (props.format = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="多选、范围时是否自动排序">
                    <Switch
                        checked={ props.order }
                        onChange={(checked) => setProp((props ) => (props.order = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否设置输入框为只读">
                    <Switch
                        checked={ props.inputReadOnly }
                        onChange={(checked) => setProp((props ) => (props.inputReadOnly = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否需要确认按钮">
                    <Switch
                        checked={ props.needConfirm }
                        onChange={(checked) => setProp((props ) => (props.needConfirm = checked))}
                    />
                </Form.Item>
                <Form.Item label="弹层是否展开">
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
                <Form.Item label="选择器类型">
                    <Select
                        value={ props.picker }
                        onChange={(value) => setProp((props) => (props.picker = value))}
                    >
                        {  ["date","week","month","quarter","year",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="输入框提示文字">
                    <Input
                        value={ props.placeholder }
                        onChange={(e) => setProp((props) => (props.placeholder = e.target.value))}
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
                <Form.Item label="输入框样式">
                    <Input
                        value={ props.style }
                        onChange={(e) => setProp((props) => (props.style = e.target.value))}
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
                <Form.Item label="自定义前缀">
                    <Input
                        value={ props.prefix }
                        onChange={(e) => {
                            setProp((props) => (props.prefix = e.target.value));
                            setProp((props) =>  (props.prefix_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="时间发生变化的回调">
                </Form.Item>
                <Form.Item label="日期">
                    <DatePicker
                        onChange={(date,dateString) => {
                            setProp((props) => (props.value_temp = parse_dayjs(dateString) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="自定义清除按钮">
                    <Switch
                        checked={ props.allowClear }
                        onChange={(checked) => setProp((props ) => (props.allowClear = checked))}
                    />
                </Form.Item>
                <Form.Item label="日期面板的状态（仅展示非实际类型）">
                    <Select
                        value={ props.mode }
                        onChange={(value) => setProp((props) => (props.mode = value))}
                    >
                        {  ["time","date","month","year","decade",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="自定义下一个图标">
                    <Input
                        value={ props.nextIcon }
                        onChange={(e) => {
                            setProp((props) => (props.nextIcon = e.target.value));
                            setProp((props) =>  (props.nextIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="自定义上一个图标">
                    <Input
                        value={ props.prevIcon }
                        onChange={(e) => {
                            setProp((props) => (props.prevIcon = e.target.value));
                            setProp((props) =>  (props.prevIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="自定义 &gt;&gt; 切换图标">
                    <Input
                        value={ props.superNextIcon }
                        onChange={(e) => {
                            setProp((props) => (props.superNextIcon = e.target.value));
                            setProp((props) =>  (props.superNextIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="自定义 &lt;&lt; 切换图标">
                    <Input
                        value={ props.superPrevIcon }
                        onChange={(e) => {
                            setProp((props) => (props.superPrevIcon = e.target.value));
                            setProp((props) =>  (props.superPrevIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="选择框弹出的位置">
                    <Select
                        value={ props.placement }
                        onChange={(value) => setProp((props) => (props.placement = value))}
                    >
                        {  ["topRight","topLeft","bottomRight","bottomLeft",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiDatePicker.craft = {
  displayName: "CbtaiDatePicker",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiDatePickerSettings,
  },
};

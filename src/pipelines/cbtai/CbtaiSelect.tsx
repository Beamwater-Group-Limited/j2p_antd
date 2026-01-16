
// CbtaiSelect
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_func,    parse_dict,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_tableOnRow,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function,    parse_pageChange,    parse_fileChange,    parse_filePreview,    parse_selectionProps   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import * as CbtaiAntd from "antd";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiSelect = ({ 
     className,  dataevent,  children,  
    disabled,   
    allowClear,   
    defaultOpen,   
    loading,   
    maxCount,   
    mode,   
    open,   
    placeholder,   
    placement,   
    prefix,   
    showSearch,   
    size,   
    status,   
    variant,   
    virtual,   
    options, options_temp,  
    onChange, onChange_temp,  
    removeIcon, removeIcon_temp,  
    suffixIcon, suffixIcon_temp,  
    defaultValue,   
    popupMatchSelectWidth,   
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
    const [optionsState, setOptionsState] = useState<any>( "" );
    const changeOptionsState = (newStates:any) => {
        setIsDirty(true)
        setOptionsState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              valueState:  "" ,
              optionsState:  "" ,
    });
    //    连接网络
    const {ws, sendStateChange, restoreCbtState,sendEvent } = useWebSocket();
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
      if(cbtState["optionsState"]) { setOptionsState(JSON.parse(cbtState["optionsState"])) }
    }, [cbtState]);

    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","valueState",valueState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"valueState",valueState);
            setIsDirty(false);
         }
    }, [valueState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","optionsState",optionsState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"optionsState",optionsState);
            setIsDirty(false);
         }
    }, [optionsState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   }
    
    // 状态属性
    useEffect(() => {
        setOptionsState( options )
    },[options])
   
  return (
    <div ref={ref => { if (ref) { connect(drag(ref));                      }}}>
        <Select
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabled }    
          allowClear={ allowClear }    
          defaultOpen={ defaultOpen }    
          loading={ loading }    
          maxCount={ maxCount }    
          mode={ mode }    
          open={ open }    
          placeholder={ placeholder }    
          placement={ placement }    
          prefix={ prefix }    
          showSearch={ showSearch }    
          size={ size }    
          status={ status }    
          variant={ variant }    
          virtual={ virtual }    
          options={ optionsState }
          onChange={ onChange_temp?onChange_temp:parse_info ( changeValueState , onChange) }
          removeIcon={ removeIcon_temp?removeIcon_temp:parse_icon ( removeIcon) }
          suffixIcon={ suffixIcon_temp?suffixIcon_temp:parse_icon ( suffixIcon) }
          defaultValue={ defaultValue }    
          popupMatchSelectWidth={ popupMatchSelectWidth }    
          >
         {children}
         </Select>
    </div>
  );
};

//  是否是容器
CbtaiSelect.isCanvas = false;
      
const CbtaiSelectSettings = () => {
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
                <Form.Item label="是否默认展开下拉菜单">
                    
                    <Switch
                        checked={ props.defaultOpen }
                        onChange={(checked) => setProp((props ) => (props.defaultOpen = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否为加载中状态">
                    
                    <Switch
                        checked={ props.loading }
                        onChange={(checked) => setProp((props ) => (props.loading = checked))}
                    />
                </Form.Item>
                <Form.Item label="可选中的最多items数量">
                    <Input
                        value={ props.maxCount }
                        onChange={(e) => setProp((props) => (props.maxCount = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="Select的模式">
                    
                    <Select
                        value={ props.mode }
                        onChange={(value) => setProp((props) => (props.mode = value))}
                    >
                        {  ["multiple","tags",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否展开下拉菜单">
                    
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
                <Form.Item label="选择框默认文本">
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
                <Form.Item label="自定义前缀">
                    <Input
                        value={ props.prefix }
                        onChange={(e) => setProp((props) => (props.prefix = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="是否可搜索">
                    
                    <Switch
                        checked={ props.showSearch }
                        onChange={(checked) => setProp((props ) => (props.showSearch = checked))}
                    />
                </Form.Item>
                <Form.Item label="选择框大小">
                    
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
                <Form.Item label="设置false时是否关闭虚拟滚动">
                    
                    <Switch
                        checked={ props.virtual }
                        onChange={(checked) => setProp((props ) => (props.virtual = checked))}
                    />
                </Form.Item>
                <Form.Item label="数据化配置选项内容">
                    
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
                <Form.Item label="选中option，或input的value变化时调用">
                    
                </Form.Item>
                <Form.Item label="自定义的多选框清除图标">
                    <Input
                        value={ props.removeIcon }
                        onChange={(e) => {
                            setProp((props) => (props.removeIcon = e.target.value));
                            setProp((props) =>  (props.removeIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                    
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
                <Form.Item label="默认选择的条目">
                    <Input
                        value={ props.defaultValue }
                        onChange={(e) => setProp((props) => (props.defaultValue = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="下拉菜单和选择器同宽">
                    <InputNumber
                        value={ props.popupMatchSelectWidth }
                        onChange={(value) => setProp((props) => (props.popupMatchSelectWidth = value))}
                    />
                    
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiSelect.craft = {
  displayName: "CbtaiSelect",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiSelectSettings,
  },
};

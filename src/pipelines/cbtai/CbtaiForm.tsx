
// CbtaiForm
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
export const CbtaiForm = ({ 
     className,  dataevent,  children,  
    disabled,   
    colon,   
    labelAlign,   
    labelWrap,   
    layout,   
    name,   
    preserve,   
    requiredMark,   
    scrollToFirstError,   
    size,   
    variant,   
    clearOnDestroy,   
    labelCol, labelCol_temp,  
    initialValues, initialValues_temp,  
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
    const [disabledState, setDisabledState] = useState<any>( false );
    const changeDisabledState = (newStates:any) => {
        setIsDirty(true)
        setDisabledState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              disabledState:  false ,
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
      if(cbtState["disabledState"]) { setDisabledState(JSON.parse(cbtState["disabledState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","disabledState",disabledState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"disabledState",disabledState);
            setIsDirty(false);
         }
    }, [disabledState]);
   
    // 状态属性
    useEffect(() => {
        setDisabledState( disabled )
    },[disabled])
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Form
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabledState }
          colon={ colon }    
          labelAlign={ labelAlign }    
          labelWrap={ labelWrap }    
          layout={ layout }    
          name={ name }    
          preserve={ preserve }    
          requiredMark={ requiredMark }    
          scrollToFirstError={ scrollToFirstError }    
          size={ size }    
          variant={ variant }    
          clearOnDestroy={ clearOnDestroy }    
          labelCol={ labelCol_temp?labelCol_temp:parse_menuProps ( labelCol) }
          initialValues={ initialValues_temp?initialValues_temp:parse_markProps ( initialValues) }
          >
         {children}
         </Form>
    </div>
  );
};

//  是否是容器
CbtaiForm.isCanvas = true;
      
const CbtaiFormSettings = () => {
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
                <Form.Item label="是否显示label后面的冒号">
                    <Switch
                        checked={ props.colon }
                        onChange={(checked) => setProp((props ) => (props.colon = checked))}
                    />
                </Form.Item>
                <Form.Item label="label标签的文本对齐方式">
                    <Select
                        value={ props.labelAlign }
                        onChange={(value) => setProp((props) => (props.labelAlign = value))}
                    >
                        {  ["left","right",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="label标签的文本是否换行">
                    <Switch
                        checked={ props.labelWrap }
                        onChange={(checked) => setProp((props ) => (props.labelWrap = checked))}
                    />
                </Form.Item>
                <Form.Item label="表单布局">
                    <Select
                        value={ props.layout }
                        onChange={(value) => setProp((props) => (props.layout = value))}
                    >
                        {  ["horizontal","vertical","inline",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="表单名称">
                    <Input
                        value={ props.name }
                        onChange={(e) => setProp((props) => (props.name = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="字段被删除时是否保留字段值">
                    <Switch
                        checked={ props.preserve }
                        onChange={(checked) => setProp((props ) => (props.preserve = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否切换为必选展示样式">
                    <Switch
                        checked={ props.requiredMark }
                        onChange={(checked) => setProp((props ) => (props.requiredMark = checked))}
                    />
                </Form.Item>
                <Form.Item label="提交失败是否自动滚动到第一个错误字段">
                    <Switch
                        checked={ props.scrollToFirstError }
                        onChange={(checked) => setProp((props ) => (props.scrollToFirstError = checked))}
                    />
                </Form.Item>
                <Form.Item label="字段组件的尺寸">
                    <Select
                        value={ props.size }
                        onChange={(value) => setProp((props) => (props.size = value))}
                    >
                        {  ["small","middle","large",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="表单内控件变体">
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
                <Form.Item label="当表单被卸载时是否清空表单值">
                    <Switch
                        checked={ props.clearOnDestroy }
                        onChange={(checked) => setProp((props ) => (props.clearOnDestroy = checked))}
                    />
                </Form.Item>
                <Form.Item label="label标签布局">
                    <DictItemTree
                        value={ props.labelCol }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.labelCol = dictValue;
                                props.labelCol_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="表单默认值，只有初始化以及重置时生效">
                    <DictItemTree
                        value={ props.initialValues }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.initialValues = dictValue;
                                props.initialValues_temp = parse_markProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiForm.craft = {
  displayName: "CbtaiForm",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiFormSettings,
  },
};

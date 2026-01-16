
// CbtaiSlider
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_tableOnRow,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiSlider = ({ 
     className,  dataevent,  children,  
    autoFocus, 
        disabled, 
        keyboard, 
        dots, 
        included, 
        range, 
        reverse, 
        vertical, 
        defaultValue, 
        max, 
        min, 
        step, 
        tooltip,  tooltip_temp, 
        value, 
        marks,  marks_temp, 
        onChange,  onChange_temp, 
      }) => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    // 动态生成的拖拽节点相关
    const {id:nodeID, connectors: { connect, drag } } = useNode();
    const {deleteCurrentNodeChildren,craftJsonToJSX} = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const ownerID = projectConfig.owner_id;
    const {pageData} = usePagesData()
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
        return () => {
            subscription.unsubscribe(); // 组件卸载时取消订阅
        };
    }, []);
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
        <Slider
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          autoFocus={ autoFocus }    
          disabled={ disabled }    
          keyboard={ keyboard }    
          dots={ dots }    
          included={ included }    
          range={ range }    
          reverse={ reverse }    
          vertical={ vertical }    
          defaultValue={ defaultValue }    
          max={ max }    
          min={ min }    
          step={ step }    
          tooltip={ tooltip_temp?tooltip_temp:parse_menuProps ( tooltip) }
          value={ valueState }
          marks={ marks_temp?marks_temp:parse_markProps ( marks) }
          onChange={ onChange_temp?onChange_temp:parse_info ( changeValueState , onChange) }
         />
    </div>
  );
};

//  是否是容器
CbtaiSlider.isCanvas = false;
      
const CbtaiSliderSettings = () => {
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
                <Form.Item label="是否自动获取焦点">
                    <Switch
                        checked={ props.autoFocus }
                        onChange={(checked) => setProp((props ) => (props.autoFocus = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否禁用">
                    <Switch
                        checked={ props.disabled }
                        onChange={(checked) => setProp((props ) => (props.disabled = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否支持使用键盘操作handler">
                    <Switch
                        checked={ props.keyboard }
                        onChange={(checked) => setProp((props ) => (props.keyboard = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否只能拖拽到刻度上">
                    <Switch
                        checked={ props.dots }
                        onChange={(checked) => setProp((props ) => (props.dots = checked))}
                    />
                </Form.Item>
                <Form.Item label="选中部分轨道是否为显示样式">
                    <Switch
                        checked={ props.included }
                        onChange={(checked) => setProp((props ) => (props.included = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否为双滑块模式">
                    <Switch
                        checked={ props.range }
                        onChange={(checked) => setProp((props ) => (props.range = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否为反向坐标轴">
                    <Switch
                        checked={ props.reverse }
                        onChange={(checked) => setProp((props ) => (props.reverse = checked))}
                    />
                </Form.Item>
                <Form.Item label="Slider方向是否为垂直方向">
                    <Switch
                        checked={ props.vertical }
                        onChange={(checked) => setProp((props ) => (props.vertical = checked))}
                    />
                </Form.Item>
                <Form.Item label="初始取值">
                    <InputNumber
                        value={ props.defaultValue }
                        onChange={(value) => setProp((props) => (props.defaultValue = value))}
                    />
                </Form.Item>
                <Form.Item label="最大值">
                    <InputNumber
                        value={ props.max }
                        onChange={(value) => setProp((props) => (props.max = value))}
                    />
                </Form.Item>
                <Form.Item label="最小值">
                    <InputNumber
                        value={ props.min }
                        onChange={(value) => setProp((props) => (props.min = value))}
                    />
                </Form.Item>
                <Form.Item label="步长，取值必须大于 0，并且可被 (max - min) 整除">
                    <InputNumber
                        value={ props.step }
                        onChange={(value) => setProp((props) => (props.step = value))}
                    />
                </Form.Item>
                <Form.Item label="Tooltip相关属性">
                    <DictItemTree
                        value={ props.tooltip }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.tooltip = dictValue;
                                props.tooltip_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="当前取值">
                    <InputNumber
                        value={ props.value }
                        onChange={(value) => setProp((props) => (props.value = value))}
                    />
                </Form.Item>
                <Form.Item label="刻度标记">
                    <DictItemTree
                        value={ props.marks }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.marks = dictValue;
                                props.marks_temp = parse_markProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="Slider的值发生改变时触发">
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiSlider.craft = {
  displayName: "CbtaiSlider",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiSliderSettings,
  },
};

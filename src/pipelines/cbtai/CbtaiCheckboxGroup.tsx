
// CbtaiCheckboxGroup
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
const { Group } = Checkbox
// 动态生成的基础组件
export const CbtaiCheckboxGroup = ({
                                       className,  dataevent,  children,
                                       options,  options_temp,
                                       value,
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
        if (ws.readyState === WebSocket.OPEN && pageData.nodesStated.includes(nodeID)){
            restoreCbtState(nodeID,cbtState)
        }
    }, [ws.readyState]);
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
            <Group
                className={ className }
                data-event={dataevent}
                data-targetid={nodeID}
                options={ options_temp?options_temp:parse_menuItems ( options) }
                value={ valueState }
                onChange={ onChange_temp?onChange_temp:parse_info ( changeValueState , onChange) }
            />
        </div>
    );
};

//  是否是容器
CbtaiCheckboxGroup.isCanvas = false;

const CbtaiCheckboxGroupSettings = () => {
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
                <Form.Item label="指定可选项">
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
                <Form.Item label="指定选中的选项">
                    <DictItemTree
                        value={ props.value }
                        defaultProp={  []  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.value = dictValue;
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="变化时的回调函数">
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiCheckboxGroup.craft = {
    displayName: "CbtaiCheckboxGroup",
    props: {
        disabled:  false ,
    },
    related: {
        settings: CbtaiCheckboxGroupSettings,
    },
};


// CbtaiCarousel
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Carousel   } from "antd";
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
export const CbtaiCarousel = ({
     className,  dataevent,  children,
    arrows,
    autoplay,
    infinite,
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
    }, [cbtState]);

    //动态生成发送状态变化

    // 异步属性值
    const [children_asyncvalue, setChildren_asyncvalue] = useState<any>();
    useEffect(() => {
        parse_reactNode( craftJsonToJSX , ownerID , children).then(value => {
            setChildren_asyncvalue(value.props?.children)
        })
    }, [children]);

  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Carousel
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          arrows={ arrows }
          autoplay={ autoplay }
          infinite={ infinite }
          children={ children_asyncvalue }
         />
    </div>
  );
};

//  是否是容器
CbtaiCarousel.isCanvas = true;

const CbtaiCarouselSettings = () => {
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
                <Form.Item label="是否显示箭头">
                    <Switch
                        checked={ props.arrows }
                        onChange={(checked) => setProp((props ) => (props.arrows = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否自动切换">
                    <Switch
                        checked={ props.autoplay }
                        onChange={(checked) => setProp((props ) => (props.autoplay = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否无限循环切换">
                    <Switch
                        checked={ props.infinite }
                        onChange={(checked) => setProp((props ) => (props.infinite = checked))}
                    />
                </Form.Item>
                <Form.Item label="组件标签内的内容">
                    <Input
                        value={ props.children }
                        onChange={(e) => {
                            setProp((props) => (props.children = e.target.value));
                            }
                        }
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiCarousel.craft = {
  displayName: "CbtaiCarousel",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiCarouselSettings,
  },
};

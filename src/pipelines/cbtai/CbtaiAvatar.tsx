
// CbtaiAvatar
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Avatar   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiAvatar = ({
     className,  dataevent,  children,
    alt,
        gap,
        icon,  icon_temp,
        shape,
        size,
        src,
        srcSet,
        draggable,
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
    const [srcState, setSrcState] = useState<any>( "" );
    const changeSrcState = (newStates:any) => {
        setIsDirty(true)
        setSrcState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              srcState:  "" ,
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
      if(cbtState["srcState"]) { setSrcState(JSON.parse(cbtState["srcState"])) }
    }, [cbtState]);

    //动态生成发送状态变化
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","srcState",srcState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"srcState",srcState);
            setIsDirty(false);
         }
    }, [srcState]);

    // 状态属性
    useEffect(() => {
        setSrcState( src )
    },[src])

  return (
        <Avatar
        ref={ref => { if (ref) { connect(drag(ref)); }}}
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          alt={ alt }
          gap={ gap }
          icon={ icon_temp?icon_temp:parse_icon ( icon) }
          shape={ shape }
          size={ size }
          src={ srcState }
          srcSet={ srcSet }
          draggable={ draggable }
          >
         {children}
         </Avatar>
  );
};

//  是否是容器
CbtaiAvatar.isCanvas = false;

const CbtaiAvatarSettings = () => {
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
                <Form.Item label="图像无法显示时的替代文本">
                    <Input
                        value={ props.alt }
                        onChange={(e) => setProp((props) => (props.alt = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="字符类型距离左右两侧边界单位像素">
                    <InputNumber
                        value={ props.gap }
                        onChange={(value) => setProp((props) => (props.gap = value))}
                    />
                </Form.Item>
                <Form.Item label="设置头像的自定义图标">
                    <Input
                        value={ props.icon }
                        onChange={(e) => {
                            setProp((props) => (props.icon = e.target.value));
                            setProp((props) =>  (props.icon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="头像的形状">
                    <Radio.Group
                        value={ props.shape }
                        onChange={(e) => setProp((props) => (props.shape = e.target.value))}
                    >
                        { ["circle","square",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="头像的大小">
                    <Radio.Group
                        value={ props.size }
                        onChange={(e) => setProp((props) => (props.size = e.target.value))}
                    >
                        { ["large","small","default",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="图片类头像的资源地址或者图片元素 src">
                    <Input
                        value={ props.src }
                        onChange={(e) => setProp((props) => (props.src = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="设置图片类头像响应式资源地址srcSet">
                    <Input
                        value={ props.srcSet }
                        onChange={(e) => setProp((props) => (props.srcSet = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="图片是否允许拖动">
                    <Switch
                        checked={ props.draggable }
                        onChange={(checked) => setProp((props ) => (props.draggable = checked))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiAvatar.craft = {
  displayName: "CbtaiAvatar",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiAvatarSettings,
  },
};

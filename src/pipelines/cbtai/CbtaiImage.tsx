
// CbtaiImage
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    Image   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_eventTargetValue,    parse_info,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree  } from "@/ide";
import {   useCraftJS } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiImage = ({
     className,  dataevent,  children,
    alt,
        height,
        width,
        src,
        placeholder,
        preview,
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
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Image
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          alt={ alt }
          height={ height }
          width={ width }
          src={ srcState }
          placeholder={ placeholder }
          preview={ preview }
          >
         {children}
         </Image>
    </div>
  );
};

//  是否是容器
CbtaiImage.isCanvas = false;

const CbtaiImageSettings = () => {
    const { actions:{setProp}, props} = useNode((node) =>({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol={{ span:24 }} wrapperCol={{ span:24 }}>
                <Form.Item label="children">
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
                <Form.Item label="图像描述">
                    <Input
                        value={ props.alt }
                        onChange={(e) => setProp((props) => (props.alt = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="图像高度">
                    <InputNumber
                        value={ props.height }
                        onChange={(value) => setProp((props) => (props.height = value))}
                    />
                </Form.Item>
                <Form.Item label="图像宽度">
                    <InputNumber
                        value={ props.width }
                        onChange={(value) => setProp((props) => (props.width = value))}
                    />
                </Form.Item>
                <Form.Item label="图片地址">
                    <Input
                        value={ props.src }
                        onChange={(e) => setProp((props) => (props.src = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="加载占位">
                    <Input
                        value={ props.placeholder }
                        onChange={(e) => setProp((props) => (props.placeholder = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="预览参数">
                    <Switch
                        checked={ props.preview }
                        onChange={(checked) => setProp((props ) => (props.preview = checked))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiImage.craft = {
  displayName: "CbtaiImage",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiImageSettings,
  },
};

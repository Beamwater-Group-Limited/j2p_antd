
// CbtaiDrawer
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Drawer   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_func,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_tableOnRow,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function,    parse_pageChange   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiDrawer = ({ 
     className,  dataevent,  children,  
    mask,   
    placement,   
    autoFocus,   
    closeIcon, closeIcon_temp,  
    forceRender,   
    height,   
    keyboard,   
    maskClosable,   
    size,   
    title,   
    loading,   
    open,   
    width,   
    zIndex,   
    onClose, onClose_temp,  
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
    const [openState, setOpenState] = useState<any>( "" );
    const changeOpenState = (newStates:any) => {
        setIsDirty(true)
        setOpenState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              openState:  "" ,
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
      if(cbtState["openState"]) { setOpenState(JSON.parse(cbtState["openState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","openState",openState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"openState",openState);
            setIsDirty(false);
         }
    }, [openState]);
   
    // 状态属性
    useEffect(() => {
        setOpenState( open )
    },[open])
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Drawer
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          mask={ mask }    
          placement={ placement }    
          autoFocus={ autoFocus }    
          closeIcon={ closeIcon_temp?closeIcon_temp:parse_icon ( closeIcon) }
          forceRender={ forceRender }    
          height={ height }    
          keyboard={ keyboard }    
          maskClosable={ maskClosable }    
          size={ size }    
          title={ title }    
          loading={ loading }    
          open={ openState }
          width={ width }    
          zIndex={ zIndex }    
          onClose={ onClose_temp?onClose_temp:parse_function ( setOpenState , false , onClose) }
          >
         {children}
         </Drawer>
    </div>
  );
};

//  是否是容器
CbtaiDrawer.isCanvas = true;
      
const CbtaiDrawerSettings = () => {
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
                <Form.Item label="是否展示遮罩">
                    <Switch
                        checked={ props.mask }
                        onChange={(checked) => setProp((props ) => (props.mask = checked))}
                    />
                </Form.Item>
                <Form.Item label="抽屉的方向">
                    <Select
                        value={ props.placement }
                        onChange={(value) => setProp((props) => (props.placement = value))}
                    >
                        {  ["top","right","bottom","left",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="抽屉展开后是否将焦点切换至其 DOM 节点	">
                    <Switch
                        checked={ props.autoFocus }
                        onChange={(checked) => setProp((props ) => (props.autoFocus = checked))}
                    />
                </Form.Item>
                <Form.Item label="自定义关闭图标">
                    <Input
                        value={ props.closeIcon }
                        onChange={(e) => {
                            setProp((props) => (props.closeIcon = e.target.value));
                            setProp((props) =>  (props.closeIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="预渲染 Drawer 内元素">
                    <Switch
                        checked={ props.forceRender }
                        onChange={(checked) => setProp((props ) => (props.forceRender = checked))}
                    />
                </Form.Item>
                <Form.Item label="高度，在 placement 为 top 或 bottom 时使用">
                    <Input
                        value={ props.height }
                        onChange={(e) => setProp((props) => (props.height = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否支持键盘 esc 关闭">
                    <Switch
                        checked={ props.keyboard }
                        onChange={(checked) => setProp((props ) => (props.keyboard = checked))}
                    />
                </Form.Item>
                <Form.Item label="点击蒙层是否允许关闭">
                    <Switch
                        checked={ props.maskClosable }
                        onChange={(checked) => setProp((props ) => (props.maskClosable = checked))}
                    />
                </Form.Item>
                <Form.Item label="预设抽屉宽度（或高度），default 378px 和 large 736px">
                    <Select
                        value={ props.size }
                        onChange={(value) => setProp((props) => (props.size = value))}
                    >
                        {  ["default","large",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="标题">
                    <Input
                        value={ props.title }
                        onChange={(e) => setProp((props) => (props.title = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="显示骨架屏">
                    <Switch
                        checked={ props.loading }
                        onChange={(checked) => setProp((props ) => (props.loading = checked))}
                    />
                </Form.Item>
                <Form.Item label="Drawer 是否可见">
                    <Switch
                        checked={ props.open }
                        onChange={(checked) => setProp((props ) => (props.open = checked))}
                    />
                </Form.Item>
                <Form.Item label="宽度">
                    <Input
                        value={ props.width }
                        onChange={(e) => setProp((props) => (props.width = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="设置 Drawer 的 z-index">
                    <Input
                        value={ props.zIndex }
                        onChange={(e) => setProp((props) => (props.zIndex = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="点击遮罩层或左上角叉或取消按钮的回调">
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiDrawer.craft = {
  displayName: "CbtaiDrawer",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiDrawerSettings,
  },
};

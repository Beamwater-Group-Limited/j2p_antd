
// CbtaiPagination
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Pagination   } from "antd";
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
export const CbtaiPagination = ({ 
     className,  dataevent,  children,  
    disabled,   
    align,   
    responsive,   
    showSizeChanger,   
    hideOnSinglePage,   
    pageSizeOptions,   
    showLessItems,   
    showQuickJumper,   
    showTitle,   
    size,   
    total,   
    pageSize,   
    current,   
    defaultCurrent,   
    defaultPageSize,   
    onChange,  onChange_func, 
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
    const [totalState, setTotalState] = useState<any>( "" );
    const changeTotalState = (newStates:any) => {
        setIsDirty(true)
        setTotalState(newStates)
    }
    const [pageSizeState, setPageSizeState] = useState<any>( "" );
    const changePageSizeState = (newStates:any) => {
        setIsDirty(true)
        setPageSizeState(newStates)
    }
    const [currentState, setCurrentState] = useState<any>( "" );
    const changeCurrentState = (newStates:any) => {
        setIsDirty(true)
        setCurrentState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              totalState:  "" ,
              pageSizeState:  "" ,
              currentState:  "" ,
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
      if(cbtState["totalState"]) { setTotalState(JSON.parse(cbtState["totalState"])) }
      if(cbtState["pageSizeState"]) { setPageSizeState(JSON.parse(cbtState["pageSizeState"])) }
      if(cbtState["currentState"]) { setCurrentState(JSON.parse(cbtState["currentState"])) }
    }, [cbtState]);

    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","totalState",totalState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"totalState",totalState);
            setIsDirty(false);
         }
    }, [totalState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","pageSizeState",pageSizeState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"pageSizeState",pageSizeState);
            setIsDirty(false);
         }
    }, [pageSizeState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","currentState",currentState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"currentState",currentState);
            setIsDirty(false);
         }
    }, [currentState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   }
    
    // 状态属性
    useEffect(() => {
        setTotalState( total )
    },[total])
    // 状态属性
    useEffect(() => {
        setPageSizeState( pageSize )
    },[pageSize])
    // 状态属性
    useEffect(() => {
        setCurrentState( current )
    },[current])
   
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Pagination
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabled }    
          align={ align }    
          responsive={ responsive }    
          showSizeChanger={ showSizeChanger }    
          hideOnSinglePage={ hideOnSinglePage }    
          pageSizeOptions={ pageSizeOptions }    
          showLessItems={ showLessItems }    
          showQuickJumper={ showQuickJumper }    
          showTitle={ showTitle }    
          size={ size }    
          total={ totalState }
          pageSize={ pageSizeState }
          current={ currentState }
          defaultCurrent={ defaultCurrent }    
          defaultPageSize={ defaultPageSize }    
          onChange={ onChange_func?onChange_func:parse_func(  "CbtaiPagination.onChange",  parseParams, onChange) }
         />
    </div>
  );
};

//  是否是容器
CbtaiPagination.isCanvas = false;
      
const CbtaiPaginationSettings = () => {
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
                <Form.Item label="对齐方式">
                    
                    <Select
                        value={ props.align }
                        onChange={(value) => setProp((props) => (props.align = value))}
                    >
                        {  ["start","center","end",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否根据屏幕宽度自动调整尺寸">
                    
                    <Switch
                        checked={ props.responsive }
                        onChange={(checked) => setProp((props ) => (props.responsive = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否展示每页条数切换器">
                    
                    <Switch
                        checked={ props.showSizeChanger }
                        onChange={(checked) => setProp((props ) => (props.showSizeChanger = checked))}
                    />
                </Form.Item>
                <Form.Item label="只有一页时是否隐藏分页器">
                    
                    <Switch
                        checked={ props.hideOnSinglePage }
                        onChange={(checked) => setProp((props ) => (props.hideOnSinglePage = checked))}
                    />
                </Form.Item>
                <Form.Item label="指定每页可以显示多少条">
                    
                    <DictItemTree
                        value={ props.pageSizeOptions }
                        defaultProp={  []  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.pageSizeOptions = dictValue;
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="是否显示较少页面内容">
                    
                    <Switch
                        checked={ props.showLessItems }
                        onChange={(checked) => setProp((props ) => (props.showLessItems = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否可以快速跳转至某页">
                    
                    <Switch
                        checked={ props.showQuickJumper }
                        onChange={(checked) => setProp((props ) => (props.showQuickJumper = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否显示原生 tooltip 页码提示">
                    
                    <Switch
                        checked={ props.showTitle }
                        onChange={(checked) => setProp((props ) => (props.showTitle = checked))}
                    />
                </Form.Item>
                <Form.Item label="当为 small 时，是小尺寸分页">
                    
                    <Select
                        value={ props.size }
                        onChange={(value) => setProp((props) => (props.size = value))}
                    >
                        {  ["default","small",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="数据总数">
                    <InputNumber
                        value={ props.total }
                        onChange={(value) => setProp((props) => (props.total = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="每页条数">
                    <InputNumber
                        value={ props.pageSize }
                        onChange={(value) => setProp((props) => (props.pageSize = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="当前页数">
                    <InputNumber
                        value={ props.current }
                        onChange={(value) => setProp((props) => (props.current = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="默认当前页数">
                    <InputNumber
                        value={ props.defaultCurrent }
                        onChange={(value) => setProp((props) => (props.defaultCurrent = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="默认的每页条数">
                    <InputNumber
                        value={ props.defaultPageSize }
                        onChange={(value) => setProp((props) => (props.defaultPageSize = value))}
                    />
                    
                </Form.Item>
                <Form.Item label="页码或 pageSize 改变的回调">
                    
                    <DoubleInput
                        value={ props.onChange }
                        onChange={(value) => {
                            setProp((props) => (props.onChange = value));
                        }}
                        bottomLabel="JS 代码"
                        jsValidation={{
                            maxLength: 5000,
                            forbidden: [/eval\s*\(/i, /new\s+Function\s*\(/i], // 可自定义
                            strict: true,
                            debounceMs: 250,
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiPagination.craft = {
  displayName: "CbtaiPagination",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiPaginationSettings,
  },
};

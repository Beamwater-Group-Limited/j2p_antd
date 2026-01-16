
// CbtaiList
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    List   } from "antd";
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
export const CbtaiList = ({ 
     className,  dataevent,  children,  
    bordered,   
    dataSource, dataSource_temp,  
    grid, grid_temp,  
    size,   
    split,   
    pagination, pagination_temp,  
    renderItem,  renderItem_func, 
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
    const [dataSourceState, setDataSourceState] = useState<any>( "" );
    const changeDataSourceState = (newStates:any) => {
        setIsDirty(true)
        setDataSourceState(newStates)
    }
    const [paginationState, setPaginationState] = useState<any>( "" );
    const changePaginationState = (newStates:any) => {
        setIsDirty(true)
        setPaginationState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              dataSourceState:  "" ,
              paginationState:  "" ,
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
      if(cbtState["dataSourceState"]) { setDataSourceState(JSON.parse(cbtState["dataSourceState"])) }
      if(cbtState["paginationState"]) { setPaginationState(JSON.parse(cbtState["paginationState"])) }
    }, [cbtState]);

    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","dataSourceState",dataSourceState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"dataSourceState",dataSourceState);
            setIsDirty(false);
         }
    }, [dataSourceState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","paginationState",paginationState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"paginationState",paginationState);
            setIsDirty(false);
         }
    }, [paginationState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   appConfig,   projectConfig,   }
    
    // 状态属性
    useEffect(() => {
        setDataSourceState( dataSource )
    },[dataSource])
    // 状态属性
    useEffect(() => {
        setPaginationState( pagination )
    },[pagination])
   
  return (
        <List
            ref={ref => {
                if (ref) {
                    connect(drag(ref));
                }}}
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          bordered={ bordered }    
          dataSource={ dataSourceState }
          grid={ grid_temp?grid_temp:parse_menuProps ( grid) }
          size={ size }    
          split={ split }    
          pagination={ paginationState }
          renderItem={ renderItem_func?renderItem_func:parse_func(  "CbtaiList.renderItem",  parseParams, renderItem) }
          >
         {children}
         </List>
  );
};

//  是否是容器
CbtaiList.isCanvas = true;
      
const CbtaiListSettings = () => {
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
                <Form.Item label="是否显示">
                    
                    <Switch
                        checked={ props.bordered }
                        onChange={(checked) => setProp((props ) => (props.bordered = checked))}
                    />
                </Form.Item>
                <Form.Item label="列表数据源">
                    
                    <DictItemTree
                        value={ props.dataSource }
                        defaultProp={  []  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.dataSource = dictValue;
                                props.dataSource_temp = parse_listSource(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="列表栅格配置">
                    
                    <DictItemTree
                        value={ props.grid }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.grid = dictValue;
                                props.grid_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="list 的尺寸">
                    <Radio.Group
                        value={ props.size }
                        onChange={(e) => setProp((props) => (props.size = e.target.value))}
                    >
                        { ["default","large","small",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    
                </Form.Item>
                <Form.Item label="是否展示分割线">
                    
                    <Switch
                        checked={ props.split }
                        onChange={(checked) => setProp((props ) => (props.split = checked))}
                    />
                </Form.Item>
                <Form.Item label="对应的 pagination 配置，设置 false 不显示">
                    
                    <DictItemTree
                        value={ props.pagination }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.pagination = dictValue;
                                props.pagination_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="当使用 dataSource时 渲染组件">
                    
                    <DoubleInput
                        value={ props.renderItem }
                        onChange={(value) => {
                            setProp((props) => (props.renderItem = value));
                        }}
                        bottomLabel="JS 代码"
                        jsValidation={{
                            maxLength: 100000,
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
CbtaiList.craft = {
  displayName: "CbtaiList",
  props: {
    disabled:  false ,
  },
  related: {
    settings: CbtaiListSettings,
  },
};


// CbtaiTable
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Table   } from "antd";
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
export const CbtaiTable = ({ 
     className,  dataevent,  children,  
    dataSource, dataSource_temp,  
    showHeader,   
    onRow, onRow_temp,  
    scroll, scroll_temp,  
    size,   
    rowKey,   
    sticky,   
    pagination,   
    onChange,  onChange_func, 
    expandable,   expandable_dict,
    rowSelection,   rowSelection_dict,
    columns,   columns_dict,
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
    const [rowState, setRowState] = useState<any>( "" );
    const changeRowState = (newStates:any) => {
        setIsDirty(true)
        setRowState(newStates)
    }
    const [scrollState, setScrollState] = useState<any>( "" );
    const changeScrollState = (newStates:any) => {
        setIsDirty(true)
        setScrollState(newStates)
    }
    const [selectedRowKeysState, setSelectedRowKeysState] = useState<any>( "" );
    const changeSelectedRowKeysState = (newStates:any) => {
        setIsDirty(true)
        setSelectedRowKeysState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              dataSourceState:  "" ,
              rowState:  "" ,
              scrollState:  "" ,
              selectedRowKeysState:  "" ,
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
      if(cbtState["rowState"]) { setRowState(JSON.parse(cbtState["rowState"])) }
      if(cbtState["scrollState"]) { setScrollState(JSON.parse(cbtState["scrollState"])) }
      if(cbtState["selectedRowKeysState"]) { setSelectedRowKeysState(JSON.parse(cbtState["selectedRowKeysState"])) }
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
         console.log("状态变化:","rowState",rowState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"rowState",rowState);
            setIsDirty(false);
         }
    }, [rowState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","scrollState",scrollState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"scrollState",scrollState);
            setIsDirty(false);
         }
    }, [scrollState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","selectedRowKeysState",selectedRowKeysState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"selectedRowKeysState",selectedRowKeysState);
            setIsDirty(false);
         }
    }, [selectedRowKeysState]);
    
    const parseParams = {     sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode,   }
    
    // 状态属性
    useEffect(() => {
        setDataSourceState( dataSource )
    },[dataSource])
    // 状态属性
    useEffect(() => {
        setScrollState( scroll )
    },[scroll])
   
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Table
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          dataSource={ dataSourceState }
          showHeader={ showHeader }    
          onRow={ onRow_temp?onRow_temp:parse_tableOnRow ( changeRowState , onRow) }
          scroll={ scrollState }
          size={ size }    
          rowKey={ rowKey }    
          sticky={ sticky }    
          pagination={ pagination }    
          onChange={ onChange_func?onChange_func:parse_func(  "CbtaiTable.onChange",  parseParams, onChange) }
          expandable={ expandable_dict?expandable_dict:parse_dict(  "CbtaiTable.expandable",  parseParams, expandable) }
          rowSelection={ rowSelection_dict?rowSelection_dict:parse_dict(  "CbtaiTable.rowSelection",  parseParams, rowSelection) }
          columns={ columns_dict?columns_dict:parse_dict(  "CbtaiTable.columns",  parseParams, columns) }
         />
    </div>
  );
};

//  是否是容器
CbtaiTable.isCanvas = false;
      
const CbtaiTableSettings = () => {
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
                <Form.Item label="数据数组">
                    
                    <DictItemTree
                        value={ props.dataSource }
                        defaultProp={  []  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.dataSource = dictValue;
                                props.dataSource_temp = parse_menuItems(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="是否显示表头">
                    
                    <Switch
                        checked={ props.showHeader }
                        onChange={(checked) => setProp((props ) => (props.showHeader = checked))}
                    />
                </Form.Item>
                <Form.Item label="设置行属性">
                    
                </Form.Item>
                <Form.Item label="表格是否可滚动，也可以指定滚动区域的宽、高">
                    
                    <DictItemTree
                        value={ props.scroll }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.scroll = dictValue;
                                props.scroll_temp = parse_menuProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="表格大小">
                    <Radio.Group
                        value={ props.size }
                        onChange={(e) => setProp((props) => (props.size = e.target.value))}
                    >
                        { ["large","middle","small",].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    
                </Form.Item>
                <Form.Item label="表格行 key 的取值">
                    <Input
                        value={ props.rowKey }
                        onChange={(e) => setProp((props) => (props.rowKey = e.target.value))}
                    />
                    
                </Form.Item>
                <Form.Item label="设置粘性头部和滚动条">
                    
                    <Switch
                        checked={ props.sticky }
                        onChange={(checked) => setProp((props ) => (props.sticky = checked))}
                    />
                </Form.Item>
                <Form.Item label="分页器">
                    
                    <Switch
                        checked={ props.pagination }
                        onChange={(checked) => setProp((props ) => (props.pagination = checked))}
                    />
                </Form.Item>
                <Form.Item label="分页、排序、筛选变化时触发">
                    
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
                <Form.Item label="展开属性配置">
                    
                    <DoubleInput
                        value={ props.expandable }
                        onChange={(value) => {
                            setProp((props) => (props.expandable = value));
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
                <Form.Item label="表格行是否可选择，配置项">
                    
                    <DoubleInput
                        value={ props.rowSelection }
                        onChange={(value) => {
                            setProp((props) => (props.rowSelection = value));
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
                <Form.Item label="表格列的配置描述">
                    
                    <DoubleInput
                        value={ props.columns }
                        onChange={(value) => {
                            setProp((props) => (props.columns = value));
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
CbtaiTable.craft = {
  displayName: "CbtaiTable",
  props: {
    disabled:  false ,
    children:  "确认" ,
      columns:  [
          'Space,cbtState,setCbtState,sendStateChange'
          ,
          `
        return [
                {
                  "title": "Action",
                  "key": "action",
                  "render": (_, record) => React.createElement(Space, { size: 'middle' }, [
                      React.createElement('a', { key: 'invite' }, \`Invite \${record.name}\`),
                      React.createElement('a', { key: 'delete' }, 'Delete')
                  ])
                }
        ];
        `
      ] ,
  },
  related: {
    settings: CbtaiTableSettings,
  },
};

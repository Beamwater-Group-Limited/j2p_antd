
// CbtaiTransfer
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Transfer   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiTransfer = ({ 
     className,  dataevent,  children,  
    disabled, 
        oneWay, 
        pagination, 
        showSearch, 
        status, 
        showSelectAll, 
        dataSource,  dataSource_temp, 
        selectionsIcon,  selectionsIcon_temp, 
        targetKeys, 
        render,  render_temp, 
        onChange,  onChange_temp, 
        titles,  titles_temp, 
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
    const [targetKeysState, setTargetKeysState] = useState<any>( "" );
    const changeTargetKeysState = (newStates:any) => {
        setIsDirty(true)
        setTargetKeysState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              targetKeysState:  "" ,
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
      if(cbtState["targetKeysState"]) { setTargetKeysState(JSON.parse(cbtState["targetKeysState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","targetKeysState",targetKeysState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"targetKeysState",targetKeysState);
            setIsDirty(false);
         }
    }, [targetKeysState]);
   
    // 状态属性
    useEffect(() => {
        setTargetKeysState( targetKeys )
    },[targetKeys])
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Transfer
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabled }    
          oneWay={ oneWay }    
          pagination={ pagination }    
          showSearch={ showSearch }    
          status={ status }    
          showSelectAll={ showSelectAll }    
          dataSource={ dataSource_temp?dataSource_temp:parse_menuItems ( dataSource) }
          selectionsIcon={ selectionsIcon_temp?selectionsIcon_temp:parse_icon ( selectionsIcon) }
          targetKeys={ targetKeysState }
          render={ render_temp?render_temp:parse_transforRender ( render) }
          onChange={ onChange_temp?onChange_temp:parse_transforOnChange ( changeTargetKeysState , onChange) }
          titles={ titles_temp?titles_temp:parse_transforTarget ( titles) }
         />
    </div>
  );
};

//  是否是容器
CbtaiTransfer.isCanvas = false;
      
const CbtaiTransferSettings = () => {
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
                <Form.Item label="是否展示为单向样式">
                    <Switch
                        checked={ props.oneWay }
                        onChange={(checked) => setProp((props ) => (props.oneWay = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否使用分页样式">
                    <Switch
                        checked={ props.pagination }
                        onChange={(checked) => setProp((props ) => (props.pagination = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否显示搜索框">
                    <Switch
                        checked={ props.showSearch }
                        onChange={(checked) => setProp((props ) => (props.showSearch = checked))}
                    />
                </Form.Item>
                <Form.Item label="校验状态">
                    <Select
                        value={ props.status }
                        onChange={(value) => setProp((props) => (props.status = value))}
                    >
                        {  ["error","warning",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否展示全选勾选框">
                    <Switch
                        checked={ props.showSelectAll }
                        onChange={(checked) => setProp((props ) => (props.showSelectAll = checked))}
                    />
                </Form.Item>
                <Form.Item label="数据源">
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
                <Form.Item label="自定义下拉菜单图标">
                    <Input
                        value={ props.selectionsIcon }
                        onChange={(e) => {
                            setProp((props) => (props.selectionsIcon = e.target.value));
                            setProp((props) =>  (props.selectionsIcon_temp = parse_icon(e.target.value) ));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="显示在右侧框数据的key集合">
                    <Input
                        value={ props.targetKeys }
                        onChange={(e) => {
                            setProp((props) => (props.targetKeys = e.target.value));
                            }
                        }
                    />
                </Form.Item>
                <Form.Item label="每行数据渲染函数">
                </Form.Item>
                <Form.Item label="选项在两栏之间转移时的回调函数">
                </Form.Item>
                <Form.Item label="标题集合，顺序从左至右">
                    <Input
                        value={ props.titles }
                        onChange={(e) => {
                            setProp((props) => (props.titles = e.target.value));
                            }
                        }
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiTransfer.craft = {
  displayName: "CbtaiTransfer",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiTransferSettings,
  },
};

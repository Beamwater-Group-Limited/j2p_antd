
// CbtaiUpload
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Upload   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_func,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_tableOnRow,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function,    parse_pageChange,    parse_fileChange,    parse_filePreview   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiUpload = ({ 
     className,  dataevent,  children,  
    disabled,   
    accept,   
    action,   
    directory,   
    headers,   
    maxCount,   
    method,   
    multiple,   
    name,   
    openFileDialogOnClick,   
    showUploadList,   
    withCredentials,   
    progress, progress_temp,  
    fileList, fileList_temp,  
    listType,   
    onPreview, onPreview_temp,  
    onChange, onChange_temp,  
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
    const [info, setInfo] = useState<any>( "" );
    const changeInfo = (newStates:any) => {
        setIsDirty(true)
        setInfo(newStates)
    }
    const [directoryState, setDirectoryState] = useState<any>( false );
    const changeDirectoryState = (newStates:any) => {
        setIsDirty(true)
        setDirectoryState(newStates)
    }
    const [fileListState, setFileListState] = useState<any>( [] );
    const changeFileListState = (newStates:any) => {
        setIsDirty(true)
        setFileListState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
              info:  "" ,
              directoryState:  false ,
              fileListState:  "" ,
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
      if(cbtState["info"]) { setInfo(JSON.parse(cbtState["info"])) }
      if(cbtState["directoryState"]) { setDirectoryState(JSON.parse(cbtState["directoryState"])) }
      if(cbtState["fileListState"]) { setFileListState(JSON.parse(cbtState["fileListState"])) }
    }, [cbtState]);

    //动态生成发送状态变化 
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","info",info,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"info",info);
            setIsDirty(false);
         }
    }, [info]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","directoryState",directoryState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"directoryState",directoryState);
            setIsDirty(false);
         }
    }, [directoryState]);
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","fileListState",fileListState,isDirty)
         if (isDirty){
            sendStateChange(nodeID,"fileListState",fileListState);
            setIsDirty(false);
         }
    }, [fileListState]);
   
    // 状态属性
    useEffect(() => {
        setDirectoryState( directory )
    },[directory])
    // 状态属性
    useEffect(() => {
        setFileListState( fileList )
    },[fileList])
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Upload
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          disabled={ disabled }    
          accept={ accept }    
          action={ action }    
          directory={ directoryState }
          headers={ headers }    
          maxCount={ maxCount }    
          method={ method }    
          multiple={ multiple }    
          name={ name }    
          openFileDialogOnClick={ openFileDialogOnClick }    
          showUploadList={ showUploadList }    
          withCredentials={ withCredentials }    
          progress={ progress_temp?progress_temp:parse_progressProps ( progress) }
          fileList={ fileListState }
          listType={ listType }    
          onPreview={ onPreview_temp?onPreview_temp:parse_filePreview ( onPreview) }
          onChange={ onChange_temp?onChange_temp:parse_fileChange ( setFileListState , setIsDirty , changeInfo , onChange) }
          >
         {children}
         </Upload>
    </div>
  );
};

//  是否是容器
CbtaiUpload.isCanvas = true;
      
const CbtaiUploadSettings = () => {
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
                <Form.Item label="接受上传的文件类型">
                    <Input
                        value={ props.accept }
                        onChange={(e) => setProp((props) => (props.accept = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="上传的地址">
                    <Input
                        value={ props.action }
                        onChange={(e) => setProp((props) => (props.action = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否支持上传文件夹">
                    <Switch
                        checked={ props.directory }
                        onChange={(checked) => setProp((props ) => (props.directory = checked))}
                    />
                </Form.Item>
                <Form.Item label="上传的请求头部">
                    <Input
                        value={ props.headers }
                        onChange={(e) => setProp((props) => (props.headers = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="限制上传数量">
                    <Input
                        value={ props.maxCount }
                        onChange={(e) => setProp((props) => (props.maxCount = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="上传请求的http method">
                    <Input
                        value={ props.method }
                        onChange={(e) => setProp((props) => (props.method = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否支持多选文件">
                    <Switch
                        checked={ props.multiple }
                        onChange={(checked) => setProp((props ) => (props.multiple = checked))}
                    />
                </Form.Item>
                <Form.Item label="发到后台的文件参数名">
                    <Input
                        value={ props.name }
                        onChange={(e) => setProp((props) => (props.name = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="点击是否打开文件对话框">
                    <Switch
                        checked={ props.openFileDialogOnClick }
                        onChange={(checked) => setProp((props ) => (props.openFileDialogOnClick = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否展示文件列表">
                    <Switch
                        checked={ props.showUploadList }
                        onChange={(checked) => setProp((props ) => (props.showUploadList = checked))}
                    />
                </Form.Item>
                <Form.Item label="上传请求时是否携带cookie">
                    <Switch
                        checked={ props.withCredentials }
                        onChange={(checked) => setProp((props ) => (props.withCredentials = checked))}
                    />
                </Form.Item>
                <Form.Item label="进度条样式">
                    <DictItemTree
                        value={ props.progress }
                        defaultProp={  {}  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.progress = dictValue;
                                props.progress_temp = parse_progressProps(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="已经上传的文件列表（受控）">
                    <DictItemTree
                        value={ props.fileList }
                        defaultProp={  []  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.fileList = dictValue;
                                props.fileList_temp = parse_menuItems(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="上传列表的内建样式">
                    <Select
                        value={ props.listType }
                        onChange={(value) => setProp((props) => (props.listType = value))}
                    >
                        {  ["text","picture","picture-card","picture-circle",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="点击文件链接或预览图标时的回调">
                </Form.Item>
                <Form.Item label="上传文件改变时的回调">
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiUpload.craft = {
  displayName: "CbtaiUpload",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiUploadSettings,
  },
};

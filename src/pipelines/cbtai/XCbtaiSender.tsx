 // XCbtaiSender
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    message,    Button,    Space,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker   } from "antd";
import {   useEffect,    useState,    useRef   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   Sender   } from "@ant-design/x";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    jsonErrorWithLineCol,    parse_func   } from "@/tools";
import {   useAppConfig,    useProject,    useWebSocket,    usePagesData,    useXAgentContext   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const XCbtaiSender = ({ 
     className,  dataevent,  children,  data,  
    onSubmit,  onSubmit_temp, 
        onChange,  onChange_temp, 
        value,  value_temp, 
        footer,  footer_temp, 
        loading,  loading_temp, 
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
    const { parse_XAgentContext } = useXAgentContext();
    // 判断是否为脏数据
    const [isDirty, setIsDirty] = useState<boolean>( false );
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
   
    
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Sender
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          onSubmit={ onSubmit_temp?onSubmit_temp:parse_XAgentContext (  "onSubmit",  onSubmit ) }
          onChange={ onChange_temp?onChange_temp:parse_XAgentContext (  "setContent",  onChange ) }
          value={ value_temp?value_temp:parse_XAgentContext (  "content",  value ) }
          footer={ footer_temp?footer_temp:parse_XAgentContext (  "footer",  footer ) }
          loading={ loading_temp?loading_temp:parse_XAgentContext (  "agentLoading",  loading ) }
         />
    </div>
  );
};

//  是否是容器
XCbtaiSender.isCanvas = false;
      
const XCbtaiSenderSettings = () => {
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
                <Form.Item label="点击发送按钮的回调">
                    <Space direction="vertical" style={{ width: '100%' }} >
                        <Input.TextArea
                            autoSize={{ minRows: 6 }}
                            value={ props.onSubmit }
                            onChange={(e) =>  {
                                  try{
                                     JSON.parse(e.target.value)
                                     setProp((props) => (props.onSubmit = e.target.value))
                                  }
                                  catch (error){
                                      const cheng = jsonErrorWithLineCol(e.target.value, error);
                                      message.error(cheng);
                                  }
                                }
                            } 
                        />
                    </Space>
                </Form.Item>
                <Form.Item label="输入框值改变的回调">
                    <Space direction="vertical" style={{ width: '100%' }} >
                        <Input.TextArea
                            autoSize={{ minRows: 6 }}
                            value={ props.onChange }
                            onChange={(e) =>  {
                                  try{
                                     JSON.parse(e.target.value)
                                     setProp((props) => (props.onChange = e.target.value))
                                  }
                                  catch (error){
                                      const cheng = jsonErrorWithLineCol(e.target.value, error);
                                      message.error(cheng);
                                  }
                                }
                            } 
                        />
                    </Space>
                </Form.Item>
                <Form.Item label="输入框值">
                    <Space direction="vertical" style={{ width: '100%' }} >
                        <Input.TextArea
                            autoSize={{ minRows: 6 }}
                            value={ props.value }
                            onChange={(e) =>  {
                                  try{
                                     JSON.parse(e.target.value)
                                     setProp((props) => (props.value = e.target.value))
                                  }
                                  catch (error){
                                      const cheng = jsonErrorWithLineCol(e.target.value, error);
                                      message.error(cheng);
                                  }
                                }
                            } 
                        />
                    </Space>
                </Form.Item>
                <Form.Item label="底部内容">
                    <Space direction="vertical" style={{ width: '100%' }} >
                        <Input.TextArea
                            autoSize={{ minRows: 6 }}
                            value={ props.footer }
                            onChange={(e) =>  {
                                  try{
                                     JSON.parse(e.target.value)
                                     setProp((props) => (props.footer = e.target.value))
                                  }
                                  catch (error){
                                      const cheng = jsonErrorWithLineCol(e.target.value, error);
                                      message.error(cheng);
                                  }
                                }
                            } 
                        />
                    </Space>
                </Form.Item>
                <Form.Item label="是否加载中">
                    <Space direction="vertical" style={{ width: '100%' }} >
                        <Input.TextArea
                            autoSize={{ minRows: 6 }}
                            value={ props.loading }
                            onChange={(e) =>  {
                                  try{
                                     JSON.parse(e.target.value)
                                     setProp((props) => (props.loading = e.target.value))
                                  }
                                  catch (error){
                                      const cheng = jsonErrorWithLineCol(e.target.value, error);
                                      message.error(cheng);
                                  }
                                }
                            } 
                        />
                    </Space>
                </Form.Item>
            </Form>
        </div>
    )
};
                        
// 组件配置和默认属性
XCbtaiSender.craft = {
   displayName: "XCbtaiSender",
   props: {
     disabled:  false ,
   },
    rules: {
        canDrop: (targetNode: Node, currentNode: Node) => {
            return targetNode["data"]["displayName"] === "XAgentProvider"
        }
    },
   related: {
    settings: XCbtaiSenderSettings,
   },
};

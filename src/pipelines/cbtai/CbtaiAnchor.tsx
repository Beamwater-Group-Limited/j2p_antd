
// CbtaiAnchor
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    Anchor   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_dayjs,    parse_countProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree   } from "@/ide";
import {   useCraftJS   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiAnchor = ({
     className,  dataevent,  children,
    affix,
        bounds,
        getContainer,
        getCurrentAnchor,
        offsetTop,
        showInkInFixed,
        targetOffset,
        onChange,
        onClick,
        direction,
        replace,
        items,  items_temp,
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
            setCbtState(data);
        });
        return () => {
            subscription.unsubscribe(); // 组件卸载时取消订阅
        };
    }, []);
    useEffect(() => {
        if (ws.readyState === WebSocket.OPEN && pageData.nodesStated.includes(nodeID)){
            restoreCbtState(nodeID,cbtState)
        }
    }, [ws.readyState]);
    // 根据总状态更新单个状态
    useEffect(() => {
    }, [cbtState]);

    //动态生成发送状态变化


  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <Anchor
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          affix={ affix }
          bounds={ bounds }
          getContainer={ getContainer }
          getCurrentAnchor={ getCurrentAnchor }
          offsetTop={ offsetTop }
          showInkInFixed={ showInkInFixed }
          targetOffset={ targetOffset }
          onChange={ onChange }
          onClick={ onClick }
          direction={ direction }
          replace={ replace }
          items={ items_temp?items_temp:parse_menuItems ( items) }
         />
    </div>
  );
};

//  是否是容器
CbtaiAnchor.isCanvas = false;

const CbtaiAnchorSettings = () => {
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
                <Form.Item label="是否启用固定模式">
                    <Switch
                        checked={ props.affix }
                        onChange={(checked) => setProp((props ) => (props.affix = checked))}
                    />
                </Form.Item>
                <Form.Item label="锚点区域边界">
                    <Input
                        value={ props.bounds }
                        onChange={(e) => setProp((props) => (props.bounds = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="指定滚动的容器">
                    <Input
                        value={ props.getContainer }
                        onChange={(e) => setProp((props) => (props.getContainer = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="自定义高亮的锚点">
                    <Input
                        value={ props.getCurrentAnchor }
                        onChange={(e) => setProp((props) => (props.getCurrentAnchor = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="距离窗口顶部达到指定偏移量后触发">
                    <Input
                        value={ props.offsetTop }
                        onChange={(e) => setProp((props) => (props.offsetTop = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="affix&#x3D;{false}时是否显示小方块">
                    <Switch
                        checked={ props.showInkInFixed }
                        onChange={(checked) => setProp((props ) => (props.showInkInFixed = checked))}
                    />
                </Form.Item>
                <Form.Item label="锚点滚动偏移量">
                    <Input
                        value={ props.targetOffset }
                        onChange={(e) => setProp((props) => (props.targetOffset = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="监听锚点链接改变">
                    <Input
                        value={ props.onChange }
                        onChange={(e) => setProp((props) => (props.onChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="click事件的handler">
                    <Input
                        value={ props.onClick }
                        onChange={(e) => setProp((props) => (props.onClick = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="导航方向">
                    <Select
                        value={ props.direction }
                        onChange={(value) => setProp((props) => (props.direction = value))}
                    >
                        {  ["vertical","horizontal",].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否替换浏览器历史记录中项目的href而不是推送它">
                    <Switch
                        checked={ props.replace }
                        onChange={(checked) => setProp((props ) => (props.replace = checked))}
                    />
                </Form.Item>
                <Form.Item label="数据化配置选项内容">
                    <DictItemTree
                        value={ props.items }
                        defaultProp={  []  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.items = dictValue;
                                props.items_temp = parse_menuItems(dictValue);
                            });
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiAnchor.craft = {
  displayName: "CbtaiAnchor",
  props: {
    disabled:  false ,
    children:  "确认" ,
  },
  related: {
    settings: CbtaiAnchorSettings,
  },
};

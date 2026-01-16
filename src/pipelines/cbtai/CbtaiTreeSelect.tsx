// CbtaiTreeSelect
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber,    DatePicker,    TreeSelect   } from "antd";
import {   useEffect,    useState,    useContext   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_func,    parse_icon,    parse_timelineItems,    parse_listSource,    parse_renderItem,    parse_tableColumns,    parse_reference,    parse_transforRender,    parse_transforOnChange,    parse_transforTarget,    parse_eventTargetValue,    parse_info,    parse_eventTargetChecked,    parse_reactNode,    parse_tableOnRow,    parse_dayjs,    parse_countProps,    parse_markProps,    parse_progressProps,    parse_tabsProps,    parse_menuOnClick,    parse_typographyOnClick,    parse_function   } from "@/tools";
import {   useAppConfig,    useWebSocket,    useProject,    usePagesData   } from "@/context";
import {   DictItemTree,    DoubleInput   } from "@/ide";
import {   useCraftJS,    useWebrtc   } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的基础组件
export const CbtaiTreeSelect = ({
                                    className,  dataevent,  children,
                                    disabled,
                                    allowClear,
                                    autoClearSearchValue,
                                    listHeight,
                                    maxCount,
                                    maxTagCount,
                                    multiple,
                                    placeholder,
                                    placement,
                                    prefix,
                                    showCheckedStrategy,
                                    showSearch,
                                    size,
                                    status,
                                    treeCheckable,
                                    treeDataSimpleMode,
                                    treeDefaultExpandAll,
                                    treeExpandAction,
                                    treeIcon,
                                    treeLine,
                                    treeNodeFilterProp,
                                    treeNodeLabelProp,
                                    value,
                                    variant,
                                    virtual,
                                    onDropdownVisibleChange,
                                    onSearch,
                                    onSelect,
                                    onTreeExpand,
                                    onPopupScroll,
                                    suffixIcon, suffixIcon_temp,
                                    switcherIcon, switcherIcon_temp,
                                    defaultValue,
                                    treeData, treeData_temp,
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
    const [valueState, setValueState] = useState<any>( "" );
    const changeValueState = (newStates:any) => {
        setIsDirty(true)
        setValueState(newStates)
    }
    const [placeholderState, setPlaceholderState] = useState<any>( "" );
    const changePlaceholderState = (newStates:any) => {
        setIsDirty(true)
        setPlaceholderState(newStates)
    }
    const [treeDataState, setTreeDataState] = useState<any>( "" );
    const changeTreeDataState = (newStates:any) => {
        setIsDirty(true)
        setTreeDataState(newStates)
    }
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
        valueState:  "" ,
        placeholderState:  "" ,
        treeDataState:  "" ,
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
        if(cbtState["valueState"]) { setValueState(JSON.parse(cbtState["valueState"])) }
        if(cbtState["placeholderState"]) { setPlaceholderState(JSON.parse(cbtState["placeholderState"])) }
        if(cbtState["treeDataState"]) { setTreeDataState(JSON.parse(cbtState["treeDataState"])) }
    }, [cbtState]);

    //动态生成发送状态变化
    // 动态生成发送状态变化
    useEffect(() => {
        console.log("状态变化:","valueState",valueState,isDirty)
        if (isDirty){
            sendStateChange(nodeID,"valueState",valueState);
            setIsDirty(false);
        }
    }, [valueState]);
    // 动态生成发送状态变化
    useEffect(() => {
        console.log("状态变化:","placeholderState",placeholderState,isDirty)
        if (isDirty){
            sendStateChange(nodeID,"placeholderState",placeholderState);
            setIsDirty(false);
        }
    }, [placeholderState]);
    // 动态生成发送状态变化
    useEffect(() => {
        console.log("状态变化:","treeDataState",treeDataState,isDirty)
        if (isDirty){
            sendStateChange(nodeID,"treeDataState",treeDataState);
            setIsDirty(false);
        }
    }, [treeDataState]);

    // 状态属性
    useEffect(() => {
        setPlaceholderState( placeholder )
    },[placeholder])
    // 状态属性
    useEffect(() => {
        setValueState( value )
    },[value])
    // 状态属性
    useEffect(() => {
        setTreeDataState( treeData )
    },[treeData])

    return (
        <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
            <TreeSelect
                className={ className }
                data-event={dataevent}
                data-targetid={nodeID}
                disabled={ disabled }
                allowClear={ allowClear }
                autoClearSearchValue={ autoClearSearchValue }
                listHeight={ listHeight }
                maxCount={ maxCount }
                maxTagCount={ maxTagCount }
                multiple={ multiple }
                placeholder={ placeholderState }
                placement={ placement }
                prefix={ prefix }
                showCheckedStrategy={ showCheckedStrategy }
                showSearch={ showSearch }
                size={ size }
                status={ status }
                treeCheckable={ treeCheckable }
                treeDataSimpleMode={ treeDataSimpleMode }
                treeDefaultExpandAll={ treeDefaultExpandAll }
                treeExpandAction={ treeExpandAction }
                treeIcon={ treeIcon }
                treeLine={ treeLine }
                treeNodeFilterProp={ treeNodeFilterProp }
                treeNodeLabelProp={ treeNodeLabelProp }
                value={ valueState }
                variant={ variant }
                virtual={ virtual }
                onDropdownVisibleChange={ onDropdownVisibleChange }
                onSearch={ onSearch }
                onSelect={ onSelect }
                onTreeExpand={ onTreeExpand }
                onPopupScroll={ onPopupScroll }
                suffixIcon={ suffixIcon_temp?suffixIcon_temp:parse_icon ( suffixIcon) }
                switcherIcon={ switcherIcon_temp?switcherIcon_temp:parse_icon ( switcherIcon) }
                defaultValue={ defaultValue }
                treeData={ treeDataState }
                onChange={ onChange_temp?onChange_temp:parse_info ( changeValueState , onChange) }
            >
                {children}
            </TreeSelect>
        </div>
    );
};

//  是否是容器
CbtaiTreeSelect.isCanvas = false;

const CbtaiTreeSelectSettings = () => {
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
                <Form.Item label="是否允许清除">
                    <Switch
                        checked={ props.allowClear }
                        onChange={(checked) => setProp((props ) => (props.allowClear = checked))}
                    />
                </Form.Item>
                <Form.Item label="多选模式下值被选择，是否自动清空搜索框">
                    <Switch
                        checked={ props.autoClearSearchValue }
                        onChange={(checked) => setProp((props ) => (props.autoClearSearchValue = checked))}
                    />
                </Form.Item>
                <Form.Item label="弹窗滚动高度">
                    <Input
                        value={ props.listHeight }
                        onChange={(e) => setProp((props) => (props.listHeight = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="可选中的最多items数量">
                    <Input
                        value={ props.maxCount }
                        onChange={(e) => setProp((props) => (props.maxCount = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="最多显示多少个tag">
                    <Input
                        value={ props.maxTagCount }
                        onChange={(e) => setProp((props) => (props.maxTagCount = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否支持多选">
                    <Switch
                        checked={ props.multiple }
                        onChange={(checked) => setProp((props ) => (props.multiple = checked))}
                    />
                </Form.Item>
                <Form.Item label="选择框默认文字">
                    <Input
                        value={ props.placeholder }
                        onChange={(e) => setProp((props) => (props.placeholder = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="选择框弹出的位置">
                    <Select
                        value={ props.placement }
                        onChange={(value) => setProp((props) => (props.placement = value))}
                    >
                        {  ["bottomLeft","bottomRight","topLeft","topRight",].map( (option) => (
                            <Select.Option key={option} value={option}>
                                {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="自定义前缀">
                    <Input
                        value={ props.prefix }
                        onChange={(e) => setProp((props) => (props.prefix = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="选中项回填的方式">
                    <Input
                        value={ props.showCheckedStrategy }
                        onChange={(e) => setProp((props) => (props.showCheckedStrategy = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="是否支持搜索框">
                    <Switch
                        checked={ props.showSearch }
                        onChange={(checked) => setProp((props ) => (props.showSearch = checked))}
                    />
                </Form.Item>
                <Form.Item label="选择框大小">
                    <Select
                        value={ props.size }
                        onChange={(value) => setProp((props) => (props.size = value))}
                    >
                        {  ["large","middle","small",].map( (option) => (
                            <Select.Option key={option} value={option}>
                                {option}
                            </Select.Option>
                        )) }
                    </Select>
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
                <Form.Item label="是否显示CheckBox">
                    <Switch
                        checked={ props.treeCheckable }
                        onChange={(checked) => setProp((props ) => (props.treeCheckable = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否使用简单格式的treeData">
                    <Switch
                        checked={ props.treeDataSimpleMode }
                        onChange={(checked) => setProp((props ) => (props.treeDataSimpleMode = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否默认展开所有树节点">
                    <Switch
                        checked={ props.treeDefaultExpandAll }
                        onChange={(checked) => setProp((props ) => (props.treeDefaultExpandAll = checked))}
                    />
                </Form.Item>
                <Form.Item label="点击节点title时的展开逻辑">
                    <Select
                        value={ props.treeExpandAction }
                        onChange={(value) => setProp((props) => (props.treeExpandAction = value))}
                    >
                        {  ["false","click","doubleClick",].map( (option) => (
                            <Select.Option key={option} value={option}>
                                {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否展示TreeNode title前的图标">
                    <Switch
                        checked={ props.treeIcon }
                        onChange={(checked) => setProp((props ) => (props.treeIcon = checked))}
                    />
                </Form.Item>
                <Form.Item label="是否展示线条样式">
                    <Switch
                        checked={ props.treeLine }
                        onChange={(checked) => setProp((props ) => (props.treeLine = checked))}
                    />
                </Form.Item>
                <Form.Item label="输入项过滤对应的treeNode属性">
                    <Input
                        value={ props.treeNodeFilterProp }
                        onChange={(e) => setProp((props) => (props.treeNodeFilterProp = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="作为显示的prop设置">
                    <Input
                        value={ props.treeNodeLabelProp }
                        onChange={(e) => setProp((props) => (props.treeNodeLabelProp = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="当前选中的条目">
                    <Input
                        value={ props.value }
                        onChange={(e) => setProp((props) => (props.value = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="形态变体">
                    <Select
                        value={ props.variant }
                        onChange={(value) => setProp((props) => (props.variant = value))}
                    >
                        {  ["outlined","borderless","filled","underlined",].map( (option) => (
                            <Select.Option key={option} value={option}>
                                {option}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item label="是否设置false时关闭虚拟滚动">
                    <Switch
                        checked={ props.virtual }
                        onChange={(checked) => setProp((props ) => (props.virtual = checked))}
                    />
                </Form.Item>
                <Form.Item label="展开下拉菜单的回调">
                    <Input
                        value={ props.onDropdownVisibleChange }
                        onChange={(e) => setProp((props) => (props.onDropdownVisibleChange = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="文本框值变化时的回调">
                    <Input
                        value={ props.onSearch }
                        onChange={(e) => setProp((props) => (props.onSearch = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="被选中时调用">
                    <Input
                        value={ props.onSelect }
                        onChange={(e) => setProp((props) => (props.onSelect = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="展示节点时调用">
                    <Input
                        value={ props.onTreeExpand }
                        onChange={(e) => setProp((props) => (props.onTreeExpand = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="下拉列表滚动时的回调">
                    <Input
                        value={ props.onPopupScroll }
                        onChange={(e) => setProp((props) => (props.onPopupScroll = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="自定义的选择框后缀图标">
                    <Input
                        value={ props.suffixIcon }
                        onChange={(e) => {
                            setProp((props) => (props.suffixIcon = e.target.value));
                            setProp((props) =>  (props.suffixIcon_temp = parse_icon(e.target.value) ));
                        }
                        }
                    />
                </Form.Item>
                <Form.Item label="自定义树节点的展开/折叠图标">
                    <Input
                        value={ props.switcherIcon }
                        onChange={(e) => {
                            setProp((props) => (props.switcherIcon = e.target.value));
                            setProp((props) =>  (props.switcherIcon_temp = parse_icon(e.target.value) ));
                        }
                        }
                    />
                </Form.Item>
                <Form.Item label="默认选择的条目">
                    <Input
                        value={ props.defaultValue }
                        onChange={(e) => setProp((props) => (props.defaultValue = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="treeNodes 数据">
                    <DictItemTree
                        value={ props.treeData }
                        defaultProp={  []  }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.treeData = dictValue;
                                props.treeData_temp = parse_menuItems(dictValue);
                            });
                        }}
                    />
                </Form.Item>
                <Form.Item label="选中树节点时调用此函数">
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
CbtaiTreeSelect.craft = {
    displayName: "CbtaiTreeSelect",
    props: {
        disabled:  false ,
        children:  "确认" ,
    },
    related: {
        settings: CbtaiTreeSelectSettings,
    },
};

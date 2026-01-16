import React, {useEffect, useState} from "react";
import {Form, Select, Button, Modal, List, Card, Input, Space, message, Switch, Spin} from "antd";
import {
    StateItem,
    PropFormItem,
    getStateFromProp, getPropFromState, getStateTypeFromPropType, customPropFromComProps,
} from "@/tools";
import {useCompConfig} from "@/context/CompConfigContext";
import {useCompStates} from "@/context/CompStatesContext";
import {renderStateEditor} from "@/ide";
import {useAppConfig} from "@/context";


export const ComponentStatesDefinePanel: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);      // 加载状态
    const {appConfig} = useAppConfig()
    // 是否更改
    const [isDirty, setIsDirty] = useState<boolean>(false);
    // 配置上下文
    const {compConfig, changeCompConfig} = useCompConfig();
    // 当前配置的属性
    const [props, setProps] = useState<PropFormItem[]>([]);
    // 新状态的
    const [newStateKey, setNewStateKey] = useState<string>("");
    //  全部
    const [states, setStates] = useState<StateItem[]>([]); // 全部状态数据
    // 组件状态
    const {compStates,setCompStates}= useCompStates()
    const [isModalVisible, setIsModalVisible] = useState(false); // 模态框可见性

    // 集中所有改变到这里
    const changeStatesNotFromContext = (states: StateItem[]) => {
        setIsDirty(true)
        // 用states更新 setProps内容中，name相同的项的值
        // 更新属性 需要排除掉来自通用属性内容
        const updatedProps = props.map((prop) => {
            const matchingState = states.find((state) => state.key === getStateFromProp(prop.name));
            if (matchingState) {
                return {...prop,
                    isState: true,
                    options: [],
                };
            }
            return prop;
        }).filter((prop) => !compConfig.compProps.includes(prop.name));
        // 先更新属性
        setProps(updatedProps);
        // 触发状态
        setStates(states)
    }
    // 增加新状态
    const addSimpleState = () => {
        const trimmedStateKey = newStateKey.trim();
        if (!trimmedStateKey) {
            message.error("状态名称不能为空！");
            return;
        }
        // 检查是否有重复的 key
        if (states.some((state) => state.key === trimmedStateKey)) {
            message.error("状态名称已存在，请输入新的名称！");
            return;
        }
        const propItem = props.find((p) => p.name === getPropFromState(trimmedStateKey))
        const stateType = getStateTypeFromPropType(propItem.type)
        const newState:StateItem =  {
                key: trimmedStateKey,
                capKey: trimmedStateKey.charAt(0).toUpperCase() + trimmedStateKey.slice(1),
                defaultValue: propItem.defaultValue,
                type:stateType,
                children: [],
            }
        changeStatesNotFromContext( [
            ...states ,newState
        ]);
        setNewStateKey("");
    };
    // 删除简单状态
    const handleDelete = (key: string) => {
        Modal.confirm({
            title: "确认删除",
            content: `您确定要删除状态 "${key}" 吗？`,
            onOk: () => {
                changeStatesNotFromContext(states.filter((item) => item.key !== key));
            },
            okText: "是",
            cancelText: "否",
        });
    };
    const [newCustomState, setNewCustomState] = useState({
        key: "",
        defaultValue: "",
        type: "string",
    }); // 新自定义状态

    const addCustomState = () => {
        const trimmedKey = newCustomState.key.trim();
        if (!trimmedKey) {
            message.error("状态名称不能为空！");
            return;
        }
        // 检查是否重复
        if (states.some((state) => state.key === trimmedKey)) {
            message.error("状态名称已存在，请输入新的名称！");
            return;
        }

        // 生成新的状态对象
        const newState: StateItem = {
            key: trimmedKey,
            capKey: trimmedKey.charAt(0).toUpperCase() + trimmedKey.slice(1),
            defaultValue: "",
            type: newCustomState.type as "string" | "number" | "object" | "array",
            children: [],
        };

        // 更新状态列表
        changeStatesNotFromContext([...states, newState]);
        setNewCustomState({ key: "", defaultValue: "", type: "string" }); // 清空输入框
        setIsModalVisible(false); // 关闭模态框
        message.success("自定义状态添加成功！");
    };

    // 根据用户修改状态
    useEffect(() => {
        // 生成状态配置
        const compStates =states.reduce((acc,cur) => {
            let initiateValue = null;
            switch (cur.type){
                case "string":
                    initiateValue= "";
                    break;
                case "number":
                    initiateValue= 0;
                    break;
                case "object":
                    initiateValue= {};
                    break;
                case "array":
                    initiateValue= [];
                    break;
                default:
                    break;
            }
            acc[cur.key] = initiateValue;
            return acc;
        }, {} as Record<string, string>)
        setCompStates(compStates)

        if(!states || !isDirty) return;
        console.log("最新状态", states)
        changeCompConfig({...compConfig,states: states, customProps:props});
        setIsDirty(false);
    }, [states]);

    // 响应组件配置
    useEffect(() => {
        if (!compConfig) return;
        console.log("组件的配置", compConfig)
        setProps([
            ...compConfig.customProps,
            ...compConfig.compProps.map(cpName => (customPropFromComProps(cpName)))
        ])
        setStates(compConfig.states)
    }, [compConfig]);

    if (loading)
        return (
        <div className="loading-container">
            { appConfig.IS_SPIN?
                <Spin tip="加载中，请稍等..." size="large" />:
                <div/>
            }
        </div>
    );
    return (
        <Card title="组件状态编辑" className="w-full shadow-md border rounded-lg mb-4">
            <h2>动态状态生成器</h2>
            {/* 添加状态的按钮 */}
            <Space style={{marginBottom: 16}}>
                <Select
                    placeholder="输入状态名称"
                    value={newStateKey}
                    onChange={(value) => setNewStateKey(getStateFromProp(value))}
                    style={{width: 200}}
                    options={props.map((p) => ({value:p.name, label: p.label, key: p.name}))}
                />
                <Button type="primary" onClick={addSimpleState}>快速添加状态</Button>

            </Space>
            <Button type="primary" onClick={()=> setIsModalVisible(true)}>添加自定义状态</Button>
            {/* 状态列表 */}
            <div style={{marginTop: 20}}>
                <h3>状态列表</h3>
                {states && states.length === 0 ? (
                    <p>尚未添加状态</p>
                ) : (
                    <ul style={{padding: 0, listStyle: "none"}}>
                        {states && states.map((item) => (
                            <li
                                key={item.key}
                                className="mb-2 flex justify-between items-center bg-gray-100 p-2 rounded-md"
                            >
                            <span>
                                <strong>{item.key}</strong>: {JSON.stringify(item.defaultValue)}
                            </span>
                                <Space>
                                    <Button
                                        size="small"
                                        danger
                                        onClick={() => handleDelete(item.key)}
                                    >
                                        删除
                                    </Button>
                                </Space>
                            </li>
                        ))}
                    </ul>

                )}
            </div>
            {/* JSON 格式状态展示 */}
            <div style={{marginTop: 20}}>
                <h3>当前状态结构 (JSON 格式):</h3>
                {/* 美化展示 JSON 数据 */}
                <Input.TextArea
                    value={JSON.stringify(states, null, 2)} // 将对象美化成 JSON 格式
                    rows={10}
                    readOnly
                />

                <div style={{marginTop: 20}}>
                    <h3>当前状态值(分别显示):</h3>
                    { compStates && Object.keys(compStates).map(key => (
                        <div key={key} className="mb-2 flex flex-col bg-gray-100 p-2 rounded-md">
                            <h3>{key}:</h3>
                            <Input.TextArea
                                value={JSON.stringify(compStates[key], null, 2) }
                                rows={8}
                                readOnly
                            />
                        </div>
                        ))
                    }
                </div>
            </div>
            {/* 添加自定义状态模态框 */}
            <Modal
                title="添加自定义状态"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={addCustomState}
            >
                <Form layout="vertical">
                    {/* 状态名称 */}
                    <Form.Item label="状态名称" required>
                        <Input
                            placeholder="请输入状态名称"
                            value={newCustomState.key}
                            onChange={(e) =>
                                setNewCustomState((prev) => ({ ...prev, key: e.target.value }))
                            }
                        />
                    </Form.Item>
                    {/* 数据类型 */}
                    <Form.Item label="数据类型" required>
                        <Select
                            value={newCustomState.type}
                            onChange={(value) =>
                                setNewCustomState((prev) => ({ ...prev, type: value }))
                            }
                        >
                            <Select.Option value="string">字符串</Select.Option>
                            <Select.Option value="number">数字</Select.Option>
                            <Select.Option value="object">对象</Select.Option>
                            <Select.Option value="array">数组</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

        </Card>

    );
};


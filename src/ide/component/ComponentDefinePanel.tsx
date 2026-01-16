import React, {useEffect, useState} from "react";
import {
    Typography,
    Button,
    Card,
    Form,
    Input,
    Switch,
    Select,
    Popconfirm,
    message,
    Table, Space
} from 'antd';
import {getRenderTypeFromPropType, PropFormItem, propTypes} from "@/tools";
import {useCompConfig} from "@/context/CompConfigContext";
import {DoubleInput} from "@/ide";

export const ComponentDefinePanel = () => {
    // 是否更改
    const [isDirty, setIsDirty] = useState<boolean>(false);
    // 配置上下文
    const {compConfig, changeCompConfig} = useCompConfig();
    const [customProps, setCustomProps] = useState<PropFormItem[]>([]); // 存储最终生成的数据结构
    // 是否为容器的静态属性配置
    const [isCanvas, setIsCanvas] = useState<boolean>(false);
    // 是否需要包括Div
    const [needWrap, setNeedWrap] = useState<boolean>(false);
    // 是否有children
    const [haveChildren, setHaveChildren] = useState<boolean>(true);

    // 集中所有改变到这里
    const changePropsNotFromContext = (props: PropFormItem[]) => {
        setIsDirty(true)
        setCustomProps(props)
    }
    // 临时性的生的 属性配置项 是一过性的
    const [currentItem, setCurrentItem] = useState<PropFormItem>(
        {
        label: "",
        name: "",
        type: "",
        options: [],
        defaultValue: "",
        isTemp: false,
        isFunc: false,
        isDict:false,
        isAsync: false,
        isAsyncValue: false,
        isState: false
    }
    ); // 单个表单字段的配置编辑状态
    // 类型选择变化
    const onTypeChange = (value: string) => {
        setCurrentItem({...currentItem, type: value, options: []});
    };
    // 增加选项
    const addOption = () => {
        setCurrentItem({
            ...currentItem,
            options: [...(currentItem.options || []), {label: "", value: ""}],
        });
    };
    // 更新选项
    const updateOption = (index: number, key: string, value: string) => {
        const newOptions = [...currentItem.options];
        newOptions[index][key] = value;
        setCurrentItem({...currentItem, options: newOptions});
    };
    const addString = () => {
        const newStrings = currentItem.options ? [...currentItem.options, ""] : [""];
        setCurrentItem({ ...currentItem, options: newStrings });
    };

    const updateString = (index: number, value: string) => {
        const updatedStrings = [...currentItem.options];
        updatedStrings[index] = value;
        setCurrentItem({ ...currentItem, options: updatedStrings });
    };

    const removeString = (index: number) => {
        const updatedStrings = currentItem.options.filter((_: any, i: number) => i !== index);
        setCurrentItem({ ...currentItem, options: updatedStrings });
    };

    // 增加 自定义的属性
    const handleAddField = () => {
        // 检查 currentItem 的name 是否和现有的 customProps中的项的name重复
        if (customProps.some((item) => item.name === currentItem.name)) {
            alert("和现有属性重复")
            return
        }
        if (currentItem.label && currentItem.name && currentItem.type) {
            changePropsNotFromContext([...customProps, currentItem]);
            setCurrentItem({
                label: "",
                name: "",
                type: "",
                options: [],
                defaultValue: "",
                isTemp: false ,
                isFunc: false ,
                isDict:false,
                isAsync: false ,
                isAsyncValue: false,
                isState: false
            }); // Reset form
        }
    };
    // 表格列
    const columns = [
        {
            title: "属性标签",
            dataIndex: "label",
            key: "label",
            render: (text: string) => <Typography.Text className="w-8 block">{text}</Typography.Text>,
        },
        {
            title: "属性名称",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "属性类型",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "动态函数解析",
            dataIndex: "isFunc",
            key: "isFunc",
            render: (value: boolean) => <Typography.Text className="w-4 block">{value?"是":"否"}</Typography.Text>,
        },
        {
            title: "动态字典解析",
            dataIndex: "isDict",
            key: "isDict",
            render: (value: boolean) => <Typography.Text className="w-4 block">{value?"是":"否"}</Typography.Text>,
        },
        {
            title: "临时解析",
            dataIndex: "isTemp",
            key: "isTemp",
            render: (value: boolean) => <Typography.Text className="w-4 block">{value?"是":"否"}</Typography.Text>,
        },
        {
            title: "是否异步方法",
            dataIndex: "isAsync",
            key: "isAsync",
            render: (value: boolean) => <Typography.Text className="w-4 block">{value?"是":"否"}</Typography.Text>,
        },
        {
            title: "是否异步值",
            dataIndex: "isAsyncValue",
            key: "isAsyncValue",
            render: (value: boolean) => <Typography.Text className="w-4 block">{value?"是":"否"}</Typography.Text>,
        },
        {
            title: "是否为状态",
            dataIndex: "isState",
            key: "isState",
            render: (value: boolean) => <Typography.Text className="w-4 block">{value?"是":"否"}</Typography.Text>,
        },
        {
            title: "操作",
            key: "action",
            render: (_: any, __: any, index: number) => (
                <Popconfirm
                    title="确定要删除该属性吗？"
                    onConfirm={() => handleRemoveField(index)}
                    okText="是"
                    cancelText="否"
                >
                    <Button type="link" danger>
                        删除
                    </Button>
                </Popconfirm>
            ),
        },
    ];
    // 删除字段
    const handleRemoveField = (index: number) => {
        const newFormItems = customProps.filter((_, i) => i !== index);
        changePropsNotFromContext(newFormItems);
        message.success("属性已删除！");
    };
    // 根据 属性配置面板类型不同 增加不同参数
    const renderFieldConfig = () => {
        switch (getRenderTypeFromPropType(currentItem.type)) {
            case "select":
                return (
                    <div>
                        {currentItem.options?.map((option: any, index: number) => (
                            <div key={index} style={{display: "flex", gap: "10px", marginBottom: "8px"}}>
                                <Input
                                    placeholder="Option Label"
                                    value={option.label}
                                    onChange={(e) => updateOption(index, "label", e.target.value)}
                                />
                                <Input
                                    placeholder="Option Value"
                                    value={option.value}
                                    onChange={(e) => updateOption(index, "value", e.target.value)}
                                />
                            </div>
                        ))}
                        <Button type="dashed" onClick={addOption}>
                            增加选项
                        </Button>

                    </div>
                );
            case "switch":
                return (
                    <Form.Item label="Default Value">
                        <Switch
                            defaultChecked={currentItem.defaultValue}
                            onChange={(checked) => setCurrentItem({...currentItem, defaultValue: checked})}
                        />
                    </Form.Item>
                );
            case "textarea":
                return (
                    <Form.Item label="Default Value">
                        <Input.TextArea
                            value={currentItem.defaultValue}
                            onChange={(e) => setCurrentItem({ ...currentItem, defaultValue: e.target.value })}
                        />
                    </Form.Item>
                );
            case "input":
                return (
                    <Form.Item label="Default Value">
                        <Input
                            value={currentItem.defaultValue}
                            onChange={(e) => setCurrentItem({...currentItem, defaultValue: e.target.value})}
                        />
                    </Form.Item>
                );
            case "options":
                return (
                    <div>
                        {currentItem.options?.map((option: any, index: number) => (
                            <div key={index} style={{display: "flex", gap: "10px", marginBottom: "8px"}}>
                                <Input
                                    placeholder="Option Label"
                                    value={option}
                                    onChange={(e) => updateString(index,  e.target.value)}
                                />
                                <Button
                                    type="text"
                                    danger
                                    onClick={() => removeString(index)}
                                >
                                    删除
                                </Button>
                            </div>
                        ))}
                        <Button type="dashed" onClick={addString}>
                            增加属性面板类型方法 需要的参数字符串
                        </Button>

                        <DoubleInput
                            value={ currentItem.defaultValue }
                            onChange={(value) => {
                               setCurrentItem({...currentItem, defaultValue: value})
                            }}
                            bottomLabel="JS 代码"
                            jsValidation={{
                                maxLength: 5000,
                                forbidden: [/eval\s*\(/i, /new\s+Function\s*\(/i], // 可自定义
                                strict: true,
                                debounceMs: 250,
                            }}
                        />
                    </div>
                )
            default:
                return null;
        }
    };

    // 初始化 节点属性
    useEffect(() => {
        if(!compConfig) return;
        console.log("查找为空",compConfig, compConfig.customProps, compConfig.isCanvas, compConfig.needWrap, compConfig.haveChildren)
        setCustomProps(compConfig.customProps)
        setIsCanvas(compConfig.isCanvas)
        setNeedWrap(compConfig.needWrap)
        setHaveChildren(compConfig.haveChildren)
    }, [compConfig]);

    // 用户修改 customPros 更新至上下文 用户的定制化属性的数组，负责刷新到 组件的配置项中
    useEffect(() => {
        if (!customProps || !compConfig || !isDirty) return;
        changeCompConfig({...compConfig,customProps: customProps})
        setIsDirty(false)
    }, [customProps]);

    // 用户修改 isCanvas 更新至上下文
    useEffect(() => {
        if ( !compConfig || !isDirty) return;
        changeCompConfig({...compConfig,isCanvas: isCanvas})
        setIsDirty(false)
    }, [isCanvas]);

    // 用户修改 needWrap 更新至上下文
    useEffect(() => {
        if ( !compConfig || !isDirty) return;
        changeCompConfig({...compConfig,needWrap: needWrap})
        setIsDirty(false)
    }, [needWrap]);

    // 用户修改 是否有子组件 更新至上下文
    useEffect(() => {
        if ( !compConfig || !isDirty) return;
        changeCompConfig({...compConfig,haveChildren: haveChildren})
        setIsDirty(false)
    }, [haveChildren]);

    return (
        <Card title="定制属性面板" className="w-full shadow-md border rounded-lg mb-4">
            <Space size="large" className="mb-4">
                <Switch
                    checkedChildren="容器"
                    unCheckedChildren="非容器"
                    checked={isCanvas}
                    onChange={(checked) => {
                        setIsDirty(true);
                        setIsCanvas(checked);
                    }}
                />
                <Switch
                    checkedChildren="需包裹"
                    unCheckedChildren="不需包裹"
                    checked={needWrap}
                    onChange={(checked) => {
                        setIsDirty(true);
                        setNeedWrap(checked);
                    }}
                />
                <Switch
                    checkedChildren="有内容"
                    unCheckedChildren="无内容"
                    checked={haveChildren}
                    onChange={(checked) => {
                        setIsDirty(true);
                        setHaveChildren(checked);
                    }}
                />
            </Space>
            <Table
                dataSource={customProps.map((item, index) => ({...item, key: index}))}
                columns={columns}
                bordered
                pagination={false}
            />
            <Form layout="vertical">
                <Form.Item label="属性面板标签">
                    <Input
                        value={currentItem.label}
                        onChange={(e) => setCurrentItem({...currentItem, label: e.target.value})}
                    />
                </Form.Item>
                <Form.Item label="属性名">
                    <Input
                        value={currentItem.name}
                        onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                    />
                </Form.Item>
                <Form.Item label="属性面板类型">
                    <Select value={currentItem.type} onChange={onTypeChange}>
                        {propTypes.sort((a,b) => a.localeCompare(b)).map((type) => (
                            <Select.Option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="是否需要动态解析(使用自定义函数动态解析)(无法使用其他解析)">
                    <Switch
                        checkedChildren="需要"
                        unCheckedChildren="不需要"
                        checked={currentItem.isFunc}
                        onChange={(checked) => setCurrentItem({...currentItem, isFunc: checked})}
                    />
                </Form.Item>
                <Form.Item label="是否需要动态解析(使用自定义字典动态解析)(无法使用其他解析)">
                    <Switch
                        checkedChildren="需要"
                        unCheckedChildren="不需要"
                        checked={currentItem.isDict}
                        onChange={(checked) => setCurrentItem({...currentItem, isDict: checked})}
                    />
                </Form.Item>
                <Form.Item label="是否需要临时解析(属性类型非字符串数字需临时解析)">
                    <Switch
                        checkedChildren="需要"
                        unCheckedChildren="不需要"
                        checked={currentItem.isTemp}
                        onChange={(checked) => setCurrentItem({...currentItem, isTemp: checked})}
                    />
                </Form.Item>
                <Form.Item label="是否需要异步加载方法(返回ReactNode的函数需要异步加载)">
                    <Switch
                        checkedChildren="需要"
                        unCheckedChildren="不需要"
                        checked={currentItem.isAsync}
                        onChange={(checked) => setCurrentItem({...currentItem, isAsync: checked})}
                    />
                </Form.Item>
                <Form.Item label="是否需要异步加载值(ReactNode需要异步加载)(不需要临时解析)">
                    <Switch
                        checkedChildren="需要"
                        unCheckedChildren="不需要"
                        checked={currentItem.isAsyncValue}
                        onChange={(checked) => setCurrentItem({...currentItem, isAsyncValue: checked})}
                    />
                </Form.Item>
                {renderFieldConfig()}
                <Button type="primary" onClick={handleAddField} style={{marginTop: "10px"}}>
                    增加属性
                </Button>
            </Form>
            <span>自动生成</span>
            <pre style={{background: "#f6f8fa", padding: "10px", borderRadius: "8px"}}>
             {JSON.stringify(customProps, null, 2)}
      </pre>

        </Card>
    )
}

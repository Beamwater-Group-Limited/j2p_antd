import React, {useEffect, useMemo, useState} from "react";
import {Button, Modal, Form, Input, Space, Select, Table, Card, Alert, Switch} from "antd";
import {
    addPipeInstance,
    DynamicPipelineInstanceListProps, generateCode,
    generatePipelineInstance, getImports, ModalState, Param, PIPE_ICON_MAP,
    PipelineInstance, PipelineType, removePipelineInstance, updateImports, updatePipelineInstance
} from "@/tools";
import {DaFormat} from "@/entity";
import {useAppConfig, useProject} from "@/context";
import {useHandle} from "@/hooks";
import {PipelineInstantCard} from "@/ide";
import TextArea from "antd/es/input/TextArea";
import Search from "antd/es/input/Search";


interface ExtendedDynamicPipelineInstanceListProps extends DynamicPipelineInstanceListProps {
    pipeTypes: PipelineType[];
}

interface CombinedSelectProps {
    value?: string;
    onChange?: (value: string) => void;
    pipeLines: PipelineInstance[];
}

const CombinedSelect: React.FC<CombinedSelectProps> = ({value, onChange, pipeLines}) => {
    const [firstValue, setFirstValue] = useState<string | undefined>(undefined);
    const [secondValue, setSecondValue] = useState<string | undefined>(value);
    // 当外部传入的 value 变化时，同步内部 secondValue 状态
    useEffect(() => {
        // console.log("外部传入的value", value)
        if (value) {
            const tokens = value.split(".");
            if (tokens.length === 3) {
                setFirstValue(tokens[0]);
                setSecondValue(tokens[2]);
            }
        } else {
            setFirstValue(undefined);
            setSecondValue(undefined);
        }
    }, [value]);

    const handleFirstChange = (val: string) => {
        setFirstValue(val);
        setSecondValue(undefined);
        // 第一个 Select 的值仅用于内部展示，不通过 onChange 传递出去
    };

    const handleSecondChange = (val: string) => {
        setSecondValue(val);
        if (onChange) {
            onChange(val); // 将第二个 Select 的值传递给 Form
        }
    };
    // 参数方向
    const paramWay = 'o'
    return (
        <div key={`${value}-key`} className="flex w-full gap-4">
            <Select
                placeholder="管道实例"
                value={firstValue}
                onChange={handleFirstChange}
                className="flex-1"
            >
                {pipeLines
                    .slice()
                    .sort((a, b) => {
                        // 取 id 前8位（去掉中划线）
                        const idA = a.id.replace(/-/g, '').slice(0, 8);
                        const idB = b.id.replace(/-/g, '').slice(0, 8);

                        const firstCharA = idA[0];
                        const firstCharB = idB[0];

                        const isDigitA = /^\d$/.test(firstCharA);
                        const isDigitB = /^\d$/.test(firstCharB);

                        // 数字开头的排在前面
                        if (isDigitA && !isDigitB) return -1;
                        if (!isDigitA && isDigitB) return 1;

                        // 同类的逐字符比较（字典序，不按数字大小）
                        const len = Math.min(idA.length, idB.length);
                        for (let i = 0; i < len; i++) {
                            const diff = idA.charCodeAt(i) - idB.charCodeAt(i);
                            if (diff !== 0) return diff;
                        }

                        // 若前8位完全相同，按长度（短的在前）
                        if (idA.length !== idB.length) return idA.length - idB.length;

                        // 再按描述排序（中文按拼音序，英文按字母序）
                        return (a.describe || '').localeCompare(b.describe || '', 'zh');
                    })
                    .map(pipe => (
                        <Select.Option key={pipe.id} value={pipe.id}>
                            <Space>
                                {PIPE_ICON_MAP[pipe.pipe_type_id] || PIPE_ICON_MAP.default}
                                {`${pipe.id.replace(/-/g, '').slice(0,8)}-${pipe.describe}`}
                            </Space>
                        </Select.Option>
                    ))}
            </Select>

            {/*<Select*/}
            {/*    placeholder="管道实例"*/}
            {/*    value={firstValue}*/}
            {/*    onChange={handleFirstChange}*/}
            {/*    className="flex-1"*/}
            {/*>*/}
            {/*    {pipeLines.map(pipe => (*/}
            {/*        <Select.Option key={pipe.id} value={pipe.id}>*/}
            {/*            <Space>*/}
            {/*                {PIPE_ICON_MAP[pipe.pipe_type_id] || PIPE_ICON_MAP.default}{`${pipe.id.replace(/-/g, '').slice(0,8)}-${pipe.describe}`}*/}
            {/*            </Space>*/}
            {/*        </Select.Option>*/}
            {/*    ))}*/}
            {/*</Select>*/}
            <Select
                placeholder="输出参数"
                value={secondValue}
                disabled={!firstValue}
                onChange={handleSecondChange}
                className="flex-1"
            >
                {pipeLines.find(pipe => pipe.id === firstValue)?.pipe_output_data.map((param, index) => (
                    <Select.Option
                        key={param.name} value={`${firstValue}.${paramWay}.${index}`}
                    >
                        {`${param.type}-${param.name}-${param.describe}`}
                    </Select.Option>
                ))}
            </Select>
        </div>
    );
};


export const PipelineInstanceList: React.FC<ExtendedDynamicPipelineInstanceListProps> = ({
                                                                                             data,
                                                                                             headers,
                                                                                             pipeTypes,
                                                                                         }) => {
    // 使用 useContext 从全局上下文中获取 globalId
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    const [pipelines, setPipelines] = useState<PipelineInstance[]>([]);
    // 新管道实例
    const [newPipelineInstance, setNewPipelineInstance] = useState<PipelineInstance | null>(
        generatePipelineInstance()
    );
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    // 绑定到表单
    const [form] = Form.useForm();
    // 利用 Form.useWatch 监听 pipe_type_id 的变化
    const pipeTypesId = Form.useWatch("pipe_type_id", form);
    useEffect(() => {
        if (!pipeTypesId) return;
        console.log("监控pipeTypesId配置项", pipeTypesId, pipeTypes.find(pipe => pipe.id === pipeTypesId)?.pipe_config_items)
        if (!isEditor) {
            form.setFieldsValue({
                pipe_input_data: pipeTypes.find(pipe => pipe.id === pipeTypesId)?.pipe_input_data.map(() => ({
                    name: "",
                    type: DaFormat.FSTRING,
                    describe: ""
                })) || [],
                pipe_output_data: pipeTypes.find(pipe => pipe.id === pipeTypesId)?.pipe_output_data.map(() => ({
                    name: "",
                    type: DaFormat.FSTRING,
                    describe: ""
                })) || [],
                pipe_config_items: pipeTypes.find(pipe => pipe.id === pipeTypesId)?.pipe_config_items.map((item) => ({
                    name: item.name,
                    value: item.value,
                    describe: item.describe
                })) || [],
            })
        }
    }, [pipeTypesId]);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isEditor, setIsEditor] = useState<boolean>(undefined);
    const narrowHeaders = [
        "author",
        "pipe_input_data",
        "pipe_output_data",
        "pipe_mount_id",
        "data_item_comes"
    ];
    const columns = [
        {
            title: "序号",
            key: "index",
            render: (_: any, __: any, index: number) => index + 1
        },
        ...headers.map((header) => ({
            title: header,
            dataIndex: header,
            key: header,
            width: narrowHeaders.includes(header) ? 100 : 200,
            ellipsis: true,
            render: (value: any) => {
                if (Array.isArray(value)) {
                    // 生成单行字符串
                    const text = value
                        .map((item: Param) =>
                            Object.entries(item)
                                .map(([key, val]) => `${key}: ${val || "空"}`)
                                .join(", ")
                        )
                        .join(" | ");

                    return (
                        <span className="block truncate max-w-[150px]">
                {text}
            </span>
                    );
                }
                return (
                    <span className="block truncate">
                    {value}
                    </span>
                );
            }
        })),
        {
            title: "操作",
            key: "action",
            render: (_: any, instance: PipelineInstance) => (
                <>
                    <Button
                        type="primary"
                        style={{marginRight: 8}}
                        onClick={() => {
                            const oldContent = pipelines.find((item) => item.id === instance.id)
                            form.setFieldsValue(oldContent);
                            setIsEditor(true);
                            setModalState({visible: true, nodeId: instance.id});
                            showModal()
                        }}
                    >
                        编辑
                    </Button>
                    <Button
                        type="primary"
                        style={{marginRight: 8}}
                        onClick={() => {
                            Modal.confirm({
                                title: "确认删除",
                                content: `您确定要删除管道 "${instance.id}" 吗？`,
                                onOk: () => {
                                    deletePipelineInstance(instance.id);
                                },
                                okText: "是",
                                cancelText: "否",
                            });
                        }}
                    >
                        删除
                    </Button>
                </>
            ),
        },
    ];
    // 显示弹出对话框
    const showModal = () => {
        setIsModalVisible(true);
    };
    // 关闭弹出对话框并重置表单
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };
    //删除指定的实例
    const deletePipelineInstance = async (instanceID: string) => {
        const cheng = await removePipelineInstance(instanceID, appConfig.userID, projectConfig.project_id);
        if (!cheng) return;
        const updatedPipelines = pipelines.filter((item) => item.id !== instanceID);
        setPipelines(updatedPipelines);
    };
    const {handleKeyDown} = useHandle()
    // 确认后，通过表单数据创建新的管道实例
    const handleOk = () => {
        form
            .validateFields()
            .then((values: PipelineInstance) => {
                const newPipeline: PipelineInstance = {
                    id: values.id,
                    author: values.author,
                    describe: values.describe,
                    pipe_instance_name: values.pipe_instance_name, //直接使用字符串
                    pipe_type_id: values.pipe_type_id, // 从表单中获取pipe_type_name
                    data_item_comes: values.data_item_comes || [],
                    data_item_gos: values.data_item_gos || [],
                    pipe_input_data: values.pipe_input_data || [],
                    pipe_output_data: values.pipe_output_data || [],
                    pipe_config_items: values.pipe_config_items || [],
                    pipe_mount_id: values.pipe_mount_id, // 从表单中获取pipe_mount_id
                };
                console.log("新的管道实例", newPipeline)
                if (isEditor) {
                    updatePipelineInstance(newPipeline, appConfig.userID, projectConfig.project_id)
                        .then(() => {
                            const updatedPipelines = pipelines.map(item =>
                                item.id === newPipeline.id ? newPipeline : item
                            );
                            setPipelines(updatedPipelines);

                            const updatedItem = updatedPipelines.find(item => item.id === newPipeline.id);
                            const functionCodeItem = updatedItem?.pipe_config_items.find(
                                item => item.name === 'function_code'
                            );
                            console.log('本地状态已更新，function_code值为:', functionCodeItem?.value);

                            setIsModalVisible(false);
                            form.resetFields();
                        });
                    return;
                }
                addnewPipeInstance(newPipeline).then(console.log);
                setIsModalVisible(false);
                form.resetFields();
            })
            .catch((error) => {
                console.log("表单校验失败:", error);
            });
    };
    const addnewPipeInstance = async (newPipeInstance: PipelineInstance) => {
        setIsDirty(true)
        setNewPipelineInstance(newPipeInstance);
    }
    const handleGenerateCode = () => {
        const configItems = form.getFieldValue('pipe_config_items') || [];
        const sourceItem = configItems.find((item: any) => item.name === 'function_describe');
        const targetItem = configItems.find((item: any) => item.name === 'function_code');
        if (targetItem && sourceItem) {
            generateCode(appConfig.userID, sourceItem.value, form.getFieldValue('pipe_input_data'), form.getFieldValue('pipe_output_data')).then(function_code => {
                console.log('生成的 function_code:', function_code);
                const newItems = configItems.map(item =>
                    item.name === 'function_code' ? {...item, value: 'check'} : item
                )
                form.setFieldsValue({
                    pipe_config_items: newItems,
                })
                console.log('返回值已更新');
            })
        } else {
            console.log('未找到名称为 function_code 的配置项');
        }

    }

    const [keyword, setKeyword] = useState("");

    // 过滤用的数据
    const filteredPipelines = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return pipelines;

        return pipelines.filter((row: any) => {
            // 先看 id
            if (row.id && String(row.id).toLowerCase().includes(kw)) return true;

            // 再看所有 header 对应的字段
            for (const header of headers) {
                const cell = (row as any)[header];

                if (cell == null) continue;

                if (Array.isArray(cell)) {
                    // 你的 render 里是 Param[]，这里把所有值串起来做文本检索
                    const text = cell
                        .map((item) =>
                            Object.values(item ?? {})
                                .filter(Boolean)
                                .join(" ")
                        )
                        .join(" ");
                    if (text.toLowerCase().includes(kw)) return true;
                } else if (typeof cell === "object") {
                    const text = Object.values(cell ?? {})
                        .filter(Boolean)
                        .join(" ");
                    if (text.toLowerCase().includes(kw)) return true;
                } else {
                    if (String(cell).toLowerCase().includes(kw)) return true;
                }
            }

            return false;
        });
    }, [pipelines, headers, keyword]);

    useEffect(() => {
        if (!newPipelineInstance || !isDirty) return;
        setIsDirty(false);
        const addPipelineInstance = async () => {
            const cheng = await addPipeInstance(newPipelineInstance, appConfig.userID, projectConfig.project_id);
            if (cheng) {
                setPipelines([...pipelines, newPipelineInstance]);
                setNewPipelineInstance(null);
            }
        }
        addPipelineInstance();
    }, [newPipelineInstance]);
    useEffect(() => {
        if (!data) return;
        setPipelines(data);
    }, [data]);
    const [modalState, setModalState] = useState<ModalState>({ visible: false, nodeId: null });
    useEffect(() => {
        if(!modalState)return
        if(modalState.visible){
            const oldContent = pipelines.find((item) => item.id === modalState.nodeId)
            form.setFieldsValue(oldContent);
            setIsEditor(true);
            showModal()
        }
    }, [modalState]);

    /* 弹窗可见性 & 文本状态 */
    const [open, setOpen] = useState(false);
    const [importString, setImportString] = useState("");
    // 当前导入的具体的值
    useEffect(() => {
        const fetchImports = async () => {
            const cheng = await getImports(appConfig.userID, projectConfig.project_id)
            setImportString(cheng)
        }
        fetchImports().then(console.warn)
    }, []);
    const editImports = () => {
        setOpen(true);
    }
    // 更新导入类库
    const updateText = () => {
        updateImports(appConfig.userID, projectConfig.project_id, importString.split('\n')).then(console.log)
        setOpen(false)
    }
    return (
        <>
            <PipelineInstantCard
                nodeData={pipelines}
                setIsModalVisible={setModalState}
            />
            <Space.Compact
                className="flex space-x-4">
                <Button type="primary" onClick={() => {
                    setIsEditor(false);
                    showModal()
                }} style={{marginBottom: 16}}>
                    增加管道实例
                </Button>
            </Space.Compact>
            <Table
                dataSource={filteredPipelines}
                // dataSource={pipelines}
                columns={columns}
                rowKey="id"
                bordered
                tableLayout="auto"
                size="small"
                title={() => (
                    <Space
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <Search
                            allowClear
                            placeholder="搜索 ID 或任意字段"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onSearch={(value) => setKeyword(value)}
                            style={{ width: 260 }}
                        />
                        <div>管道实例列表</div>
                    </Space>
                )}
                // title={() => <div>管道实例列表</div>}
            />
            <Modal
                title={isEditor ?(<div className="flex space-x-4">
                    <span>编辑管道实例</span>
                    <Button danger key="delete" onClick={
                        () => {
                            Modal.confirm({
                                title: "确认删除",
                                content: `您确定要删除管道 "${modalState.nodeId}" 吗？`,
                                onOk: () => {
                                    deletePipelineInstance(modalState.nodeId);
                                    setIsModalVisible(false);
                                },
                                okText: "是",
                                cancelText: "否",
                            });
                        }}
                    >
                        删除
                    </Button>
                </div>):"增加管道实例"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
                width={1200}
            >
                <Form
                    form={form}
                    initialValues={generatePipelineInstance()}
                    layout="vertical"
                >
                    {/* 隐藏的 ID 字段 */}
                    <Form.Item
                        name="id"
                        // hidden={isEditor}
                        label="管道实例ID"
                    >
                        <Input disabled/>
                    </Form.Item>
                    {/* 隐藏的 ID 字段 */}
                    <Form.Item
                        name="data_item_comes"
                        hidden={true}
                    />
                    <Form.Item
                        name="data_item_gos"
                        hidden={true}
                    />
                    <Form.Item
                        name="author"
                        label="作者"
                        rules={[{required: true, message: "请输入作者"}]}
                    >
                        <Input placeholder="请输入作者"/>
                    </Form.Item>
                    <Form.Item
                        name="describe"
                        label="描述"
                        rules={[{required: true, message: "请输入描述"}]}
                    >
                        <Input.TextArea placeholder="请输入描述"/>
                    </Form.Item>
                    {/* 动态列表：管道实例名称 */}
                    <Form.Item
                        name="pipe_instance_name"
                        label="管道实例名称"
                        rules={[{required: true, message: "请输入管道实例名称"}]}
                    >
                        <Input.TextArea placeholder="请输入管道实例名称"/>
                    </Form.Item>
                    {/* 动态列表：管道类型ID */}
                    <Form.Item
                        name="pipe_type_id"
                        label="管道类型ID"
                        rules={[{required: true, message: "请输入管道实例名称"}]}
                    >
                        <Select>
                            {pipeTypes.map(pipe => (
                                <Select.Option key={pipe.id} value={pipe.id}>
                                    {`${pipe.pipe_type_name}-${pipe.describe}`}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {/* 动态列表：管道输入数据 */}
                    <Form.List name="pipe_input_data">
                        {(fields, {add, remove}) => (
                            <>
                                <h3>管道输入数据</h3>
                                {
                                    fields && fields.length > 0 ? (fields.map((field) => (
                                        <div key={field.key} className="flex w-full gap-4">
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-name`}
                                                name={[field.name, "name"]}
                                                className="flex-[3]"
                                            >
                                                <CombinedSelect
                                                    pipeLines={
                                                        pipelines.filter(pipe => pipe.id !== form.getFieldValue("id"))
                                                    }
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-type`}
                                                name={[field.name, "type"]}
                                                rules={[{required: true, message: "请选择类型"}]}
                                                className="flex-1"
                                            >
                                                <Select
                                                    placeholder="类型"
                                                    value={field.name || undefined}
                                                >
                                                    {Object.values(DaFormat).map(format => (
                                                        <Select.Option key={format} value={format}>
                                                            {format}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-describe`}
                                                name={[field.name, "describe"]}
                                                rules={[{required: true, message: "请输入描述"}]}
                                                className="flex-1"

                                            >
                                                <Input placeholder="描述"/>
                                            </Form.Item>
                                            {form.getFieldValue("pipe_type_id")?.endsWith("common") && (
                                                <Button
                                                    danger
                                                    className="flex-none"
                                                    onClick={() => remove(field.name)} // 删除当前字段
                                                >
                                                    删除
                                                </Button>
                                            )}
                                        </div>
                                    ))) : <Alert
                                        message="无管道输入数据"
                                        type="info" // 设置为警告样式
                                        showIcon
                                        style={{marginTop: "8px", fontSize: "16px"}}
                                    />
                                }
                                {form.getFieldValue("pipe_type_id")?.endsWith("common") && (
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block>
                                            新增输入数据
                                        </Button>
                                    </Form.Item>
                                )}
                            </>
                        )}
                    </Form.List>
                    <Form.List name="pipe_output_data">
                        {(fields, {add, remove}) => (
                            <>
                                <h3>管道输出数据</h3>
                                {
                                    fields && fields.length > 0 ? (fields.map((field) => (
                                        <div key={field.key} className="flex w-full gap-4">
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-name`}
                                                name={[field.name, "name"]}
                                                className="flex-1"
                                            >
                                                <Input placeholder="名称"/>
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-type`}
                                                name={[field.name, "type"]}
                                                rules={[{required: true, message: "请选择类型"}]}
                                                className="flex-1"
                                            >
                                                <Select
                                                    placeholder="类型"
                                                    value={field.name || undefined}
                                                >
                                                    {Object.values(DaFormat).map(format => (
                                                        <Select.Option key={format} value={format}>
                                                            {format}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-describe`}
                                                name={[field.name, "describe"]}
                                                rules={[{required: true, message: "请输入描述"}]}
                                                className="flex-1"
                                            >
                                                <Input placeholder="描述"/>
                                            </Form.Item>
                                            {form.getFieldValue("pipe_type_id")?.endsWith("common") && (<Button
                                                danger
                                                className="flex-none"
                                                onClick={() => remove(field.name)} // 删除当前字段
                                            >
                                                删除
                                            </Button>)}
                                        </div>
                                    ))) : <Alert
                                        message="无管道输出数据"
                                        type="info" // 设置为警告样式
                                        showIcon
                                        style={{marginTop: "8px", fontSize: "16px"}}
                                    />
                                }
                                {form.getFieldValue("pipe_type_id")?.endsWith("common") && (
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block>
                                            新增输出字段
                                        </Button>
                                    </Form.Item>
                                )}
                            </>
                        )}
                    </Form.List>
                    <Form.List name="pipe_config_items">
                        {(fields) => (
                            <>
                                <h3>管道配置项内容</h3>
                                {fields && fields.length > 0 ? (fields.map((field) => (
                                    <>
                                    <div key={field.key} className="flex w-full gap-4">
                                        <Form.Item
                                            {...field}
                                            key={`${field.key}-name`}
                                            name={[field.name, "name"]}
                                            className="flex-1"
                                        >
                                            <Input placeholder="名称" readOnly/>
                                        </Form.Item>
                                        {form.getFieldValue(["pipe_config_items", field.name, "name"])?.startsWith("is_") ?
                                            <Form.Item
                                                {...field}
                                                key={`${field.key}-value`}
                                                name={[field.name, "value"]}
                                                className="flex-[2]"
                                                rules={[{required: true, message: "请选择状态"}]}
                                            >
                                                <Select placeholder="请选择">
                                                    <Select.Option value="true">true</Select.Option>
                                                    <Select.Option value="false">false</Select.Option>
                                                </Select>
                                            </Form.Item> :
                                            <>
                                                <Form.Item
                                                    {...field}
                                                    key={`${field.key}-value`}
                                                    name={[field.name, "value"]}
                                                    rules={[{required: true, message: "请输入值"}]}
                                                    className="flex-[2]"
                                                >
                                                    <Input.TextArea
                                                        rows={12}
                                                        autoSize={{minRows: 2, maxRows: 24}}
                                                        onKeyDown={handleKeyDown}
                                                        style={{
                                                            width: '100%', // 或者具体像 800px
                                                            fontFamily: 'SFMono-Regular, Menlo, monospace',
                                                            whiteSpace: 'pre',            // 保留缩进
                                                        }}
                                                        placeholder="在此粘贴/编写 Python 代码…"
                                                    />
                                                </Form.Item>
                                            </>
                                        }
                                        <Form.Item
                                            {...field}
                                            key={`${field.key}-describe`}
                                            name={[field.name, "describe"]}
                                            className="flex-1"
                                        >
                                            <Input placeholder="描述" readOnly/>
                                        </Form.Item>
                                        <Form.Item
                                            noStyle
                                            dependencies={['pipe_type_id']}
                                            shouldUpdate
                                        >
                                            {({getFieldValue}) => {
                                                const id = getFieldValue('pipe_type_id');
                                                const name = getFieldValue(['pipe_config_items', field.name, 'name'])
                                                console.log("id", id, "name", name)
                                                if (id && id === 'pipeline_template_ai_code_common' && name && name === "function_code") return (
                                                    <><Button
                                                        type="primary"
                                                        onClick={handleGenerateCode}
                                                    >
                                                        生成代码
                                                    </Button>
                                                    <Button
                                                        type="primary"
                                                        onClick={editImports}
                                                    >
                                                        导入模块
                                                    </Button>
                                                        {/* 弹窗 + txt 编辑框 */}
                                                        <Modal
                                                            title="编辑模块内容"
                                                            open={open}
                                                            onOk={updateText}
                                                            onCancel={() => setOpen(false)}
                                                            okText="保存"
                                                            width={600}
                                                        >
                                                            <TextArea
                                                                rows={12}
                                                                value={importString}
                                                                onChange={(e) => setImportString(e.target.value)}
                                                                placeholder="在此粘贴或编辑模块代码…"
                                                                spellCheck={false}
                                                                className="font-mono"
                                                            />
                                                        </Modal>
                                                    </>
                                                );
                                            }}
                                        </Form.Item>
                                    </div>
                                        <Select
                                            placeholder="选择管道ID"
                                            onChange={(selectedValue: string) => {
                                                form.setFieldValue(['pipe_config_items', field.name, 'value'], selectedValue);
                                            }}
                                            className="w-full"
                                        >
                                            {pipelines.map(pipe => (
                                                <Select.Option key={pipe.id} value={pipe.id}>
                                                    {`${pipe.pipe_type_id}-${pipe.id}-${pipe.describe}`}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </>
                                ))) : <Alert
                                    message="无管道配置项"
                                    type="info" // 设置为警告样式
                                    showIcon
                                    style={{marginTop: "8px", fontSize: "16px"}}
                                />
                                }
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </>
    );
};

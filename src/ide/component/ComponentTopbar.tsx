import React, {useEffect, useRef, useState} from "react";
import {Row, Col, Button, Input, message, Modal, Space, InputRef, Form, Switch, Select, Typography, Spin} from 'antd';
import {useTypeConfig, useCompConfig, useAppConfig, useProject} from "@/context";
import {
    ComponentConfig, defaultCompConfig, deleteComponentType, fetchConfigForCompo, generateComponents,
    generateComponentsIndex,
    generateDynamicImport, getCompoFromInner,
    getComponentNames, getSonFromInner, LOW_USER_NAME, nativeOptions, syncLocalCompConfig,
    updateComponent, updateComponentConfig, updateComponentIndex, updateDynamicImport, USER_NAME
} from "@/tools";
import {useNavigate} from "react-router-dom";

export const ComponentTopbar: React.FC = () => {
    // 加载中
    const [loading, setLoading] = useState<boolean>(false);
    const [isNative, setIsNative] = useState<boolean>(false);
    // 用户属性
    const {appConfig} = useAppConfig();
    // 项目配置
    const {projectConfig} = useProject();
    // 包含父组件和子组件
    const {InnerComp, setInnerCompType} = useTypeConfig();
    // 配置上下文
    const {compConfig, changeCompConfig} = useCompConfig();
    // 父组件名称
    const [parentComponentName, setParentComponentName] = useState<string>(null);
    // 组件tsx是否存在
    const [componentExists, setComponentExists] = useState<boolean>(false);
    // 跳转到新组件
    const navigate = useNavigate();
    // 输入框引用
    const inputRef = useRef<InputRef>(null); // Ref to the Input component
    // 临时存储修改名称
    const [sonInputValue, setSonInputValue] = useState("");
    // 重置创建状态
    const confirmReset = () => {
        Modal.confirm({
            title: `确认${componentExists ? "重置" : "创建"}`,
            content: `您确定要${componentExists ? "重置" : "创建"}组件"${getCompoFromInner(InnerComp)}"吗?`,
            onOk: () => {
                const compconfig = defaultCompConfig(InnerComp, isNative, parentComponentName)
                changeCompConfig(compconfig)
                saveComponentType(compconfig).then()
            },
            okText: "是",
            cancelText: "否",
        });
    };
    // 保存组件类型
    const saveComponentType = async (configData: ComponentConfig) => {
        if (!InnerComp.trim()) {
            message.warning("请输入内部组件类型");
            return;
        }
        console.log("生成组件文件的配置", configData)
        // 更新状态 组件内容 引发保存
        const initCode = generateComponents(configData)
        console.log("生成组件文件", initCode)
        updateNewFile(initCode, configData).then(r => {
            console.log("动态配置获取的组件", dynamicComp, InnerComp)
            if (!dynamicComp.components.includes(getCompoFromInner(InnerComp))) {
                updateIndexDynamicImport()
            }
        })
    }
    // 更新索引和动态导入文件
    const updateIndexDynamicImport = async () => {
        getComponentNames(projectConfig.owner_id).then(r => {
            console.log("获取的组件", r)
            const newDynamicComp = {...dynamicComp, components: r}
            console.log("动态配置的获取的组件", newDynamicComp)
            // 异常情况
            // if (!newDynamicComp.components.includes(getCompoFromInner(InnerComp))) return
            // 正常处理 生成索引代码
            const indexCode = generateComponentsIndex(newDynamicComp)
            // 更新索引文件
            updateIndexFile(indexCode).then(r => {
                const dynamicCode = generateDynamicImport(newDynamicComp)
                updateDynamicImportFile(dynamicCode).then(() => {
                    setDynamicComp(newDynamicComp)
                    navigate(`/component/${InnerComp}`)
                })
            })
        })
    }
    // 更新最新文件,更新组件
    const updateNewFile = async (initCode: string, configData: ComponentConfig) => {
        try {
            const response = await updateComponent(appConfig.userID, getCompoFromInner(InnerComp), initCode);
            const cheng = await updateComponentConfig(appConfig.userID, getCompoFromInner(InnerComp), configData);
            console.log("保存组件文件", response);
            console.log("保存组件配置文件", configData);
            message.success(`新建成功，从服务器下载更新${getCompoFromInner(InnerComp)}.tsx到本地，再刷新页面`)
        } catch (error) {
            console.error("更新失败:", error);
        }
    };
    const updateIndexFile = async (indexCode: string) => {
        try {
            const response = await updateComponentIndex(appConfig.userID, indexCode);
            console.log("影响了数量", response);
            message.success(`新建成功，从服务器更新index.tsx到本地，再刷新页面`)
        } catch (error) {
            console.error("更新失败:", error);
        }
    }
    const updateDynamicImportFile = async (dynamicCode: string) => {
        try {
            const response = await updateDynamicImport(appConfig.userID, dynamicCode);
            console.log("影响了数量", response);
            message.success(`新建成功，从服务器更新dynamic.tsx到本地，再刷新页面`)
        } catch (error) {
            console.error("更新失败:", error);
        }
    }

    // 子组件名称表单
    const [formSonComp] = Form.useForm();
    // 解析器使用的配置项  可用的组件名称 用来生成后端的组件 索引文件和 动态导入文件 的 必须按照特定格式
    const [dynamicComp, setDynamicComp] = useState({components: ["Container"], username: LOW_USER_NAME,});
    // 监听组件列表配置项，决定组件存在状态的值
    useEffect(() => {
        if (!dynamicComp) return;
        setComponentExists(dynamicComp.components.includes(getCompoFromInner(InnerComp)));
    }, [dynamicComp]);


    // 不管是否存在服务器配置 首先修改本地配置
    useEffect(() => {
        if (!compConfig) return;
        console.log("配置信息", compConfig)
        setParentComponentName(compConfig.parentComponent)
        setIsNative(compConfig.isNative)
        setSonInputValue(compConfig.sonComponent)
        // 设置子组件
        formSonComp.setFieldsValue({sonComp: compConfig.sonComponent})
    }, [compConfig]);

    // 不管是否存在服务器配置 首先修改本地配置
    useEffect(() => {
        if (!parentComponentName || !compConfig) return;
        changeCompConfig({...compConfig, parentComponent: parentComponentName})
    }, [parentComponentName]);

    // 不管是否存在服务器配置 首先修改本地配置
    useEffect(() => {
        if (!InnerComp || !compConfig) return;
        setParentComponentName(compConfig.parentComponent)
        changeCompConfig({
            ...compConfig,
            innerComponent: InnerComp,
            sonComponent: getSonFromInner(InnerComp, parentComponentName)
        })
    }, [InnerComp]);

    // 刷新,监听组件列表配置项，决定组件存在状态的值
    useEffect(() => {
        if (!InnerComp) return;
        const fetchConfig = async () => {
            const config = await fetchConfigForCompo(appConfig.userID, getCompoFromInner(InnerComp))
            console.log("从服务器加载配置文件", config)
            if (!config) return;
            // 动态修改内容，融合本地预设不变的内容 todo 开发时使用 后续关闭
            const syncLocalConfig = syncLocalCompConfig(config)
            console.log("同步后的配置文件", syncLocalConfig)
            changeCompConfig(syncLocalConfig)
        };
        fetchConfig();
    }, [InnerComp]);

    // 刷新获取组件列表
    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const cheng = await getComponentNames(projectConfig.owner_id); // Fetch data from the given URL
                setDynamicComp(prev => ({...prev, components: cheng})); // Update origin dynamicComp with new cheng value
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData().then(() => setLoading(false)); // Trigger data fetching
    }, []); // Dependencies for the useEffect

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
        <Row className="flex items-center gap-6 px-4 py-2 bg-gray-100 rounded shadow">
            {/* 中间输入框 */}
            <Col className="flex-grow">
                <Space>
                    <span>{USER_NAME}</span>
                    <Switch
                        size="small"
                        checked={isNative}
                        onChange={(checked) => {
                            setIsNative(checked);
                            if (!compConfig) return
                            changeCompConfig({...compConfig, isNative: checked})
                        }}
                        checkedChildren="原生"
                        unCheckedChildren="组件"
                    />
                    {isNative ? <Select
                            size="small"
                            className="w-[80px]"
                            value={InnerComp}
                            onChange={value => {
                                setParentComponentName("")
                                setInnerCompType(value)
                            }
                            }
                        >
                            {nativeOptions.map(option => (
                                <Select.Option
                                    value={option}
                                    key={option}

                                >
                                    {option}
                                </Select.Option>
                            ))
                            }
                        </Select> :
                        <>
                            <span
                                style={{cursor: 'pointer', textDecoration: 'underline'}}
                                onClick={() => {
                                    const modal = Modal.confirm({
                                        title: '编辑父组件名称',
                                        content: (
                                            <Input
                                                ref={inputRef}
                                                defaultValue={parentComponentName ? parentComponentName : ""}
                                                placeholder="请输入父组件名称"
                                                onPressEnter={(e) => {
                                                    setParentComponentName((e.target as HTMLInputElement).value)
                                                    modal.destroy()
                                                }}
                                            />
                                        ),
                                        closable: true,
                                        footer: null,
                                        afterOpenChange: (open => {
                                            if (open) {
                                                inputRef.current.focus();
                                            }
                                        }),
                                    });
                                }}
                            >
                                {parentComponentName || '点击编辑父组件'}
                            </span>
                            <Form
                                layout="inline"
                                form={formSonComp}
                            >
                                <Form.Item name="sonComp">
                                    <Space.Compact style={{ width: "100%" }}>
                                        <Input
                                            placeholder="请指定组件类型"
                                            value={sonInputValue}
                                            onChange={(e) => setSonInputValue(e.target.value)}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                const innerComp = `${parentComponentName ?? ""}${sonInputValue}`;
                                                console.log("组成的内部组件名称", innerComp);
                                                setInnerCompType(innerComp);
                                                formSonComp.setFieldsValue({ sonComp: sonInputValue }); // 可选：同步到 Form.Item
                                            }}
                                        >
                                            确认
                                        </Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Form>
                            <Typography.Text >{`${USER_NAME}${InnerComp}`}</Typography.Text>
                        </>
                    }
                </Space>
            </Col>

            {/* 按钮部分 */}
            <Col>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={confirmReset}
                    className="bg-white text-gray-700 hover:text-blue-500 hover:border-blue-500"
                >
                    {componentExists ? '重置组件为空' : '创建新组件'}
                </Button>
            </Col>

            {/* 按钮部分 */}
            <Col>
                <Button
                    size="small"
                    variant="outlined"
                    disabled={!componentExists}
                    onClick={() => saveComponentType(compConfig)}
                    className="bg-white text-gray-700 hover:text-blue-500 hover:border-blue-500"
                >
                    保存组件配置
                </Button>
            </Col>

            {/* 按钮部分 */}
            <Col>
                <Button
                    size="small"
                    variant="outlined"
                    disabled={!componentExists}
                    onClick={() => {
                        Modal.confirm({
                            title: "确认清除",
                            content: `您确定要清除组件"${getCompoFromInner(InnerComp)}"吗?`,
                            onOk: () => {
                                deleteComponentType(appConfig.userID, getCompoFromInner(InnerComp)).then(
                                    () => updateIndexDynamicImport()
                                )
                                message.success("组件已清除");
                            },
                            okText: "是",
                            cancelText: "否",
                        });
                    }}
                    className="bg-white text-gray-700 hover:text-blue-500 hover:border-blue-500"
                >
                    清除组件
                </Button>
            </Col>

        </Row>
    )
}

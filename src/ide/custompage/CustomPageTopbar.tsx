import React, {useEffect, useRef, useState} from "react";
import {Row, Col, Button, Input, message, Modal, Space, InputRef, Form, Switch, Select, Spin} from 'antd';
import {useTypeConfig, useCompConfig, useAppConfig, useProject} from "@/context";
import {
    BaseWebUrl,
    ComponentConfig,
    CUSTOM_PRE,
    defaultCompConfig,
    defaultCustomCompConfig,
    deleteComponentType,
    fetchConfigForCompo, generateComponents,
    generateComponentsIndex, generateCustomComponents, generateCustomPage,
    generateDynamicImport,
    getCompoFromInner,
    getComponentNames,
    getSonFromInner,
    LOW_USER_NAME,
    nativeOptions,
    syncLocalCompConfig,
    updateComponent,
    updateComponentConfig,
    updateComponentIndex,
    updateDynamicImport,
    USER_NAME
} from "@/tools";
import {useNavigate} from "react-router-dom";

export const CustomPageTopbar: React.FC = () => {
    // 加载中
    const [loading, setLoading] = useState<boolean>(false);
    // 用户属性
    const {appConfig} = useAppConfig();
    // 项目配置
    const {projectConfig} = useProject();
    // 配置组件类型 inner 只是为了和原先保持一致 不代表内在
    const {InnerComp, setInnerCompType} = useTypeConfig();
    // 配置上下文 和 通用组件使用一套系统
    const {compConfig, changeCompConfig} = useCompConfig();
    // 组件tsx是否存在
    const [componentExists, setComponentExists] = useState<boolean>(false);
    // 跳转到新组件
    const navigate = useNavigate();

    // 重置创建状态
    const confirmReset = () => {
        Modal.confirm({
            title: `确认${componentExists ? "重置" : "创建"}`,
            content: `您确定要${componentExists ? "重置" : "创建"}组件"${InnerComp}"吗?`,
            onOk: () => {
                // 得到新的配置
                const compconfig = defaultCustomCompConfig(InnerComp)
                // 改变上下文的配置
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
        const initCode = generateCustomPage(configData)
        console.log("生成组件文件", initCode)
        updateNewFile(initCode, configData).then(r => {
            console.log("动态配置获取的组件", dynamicComp, InnerComp)
            if (!dynamicComp.components.includes(InnerComp)) {
                updateIndexDynamicImport()
            }
        })
    }

    // 更新最新文件,更新组件
    const updateNewFile = async (initCode: string, configData: ComponentConfig) => {
        try {
            const response = await updateComponent(appConfig.userID, InnerComp, initCode);
            const cheng = await updateComponentConfig(appConfig.userID, InnerComp, configData);
            console.log("保存组件文件", response);
            console.log("保存组件配置文件", configData);
            message.success(`新建成功，从服务器下载更新${InnerComp}.tsx到本地，再刷新页面`)
        } catch (error) {
            console.error("更新失败:", error);
        }
    };
    // 更新索引和动态导入文件
    const updateIndexDynamicImport = async () => {
        getComponentNames(projectConfig.owner_id).then(r => {
            console.log("获取的组件", r)
            const newDynamicComp = {...dynamicComp, components: r}
            console.log("动态配置的获取的组件", newDynamicComp)
            // 异常情况
            // if (!newDynamicComp.components.includes(InnerComp)) return
            // 正常处理 生成索引代码
            const indexCode = generateComponentsIndex(newDynamicComp)
            // 更新索引文件
            updateIndexFile(indexCode).then(r => {
                const dynamicCode = generateDynamicImport(newDynamicComp)
                updateDynamicImportFile(dynamicCode).then(() => {
                    setDynamicComp(newDynamicComp)
                    navigate(`/custom_page/${InnerComp}`)
                })
            })
        })
    }
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
    // 可用的组件名称 用来生成配置文件的 必须按照特定格式
    const [dynamicComp, setDynamicComp] = useState({components: [], username: projectConfig.owner_id});
    // 监听组件列表配置项，决定组件存在状态的值
    useEffect(() => {
        if (!dynamicComp) return;
        setComponentExists(dynamicComp.components.includes(InnerComp));
    }, [dynamicComp]);

    // 组件类型明确后
    useEffect(() => {
        if (!InnerComp || !compConfig) return;
        changeCompConfig({
            ...compConfig,
            innerComponent: InnerComp
        })
    }, [InnerComp]);

    // 刷新,监听组件列表配置项，这是生成组件代码的基础，是一些属性的配置值
    useEffect(() => {
        if (!InnerComp) return;
        const fetchConfig = async () => {
            const config = await fetchConfigForCompo(appConfig.userID, InnerComp)
            if (!config) return;
            console.log("从服务器加载配置文件", config)
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
                    <Input
                        placeholder="输入组件类型"
                        defaultValue={InnerComp}
                        onChange={(e) => {
                            setInnerCompType(e.target.value);
                        }}
                    />
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
                    onClick={() => {
                        Modal.confirm({
                            title: "确认清除",
                            content: `您确定要清除组件"${InnerComp}"吗?`,
                            onOk: () => {
                                deleteComponentType(appConfig.userID, InnerComp).then(
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

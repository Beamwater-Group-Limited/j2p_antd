import React, {useState, useEffect, useMemo} from "react";
import {List, Card, Typography, Button, Row, Col, Spin} from "antd";
import {
    addNewChart,
    addNewComponent,
    addNewCustomComponent, addNewCustomPage, addNewX,
    BaseWebUrl, checkChart,
    checkCustomCbtaiCompo, checkCustomPage,
    ComponentProp,
    getComponents, getCompoType, getInnerFromChartCompo,
    getInnerFromCompo, getPages, getRuntimeComponents, handleOpenComponent
} from "@/tools";
import {useAppConfig} from "@/context";

const ComponentListApp: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true); // 加载状态
    const {appConfig } = useAppConfig()
    const [customComponents, setCustomComponents] = useState<ComponentProp[]>([]); // 自定义组件列表
    const [grouped, setGrouped] = useState<Record<string, ComponentProp[]>>();
    // 获取组件列表
    useEffect(() => {
        const fetchCustomComponents = async () => {
            try {
                setIsLoading(true);
                const components: ComponentProp[] = await getComponents(appConfig.userID); // 从后台获取组件列表
                setCustomComponents(components);
            } catch (error) {
                console.error("获取自定义组件列表失败:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomComponents();
    }, []);
    const [customComps, setCustomComps] = useState<ComponentProp[]>([])

    const fetchCustomCompos = async () => {
        const cheng = await getRuntimeComponents(appConfig.userID)
        setCustomComps(cheng)
    }
    useEffect(() => {
        fetchCustomCompos()
    }, []);
    useEffect(() => {
        if(! customComponents) return
        const grouped = customComponents.reduce((acc, cur) => {
            const key = getCompoType(cur.component_name)
            if (!acc[key]) {  acc[key] = []; }
            acc[key].push(cur);
            return acc;
        }, {} as Record<string, typeof customComponents>);
        setGrouped(grouped);
    }, [customComponents]);

    if (isLoading)
        return (
        <div className="loading-container">
            { appConfig.IS_SPIN?
                <Spin tip="加载中，请稍等..." size="large" />:
                <div/>
            }
        </div>
    );

    return (
        <div className="ComponentListApp">
            <Typography.Title level={4} style={{ textAlign: "center" }}>
                组件列表
            </Typography.Title>
            <Row justify="center" style={{marginBottom: '20px'}}>
                <Button
                    type="primary"
                    style={{marginRight: '10px'}}
                    onClick={ addNewComponent}
                >创建组件</Button>
                <Button
                    type="primary"
                    style={{marginRight: '10px'}}
                    onClick={ addNewCustomComponent}
                >创建解析组件</Button>
                <Button
                    type="primary"
                    style={{marginRight: '10px'}}
                    onClick={ addNewCustomPage}
                >创建自定义组件</Button>
                <Button
                    type="primary"
                    style={{marginRight: '10px'}}
                    onClick={ addNewChart}
                >创建图表组件</Button>
                <Button
                    type="primary"
                    style={{marginRight: '10px'}}
                    onClick={ addNewX}
                >创建大模型组件</Button>
            </Row>
            <Row justify="center">
                <Col span={18}>
                    { Object.entries(grouped).map(([category,components]) => (
                        <div key={category}>
                        <Typography.Title level={4}>{category}</Typography.Title>
                        <List
                            grid={{ gutter: 16, column: 6 }}
                            dataSource={components}
                            renderItem={(component) => (
                                <List.Item>
                                    <Card
                                        title={component.owner_id}
                                        extra={
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() => handleOpenComponent(component.component_name)}
                                            >
                                                打开
                                            </Button>
                                        }
                                    >
                                        <Typography.Paragraph>
                                            {component.component_name}
                                        </Typography.Paragraph>
                                    </Card>
                                </List.Item>
                            )}
                        />
                        </div>
                    ) )
                    }
                </Col>
            </Row>
            <Row justify="center">
                <Col span={18}>
                    <Typography.Title level={4}>自创建渲染组件</Typography.Title>
                    <List
                        grid={{ gutter: 16, column: 6 }}
                        dataSource={customComps.filter(component => checkCustomCbtaiCompo(component.component_name))}
                        renderItem={(component:ComponentProp) => (
                            <List.Item>
                                <Card
                                    title={component.owner_id}
                                    extra={
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => handleOpenComponent(component.component_name)}
                                        >
                                            打开
                                        </Button>
                                    }
                                >
                                    <Typography.Paragraph>
                                        {component.component_name}
                                    </Typography.Paragraph>
                                </Card>
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default ComponentListApp;

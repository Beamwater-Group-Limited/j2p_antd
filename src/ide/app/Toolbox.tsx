import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Row, Col, Button, Spin, Collapse, Badge, Empty, Typography } from 'antd';
import type { CollapseProps } from 'antd';
import { useEditor, Element } from '@craftjs/core';
import { getComponentNames } from '@/tools';
import { useAppConfig, useProject } from '@/context';

/**
 * Toolbox — 分两部分可折叠显示：置顶组件 + 其他组件
 * - 兼容原有逻辑（fetchComponents / connectors.create）
 * - 置顶名单来源：appConfig.featuredNames（string[]），若无则为空数组
 * - 支持自定义每行数量（colSpan）与默认展开项（defaultActiveKeys）
 */
export const Toolbox: React.FC = React.memo(() => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { appConfig } = useAppConfig();
    const { projectConfig } = useProject();
    const [availableComponents, setAvailableComponents] = useState<string[]>([]);
    // 受控状态
    const [activeKeys, setActiveKeys] = useState<string[]>(['featured', 'others']);
    const { connectors, resolver } = useEditor((state) => {
        const resolver = state.options.resolver as Record<string, any>;
        return { resolver };
    });

    const fetchComponents = useCallback(async () => {
        setIsLoading(true);
        try {
            if (projectConfig?.owner_id) {
                const list = await getComponentNames(projectConfig.owner_id);
                setAvailableComponents(list || []);
            } else {
                setAvailableComponents([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [projectConfig?.owner_id]);

    useEffect(() => {
        fetchComponents();
    }, [fetchComponents]);

    // 置顶名单，默认空数组；也可在此处硬编码一组默认值
    const featuredNames: string[] = useMemo(() => appConfig?.featuredNames || [], [appConfig]);
    const featuredSet = useMemo(() => new Set(featuredNames), [featuredNames]);

    const { featuredList, otherList } = useMemo(() => {
        const feat: string[] = [];
        const other: string[] = [];
        for (const name of availableComponents) {
            (featuredSet.has(name) ? feat : other).push(name);
        }
        // 可选：按字母排序，便于查找
        feat.sort((a, b) => a.localeCompare(b));
        other.sort((a, b) => a.localeCompare(b));
        return { featuredList: feat, otherList: other };
    }, [availableComponents, featuredSet]);

    const colSpan = 6; // 24栅格 -> 每行4个
    // const defaultActiveKeys: CollapseProps['activeKey'] = ['featured', 'others'];

    const renderGrid = (list: string[]) => {
        if (!list.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        return (
            <Row gutter={[8, 8]}>
                {list.map((componentName) => {
                    const Component = resolver[componentName];
                    const disabled = !Component;
                    return (
                        <Col key={componentName} span={colSpan} className="pb-2">
                            <Button
                                type="dashed"
                                block
                                disabled={disabled}
                                className="h-12 text-xs rounded-2xl shadow-sm"
                                style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                                ref={(ref) => {
                                    if (!ref || !Component) return;
                                    if ((Component as any).isCanvas) {
                                        connectors.create(ref, <Element is={Component} canvas />);
                                    } else {
                                        connectors.create(ref, <Component />);
                                    }
                                }}
                            >
                                {componentName}
                            </Button>
                        </Col>
                    );
                })}
            </Row>
        );
    };
    // ...
    // 固定网格总高度（可改为 appConfig?.toolboxGridHeight 或传入 props）
    const GRID_HEIGHT = 980;
    const gridScrollStyle: React.CSSProperties = {
        maxHeight: GRID_HEIGHT,
        overflowY: 'auto',
        paddingRight: 4, // 预留滚动条空间，避免内容抖动
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                {appConfig?.IS_SPIN ? (
                    <Spin tip="加载中，请稍等..." size="large" />
                ) : (
                    <div />
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '16px' }}>
            <div className="mb-2">
                <Typography.Text type="secondary">拖拽任意按钮到画布以创建组件</Typography.Text>
            </div>

            <Collapse
                size="small"
                bordered
                activeKey={activeKeys}
                onChange={(keys) => setActiveKeys(Array.isArray(keys) ? (keys as string[]) : [keys as string])}
                expandIconPosition="end"
                items={[
                    {
                        key: 'featured',
                        label: (
                            <div className="flex items-center gap-2">
                                <span>置顶组件</span>
                                <Badge count={featuredList.length} overflowCount={999} />
                            </div>
                        ),
                        children: <div className="pt-1" style={gridScrollStyle}>{renderGrid(featuredList)}</div>,
                    },
                    {
                        key: 'others',
                        label: (
                            <div className="flex items-center gap-2">
                                <span>全部组件</span>
                                <Badge count={otherList.length} overflowCount={999} />
                            </div>
                        ),
                        children: <div className="pt-1" style={gridScrollStyle} >{renderGrid(otherList)}</div>,
                    },
                ]}
            />
        </div>
    );
});

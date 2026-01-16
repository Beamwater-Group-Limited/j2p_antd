import React, { useEffect, useRef, useState} from 'react';
import {Graph,Node} from '@antv/x6';
import '@antv/x6-react-shape';
import {Button, Progress, Space, Spin, Switch} from 'antd';
import {
    getPosition,
    getRandomColor,
    getScheduleList,
    ModalState,
    PIPE_FILL_COLOR,
    PIPE_ICON_MAP,
    PipelineInstance
} from "@/tools";
import {useAppConfig, useProject} from "@/context";
import {register} from "@antv/x6-react-shape";

export const PipelineInstantCard:React.FC<{
    nodeData:PipelineInstance[],
    setIsModalVisible: (state: ModalState) => void;
}> = ({nodeData,setIsModalVisible}) => {
    // 使用 useContext 从全局上下文中获取 globalId
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // 对 dom树元素的引用
    const containerRef = useRef(null);
    // 图像状态
    const [graph, setGraph] = useState(null);
    // 调度关系
    const [scheduleList, setScheduleList] = useState<Record<string, any>[]>([])
    // 位置关系
    const [positionList, setPositionList] = useState<string[]>([])
    // 是否显示状态节点
    const [showRightStateNodes, setShowRightStateNodes] = useState(true);
    const handleToggleRightStateNodes = (checked) => {
        setShowRightStateNodes(checked);
        graph.getCells().forEach(cell => {
            if (cell.getData()?.pipe_type_id === 'pipeline_template_output' ) {
                checked? cell.show():cell.hide()
            }
        })
    }
    // 是否显示状态节点
    const [showLeftStateNodes, setShowLeftStateNodes] = useState(true);
    const handleToggleLeftStateNodes = (checked) => {
        setShowLeftStateNodes(checked);
        graph.getCells().forEach(cell => {
            if (cell.getData()?.pipe_type_id === 'pipeline_template_input' ) {
                checked? cell.show():cell.hide()
            }
        })
    }
    register({
        shape: 'cbtai_node',
        width: 300,
        height: 40,
        component: ({node}) => {
            const data = node.getData();      // 建议统一用 getData()
            console.log('加入数据被处理', data);
            // 从节点属性获取自定义数据，例如标签或颜色
            const color = PIPE_FILL_COLOR[data.pipe_type_id] || PIPE_FILL_COLOR.default;
            // 在节点内容中渲染图标和其他内容
            return (
                <div
                    className="w-full h-full flex items-center p-3 gap-2 border border-black leading-tight"
                    style={{ background: color }}      // 动态背景仍用行内
                >
                    {/* 图标固定 18px，可按需调整 */}
                    <div className="bg-white rounded p-1 flex items-center justify-center">
                        {PIPE_ICON_MAP[data.pipe_type_id] ?? PIPE_ICON_MAP.default}
                    </div>
                    {/* 文本：上 ID，下描述 */}
                    <div className="flex flex-col">
                        <span>{data.id.slice(0, 8)}</span>
                        <span className="border-black text-[14px] ">{data.describe}</span>
                    </div>
                </div>
            );
        },
        ports: {
            groups: {
                left: {
                    position: 'left',
                    attrs: {circle: {magnet: true, stroke: '#8f8f8f', r: 5}},
                },
                right: {
                    position: 'right',
                    attrs: {circle: {magnet: true, stroke: '#8f8f8f', r: 5}},
                },
                top: {
                    position: 'top',
                    attrs: {circle: {magnet: true, stroke: '#eac328', r: 5}},
                },
                bottom: {
                    position: 'bottom',
                    attrs: {
                        circle: {magnet: true, r: 5, stroke: '#999', strokeWidth: 1, fill: '#fff'},
                    },
                },
            },
        }
    })

    const updateGraph = () => {
        // 生成节点
        nodeData.forEach((node) => {
            const pos = getPosition(positionList, node.id);
            const x = node.pipe_type_id === 'pipeline_template_output'
                ? 20
                : 20 + 350 * (pos.rowIndex + 1);
            const y = 20 + 50 * pos.colIndex;
            console.log("节点的位置", pos, x, y)
            graph.addNode({
                id: node.id,
                shape: 'cbtai_node',
                x,
                y,
                data:node,
                ports: {
                    items: [
                        ...node.pipe_input_data.map((p, i) => ({
                            id: p.name || `i.${i}`,
                            group: 'left',
                        })),
                        ...node.pipe_output_data.map((p, i) => ({
                            id: p.name || `o.${i}`,
                            group: 'right',
                        })),
                        ...node.pipe_config_items.map((p, i) => ({
                            id: p.name || `c.${i}`,
                            group: 'top',
                        })),
                        { id: node.id, group: 'bottom' },
                    ],
                },
            });
        });
        console.log(graph.toJSON())
        if(!scheduleList) return;
        scheduleList.forEach(schedule => {
            const edge = {
                ...schedule,
                attrs: {
                    line: {
                        stroke:  getRandomColor(),
                        strokeWidth: 2,
                    },
                },
            }
            graph.addEdge(edge)
        })
    };
    useEffect(() => {
        if (!graph || !nodeData || !positionList || nodeData.length === 0 || positionList.length === 0) return;
        console.log("准备显示的节点数据",nodeData)
        updateGraph()
    }, [nodeData, positionList]);
    // 组件加载执行部分
    useEffect(() => {
        // 创建图形实例
        const graph = new Graph({
            container: containerRef.current,
            height: 1000,
            grid: {
                visible: true,
                type: 'doubleMesh',
                args: [
                    {
                        color: '#eee', // 主网格线颜色
                        thickness: 1, // 主网格线宽度
                    },
                    {
                        color: '#ddd', // 次网格线颜色
                        thickness: 1, // 次网格线宽度
                        factor: 4, // 主次网格线间隔
                    },
                ],
            },
            panning: true, // 拖拽画布
            mousewheel: false, // 滚动缩放
            interacting: {
                nodeMovable: false, // 启用节点移动
                edgeMovable: false, // 禁用边的拖拽
                magnetConnectable: false,
            },
            autoResize: true,
            connecting: {                                       // 通用配置
                router: {
                    name: 'metro',
                    args: {
                        startDirections: ['right','top'],
                        endDirections: ['left','bottom'],
                        offset: [10,20], // 或者数组
                    },
                },
                connector: {
                    name: 'rounded',
                    args: {
                        radius: 15,
                    },
                },
            }
        });
        setGraph(graph);
        graph.on('node:click', ({ node, e }) => {
            console.log('点击的节点ID:', node.id);
            // 在这里编写点击后需要触发的逻辑
            setIsModalVisible({
                nodeId:node.id,
                visible:true,
            })
        });
        // 调试 节点加入
        // graph.on('node:added', ({ node }) => {
        //     console.log('真正进 model 的坐标 →', node.id, node.getPosition())
        // });
        setIsLoading(false);
        return () => {
            graph.dispose();
        };
    }, []);
    useEffect(() => {
        const fetchScheduleList = async () => {
            const cheng = await getScheduleList(appConfig.userID,projectConfig.project_id);
            console.log("获取调度列表", cheng)
            if (cheng) {
                // 位置
                setPositionList(cheng['position'])
                // 调度
                setScheduleList(cheng['edges'])
            }
        }
        fetchScheduleList();
    }, []);

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
        <>
            <Space.Compact
                className="flex space-x-4">
                <Button
                    type="primary"
                    onClick={() => graph.zoomToFit({ padding: 20 })}
                >
                    重置大小
                </Button>
                <Button
                    type="primary"
                    onClick={() => graph.centerContent()}
                >
                    居中显示
                </Button>
                <Button type="primary" onClick={() => {
                    const scale = graph.zoom();
                    const next = Math.min(scale + 0.1, 2); // 最大 2 倍
                    graph.zoom(next,{ absolute: true })
                }}>
                    放大
                </Button>
                <Button type="primary" onClick={() => {
                    const scale = graph.zoom();
                    const next = Math.max(scale - 0.1, 0.1); // 最小 0.1 倍
                    graph.zoom(next,{ absolute: true });
                }}>
                    缩小
                </Button>
                <Switch
                    checked={showRightStateNodes}
                    onChange={handleToggleRightStateNodes}
                    checkedChildren="隐藏右向状态节点"
                    unCheckedChildren="显示右向状态节点"
                />
                <Switch
                    checked={showLeftStateNodes}
                    onChange={handleToggleLeftStateNodes}
                    checkedChildren="隐藏左向状态节点"
                    unCheckedChildren="显示左向状态节点"
                />
            </Space.Compact>
            <div className="w-full h-full" >
                <div
                    ref={containerRef}
                    className=" border border-gray-300"
                />
            </div>
        </>
    );
};

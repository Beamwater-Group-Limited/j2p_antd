import React, { useEffect, useRef, useState } from "react";
import { useNode } from "@craftjs/core";
import { Line } from "@antv/g2plot";
import { Form, Input, InputNumber, Switch } from "antd";
//
export const ChartCbtaiLine = ({ className, data, xField,yField,seriesField,smooth,height }) => {
    const { connectors: { connect, drag } } = useNode();
    const chartContainerRef = useRef(null); // chart 容器引用
    const lineChartRef = useRef(null); // 保存 chart 实例

    useEffect(() => {
        if (chartContainerRef.current) {
            // 如果有现存的图表实例，销毁它以防止重复初始化
            if (lineChartRef.current) {
                lineChartRef.current.destroy();
                lineChartRef.current = null;
            }

            // 初始化折线图
            const lineChart = new Line(chartContainerRef.current, {
                data: data || [],
                xField:  xField ,
                yField:  yField ,
                seriesField:  seriesField ,
                smooth:  smooth ,
                height:  height ,
            });

            // 渲染折线图
            lineChart.render();
            lineChartRef.current = lineChart; // 保存实例
        }

        return () => {
            // 组件卸载时，安全销毁图表实例
            if (lineChartRef.current) {
                lineChartRef.current.destroy();
                lineChartRef.current = null; // 防止内存泄漏
            }
        };
    }, [ data,xField,yField,seriesField,smooth,height]);

    return (
        <div ref={ref => {
            if (ref) { connect(drag(ref)); }
            chartContainerRef.current = ref;
        }
        }
             className={ className }>
        </div>
    );
};
//
// // 配置面板
const ChartCbtaiLineSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    return (
        <Form labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
            <Form.Item label="图表数据">
                <Input.TextArea
                    rows={5}
                    value={JSON.stringify(props.data, null, 2)}
                    onChange={(e) =>
                        setProp((props) => (props.data = JSON.parse(e.target.value)))
                    }
                />
            </Form.Item>
            <Form.Item label="X 轴字段">
                <Input
                    value={props.xField}
                    onChange={(e) =>
                        setProp((props) => (props.xField = e.target.value))
                    }
                />
            </Form.Item>
            <Form.Item label="Y 轴字段">
                <Input
                    value={props.yField}
                    onChange={(e) =>
                        setProp((props) => (props.yField = e.target.value))
                    }
                />
            </Form.Item>
            <Form.Item label="平滑曲线">
                <Switch
                    checked={props.smooth}
                    onChange={(checked) =>
                        setProp((props) => (props.smooth = checked))
                    }
                />
            </Form.Item>
            <Form.Item label="图表高度">
                <InputNumber
                    min={100}
                    max={1000}
                    value={props.height}
                    onChange={(value) =>
                        setProp((props) => (props.height = value))
                    }
                />
            </Form.Item>
        </Form>
    );
};
//
// 组件的默认属性和配置
ChartCbtaiLine.craft = {
    displayName: "ChartCbtaiLine",
    props: {
        data: [
            { x: "2023-01", y: 10 },
            { x: "2023-02", y: 20 },
            { x: "2023-03", y: 15 },
        ],
        xField: "x",
        yField: "y",
        height: 400,
        smooth: false,
    },
    related: {
        settings: ChartCbtaiLineSettings,
    },
};

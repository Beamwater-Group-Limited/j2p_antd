import {useNode} from "@craftjs/core";
import {Form, Input, Switch} from "antd";
import React, {useEffect, useRef} from "react";

export const DynamicHtml = ({className="", htmlNode,}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { connectors: { connect, drag } } = useNode();
    useEffect(() => {
        if (containerRef.current) {
            console.log("样式", className)
            // 注入的 DOM 内容可能会被重新创建，这里对第一个子元素应用 className
            const injectedElement = containerRef.current.firstElementChild;
            if (injectedElement) {
                // 拆分并过滤出非空的 class token
                const classTokens = className.trim().split(/\s+/).filter(token => token);
                // 移除当前存在的相同 classNames
                if (classTokens.length) {
                    injectedElement.classList.remove(...classTokens);
                    // 添加最新的 classNames
                    injectedElement.classList.add(...classTokens);
                }
            }
        }
    }, [htmlNode,className]);
    // 使用 dangerouslySetInnerHTML 来渲染 HTML 字符串
    return (
        <div
            ref={ref => { if (ref) {
                containerRef.current = ref;
                connect(drag(ref)); } }}
            dangerouslySetInnerHTML={{ __html: htmlNode }} />
    );
};

//  是否是容器
DynamicHtml.isCanvas = false;

const DynamicHtmlSettings = () => {
    const {actions: {setProp}, props} = useNode((node) => ({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol={{span: 24}} wrapperCol={{span: 24}}>
                <Form.Item label="HTML内容">
                    <Input.TextArea
                        value={props.htmlNode}
                        onChange={(e) => setProp((props) => (props.htmlNode = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="TailWindCss">
                    <Input
                        value={ props.className }
                        onChange={(e) => setProp((props) => (props.className = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
DynamicHtml.craft = {
    displayName: "DynamicHtml",
    props: {
        disabled: false,
        htmlNode: "<span>示范组件</span>",
    },
    related: {
        settings: DynamicHtmlSettings,
    },
};

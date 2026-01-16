import {useNode} from "@craftjs/core";
import {Form, Input} from "antd";
import React from "react";

export const DynamicError = (
    errorContent:string
) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <div ref={ref => { if (ref) {
                connect(drag(ref)); } }}
        >
            <button onClick={() => {
                throw new Error(`我故意的：${errorContent}崩溃了！`);
            }}>点我报错</button>
        </div>
    );
};

//  是否是容器
DynamicError.isCanvas = false;

const DynamicErrorSettings = () => {
    const {actions: {setProp}, props} = useNode((node) => ({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol={{span: 24}} wrapperCol={{span: 24}}>
                <Form.Item label="报错内容">
                    <Input.TextArea
                        value={props.errorContent}
                        onChange={(e) => setProp((props) => (props.htmlNode = e.target.value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
DynamicError.craft = {
    displayName: "DynamicError",
    props: {
        errorContent:'错误组件'
    },
    related: {
        settings: DynamicErrorSettings,
    },
};

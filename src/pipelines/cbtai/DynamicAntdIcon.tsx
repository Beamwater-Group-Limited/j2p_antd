import React from "react";
import {useNode} from "@craftjs/core";
import {Form, Input, InputNumber, Select, Switch} from "antd";

export const DynamicAntdIcon = ({ name, ...rest }) => {
    const { connectors: { connect, drag } } = useNode();
    const IconComponent = React.useMemo(() => {
        try {
            // 动态导入（注意路径大小写）
            const Icon = require('@ant-design/icons')[name];
            if (!Icon) throw new Error('图标不存在');
            return Icon;
        } catch (err) {
            console.warn(`图标 "${name}" 未找到`);
            return null;
        }
    }, [name]);

    return IconComponent ?
        <IconComponent
            ref={ref => { if (ref) { connect(drag(ref)); }}}
            {...rest}
        />
        : null;
};

//  是否是容器
DynamicAntdIcon.isCanvas = false;

const DynamicAntdIconSettings = () => {
    const { actions:{setProp}, props} = useNode((node) =>({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol={{ span:24 }} wrapperCol={{ span:24 }}>
                <Form.Item label="计算后的 svg 类名">
                    <Input
                        value={ props.className }
                        onChange={(e) => setProp((props) => (props.className = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="图标名称">
                    <Input
                        value={ props.name }
                        onChange={(e) => setProp((props) => (props.name = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="仅适用双色图标。设置双色图标的主要颜色">
                    <Input
                        value={ props.twoToneColor }
                        onChange={(e) => setProp((props) => (props.twoToneColor = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="旋转角度">
                    <InputNumber
                        value={ props.rotate}
                        onChange={(value) => setProp((props) => (props.rotate = value))}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};

// 组件配置和默认属性
DynamicAntdIcon.craft = {
    displayName: "DynamicAntdIcon",
    props: {
        disabled:  false ,
        name:  "StarOutlined" ,
    },
    related: {
        settings: DynamicAntdIconSettings,
    },
};

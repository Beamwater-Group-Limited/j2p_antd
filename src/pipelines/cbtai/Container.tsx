import React from "react";
import {Card, Slider, Form} from "antd";
import { useNode } from "@craftjs/core";
import { HexColorPicker } from 'react-colorful';

export const Container = ({ background, padding, children, ...props } ) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <Card
            {...props}
            ref={ ref => {
                connect(drag(ref))
            }}
            style={{margin:"5px 0", background, padding: `${padding}px`}}
        >
            {children}
        </Card>
    );
};

export const ContainerSettings = () => {
    const {
        background,
        padding,
        actions:{ setProp},
    } = useNode((node) => ({
        background: node.data.props.background,
        padding: node.data.props.padding,
    }));
    return (
        <div>
            <Form labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                <Form.Item label="Background">
                    <HexColorPicker
                        color={background}
                        onChange={(color) => {
                            setProp((props) => (props.background = color), 500);
                        }}
                    />
                </Form.Item>
            </Form>
            <Form labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                <Form.Item label="Padding">
                    <Slider
                        defaultValue={padding}
                        onChange={(value) => {
                            setProp((props) => (props.padding = value), 500);
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
};
export const ContainerDefaultProps = {
    background:'#ffffff',
    padding: 3,
};

Container.craft = {
    props: ContainerDefaultProps,
    related:{
        settings: ContainerSettings,
    }
};

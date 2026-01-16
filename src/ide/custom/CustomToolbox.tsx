import React from 'react';
import {Row, Col, Button} from 'antd';
import {Element, useEditor} from "@craftjs/core";
import {addNewCustomComponent} from "@/tools";

// 定义 HTML5 常见元素
const HTML5Elements = [
    { name: "Cbtaidiv", label: "Div" , canvas: true},
    { name: "CbtaiListItem", label: "List Item" , canvas: true},
    { name: "CbtaiButton", label: "Button" , canvas: false},
    { name: "CbtaiAvatar", label: "Avatar" , canvas: false},
    { name: "CbtaiBadge", label: "Badge" , canvas: true},
    { name: "CbtaiCard", label: "Card" , canvas: true},
    { name: "CbtaiCheckbox", label: "Checkbox" , canvas: false},
    { name: "CbtaiDivider", label: "Divider" , canvas: false},
    { name: "DynamicAntdIcon", label: "Icon" , canvas: false},
    { name: "CbtaiInput", label: "Input" , canvas: false},
    //{ name: "CbtaiInputNumber", label: "InputNumber" , canvas: false},
    //{ name: "CbtaiPopover", label: "Popover" , canvas: false},
    // { name: "CbtaiProgress", label: "Progress" , canvas: false},
    { name: "CbtaiSelect", label: "Select" , canvas: false},
    { name: "CbtaiRadio", label: "Radio" , canvas: false},
    { name: "CbtaiRadioButton", label: "RadioButton" , canvas: false},
    { name: "CbtaiSpace", label: "Space" , canvas: true},
    { name: "CbtaiSwitch", label: "Switch" , canvas: false},
    { name: "CbtaiTag", label: "Tag" , canvas: false},
    { name: "Cbtaispan", label: "span" , canvas: false},
    { name: "Cbtaia", label: "a" , canvas: false},
    { name: "Cbtaip", label: "p" , canvas: false},
    { name: "Cbtaiol", label: "ol" , canvas: false},
    { name: "Cbtaiul", label: "ul" , canvas: true},
    { name: "Cbtaili", label: "li" , canvas: true},
    { name: "Cbtaiimg", label: "img" , canvas: false},
    { name: "Cbtaivideo", label: "video" , canvas: false},
    { name: "Cbtaiaudio", label: "audio" , canvas: false},
    { name: "Cbtaitr", label: "tr" , canvas: true},
    { name: "Cbtaitd", label: "td" , canvas: true},
    { name: "Cbtaith", label: "th" , canvas: true},
    { name: "Cbtailabel", label: "label" , canvas: false},
    { name: "CbtaiImage", label: "Image" , canvas: false},
    // { name: "h2", label: "Heading 2" , canvas: false},
];

export const CustomToolbox = () => {
    // 获取全局context
    const {connectors, resolver} = useEditor((state) => {
        let resolver = state.options.resolver;
        return {resolver}
    });

    return (
        <div style={{padding: '16px'}}>
            {/* 工具箱内容最上方加入一个按钮 */}
            <Row gutter={[16, 16]} className="mb-2">
                <Col span={24}>
                    <Button
                        type="primary"
                        block
                        className="mb-2"
                        onClick={addNewCustomComponent} // 点击触发添加新组件
                    >
                        新增组件
                    </Button>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                { HTML5Elements.map((element) => (
                    <Col span={12} key={element.name}>
                        <Button
                            type="dashed"
                            block
                            ref={(ref) => {
                                const Component = resolver[element.name];
                                if (!Component) return;
                                if ((Component as any).isCanvas) {
                                    connectors.create(ref,<Element is={Component} canvas/>)
                                } else {
                                    connectors.create(ref, <Component />)
                                }
                            }}
                        >
                            {element.label}
                        </Button>
                    </Col>
                ))}
            </Row>

        </div>
    )
}



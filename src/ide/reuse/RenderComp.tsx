import React from 'react';
import {DictItemTree} from "@/ide";
import {Input, InputNumber} from 'antd';

export const renderStateEditor  = ( stateKey:string,stateType:string,stateValue:any,onItemUpdate:(key:string,value:string)=>void ) => {
    switch (stateType) {
        case "string":
            return (
                <Input.TextArea
                    key={`renderEditor-${stateKey}`}
                    value={ stateValue || "" }
                    onChange={(e) => onItemUpdate(stateKey, e.target.value)}
                    placeholder="请输入文本"
                    autoSize={{ minRows: 1, maxRows: 10 }} // 动态调整行数
                />
            )
        case "number":
            return (
                <InputNumber
                    key={`renderEditor-${stateKey}`}
                    value={ stateValue || 0 }
                    onChange={(value) => onItemUpdate(stateKey, value)}
                />
            )
        case "array":
            return (
                <DictItemTree
                    key={`renderEditor-${stateKey}`}
                    value={ stateValue ? stateValue : [] }
                    defaultProp={ [] }
                    onChange={(value) => {
                        onItemUpdate(stateKey, JSON.parse(value))
                    }}
                />
            )
        case "object":
            return (
                <DictItemTree
                    key={`renderEditor-${stateKey}`}
                    value={ stateValue ? stateValue : {} }
                    defaultProp={ {} }
                    onChange={(value) => {
                        onItemUpdate(stateKey, JSON.parse(value))
                    }}
                />
            )
        case "any":
            return (
                <span>未识别类型</span>
            )
    }
};

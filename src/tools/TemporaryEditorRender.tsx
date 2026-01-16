import React, {useEffect, useRef, useState} from "react";
import { Editor, Frame, NodeElement } from "@craftjs/core";

/**
 * props:
 * - data: Craft 节点树 JSON
 * - resolver: 组件映射表
 * - onRender: JSX 渲染完成后调用 (result: JSX)
 */
export const TemporaryEditorRenderer = ({ data, resolver, onRender }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (containerRef.current) {
                const dom = containerRef.current;
                console.log("解析出的dom", dom)
            }
        }, 50); // 等待 DOM 渲染
        return () => clearTimeout(timeout);
    }, []);
    return (
        <div ref={containerRef}  style={{ display: "none" }}>
            <Editor resolver={resolver}>
                <Frame data={data}/>
            </Editor>
        </div>
    );
};

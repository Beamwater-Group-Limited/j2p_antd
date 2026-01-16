import React from "react";
import {useNode} from "@craftjs/core";
import {Outlet} from "react-router-dom";

export const DynamicOutlet = ( ) => {
    const { connectors: { connect, drag } } = useNode();
    const isInEditor = typeof window !== "undefined" && window.location.pathname.includes("editor");
    return (
        <div
            ref={ref => { if (ref) { connect(drag(ref)); }}}
            className={isInEditor ? "border border-dashed border-gray-500 p-[10px] text-center" : "w-full h-full"}
        >
            {isInEditor && "📌 Outlet 占位符"}
            <Outlet />
        </div>
    );
};

//  是否是容器
DynamicOutlet.isCanvas = false;

const DynamicOutletSettings = () => {
    return (
        <div/>
    )
};

// 组件配置和默认属性
DynamicOutlet.craft = {
    displayName: "DynamicOutlet",
    props: {
    },
    related: {
        settings: DynamicOutletSettings,
    },
};

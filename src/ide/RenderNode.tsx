import React, {useEffect, useRef} from "react";
import {useEditor} from "@craftjs/core";

export const RenderNode = ({render}: { render: React.ReactNode }) => {
    // 通过 useEditor 获取当前 Editor 的 query 对象
    const {query} = useEditor();
    // 只执行一次
    useEffect(() => {
        // 调用 query.serialize() 获取序列化后的数据
        const serializedData = query.serialize();
        console.log(serializedData);
    }, []);
    return (
        <>
            {render}
        </>
    );
};

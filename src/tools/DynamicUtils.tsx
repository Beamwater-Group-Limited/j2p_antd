
import React from "react";
import {v4} from "uuid";
import {dynamicComponentModules} from "@/pipelines/ide/DynamicImport";

// 加载组件解析
const loadComponents = async (compoName: string|null = null) => {
    const resolver: Record<string, React.ElementType> = {};
    // 如果组件名称数量大于0
    if (compoName) {
        if(dynamicComponentModules[compoName]) {
            try {
                const module =await dynamicComponentModules[compoName]();
                resolver[compoName] = module[compoName] as React.ComponentType;
            } catch (error) {
                console.error(`组件 ${compoName} 动态加载失败:`, error);
            }
        } else {
            console.warn(`组件${compoName}未找到`)
        }
    } else {
        // compoName 为null
        // 动态加载指定组件并填充 resolver 对象
        await Promise.all(Object.keys(dynamicComponentModules).map(async (componentName) => {
            try {
                const module = await dynamicComponentModules[componentName]();
                resolver[componentName] = module[componentName] as React.ComponentType;
            } catch (error) {
                console.error(`组件"${componentName}" 动态加载失败:`, error); // 错误处理
            }
        }))
    }
    return resolver;
};

// 生成 craft.js使用的初始化节点树json，仅包含一个Root
const createNodeTree = (nodeID:string|null=null, type: string,props:any={},
                              isCanvas=false, custom:any={},hidden=false,children:any=[],linkedNodes:any={}) => {
    // 没有配置则动态生成
    const nodeId = nodeID? nodeID : v4().replace(/-/g, '').slice(0,8); // 随机生成唯一 ID
    // 迭代生成
    const childNodes = children.map((child: { type: string; props: string; isCanvas: any; children: boolean; }) => createNodeTree(child.type, child.props, child.isCanvas, child.children));
    // 生成节点
    return {
        id: nodeId,
        node: {
            type: { resolvedName: type },
            props,
            isCanvas,
            displayName: type,
            custom,
            hidden,
            nodes: childNodes.map((child: { id: any; }) => child.id),
            linkedNodes,
        },
        childNodes:childNodes,
    };
};

// 生成的树结构化为 json 格式
const convertToJsonTree = (root:any) => {
    const treeJson: Record<string, any> = {
        [root.id]: { ...root.node },
    }
    // 判断 children
    if(!root.childNodes || root.childNodes.length === 0) return treeJson;

    root.children.forEach((child: any) => {
        Object.assign(treeJson, convertToJsonTree(child)); // 合并子节点数据
    });

    return treeJson;
};

// 生成一个div json格式
const createDivJson = () => {
    return "{\"ROOT\":{\"type\":\"div\",\"isCanvas\":true,\"props\":{ \"className\": \"w-full h-screen\"},\"displayName\":\"div\",\"custom\":{},\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}}}"
}

export {
    loadComponents,
    createNodeTree,
    convertToJsonTree,
    createDivJson,
};

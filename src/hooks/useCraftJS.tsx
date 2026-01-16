import {useEditor, useNode} from "@craftjs/core";
import {v4} from "uuid";
import {createDivJson, deserializeComponentTree} from "@/tools";
import React, {JSX} from "react";

export function useCraftJS() {
    const {actions, query,resolver} = useEditor((state) => {
        let resolver = state.options.resolver;
        return {resolver}
    });
    // 拖拽到树中的当前节点
    const {id:nodeID} = useNode();

    // 递归添加 当前节点ID， 节点数组， 目标父节点，解析项数据
    const addNodesRecursive = (node_id: string, nodes: {}, targetParentID: string, itemProps: any) => {
        // 从结构化的序列化的json数据中解析出节点
        const node = query.parseSerializedNode(nodes[node_id]).toNode()
        // 新建一个节点 复制节点的内容，id保持和旧节点一致
        const parsed = query.parseFreshNode({
            data: {
                type: node.data.type,
                props: fromKey(node.data.props, itemProps),
            },
        }).toNode((node) => {
            node.id = node_id;
        })
        // 如果节点的parent 为 ROOT，替换为 新的树的指定位置 LIST的节点ID 否则为自身的父ID
        const parentID = (node.data.parent === 'ROOT') ? targetParentID : node.data.parent
        console.log("解析出的节点", parsed, parentID, itemProps)
        if (query.node(parentID).get()) {
            if (query.node(parentID).childNodes().includes(node.id)) {
                console.log("解析出的节点已经被包含在父节点中,直接返回")
            } else {
                actions.add(parsed, parentID)
                console.log("解析出的节点加入到树上的节点")
            }
        } else {
            console.log("父节点未上树，则替换为父节点加入到树")
            addNodesRecursive(parentID, nodes, targetParentID, itemProps)
        }
    }
    // 添加 一个无头节点树的数组 到 当前节点树的当前节点下
    const addNodesToCurrentNode = (nodes: {}, itemProps: any) => {
        const nodeMap = getNodesFrom(cloneTreeWithNewIds(nodes))
        Object.keys(nodeMap).forEach((id) => {
            addNodesRecursive(id, nodeMap, nodeID, itemProps)
        });
        return nodeMap;
    }
    // 添加 一个无头节点树的数组 到 当前节点树的当前节点的父节点下面
    const addNodesToCurrentNodeParent = (nodes: {}, itemProps: any) => {
        const nodeMap = getNodesFrom(cloneTreeWithNewIds(nodes))
        Object.keys(nodeMap).forEach((id) => {
            addNodesRecursive(id, nodeMap, query.node(nodeID).get().data.parent, itemProps)
        });
        return nodeMap;
    }
    // 删除自身
    const deleteSelf = () => {
        actions.delete(nodeID)
    }
    // 从组件的自身节点树中 截取头部获取节点数组
    const getNodesFrom = (nodes: {}) => {
        return Object.fromEntries(
            Object.entries(nodes).filter(([key]) => key !== 'ROOT')
        )
    }
    // 复制节点树 所有节点使用新的ID 保留嵌套关系
    const cloneTreeWithNewIds = (nodes: {})=> {
        const newTree = {}
        // 生成一个字典，key是旧ID， value是新ID
        const idMap = Object.keys(nodes).reduce( (acc, oldID) => {
            if (oldID === 'ROOT')
            {
                acc[oldID] = 'ROOT'
                return acc;
            }
            acc[oldID] = v4().replace(/-/g, '').slice(0,10)
            return acc;
        }, {})
        Object.keys(nodes).forEach((id) => {
            // 新建一个节点 复制节点的内容，id保持和旧节点一致
            newTree[idMap[id]] = {
                ...nodes[id],
                parent:idMap[nodes[id].parent],
                nodes: nodes[id].nodes.map(son => idMap[son]),
                linkedNodes: Object.fromEntries(
                    Object.entries(nodes[id].linkedNodes).map(([key, value]) => [idMap[key], value]))
            }
        });
        return newTree;
    }
    // 从本地会话读取结构树，如果不存在则请求获取
    const getTreeWithDomID = async (ownerID:string, domTreeID:string) => {
        let domJson = await deserializeComponentTree(ownerID,domTreeID);
        if (!domJson) {
            domJson = createDivJson()
        }
        return JSON.parse(domJson);
    }
    // 清除添加到当前节点的 一个无头节点树的数组
    const cleanupNodes = (nodeMap: {}) => {
        query.node(nodeID).descendants().forEach((son_id: string) => {
            if (Object.keys(nodeMap).includes(son_id)) {
                actions.delete(son_id);
                console.log("清除子节点", son_id);
            }
        });
    };
    // 删除当前节点的子节点
    const deleteCurrentNodeChildren = () => {
        query.node(nodeID).descendants().forEach((son_id:string) => {
            actions.delete(son_id)
            }
        )
    }
    // 根据设定了item.xxx的children进行转换
    const fromKey = (props: any, itemProps: any) => {
        // 如果没有配置父属性，不进行转换
        if (!itemProps) return props;
        // 如果符合指定
        console.log("节点属性", props, itemProps)
        // if (props.children && props.children.startsWith("item.")) {
        //     const value = itemProps[props.children.slice(5)];
        //     // 返回从内部抓取的值
        //     return {...props, "children": value}
        // }
        // 新的属性对象
        const newProps = {...props};
        Object.entries(props).forEach(([key,value]) => {
            console.log("节点属性分割", key,value)
            if (typeof value === 'string' && value.startsWith('item.')) {
                console.log("节点属性被处理", key,value)
                // 从 itemProps 中获取对应的值
                const itemKey = value.slice(5); // 移除 "item." 前缀
                const itemValue = itemProps[itemKey];
                // 更新属性值
                newProps[key] = itemValue;
            }
        })
        console.log("节点属性构造后", newProps)
        return newProps;
    }
    // 解析
    function craftJsonToJSX(nodeTreeJson: any, itemProps?:any) {
        // 如果传入的是 JSON 字符串，先解析为对象
        const craftObj = typeof nodeTreeJson === 'string' ? JSON.parse(nodeTreeJson) : nodeTreeJson;
        // 获取节点映射表和根节点 ID
        const nodesMap = craftObj.nodes || craftObj;
        const rootId = craftObj.rootNodeId || 'ROOT';

        // 内部递归函数：将指定节点及其子树转换为 React 元素
        function renderNode(nodeId: string): React.ReactNode {
            const node = nodesMap[nodeId];
            if (!node) return null;
            // 某些序列化格式下节点属性在 node.data 中，做兼容处理
            const nodeData = node.data || node;
            let { type, props:preProps = {}, nodes: childIds, linkedNodes } = nodeData;
            // 动态解析 props item 数据注入
            let props = preProps;
            if (itemProps) {
                props = fromKey(preProps, itemProps)
            }
            // 确定要使用的组件类型：字符串表示原生 DOM 元素，带 resolvedName 对象表示自定义组件
            let ComponentType: React.ElementType ;
            if (typeof type === 'string') {
                ComponentType = type as keyof JSX.IntrinsicElements;      // 原生标签;  // 原生元素如 'div', 'span'
            } else if (type && typeof type === 'object' && type.resolvedName) {
                // 自定义组件，通过 resolver 查找
                ComponentType = resolver[type.resolvedName]|| type.resolvedName;
                /**
                 * 上面一行通过名称在传入的 resolver 或预定义的 resolverMap 中查找组件.
                 * 假如未找到，会退回使用字符串名称（需要确保该名称在作用域内有对应组件全局注册）。
                 */
            } else {
                ComponentType = type as React.ElementType;  // 回退处理（一般不会走到这里）
            }
            // 处理子元素：如果有子节点列表，递归转换；如果没有子节点但有 props.children，则直接使用它
            let childrenElements: React.ReactNode | React.ReactNode[] = null;
            if (childIds && Array.isArray(childIds) && childIds.length > 0) {
                childrenElements = childIds.map(childId => (
                    <React.Fragment key={childId}>
                        {renderNode(childId)}
                    </React.Fragment>
                ));
            } else if (props.children !== undefined) {
                childrenElements = props.children;
            }
            // 构造当前节点的属性对象，保留所有原有属性
            const finalProps: Record<string, any> = { ...props };
            if (nodeId === rootId && ComponentType === 'div') {
                finalProps.className = (finalProps.className || '')
                    .replace(/\bh-(full|screen)\b/g, '')        // 删除 h-full / h-screen
                    .trim();
            }
            // 如果我们单独处理了 children，则避免在 props 中重复传入它
            if (childrenElements !== null) {
                delete finalProps.children;
            }
            // 如果存在 linkedNodes（如自定义组件的插槽），递归创建并赋予对应属性
            if (linkedNodes && typeof linkedNodes === 'object') {
                for (const [slotName, linkedNodeId] of Object.entries(linkedNodes)) {
                    finalProps[slotName] = renderNode(linkedNodeId as string);
                }
            }
            // 创建并返回 React 元素
            return <ComponentType {...finalProps}>{childrenElements}</ComponentType>;
        }

        // 从根节点开始转换
        return renderNode(rootId);
    }
    return {
        craftJsonToJSX,
        deleteSelf,
        addNodesToCurrentNode,
        addNodesToCurrentNodeParent,
        cleanupNodes,
        getTreeWithDomID,
        deleteCurrentNodeChildren
    };
}

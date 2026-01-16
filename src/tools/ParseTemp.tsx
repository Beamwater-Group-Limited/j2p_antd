// ParseTemp.tsx
import {DynamicAntdIcon} from "@/pipelines/cbtai";
import React from "react";
import {fetchDomJson} from "@/tools/ComesData";
import dayjs from "dayjs";
import {Popconfirm, Space, Tag} from "antd";
import {BulbOutlined, InfoCircleOutlined} from "@ant-design/icons";
import {Table} from "antd";
import Any = jasmine.Any;
import * as CbtaiAntd from "antd";


//CbtaiTable的selection属性解析
export const parse_selectionProps = (dictValue, changeSelectedRowKeysState) => dictValue && ({
    ...dictValue,
    items: dictValue["items"] && dictValue["items"].map(item => (
        Object.keys(item).reduce((acc, key) => {
                switch (key) {
                    case "onChange":
                        acc[key] = (selectedRowKeysState) => {
                            changeSelectedRowKeysState(selectedRowKeysState);
                        }
                        break;
                    case "selections":
                        acc[key] = item[key].map(sel => Table[sel]).filter(Boolean);
                        break;
                    default:
                        acc[key] = item[key];
                        break;
                }
                return acc
            }, {} as Record<string, any>
        )))
})

// CbtaiDropdown 使用的属性解析 输入的是字符串为基础类型的对象列表，返回值是
export const parse_menuProps = (dictValue) => dictValue && ({
    ...dictValue,
    items: dictValue["items"] && dictValue["items"].map(item => (
        Object.keys(item).reduce((acc, key) => {
                switch (key) {
                    case "icon":
                        acc[key] = <DynamicAntdIcon name={item[key]}/>
                        break;
                    case "label":
                        acc[key] = <div dangerouslySetInnerHTML={{__html: item[key]}}/>;
                        break;
                    default:
                        acc[key] = item[key];
                        break;
                }
                return acc
            }, {} as Record<string, any>
        )))
})
// CbtaiMenu 使用的属性解析
export const parse_menuItems = (dictValue) => dictValue && dictValue.map(item => {
    if (typeof item === "string" || typeof item === "number") {
        return item
    }
    return Object.keys(item).reduce((acc, key) => {
            switch (key) {
                case "icon":
                    acc[key] = <DynamicAntdIcon name={item[key]}/>
                    break;
                default:
                    acc[key] = item[key];
                    break;
            }
            return acc
        }, {} as Record<string, any>
    )
})

// CbtaiTimelineItems 使用的属性解析
export const parse_icon = (iconName: string) => {
    if (!iconName || iconName.trim() === "") {
        return null; // iconName 为空或只包含空格时返回 null
    }
    return <DynamicAntdIcon name={iconName} />;
}
// 属性解析类型 timelineItems
export const parse_timelineItems = (dictValue) => dictValue && dictValue.map(item => {
    if (typeof item === "string" || typeof item === "number") {
        return item
    }
    return Object.keys(item).reduce((acc, key) => {
            switch (key) {
                case "icon":
                    acc[key] = <DynamicAntdIcon name={item[key]}/>
                    break;
                default:
                    acc[key] = item[key];
                    break;
            }
            return acc
        }, {} as Record<string, any>
    )
});

// 属性解析类型 listSource
export const parse_listSource = (dictValue) => dictValue && dictValue.map(item => {
    if (typeof item === "string" || typeof item === "number") {
        return item
    }
    return Object.keys(item).reduce((acc, key) => {
            switch (key) {
                case "icon":
                    acc[key] = <DynamicAntdIcon name={item[key]}/>
                    break;
                default:
                    acc[key] = item[key];
                    break;
            }
            return acc
        }, {} as Record<string, any>
    )
});

// 属性解析类型 renderItem
export const parse_renderItem =async (craftJsonToJSX: any,ownerID:string,componentType:string) => {
    if (!componentType) return ""
    // 先把需要的拉下来
    const domJsonCache = await fetchDomJson(ownerID,componentType)
    return (item:any) => {
        return craftJsonToJSX(domJsonCache, item)
    }
}

// 属性解析类型 tableColumns
export const parse_tableColumns = async (craftJsonToJSX: any,ownerID:string,dataSource?:[],datasourceState?:[],changeDatasourceState?:any,columns?:any,) => {
    if (!columns) return ""
    // 先把需要的拉下来
    const domJsonCache = await Promise.all(
        columns.map(column =>{
            if (!column["render"]) return null
            if (column["render"] === 'CustomCbtaiDelete') return null
            if (column["render"] === 'CustomCbtaiDeleteProp') return null
            return  fetchDomJson(ownerID,column["render"])
        })
    )
    console.log("解析的缓存", domJsonCache)
    // const domCache = await Promise.all(
    //     domJsonCache.map((domJson,index) => {
    //         if (!domJson) return null
    //         return craftJsonToJSX(domJson,columns[index],index)
    //     })
    // )
    // console.log("解析的解析", domCache)
    // render 不能阻塞
    return columns.map((column,ci) => (
        Object.keys(column).reduce((acc, key) => {
                switch (key) {
                    case "title":
                        acc[key] = column[key]
                        break;
                    case "dataIndex":
                        acc[key] = column[key]
                        break;
                    case "key":
                        acc[key] = column[key]
                        break;
                    case "sorter":
                        acc[key] = new Function(`return ${column[key]}`)();
                        break;
                    case "onFilter":
                        acc[key] = new Function(`return ${column[key]}`)();
                        break;
                    case "render":
                        acc[key] = (value, record,index) => {
                            if (column[key] === 'CustomCbtaiDelete'){
                                return (
                                    datasourceState.length >=1 ? <Popconfirm title="确认删除?" onConfirm={() =>{
                                            const newdatasourceState = datasourceState.filter((_,i) => i !== index)
                                            console.log("待删除数据新的数据", newdatasourceState)
                                            changeDatasourceState(newdatasourceState)
                                        }}>
                                            <a>删除</a>
                                        </Popconfirm>
                                    : null
                                )
                            }
                            if (column[key] === 'CustomCbtaiDeleteProp'){
                                return (
                                    dataSource.length >=1 ? <Popconfirm title="确认删除?" onConfirm={() =>{
                                            const newdatasourceState = dataSource.filter((_,i) => i !== index)
                                            console.log("待删除数据新的数据", newdatasourceState)
                                            changeDatasourceState(newdatasourceState)
                                        }}>
                                            <a>删除</a>
                                        </Popconfirm>
                                    : null
                                )
                            }
                            if (!domJsonCache[ci]) return
                            // return domCache[ci]
                            return  craftJsonToJSX(domJsonCache[ci], record)
                        }
                        break;
                    default:
                        acc[key] = column[key];
                        break;
                }
                return acc
            }, {} as Record<string, any>
        )))
}

// 属性解析类型 reactNode
export const parse_reactNode = async (craftJsonToJSX: any,ownerID:string,componentType:string) => {
    if (!componentType) return ""
    // 先把需要的拉下来
    const domJsonCache = await fetchDomJson(ownerID,componentType)
    console.log("解析的缓存", domJsonCache)
    const domCache = await craftJsonToJSX(domJsonCache)
    console.log("解析的解析", domCache)
    // render 不能阻塞
    return domCache
}

// 属性 解析类型 eventTargetValue   changeValueState
export const parse_eventTargetValue = (changeValueState:any,_:any) => {
    if (!changeValueState) return
    return (e) => {
        console.log("系统加载的改变值:", e.target.value)
        changeValueState(e.target.value)
    }
}

// 属性 解析类型 eventTargetChecked   changeCheckedState
export const parse_eventTargetChecked = (changeCheckedState:any,_:any) => {
    if (!changeCheckedState) return
    return (e) => {
        console.log("系统加载的改变值:", e)
        changeCheckedState(e.target.checked)
    }
}

// 属性解析类型 function
export const parse_function = (setState:any, value:any, _:any) => {
    if (!setState || value) return
    return () => {
        setState(value)
    }
}

// 属性解析类型 menuOnClick
export const parse_menuOnClick = (navigate,workMode:string, _) => {
    return (e:any) => {
        navigate(`/${workMode}${e.key}`)
    }
}

// 属性解析类型 typographyOnClick
export const parse_typographyOnClick = (navigate,workMode:string, subPath:string) => {
    // 必须配置空检查，否则导致系统性，displayname命名变为随机的字母
    if (!subPath) return
    return (e:any) => {
        navigate(`/${workMode}${subPath}`)
    }
}

// 属性 解析类型 info   changeValueState 文件上传回调
export const parse_info = (changeValueState:any,_:any) => {
    if (!changeValueState) return
    return (info: any) => {
        changeValueState(info)
    }
}

// 属性 解析类型 tableOnRow   changeRowState  表格点击等操作回调
export const parse_tableOnRow = (changeRowState:any,_:any) => {
    if (!changeRowState) return
    return (row) => {
        return {
            // onClick: () => {
            //     console.log("单击行状态改变:", row)
            //     changeRowState(row)
            // },
            onDoubleClick: () => {
                console.log("双击行状态改变:", row)
                changeRowState(row)
            },
            onContextMenu: () => {
                console.log("右击行状态改变:", row)
                changeRowState(row)
            },
            // onMouseEnter: () => {
            //     changeRowState(row)
            // },
            // onMouseLeave: () => {
            //     changeRowState(row)
            // }
        }
    }
}

// 属性 解析类型 dayjs   changeValueState 文件上传回调
export const parse_dayjs = (dateString:any) => {
    return dayjs(dateString)
}

// 属性 解析类型 countProps
export const parse_countProps = (dictValue) => dictValue && (
    Object.keys(dictValue).reduce((acc, key) => {
            switch (key) {
                case "show":
                    acc[key] = dictValue[key] === "true"
                    break;
                case "max":
                    acc[key] = Number(dictValue[key])
                    break;
                case "strategy":
                    acc[key] = (txt:string) => [...txt].length
                    break;
                case "exceedFormatter":
                    acc[key] =  (txt:string, { max }) => [...txt].slice(0, max).join('')
                    break;
                default:
                    acc[key] = dictValue[key];
                    break;
            }
            return acc
        }, {} as Record<string, any>
    )
)

// 属性 解析类型 progressProps  changeValueState
export const parse_progressProps = (dictValue) => dictValue && (
    Object.keys(dictValue).reduce((acc, key) => {
            switch (key) {
                case "format":
                    acc[key] = (percent) => `${percent} ${dictValue[key]}`
                    break;
                case "percent":
                case "size":
                case "steps":
                case "strokeWidth":
                    acc[key] = Number(dictValue[key])
                    break;
                case "showInfo":
                    acc[key] = dictValue[key] === "true"
                    break;
                case "success":
                    acc[key] = Object.keys(dictValue[key]).reduce((ac, k) => {
                        switch (k){
                            case "percent":
                                ac[k] = Number(dictValue[key][k])
                                break;
                            default:
                                ac[key] = dictValue[key][k];
                                break;
                        }
                        return ac;
                    },{} as Record<string, any>)
                    break;
                default:
                    acc[key] = dictValue[key];
                    break;
            }
            return acc
        }, {} as Record<string, any>
    )
)
const parse_TabItemType = (item:any) => {
    return Object.keys(item).reduce((acc, key) => {
        switch (key) {
            case "closeIcon":
            case "icon":
                acc[key] = <DynamicAntdIcon name={item[key]}/>
                break;
            case "destroyOnHidden":
            case "disabled":
            case "forceRender":
            case "closable":
                acc[key] =  item[key] === "true"
                break;
            default:
                acc[key] = item[key];
                break;
        }
        return acc
    },{} as Record<string, any>
    )
}
// 属性 解析类型 tabsProps changeValueState
export const parse_tabsProps = (changeValueState,dictValue) => dictValue && (
    Object.keys(dictValue).reduce((acc, key) => {
            switch (key) {
                case "addIcon":
                case "removeIcon":
                    acc[key] = <DynamicAntdIcon name={dictValue[key]}/>
                    break;
                case "animated":
                case "centered":
                case "hideAdd":
                case "destroyOnHidden":
                    acc[key] =  dictValue[key] === "true"
                    break;
                case "tabBarGutter":
                    acc[key] = Number(dictValue[key])
                    break;
                case "items":
                    acc[key] = parse_TabItemType(dictValue[key])
                    break;
                case "more":
                    acc[key] = {
                        "icon": <DynamicAntdIcon name={dictValue[key]["icon"]}/>,
                        "trigger": dictValue[key]["trigger"]
                    }
                    break;
                case "onChange":
                    acc[key] = (activeKey: string) => { changeValueState(activeKey)}
                    break;
                default:
                    acc[key] = dictValue[key];
                    break;
            }
            return acc
        }, {} as Record<string, any>
    )
)

// 属性 解析类型 markProps
export const parse_markProps = ( dictValue) => dictValue && (
    Object.entries(dictValue).reduce((acc, [key,value]) => {
        console.log("输出标记属性", key, value)
        if (typeof value === "string") {
            if (value.split('---').length === 1){
                acc[key] = value
            }else {
                acc[key] = {
                    style: {color: value.split('---')[0]}, label: <strong>{value.split('---')[1]}</strong>
                }
            }
        } else {
            acc[key] = value
        }
        return acc
        }, {} as Record<string, any>)
)

// 属性 解析类型 reference
export const parse_reference = ( initComponent,ref) => {
    console.log("video的引用", ref)
    return initComponent()
}

// 属性 解析类型 transforRender
export const parse_transforRender = (_) => {
    return (row) => row.title
}
// 属性 解析类型 transforTarget
export const parse_transforTarget = (value) => {
    if (!value) return []
    return value.split(',')
}
// 属性 解析类型 transforOnChange
export const parse_transforOnChange = (changeValueState,_) => {
    return (nextTargetKeys, direction, moveKeys) => {
        changeValueState(nextTargetKeys)
    }
}
//  为了x使用的
// 解析对象的数组
export const parseArrayOfObject = (value:string) => {
    const arrayValue = JSON.parse(value)
    if (!Array.isArray(arrayValue)) {
        throw new Error("传输数据格式错误，必须为数组");
    }
    return arrayValue.map(item => {
        if (typeof item === "string" || typeof item === "number") {
            return item
        }

        return Object.keys(item).reduce((acc, key) => {
                switch (key){
                    default:
                        acc[key] = item[key]
                        break;
                }
                return acc
            }, {} as Record<string, any>
        )
    })
}
// 解析 promptItems
export const parseArrayOfPromptOrThoughtChain = (value:string) => {
    if(!value)return [{"key":""}]
    console.log("传入提示item数据", value)
    const arrayValue = JSON.parse(value)
    console.log("传入提示item数据", value, arrayValue)
    if (!Array.isArray(arrayValue)) {
        throw new Error("传输数据格式错误，必须为数组");
    }
    if (arrayValue.length === 0 ) {
        throw new Error("数组长度为零")
    }
    const cheng =  arrayValue.map(item => {
        return Object.keys(item).reduce((acc, key) => {
                switch (key){
                    case "icon":
                        const [name, className] = item[key].split(',')
                        acc[key] = <DynamicAntdIcon name={name} className={className}/>
                        break
                    default:
                        acc[key] = item[key]
                        break;
                }
                return acc
            }, {} as Record<string, any>
        )
    })
    console.log("输出解析后的值", cheng)
    return cheng
}

// 解析所有 动态函数解析类型
export const parse_func = (
    action:string,
    parseParams :any,
    func:string[]
) => {
    const {sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,  React,  CbtaiAntd, navigate, workMode,appConfig,projectConfig } = parseParams
    if (!func || !func[0] || !func[1]) return () => {}
    // 形参解析与清洗
    const params = func[0]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    const body = func[1]
    switch (action) {
        case "CustomListenterBack.onBack":
            // eslint-disable-next-line no-new-func
            const innerFunc = new Function(...params,body)
            innerFunc(cbtState,CbtaiAntd,setCbtState,sendStateChange,navigate,workMode,appConfig,projectConfig)

        case "CbtaiButton.onClick":
            return (e) => {
                // eslint-disable-next-line no-new-func
                const innerFunc = new Function(...params,body)
                innerFunc(e,cbtState,CbtaiAntd,setCbtState,sendStateChange,navigate,workMode,appConfig,projectConfig)
            };
        case "CbtaiTable.onChange":
            return (pagination: any, filters: any, sorters: any, extra: any) => {
                const innerFunc = new Function(...params, body);
                innerFunc(pagination, filters, sorters, extra, setCbtState, sendStateChange);
            };
        case "CbtaiPagination.onChange":
            return (page: number, pageSize: number) => {
                const innerFunc = new Function(...params, body);
                innerFunc(page, pageSize, setCbtState, sendStateChange);
            };
        case "CbtaiPagination.onShowSizeChange":
            return (current: number, size: number) => {
                const innerFunc = new Function(...params, body);
                innerFunc(current, size, setCbtState, sendStateChange);
            };
        case "CbtaiCollapse.onChange":
            return (activeKey) => {
                const innerFunc = new Function(...params, body);
                innerFunc(activeKey,setCbtState, sendStateChange);
            };
        case "CbtaiSteps.onChange":
            return (current) => {
                const innerFunc = new Function(...params, body);
                innerFunc(current,setCbtState, sendStateChange);
            };
        case "Cbtaiaudio.onPlay":
            return () => {
                const innerFunc = new Function(...params, body);
                innerFunc(cbtState,setCbtState, sendStateChange);
            };
        case "CbtaiRecorder.onFinish":
            return (blob) => {
                const innerFunc = new Function(...params, body);
                innerFunc(blob,cbtState,setCbtState, sendStateChange);
            };
        case "CbtaiList.renderItem":
            // return (item: any) => {
            //     const { List,Typography} = CbtaiAntd;
            //     return React.createElement(
            //         List.Item,
            //         null,
            //         // 2. 单词文本
            //         React.createElement(Typography.Text, null, item.name),
            //     );
            // }
            return (item) => {
                const innerFunc = new Function(...params, body);
                return innerFunc(item,React,nodeID,sendEvent,CbtaiAntd,cbtState,setCbtState,sendStateChange,navigate,workMode,appConfig,projectConfig);
            };
        default:
            return () => {};
    }
}
const column_temp = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <a>{text}</a>,
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'Tags',
        key: 'tags',
        dataIndex: 'tags',
        render: (_, { tags = [] }) => (
            <>
                {tags.map((tag) => {
                    let color = tag.length > 5 ? 'geekblue' : 'green';
                    if (tag === 'loser') color = 'volcano';
                    return (
                        <Tag color={color} key={tag}>
                            {tag.toUpperCase()}
                        </Tag>
                    );
                })}
            </>
        )

    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <a>Invite {record.name}</a>
                <a>Delete</a>
            </Space>
        ),
    },
]

// 解析 字典
export const parse_dict = (
    action: string,
    parseParams :any,
    func: string[]) => {
    const {sendEvent,   nodeID,   cbtState,   setCbtState,   sendStateChange,   React,   CbtaiAntd,   navigate,   workMode, } = parseParams
    if (!func || !func[0] || !func[1]) return () => {
    }
    console.log("日志解析",action,nodeID,cbtState,setCbtState,sendStateChange,React,func)
    // 形参解析与清洗
    const params = func[0]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    const body = func[1]
    switch (action) {
        case "CbtaiTable.expandable":{
            const innerFunc = new Function("React","CbtaiAntd",...params, body);
            return innerFunc(React,CbtaiAntd,setCbtState, sendStateChange);
        }
        case "CbtaiTable.rowSelection":{
            const innerFunc = new Function("React","CbtaiAntd",...params, body);
            return innerFunc(React,CbtaiAntd,nodeID,cbtState,setCbtState, sendStateChange);
        }
        case "CbtaiTable.columns":{
            const innerFunc = new Function("React","CbtaiAntd",...params, body);
            return innerFunc(React,CbtaiAntd,nodeID,sendEvent,cbtState,setCbtState, sendStateChange);
        }
        default:
            return {}
    }
}

// 解析paginagion的onChange(不用了)
export const parse_pageChange = (
    setCurrentState: (page: number) => void,
    setPageSizeState: (pageSize: number) => void,
    setIsDirty,
    onChange
) => {
    return (page: number, pageSize: number) => {
        setCurrentState(page);
        setPageSizeState(pageSize);
        setIsDirty(true);
        console.log("触发pageChange", page, pageSize);
    };
};

// 解析upload的onChange
export const parse_fileChange = (
    setFileListState: (newFileList: any[]) => void,
    setIsDirty: (isDirty: boolean) => void,
    changeInfo,
    onChange
) => {
    return (info: any) => {
        const { file, fileList: newFileList } = info;
        setFileListState(newFileList);
        setIsDirty(true);
        console.log("文件上传状态变化:", info);
        changeInfo(info);
    };
};

// 解析upload的onPreview
export const parse_filePreview = (onPreview) => {
    return (file) => {
        if (file.status !== 'done') {
            console.log('文件未上传成功，无法预览');
            return;
        }
        if (!file.response?.imageUrl) {
            console.log('文件地址不存在，无法预览');
            return;
        }
        if (file.type?.includes('image/')) {
            window.open(file.response.imageUrl, '_blank');
        } else {
            console.log('非图片类型，尝试在新页面打开');
            window.open(file.response.imageUrl, '_blank');
        }
    };
};

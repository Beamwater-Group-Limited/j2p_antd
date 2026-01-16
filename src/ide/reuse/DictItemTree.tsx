import React, {useEffect, useRef, useState} from 'react';
import {Tree, Button, Modal, Input, notification, Form, Select, Space, Typography, Divider} from 'antd';
import {ComplexData, deepEqual, NestedDataItem} from "@/tools";
import _ from "lodash";
import {DeleteOutlined, PlusOutlined, UploadOutlined, CheckCircleOutlined, FormatPainterOutlined} from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

export const DictItemTree: React.FC<{value?: ComplexData, defaultProp: ComplexData, onChange:(value:string)=>void}>
    = ({value, defaultProp, onChange}) => {
    // 原有状态
    const [dictValue, setDictValue] = useState(value ? value : defaultProp);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedKey, setSelectedKey] = useState('');
    const [selectedValue, setSelectedValue] = useState<any>('');
    const [treeData, setTreeData] = useState<any[] | null>(null);

    // 新增：导入 JSON 弹窗状态
    const [jsonModalOpen, setJsonModalOpen] = useState(false);
    const [jsonRaw, setJsonRaw] = useState<string>('');
    const [jsonParsed, setJsonParsed] = useState<ComplexData | null>(null);
    const [jsonError, setJsonError] = useState<string>('');

    // 新增/编辑状态（原有）
    const [addParentKey, setAddParentKey] = useState('');
    const [newItemKey, setNewItemKey] = useState('');
    const [newItemValue, setNewItemValue] = useState('');
    const [newItemInnerKey, setNewItemInnerKey] = useState('');
    const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
    const [newItemType, setNewItemType] = useState<'string' | 'object' | 'array'>('string');
    const [isArrayModalVisible, setIsArrayModalVisible] = useState(false);
    const [arrayParentKey, setArrayParentKey] = useState('');
    const [newArrayItemValue, setNewArrayItemValue] = useState('');

    // —— 工具：类型保护（顶层必须是对象或数组）
    const isComplexRoot = (v: any): v is ComplexData => v && typeof v === 'object' && (Array.isArray(v) || Object.prototype.toString.call(v) === '[object Object]');

    // —— JSON 相关：校验
    const validateJson = () => {
        try {
            const parsed = JSON.parse(jsonRaw);
            if (!isComplexRoot(parsed)) {
                setJsonError('顶层必须是对象（Object）或数组（Array）。');
                setJsonParsed(null);
                return;
            }
            setJsonParsed(parsed);
            setJsonError('');
            notification.success({message: 'JSON 校验成功', icon: <CheckCircleOutlined style={{color: '#52c41a'}}/>});
        } catch (e:any) {
            setJsonParsed(null);
            setJsonError(e?.message || 'JSON 解析失败');
            notification.error({message: 'JSON 解析失败', description: e?.message});
        }
    };

    // —— JSON 相关：格式化
    const formatJson = () => {
        try {
            const parsed = JSON.parse(jsonRaw);
            setJsonRaw(JSON.stringify(parsed, null, 2));
            setJsonError('');
            setJsonParsed(isComplexRoot(parsed) ? parsed : null);
        } catch (e:any) {
            setJsonError(e?.message || 'JSON 解析失败，无法格式化');
            notification.error({message: '格式化失败', description: e?.message});
        }
    };

    // —— JSON 相关：应用
    const applyJson = () => {
        if (!jsonParsed) {
            notification.warning({message: '请先校验 JSON 通过后再应用'});
            return;
        }
        const cloned = _.cloneDeep(jsonParsed);
        setDictValue(cloned);
        setJsonModalOpen(false);
        setJsonParsed(null);
        setJsonRaw('');
        setJsonError('');
        notification.success({message: '已应用导入的 JSON'});
    };

    // ===== 原有：树形数据转换 =====
    const transformToTreeData = ( dataItem: ComplexData, nodeKey: string = '') =>{
        if (! dataItem) return  null;
        if (typeof dataItem === "object") {
            if (Array.isArray(dataItem)) {
                if (dataItem.length === 0) return null;
                return transformToTreeDataArray(dataItem, nodeKey)
            } else {
                if (Object.entries(dataItem).length === 0) return null;
                return transformToTreeDataObject(dataItem, nodeKey)
            }
        }
        return null
    }

    const transformToTreeDataArray = (dataItem: NestedDataItem[], nodeKey: string = '') => {
        const children =  dataItem.map((item,index) => {
            const currentKey =  nodeKey? `${nodeKey}.${index}`: `${index}`;
            return  {
                title: (
                    <div>
                        {`数组项${index}`}{' '}
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleArrayRemove(currentKey);
                            }}
                            size="small"
                        />
                    </div>
                ),
                key: currentKey,
                children: transformToTreeData(item as any, currentKey)
            }
        });
        children.push({
            title: (
                <Button
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleArrayAdd(nodeKey)
                    }}
                    type="link"
                >
                    新增数组项
                </Button>
            ),
            key: `${nodeKey}.addSon`,
        });
        return children
    };

    const transformToTreeDataObject = ( dataItem: NestedDataItem, nodeKey: string = '') => {
        const children = Object.entries(dataItem).map(([key, value]) => {
            const currentKey =  nodeKey? `${nodeKey}.${key}`: `${key}`;
            if (typeof value === 'string') {
                return {
                    title: (
                        <div>
                            {key}: {value}{' '}
                            <Button icon={<DeleteOutlined />} onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(currentKey)
                            }} size="small"/>
                        </div>
                    ),
                    key: currentKey,
                };
            }
            return {
                title: (
                    <div>
                        {currentKey}{' '}
                        <Space>
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemove(currentKey)
                                }}
                                size="small"
                            />
                            <Button
                                icon={<PlusOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleAdd(currentKey)
                                }}
                                size="small"
                            />
                        </Space>
                    </div>
                ),
                key: currentKey,
                children: transformToTreeData(value as any, currentKey),
            };
        })
        return children
    };

    // ===== 原有：增删改递归 =====
    const getNestedValue = (dataItem: ComplexData, keys: string[]): any => {
        const [currentKey, ...rest] = keys;
        if (rest.length === 0) return (dataItem as any)[currentKey];
        return getNestedValue((dataItem as any)[currentKey], rest);
    };

    const addNew = (item:ComplexData, keyPath: string[], newItemValue:any) => {
        if (keyPath.length === 0) {
            if (Array.isArray(item)) {
                (item as any[]).push(newItemValue)
            }else{
                (item as any)[newItemKey] = newItemValue
            }
        }else{
            const [currentKey, ...rest] = keyPath;
            if (typeof (item as any)[currentKey] === 'object' && (item as any)[currentKey] !== null) {
                addNew((item as any)[currentKey], rest, newItemValue);
            }
        }
    };

    const remove = (item:ComplexData, keyPaths: string[]) => {
        const [currentKey, ...remainingKeys] = keyPaths;
        if (remainingKeys.length === 0) {
            if (Array.isArray(item)) {
                const index = parseInt(currentKey, 10);
                if (!isNaN(index)) {
                    (item as any[]).splice(index, 1);
                }
            } else {
                delete (item as any)[currentKey];
            }
            return;
        } else{
            if (Array.isArray(item)) {
                const index = parseInt(currentKey, 10);
                if (!isNaN(index) && (item as any[])[index] !== undefined) {
                    remove((item as any[])[index], remainingKeys);
                }
            } else {
                if ((item as any)[currentKey] !== undefined) {
                    remove((item as any)[currentKey], remainingKeys);
                }
            }
        }
    };

    const update = (item:ComplexData, keyPath: string[], newValue:any) => {
        const [currentKey, ...rest] = keyPath;
        if (rest.length === 0) {
            if (Array.isArray(item)) {
                const index = parseInt(currentKey, 10);
                if (!isNaN(index)) {
                    (item as any[])[index] = newValue;
                }
            } else {
                (item as any)[currentKey] = newValue;
            }
        } else {
            if (Array.isArray(item)) {
                const index = parseInt(currentKey, 10);
                if (!isNaN(index)) {
                    update((item as any[])[index], rest, newValue);
                }
            } else {
                update((item as any)[currentKey], rest, newValue);
            }
        }
    }

    // ===== 原有：操作处理 =====
    const handleTypeSave = () => {
        let defaultValue: any = '';
        if (newItemType === 'object') {
            defaultValue = {};
            newItemInnerKey.split(",").forEach(key=>{
                (defaultValue as any)[key.trim()] = ""
            })
        } else if (newItemType === 'array') {
            defaultValue = [];
        }
        const keys = addParentKey && addParentKey.trim() !== '' ? addParentKey.split('.') : [];
        const clonedData = _.cloneDeep(dictValue);
        addNew(clonedData, keys, defaultValue);
        setDictValue(clonedData);
        setIsTypeModalVisible(false);
    };

    const handleRemove = (key: string) => {
        Modal.confirm({
            title: '字典项删除确认',
            content: '确定要删除此字典项么？',
            onOk: () => {
                const clonedData = _.cloneDeep(dictValue);
                remove(clonedData, key.split('.'));
                setDictValue(clonedData);
            },
        });
    };

    const handleArraySave = () => {
        let defaultValue: any = newArrayItemValue;
        if (newItemType === 'object') {
            defaultValue = {};
            newArrayItemValue.split(",").forEach(key=>{
                (defaultValue as any)[key.trim()] = ""
            })
        } else if (newItemType === 'array') {
            defaultValue = [];
            const innerValue:any = {};
            newArrayItemValue.split(",").forEach(key=>{
                innerValue[key.trim()] = ""
            })
            defaultValue.push(innerValue)
        }
        const keys = arrayParentKey && arrayParentKey.trim() !== '' ? arrayParentKey.split('.') : [];
        const clonedData = _.cloneDeep(dictValue);
        addNew(clonedData, keys, defaultValue);
        setDictValue(clonedData);
        setIsArrayModalVisible(false);
    };

    const handleArrayRemove = (key: string) => {
        Modal.confirm({
            title: '数组项删除确认',
            content: '确定要删除此数组项及其所有子项吗？',
            onOk: () => {
                const clonedData = _.cloneDeep(dictValue);
                remove(clonedData,  key.split('.'));
                setDictValue(clonedData);
            },
        });
    };

    const handleEditSave = () => {
        if (!selectedKey) return;
        let newValue: any = selectedValue;
        if (newItemType === 'object') {
            newValue = {};
            selectedValue.split(",").forEach((key:string)=>{
                (newValue as any)[key.trim()] = ""
            })
        } else if (newItemType === 'array') {
            newValue = [];
            const innerValue:any = {};
            selectedValue.split(",").forEach((key:string)=>{
                innerValue[key.trim()] = ""
            })
            (newValue as any[]).push(innerValue)
        }
        const clonedData = _.cloneDeep(dictValue);
        update(clonedData,selectedKey.split('.'), newValue);
        setDictValue(clonedData);
        setEditModalVisible(false);
    };

    const handleSelect = (selectedKeys: React.Key[], info: any) => {
        if (!selectedKeys.length) return;
        const key = selectedKeys[0] as string;
        if (key.endsWith('.addSon')) return;
        const value = getNestedValue(dictValue, key.split('.'));
        if (typeof value === 'string') {
            setSelectedKey(key);
            setSelectedValue(value);
            setEditModalVisible(true);
        }
    };

    const handleEditCancel = () => {
        setEditModalVisible(false);
        setSelectedKey('');
        setSelectedValue('');
    };

    const handleArrayAdd = (parentKey: string) => {
        setArrayParentKey(parentKey);
        setNewArrayItemValue('');
        setIsArrayModalVisible(true);
    };

    const handleArrayCancel = () => {
        setIsArrayModalVisible(false);
        setArrayParentKey('');
        setNewArrayItemValue('');
    };

    const handleAdd = (parentKey: string) => {
        setAddParentKey(parentKey);
        setNewItemKey('');
        setNewItemType('string');
        setIsTypeModalVisible(true);
    };

    const handleTypeCancel = () => {
        setIsTypeModalVisible(false);
        setAddParentKey('');
        setNewItemKey('');
        setNewItemType('string');
    };

    // ===== 同步 Tree 与 onChange =====
    useEffect(() => {
        setTreeData(transformToTreeData(dictValue));
    }, [dictValue]);

    const prevDictValue = useRef<any>(defaultProp);
    useEffect(() => {
        if (!deepEqual(dictValue, prevDictValue.current)){
            onChange(JSON.stringify(dictValue));
            prevDictValue.current = dictValue;
        }
    }, [dictValue]);

    return (
        <div>
            {/* 顶部操作区：新增“导入 JSON” */}
            <Space style={{ marginBottom: 12 }}>
                <Text strong>字典编辑器</Text>
                {dictValue && Array.isArray(dictValue)
                    ? <Button onClick={() => handleArrayAdd('')} type="link" icon={<PlusOutlined />}>新增数组项</Button>
                    : <Button onClick={() => handleAdd('')} type="link" icon={<PlusOutlined />}>新增字典项</Button>
                }
                <Divider type="vertical" />
                <Button
                    icon={<UploadOutlined />}
                    onClick={() => { setJsonModalOpen(true); setJsonRaw(''); setJsonError(''); setJsonParsed(null); }}
                >
                    导入 JSON
                </Button>
            </Space>

            {/* 字典 JSON 输出 */}
            <h3>字典 JSON 输出</h3>
            <pre style={{background: '#f5f5f5', padding: 16, whiteSpace: 'pre-wrap'}}>
        {JSON.stringify(dictValue, null, 2)}
      </pre>

            {/* Tree 视图 */}
            {treeData && (
                <Tree
                    showLine
                    treeData={treeData as any}
                    onSelect={handleSelect}
                />
            )}

            {/* ====== 编辑 Modal ====== */}
            <Modal
                title="编辑节点"
                open={editModalVisible}
                onOk={handleEditSave}
                onCancel={handleEditCancel}
            >
                <Form.Item label="类型">
                    <Select value={newItemType} onChange={(v) => setNewItemType(v)}>
                        <Select.Option value="string">字符串</Select.Option>
                        <Select.Option value="object">对象</Select.Option>
                        <Select.Option value="array">数组</Select.Option>
                    </Select>
                </Form.Item>
                {newItemType === 'string' && (
                    <Form.Item label="新的值">
                        <Input value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)}/>
                    </Form.Item>
                )}
                {newItemType !== 'string' && (
                    <Form.Item label="对象字段 使用逗号分隔">
                        <Input value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)}/>
                    </Form.Item>
                )}
            </Modal>

            {/* ====== 字典项新增 Modal ====== */}
            <Modal
                title="增加新项-选择类型"
                open={isTypeModalVisible}
                onCancel={handleTypeCancel}
                footer={[
                    <Button key="cancel" onClick={handleTypeCancel}>取消</Button>,
                    <Button key="save" type="primary" onClick={handleTypeSave}>保存</Button>,
                ]}
            >
                <Form.Item label="KEY">
                    <Input value={newItemKey} onChange={(e) => setNewItemKey(e.target.value)}/>
                </Form.Item>
                <Form.Item label="类型">
                    <Select value={newItemType} onChange={(v) => setNewItemType(v)}>
                        <Select.Option value="string">字符串</Select.Option>
                        <Select.Option value="object">对象</Select.Option>
                        <Select.Option value="array">数组</Select.Option>
                    </Select>
                </Form.Item>
                {newItemType === 'string' && (
                    <Form.Item label="新的值">
                        <Input value={newItemValue} onChange={(e) => setNewItemValue(e.target.value)}/>
                    </Form.Item>
                )}
                {newItemType !== 'string' && (
                    <Form.Item label="对象字段 使用逗号分隔">
                        <Input value={newItemInnerKey} onChange={(e) => setNewItemInnerKey(e.target.value)}/>
                    </Form.Item>
                )}
            </Modal>

            {/* ====== 数组项新增 Modal ====== */}
            <Modal
                title="新增数组项"
                open={isArrayModalVisible}
                onCancel={handleArrayCancel}
                footer={[
                    <Button key="cancel" onClick={handleArrayCancel}>取消</Button>,
                    <Button key="save" type="primary" onClick={handleArraySave}>保存</Button>,
                ]}
            >
                <Form.Item label="类型">
                    <Select value={newItemType} onChange={(v) => setNewItemType(v)}>
                        <Select.Option value="string">字符串</Select.Option>
                        <Select.Option value="object">对象</Select.Option>
                        <Select.Option value="array">数组</Select.Option>
                    </Select>
                </Form.Item>
                {newItemType === 'string' && (
                    <Form.Item label="新的值">
                        <Input value={newArrayItemValue} onChange={(e) => setNewArrayItemValue(e.target.value)}/>
                    </Form.Item>
                )}
                {newItemType !== 'string' && (
                    <Form.Item label="对象字段 使用逗号分隔">
                        <Input value={newArrayItemValue} onChange={(e) => setNewArrayItemValue(e.target.value)}/>
                    </Form.Item>
                )}
            </Modal>

            {/* ====== 导入 JSON Modal（新增） ====== */}
            <Modal
                title="导入 JSON（粘贴完整 JSON 字符串）"
                width={720}
                open={jsonModalOpen}
                onCancel={() => { setJsonModalOpen(false); setJsonParsed(null); setJsonRaw(''); setJsonError(''); }}
                footer={[
                    <Button key="format" icon={<FormatPainterOutlined />} onClick={formatJson}>
                        格式化
                    </Button>,
                    <Button key="validate" icon={<CheckCircleOutlined />} onClick={validateJson}>
                        校验
                    </Button>,
                    <Button key="apply" type="primary" onClick={applyJson} disabled={!jsonParsed}>
                        应用
                    </Button>,
                ]}
            >
                <Text type="secondary">要求：顶层必须是对象（Object）或数组（Array）。</Text>
                <TextArea
                    autoSize={{ minRows: 8, maxRows: 18 }}
                    placeholder='例如：{"a":1,"b":[{"x":""}] }'
                    value={jsonRaw}
                    onChange={(e) => setJsonRaw(e.target.value)}
                    style={{ fontFamily: 'Monaco, Menlo, Consolas, monospace', marginTop: 8 }}
                />
                {jsonError ? (
                    <Text type="danger" style={{ display: 'block', marginTop: 8 }}>错误：{jsonError}</Text>
                ) : jsonParsed ? (
                    <Text type="success" style={{ display: 'block', marginTop: 8 }}>校验通过，可点击“应用”。</Text>
                ) : null}
            </Modal>
        </div>
    );
};

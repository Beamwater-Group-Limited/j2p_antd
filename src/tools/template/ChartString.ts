const CHART_STRING = ` // {{userName}}{{innerComponent}}
{{#each importNameModdule}}
import { {{#each this}} {{#if @last}} {{this}} {{else}} {{this}}, {{/if}} {{/each}} } from "{{@key}}";
{{/each}}
{{#each importType}}
import { {{#each this}} {{#if @last}} {{this}} {{else}} {{this}}, {{/if}} {{/each}} } from "{{@key}}";
{{/each}}
{{#each importDefaultModdule}}
import {{this}} from "{{@key}}";
{{/each}}
{{#if parentComponent }}
const { {{sonComponent}} } = {{ parentComponent }}
{{/if}}
// 动态生成的图表组件
export const {{userName}}{{innerComponent}} = ({ 
    {{#each compProps}} {{this}}, {{/each}} 
    {{#each customProps}}
    {{name}}, {{#if isTemp }} {{name}}_temp, {{/if}}
    {{/each}}  }) => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    // 动态生成的拖拽节点相关
    const {id:nodeID, connectors: { connect, drag } } = useNode();
    const {deleteCurrentNodeChildren} = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const {pageData} = usePagesData()
    // 判断是否为脏数据
    const [isDirty, setIsDirty] = useState<boolean>(false);
    // 动态生成的状态
    {{#each states}}
    const [{{key}}, set{{capKey}}] = useState<any>({{#if (isString defaultValue ) }} "{{defaultValue}}" {{else}} {{defaultValue}} {{/if}});
    const change{{capKey}} = (newStates:any) => {
        setIsDirty(true)
        set{{capKey}}(newStates)
    }
    {{/each}}
    // 总状态
    const [cbtState, setCbtState] = useState<Record<string,any>>({
          {{#each states}}
              {{key}}: {{#if (isString defaultValue ) }} "{{defaultValue}}" {{else}} {{defaultValue}} {{/if}}
          {{/each}}
    });
    //    连接网络
    const { ws, connectionStatus,restoreCbtState} = useWebSocket();
    // 发送状态改变数据
    const sendStateChange = async (ws:WebSocket, nodeID:string,nameState) => {
        const eventPayload = {
            message_id: v4().replace(/-/g, '').slice(0,8),
            timestamp: new Date().toISOString(),
            user_id: appConfig.userID,
            domtree_id: projectConfig.project_id,
            node_id: nodeID,
            type: "stateChange",
            data: {
                stateValue: JSON.stringify(cbtState[nameState])
            }
        }
        if (ws) {
            ws.send(JSON.stringify(eventPayload)); // 直接发送 JSON 数据到后端
            console.log("📤 WebSocket 已发送事件:", eventPayload);
        } else {
            console.warn("WebSocket 未连接，事件无法发送:", eventPayload);
        }
    }
    // 注册总状态更新事件
    useEffect(() => {
        const subscription = EventService.subscribe(nodeID, (data) => {
            // console.log("📌 收到事件:",nodeID, data.payload);
            setCbtState(data);
        });
        return () => {
            subscription.unsubscribe(); // 组件卸载时取消订阅
            {{#each customProps}}
            {{#if (eqn type "renderItem")}}
            deleteCurrentNodeChildren();
            {{/if}}
            {{/each}}
        };
    }, []);
    useEffect(() => {
        if (ws.readyState === WebSocket.OPEN && pageData.nodesStated.includes(nodeID)){
            restoreCbtState(nodeID,cbtState)
        }
    }, [ws.readyState]);
    // 根据总状态更新单个状态
    useEffect(() => {
      {{#each states}}
      set{{capKey}}(cbtState["{{key}}"])
      {{/each}}
    }, [cbtState]);

    //动态生成发送状态变化 
    {{#each states}}
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("属性被改变:","{{key}}",{{key}})
         if (isDirty){
            sendStateChange(ws,nodeID,"{{key}}");
            setIsDirty(false);
         }
    }, [{{key}}]);
   {{/each}}
   
    {{#each customProps}}
    {{#if isAsync }}
    // 异步属性
    const [{{name}}_async, {{setName name}}_async] = useState<any>();
    useEffect(() => {
        parse_{{name}}({{name}}).then((func) => {
            {{setName name}}_async(() => func)
        })
    }, [{{name}} {{#each customProps}} {{#if (eqn name "dataSource") }} ,dataSource_temp {{/if}} {{/each}} ] );
    {{/if}}
    {{#if isState }}
    // 状态属性
    useEffect(() => {
        {{setName name}}State( {{name}} )
    },[{{name}}])
    {{/if}}
    {{/each}}
    
    const chartContainerRef = useRef(null); // chart 容器引用
    const charRef = useRef(null); // 保存 chart 实例
    
  useEffect(() => {
        if (chartContainerRef.current) {
            // 如果有现存的图表实例，销毁它以防止重复初始化
            if (charRef.current) {
                charRef.current.destroy();
                charRef.current = null;
            }

            // 初始化折线图
            const chartInstant = new {{innerComponent}}(chartContainerRef.current, {
                data: data || [],
                {{#each customProps}}
                  {{#if isState }}
                  {{name}}: {{name}}State,
                  {{else}}
                      {{#if isTemp }} 
                  {{name}}: {{name}}_temp?{{name}}_temp:parse_{{type}} ({{#each options}} {{this}} ,{{/each}} {{ name}}),
                      {{else}}
                          {{#if isAsync }}
                  {{name}}:{{name}}_async,
                          {{else}}
                  {{name}}:{{name}},
                          {{/if}}
                      {{/if}}
                  {{/if}}
                  {{/each}}
            });

            // 渲染折线图
            chartInstant.render();
            charRef.current = chartInstant; // 保存实例
        }

        return () => {
            // 组件卸载时，安全销毁图表实例
            if (charRef.current) {
                charRef.current.destroy();
                charRef.current = null; // 防止内存泄漏
            }
        };
    }, [ data, {{#each customProps}} {{name}},{{#if isTemp }} {{name}}_temp, {{/if}}  {{/each}} ]); 
            
    return (
        <div ref={ref => { 
            if (ref) { connect(drag(ref)); }
            chartContainerRef.current = ref;
            }
        }
             className={ className }
             data-event={dataevent}
             data-targetid={nodeID}
             >
        </div>
    );

};
      
const {{userName}}{{innerComponent}}Settings = () => {
    const { actions:{setProp}, props} = useNode((node) =>({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol=\\{{ span:24 }} wrapperCol=\\{{ span:24 }}>
                <Form.Item label="内容组件">
                  <Input
                    value={ props.children }
                    onChange={(e) => setProp((props) => (props.children = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="TailWindCss">
                  <Input
                    value={ props.className }
                    onChange={(e) => setProp((props) => (props.className = e.target.value))}
                    />
                </Form.Item>
                <Form.Item label="图表数据">
                <DictItemTree
                        value={ props.data }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} [] {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.data = dictValue;
                            });
                        }}
                />
                </Form.Item>
                {{#each customProps}}
                <Form.Item label="{{label}}">
                   {{#if (eqn type "state")}}
                    <Typography.Text type="success">初始值:{ JSON.stringify(props.{{name}}) }</Typography.Text>
                    {{/if}}
                   {{#if (eqn type "radio")}}
                    <Radio.Group
                        value={ props.{{name}} }
                        onChange={(e) => setProp((props) => (props.{{name}} = e.target.value))}
                    >
                        { [{{#each options}}"{{ value }}",{{/each}}].map( (option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        )) }
                    </Radio.Group>
                    {{/if}}
                    {{#if (eqn type "input")}}
                    <Input
                        value={ props.{{name}} }
                        onChange={(e) => setProp((props) => (props.{{name}} = e.target.value))}
                    />
                    {{/if}}
                    {{#if (eqn type "icon")}}
                    <Input
                        value={ props.{{name}} }
                        onChange={(e) => {
                            setProp((props) => (props.{{name}} = e.target.value));
                            {{#if isTemp }}
                            setProp((props) =>  (props.{{name}}_temp = parse_icon(e.target.value) ));
                            {{/if}}
                            }
                        }
                    />
                    {{/if}}
                    {{#if (eqn type "inputNumber")}}
                    <InputNumber
                        value={ props.{{name}} }
                        onChange={(value) => setProp((props) => (props.{{name}} = value))}
                    />
                    {{/if}}
                    {{#if (eqn type "menuProps")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} {} {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                                {{#if isTemp }}
                                props.{{name}}_temp = parse_menuProps(dictValue);
                                {{/if}}
                            });
                        }}
                    />
                    {{/if}}
                    {{#if (eqn type "menuItems")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} [] {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                                {{#if isTemp }}
                                props.{{name}}_temp = parse_menuItems(dictValue);
                                {{/if}}
                            });
                        }}
                    />
                    {{/if}}
                    {{#if (eqn type "timelineItems")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} [] {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                                {{#if isTemp }}
                                props.{{name}}_temp = parse_timelineItems(dictValue);
                                {{/if}}
                            });
                        }}
                    />
                    {{/if}}
                    {{#if (eqn type "listSource")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} [] {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                                {{#if isTemp }}
                                props.{{name}}_temp = parse_listSource(dictValue);
                                {{/if}}
                            });
                        }}
                    />
                    {{/if}}
                    {{#if (eqn type "select")}}
                    <Select
                        value={ props.{{name}} }
                        onChange={(value) => setProp((props) => (props.{{name}} = value))}
                    >
                        {  [{{#each options}}"{{ value }}",{{/each}}].map( (option) => (
                            <Select.Option key={option} value={option}>
                            {option}
                            </Select.Option>
                        )) }
                    </Select>
                    {{/if}}
                    {{#if (eqn type "checkbox")}}
                    <Checkbox.Group
                        value={ props.{{name}} }
                        onChange={(values) => setProp((props) => (props.{{name}} = value))}
                    >
                       { [{{#each options}}"{{this}}",{{/each}}].map( (option) => (
                           <Checkbox key={option} value={option}>
                                {option}
                           </Checkbox>
                        )) }
                    </Checkbox.Group>
                    {{/if}}
                    {{#if (eqn type "switch")}}
                    <Switch
                        checked={ props.{{name}} }
                        onChange={(checked) => setProp((props ) => (props.{{name}} = checked))}
                    />
                    {{/if}}
                    {{#if (eqn type "textarea")}}
                    <Input.TextArea
                        value={ props.{{name}} }
                        onChange={(e) => setProp((props) => (props.{{name}} = e.target.value))}
                    />
                    {{/if}}
                    {{#if (eqn type "slider")}}
                    <Slider
                        value={props.{{name}} || 7}
                        step={1}
                        min={1}
                        max={5}
                        onChange={(value) => setProp((props) => (props.{{name}} = value))}
                    />
                    {{/if}}
                    {{#if (eqn type "renderItem")}}
                    <Input
                        value={ props.{{name}} }
                        onChange={(e) => {
                            setProp((props) => (props.{{name}} = e.target.value));
                            }
                        }
                    />
                    {{/if}}
                    {{#if (eqn type "typographyOnClick")}}
                    <Input
                        value={ props.{{name}} }
                        onChange={(e) => {
                            setProp((props) => (props.{{name}} = e.target.value));
                            }
                        }
                    />
                    {{/if}}
                </Form.Item>
                {{/each}}
            </Form>
        </div>
    )
};
                        
// 组件配置和默认属性
{{userName}}{{innerComponent}}.craft = {
  displayName: "{{userName}}{{innerComponent}}",
  props: {
    {{#each defaultProps}}
    {{@key}}: {{#if (isString this) }} "{{this}}" {{else}} {{this}} {{/if}},
    {{/each}}
  },
  related: {
    settings: {{userName}}{{innerComponent}}Settings,
  },
};
`;

export {CHART_STRING}

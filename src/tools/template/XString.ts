const X_STRING = ` // {{userName}}{{innerComponent}}
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
// 动态生成的基础组件
export const {{userName}}{{innerComponent}} = ({ 
    {{#each compProps}} {{this}}, {{/each}} 
    {{#each customProps}}
    {{name}}, {{#if isTemp }} {{name}}_temp, {{/if}}
    {{/each}}  }) => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    // 动态生成的拖拽节点相关
    const {id:nodeID, connectors: { connect, drag } } = useNode();
    const {deleteCurrentNodeChildren,craftJsonToJSX} = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const ownerID = projectConfig.owner_id;
    const {pageData} = usePagesData()
    {{#if (eqn innerComponent "video")}}
    const { initVideo, handleReconnect } = useWebrtc(nodeID)
    {{/if}}
    const { parse_XAgentContext } = useXAgentContext();
    // 判断是否为脏数据
    const [isDirty, setIsDirty] = useState<boolean>( false );
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
              {{key}}: {{#if (isString defaultValue ) }} "{{defaultValue}}" {{else}} {{defaultValue}} {{/if}},
          {{/each}}
    });
    //    连接网络
    const {ws, sendStateChange, restoreCbtState } = useWebSocket();
    // 注册总状态改变事件
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
        if (ws?.readyState === WebSocket.OPEN && pageData.nodesStated.includes(nodeID)){
            restoreCbtState(nodeID,cbtState)
        }
    }, [ws?.readyState]);
    // 根据总状态更新单个状态
    useEffect(() => {
      {{#each states}}
      if(cbtState["{{key}}"]) { set{{capKey}}(JSON.parse(cbtState["{{key}}"])) }
      {{/each}}
    }, [cbtState]);

    //动态生成发送状态变化 
    {{#each states}}
    // 动态生成发送状态变化
     useEffect(() => {
         console.log("状态变化:","{{key}}",{{key}},isDirty)
         if (isDirty){
            sendStateChange(nodeID,"{{key}}",{{key}});
            setIsDirty(false);
         }
    }, [{{key}}]);
    {{#if (eqn key "childrenState")}}
    useEffect(() => {
        if(!children) return;
        setChildrenState(children)
    }, [children])
    {{/if}}
   {{/each}}
   
    {{#each customProps}}
    {{#if isAsync }}
    // 异步属性函数
    const [{{name}}_async, {{setName name}}_async] = useState<any>();
    useEffect(() => {
        parse_{{type}}({{#each options}} {{this}} ,{{/each}} {{name}}).then(func => {
            {{setName name}}_async(() => func)
        })
    }, [{{name}} {{#each customProps}} {{#if (eqn name "dataSource") }} ,dataSource_temp {{/if}} {{/each}} ] );
    {{/if}}
    {{#if isAsyncValue }}
    // 异步属性值
    const [{{name}}_asyncvalue, {{setName name}}_asyncvalue] = useState<any>();
    useEffect(() => {
        parse_{{type}}({{#each options}} {{this}} ,{{/each}} {{name}}).then(value => {
            {{setName name}}_asyncvalue(value)
        })
    }, [{{name}}]);
    {{/if}}
    {{#if isState }}
    // 状态属性
    useEffect(() => {
        {{setName name}}State( {{name}} )
    },[{{name}}])
    {{/if}}
    {{/each}}
    
  return (
    {{#if needWrap}}
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}>
        <{{sonComponent}}
    {{else}}
        <{{sonComponent}}
        ref={ref => { if (ref) { connect(drag(ref)); }}}
    {{/if}}  
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          {{#each customProps}}
          {{#if isState }}
          {{name}}={ {{name}}State }
          {{else}}
              {{#if isTemp }} 
          {{name}}={ {{name}}_temp?{{name}}_temp:parse_{{type}} ({{#each options}} {{#if @first}} "{{this}}", {{else}} {{this}}, {{/if}}{{/each}} {{name}} ) }
              {{else}}
                  {{#if isAsync }}
          {{name}}={ {{name}}_async }
                  {{else}}
                      {{#if isAsyncValue }}
          {{name}}={ {{name}}_asyncvalue }
                      {{else}}
          {{name}}={ {{name}} }    
                      {{/if}}
                  {{/if}}
              {{/if}}
          {{/if}}
          {{/each}}
        {{#if haveChildren}}
          >
             {{#if (containsBy states "key" "childrenState")}}
         {childrenState}
             {{else}}
         {children}
             {{/if}}
         </{{sonComponent}}>
         {{else}}
         />
        {{/if}}
    {{#if needWrap}}
    </div>
    {{/if}}
  );
};

//  是否是容器
{{userName}}{{innerComponent}}.isCanvas = {{ isCanvas }};
      
const {{userName}}{{innerComponent}}Settings = () => {
    const { actions:{setProp}, props} = useNode((node) =>({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol=\\{{ span:24 }} wrapperCol=\\{{ span:24 }}>
                <Form.Item label="Children">
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
                    {{#if (eqn type "tabsProps")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} {} {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                            });
                        }}
                    />
                    {{/if}}
                    {{#if (eqn type "progressProps")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} {} {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                                {{#if isTemp }}
                                props.{{name}}_temp = parse_{{type}}(dictValue);
                                {{/if}}
                            });
                        }}
                    />
                    {{/if}}
                    {{#if (eqn type "markProps")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} {} {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                                {{#if isTemp }}
                                props.{{name}}_temp = parse_{{type}}(dictValue);
                                {{/if}}
                            });
                        }}
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
                    {{#if (eqn type "countProps")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} {} {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                                {{#if isTemp }}
                                props.{{name}}_temp = parse_countProps(dictValue);
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
                    {{#if (eqn type "tableColumns")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} [] {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                            });
                        }}
                    />
                    {{/if}}
                    {{#if (eqn type "XAgentContext")}}
                    <Space direction="vertical" style=\\{{ width: '100%' }} >
                        <Input.TextArea
                            autoSize=\\{{ minRows: 6 }}
                            value={ props.{{name}} }
                            onChange={(e) =>  {
                                  try{
                                     JSON.parse(e.target.value)
                                     setProp((props) => (props.{{name}} = e.target.value))
                                  }
                                  catch (error){
                                      const cheng = jsonErrorWithLineCol(e.target.value, error);
                                      message.error(cheng);
                                  }
                                }
                            } 
                        />
                    </Space>
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
                    {{#if (eqn type "reactNode")}}
                    <Input
                        value={ props.{{name}} }
                        onChange={(e) => {
                            setProp((props) => (props.{{name}} = e.target.value));
                            }
                        }
                    />
                    {{/if}}
                    {{#if (eqn type "dayjs")}}
                    <DatePicker
                        onChange={(date,dateString) => {
                            setProp((props) => (props.{{name}}_temp = parse_dayjs(dateString) ));
                            }
                        }
                    />
                    {{/if}}
                    {{#if (eqn type "transforTarget")}}
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
    rules: {
        canDrop: (targetNode: Node, currentNode: Node) => {
            return targetNode["data"]["displayName"] === "XAgentProvider"
        }
    },
   related: {
    settings: {{userName}}{{innerComponent}}Settings,
   },
};
`;

export {X_STRING}

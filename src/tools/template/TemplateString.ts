const TEMPLATE_STRING = `
// {{userName}}{{innerComponent}}
{{#each importNameModdule}}
import { {{#each this}} {{#if @last}} {{this}} {{else}} {{this}}, {{/if}} {{/each}} } from "{{@key}}";
{{/each}}
import * as CbtaiAntd from "antd";
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
    {{#unless (eq name "children")}}
        {{#unless (eq name "dataevent")}}
    {{name}}, {{#if isTemp}}{{name}}_temp,{{/if}} {{#if isFunc}}{{name}}_func,{{/if}} {{#if isDict}}{{name}}_dict,{{/if}}
        {{/unless}}
      {{/unless}}
    {{/each}}
    }) => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject()
    // 动态生成的拖拽节点相关
    const {id:nodeID, connectors: { connect, drag } } = useNode();
    const {deleteCurrentNodeChildren,craftJsonToJSX} = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const ownerID = projectConfig.owner_id;
    const {pageData,nodeLocalState, setMainCompoID} = usePagesData()
    {{#if (eqn innerComponent "video")}}
    const { initVideo, handleReconnect } = useWebrtc(nodeID)
    {{/if}}
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
              {{key}}: {{#if (isString defaultValue ) }} "{{defaultValue}}" {{else}} {{defaultValue}} {{/if}},
          {{/each}}
    });
    //    连接网络
    const {ws, sendStateChange, restoreCbtState,sendEvent } = useWebSocket();
    // 注册总状态改变事件
    useEffect(() => {
        const subscription = EventService.subscribe(nodeID, (data) => {
            // console.log("📌 收到事件:",nodeID, data.payload);
            setCbtState(data);
        });
        setMainCompoID(nodeID)
        // 触发订阅本地消息
        return () => {
            subscription.unsubscribe(); // 组件卸载时取消订阅
            {{#each customProps}}
            {{#if (eqn type "renderItem")}}
            deleteCurrentNodeChildren();
            {{/if}}
            {{/each}}
        };
    }, []);
    // 注册本地状态改变
    useEffect(() => {
        if (! nodeLocalState || nodeLocalState.length === 0) return
        // 注册本地事件
        const subscriptionLocal = EventService.subscribeLocal(nodeLocalState, (data) => {
            // console.log("收到本地事件", data)
            setCbtState(data)
        })
        return () => {
            subscriptionLocal.unsubscribe(); // 卸载
        }
    }, [nodeLocalState]);
    
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
    
    const parseParams = {   {{#each cbtaiParams}}  {{this}}, {{/each}}  }
    
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
    <div ref={ref => { if (ref) { connect(drag(ref));  {{#if (eqn sonComponent "audio") }}
                    if (autoPlay) {
                        const playPromise = ref.play();
                        if (playPromise) {
                            playPromise.catch((err) => {
                                console.warn('音频自动播放失败（浏览器限制）：', err);
                            });
                        }
                    }
                    {{/if}} 
                    }}}>
        <{{sonComponent}}
    {{else}}
        <{{sonComponent}}
            ref={ref => {
                if (ref) {
                    connect(drag(ref));
                    {{! 仅当组件是audio时，才添加自动播放+错误捕获逻辑 }}
                    {{#if (eqn sonComponent "audio") }}
                    if (autoPlay) {
                        const playPromise = ref.play();
                        if (playPromise) {
                            playPromise.catch((err) => {
                                console.warn('音频自动播放失败（浏览器限制）：', err);
                            });
                        }
                    }
                    {{/if}}
                }}}
    {{/if}}  
          className={ className }
          data-event={dataevent}
          data-targetid={nodeID}
          {{#each customProps}}
          {{#if isState }}
          {{name}}={ {{name}}State }
          {{else}}
            {{#if isDict }}
          {{name}}={ {{name}}_dict?{{name}}_dict:parse_{{type}}( {{#each options}} {{#if @first}}"{{this}}", {{else}} {{this}}, {{/if}}{{/each}} parseParams, {{ name }}) }
            {{else}}
              {{#if isFunc }} 
          {{name}}={ {{name}}_func?{{name}}_func:parse_{{type}}( {{#each options}} {{#if @first}}"{{this}}", {{else}} {{this}}, {{/if}}{{/each}} parseParams, {{ name}}) }
              {{else}}
                       {{#if isTemp }} 
          {{name}}={ {{name}}_temp?{{name}}_temp:parse_{{type}} ({{#each options}} {{this}} ,{{/each}} {{ name}}) }
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
                    
                    {{#if (eqn type "func")}}
                    <DoubleInput
                        value={ props.{{name}} }
                        onChange={(value) => {
                            setProp((props) => (props.{{name}} = value));
                        }}
                        bottomLabel="JS 代码"
                        jsValidation=\\{{
                            maxLength: 100000,
                            forbidden: [/eval\\s*\\(/i, /new\\s+Function\\s*\\(/i], // 可自定义
                            strict: true,
                            debounceMs: 250,
                        }}
                    />
                    {{/if}}
                    {{#if (eqn type "dict")}}
                    <DoubleInput
                        value={ props.{{name}} }
                        onChange={(value) => {
                            setProp((props) => (props.{{name}} = value));
                        }}
                        bottomLabel="JS 代码"
                        jsValidation=\\{{
                            maxLength: 100000,
                            forbidden: [/eval\\s*\\(/i, /new\\s+Function\\s*\\(/i], // 可自定义
                            strict: true,
                            debounceMs: 250,
                        }}
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
                    {{#if (eqn type "selectionProps")}}
                    <DictItemTree
                        value={ props.{{name}} }
                        defaultProp={ {{#if defaultValue}} {{defaultValue}} {{else}} {} {{/if}} }
                        onChange={(value) => {
                            const dictValue = JSON.parse(value);
                            setProp((props) => {
                                props.{{name}} = dictValue;
                                {{#if isTemp }}
                                props.{{name}}_temp = parse_selectionProps(dictValue);
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
  related: {
    settings: {{userName}}{{innerComponent}}Settings,
  },
};
`;

export {TEMPLATE_STRING}

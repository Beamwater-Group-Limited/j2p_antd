const CUSTOM_PAGE_STRING = `// {{innerComponent}}
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
// 动态生成的定制化组件
export const {{innerComponent}} = ({ 
    {{#each compProps}} {{this}}, {{/each}} 
    {{#each customProps}}
    {{name}}, {{#if isTemp }} {{name}}_temp, {{/if}}
    {{/each}}  }) => {
    const {projectConfig} = useProject()
    const {addNodesToCurrentNodeParent, deleteSelf,cleanupNodes, getTreeWithDomID} = useCraftJS()
    const {connectors: { connect, drag } } = useNode();
    const [json, setJson] = useState<{}>();
    useEffect(() => {
        if (!json) return;
        const nodeMap = addNodesToCurrentNodeParent(json, parentProps)
        deleteSelf()
        return () => {
            cleanupNodes(nodeMap)
        }
    }, [json]);
     useEffect(() => {
        const jsonLocal = sessionStorage.getItem('{{innerComponent}}')
        if (jsonLocal){
            setJson(JSON.parse(jsonLocal))
        }else{
            getTreeWithDomID(projectConfig.owner_id, '{{innerComponent}}').then(v =>{
                setJson(v)
                sessionStorage.setItem('{{innerComponent}}', JSON.stringify(v))
            })
        }
    }, []);
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}
          className={ className }>
        {children}
    </div>
  );
};
              
const {{innerComponent}}Settings = () => {
    const { actions:{setProp}, props} = useNode((node) =>({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol=\\{{ span:24 }} wrapperCol=\\{{ span:24 }}>
                <Form.Item label="内容">
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
            </Form>
        </div>
    )
};
//  是否是容器
{{innerComponent}}.isCanvas = true;
// 组件配置和默认属性
{{innerComponent}}.craft = {
  displayName: "{{innerComponent}}",
  props: {
    {{#each defaultProps}}
    {{@key}}: {{#if (isString this) }} "{{this}}" {{else}} {{this}} {{/if}},
    {{/each}}
  },
  related: {
    settings:  {{innerComponent}}Settings,
  },
};
`;

export {CUSTOM_PAGE_STRING}

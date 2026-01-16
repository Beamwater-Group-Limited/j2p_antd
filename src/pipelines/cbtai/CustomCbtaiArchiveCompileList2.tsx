// CustomCbtaiArchiveCompileList2
import {   useNode   } from "@craftjs/core";
import {   v4   } from "uuid";
import {   Form,    Select,    Switch,    Radio,    Checkbox,    Slider,    Input,    Typography,    InputNumber   } from "antd";
import {   useEffect,    useState,    useContext,    ReactNode   } from "react";
import {   useNavigate   } from "react-router-dom";
import {   EventService,    getUserName,    parse_menuProps,    parse_menuItems,    parse_icon,    parse_timelineItems   } from "@/tools";
import {   useAppConfig,    useProject   } from "@/context";
import {   DictItemTree  } from "@/ide";
import {   useCraftJS } from "@/hooks";
import {   DynamicAntdIcon   } from "@/pipelines/cbtai";
import {   FormProps,    SelectProps,    SwitchProps,    RadioProps,    CheckboxProps,    SiderProps,    InputProps,    TypographyProps,    MenuProps   } from "antd";
import React from "react";
// 动态生成的定制化组件
export const CustomCbtaiArchiveCompileList2 = ({
     className,  parentProps,  children,
  }) => {
    const {projectConfig} = useProject()
    const {getTreeWithDomID, craftJsonToJSX} = useCraftJS()
    const {connectors: { connect, drag } } = useNode();
    const [json, setJson] = useState<{}>();
    const [content, setContent] = useState<ReactNode>(null)
    useEffect(() => {
        if (!json) return;
        setContent(craftJsonToJSX(json,parentProps))
    }, [json]);
     useEffect(() => {
        const jsonLocal = sessionStorage.getItem('CustomCbtaiArchiveCompileList2')
        if (jsonLocal){
            setJson(JSON.parse(jsonLocal))
        }else{
            getTreeWithDomID(projectConfig.owner_id, 'CustomCbtaiArchiveCompileList2').then(v =>{
                setJson(v)
                sessionStorage.setItem('CustomCbtaiArchiveCompileList2', JSON.stringify(v))
            })
        }
    }, []);
  return (
    <div ref={ref => { if (ref) { connect(drag(ref)); }}}
          className={ className }>
        {content}
    </div>
  );
};

const CustomCbtaiArchiveCompileList2Settings = () => {
    const { actions:{setProp}, props} = useNode((node) =>({
        props: node.data.props,
    }));
    return (
        <div>
            <Form labelCol={{ span:24 }} wrapperCol={{ span:24 }}>
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
CustomCbtaiArchiveCompileList2.isCanvas = true;
// 组件配置和默认属性
CustomCbtaiArchiveCompileList2.craft = {
  displayName: "CustomCbtaiArchiveCompileList2",
  props: {
    disabled:  false ,
  },
  related: {
    settings:  CustomCbtaiArchiveCompileList2Settings,
  },
};

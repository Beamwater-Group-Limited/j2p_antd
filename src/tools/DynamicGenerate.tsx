import Handlebars from "handlebars";
import {
    CUSTOM_ITEM_STRING,
    TEMPLATE_STRING,
    TEMPLATE_DYNAMICIMPORT_STRING,
    TEMPLATE_INDEX_STRING,
    CUSTOM_PAGE_STRING,
    CHART_STRING, X_STRING
} from "@/tools";

// 注册 eq 辅助函数
// Handlebars.registerHelper('eq', function (this: any, a: any, b: any, options: any) {
//     return a === b ? options.fn(this) : options.inverse(this);
// });

Handlebars.registerHelper('eq', (a, b) => a === b);

Handlebars.registerHelper('neq', (a, b) => a !== b);
Handlebars.registerHelper('and', (a, b) => a && b);

// 注册 eq 辅助函数
Handlebars.registerHelper('eqn', function (a: any, b: any) {
    return a === b;
});

Handlebars.registerHelper('isString', function(value) {
    return typeof value === 'string';
});

// 创造状态的后一个设置方法
Handlebars.registerHelper('setName', function(value:any) {
    if (!value || typeof value !== 'string') return '';
    const first = value.charAt(0).toUpperCase();
    const rest = value.slice(1);
    return `set${first}${rest}`;
});

// 判断数组中是否包含
Handlebars.registerHelper('containsBy', function(array, key:string, value:string) {
    return Array.isArray(array) && array.some(item => item[key] === value)
});


//  生成组件 XXX.tsx
const generateComponents =  (config: any)=> {
    // console.log("输出模板", TEMPLATE_STRING)
    // 编译模板
    const compiledTemplate = Handlebars.compile(TEMPLATE_STRING);
    // 填充模板数据
    return compiledTemplate(config);
}

//  生成 index.tsx
const generateComponentsIndex =  (compTypes: any)=> {
    // 编译模板
    const compiledTemplate = Handlebars.compile(TEMPLATE_INDEX_STRING);

    // 填充模板数据
    const tsxCode = compiledTemplate(compTypes);

    // 生成模版数据
    // console.log(`✅ 索引文件已生成：\n${tsxCode}`);
    return tsxCode;
}

//  生成动态导入文件 DynamicImport.tsx
const generateDynamicImport =  (compTypes: any)=> {
    // 编译模板
    const compiledTemplate = Handlebars.compile(TEMPLATE_DYNAMICIMPORT_STRING);

    // 填充模板数据
    const tsxCode = compiledTemplate(compTypes);

    // 生成模版数据
    // console.log(`✅ 动态导入文件已生成：\n${tsxCode}`);
    return tsxCode;
};


//  生成定制 渲染组件 XXX.tsx
const generateCustomComponents =  (config: any)=> {
    // 编译模板
    const compiledTemplate = Handlebars.compile(CUSTOM_ITEM_STRING);

    // 填充模板数据
    const tsxCode = compiledTemplate(config);

    // 生成模版数据
    // console.log(`✅ 组件 已生成：\n${tsxCode}`);

    return tsxCode;
}

//  生成定制 页面组件 XXX.tsx
const generateCustomPage =  (config: any)=> {
    // 编译模板
    const compiledTemplate = Handlebars.compile(CUSTOM_PAGE_STRING);

    // 填充模板数据
    const tsxCode = compiledTemplate(config);

    // 生成模版数据
    // console.log(`✅ 组件 已生成：\n${tsxCode}`);

    return tsxCode;
}
//  生成定制 表单组件 XXX.tsx
const generateChart =  (config: any)=> {
    // 编译模板
    const compiledTemplate = Handlebars.compile(CHART_STRING);

    // 填充模板数据
    const tsxCode = compiledTemplate(config);

    // 生成模版数据
    // console.log(`✅ 组件 已生成：\n${tsxCode}`);

    return tsxCode;
}
//  生成定制 表单组件 XXX.tsx
const generateX =  (config: any)=> {
    // 编译模板
    const compiledTemplate = Handlebars.compile(X_STRING);
    // 填充模板数据
    const tsxCode = compiledTemplate(config);
    // 生成模版数据
    // console.log(`✅ 组件 已生成：\n${tsxCode}`);
    return tsxCode;
}

export {
    generateChart,
    generateComponents,
    generateComponentsIndex,
    generateDynamicImport,
    generateCustomComponents,
    generateCustomPage,
    generateX,
} ;

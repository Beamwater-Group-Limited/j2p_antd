export https_proxy="http://127.0.0.1:1087" && export http_proxy="http://127.0.0.1:1087"
export https_proxy="http://192.168.0.40:1087" && export http_proxy="http://192.168.0.40:1087"
export https_proxy="http://192.168.31.11:1087" && export http_proxy="http://192.168.31.11:1087"
npm install

npx create-react-app jinja2_pipeline_antd
npm install antd @craftjs/core react-contenteditable @babel/core @babel/cli @babel/preset-env
npm install react-router-dom handlebars fs-extra @antv/x6
npm install @antv/g2plot
npm install react-error-boundary

cd /home/yb && npm start
cd /home/yb && npm run build && npx serve -s build -l 3000
等待考察
npx storybook@latest init 选择 React + Vite (TS)

JSXAttribute            它表示一个 JSX 元素的属性
Identifier              标识变量、函数、类、属性等的名称
Literal                 常量值（数字、字符串等）
BinaryExpression        表示二元运算符，如加法、减法等
ImportDeclaration       ECMAScript 引入模块 绑定（绑定名称） 源
VariableDeclarator      表示变量声明的具体部分 Identifier变量的名称 Initializer变量的初始值
ExportDeclaration       export 语法，用于从模块中导出函数、对象、变量
FunctionDeclaration     函数的声明
ExpressionStatement     执行某个表达式的语句，通常不会返回值或者用于声明变量，而是进行一些动作，如函数调用、赋值操作、条件判断等
IfStatement             if 语句

CallExpression          函数调用

Node                    AST Abstract Syntax Tree 节点 代表JS代码中的语法结构。JSON结构
Node Types

重置
rm -rf node_modules package-lock.json && npm install

用户ID         8位
项目ID         全长
页面ID         全长
管道实例ID      全长

const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const appConfig = require("./public/config/application.json");
const basePrefix = process.env.REACT_APP_BASE_PREFIX || "";

module.exports = {
    devServer: {
        client: {
            // Set the WebSocket URL to use the external port (mapping to 23000)
            webSocketURL: `wss://${appConfig.GLOBAL_IP}:${appConfig.GLOBAL_DEV_PORT}/ws`,  // Adjust with the correct IP
        },
    },
    webpack: {
        configure: (config) => {
            config.output.publicPath = basePrefix.endsWith("/")
                ? basePrefix
                : basePrefix + "/";
            // 添加优化配置项
            // config.optimization = {
            //     minimize: true,
            //     minimizer: [
            //         new TerserPlugin({
            //             terserOptions: {
            //                 compress: {
            //                     drop_console: true, // 丢弃 console 语句
            //                 },
            //             },
            //             extractComments: false, // 关闭注释提取
            //         }),
            //     ],
            // };
            /* ----------  2. 开启详细日志  ---------- */
            config.stats = {
                preset: "detailed", // 预设: 输出大多数信息，但省略每个 chunk 的模块清单
                colors: true,       // 彩色输出（显眼）
                errorDetails: true, // 显示错误堆栈
                moduleTrace: true,  // 显示导致错误的模块链
            };
            return config;
        },
        alias: {
            "@": path.resolve(__dirname, "src/"), // 让 `@/` 解析为 `src/`
        },
    }
};

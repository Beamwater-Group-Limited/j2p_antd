import React, {createContext, useContext, useState} from 'react';
import {ComponentConfig} from "@/tools";

// 消费者使用
const CompConfigContext = createContext<
    {compConfig: ComponentConfig, changeCompConfig: (config: ComponentConfig) => void }|null
>(null); // 初始化为空配置和空更新函数

// 提供者使用 作为属性传入值
const CompConfigProvider: React.FC<{
    children: React.ReactNode;
}> = ({children}) => {
    // 在上下文组件中定义一个状态，可以被子组件修改
    const [config, setConfig] = useState<ComponentConfig|null>(null);
    const updateConfig = (newConfig:ComponentConfig)=>{
        console.log("更新全局组件状态",newConfig);
        setConfig(newConfig);
    }
    return (
        <CompConfigContext.Provider value={{compConfig:config, changeCompConfig:updateConfig}}>
            {children}
        </CompConfigContext.Provider>
    );
};


const useCompConfig = () => {
    const context = useContext(CompConfigContext);
    if (!context) {
        throw new Error('useCompConfig must be used within a CompConfigProvider');
    }
    return context;
};


export {CompConfigProvider, useCompConfig};

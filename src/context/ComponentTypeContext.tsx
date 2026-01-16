import React, {createContext, Dispatch, ReactNode, useContext, useState} from "react";
import {ComponentType} from "@/tools";
// 定义一个上下文
const ComponentTypeContext = createContext<ComponentType>({
    InnerComp: "", setInnerCompType: () => {  }
});
// 暴露提供器
const ComponentTypeProvider: React.FC<{
    initialCompType?: string,
    children: ReactNode,
}> = ({initialCompType = "", children}) => {
    const [InnerCompType, setInnerCompType] = useState<string>(initialCompType);

    return (
        <ComponentTypeContext.Provider value={{InnerComp:InnerCompType, setInnerCompType:setInnerCompType}}>
            {children}
        </ComponentTypeContext.Provider>
    );
};

const useTypeConfig = () => {
    const context = useContext(ComponentTypeContext);
    if (!context) {
        throw new Error('useTypeConfig must be used within a ComponentTypeProvider');
    }
    return context;
};

export {ComponentTypeProvider, useTypeConfig};

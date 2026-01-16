import React, { createContext, useContext, useState } from 'react';
import {CompStatesContextProps} from "@/tools";


// 创建上下文
const CompStatesContext = createContext<CompStatesContextProps | null>(null);

// 提供者组件
const CompStatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compStates, setCompStates] = useState<Record<string,any>>({}); // 状态列表

    // 添加新状态
    const addCompState = (name:string,newState: any) => {
        setCompStates((prevStates) => ({...prevStates, [name]:newState}));
    };

    // 更新具体状态
    const updateCompState = (name: string, updatedState: any) => {
        console.log("更新状态",name,updatedState)
        setCompStates((prevStates) =>  ({ ...prevStates, [name]: updatedState, })
        );
    };

    // 删除状态
    const removeCompState = (name: string) => {
        setCompStates((prevStates) => {
            const { [name]: _, ...restStates } = prevStates;
            return restStates;
        });
    };

    // 提供上下文值
    return (
        <CompStatesContext.Provider value={{ compStates,setCompStates, addCompState, updateCompState, removeCompState }}>
            {children}
        </CompStatesContext.Provider>
    );
};

// 自定义 Hook
const useCompStates = () => {
    const context = useContext(CompStatesContext);
    if (!context) {
        throw new Error('useCompStates must be used within a CompStatesProvider');
    }
    return context;
};

export { CompStatesProvider, useCompStates };

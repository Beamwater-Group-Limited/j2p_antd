// XAgentContext.tsx
import {createContext, useContext} from 'react';
import {XAgentContextValue} from '@/tools';


export const XAgentContext = createContext<XAgentContextValue | null>(null);

export const useXAgentContext = () => {
    const ctx = useContext(XAgentContext);
    if (!ctx) {
        throw new Error('useXAgentContext 必须在 <XAgentProvider> 内使用');
    }
    return ctx;
};

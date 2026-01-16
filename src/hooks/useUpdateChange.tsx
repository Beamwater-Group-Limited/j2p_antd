import {useEffect, useRef, useState} from "react";
import {deepEqual} from "@/tools";
// 监视 xData 相对 引用是否变化，触发更新函数右向操作
// 监视 yData 触发状态变化 更新引用
export function useUpdateChange(initData: any,
                                updateFunc: (...args: any[]) => void, updateFuncParams: any[] = [],
                                yData?: any[],
                                changeFunc?: (...args: any[]) => any, changeFuncParams?: any[],
                                callback?:() => void ) {
    const [xData, setXData] = useState<any>(initData);
    const prevData = useRef(xData)
    useEffect(() => {
        if (!xData) return;
        if (!deepEqual(xData, prevData.current)) {
            console.log("触发数据更新", xData)
            updateFunc(...updateFuncParams, xData)
            prevData.current = xData;
        }
    }, [xData]);

    const fetchTask = async () => {
        const cheng = await changeFunc(...changeFuncParams)
        if (cheng) {
            console.log("获取数据成功", cheng)
            prevData.current = cheng;
            setXData(cheng)
            if (callback && typeof callback === "function") {
                callback();
            }
        } else {
            console.log("获取数据为空")
        }
    }
    useEffect(() => {
        if (yData.some(item => !item)) return
        fetchTask().then(r => { })
    }, [yData]);
    return {
        xData,
        setXData,
        prevData
    }
}



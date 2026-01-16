import {useEffect, useRef, useState} from "react";
import {deepEqual} from "@/tools";
// 监视 yData 触发状态变化 更新引用
export function useChange(
                                yData?:any[],
                                changeFunc?:(...args: any[]) => any,
                                changeFuncParams?:any[],
                                callback?:() => void  ) {
    const [xData, setXData] = useState<any>(null);
    const prevData = useRef(xData)
    const fetchTask = async () => {
        const cheng = await changeFunc(...changeFuncParams)
        if(cheng){
            console.log("获取数据成功",cheng)
            prevData.current = cheng;
            setXData(cheng)
            if (callback && typeof callback === "function") {
                callback();
            }
        }else{
            console.log("获取数据为空")
        }
    }
    useEffect(() => {
        if (yData.some(item => !item)) return
        fetchTask().then(r => {})
    }, [yData]);
    return {
        xData,
        setXData,
        prevData
    }
}



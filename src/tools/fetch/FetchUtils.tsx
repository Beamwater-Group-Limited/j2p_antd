import { DataItem, ComesData} from "@/entity";
import { v4 as uuidv4 } from 'uuid'; // 使用 uuid 库生成唯一 ID
// 定义 GET 和 POST 请求的类型
export type CbtGetType = (queryParams?: URLSearchParams) =>  any ;
export type CbtPostType = (postData?: Record<string, any> ) => any;

// 通用 get 请求函数
const cbtGet = async (endpoint: string, queryParams?: URLSearchParams):Promise<ComesData> => {
    try {
        const url = new URL(`${window.da.apiUrl}${endpoint}`);
        if (queryParams && queryParams.toString()) {
            url.search = queryParams.toString();
        }
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`错误获取 ${endpoint}:`, error);
        throw error;
    }
};
// 通用 post 请求函数
const cbtPost = async (endpoint: string, comes?: DataItem[] ):Promise<ComesData> => {
    try {
        const url = new URL(`${window.da.apiUrl}${endpoint}`);
        const comeEntity:ComesData = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            respon_status:"",
            comes: comes && Object.keys(comes).length > 0 ? comes : null,
            context: {
                user: { name: "cbtai" },
                metadata: { ID: "7f9960e526b0" }
            }
        };
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(comeEntity),
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`错误获取 ${endpoint}:`, error);
    }
};
// 通用 post 请求函数 Model
const cbtModelPost = async (endpoint: string, comes?: DataItem[] ):Promise<ComesData> => {
    try {
        const url = new URL(`${window.da.modelUrl}${endpoint}`);
        const comeEntity:ComesData = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            respon_status:"",
            comes: comes && Object.keys(comes).length > 0 ? comes : null,
            context: {
                user: { name: "cbtai" },
                metadata: { ID: "7f9960e526b0" }
            }
        };
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(comeEntity),
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`错误获取 ${endpoint}:`, error);
    }
};

// 通用 获取外部文件内容
const loadConfig =  async (): Promise<Record<string, any>> => {
    try {
        const baseUrl = process.env.REACT_APP_BASE_PREFIX || "";
        const response = await fetch(`${baseUrl}/config/application.json`);
        if (!response.ok) {
            throw new Error(`加载配置失败，HTTP 状态: ${response.status}`);
        }
        const loadedConfig = await response.json();
        console.log("全局配置", loadedConfig)
        return loadedConfig;
    } catch (error) {
        console.error("加载配置出错：", error);
    }
}

export {cbtGet, cbtPost, loadConfig, cbtModelPost};

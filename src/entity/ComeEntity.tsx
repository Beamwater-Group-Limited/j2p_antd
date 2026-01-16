// 数据类型枚举 (DaType)
export enum DaType {
    TEXT = "text",              // 纯文本
    IMAGE = "image",            // 图像类型
    AUDIO = "audio",            // 音频类型
    VIDEO = "video",            // 视频类型
    APPLICATION = "application", // 文件类型
    FORM_DATA = "multipart/form-data" // 表单数据
}

// 数据格式枚举 (DaFormat)
export enum DaFormat {
    FSTRING = "fstring",        // 文本类型
    FURL = "furl",              // URL 类型
    FBASE64 = "fbase64",        // Base64 类型
    FPATH = "fpath"             // 路径类型
}
export interface DataItem {
    type?: DaType;               // 数据类型 (枚举限制)
    format?: DaFormat;           // 数据格式 (枚举限制)
    content: string | null;     // 数据内容，可以是字符串，也可以为空
}

export interface ComesData {
    id: string;
    timestamp: string;
    respon_status:string;
    comes: DataItem[];
    context: {
        user: { name: string };
        metadata: Record<string, any>;
    };
}

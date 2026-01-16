const  BasePath= process.env.REACT_APP_BASE_PREFIX || "";
export const BaseWebUrl =`${BasePath}`
export const BaseApiUrl =`${BasePath}${BasePath?'/api':''}`
export const BaseWsUrl =`${BasePath}${BasePath?'/ws':''}`

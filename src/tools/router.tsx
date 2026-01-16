import {matchPath} from "react-router-dom";

export const matchRoute = (routes: any[], parentPath: string = "", path: string) => {
    for (const route of routes) {
        // 完整路径
        const fullPath = route.path.startsWith("/") ? `${parentPath}/${route.path}`.replace(/\/+/g, "/") : `${parentPath}/${route.path}`.replace(/\/+/g, "/");
        const match = matchPath({path: fullPath, end: true}, path);
        if (match) return route;
        if (route.children?.length > 0) {
            const childMatch = matchRoute(route.children, fullPath, path);
            if (childMatch) return childMatch;
        }
    }
    return null;
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';
import reportWebVitals from "@/reportWebVitals";
import {Route, Routes, Link, BrowserRouter, Navigate} from "react-router-dom";
import RuntimeApp from "@/RuntimeApp";
import ComponentApp from "@/ComponenApp";
import PipelineApp from "@/PipelineApp";
import ProjectApp from "@/ProjectApp";
import {AppConfigProvider} from "@/context";
import DevApp from "@/DevApp";
import ComponentListApp from "@/ComponentListApp";
import CustomComponentApp from "@/CustomComponentApp";
import CustomPageApp from "@/CustomPageApp";
import ChartApp from "@/ChartApp";
import {ModelApp} from "@/ModelApp";
import {DashboardAppConfig} from "@/tools";
import ModelEditApp from "@/ModelEditApp";
import XApp from "@/XApp";
// 全局指定
declare global {
    interface Window {
        da: DashboardAppConfig
    }
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AppConfigProvider>
            <BrowserRouter basename={process.env.REACT_APP_BASE_PREFIX || ''}>
                {
                    (process.env.REACT_APP_RUNTIME === "1") ? (
                        <Routes>
                            <Route path="/runtime/*" element={<RuntimeApp/>}/>
                            <Route path="*" element={<Navigate replace to={`/runtime/*`}/>}/>
                        </Routes>
                    ) : (
                        <>
                            <nav>
                                <ul className="nav flex flex-row justify-center space-x-4">
                                    <li><Link to="/">我的项目</Link></li>
                                    <li><Link to="/component">组件</Link></li>
                                </ul>
                            </nav>
                            <Routes>
                                <Route path="/*" element={<ProjectApp/>}/>
                                <Route path="/runtime/*" element={<RuntimeApp/>}/>
                                <Route path="/component" element={<ComponentListApp/>}/>
                                <Route path="/component/:innerComponent/*" element={<ComponentApp/>}/>
                                <Route path="/custom_component/:componentType/*" element={<CustomComponentApp/>}/>
                                <Route path="/custom_page/:pageType/*" element={<CustomPageApp/>}/>
                                <Route path="/chart/:chartType/*" element={<ChartApp/>}/>
                                <Route path="/x/:xType/*" element={<XApp/>}/>
                                <Route path="/pipeline/*" element={<PipelineApp/>}/>
                                <Route path="/dev/*" element={<DevApp/>}/>
                                <Route path="/model/*" element={<ModelApp/>}/>
                                <Route path="/model/:modelTaskID" element={<ModelEditApp/>}/>
                            </Routes>
                        </>
                    )
                }
            </BrowserRouter>
        </AppConfigProvider>
    </React.StrictMode>
);

reportWebVitals(console.log);

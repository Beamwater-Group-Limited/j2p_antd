// Cbtaivideo
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useNode } from "@craftjs/core";
import { v4 } from "uuid";
import { Form, Select, Switch, Radio, Checkbox, Slider, Input, Typography, InputNumber, DatePicker, Button, message } from "antd";
import { VideoCameraOutlined, AudioOutlined, DesktopOutlined, RetweetOutlined, ExpandOutlined, CloseOutlined, SoundOutlined, AudioMutedOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EventService, parse_reference } from "@/tools";
import { useAppConfig, useWebSocket, useProject, usePagesData } from "@/context";
import { DoubleInput } from "@/ide";
import { useCraftJS, useWebrtc } from "@/hooks";
import * as CbtaiAntd from "antd";
import { createPortal } from "react-dom";

export const Cbtaivideo = ({
                               className, dataevent, children,
                               ref: refProp,
                               ref_temp,
                               autoPlay,
                               playsInline,
                               muted,
                               src,
                               controls,
                               isCall
                           }) => {
    const { appConfig } = useAppConfig();
    const { projectConfig } = useProject();
    const { id: nodeID, connectors: { connect, drag } } = useNode();
    const { deleteCurrentNodeChildren, craftJsonToJSX } = useCraftJS();
    const navigate = useNavigate();
    const workMode = projectConfig.mode;
    const ownerID = projectConfig.owner_id;
    const { pageData, nodeLocalState, setMainCompoID } = usePagesData();

    const { initVideo, handleReconnect, toggleCamera, toggleMic, toggleScreenShare, switchCamera } = useWebrtc(nodeID, isCall);

    const [isDirty, setIsDirty] = useState<boolean>(false);

    const [videoSource, setVideoSource] = useState<any>("");
    const changeVideoSource = (newStates: any) => { setIsDirty(true); setVideoSource(newStates); };

    const [srcState, setSrcState] = useState<any>("");
    const changeSrcState = (newStates: any) => { setIsDirty(true); setSrcState(newStates); };

    const [mutedState, setMutedState] = useState<any>(true);
    const changeMutedState = (newStates: any) => { setIsDirty(true); setMutedState(newStates); };

    const [volumeState, setVolumeState] = useState<number>(50);

    const videoElRef = useRef<HTMLVideoElement | null>(null);

    const [screenSharing, setScreenSharing] = useState(false);
    const [micEnabled, setMicEnabled] = useState(false);
    const [isRearCamera, setIsRearCamera] = useState<boolean>(true);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const inlineHostRef = useRef<HTMLDivElement | null>(null);
    const fullscreenHostRef = useRef<HTMLDivElement | null>(null);
    const videoWrapperRef = useRef<HTMLDivElement | null>(null);

    const [cbtState, setCbtState] = useState<Record<string, any>>({
        videoSource: "",
        srcState: "",
        mutedState: true,
    });

    const { ws, sendStateChange, restoreCbtState, sendEvent } = useWebSocket();

    useEffect(() => {
        const subscription = EventService.subscribe(nodeID, (data) => setCbtState(data));
        setMainCompoID(nodeID);
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!nodeLocalState || nodeLocalState.length === 0) return;
        const subscriptionLocal = EventService.subscribeLocal(nodeLocalState, (data) => setCbtState(data));
        return () => subscriptionLocal.unsubscribe();
    }, [nodeLocalState]);

    useEffect(() => {
        if (ws?.readyState === WebSocket.OPEN && pageData.nodesStated.includes(nodeID)) {
            restoreCbtState(nodeID, cbtState);
        }
    }, [ws?.readyState]);

    useEffect(() => {
        if (cbtState["videoSource"]) setVideoSource(JSON.parse(cbtState["videoSource"]));
        if (cbtState["srcState"]) setSrcState(JSON.parse(cbtState["srcState"]));
        if (cbtState["mutedState"]) setMutedState(JSON.parse(cbtState["mutedState"]));
    }, [cbtState]);

    useEffect(() => {
        if (isDirty) { sendStateChange(nodeID, "videoSource", videoSource); setIsDirty(false); }
    }, [videoSource]);

    useEffect(() => {
        if (isDirty) { sendStateChange(nodeID, "srcState", srcState); setIsDirty(false); }
    }, [srcState]);

    useEffect(() => {
        if (isDirty) { sendStateChange(nodeID, "mutedState", mutedState); setIsDirty(false); }
    }, [mutedState]);

    useEffect(() => { setMutedState(muted); }, [muted]);
    useEffect(() => { setSrcState(src); }, [src]);

    useEffect(() => {
        if (!videoElRef.current) return;
        videoElRef.current.volume = Math.max(0, Math.min(100, volumeState)) / 100;
    }, [volumeState]);

    useEffect(() => {
        if (!videoElRef.current) return;
        videoElRef.current.muted = !!mutedState;
    }, [mutedState]);

    const handleToggleMic = () => {
        setMicEnabled((v) => {
            const next = !v;
            toggleMic(next);
            message.info(`麦克风${next ? "已打开" : "已关闭"}`);
            return next;
        });
    };

    const handleToggleScreenShare = () => {
        setScreenSharing((v) => {
            const next = !v;
            toggleScreenShare(next);
            message.info(`屏幕分享${next ? "已开始" : "已停止"}`);
            return next;
        });
    };

    const handleSwitchCamera = () => {
        setIsRearCamera((v) => {
            const next = !v;
            message.info(`切换到${next ? "后置" : "前置"}摄像头`);
            return next;
        });
        switchCamera();
    };

    const handleToggleMutePlayback = () => {
        const next = !mutedState;
        changeMutedState(next);
        message.info(next ? "已静音" : "已开声");
        setVolumeState(next ? 0 : 50);
    };

    const openFullscreen = () => setIsFullscreen(true);
    const closeFullscreen = () => setIsFullscreen(false);

    useEffect(() => {
        if (!isFullscreen) return;
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") closeFullscreen(); };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isFullscreen]);

    useLayoutEffect(() => {
        const wrapper = videoWrapperRef.current;
        const inlineHost = inlineHostRef.current;
        const fullscreenHost = fullscreenHostRef.current;
        if (!wrapper || !inlineHost) return;

        if (isFullscreen) {
            if (fullscreenHost) fullscreenHost.appendChild(wrapper);
        } else {
            inlineHost.appendChild(wrapper);
        }
    }, [isFullscreen]);

    const hoverCss = `
    .cbtai-video-shell { position: relative; display: inline-block; width: 100%; }
    .cbtai-video-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity .2s ease-in-out;
      z-index: 10;
    }
    .cbtai-video-shell:hover .cbtai-video-overlay { opacity: 1; pointer-events: auto; }
    .cbtai-video-controls { position: absolute; bottom: 10px; right: 10px; display: flex; gap: 8px; z-index: 11; }

    .cbtai-audio-controls {
      position: absolute;
      bottom: 5px;
      left: 5px;
    
      display: inline-flex;
      align-items: center;
      gap: var(--audio-gap, 8px);
    
      z-index: 11;
    
      background: rgba(0,0,0,var(--audio-bg-alpha, 0.35));
      padding: var(--audio-pad-y, 8px) var(--audio-pad-x, 10px);
      border-radius: var(--audio-radius, 10px);
    
      min-width: var(--audio-minw, auto);
      height: var(--audio-h, auto);
    
      max-width: min(62vw, var(--audio-maxw, 420px));
      box-sizing: border-box;
    }
    .cbtai-audio-slider { width: var(--audio-slider-w, 100px); }

  `;

    const setVideoRef = (el: HTMLVideoElement | null) => {
        videoElRef.current = el;

        if (ref_temp) {
            if (typeof ref_temp === "function") ref_temp(el);
            else if (typeof ref_temp === "object") (ref_temp as any).current = el;
            return;
        }

        const parsed = parse_reference(initVideo, refProp);
        if (typeof parsed === "function") parsed(el);
        else if (parsed && typeof parsed === "object") (parsed as any).current = el;
    };

    const videoWrapper = (
        <div
            ref={(el) => { if (el) videoWrapperRef.current = el; }}
            style={{ position: "relative", width: "100%", height: isFullscreen ? "100%" : "auto" }}
        >
            <video
                className={className}
                data-event={dataevent}
                data-targetid={nodeID}
                ref={setVideoRef}
                autoPlay={autoPlay}
                playsInline={playsInline}
                muted={mutedState}
                src={srcState}
                controls={controls}
                style={{
                    width: "100%",
                    height: isFullscreen ? "100%" : "auto",
                    objectFit: isFullscreen ? "contain" : "initial",
                    background: "#000",
                }}
            />

            {!isFullscreen && (
                <div className="cbtai-video-overlay">
                    <Button type="primary" size="large" icon={<ExpandOutlined />} onClick={openFullscreen} style={{ fontSize: 16, padding: "12px 20px" }}>
                        放大
                    </Button>
                </div>
            )}

            {!isFullscreen && (
                <>
                    <div className="cbtai-video-controls">
                        <Button type="primary" shape="circle" icon={mutedState ? <AudioMutedOutlined /> : <AudioOutlined />} onClick={handleToggleMic} style={{ backgroundColor: micEnabled ? "#1890ff" : "#0050b3" }} />
                        <Button type="primary" shape="circle" icon={isRearCamera ? <VideoCameraOutlined /> : <RetweetOutlined />} onClick={handleSwitchCamera} style={{ backgroundColor: isRearCamera ? "#1890ff" : "#0050b3" }} />
                        <Button type="primary" shape="circle" icon={<DesktopOutlined />} onClick={handleToggleScreenShare} style={{ backgroundColor: screenSharing ? "#ff4d4f" : "#d9534f" }} />
                    </div>

                    <div className="cbtai-audio-controls" onClick={(e) => e.stopPropagation()}>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<SoundOutlined />}
                            onClick={handleToggleMutePlayback}
                            style={{ backgroundColor: mutedState ? "#0050b3" : "#1890ff" }}
                        />
                        <div className="cbtai-audio-slider">
                            <Slider
                                min={0}
                                max={100}
                                value={volumeState}
                                onChange={(v) => setVolumeState(typeof v === "number" ? v : (v as any)[0])}
                                tooltip={{ formatter: (v) => `${v}%` }}
                            />
                        </div>
                        <div style={{ width: 44, color: "#fff", fontWeight: 700, textAlign: "right" }}>{volumeState}%</div>
                    </div>
                </>
            )}
        </div>
    );

    const fullscreenPortal = isFullscreen
        ? createPortal(
            <div
                onClick={(e) => { if (e.target === e.currentTarget) closeFullscreen(); }}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.82)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                }}
            >
                <div
                    style={{
                        position: "relative",
                        width: "92vw",
                        height: "88vh",
                        background: "#000",
                        borderRadius: 12,
                        overflow: "hidden",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button onClick={closeFullscreen} icon={<CloseOutlined />} shape="circle" style={{ position: "absolute", top: 12, right: 12, zIndex: 10001 }} />
                    <div ref={fullscreenHostRef} style={{ width: "100%", height: "100%" }} />
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <style>{hoverCss}</style>

            <div
                className="cbtai-video-shell"
                ref={(el) => { if (el) connect(drag(el)); }}
                style={{ width: "100%" }}
            >
                <div ref={inlineHostRef} />
                {videoWrapper}
            </div>

            {fullscreenPortal}
        </>
    );
};

Cbtaivideo.isCanvas = false;

const CbtaivideoSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));
    return (
        <div>
            <Form labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                <Form.Item label="Children">
                    <Input value={props.children} onChange={(e) => setProp((props) => (props.children = e.target.value))} />
                </Form.Item>

                <Form.Item label="TailWindCss">
                    <Input value={props.className} onChange={(e) => setProp((props) => (props.className = e.target.value))} />
                </Form.Item>

                <Form.Item label="自动播放">
                    <Switch checked={props.autoPlay} onChange={(checked) => setProp((props) => (props.autoPlay = checked))} />
                </Form.Item>

                <Form.Item label="内联播放">
                    <Switch checked={props.playsInline} onChange={(checked) => setProp((props) => (props.playsInline = checked))} />
                </Form.Item>

                <Form.Item label="静音播放">
                    <Switch checked={props.muted} onChange={(checked) => setProp((props) => (props.muted = checked))} />
                </Form.Item>

                <Form.Item label="视频链接">
                    <Input value={props.src} onChange={(e) => setProp((props) => (props.src = e.target.value))} />
                </Form.Item>

                <Form.Item label="是否显示控件">
                    <Switch checked={props.controls} onChange={(checked) => setProp((props) => (props.controls = checked))} />
                </Form.Item>

                <Form.Item label="是否主动发起OFFER">
                    <Switch checked={props.isCall} onChange={(checked) => setProp((props) => (props.isCall = checked))} />
                </Form.Item>
            </Form>
        </div>
    );
};

Cbtaivideo.craft = {
    displayName: "Cbtaivideo",
    props: { disabled: false, isCall: false },
    related: { settings: CbtaivideoSettings },
};

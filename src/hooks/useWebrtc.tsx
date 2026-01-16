import { useEffect, useRef } from "react";
import { BaseWsUrl } from "@/tools";
import { useAppConfig, useProject } from "@/context";

type VideoSource = "camera" | "screen" | "none";
type FacingMode = "user" | "environment";

export function useWebrtc(nodeID: string, isCaller: boolean) {
    const { appConfig } = useAppConfig();
    const { projectConfig } = useProject();

    console.log("✅ 创建时收否主动发起offer", isCaller);

    const configuration: RTCConfiguration = {
        iceServers: [
            {
                urls: [
                    "turn:xxx.xxx.xxx.xxx:3478?transport=udp",
                    "turn:xxx.xxx.xxx.xxx:3478?transport=tcp",
                ],
                username: "webrtc",
                credential: "123456",
            },
            { urls: "stun:xxx.xxx.xxx.xxx:3478" },
        ],
        // iceTransportPolicy: "relay",
    };

    // signaling
    const socketRef = useRef<WebSocket | null>(null);
    const signalingSocketRef = useRef<WebSocket | null>(null);

    // reconnect
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectedRef = useRef<boolean>(false);

    // media refs
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteStreamRef = useRef<MediaStream>(new MediaStream());
    const localStreamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    // pc
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    // ICE cache
    const pendingIceRef = useRef<any[]>([]);
    const localTracksAddedRef = useRef(false);

    // sender
    const audioSenderRef = useRef<RTCRtpSender | null>(null);
    const videoSenderRef = useRef<RTCRtpSender | null>(null);

    // screen
    const screenStreamRef = useRef<MediaStream | null>(null);

    // video source
    const videoSourceRef = useRef<VideoSource>("none");

    // ✅ mobile camera facing
    const facingModeRef = useRef<FacingMode>("user");

    // ====== ICE restart 控制 ======
    const disconnectedTimerRef = useRef<number | null>(null);
    const restartingRef = useRef<boolean>(false);
    const lastRestartAtRef = useRef<number>(0);

    const DISCONNECTED_GRACE_MS = 8000;
    const RESTART_COOLDOWN_MS = 3000;

    const clearDisconnectedTimer = () => {
        if (disconnectedTimerRef.current) {
            window.clearTimeout(disconnectedTimerRef.current);
            disconnectedTimerRef.current = null;
        }
    };

    const sendSignal = (type: string, data: any) => {
        signalingSocketRef.current?.send(JSON.stringify({ type, data }));
    };

    // 更稳的 play：避免 ontrack + srcObject 变动导致 AbortError 泛滥
    const playSeqRef = useRef(0);
    const safePlayRemote = () => {
        const v = remoteVideoRef.current;
        if (!v) return;

        v.muted = false;
        v.autoplay = true;
        v.playsInline = true;

        const seq = ++playSeqRef.current;
        setTimeout(() => {
            if (seq !== playSeqRef.current) return;
            const p = v.play?.();
            if (p && typeof (p as any).catch === "function") {
                (p as any).catch((e: any) => {
                    if (String(e?.name) === "AbortError") return;
                    console.warn("❌ remote video play() failed:", e);
                });
            }
        }, 80);
    };

    const attachRemote = () => {
        const v = remoteVideoRef.current;
        if (!v) return;
        const s = remoteStreamRef.current;
        if (v.srcObject !== s) v.srcObject = s;
        safePlayRemote();
    };

    const initVideo = () => {
        if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
            connectWebSocket();
        }
        attachRemote();
        return remoteVideoRef;
    };

    // ===== local media =====
    const startLocalStream = async () => {
        if (localStreamRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingModeRef.current }, // ✅ mobile front/back
                audio: true,
            });
            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;
                localVideoRef.current.autoplay = true;
                localVideoRef.current.playsInline = true;
                localVideoRef.current.play?.().catch(() => {});
            }

            // 默认：视频开，麦克风关
            stream.getAudioTracks().forEach((t) => (t.enabled = false));
            stream.getVideoTracks().forEach((t) => (t.enabled = true));
            videoSourceRef.current = stream.getVideoTracks().length > 0 ? "camera" : "none";

            console.log("🎥 本地视频流设置成功", {
                audio: stream.getAudioTracks().length,
                video: stream.getVideoTracks().length,
                facingMode: facingModeRef.current,
            });
        } catch (err) {
            console.error("❌ 获取视频失败", err);
        }
    };

    // ===== 新增：ICE restart（只有 caller 才能主动发 iceRestart offer）=====
    const requestIceRestart = async (reason: string) => {
        const now = Date.now();
        if (!isCaller) return;
        if (restartingRef.current) return;
        if (now - lastRestartAtRef.current < RESTART_COOLDOWN_MS) return;

        const ws = signalingSocketRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const pc = peerConnectionRef.current;
        if (!pc) return;

        restartingRef.current = true;
        lastRestartAtRef.current = now;

        try {
            console.warn("🧊 ICE RESTART begin:", reason);

            try {
                pc.restartIce();
            } catch {}

            const offer = await pc.createOffer({ iceRestart: true });
            await pc.setLocalDescription(offer);
            sendSignal("OFFER", pc.localDescription);

            console.warn("🧊 ICE RESTART offer sent");
        } catch (e) {
            console.error("❌ ICE restart failed:", e);
        } finally {
            setTimeout(() => {
                restartingRef.current = false;
            }, 800);
        }
    };

    // ===== PC =====
    const ensurePeerConnection = () => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        console.log("✅ 创建 PeerConnection", configuration);
        const pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;

        pc.ontrack = (event) => {
            const stream = remoteStreamRef.current || new MediaStream();
            remoteStreamRef.current = stream;

            const kind = event.track.kind;

            // ✅ 只 remove，不 stop 远端轨道
            if (kind === "video") {
                stream.getVideoTracks().forEach((t) => {
                    if (t.id !== event.track.id) {
                        try {
                            stream.removeTrack(t);
                        } catch {}
                    }
                });
                if (!stream.getTracks().some((t) => t.id === event.track.id)) {
                    stream.addTrack(event.track);
                }
            } else if (kind === "audio") {
                stream.getAudioTracks().forEach((t) => {
                    if (t.id !== event.track.id) {
                        try {
                            stream.removeTrack(t);
                        } catch {}
                    }
                });
                if (!stream.getTracks().some((t) => t.id === event.track.id)) {
                    stream.addTrack(event.track);
                }
            } else {
                return;
            }

            attachRemote();

            console.log("✅ ontrack 收到轨道", kind, {
                videoTracks: stream.getVideoTracks().length,
                audioTracks: stream.getAudioTracks().length,
                videoReady: stream.getVideoTracks()[0]?.readyState,
                audioReady: stream.getAudioTracks()[0]?.readyState,
            });
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal("ICE_CANDIDATE", event.candidate);
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log("ICE连接状态改变", pc.iceConnectionState);

            if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
                clearDisconnectedTimer();
                return;
            }

            if (pc.iceConnectionState === "disconnected") {
                clearDisconnectedTimer();
                disconnectedTimerRef.current = window.setTimeout(() => {
                    if (peerConnectionRef.current?.iceConnectionState === "disconnected") {
                        requestIceRestart("ice disconnected too long");
                    }
                }, DISCONNECTED_GRACE_MS);
                return;
            }

            if (pc.iceConnectionState === "failed") {
                clearDisconnectedTimer();
                requestIceRestart("ice failed");
                return;
            }

            if (pc.iceConnectionState === "closed") {
                clearDisconnectedTimer();
                clearConnection();
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("📶 连接状态:", pc.connectionState);
            if (pc.connectionState === "failed") {
                requestIceRestart("pc connectionState failed");
            }
        };

        pc.onsignalingstatechange = () => console.log("📶 信令状态:", pc.signalingState);
        pc.onicegatheringstatechange = () => console.log("📶 ICE搜集状态:", pc.iceGatheringState);

        pc.onnegotiationneeded = () => {
            console.log("onnegotiationneeded ignored (fixed caller/callee)");
        };

        return pc;
    };

    const addLocalTracksOnce = () => {
        const pc = peerConnectionRef.current;
        const stream = localStreamRef.current;
        if (!pc || !stream) return;
        if (localTracksAddedRef.current) return;

        const audioTrack = stream.getAudioTracks()[0] || null;
        const videoTrack = stream.getVideoTracks()[0] || null;

        if (audioTrack) audioSenderRef.current = pc.addTrack(audioTrack, stream);
        if (videoTrack) videoSenderRef.current = pc.addTrack(videoTrack, stream);

        localTracksAddedRef.current = true;

        console.log("✅ 已 addTrack 本地 audio+video", {
            audio: !!audioTrack,
            video: !!videoTrack,
        });
    };

    // ===== ✅ mobile: replace local video track helper =====
    const replaceLocalVideoTrack = async (newTrack: MediaStreamTrack | null) => {
        await startLocalStream();
        ensurePeerConnection();
        addLocalTracksOnce();

        const pc = peerConnectionRef.current;
        if (!pc) return;

        if (!videoSenderRef.current) {
            const tx = pc.addTransceiver("video", { direction: "sendrecv" });
            videoSenderRef.current = tx.sender;
        }

        if (videoSenderRef.current) {
            await videoSenderRef.current.replaceTrack(newTrack);
        }

        const local = localStreamRef.current;
        if (local) {
            local.getVideoTracks().forEach((t) => {
                try {
                    local.removeTrack(t);
                } catch {}
                try {
                    t.stop();
                } catch {}
            });

            if (newTrack) {
                try {
                    local.addTrack(newTrack);
                } catch {}
            }
        }

        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
            localVideoRef.current.muted = true;
            localVideoRef.current.autoplay = true;
            localVideoRef.current.playsInline = true;
            localVideoRef.current.play?.().catch(() => {});
        }
    };

    // ===== ✅ mobile: set / switch camera =====
    const setCameraFacing = async (mode: FacingMode) => {
        if (videoSourceRef.current === "screen") {
            console.warn("setCameraFacing ignored: currently screen sharing");
            return;
        }

        facingModeRef.current = mode;

        const enabledNow = localStreamRef.current?.getVideoTracks()[0]?.enabled ?? true;

        // 优先 exact，不行 fallback
        try {
            const camStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: mode } as any },
                audio: false,
            });

            const newTrack = camStream.getVideoTracks()[0] || null;
            if (!newTrack) return;

            newTrack.enabled = enabledNow;
            await replaceLocalVideoTrack(newTrack);

            videoSourceRef.current = newTrack.enabled ? "camera" : "none";

            camStream.getTracks().forEach((t) => {
                if (t.id !== newTrack.id) {
                    try {
                        t.stop();
                    } catch {}
                }
            });

            console.log("✅ camera switched:", mode);
        } catch (e) {
            try {
                const camStream2 = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: mode },
                    audio: false,
                });

                const newTrack2 = camStream2.getVideoTracks()[0] || null;
                if (!newTrack2) return;

                newTrack2.enabled = enabledNow;
                await replaceLocalVideoTrack(newTrack2);

                videoSourceRef.current = newTrack2.enabled ? "camera" : "none";

                camStream2.getTracks().forEach((t) => {
                    if (t.id !== newTrack2.id) {
                        try {
                            t.stop();
                        } catch {}
                    }
                });

                console.log("✅ camera switched(fallback):", mode);
            } catch (e2) {
                console.error("❌ switch camera failed:", e2);
            }
        }
    };

    const switchCamera = async () => {
        const next: FacingMode = facingModeRef.current === "user" ? "environment" : "user";
        await setCameraFacing(next);
    };

    // ===== controls =====
    const toggleMic = async (enabled?: boolean) => {
        await startLocalStream();
        const stream = localStreamRef.current;
        if (!stream) return;
        const a = stream.getAudioTracks()[0];
        if (!a) return;
        a.enabled = enabled ?? !a.enabled;
        console.log("🎤 toggleMic =>", a.enabled);
    };

    const toggleCamera = async (enabled?: boolean) => {
        await startLocalStream();
        const stream = localStreamRef.current;
        if (!stream) return;
        const v = stream.getVideoTracks()[0];
        if (!v) return;

        v.enabled = enabled ?? !v.enabled;
        console.log("📷 toggleCamera =>", v.enabled, "currentSource=", videoSourceRef.current);

        if (videoSourceRef.current !== "screen") {
            if (!v.enabled) {
                if (videoSenderRef.current) {
                    await videoSenderRef.current.replaceTrack(null);
                    videoSourceRef.current = "none";
                }
            } else {
                if (videoSenderRef.current) {
                    await videoSenderRef.current.replaceTrack(v);
                    videoSourceRef.current = "camera";
                }
            }
        }
    };

    const toggleScreenShare = async (enabled?: boolean) => {
        const wantOn = enabled ?? videoSourceRef.current !== "screen";

        await startLocalStream();
        ensurePeerConnection();
        addLocalTracksOnce();

        const pc = peerConnectionRef.current;
        if (!pc) return;

        if (!videoSenderRef.current) {
            const tx = pc.addTransceiver("video", { direction: "sendrecv" });
            videoSenderRef.current = tx.sender;
        }
        if (!videoSenderRef.current) return;

        if (wantOn) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false,
                });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];
                if (!screenTrack) return;

                await videoSenderRef.current.replaceTrack(screenTrack);
                videoSourceRef.current = "screen";

                screenTrack.onended = async () => {
                    await toggleScreenShare(false);
                };
            } catch (e) {
                console.error("❌ getDisplayMedia failed:", e);
            }
            return;
        }

        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => {
                try {
                    t.stop();
                } catch {}
            });
            screenStreamRef.current = null;
        }

        const camTrack = localStreamRef.current?.getVideoTracks()[0] || null;
        if (camTrack && camTrack.enabled) {
            await videoSenderRef.current.replaceTrack(camTrack);
            videoSourceRef.current = "camera";
        } else {
            await videoSenderRef.current.replaceTrack(null);
            videoSourceRef.current = "none";
        }
    };

    // ===== SDP =====
    const startCaller = async () => {
        await startLocalStream();
        ensurePeerConnection();
        addLocalTracksOnce();

        const camTrack = localStreamRef.current?.getVideoTracks?.()[0] || null;
        if (videoSenderRef.current && camTrack && videoSourceRef.current !== "screen") {
            await videoSenderRef.current.replaceTrack(camTrack);
            videoSourceRef.current = camTrack.enabled ? "camera" : "none";
        }

        const pc = peerConnectionRef.current!;
        console.log("🟢 Caller 创建 OFFER 并发送");

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal("OFFER", pc.localDescription);
    };

    const handleOffer = async (msg: any) => {
        const offer = msg?.data;
        if (!offer) return;

        await startLocalStream();
        ensurePeerConnection();

        const pc = peerConnectionRef.current!;

        if (pc.signalingState === "have-local-offer") {
            try {
                pc.close();
            } catch {}
            peerConnectionRef.current = null;
            localTracksAddedRef.current = false;
            audioSenderRef.current = null;
            videoSenderRef.current = null;
            ensurePeerConnection();
        }

        const pc2 = peerConnectionRef.current!;
        await pc2.setRemoteDescription(new RTCSessionDescription(offer));

        addLocalTracksOnce();

        const answer = await pc2.createAnswer();
        await pc2.setLocalDescription(answer);
        sendSignal("ANSWER", pc2.localDescription);

        await flushPendingIce();
    };

    const handleAnswer = async (msg: any) => {
        const answer = msg?.data;
        if (!answer) return;

        const pc = peerConnectionRef.current;
        if (!pc) return;
        if (!isCaller) return;

        if (pc.signalingState !== "have-local-offer") {
            console.warn("handleAnswer: 当前状态不是 have-local-offer，忽略。state=", pc.signalingState);
            return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushPendingIce();
    };

    // ===== ICE =====
    const handleICECandidate = async (candidate: any) => {
        const pc = peerConnectionRef.current;
        if (!pc || !candidate) return;

        if (!pc.remoteDescription) {
            pendingIceRef.current.push(candidate);
            return;
        }

        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error("❌ 添加 ICE 候选失败:", err);
        }
    };

    const flushPendingIce = async () => {
        const pc = peerConnectionRef.current;
        if (!pc || !pc.remoteDescription) return;

        while (pendingIceRef.current.length) {
            const c = pendingIceRef.current.shift();
            try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {
                console.warn("flush ICE failed:", e);
            }
        }
    };

    // ===== websocket =====
    const connectWebSocket = () => {
        console.log("启动连接到信令服务器", socketRef.current);

        if (socketRef.current) socketRef.current.close();

        const wsUrl =
            `wss://${appConfig.GLOBAL_IP}${BaseWsUrl}/v1/webrtc?role=browser` +
            `&user_id=${appConfig.userID}&project_id=${projectConfig.project_id}` +
            `&client_id=${appConfig.clientID}&component_id=${nodeID}`;

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        signalingSocketRef.current = socket;

        socket.onopen = () => {
            console.log("✅ 信令服务器连接成功", wsUrl, "isCaller=", isCaller);
            isConnectedRef.current = true;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            if (isCaller) {
                startCaller().catch(console.warn);
            } else {
                ensurePeerConnection();
                console.log("🟡 Callee 已就绪，等待 OFFER");
            }
        };

        socket.onmessage = async (message) => {
            const msg = JSON.parse(message.data);
            const type = String(msg?.type || "").toUpperCase();

            console.log("收到消息内容", type, msg);

            switch (type) {
                case "OFFER":
                    await handleOffer(msg);
                    break;
                case "ANSWER":
                    await handleAnswer(msg);
                    break;
                case "ICE_CANDIDATE":
                    await handleICECandidate(msg?.data);
                    break;
                case "ERROR":
                case "ERROR ":
                case "ERR":
                case "error": {
                    const reason = msg?.reason || msg?.data?.reason || "unknown";
                    console.warn("⚠️ signaling error:", reason);

                    if (isCaller) {
                        requestIceRestart("signaling error: " + reason);
                    } else {
                        // callee：等新 offer（或触发重连）
                    }
                    break;
                }
                default:
                    console.warn("⚠️ 未知信令类型:", msg?.type);
            }
        };

        socket.onerror = (err) => console.error("❌ WebSocket 错误:", err);

        socket.onclose = () => {
            console.log("WebSocket已关闭，准备重连");
            isConnectedRef.current = false;

            try {
                clearConnection({ stopLocal: false, closeSocket: false } as any);
            } catch {}

            if (!reconnectTimeoutRef.current) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (!isConnectedRef.current) connectWebSocket();
                }, 2000);
            }
        };
    };

    // ===== cleanup =====
    const clearConnection = (opt?: { stopLocal?: boolean; closeSocket?: boolean }) => {
        const stopLocal = opt?.stopLocal ?? true;
        const closeSocket = opt?.closeSocket ?? true;

        clearDisconnectedTimer();

        const pc = peerConnectionRef.current;

        if (pc) {
            pc.ontrack = null;
            pc.onicecandidate = null;
            pc.oniceconnectionstatechange = null;
            pc.onconnectionstatechange = null;
            pc.onsignalingstatechange = null;
            pc.onicegatheringstatechange = null;
            pc.onnegotiationneeded = null;
        }

        if (remoteVideoRef.current) {
            try {
                remoteVideoRef.current.pause();
            } catch {}
            try {
                remoteVideoRef.current.srcObject = null;
            } catch {}
        }

        remoteStreamRef.current = new MediaStream();

        if (pc) {
            try {
                pc.close();
            } catch {}
            peerConnectionRef.current = null;
        }

        if (stopLocal && localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => {
                try {
                    t.stop();
                } catch {}
            });
            localStreamRef.current = null;
        }

        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => {
                try {
                    t.stop();
                } catch {}
            });
            screenStreamRef.current = null;
        }

        pendingIceRef.current = [];
        localTracksAddedRef.current = false;

        audioSenderRef.current = null;
        videoSenderRef.current = null;
        videoSourceRef.current = "none";

        playSeqRef.current++;

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (closeSocket && signalingSocketRef.current) {
            try {
                signalingSocketRef.current.close();
            } catch {}
            signalingSocketRef.current = null;
        }
    };

    const handleReconnect = async () => {
        console.log("🔁 手动重连：先清理再重连");
        clearConnection();
        setTimeout(() => connectWebSocket(), 200);
    };

    useEffect(() => {
        connectWebSocket();

        const timer = setInterval(() => {
            const pc = peerConnectionRef.current;
            console.log("📺 状态", {
                isCaller,
                ws: socketRef.current?.readyState,
                pcSignaling: pc?.signalingState,
                pcConn: pc?.connectionState,
                pcIce: pc?.iceConnectionState,
                pendingIce: pendingIceRef.current.length,
                remoteVideoReady: remoteVideoRef.current?.readyState,
                remoteVideoSize: `${remoteVideoRef.current?.videoWidth}x${remoteVideoRef.current?.videoHeight}`,
                videoSource: videoSourceRef.current,
                facingMode: facingModeRef.current,
                localA: localStreamRef.current?.getAudioTracks()[0]?.enabled,
                localV: localStreamRef.current?.getVideoTracks()[0]?.enabled,
                hasVideoSender: !!videoSenderRef.current,
            });
        }, 30000);

        const onOnline = () => requestIceRestart("window online");
        window.addEventListener("online", onOnline);

        return () => {
            window.removeEventListener("online", onOnline);
            clearInterval(timer);
            clearConnection();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        configuration,
        initVideo,
        remoteVideoRef,
        remoteStreamRef,

        peerConnectionRef,
        signalingSocketRef,
        reconnectTimeoutRef,
        socketRef,
        isConnectedRef,
        sendSignal,

        localVideoRef,
        localStreamRef,
        startLocalStream,

        ensurePeerConnection,
        connectWebSocket,
        clearConnection,
        handleReconnect,

        toggleCamera,
        toggleMic,
        toggleScreenShare,

        // ✅ mobile camera switch
        setCameraFacing,
        switchCamera,

        requestIceRestart,

        isCaller,
    };
}

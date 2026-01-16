const { message } = CbtaiAntd;
// 1️⃣ 点击后立刻禁用
setCbtState(prev => ({
    ...prev,
    disableState: true,
}));
console.log("cbtState",cbtState);
sendStateChange('PBZ5k-A3h1', 'disableState', true);
// 2️⃣ loading 提示（手动关闭）
const hide = message.loading("正在拉起微信登录，请稍候…", 0);
const startTime = Date.now();
const intervalMs = 500;
const timeoutMs = 5000;
const timer = setInterval(() => {
    let redirect = cbtState["buttonValueState"];
    console.log("redirect origin =", redirect);
    redirect = redirect == null ? "" : String(redirect).trim();

// ✅ 去掉首尾的双引号/单引号（关键！）
    redirect = redirect.replace(/^"+|"+$/g, "");
    redirect = redirect.replace(/^'+|'+$/g, "");

// ✅ 有些值会是 %22https...%22，先 decode 再去一次
    try { redirect = decodeURIComponent(redirect); } catch (e) {}
    redirect = redirect.replace(/^"+|"+$/g, "");
    redirect = redirect.replace(/^'+|'+$/g, "");

    console.log("redirect cleaned =", redirect);

    if (/^https?:\/\//i.test(redirect)) {
        window.location.assign(redirect);
    } else {
        console.log("[redirect invalid]", redirect);
    }


    //const redirect = "https://open.weixin.qq.com/connect/qrconnect?appid=wx1231319173455d3f&redirect_uri=https%3A%2F%2Fwww.cbtai.com%2Fminiback%2Fv1%2Fwx%2Fcallback&response_type=code&scope=snsapi_login&state=aB9s7X2kP5gH1jD6fR3tG8zN4mQ0wE&lang=cn#wechat_redirect";
    console.log("当前重定向路由:", redirect);
    // ✅ 拿到跳转地址，立刻真实跳转
    if (redirect && String(redirect).trim() !== "") {
        clearInterval(timer);
        try { hide && hide(); } catch (e) {}
        // ⚠️ 真实跳转（后端 302 会自动跟）
        window.location.href = redirect;
        return;
    }
    // ❌ 超时失败
    if (Date.now() - startTime >= timeoutMs) {
        clearInterval(timer);
        try { hide && hide(); } catch (e) {}
        message.error("拉起微信登录失败，请稍后重试", 2);
        // 3️⃣ 失败才恢复按钮
        console.log("cbtState",cbtState);
    }
}, intervalMs);



try {
    alert("CLICK OK"); // ✅ 最硬的证明
    console.log("[EventService]", EventService);

    const hasOn = EventService && typeof EventService.on === "function";
    const hasSubscribe = EventService && typeof EventService.subscribe === "function";
    const hasListen = EventService && typeof EventService.listen === "function";
    const hasSubject = EventService && (EventService.subject || EventService.bus || EventService.event$);

    console.log("[EventService capability]", { hasOn, hasSubscribe, hasListen, hasSubject });

} catch (e) {
    console.log("[EventService capability]", e);
}


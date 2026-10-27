(() => {
  "use strict";

  const canvas = document.getElementById("particleCanvas");
  const ctx = canvas.getContext("2d");
  const playground = document.getElementById("playground");
  const video = document.getElementById("cameraVideo");
  const preview = document.getElementById("cameraPreview");
  const previewWrap = document.getElementById("cameraPreviewWrap");
  const cameraButton = document.getElementById("cameraButton");
  const resetButton = document.getElementById("resetButton");
  const burstButton = document.getElementById("burstButton");
  const gestureStatus = document.getElementById("gestureStatus");
  const modePill = document.getElementById("modePill");
  const toast = document.getElementById("toast");
  const hint = document.getElementById("playgroundHint");

  const colors = ["#71f6ed", "#9a7cff", "#ff83bd", "#c6d3ff", "#fff0b7"];
  const state = { width: 0, height: 0, particles: [], pointer: { x: 0, y: 0, active: false },
    target: { x: 0, y: 0 }, mode: "mouse", gesture: "等待动作", pinch: false,
    camera: null, hands: null, lastToast: 0, burst: 0, frame: 0 };
  const random = (min, max) => Math.random() * (max - min) + min;

  function makeParticle() {
    return { x: random(0, state.width), y: random(0, state.height),
      vx: random(-.35, .35), vy: random(-.35, .35), size: random(.7, 2.5),
      alpha: random(.25, .9), color: colors[Math.floor(Math.random() * colors.length)],
      phase: random(0, Math.PI * 2), orbit: random(15, 130), speed: random(.002, .009) };
  }
  function resize() {
    const rect = playground.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = rect.width; state.height = rect.height;
    canvas.width = Math.floor(rect.width * dpr); canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!state.particles.length) state.particles = Array.from({ length: Math.min(260, Math.max(110, Math.floor(rect.width / 3)) ) }, makeParticle);
    state.particles.forEach(p => { p.x = Math.min(p.x, state.width); p.y = Math.min(p.y, state.height); });
  }
  function showToast(message) {
    toast.textContent = message; toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function setGesture(name) {
    if (state.gesture === name) return;
    state.gesture = name; gestureStatus.textContent = name;
  }
  function resetParticles() {
    state.particles = Array.from({ length: Math.min(260, Math.max(110, Math.floor(state.width / 3)) ) }, makeParticle);
    state.burst = 0; showToast("粒子宇宙已重置");
  }
  function burst() {
    state.burst = 1;
    state.particles.forEach(p => {
      const dx = p.x - state.width / 2, dy = p.y - state.height / 2;
      const length = Math.sqrt(dx * dx + dy * dy) || 1;
      p.vx += dx / length * random(2, 6); p.vy += dy / length * random(2, 6);
    });
    showToast("星尘爆发 ✦");
  }
  function draw() {
    state.frame++;
    ctx.clearRect(0, 0, state.width, state.height);
    const cx = state.pointer.active ? state.pointer.x : state.width * .5;
    const cy = state.pointer.active ? state.pointer.y : state.height * .48;
    const focus = state.pinch ? .18 : 1;
    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];
      const dx = cx - p.x, dy = cy - p.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const influence = Math.max(0, 1 - dist / (state.pinch ? 260 : 180));
      const angle = Math.atan2(dy, dx);
      if (state.mode === "camera" && state.pointer.active) {
        if (state.pinch) { p.vx += dx / dist * influence * .14; p.vy += dy / dist * influence * .14; }
        else { p.vx -= dx / dist * influence * .09; p.vy -= dy / dist * influence * .09; }
      } else if (state.pointer.active) {
        p.vx += Math.cos(angle + Math.PI / 2) * influence * .025;
        p.vy += Math.sin(angle + Math.PI / 2) * influence * .025;
      }
      if (state.burst < .02) {
        const ox = p.x - state.width / 2, oy = p.y - state.height / 2;
        const targetRadius = state.pinch ? 35 + p.orbit * .2 : 80 + p.orbit;
        const currentRadius = Math.sqrt(ox * ox + oy * oy);
        if (!state.pointer.active && Math.abs(currentRadius - targetRadius) > 10) {
          p.vx += (-ox / (currentRadius || 1)) * (currentRadius - targetRadius) * .00012;
          p.vy += (-oy / (currentRadius || 1)) * (currentRadius - targetRadius) * .00012;
        }
      }
      p.vx *= .986; p.vy *= .986;
      p.x += p.vx; p.y += p.vy;
      if (p.x < -8) p.x = state.width + 8; if (p.x > state.width + 8) p.x = -8;
      if (p.y < -8) p.y = state.height + 8; if (p.y > state.height + 8) p.y = -8;
      const twinkle = .65 + Math.sin(state.frame * p.speed + p.phase) * .35;
      ctx.globalAlpha = p.alpha * twinkle;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (state.pinch && influence > 0 ? 1.6 : 1), 0, Math.PI * 2); ctx.fill();
      if (state.pointer.active && dist < 100) {
        ctx.globalAlpha = (1 - dist / 100) * .23;
        ctx.strokeStyle = p.color; ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(cx, cy); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    state.burst *= .94;
    requestAnimationFrame(draw);
  }

  playground.addEventListener("pointermove", e => {
    if (state.mode === "camera") return;
    const rect = playground.getBoundingClientRect();
    state.pointer.x = e.clientX - rect.left; state.pointer.y = e.clientY - rect.top;
    state.pointer.active = true;
    if (hint) hint.style.opacity = ".35";
  });
  playground.addEventListener("pointerleave", () => { if (state.mode !== "camera") state.pointer.active = false; });
  resetButton.addEventListener("click", resetParticles);
  burstButton.addEventListener("click", burst);
  [document.getElementById("navLaunch"), document.getElementById("heroLaunch"), document.getElementById("howLaunch")].forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById("experience").scrollIntoView({ behavior: "smooth", block: "start" });
      if (button.id !== "navLaunch") showToast("欢迎进入手势宇宙：先试试移动鼠标");
    });
  });

  function fingerUp(landmarks, tip, pip) { return landmarks[tip].y < landmarks[pip].y; }
  function onHandResults(results) {
    const hands = results.multiHandLandmarks;
    if (!hands || !hands.length) {
      setGesture("未检测到手部");
      state.pointer.active = false;
      return;
    }
    const hand = hands[0];
    const thumbTip = hand[4], indexTip = hand[8];
    const pinchDistance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
    const extended = [
      fingerUp(hand, 8, 6), fingerUp(hand, 12, 10),
      fingerUp(hand, 16, 14), fingerUp(hand, 20, 18)
    ].filter(Boolean).length;
    const rect = playground.getBoundingClientRect();
    state.pointer.x = (1 - (thumbTip.x + indexTip.x) / 2) * rect.width;
    state.pointer.y = ((thumbTip.y + indexTip.y) / 2) * rect.height;
    state.pointer.active = true;
    state.pinch = pinchDistance < .075;
    if (state.pinch) setGesture("捏合 · 聚焦粒子");
    else if (extended >= 3) setGesture("张开手掌 · 扩展宇宙");
    else setGesture("移动手掌 · 探索星尘");
    if (hint) hint.style.opacity = ".12";
  }
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast("当前浏览器不支持摄像头，请使用最新版 Chrome 或 Edge"); return;
    }
    if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      showToast("摄像头需要 HTTPS 或 localhost，请通过 Live Server 运行"); return;
    }
    if (typeof Hands === "undefined" || typeof Camera === "undefined") {
      showToast("手势识别库未加载，请检查网络后刷新页面"); return;
    }
    cameraButton.disabled = true; cameraButton.innerHTML = "<span>◌</span> 正在启动…";
    try {
      state.hands = new Hands({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
      state.hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: .6, minTrackingConfidence: .55 });
      state.hands.onResults(onHandResults);
      state.camera = new Camera(video, { onFrame: async () => { if (state.hands) await state.hands.send({ image: video }); }, width: 640, height: 480 });
      await state.camera.start();
      preview.srcObject = video.srcObject;
      await preview.play().catch(() => {});
      previewWrap.hidden = false;
      state.mode = "camera";
      modePill.textContent = "CAMERA MODE";
      cameraButton.innerHTML = "<span>◉</span> 关闭摄像头";
      cameraButton.classList.add("active");
      showToast("摄像头已开启：试试张开手掌或捏合手指");
      setGesture("等待手势");
    } catch (error) {
      console.error(error);
      showToast(error && error.name === "NotAllowedError" ? "你拒绝了摄像头权限，可在浏览器地址栏重新允许" : "摄像头启动失败，请检查摄像头是否被其他应用占用");
      if (state.hands) { state.hands.close(); state.hands = null; }
      state.camera = null;
    } finally {
      cameraButton.disabled = false;
      if (state.mode !== "camera") cameraButton.innerHTML = "<span>◎</span> 开启摄像头";
    }
  }
  async function stopCamera() {
    if (state.camera && state.camera.stop) state.camera.stop();
    if (video.srcObject) video.srcObject.getTracks().forEach(track => track.stop());
    if (state.hands) { await state.hands.close(); state.hands = null; }
    state.camera = null; state.mode = "mouse"; state.pinch = false; state.pointer.active = false;
    previewWrap.hidden = true; preview.srcObject = null;
    modePill.textContent = "MOUSE MODE";
    cameraButton.classList.remove("active");
    cameraButton.innerHTML = "<span>◎</span> 开启摄像头";
    setGesture("等待动作");
    showToast("已关闭摄像头，继续使用鼠标互动");
  }
  cameraButton.addEventListener("click", () => state.mode === "camera" ? stopCamera() : startCamera());
  window.addEventListener("resize", resize);
  resize();
  draw();
})();
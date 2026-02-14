/* ========= 9 planetas ========= */
const PLANETS = [
  { name: "Mercurio", img: "photos/1.jpg", msg: "Feliz Viernes 13 y Feliz San Valentin Mi hermosa Niña 💗", r: 105, size: 52, dur: 10 },
  { name: "Venus",    img: "photos/2.jpg", msg: "Todas las hermosas canciones me recuerdan a ti y lo perfecta que eres ⭐", r: 150, size: 60, dur: 13 },
  { name: "Tierra",   img: "photos/3.jpg", msg: "Cuando me vaya mejor veras que voy a cumplir todaaaass las cositas que tu quieres mi vida 💗",  r: 200, size: 70, dur: 16 },
  { name: "Marte",    img: "photos/4.jpg", msg: "Te dare mi futuro, tambien mi corazon, mi cuerpo y todo mi ser, estaremos juntos para siempre de verdad... TE AMO NICO💗 debes entender la jujutsu kaisen vibra oki", r: 255, size: 62, dur: 20 },
  { name: "Júpiter",  img: "photos/5.jpg", msg: "Nayeon y Yo estamos muy orgullos de ti mi nico hermosa💗", r: 315, size: 82, dur: 25 },
];

/* ========= DOM ========= */
const orbits = document.getElementById("orbits");

const backdrop = document.getElementById("backdrop");
const closeBtn = document.getElementById("close");
const modalTitle = document.getElementById("modalTitle");
const modalMsg = document.getElementById("modalMsg");
const modalPhoto = document.getElementById("modalPhoto");

const bgm = document.getElementById("bgm");
const sunBtn = document.getElementById("sunBtn");
const heartsLayer = document.getElementById("hearts");

/* ========= Estado ========= */
let musicOn = false;
let heartTimer = null;

/* ========= Orbitas / Planetas ========= */
function createOrbit(p, idx) {
  const orbit = document.createElement("div");
  orbit.className = "orbit spin";
  orbit.style.width = `${p.r * 2}px`;
  orbit.style.height = `${p.r * 2}px`;
  orbit.style.marginLeft = `${-p.r}px`;
  orbit.style.marginTop = `${-p.r}px`;
  orbit.style.animationDuration = `${p.dur}s`;
  orbit.style.animationDelay = `${-(idx * 0.6)}s`;

  const wrap = document.createElement("div");
  wrap.className = "planetWrap";

  const btn = document.createElement("button");
  btn.className = "planetBtn";
  btn.ariaLabel = p.name;

  const planet = document.createElement("div");
  planet.className = "planet";
  planet.style.width = `${p.size}px`;
  planet.style.height = `${p.size}px`;
  planet.style.backgroundImage = `url("${p.img}")`;

  btn.addEventListener("click", () => openModal(p));

  btn.appendChild(planet);
  wrap.appendChild(btn);
  orbit.appendChild(wrap);
  return orbit;
}
function getScale() {
  const solar = document.querySelector(".solar");
  const box = solar.getBoundingClientRect();
  const half = Math.min(box.width, box.height) / 2;

  // margen para que no se corte
  const margin = 36;

  const maxR = Math.max(...PLANETS.map(p => p.r));
  const s = (half - margin) / maxR;

  // límites sanos (ni gigante ni microscópico)
  return Math.max(0.72, Math.min(1, s));
}

function renderPlanets() {
  orbits.innerHTML = "";
  const s = getScale();

  PLANETS.forEach((p, idx) => {
    const scaled = {
      ...p,
      r: Math.round(p.r * s),
      size: Math.max(38, Math.round(p.size * (0.85 + s * 0.15))),
      dur: p.dur * (1.05 - s * 0.05) // un toque más lento si queda grande
    };
    orbits.appendChild(createOrbit(scaled, idx));
  });
}

renderPlanets();
window.addEventListener("resize", renderPlanets);


/* ========= Modal ========= */
function openModal(p) {
  modalTitle.textContent = p.name;
  modalMsg.textContent = p.msg;
  modalPhoto.style.backgroundImage = `url("${p.img}")`;
  backdrop.classList.remove("hidden");
  startHearts();
}

function closeModal() {
  backdrop.classList.add("hidden");
  stopHearts();
}

closeBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ========= Corazoncitos ========= */
function spawnHeart() {
  const heart = document.createElement("div");
  heart.className = "heart";
  const emojis = ["💛","💖","💘","💕","❤️"];
  heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  heart.style.left = `${Math.random() * 100}%`;
  const drift = (Math.random() * 160 - 80).toFixed(0);
  const rot = (Math.random() * 60 - 30).toFixed(0);
  const time = (1.6 + Math.random() * 1.4).toFixed(2);
  const size = (16 + Math.random() * 18).toFixed(0);

  heart.style.setProperty("--x", `${drift}px`);
  heart.style.setProperty("--r", `${rot}deg`);
  heart.style.setProperty("--t", `${time}s`);
  heart.style.fontSize = `${size}px`;

  heartsLayer.appendChild(heart);
  setTimeout(() => heart.remove(), (parseFloat(time) * 1000) + 200);
}

function startHearts() {
  if (heartTimer) return;
  for (let i = 0; i < 10; i++) setTimeout(spawnHeart, i * 60);
  heartTimer = setInterval(spawnHeart, 140);
}

function stopHearts() {
  if (!heartTimer) return;
  clearInterval(heartTimer);
  heartTimer = null;
  heartsLayer.innerHTML = "";
}

/* ========= Audio (loop ya está por HTML) =========
   Importante: en móvil el audio solo puede iniciar por interacción del usuario.
   Entonces: al tocar el Sol, arrancamos la música si no ha arrancado.
*/
async function ensureMusicPlaying() {
  if (musicOn) return;
  try {
    bgm.loop = true;
    bgm.muted = false;
    bgm.volume = 1;
    await bgm.play();
    musicOn = true;
  } catch {}
}


/* ========= Fondo realista (Canvas) + Cometas ========= */
const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d", { alpha: true });

let W, H, DPR;
let stars = [];
let dust = [];
let comets = [];
let magic = 0; // 0..1

function rand(a,b){ return a + Math.random()*(b-a); }

function resizeCanvas(){
  DPR = Math.min(1.5, window.devicePixelRatio || 1);
  W = canvas.width  = Math.floor(window.innerWidth * DPR);
  H = canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  stars = Array.from({length: 520}, () => makeStar());
  dust  = Array.from({length: 170}, () => makeDust());

  // cometas activos (pocos, móviles)
  comets = Array.from({length: 4}, () => makeComet(true));
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function makeStar(){
  const z = Math.random() ** 1.8;
  return {
    x: Math.random()*W,
    y: Math.random()*H,
    z: 0.2 + z*0.9,
    r: (0.55 + Math.random()*1.5) * DPR * (0.45 + z*1.1),
    tw: rand(1.0, 4.2),
    ph: Math.random()*Math.PI*2
  };
}

function makeDust(){
  return {
    x: Math.random()*W,
    y: Math.random()*H,
    r: rand(14, 60)*DPR,
    a: rand(0.02, 0.08),
    dx: rand(-0.10, 0.12)*DPR,
    dy: rand(-0.06, 0.06)*DPR
  };
}

function makeComet(initial=false){
  // Cometas nacen fuera de pantalla y cruzan diagonal
  const fromLeft = Math.random() < 0.5;
  const startX = fromLeft ? rand(-0.2*W, 0.2*W) : rand(0.8*W, 1.2*W);
  const startY = rand(-0.2*H, 0.5*H);

  // dirección hacia abajo/derecha (o abajo/izquierda)
  const vx = (fromLeft ? rand(4.0, 6.2) : rand(-6.2, -4.0)) * DPR;
  const vy = rand(2.8, 4.8) * DPR;

  const life = initial ? rand(1.0, 2.5) : rand(0.8, 1.8);
  return {
    x: startX,
    y: startY,
    vx, vy,
    len: rand(140, 260) * DPR,
    w: rand(1.2, 2.4) * DPR,
    a: rand(0.35, 0.75),
    t: 0,
    life
  };
}

function blob(x,y,r,color){
  const g = ctx.createRadialGradient(x,y,0, x,y,r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fill();
}

function drawNebula(t){
  const cx = W*0.5, cy = H*0.48;
  const pulse = 0.85 + 0.15*Math.sin(t*0.6);
  const m = 0.10 + magic*0.24;

  ctx.globalCompositeOperation = "screen";
  blob(cx - 220*DPR, cy + 90*DPR, 420*DPR, `rgba(255,80,180,${0.08*pulse + m})`);
  blob(cx + 260*DPR, cy - 30*DPR, 460*DPR, `rgba(120,220,255,${0.06*pulse + m*0.9})`);
  blob(cx,           cy + 260*DPR, 560*DPR, `rgba(180,120,255,${0.05*pulse + m*0.8})`);
  ctx.globalCompositeOperation = "source-over";
}

function drawComet(c){
  // cola = gradiente lineal en dirección opuesta a la velocidad
  const speed = Math.hypot(c.vx, c.vy);
  const nx = c.vx / speed;
  const ny = c.vy / speed;

  const tailX = c.x - nx * c.len;
  const tailY = c.y - ny * c.len;

  const g = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
  g.addColorStop(0, `rgba(255,255,255,${0.85*c.a})`);
  g.addColorStop(0.25, `rgba(255,200,240,${0.35*c.a})`);
  g.addColorStop(1, `rgba(255,255,255,0)`);

  ctx.strokeStyle = g;
  ctx.lineWidth = c.w;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(tailX, tailY);
  ctx.stroke();

  // cabeza brillante
  ctx.fillStyle = `rgba(255,255,255,${0.95*c.a})`;
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.w*1.2, 0, Math.PI*2);
  ctx.fill();

  // halo
  ctx.fillStyle = `rgba(255,255,255,${0.18*c.a})`;
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.w*8, 0, Math.PI*2);
  ctx.fill();
}

let t0 = performance.now();
function tick(now){
  const t = (now - t0) / 1000;

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0,0,W,H);

  // nebulosa
  drawNebula(t);

  // polvo
  ctx.globalCompositeOperation = "screen";
  for(const d of dust){
    d.x += d.dx; d.y += d.dy;
    if(d.x < -120) d.x = W+120;
    if(d.x > W+120) d.x = -120;
    if(d.y < -120) d.y = H+120;
    if(d.y > H+120) d.y = -120;

    ctx.beginPath();
    ctx.fillStyle = `rgba(200,120,255,${d.a*(0.7+magic*1.6)})`;
    ctx.arc(d.x, d.y, d.r*(0.6+magic*0.7), 0, Math.PI*2);
    ctx.fill();
  }

  // estrellas con parallax + glow
  ctx.globalCompositeOperation = "lighter";
  for(const s of stars){
    const tw = 0.55 + 0.45*Math.sin(t*s.tw + s.ph);
    const glow = (0.10 + 0.30*s.z) * (0.85 + tw) * (1 + magic*2.0);

    s.x += 0.08*DPR*s.z;
    if(s.x > W+10) s.x = -10;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${glow})`;
    ctx.arc(s.x, s.y, s.r*(0.9 + magic*0.35), 0, Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${glow*0.22})`;
    ctx.arc(s.x, s.y, s.r*4.6*(0.8+magic*0.6), 0, Math.PI*2);
    ctx.fill();
  }

  // cometas (ocasionales)
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < comets.length; i++) {
    const c = comets[i];
    c.t += 1/60;

    c.x += c.vx;
    c.y += c.vy;

    // aparece/desaparece con el tiempo
    const fade = Math.min(1, c.t / 0.2) * Math.max(0, 1 - (c.t / c.life));
    c.a = 0.75 * fade * (1 + magic*0.35);

    drawComet(c);

    const out = (c.x < -0.4*W || c.x > 1.4*W || c.y > 1.4*H);
    if (c.t > c.life || out) {
      // re-spawn con pausa aleatoria (simulada regenerando con vida distinta)
      comets[i] = makeComet(false);
      comets[i].t = -rand(0, 2.5); // delay (negativo para esperar)
    }

    if (comets[i].t < 0) {
      // si está en “delay”, no dibujar todavía
      // pero ya dibujamos arriba, así que hacemos truco: si delay, poner alpha 0
      comets[i].a = 0;
    }
  }

  ctx.globalCompositeOperation = "source-over";

  // decaimiento magia
  magic *= 0.985;

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ========= Sol = magia + iniciar música ========= */
function burstHearts(){
  for (let i = 0; i < 16; i++) setTimeout(spawnHeart, i * 45);
}

sunBtn.addEventListener("click", async () => {
  // inicia música en móvil (loop ya está activado)
  await ensureMusicPlaying();

  // activa magia (más brillo por un rato)
  magic = 1;

  // regen con más densidad
  stars = Array.from({length: 900}, () => makeStar());
  dust  = Array.from({length: 260}, () => makeDust());

  burstHearts();
});

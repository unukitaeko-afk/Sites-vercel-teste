// ===========================================================
// ✏️  SUAS FOTOS — edite só esta lista
// -----------------------------------------------------------
// 1) Coloque as fotos na pasta "fotos" (ao lado do index.html)
// 2) Use nomes simples, sem espaço nem acento: foto1.jpg, foto2.jpg...
// 3) Em "arquivo" escreva o nome (com ou sem extensão).
//    Sem extensão, o site tenta jpg, jpeg, png, webp...
// 4) Para ter mais fotos, copie uma linha e mude o nome e a legenda.
// Se a foto não existir, aparece o desenho colorido no lugar.
// ===========================================================
const FOTOS = [
  { arquivo: 'foto1', legenda: 'Sempre com um sorriso no rosto', emoji: '🌻' },
  { arquivo: 'foto2', legenda: 'Brindando a cada conquista',     emoji: '🥂' },
  { arquivo: 'foto3', legenda: 'Pronta para novas aventuras',    emoji: '✈️' },
  { arquivo: 'foto4', legenda: 'A estrela brilhante de hoje',    emoji: '👑' }
];

// ===========================================================
// ⚙️  AJUSTES
// -----------------------------------------------------------
// BALOES_PARA_POPUP: quantos balões a pessoa precisa estourar
//                    para aparecer o pop-up (edite o texto dele no index.html).
// WEB3FORMS_KEY:     chave para você receber os desejos por e-mail.
//                    1) Entre em web3forms.com e peça sua "Access Key"
//                       (ela chega no seu e-mail, é grátis).
//                    2) Cole a chave entre as aspas abaixo.
//                    Deixe vazio ('') para NÃO enviar nada.
// ===========================================================
const BALOES_PARA_POPUP = 10;
const WEB3FORMS_KEY = '83944e97-d2e9-4ef5-8138-5026e147008e';

// ===========================================================
// FELIZ ANIVERSÁRIO — fogos, confetes, balões, música e interações
// ===========================================================

const state = {
  userName: 'Aniversariante',
  musicPlaying: false,
  wishes: [],
  balloonsPopped: 0,
  popupShown: false
};

/* ---------------------------------------------------------
   CANVAS (fogos + confetes) com loop de animação
--------------------------------------------------------- */
const fireworksCanvas = document.getElementById('fireworks-canvas');
const confettiCanvas = document.getElementById('confetti-canvas');
const fireworksCtx = fireworksCanvas.getContext('2d');
const confettiCtx = confettiCanvas.getContext('2d');

function resizeCanvases() {
  fireworksCanvas.width = confettiCanvas.width = window.innerWidth;
  fireworksCanvas.height = confettiCanvas.height = window.innerHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

const FIREWORK_COLORS = ['#ff6b6b', '#ffd93d', '#4ecdc4', '#ffe66d', '#1dd1a1', '#ff9ff3', '#74b9ff'];
const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#4ecdc4', '#ffe66d', '#1dd1a1', '#ff8c42', '#ff9ff3'];

/* ---- Fogos de artifício ---- */
class Firework {
  constructor(x, y) {
    const baseColor = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
    const count = 60 + Math.floor(Math.random() * 40);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? baseColor : FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        size: 1.5 + Math.random() * 2.5,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.012
      });
    }
  }
  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay;
    });
    this.particles = this.particles.filter(p => p.alpha > 0);
  }
  draw(ctx) {
    this.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
  get done() { return this.particles.length === 0; }
}

let fireworks = [];

function launchFireworks(x, y) {
  fireworks.push(new Firework(x, y));
}

function randomFireworks(n = 3) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      launchFireworks(
        window.innerWidth * (0.15 + Math.random() * 0.7),
        window.innerHeight * (0.1 + Math.random() * 0.4)
      );
    }, i * 350);
  }
}

/* ---- Confetes ---- */
class ConfettiPiece {
  constructor(x, y, burst = true) {
    this.x = x;
    this.y = y;
    this.w = 6 + Math.random() * 8;
    this.h = 4 + Math.random() * 6;
    this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    this.vx = burst ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 2;
    this.vy = burst ? -4 - Math.random() * 9 : 1 + Math.random() * 2;
    this.gravity = 0.18;
    this.drag = 0.99;
    this.alpha = 1;
    this.round = Math.random() > 0.6;
  }
  update() {
    this.vy += this.gravity;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.x += this.vx + Math.sin(this.y / 30) * 0.6; // balanço
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    if (this.y > window.innerHeight * 0.75) this.alpha -= 0.02;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    if (this.round) {
      ctx.beginPath();
      ctx.arc(0, 0, this.w / 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    }
    ctx.restore();
  }
  get done() { return this.alpha <= 0 || this.y > window.innerHeight + 40; }
}

let confettiPieces = [];

function launchConfetti(x, y, count = 60) {
  for (let i = 0; i < count; i++) confettiPieces.push(new ConfettiPiece(x, y, true));
}

function confettiRain(count = 120) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      confettiPieces.push(new ConfettiPiece(Math.random() * window.innerWidth, -10, false));
    }, Math.random() * 1500);
  }
}

/* ---- Loop principal ---- */
function animate() {
  fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  fireworks.forEach(fw => { fw.update(); fw.draw(fireworksCtx); });
  fireworks = fireworks.filter(fw => !fw.done);

  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach(c => { c.update(); c.draw(confettiCtx); });
  confettiPieces = confettiPieces.filter(c => !c.done);

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* ---------------------------------------------------------
   BALÕES
--------------------------------------------------------- */
const balloonsContainer = document.getElementById('balloons-container');

function createBalloons(count = 15) {
  const colors = ['#ff6b6b', '#ffd93d', '#4ecdc4', '#1dd1a1', '#ff9ff3', '#74b9ff'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      balloon.style.left = `${Math.random() * 90}%`;
      balloon.style.setProperty('--c', colors[Math.floor(Math.random() * colors.length)]);
      balloon.style.animationDuration = `${10 + Math.random() * 8}s`;

      balloon.addEventListener('click', () => {
        const r = balloon.getBoundingClientRect();
        launchConfetti(r.left + r.width / 2, r.top + r.height / 2, 40);
        balloon.remove();
        registrarBalaoEstourado();
      });
      balloon.addEventListener('animationend', () => balloon.remove());

      balloonsContainer.appendChild(balloon);
    }, i * 250);
  }
}

/* ---------------------------------------------------------
   MÚSICA — "Parabéns pra Você" (melodia correta, em loop)
--------------------------------------------------------- */
const btnMusic = document.getElementById('btn-music');
let audioContext = null;
let masterGain = null;
let musicTimer = null;
let activeOscillators = [];

// [frequência Hz, duração em batidas]
const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, Bb4: 466.16, C5: 523.25 };
const MELODY = [
  [N.C4, .75], [N.C4, .25], [N.D4, 1], [N.C4, 1], [N.F4, 1], [N.E4, 2],
  [N.C4, .75], [N.C4, .25], [N.D4, 1], [N.C4, 1], [N.G4, 1], [N.F4, 2],
  [N.C4, .75], [N.C4, .25], [N.C5, 1], [N.A4, 1], [N.F4, 1], [N.E4, 1], [N.D4, 2],
  [N.Bb4, .75], [N.Bb4, .25], [N.A4, 1], [N.F4, 1], [N.G4, 1], [N.F4, 2]
];
const BEAT = 0.5; // segundos por batida

function scheduleMelody() {
  let t = audioContext.currentTime + 0.1;
  MELODY.forEach(([freq, beats]) => {
    const dur = beats * BEAT;
    const osc = audioContext.createOscillator();
    const env = audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.35, t + 0.03);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
    osc.connect(env);
    env.connect(masterGain);
    osc.start(t);
    osc.stop(t + dur);
    osc.onended = () => { activeOscillators = activeOscillators.filter(o => o !== osc); };
    activeOscillators.push(osc);
    t += dur;
  });
  return t - audioContext.currentTime;
}

function playLoop() {
  if (!state.musicPlaying) return;
  const total = scheduleMelody();
  musicTimer = setTimeout(playLoop, (total + 1.5) * 1000);
}

function setMusicLabel() {
  if (btnMusic) btnMusic.innerHTML = `🎵 <span class="btn-text">Música: ${state.musicPlaying ? 'Ligada' : 'Desligada'}</span>`;
}

function toggleMusic() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioContext.destination);
  }

  if (state.musicPlaying) {
    state.musicPlaying = false;
    clearTimeout(musicTimer);
    activeOscillators.forEach(o => { try { o.stop(); } catch (e) {} });
    activeOscillators = [];
  } else {
    state.musicPlaying = true;
    audioContext.resume();
    playLoop();
  }
  setMusicLabel();
}

if (btnMusic) btnMusic.addEventListener('click', toggleMusic);

/* ---------------------------------------------------------
   ESTRELAS DECORATIVAS DE FUNDO
--------------------------------------------------------- */
function createStars() {
  const symbols = ['★', '☆', '✧', '✦'];
  for (let i = 0; i < 25; i++) {
    const star = document.createElement('div');
    star.className = 'decorative-star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 6}s`;
    star.style.fontSize = `${0.7 + Math.random() * 1.1}rem`;
    star.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    document.body.appendChild(star);
  }
}
createStars();

/* ---------------------------------------------------------
   ENVIO DO DESEJO POR E-MAIL (Web3Forms)
--------------------------------------------------------- */
async function enviarDesejo(texto) {
  if (!WEB3FORMS_KEY) return false;
  try {
    const resp = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: '🌠 Novo desejo no site de aniversário',
        from_name: 'Site de aniversário',
        message: texto
      })
    });
    const data = await resp.json();
    return data.success === true;
  } catch (e) {
    return false;
  }
}

/* ---------------------------------------------------------
   LANÇADOR DE DESEJOS
--------------------------------------------------------- */
const wishInput = document.getElementById('user-wish-input');
const btnSendWish = document.getElementById('btn-send-wish');
const wishFeedback = document.getElementById('wish-feedback');
let wishFeedbackTimer = null;

function sendWish() {
  const text = wishInput.value.trim();
  if (!text) {
    wishInput.focus();
    return;
  }
  state.wishes.push(text);

  const rect = btnSendWish.getBoundingClientRect();
  const star = document.createElement('div');
  star.className = 'wish-star';
  star.textContent = '✦';
  star.style.left = `${rect.left + rect.width / 2}px`;
  star.style.top = `${rect.top}px`;
  document.body.appendChild(star);
  star.addEventListener('animationend', () => star.remove());

  launchConfetti(rect.left + rect.width / 2, rect.top, 25);

  wishFeedback.textContent = `✨ Seu desejo "${text}" foi enviado ao Universo!`;
  wishFeedback.classList.add('show');
  wishInput.value = '';

  clearTimeout(wishFeedbackTimer);
  // envia uma cópia para o seu e-mail (se a chave estiver configurada)
  enviarDesejo(text).then(ok => {
    if (ok) wishFeedback.textContent = `✨ Seu desejo "${text}" foi enviado ao Universo (e ao Enzo)! 💌`;
  });

  wishFeedbackTimer = setTimeout(() => wishFeedback.classList.remove('show'), 6000);
}

btnSendWish.addEventListener('click', sendWish);
wishInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendWish(); });

/* ---------------------------------------------------------
   ELOGIOS ALEATÓRIOS
--------------------------------------------------------- */
const compliments = [
  "Você tem uma energia contagiante que alegra qualquer ambiente em que entra!",
  "Sua criatividade não tem limites - continue incrível!",
  "Você inspira pessoas ao seu redor a serem melhores todo dia!",
  "Seu sorriso é capaz de iluminar até o dia mais nublado!",
  "Você tem um coração dourado e merece todo o sucesso do mundo!",
  "Sua inteligência e graça fazem toda a diferença!",
  "Você transforma desafios em oportunidades com graça!",
  "A generosidade que você espelha é rara e valiosa!",
  "Sua positividade é como um raio de sol em dias nublados!",
  "Você merece todos os sonhos que tem no coração!"
];
let lastCompliment = -1;

function showRandomCompliment() {
  let i;
  do { i = Math.floor(Math.random() * compliments.length); } while (i === lastCompliment);
  lastCompliment = i;
  document.getElementById('compliment-text').textContent = compliments[i];
}
document.getElementById('btn-next-compliment').addEventListener('click', showRandomCompliment);
showRandomCompliment();

/* ---------------------------------------------------------
   VELAS DO BOLO (clique em cada chama ou use o botão)
--------------------------------------------------------- */
const btnBlowCandles = document.getElementById('btn-blow-candles');
const btnRelightCandles = document.getElementById('btn-relight-candles');
const wishStatus = document.getElementById('wish-status');
const cake = document.getElementById('birthday-cake');
const candleEls = Array.from(document.querySelectorAll('.candle'));
let blowTimers = [];

function finishWish() {
  cake.classList.add('blown');
  wishStatus.classList.remove('hidden');
  btnBlowCandles.classList.add('hidden');
  btnRelightCandles.classList.remove('hidden');
  const r = cake.getBoundingClientRect();
  launchConfetti(r.left + r.width / 2, r.top + r.height / 3, 80);
  randomFireworks(2);
}

function snuff(candle) {
  if (candle.classList.contains('out')) return;
  candle.classList.add('out');
  candle.dataset.lit = 'false';
  if (candleEls.every(c => c.classList.contains('out'))) {
    blowTimers.push(setTimeout(finishWish, 500));
  }
}

candleEls.forEach(candle => {
  candle.addEventListener('click', () => snuff(candle));
  candle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      snuff(candle);
    }
  });
});

btnBlowCandles.addEventListener('click', () => {
  btnBlowCandles.disabled = true;
  candleEls.forEach((c, i) => blowTimers.push(setTimeout(() => snuff(c), i * 160)));
});

btnRelightCandles.addEventListener('click', () => {
  blowTimers.forEach(clearTimeout);
  blowTimers = [];
  candleEls.forEach(c => {
    c.classList.remove('out');
    c.dataset.lit = 'true';
  });
  cake.classList.remove('blown');
  wishStatus.classList.add('hidden');
  btnRelightCandles.classList.add('hidden');
  btnBlowCandles.classList.remove('hidden');
  btnBlowCandles.disabled = false;
});

/* ---------------------------------------------------------
   CARTA (envelope abre e a carta sai)
--------------------------------------------------------- */
const envelope = document.getElementById('envelope');
const envelopeScene = document.getElementById('envelope-scene');
const carta = document.getElementById('carta');
let cartaTimer = null;

function abrirCarta() {
  if (envelopeScene.classList.contains('is-open')) return;
  envelopeScene.classList.add('is-open'); // aba abre e o papel sobe

  const r = envelope.getBoundingClientRect();
  launchConfetti(r.left + r.width / 2, r.top + r.height / 3, 35);

  // depois da animação do papel, a carta aparece aberta
  cartaTimer = setTimeout(() => {
    envelopeScene.classList.add('reading');
    carta.classList.add('show');
    const c = carta.getBoundingClientRect();
    launchConfetti(c.left + c.width / 2, c.top + 40, 60);
    carta.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 1700);
}

function fecharCarta() {
  clearTimeout(cartaTimer);
  carta.classList.remove('show');
  envelopeScene.classList.remove('reading', 'is-open');
}

envelope.addEventListener('click', abrirCarta);
envelope.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirCarta(); }
});
document.getElementById('btn-close-carta').addEventListener('click', fecharCarta);

/* ---------------------------------------------------------
   BOTÃO PRINCIPAL (HERO)
--------------------------------------------------------- */
document.getElementById('btn-trigger-surprise').addEventListener('click', () => {
  document.getElementById('hero-welcome').classList.add('hidden');
  document.getElementById('main-celebration').classList.remove('hidden');
  window.scrollTo({ top: 0 });

  randomFireworks(4);
  launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 120);
  confettiRain(100);
  createBalloons(15);

  // Música (precisa do gesto do usuário, que é este clique)
  if (!state.musicPlaying) toggleMusic();
});

/* ---------------------------------------------------------
   BOTÕES DO TOPO: CONFETES / FOGOS
--------------------------------------------------------- */
document.getElementById('btn-more-confetti')?.addEventListener('click', () => {
  confettiRain(150);
  launchConfetti(window.innerWidth / 2, window.innerHeight * 0.6, 80);
});

document.getElementById('btn-more-fireworks')?.addEventListener('click', () => randomFireworks(5));
document.getElementById('btn-more-balloons')?.addEventListener('click', () => createBalloons(15));

/* ---------------------------------------------------------
   REPLAY
--------------------------------------------------------- */
document.getElementById('btn-replay-all').addEventListener('click', () => location.reload());

/* ---------------------------------------------------------
   FOGOS AMBIENTE (a cada 7s) + confete de boas-vindas
--------------------------------------------------------- */
setInterval(() => {
  if (document.hidden) return;
  randomFireworks(1);
}, 7000);

setTimeout(() => confettiRain(60), 1000);

/* ---------------------------------------------------------
   MURAL DE FOTOS (polaroids montadas a partir da lista FOTOS)
--------------------------------------------------------- */
const EXTENSOES_FOTO = ['jpg', 'jpeg', 'png', 'webp', 'jfif', 'JPG', 'JPEG', 'PNG'];
const photoGrid = document.getElementById('polaroid-grid');
let photoLightbox = null;

function openLightbox(src, legenda) {
  if (!photoLightbox) {
    photoLightbox = document.createElement('div');
    photoLightbox.className = 'photo-lightbox';
    photoLightbox.innerHTML = '<img alt=""><p></p>';
    photoLightbox.addEventListener('click', closeLightbox);
    document.body.appendChild(photoLightbox);
  }
  photoLightbox.querySelector('img').src = src;
  photoLightbox.querySelector('img').alt = legenda;
  photoLightbox.querySelector('p').textContent = legenda;
  photoLightbox.classList.add('open');
}

function closeLightbox() {
  if (photoLightbox) photoLightbox.classList.remove('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

function renderMural() {
  if (!photoGrid) return;

  FOTOS.forEach((foto, i) => {
    const card = document.createElement('figure');
    card.className = 'polaroid-card';

    const tape = document.createElement('div');
    tape.className = 'tape-strip';

    const frame = document.createElement('div');
    frame.className = 'photo-frame';

    // desenho colorido que aparece enquanto a foto não existe/carrega
    const fallback = document.createElement('div');
    fallback.className = `photo-fallback photo-gradient-${(i % 4) + 1}`;
    fallback.textContent = foto.emoji || '📷';

    const caption = document.createElement('figcaption');
    caption.className = 'polaroid-caption';
    caption.textContent = foto.legenda || '';

    // tenta as extensões uma a uma até achar o arquivo
    const nomes = foto.arquivo.includes('.')
      ? [foto.arquivo]
      : EXTENSOES_FOTO.map(ext => `${foto.arquivo}.${ext}`);
    const caminhos = nomes.map(n => `fotos/${n}`);

    const img = new Image();
    img.alt = foto.legenda || '';
    img.decoding = 'async';
    let tentativa = 0;

    img.onload = () => {
      frame.classList.add('has-img');
      card.classList.add('clickable');
    };
    img.onerror = () => {
      tentativa++;
      if (tentativa < caminhos.length) {
        img.src = caminhos[tentativa];
      } else {
        img.remove(); // nenhuma foto encontrada: fica só o desenho
      }
    };
    img.src = caminhos[0];

    card.addEventListener('click', () => {
      if (card.classList.contains('clickable')) openLightbox(img.src, foto.legenda || '');
    });

    frame.append(fallback, img);
    card.append(tape, frame, caption);
    photoGrid.appendChild(card);
  });
}
renderMural();

/* ---------------------------------------------------------
   POP-UP DOS BALÕES (aparece uma vez, ao estourar BALOES_PARA_POPUP)
--------------------------------------------------------- */
const popupBaloes = document.getElementById('popup-baloes');

function registrarBalaoEstourado() {
  state.balloonsPopped++;
  if (!state.popupShown && state.balloonsPopped >= BALOES_PARA_POPUP) {
    state.popupShown = true;
    setTimeout(abrirPopupBaloes, 400);
  }
}
function abrirPopupBaloes() {
  popupBaloes.classList.add('open');
  launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 100);
}
function fecharPopupBaloes() { popupBaloes.classList.remove('open'); }

document.getElementById('btn-close-popup').addEventListener('click', fecharPopupBaloes);
popupBaloes.addEventListener('click', e => { if (e.target === popupBaloes) fecharPopupBaloes(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharPopupBaloes(); });

// só mostra o aviso "o desejo também é enviado" se o envio estiver configurado
if (WEB3FORMS_KEY) document.getElementById('wish-aviso')?.classList.remove('hidden');

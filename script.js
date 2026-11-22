'use strict';
const root = document.documentElement;
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = motionQuery.matches;
let manualForm = null;
let soundEnabled = false;
let audioContext;
const transformation = document.querySelector('.transformation');
const formButtons = [...document.querySelectorAll('[data-form]')];
const formName = document.querySelector('.form-name');
const motionButton = document.querySelector('.motion');
const soundButton = document.querySelector('.sound');
let currentForm = 0;
const clamp = value => Math.min(1, Math.max(0, value));
let framePending = false;
let pointerX = 0;
let pointerY = 0;
function setForm(value) {
  currentForm = value;
  transformation.style.setProperty('--form', value.toFixed(3));
  formName.textContent = value < .5 ? 'Matinta' : 'Rasga-Mortalha';
  formButtons.forEach(button => button.setAttribute('aria-pressed', String((button.dataset.form === 'bird') === (value >= .5))));
}
function render() {
  framePending = false;
  const distance = document.documentElement.scrollHeight - innerHeight;
  root.style.setProperty('--progress', distance > 0 ? clamp(scrollY / distance) : 0);
  const rect = transformation.getBoundingClientRect();
  const progress = clamp(-rect.top / Math.max(1, transformation.offsetHeight - innerHeight));
  setForm(manualForm ?? (reduced ? 0 : clamp((progress - .15) / .65)));
  root.style.setProperty('--hero-x', reduced ? '0px' : `${pointerX * -12}px`);
  root.style.setProperty('--hero-y', reduced ? '0px' : `${Math.min(scrollY, innerHeight) * .17 + pointerY * -8}px`);
  root.style.setProperty('--hero-scale', reduced ? 1.04 : 1.04 + Math.min(scrollY / innerHeight, 1) * .07);
  const forestTravel = reduced ? 0 : Math.sin(scrollY / 650) * 26;
  root.style.setProperty('--forest-travel', `${forestTravel}px`);
  root.style.setProperty('--forest-pointer-x', reduced ? '0px' : `${pointerX * 32}px`);
  root.style.setProperty('--forest-pointer-y', reduced ? '0px' : `${pointerY * 18}px`);
  transformation.style.setProperty('--night-progress', reduced ? '.45' : progress.toFixed(3));
  drawCharacters(performance.now());
  const village = document.querySelector('.village-scene').getBoundingClientRect();
  root.style.setProperty('--village-y', reduced ? '0px' : `${Math.max(-30, Math.min(30, village.top * -.035))}px`);
  root.style.setProperty('--village-x', reduced ? '0px' : `${pointerX * 8}px`);
}
function scheduleRender() { if (!framePending) { framePending = true; requestAnimationFrame(render); } }
addEventListener('scroll', () => { manualForm = null; scheduleRender(); }, { passive: true });
addEventListener('resize', () => { resizeCanvas(); scheduleRender(); }, { passive: true });
addEventListener('pointermove', event => { if (event.pointerType !== 'mouse' || reduced) return; pointerX = event.clientX / innerWidth - .5; pointerY = event.clientY / innerHeight - .5; scheduleRender(); }, { passive: true });
formButtons.forEach(button => button.addEventListener('click', () => { manualForm = button.dataset.form === 'bird' ? 1 : 0; scheduleRender(); }));
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
function updateMotion() {
  root.classList.toggle('js-motion', !reduced);
  root.classList.toggle('reduced-motion', reduced);
  motionButton.setAttribute('aria-pressed', String(reduced));
  motionButton.textContent = reduced ? 'Ativar movimento' : 'Reduzir movimento';
  scheduleRender(); startParticles();
}
motionButton.addEventListener('click', () => { reduced = !reduced; updateMotion(); });
motionQuery.addEventListener('change', event => { reduced = event.matches; updateMotion(); });
soundButton.addEventListener('click', async () => {
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume(); soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.querySelector('span').textContent = soundEnabled ? 'ligado' : 'desligado';
  } catch { soundButton.querySelector('span').textContent = 'indisponível'; }
});
function whistleSound() {
  if (!soundEnabled || !audioContext || audioContext.state !== 'running') return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain();
  oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(1150, now);
  oscillator.frequency.exponentialRampToValueAtTime(1750, now + .28);
  oscillator.frequency.exponentialRampToValueAtTime(1300, now + .8);
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.055, now + .08);
  gain.gain.exponentialRampToValueAtTime(.001, now + .95);
  oscillator.connect(gain).connect(audioContext.destination); oscillator.start(now); oscillator.stop(now + 1);
}
const whistleSection = document.querySelector('.whistle');
const response = document.querySelector('.response');
const responses = ['Uma janela se ilumina. Alguém ouviu.', 'Uma voz responde de dentro da casa.', 'A noite já sabe quem chegou.'];
const houseReplies = ['Já ouvi, Matinta…', 'Amanhã eu deixo na janela.', 'Prometido é prometido.'];
let responseIndex = 0; let responseTimer;
document.querySelector('.whistle-button').addEventListener('click', () => {
  whistleSection.classList.remove('calling'); void whistleSection.offsetWidth; whistleSection.classList.add('calling');
  const replyIndex = responseIndex++ % responses.length;
  response.textContent = responses[replyIndex] + ' “' + houseReplies[replyIndex] + '”';
  document.querySelector('.house-response').textContent = houseReplies[replyIndex];
  whistleSound();
  clearTimeout(responseTimer); responseTimer = setTimeout(() => whistleSection.classList.remove('calling'), 6500);
});
const canvas = document.querySelector('#fireflies');
const context = canvas.getContext('2d');
const hero = document.querySelector('.hero');
let particleFrame = null; let heroVisible = true; let canvasWidth = 0; let canvasHeight = 0;
const particles = Array.from({ length: 30 }, (_, index) => ({ x: (index * .137) % 1, y: (index * .193) % 1, radius: .7 + index % 3 * .4, phase: index * 1.7 }));
function resizeCanvas() {
  canvasWidth = hero.clientWidth; canvasHeight = hero.clientHeight;
  const ratio = Math.min(devicePixelRatio || 1, 2); canvas.width = canvasWidth * ratio; canvas.height = canvasHeight * ratio;
  if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
function animateParticles(time) {
  particleFrame = null;
  if (reduced || !heroVisible || document.hidden || !context) { context?.clearRect(0, 0, canvasWidth, canvasHeight); return; }
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  for (const particle of particles) {
    const x = particle.x * canvasWidth + Math.sin(time * .0002 + particle.phase) * 28;
    const y = ((particle.y * canvasHeight - time * .009) % canvasHeight + canvasHeight) % canvasHeight;
    context.beginPath(); context.arc(x, y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(231,192,120,${.2 + (Math.sin(time * .001 + particle.phase) + 1) * .2})`;
    context.shadowBlur = 12; context.shadowColor = '#edbd6b'; context.fill();
  }
  particleFrame = requestAnimationFrame(animateParticles);
}
function startParticles() { if (particleFrame === null && !reduced && heroVisible && !document.hidden) particleFrame = requestAnimationFrame(animateParticles); }
new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; startParticles(); }).observe(hero);
document.addEventListener('visibilitychange', startParticles);


// Atlases are prepared from the original project animation frames, aligned per sequence.
const atlases = {
  idle: { src: 'assets/animation/idle.png', count: 13 },
  transform: { src: 'assets/animation/transform.png', count: 19 },
  flight: { src: 'assets/animation/flight.png', count: 18 }
};
const characterCanvas = document.querySelector('.character-canvas');
const characterContext = characterCanvas.getContext('2d');
let spritesLoaded = false;
let spriteLoadStarted = false;
let animationFrame = null;
let lastAnimationTime = 0;
const visibleActors = new Set();
function drawAtlas(context, atlas, index) {
  if (!context || !atlas.image) return;
  index = Math.min(atlas.count - 1, Math.max(0, index));
  context.clearRect(0, 0, 384, 480);
  context.drawImage(atlas.image, (index % 8) * 384, Math.floor(index / 8) * 480, 384, 480, 0, 0, 384, 480);
}
function drawCharacters(time) {
  if (!spritesLoaded) return;
  const tick = reduced ? 0 : Math.floor(time / 100);
  if (visibleActors.has('forms')) {
    if (currentForm < .04) drawAtlas(characterContext, atlases.idle, tick % atlases.idle.count);
    else if (currentForm > .96) drawAtlas(characterContext, atlases.flight, tick % atlases.flight.count);
    else drawAtlas(characterContext, atlases.transform, Math.round(clamp((currentForm - .04) / .92) * (atlases.transform.count - 1)));
  }
}
function animateCharacters(time) {
  animationFrame = null;
  if (!spritesLoaded || reduced || document.hidden || visibleActors.size === 0) return;
  if (time - lastAnimationTime >= 95) { drawCharacters(time); lastAnimationTime = time; }
  animationFrame = requestAnimationFrame(animateCharacters);
}
function startCharacters() {
  drawCharacters(performance.now());
  if (animationFrame === null && !reduced && spritesLoaded && !document.hidden && visibleActors.size) animationFrame = requestAnimationFrame(animateCharacters);
}
async function loadSprites() {
  if (spriteLoadStarted) return;
  spriteLoadStarted = true;
  try {
    await Promise.all(Object.values(atlases).map(async atlas => {
      const img = new Image(); img.src = atlas.src; await img.decode(); atlas.image = img;
    }));
    spritesLoaded = true;
    transformation.classList.add('frames-ready');
    startCharacters();
  } catch { /* Static character artwork remains available if an atlas fails. */ }
}
const actorObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const key = 'forms';
    if (entry.isIntersecting) { visibleActors.add(key); loadSprites(); }
    else visibleActors.delete(key);
  }
  startCharacters();
}, { rootMargin: '100px' });
actorObserver.observe(transformation);
document.addEventListener('visibilitychange', startCharacters);
motionButton.addEventListener('click', startCharacters);
motionQuery.addEventListener('change', startCharacters);
const chapterObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    document.body.dataset.scene = entry.target.id;

  }
}, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });
document.querySelectorAll('main section[id]').forEach(section => chapterObserver.observe(section));
const mobileMenu = document.querySelector('.mobile-menu');
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileMenu.open = false; }));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && mobileMenu.open) { mobileMenu.open = false; mobileMenu.querySelector('summary').focus(); } });
document.addEventListener('click', event => { if (!mobileMenu.contains(event.target)) mobileMenu.open = false; });
resizeCanvas(); updateMotion(); render();

// Direct manipulation stays decorative; native scrolling and biography controls remain available.
document.querySelectorAll('.team-portrait').forEach(portrait => {
  let frame = null;
  let bounds = null;
  let point = null;
  let tapTimer;
  let bounce;
  const reset = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    portrait.classList.remove('is-tilting');
    portrait.style.setProperty('--tilt-x', '0deg');
    portrait.style.setProperty('--tilt-y', '0deg');
    portrait.style.setProperty('--card-lift', '0px');
    bounds = null;
  };
  const paintTilt = () => {
    frame = null;
    if (reduced || !bounds || !point) return;
    const x = Math.max(0, Math.min(1, (point.x - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (point.y - bounds.top) / bounds.height));
    portrait.style.setProperty('--tilt-x', `${(y - .5) * -12}deg`);
    portrait.style.setProperty('--tilt-y', `${(x - .5) * 12}deg`);
    portrait.style.setProperty('--card-lift', '-3px');
    portrait.style.setProperty('--shine-x', `${x * 100}%`);
    portrait.style.setProperty('--shine-y', `${y * 100}%`);
    portrait.classList.add('is-tilting');
  };
  const follow = event => {
    if (reduced) return;
    if (!bounds) bounds = portrait.parentElement.getBoundingClientRect();
    point = { x: event.clientX, y: event.clientY };
    if (frame === null) frame = requestAnimationFrame(paintTilt);
  };
  portrait.addEventListener('pointerdown', follow, { passive: true });
  portrait.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' || event.buttons) follow(event);
  }, { passive: true });
  portrait.addEventListener('pointerleave', reset);
  portrait.addEventListener('pointerup', reset);
  portrait.addEventListener('pointercancel', reset);
  portrait.addEventListener('blur', reset);
  portrait.addEventListener('click', () => {
    reset();
    clearTimeout(tapTimer);
    portrait.classList.add('is-tapped');
    tapTimer = setTimeout(() => portrait.classList.remove('is-tapped'), 650);
    bounce?.cancel();
    if (!reduced) bounce = portrait.animate([
      { transform: 'perspective(800px) rotateY(-6deg) rotateZ(-1deg) scale(.98)' },
      { transform: 'perspective(800px) rotateY(5deg) rotateZ(1deg) scale(1.015)', offset: .45 },
      { transform: 'perspective(800px) rotateY(0deg) rotateZ(0deg) scale(1)' }
    ], { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' });
  });
  const stop = () => { reset(); bounce?.cancel(); };
  motionButton.addEventListener('click', stop);
  motionQuery.addEventListener('change', stop);
  addEventListener('resize', reset, { passive: true });
});

// Reserve the exact height of the fixed institutional credits, including mobile safe areas.
const fundingBar = document.querySelector('.funding-bar');
const updateFundingSpace = () => {
  root.style.setProperty('--funding-height', `${Math.ceil(fundingBar.getBoundingClientRect().height)}px`);
};
new ResizeObserver(updateFundingSpace).observe(fundingBar);
updateFundingSpace();

const body = document.body;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
addEventListener('load', () => setTimeout(() => body.classList.add('ready'), 400));

if (!reducedMotion) {
  const layers = document.querySelectorAll('.layers i');
  addEventListener('pointermove', event => {
    const x = (event.clientX / innerWidth - .5) * 2;
    const y = (event.clientY / innerHeight - .5) * 2;
    layers.forEach((layer, index) => {
      layer.style.transform = `scale(${1.07 + index * .06}) translate(${x * (index + 1) * 7}px, ${y * (index + 1) * 7}px)`;
    });
    document.querySelector('blockquote').style.transform = `perspective(900px) rotateX(${y * -2}deg) rotateY(${x * 3}deg)`;
  });
  addEventListener('scroll', () => {
    document.querySelector('.front').style.marginTop = scrollY * .15 + 'px';
  }, { passive: true });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: .14 });

document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
const scenes = [...document.querySelectorAll('[data-story]')];
const meter = document.querySelector('.journey-meter');
const meterDots = meter ? [...meter.querySelectorAll('i')] : [];
const meterLabel = meter?.querySelector('span');
const sceneWords = ['PORTAL', 'MEMÓRIA', 'LUA', 'PLUMA', 'RETORNO'];
const sceneObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    scenes.forEach(scene => scene.classList.remove('scene-active'));
    entry.target.classList.add('scene-active');
    const index = Number(entry.target.dataset.story);
    meterDots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex <= index));
    if (meterLabel) {
      meterLabel.textContent = sceneWords[index];
      meterLabel.style.setProperty('--step', index);
      meterLabel.classList.add('show');
    }
  });
}, { threshold: .52 });
scenes.forEach(scene => sceneObserver.observe(scene));

const atmosphere = document.querySelector('.atmosphere');
if (atmosphere && !reducedMotion) {
  const particles = Array.from({ length: 9 }, (_, index) => {
    const particle = document.createElement('span');
    const feather = index % 3 === 0;
    const size = 24 + (index % 4) * 7;
    particle.className = feather ? 'feather' : 'leaf';
    particle.style.setProperty('--size', size + 'px');
    atmosphere.appendChild(particle);
    return {
      node: particle,
      x: index % 2 ? 91 + (index % 4) * 3 : -10 - (index % 4) * 3,
      y: -25 - index * 18,
      depth: .3 + (index % 7) * .15,
      spin: index % 2 ? 1 : -1,
      size
    };
  });
  let latestScroll = scrollY;
  addEventListener('scroll', () => { latestScroll = scrollY; }, { passive: true });
  const animateAtmosphere = time => {
    particles.forEach((particle, index) => {
      const travel = latestScroll * (.035 + particle.depth * .018);
      const y = ((particle.y + travel) % 150) - 28;
      const x = particle.x + Math.sin(time * .00045 + index * 1.77) * (4 + particle.depth * 6);
      const turn = latestScroll * .018 * particle.spin + time * .017 * particle.spin;
      const tilt = Math.sin(time * .001 + index) * 38;
      particle.node.style.transform = `translate3d(${x}vw, ${y}vh, ${particle.depth * 80}px) rotateX(${tilt}deg) rotateY(${turn}deg) rotateZ(${turn * .7}deg)`;
    });
    requestAnimationFrame(animateAtmosphere);
  };
  requestAnimationFrame(animateAtmosphere);
}

const forestChapter = document.querySelector('.lore');
const forestReveal = document.querySelector('.forest-rise');
if (forestChapter && forestReveal && !reducedMotion) {
  const updateForestReveal = () => {
    const rect = forestChapter.getBoundingClientRect();
    const visible = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height * .18)));
    forestReveal.style.opacity = String(Math.max(0, (visible - .08) * 1.18));
    forestReveal.style.setProperty('--forest-progress', visible);
    forestReveal.style.transform = 'translateY(' + ((1 - visible) * 90) + 'px) scale(' + (1.08 - visible * .08) + ')';
    forestChapter.classList.toggle('forest-awake', visible > .48);
    forestReveal.style.setProperty('background-position-y', (55 - visible * 7) + '%');
    forestReveal.style.setProperty('--forest-shift', visible);
  };
  updateForestReveal();
  addEventListener('scroll', updateForestReveal, { passive: true });
}

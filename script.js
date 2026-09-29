const body = document.body;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
addEventListener('load', () => setTimeout(() => body.classList.add('ready'), 400));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: .14 });
document.querySelectorAll('.reveal').forEach(item => observer.observe(item));

const guide = document.querySelector('.assobio');
const guideWord = document.querySelector('.assobio-word');
const guideNumber = document.querySelector('.assobio-number');
const chapterNames = ['CHAMADO', 'MEMÓRIA', 'VÔO', 'RETORNO'];

if (guide && !reducedMotion) {
  const featherField = guide.querySelector('.feather-field');
  Array.from({ length: 18 }, (_, index) => {
    const feather = document.createElement('i');
    feather.style.setProperty('--angle', (index * 47) % 360 + 'deg');
    feather.style.setProperty('--delay', index * -.31 + 's');
    feather.style.setProperty('--distance', 18 + (index % 5) * 11 + 'px');
    featherField.appendChild(feather);
  });

  let pointerX = 0, pointerY = 0, scrollProgress = 0;
  const updateJourney = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollProgress = scrollY / maxScroll;
    const chapter = Math.min(3, Math.floor(scrollProgress * 4));
    const x = 72 - scrollProgress * 59 + Math.sin(scrollProgress * Math.PI * 5) * 7;
    const y = 13 + scrollProgress * 71;
    guide.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotate(${-13 + scrollProgress * 28}deg)`;
    guide.style.setProperty('--progress', scrollProgress);
    body.dataset.chapter = chapter;
    guideWord.textContent = chapterNames[chapter];
    guideNumber.textContent = '0' + (chapter + 1);
  };
  updateJourney();
  addEventListener('scroll', updateJourney, { passive: true });
  addEventListener('pointermove', event => {
    pointerX = (event.clientX / innerWidth - .5) * 2;
    pointerY = (event.clientY / innerHeight - .5) * 2;
    const quote = document.querySelector('blockquote');
    if (quote) quote.style.transform = `perspective(900px) rotateX(${pointerY * -2}deg) rotateY(${pointerX * 3}deg)`;
  });

  const layers = document.querySelectorAll('.layers i');
  const animateLayers = () => {
    layers.forEach((layer, index) => {
      layer.style.transform = `scale(${1.07 + index * .06}) translate(${pointerX * (index + 1) * 7}px, ${pointerY * (index + 1) * 7}px)`;
    });
    const front = document.querySelector('.front');
    if (front) front.style.marginTop = scrollY * .15 + 'px';
    requestAnimationFrame(animateLayers);
  };
  animateLayers();
} else if (guide) {
  guide.remove();
}
const threshold = document.querySelector('.threshold');
if (threshold && !reducedMotion) {
  const visual = threshold.querySelector('.threshold-visual');
  const copy = threshold.querySelector('.threshold-copy');
  const mask = threshold.querySelector('.threshold-mask');
  const updateThreshold = () => {
    const rect = threshold.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / (threshold.offsetHeight - innerHeight)));
    visual.style.transform = `scale(${1.08 + progress * .24}) translateY(${progress * -7}%)`;
    copy.style.transform = `translateY(calc(-44% + ${progress * -80}px))`;
    copy.style.opacity = String(1 - progress * 1.25);
    mask.style.opacity = String(1 - progress * .35);
  };
  updateThreshold();
  addEventListener('scroll', updateThreshold, { passive: true });
}

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
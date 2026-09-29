import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const body = document.body;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
addEventListener('load', () => setTimeout(() => body.classList.add('ready'), 400));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: .14 });
document.querySelectorAll('.reveal').forEach(item => observer.observe(item));

if (!reducedMotion) {
  const layers = document.querySelectorAll('.layers i');
  let pointerX = 0, pointerY = 0;
  addEventListener('pointermove', event => {
    pointerX = (event.clientX / innerWidth - .5) * 2;
    pointerY = (event.clientY / innerHeight - .5) * 2;
    layers.forEach((layer, index) => {
      layer.style.transform = `scale(${1.07 + index * .06}) translate(${pointerX * (index + 1) * 7}px, ${pointerY * (index + 1) * 7}px)`;
    });
    const quote = document.querySelector('blockquote');
    if (quote) quote.style.transform = `perspective(900px) rotateX(${pointerY * -2}deg) rotateY(${pointerX * 3}deg)`;
  });
  addEventListener('scroll', () => {
    const front = document.querySelector('.front');
    if (front) front.style.marginTop = scrollY * .15 + 'px';
  }, { passive: true });

  const host = document.querySelector('#totem3d');
  if (host) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    camera.position.set(0, .2, 9);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const relic = new THREE.Group();
    relic.rotation.z = -.12;
    relic.position.set(.1, -.2, 0);
    scene.add(relic);

    const wood = new THREE.MeshStandardMaterial({ color: 0x4a2715, roughness: .88, metalness: .03 });
    const copper = new THREE.MeshStandardMaterial({ color: 0xbc6537, roughness: .55, metalness: .3 });
    const moss = new THREE.MeshStandardMaterial({ color: 0x35442d, roughness: .9 });
    const ivory = new THREE.MeshStandardMaterial({ color: 0xded3bd, roughness: .72 });

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(.10, .14, 5.5, 10), wood);
    staff.rotation.z = .06;
    relic.add(staff);

    for (let i = 0; i < 4; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-.1, -2.35 + i * 1.35, .12),
        new THREE.Vector3(.25, -1.7 + i * 1.35, .25),
        new THREE.Vector3(-.22, -1.05 + i * 1.35, .08),
        new THREE.Vector3(.05, -.5 + i * 1.35, .2)
      ]);
      const vine = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, .025, 6, false), moss);
      relic.add(vine);
    }

    const crown = new THREE.Group();
    crown.position.set(0, 2.85, 0);
    relic.add(crown);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(.23, 1), copper);
    core.rotation.z = Math.PI / 4;
    crown.add(core);
    for (let i = 0; i < 7; i++) {
      const feather = new THREE.Mesh(new THREE.ConeGeometry(.15, .9, 5), i % 2 ? copper : ivory);
      feather.position.set(Math.sin(i * .9) * .38, .28 + Math.cos(i * .6) * .12, Math.cos(i) * .18);
      feather.rotation.set(.4 + Math.cos(i) * .2, i * .88, Math.sin(i) * .55);
      crown.add(feather);
    }

    const owl = new THREE.Group();
    owl.position.set(-1.05, .45, .25);
    owl.scale.setScalar(.58);
    const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(.55, 18, 15), ivory);
    owl.add(bodyMesh);
    [[-.5, .04, -.55], [.5, .04, .55]].forEach(([x, z, r]) => {
      const wing = new THREE.Mesh(new THREE.ConeGeometry(.34, 1.45, 5), copper);
      wing.position.set(x, z, 0);
      wing.rotation.z = r;
      owl.add(wing);
    });
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 10), new THREE.MeshBasicMaterial({ color: 0x10120f }));
    eye.position.set(.17, .16, .5);
    owl.add(eye);
    relic.add(owl);

    const particles = new THREE.BufferGeometry();
    const count = 130, positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - .5) * 5;
      positions[i * 3 + 1] = (Math.random() - .5) * 7;
      positions[i * 3 + 2] = (Math.random() - .5) * 2;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const sparks = new THREE.Points(particles, new THREE.PointsMaterial({ color: 0xe29a5a, size: .035, transparent: true, opacity: .8 }));
    relic.add(sparks);

    scene.add(new THREE.HemisphereLight(0xf2dfc9, 0x142015, 1.35));
    const warmLight = new THREE.PointLight(0xe99755, 5, 14);
    warmLight.position.set(-2, 2, 4);
    scene.add(warmLight);
    const rim = new THREE.PointLight(0x77905d, 2, 10);
    rim.position.set(3, -1, -2);
    scene.add(rim);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    addEventListener('resize', resize);

    const clock = new THREE.Clock();
    const animate = () => {
      const time = clock.getElapsedTime();
      relic.rotation.y += (.22 + pointerX * .26 - relic.rotation.y) * .025;
      relic.rotation.x += (pointerY * -.12 - relic.rotation.x) * .025;
      relic.position.y = -.2 + Math.sin(time * .75) * .12;
      crown.rotation.y = time * .55;
      owl.position.y = .45 + Math.sin(time * 1.1) * .09;
      owl.rotation.z = Math.sin(time * .8) * .1;
      sparks.rotation.y = time * .07;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }
}
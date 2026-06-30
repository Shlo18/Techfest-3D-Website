// ===================================================
//  CYBORG — Techfest 3D Interactive Website
//  Three.js scene + GSAP scroll animations
// ===================================================

document.addEventListener("DOMContentLoaded", () => {

  // ── CUSTOM CURSOR ──────────────────────────────
  const cursor = document.getElementById("cursor");
  const cursorRing = document.getElementById("cursor-ring");
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top  = mouseY + "px";
  });

  // Smooth ring follow
  (function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top  = ringY + "px";
    requestAnimationFrame(animateCursor);
  })();

  // Cursor hover effect on interactive elements
  document.querySelectorAll("a, button, .feature-card, .about-tags span").forEach(el => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("hovered"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("hovered"));
  });

  // ── THREE.JS 3D SCENE ──────────────────────────
  const canvas = document.getElementById("bg-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 8);

  // ── Ambient + Point lights ──
  scene.add(new THREE.AmbientLight(0x001133, 2));
  const pointLight1 = new THREE.PointLight(0x00ffff, 4, 50);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);
  const pointLight2 = new THREE.PointLight(0x7b2fff, 2, 30);
  pointLight2.position.set(-5, -3, 3);
  scene.add(pointLight2);

  // ── Main hero object: Icosahedron (wireframe) ──
  const heroGeo = new THREE.IcosahedronGeometry(2.2, 1);
  const heroMat = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    emissive: 0x002233,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  const heroMesh = new THREE.Mesh(heroGeo, heroMat);
  heroMesh.position.set(3.5, 0, 0);
  scene.add(heroMesh);

  // ── Inner solid core ──
  const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0x001a22,
    emissive: 0x003344,
    transparent: true,
    opacity: 0.8,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  heroMesh.add(coreMesh);

  // ── Outer ring ──
  const ringGeo = new THREE.TorusGeometry(3, 0.02, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.copy(heroMesh.position);
  ringMesh.rotation.x = Math.PI / 3;
  scene.add(ringMesh);

  // ── Floating particles ──
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.06,
    transparent: true,
    opacity: 0.5,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Grid helper (ground) ──
  const gridHelper = new THREE.GridHelper(40, 40, 0x001a22, 0x001a22);
  gridHelper.position.y = -5;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.4;
  scene.add(gridHelper);

  // ── Mouse parallax ──
  let targetRotX = 0, targetRotY = 0;
  document.addEventListener("mousemove", (e) => {
    targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.4;
    targetRotY = ((e.clientX / window.innerWidth)  - 0.5) * 0.6;
  });

  // ── Scroll-driven camera ──
  let scrollY = 0;
  window.addEventListener("scroll", () => { scrollY = window.scrollY; });

  // ── GSAP Scroll animations ──
  gsap.registerPlugin(ScrollTrigger);

  // Hero mesh: zoom out as user scrolls
  gsap.to(heroMesh.position, {
    z: 6,
    y: -2,
    scrollTrigger: {
      trigger: "#home",
      start: "top top",
      end:   "bottom top",
      scrub: 1.5,
    }
  });

  gsap.to(heroMat, {
    opacity: 0,
    scrollTrigger: {
      trigger: "#home",
      start: "60% top",
      end:   "bottom top",
      scrub: 1,
    }
  });

  // ── Reveal sections on scroll ──
  gsap.utils.toArray(".feature-card").forEach((card, i) => {
    gsap.from(card, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.1,
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
      }
    });
  });

  gsap.from(".about-text", {
    x: 60,
    opacity: 0,
    duration: 1,
    scrollTrigger: { trigger: ".about", start: "top 70%" }
  });

  gsap.from(".about-visual", {
    x: -60,
    opacity: 0,
    duration: 1,
    scrollTrigger: { trigger: ".about", start: "top 70%" }
  });

  gsap.utils.toArray(".stat-item").forEach((item, i) => {
    gsap.from(item, {
      y: 40,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.12,
      scrollTrigger: { trigger: ".stats", start: "top 80%" }
    });
  });

  gsap.from(".contact-form", {
    y: 60,
    opacity: 0,
    duration: 1,
    scrollTrigger: { trigger: ".contact", start: "top 80%" }
  });

  // ── Animated stat counters ──
  document.querySelectorAll(".stat-num").forEach(el => {
    const target = parseInt(el.dataset.target);
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current);
          if (current >= target) clearInterval(timer);
        }, 16);
      }
    });
  });

  // ── Card tilt effect ──
  document.querySelectorAll("[data-tilt]").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // ── Navbar scroll style ──
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.style.background = window.scrollY > 50
      ? "rgba(3,3,16,0.98)"
      : "rgba(3,3,16,0.85)";
  });

  // ── THREE.JS render loop ──
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse parallax
    heroMesh.rotation.x += (targetRotX - heroMesh.rotation.x) * 0.04;
    heroMesh.rotation.y += (targetRotY + t * 0.15 - heroMesh.rotation.y) * 0.04;

    ringMesh.rotation.z = t * 0.2;
    ringMesh.position.copy(heroMesh.position);

    particles.rotation.y = t * 0.03;
    particles.rotation.x = t * 0.01;

    // Pulsing light
    pointLight1.intensity = 4 + Math.sin(t * 2) * 1.5;

    // Grid drifts slightly on scroll
    gridHelper.position.z = (scrollY * 0.005) % 2;

    renderer.render(scene, camera);
  }

  animate();

  // ── Resize handler ──
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

});

// ── Contact form handler ──
function handleSubmit() {
  const btn = document.querySelector(".btn-primary.full");
  btn.textContent = "Transmitting...";
  setTimeout(() => {
    btn.textContent = "✓ Message Sent";
    btn.style.background = "#00ff88";
    btn.style.color = "#000";
    btn.style.borderColor = "#00ff88";
    setTimeout(() => {
      btn.textContent = "Transmit Message";
      btn.style.background = "";
      btn.style.color = "";
      btn.style.borderColor = "";
    }, 3000);
  }, 1200);
}

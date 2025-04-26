// Fancy cursor interactivity for Smelly Cat Games
const orb = document.querySelector('.cursor-orb');
const trail = document.querySelector('.cursor-trail');
const bubbles = document.querySelector('.cursor-bubbles');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let orbX = mouseX, orbY = mouseY;
let trailPoints = [];

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animate() {
  // Move orb
  orbX = lerp(orbX, mouseX, 0.18);
  orbY = lerp(orbY, mouseY, 0.18);
  orb.style.transform = `translate(-50%, -50%) translate(${orbX}px, ${orbY}px)`;
  // Trail
  trailPoints.push({ x: orbX, y: orbY });
  if (trailPoints.length > 18) trailPoints.shift();
  let trailStr = '';
  trailPoints.forEach((pt, i) => {
    trailStr += `<div class='trail-dot' style='left:${pt.x-6}px;top:${pt.y-6}px;opacity:${i/trailPoints.length};'></div>`;
  });
  trail.innerHTML = trailStr;
  // Bubbles
  let bubbleStr = '';
  for (let i = 0; i < 6; i++) {
    let angle = (Date.now()/800 + i*Math.PI/3);
    let bx = orbX + Math.cos(angle) * 38;
    let by = orbY + Math.sin(angle) * 38;
    bubbleStr += `<div class='bubble' style='left:${bx-7}px;top:${by-7}px;'></div>`;
  }
  bubbles.innerHTML = bubbleStr;
  requestAnimationFrame(animate);
}

animate();

// --- Quasi-3D Polygon Background Grid ---
const bgGrid = document.querySelector('.bg-grid');
const mainElem = document.querySelector('main');
let polyGridRows = 0, polyGridCols = 0, polyGridSpacing = 110;
let polyGridPointers = [];

function createPolyGrid() {
  bgGrid.innerHTML = '';
  polyGridPointers = [];
  // Use viewport size for grid
  const width = window.innerWidth;
  const height = window.innerHeight;
  // Choose desired number of columns and rows
  let cols = Math.round(width / 110);
  let rows = Math.round(height / 110);
  // On mobile, add extra row and column
  if (window.innerWidth <= 700) {
    cols += 1;
    rows += 1;
  }
  const colSpacing = width / cols;
  const rowSpacing = height / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = Math.round((x + 0.5) * colSpacing);
      const py = Math.round((y + 0.5) * rowSpacing);
      const el = document.createElement('div');
      el.className = 'bg-pointer-poly';
      el.innerHTML = `<img src="/assets/bg_head.svg" class="bg-head-svg" draggable="false" alt="bg head">`;
      el.style.left = px + 'px';
      el.style.top = py + 'px';
      bgGrid.appendChild(el);
      polyGridPointers.push({el, px, py});
    }
  }
}

function updatePolyPointers(mx, my) {
  const mainRect = mainElem.getBoundingClientRect();
  const mouseX = mx - mainRect.left;
  const mouseY = my - mainRect.top;
  polyGridPointers.forEach(({el, px, py}) => {
    const dx = mouseX - px;
    const dy = mouseY - py;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const angle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
    const tiltX = (dy / mainRect.height) * 30;
    const tiltY = -(dx / mainRect.width) * 30;
    el.style.transform = `translate(-50%, -50%) rotate(${angle}deg) perspective(300px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${1 + 0.08*Math.sin(dist/60)})`;
    // Apply hue-rotate to the SVG based on distance
    const hue = 180 + dist/8;
    const sat = 70 + 20*Math.sin(dist/120);
    el.querySelector('img').style.filter = `hue-rotate(${hue}deg) saturate(${sat}%) drop-shadow(0 2px 8px var(--black))`;
  });
}

window.addEventListener('resize', createPolyGrid);
window.addEventListener('DOMContentLoaded', createPolyGrid);

let pointerMX = window.innerWidth/2, pointerMY = window.innerHeight/2;
window.addEventListener('mousemove', e => {
  pointerMX = e.clientX;
  pointerMY = e.clientY;
});

// --- Detect Mobile ---
function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry/i.test(navigator.userAgent);
}

// --- Touch Tracking for Background Grid ---
let isTouching = false;
let touchX = window.innerWidth / 2, touchY = window.innerHeight / 2;

if (isMobile()) {
  document.body.classList.add('mobile');
  window.addEventListener('touchstart', e => {
    isTouching = true;
    if (e.touches && e.touches.length > 0) {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }
  });
  window.addEventListener('touchmove', e => {
    if (e.touches && e.touches.length > 0) {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }
  });
  window.addEventListener('touchend', e => {
    isTouching = false;
  });
}

// --- Use touch position for background on mobile ---
function getPointerXY() {
  if (isMobile() && isTouching) return [touchX, touchY];
  return [pointerMX, pointerMY];
}

function animatePolyBgPointers() {
  const [mx, my] = getPointerXY();
  updatePolyPointers(mx, my);
  requestAnimationFrame(animatePolyBgPointers);
}

animatePolyBgPointers();

// --- Hide cursor overlays on mobile ---
if (isMobile()) {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.cursor-orb, .cursor-trail, .cursor-bubbles').forEach(el => {
      el.style.display = 'none';
    });
  });
}

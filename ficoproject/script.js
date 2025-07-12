const cursor = document.querySelector('.cursor');
const container = document.getElementById('dots-container');
const COLS = 29; // Must be odd
const ROWS = 15; // Must be odd
const DOT_SIZE = 10;
const GAP = 1.5; // in vw — must match your CSS

document.addEventListener('pointermove', (e) => {
  gsap.to(cursor, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.1,
    ease: 'power2.out',
  });
});

let dotElements = [];
let dotStates = new Map();

function createGrid() {
  container.innerHTML = '';
  dotElements = [];
  dotStates.clear();

  const centerCol = Math.floor(COLS / 2) - 1;
  const centerRow = Math.floor(ROWS / 2) - 1;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const isInCenter3x3 =
        row >= centerRow && row < centerRow + 3 &&
        col >= centerCol && col < centerCol + 3;

      const dot = document.createElement('div');
      dot.className = isInCenter3x3 ? 'dot empty-dot' : 'dot';
      container.appendChild(dot);

      if (!isInCenter3x3) {
        dotElements.push(dot);
      }
    }
  }
}

// Prevent manual zooming
window.addEventListener('wheel', function (e) {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

window.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && ['+', '-', '='].includes(e.key)) {
    e.preventDefault();
  }
});

function updateInteraction(mouseX, mouseY) {
  dotElements.forEach((dot) => {
    const rect = dot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!dotStates.has(dot)) {
      dotStates.set(dot, { x: 0, y: 0 });
    }

    if (dist < 180) {
      const intensity = 1 - dist / 180;
      const scale = 1 + intensity * 0.8;
      const glow = gsap.utils.interpolate("#ff6b6b", "#ffb347", intensity);

      const moveX = -dx * 0.07 * intensity;
      const moveY = -dy * 0.07 * intensity;

      dotStates.set(dot, { x: moveX, y: moveY });

      gsap.to(dot, {
        scale,
        backgroundColor: glow,
        x: moveX,
        y: moveY,
        duration: 0.3,
        ease: "power3.out",
      });
    } else {
      const state = dotStates.get(dot);
      gsap.to(dot, {
        scale: 1,
        backgroundColor: "#ff6b6b",
        x: state?.x || 0,
        y: state?.y || 0,
        duration: 0.5,
        ease: "expo.out",
        overwrite: true,
      });

      gsap.to(dot, {
        x: 0,
        y: 0,
        delay: 0.1,
        duration: 1.2,
        ease: "power1.out",
      });
    }
  });
}

// Ensure interaction is only set up once
let isInteractionSetup = false;
function setupInteraction() {
  if (!isInteractionSetup) {
    document.addEventListener('pointermove', (e) => {
      updateInteraction(e.clientX, e.clientY);
    });
    isInteractionSetup = true;
  }
}

// Init + Resize
function init() {
  createGrid();
  setupInteraction();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', init);

// ----------- LOGO GLITCH ANIMATION -----------
const logoFrames = document.querySelectorAll('.logo-frame');
let currentIndex = 0;

// Set initial visible
gsap.set(logoFrames[currentIndex], { opacity: 1, zIndex: 1 });

function glitchRotateLogo() {
  const prev = logoFrames[currentIndex];
  currentIndex = (currentIndex + 1) % logoFrames.length;
  const next = logoFrames[currentIndex];

  // Flicker / glitch effect on previous
  gsap.fromTo(prev,
    { filter: "brightness(1.5) contrast(2)", x: -2 },
    {
      filter: "none",
      x: 0,
      duration: 0.1,
      yoyo: true,
      repeat: 2,
      ease: "rough({strength: 1, points: 20, taper: none})"
    }
  );

  // Fade out current
  gsap.to(prev, {
    opacity: 0,
    rotationY: 45,
    duration: 0.2,
    ease: "power2.inOut",
    onComplete: () => prev.style.zIndex = 0
  });

  // Bring in next with smooth rotate
  next.style.zIndex = 1;
  gsap.fromTo(next,
    { opacity: 0, rotationY: -45 },
    {
      opacity: 1,
      rotationY: 0,
      duration: 0.6,
      ease: "power3.out"
    }
  );
}

// Loop every 2 seconds (randomize trigger slightly)
setInterval(() => {
  if (Math.random() < 0.9) {
    glitchRotateLogo();
  }
}, 2000);

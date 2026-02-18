(() => {
  const canvas = document.createElement("canvas");
  canvas.id = "galaxy-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "-1000";
  canvas.style.pointerEvents = "none";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let w, h;
  let stars = [];
  const starCount = 250;
  const maxDistance = 100;
  const mouseInfluenceRadius = 100; // distance threshold to hide lines near mouse

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: random(0, w),
        y: random(0, h),
        radius: random(0.3, 1.2),
        alpha: random(0.1, 0.9),
        twinkleSpeed: random(0.002, 0.006),
        twinklePhase: Math.random() * Math.PI * 2,
        vx: random(-0.3, 0.3),
        vy: random(-0.3, 0.3),
      });
    }
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
    createStars();
  }

  function updateStars() {
    for (const star of stars) {
      // twinkle effect
      star.alpha += star.twinkleSpeed * Math.sin(performance.now() * 0.005 + star.twinklePhase);
      star.alpha = Math.min(Math.max(star.alpha, 0.1), 1);

      // Move randomly using velocity
      star.x += star.vx;
      star.y += star.vy;

      // Bounce from edges
      if (star.x <= 0 || star.x >= w) star.vx *= -1;
      if (star.y <= 0 || star.y >= h) star.vy *= -1;
    }
  }

  function drawNebula() {
    const gradient = ctx.createRadialGradient(w * 0.3, h * 0.7, 100, w * 0.5, h * 0.3, 700);
    const time = performance.now() * 0.0001;
    const hueShift = (Math.sin(time) + 1) * 180;

    gradient.addColorStop(0, `hsla(${hueShift}, 80%, 30%, 0.25)`);
    gradient.addColorStop(0.5, `hsla(${(hueShift + 60) % 360}, 70%, 20%, 0.18)`);
    gradient.addColorStop(1, `hsla(${(hueShift + 120) % 360}, 50%, 10%, 0.1)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  function isNearMouse(x, y) {
    const dx = mouseX - x;
    const dy = mouseY - y;
    return dx * dx + dy * dy < mouseInfluenceRadius * mouseInfluenceRadius;
  }

function drawStars() {
  const lineFlickerChance = 0.03; // 3% chance per frame to skip drawing a line

  // connect stars with flickering lines
  for (let i = 0; i < stars.length; i++) {
    const starA = stars[i];
    if (starA.alpha <= 0.05) continue;
    for (let j = i + 1; j < stars.length; j++) {
      const starB = stars[j];
      if (starB.alpha <= 0.05) continue;
      const dx = starA.x - starB.x;
      const dy = starA.y - starB.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        // Random chance to skip line for flicker effect
        if (Math.random() < lineFlickerChance) continue;

        // Smooth fade based on distance to mouse (optional)
        const distToMouseA = Math.hypot(mouseX - starA.x, mouseY - starA.y);
        const distToMouseB = Math.hypot(mouseX - starB.x, mouseY - starB.y);
        const closestDist = Math.min(distToMouseA, distToMouseB);

        let lineAlpha = ((maxDistance - dist) / maxDistance) * 0.25;
        if (closestDist < mouseInfluenceRadius) {
          lineAlpha *= (closestDist / mouseInfluenceRadius);
          if (lineAlpha < 0.02) lineAlpha = 0;
        }
        if (lineAlpha > 0) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(starA.x, starA.y);
          ctx.lineTo(starB.x, starB.y);
          ctx.stroke();
        }
      }
    }
  }

  // draw stars normally
  for (const star of stars) {
    const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 5);
    grd.addColorStop(0, `rgba(255, 255, 255, ${star.alpha})`);
    grd.addColorStop(0.4, `rgba(255, 255, 255, ${star.alpha * 0.3})`);
    grd.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

  function animate() {
    ctx.clearRect(0, 0, w, h);
    drawNebula();
    updateStars();
    drawStars();
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  animate();
})();

var harmonyVer = "1.0.0"

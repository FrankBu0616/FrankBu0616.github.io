// Dark mode toggle
(function() {
  var toggle = document.getElementById('themeToggle');
  var html = document.documentElement;
  var saved = localStorage.getItem('theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
  }
  toggle.addEventListener('click', function() {
    var current = html.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    // Spin animation
    toggle.classList.add('spin');
    setTimeout(function() { toggle.classList.remove('spin'); }, 300);
  });
})();

// Scroll-triggered fade-in + staggered lists
(function() {
  var els = document.querySelectorAll('.fade-in, .stagger-in');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(function(el) { observer.observe(el); });
})();

// Lite YouTube facades
(function() {
  var players = document.querySelectorAll('.lite-yt');
  players.forEach(function(p) {
    var id = p.getAttribute('data-id');
    p.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
    p.addEventListener('click', function() {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      p.textContent = '';
      p.appendChild(iframe);
    }, { once: true });
  });
})();

// Ambient trash barrel robots background
(function() {
  var canvas = document.getElementById('bgCanvas');
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var robots = [];
  var numRobots = 6;
  var raf;

  // roundRect polyfill for older browsers
  if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
      if (typeof r === 'number') r = [r];
      var rad = r[0] || 0;
      this.beginPath();
      this.moveTo(x + rad, y);
      this.lineTo(x + w - rad, y);
      this.quadraticCurveTo(x + w, y, x + w, y + rad);
      this.lineTo(x + w, y + h - rad);
      this.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
      this.lineTo(x + rad, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - rad);
      this.lineTo(x, y + rad);
      this.quadraticCurveTo(x, y, x + rad, y);
      this.closePath();
    };
  }

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Create floating barrel robots
  for (var i = 0; i < numRobots; i++) {
    robots.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 36 + Math.random() * 32,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: -0.08 - Math.random() * 0.12,
      rotation: (Math.random() - 0.5) * 0.3,
      rotSpeed: (Math.random() - 0.5) * 0.0005,
      wobble: Math.random() * Math.PI * 2
    });
  }

  function drawBarrelRobot(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var col = isDark ? '#7b9cf5' : '#3b6de0';
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var s = size;

    // === HOVERBOARD BASE ===
    var baseY = s * 0.62;
    var wheelR = s * 0.16;
    var wheelW = s * 0.12;
    var axleW = s * 0.6;
    var plateW = s * 0.5;
    var plateH = s * 0.08;

    // Center platform
    ctx.roundRect(-plateW/2, baseY - plateH/2, plateW, plateH, s * 0.02);
    ctx.stroke();

    // Left wheel
    ctx.roundRect(-axleW/2 - wheelW/2, baseY - wheelR, wheelW, wheelR * 2, wheelW/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-axleW/2, baseY - wheelR * 0.4);
    ctx.lineTo(-axleW/2, baseY + wheelR * 0.4);
    ctx.stroke();

    // Right wheel
    ctx.roundRect(axleW/2 - wheelW/2, baseY - wheelR, wheelW, wheelR * 2, wheelW/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(axleW/2, baseY - wheelR * 0.4);
    ctx.lineTo(axleW/2, baseY + wheelR * 0.4);
    ctx.stroke();

    // Left axle connector
    ctx.beginPath();
    ctx.moveTo(-plateW/2, baseY);
    ctx.lineTo(-axleW/2 + wheelW/2, baseY);
    ctx.stroke();
    // Right axle connector
    ctx.beginPath();
    ctx.moveTo(plateW/2, baseY);
    ctx.lineTo(axleW/2 - wheelW/2, baseY);
    ctx.stroke();

    // === ROUND BRUTE BARREL ===
    var topW = s * 0.72;
    var botW = s * 0.56;
    var barrelTop = -s * 0.48;
    var barrelBot = baseY - plateH/2 - s*0.02;
    var barrelH = barrelBot - barrelTop;

    // Barrel body outline — left side
    ctx.beginPath();
    ctx.moveTo(-topW/2, barrelTop);
    ctx.lineTo(-botW/2, barrelBot);
    ctx.stroke();
    // Right side
    ctx.beginPath();
    ctx.moveTo(topW/2, barrelTop);
    ctx.lineTo(botW/2, barrelBot);
    ctx.stroke();

    // Top rim — bold ellipse
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(0, barrelTop, topW/2, s * 0.09, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2.2;

    // Bottom edge
    ctx.beginPath();
    ctx.ellipse(0, barrelBot, botW/2, s * 0.06, 0, 0, Math.PI);
    ctx.stroke();

    // Horizontal band
    var bandT = 0.25;
    var bandY = barrelTop + s * 0.09 + bandT * (barrelH - s * 0.09);
    var bandFrac = (bandY - barrelTop) / barrelH;
    var bandHalfW = topW/2 + bandFrac * (botW/2 - topW/2);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-bandHalfW, bandY);
    ctx.lineTo(bandHalfW, bandY);
    ctx.stroke();
    ctx.lineWidth = 2.2;

    // Side handles
    var handleY = barrelTop + barrelH * 0.22;
    var lhx = -(topW/2 + (botW/2 - topW/2) * 0.22);
    var rhx = -lhx;
    ctx.lineWidth = 2;

    // Left handle
    ctx.beginPath();
    ctx.moveTo(lhx, handleY - s * 0.05);
    ctx.quadraticCurveTo(lhx - s * 0.07, handleY, lhx, handleY + s * 0.05);
    ctx.stroke();

    // Right handle
    ctx.beginPath();
    ctx.moveTo(rhx, handleY - s * 0.05);
    ctx.quadraticCurveTo(rhx + s * 0.07, handleY, rhx, handleY + s * 0.05);
    ctx.stroke();
    ctx.lineWidth = 2.2;

    // === LID ===
    ctx.beginPath();
    ctx.ellipse(0, barrelTop - s * 0.04, topW * 0.44, s * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Lid handle bump
    ctx.beginPath();
    ctx.arc(0, barrelTop - s * 0.09, s * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // === 360 CAMERA ON A STICK ===
    var stickX = s * 0.08;
    var stickBase = barrelTop - s * 0.04;
    var stickTop = barrelTop - s * 0.38;
    ctx.lineWidth = 1.8;

    // Thin stick
    ctx.beginPath();
    ctx.moveTo(stickX, stickBase);
    ctx.lineTo(stickX, stickTop);
    ctx.stroke();

    // Camera sphere
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(stickX, stickTop - s * 0.04, s * 0.05, 0, Math.PI * 2);
    ctx.stroke();
    // Lens ring
    ctx.beginPath();
    ctx.arc(stickX, stickTop - s * 0.04, s * 0.02, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var w = window.innerWidth;
    var h = window.innerHeight;

    for (var i = 0; i < robots.length; i++) {
      var bot = robots[i];
      bot.wobble += 0.008;
      bot.x += bot.speedX + Math.sin(bot.wobble) * 0.1;
      bot.y += bot.speedY;
      bot.rotation += bot.rotSpeed;

      // Wrap around
      if (bot.y < -bot.size * 2) { bot.y = h + bot.size * 2; bot.x = Math.random() * w; }
      if (bot.x < -bot.size * 2) bot.x = w + bot.size * 2;
      if (bot.x > w + bot.size * 2) bot.x = -bot.size * 2;

      drawBarrelRobot(bot.x, bot.y, bot.size, bot.rotation);
    }
    raf = requestAnimationFrame(animate);
  }

  // Respect reduced motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animate();
  } else {
    // Draw once, static
    for (var i = 0; i < robots.length; i++) {
      drawBarrelRobot(robots[i].x, robots[i].y, robots[i].size, robots[i].rotation);
    }
  }
})();

// Active nav highlighting
(function() {
  var sections = document.querySelectorAll('section[id], .col-side[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var id = entry.target.getAttribute('id');
      var link = document.querySelector('.nav-links a[href="#' + id + '"]');
      if (link) {
        if (entry.isIntersecting) {
          navLinks.forEach(function(l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });
  sections.forEach(function(s) { observer.observe(s); });
})();

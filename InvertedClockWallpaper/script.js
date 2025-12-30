// Inverted Analog Clock - Canvas 2D (Stable Version)
// The clock face rotates while the second hand stays fixed pointing north

const canvas = document.getElementById('clock');
const ctx = canvas.getContext('2d');

// Configuration
let config = {
    primaryColor: '#ff0000', // Christmas Red
    accentColor: '#ffd700',  // Christmas Gold
    hourHandColor: '#ffffff',
    showDigital: true,
    showSecondTip: true,
    showParticles: true,
    showSnow: true
};

let centerX, centerY, radius;

// Particles
const particles = [];
const ambientParticles = [];
const snowParticles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const size = Math.min(canvas.width, canvas.height) * 0.7;
    radius = size / 2;
    centerX = Math.round(canvas.width / 2);
    centerY = Math.round(canvas.height / 2);
    initAmbientParticles();
    initSnow();
}

// Wallpaper Engine
window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
        if (properties.primarycolor) {
            const c = properties.primarycolor.value.split(' ').map(v => Math.round(v * 255));
            config.primaryColor = `rgb(${c[0]},${c[1]},${c[2]})`;
        }
        if (properties.accentcolor) {
            const c = properties.accentcolor.value.split(' ').map(v => Math.round(v * 255));
            config.accentColor = `rgb(${c[0]},${c[1]},${c[2]})`;
        }
        if (properties.showdigital !== undefined) config.showDigital = properties.showdigital.value;
        if (properties.showsecondtip !== undefined) config.showSecondTip = properties.showsecondtip.value;
        if (properties.showparticles !== undefined) config.showParticles = properties.showparticles.value;
        if (properties.showsnow !== undefined) config.showSnow = properties.showsnow.value;
    }
};

function initSnow() {
    snowParticles.length = 0;
    const count = Math.floor((canvas.width * canvas.height) / 10000);
    for (let i = 0; i < count; i++) {
        snowParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 1 + 0.5,
            drift: (Math.random() - 0.5) * 0.5
        });
    }
}

function updateSnow() {
    if (!config.showSnow) return;
    snowParticles.forEach(p => {
        p.y += p.speed;
        p.x += p.drift;
        if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });
}

function drawSnow() {
    if (!config.showSnow) return;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    snowParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
}

function initAmbientParticles() {
    ambientParticles.length = 0;
    for (let i = 0; i < 40; i++) {
        ambientParticles.push({
            angle: Math.random() * Math.PI * 2,
            dist: radius * (0.5 + Math.random() * 0.6),
            size: Math.random() * 2 + 0.5,
            speed: (Math.random() - 0.5) * 0.001,
            pulseOffset: Math.random() * Math.PI * 2
        });
    }
}

function spawnParticle() {
    if (!config.showParticles || particles.length >= 80) return;
    particles.push({
        x: centerX,
        y: centerY - radius * 0.7,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 1,
        life: 1,
        decay: Math.random() * 0.015 + 0.005,
        isSparkle: Math.random() > 0.5
    });
}

function updateParticles(time) {
    // Trail particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        const dx = centerX - p.x, dy = centerY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        p.vx += (dx / dist) * 0.02;
        p.vy += (dy / dist) * 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    }
    // Ambient
    ambientParticles.forEach(p => {
        p.angle += p.speed;
        p.alpha = 0.1 + 0.1 * Math.sin(time * 0.02 + p.pulseOffset);
    });
}

function drawParticles(time) {
    if (!config.showParticles) return;
    // Ambient (Magical dust)
    ctx.fillStyle = config.accentColor;
    ambientParticles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(centerX + Math.cos(p.angle) * p.dist, centerY + Math.sin(p.angle) * p.dist, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    // Trail (Sparkles)
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.isSparkle ? '#fff' : config.primaryColor;
        if (p.isSparkle && Math.sin(time * 0.2) > 0) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 2);
            ctx.lineTo(0, p.size * 2);
            ctx.moveTo(-p.size * 2, 0);
            ctx.lineTo(p.size * 2, 0);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.globalAlpha = 1;
}

function drawBezel() {
    // Elegant Gold Bezel
    const grad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    grad.addColorStop(0, '#d4af37'); // Metallic gold
    grad.addColorStop(0.3, '#f9f295'); // Bright gold
    grad.addColorStop(0.5, '#e6be8a'); // Warm gold
    grad.addColorStop(0.7, '#b8860b'); // Dark gold
    grad.addColorStop(1, '#996515'); // Golden brown

    // Outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.97, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Inner rim
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawFace(rot) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rot);

    // Deep Winter Blue Face
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.9);
    g.addColorStop(0, '#1a2a44');
    g.addColorStop(1, '#050a14');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Markers
    for (let i = 0; i < 60; i++) {
        const a = i * 6 * Math.PI / 180;
        const isHour = i % 5 === 0;
        const r1 = isHour ? radius * 0.72 : radius * 0.78;
        const r2 = radius * 0.82;

        ctx.strokeStyle = isHour ? config.accentColor : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = isHour ? 3 : 1;
        ctx.lineCap = 'round';

        if (isHour) {
            // Draw a small diamond/star for hour markers
            ctx.save();
            ctx.translate(Math.sin(a) * ((r1 + r2) / 2), -Math.cos(a) * ((r1 + r2) / 2));
            ctx.rotate(a);
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(2, 0);
            ctx.lineTo(0, 4);
            ctx.lineTo(-2, 0);
            ctx.closePath();
            ctx.fillStyle = config.accentColor;
            ctx.fill();
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1);
            ctx.lineTo(Math.sin(a) * r2, -Math.cos(a) * r2);
            ctx.stroke();
        }
    }

    // Numbers
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${Math.round(radius * 0.1)}px "Segoe UI", Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
        const a = i * 30 * Math.PI / 180;
        const r = radius * 0.62;
        const x = Math.sin(a) * r;
        const y = -Math.cos(a) * r;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-rot);
        ctx.fillText(i.toString(), 0, 0);
        ctx.restore();
    }
    ctx.restore();
}

function drawHands(hour, min, rot) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rot);

    // Hour (Warm White)
    ctx.save();
    ctx.rotate(hour);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = radius * 0.035;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.05);
    ctx.lineTo(0, -radius * 0.42);
    ctx.stroke();
    // Inner line for elegance
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.38);
    ctx.stroke();
    ctx.restore();

    // Minute (Warm White)
    ctx.save();
    ctx.rotate(min);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = radius * 0.025;
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.08);
    ctx.lineTo(0, -radius * 0.62);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
}

function drawSecondHand() {
    ctx.save();
    ctx.translate(centerX, centerY);

    // Festive Red Second Hand
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = radius * 0.012;
    ctx.lineCap = 'round';

    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(0, radius * 0.12);
    ctx.lineTo(0, -radius * 0.7);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawCenterCap() {
    // Gold cap
    ctx.fillStyle = '#8b4513'; // Deep brown base
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.045, 0, Math.PI * 2);
    ctx.fill();

    const capGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.04);
    capGrad.addColorStop(0, '#f9f295');
    capGrad.addColorStop(1, '#b8860b');
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.04, 0, Math.PI * 2);
    ctx.fill();
}

function drawSecondTip(s) {
    if (!config.showSecondTip) return;
    ctx.save();
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.font = `bold ${Math.round(radius * 0.09)}px "Segoe UI", Arial`;
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.toString().padStart(2, '0'), centerX, centerY - radius * 0.78);
    ctx.restore();
}

function drawDigital(time, rot) {
    if (!config.showDigital) return;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rot);

    // Festive display
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.beginPath();
    ctx.roundRect(-radius * 0.25, radius * 0.28, radius * 0.5, radius * 0.12, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.stroke();

    ctx.font = `600 ${Math.round(radius * 0.075)}px "Consolas", monospace`;
    ctx.fillStyle = '#ffd700'; // Gold time
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(time, 0, radius * 0.34);
    ctx.restore();
}

let frame = 0;
function draw() {
    frame++;
    const now = new Date();
    const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds(), ms = now.getMilliseconds();
    const secA = (s * 6 + ms * 0.006) * Math.PI / 180;
    const minA = (m * 6 + s * 0.1) * Math.PI / 180;
    const hourA = (h * 30 + m * 0.5) * Math.PI / 180;
    const faceRot = -secA;

    if (frame % 3 === 0) spawnParticle();
    updateParticles(frame);
    updateSnow();

    // Night Sky Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#050a1b');
    bgGrad.addColorStop(1, '#0a1a35');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSnow();
    drawParticles(frame);
    drawBezel();
    drawFace(faceRot);
    drawDigital(now.toTimeString().slice(0, 8), faceRot);
    drawHands(hourA, minA, faceRot);
    drawSecondHand();
    drawCenterCap();
    drawSecondTip(s);

    requestAnimationFrame(draw);
}

resize();
window.addEventListener('resize', resize);
draw();

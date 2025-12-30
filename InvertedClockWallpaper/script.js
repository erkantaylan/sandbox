// Inverted Analog Clock for Wallpaper Engine
// The clock face rotates while the second hand stays fixed pointing north

const canvas = document.getElementById('clock');
const ctx = canvas.getContext('2d');

// Configuration (can be overridden by Wallpaper Engine properties)
let config = {
    primaryColor: '#ff4757',      // Second hand / accents
    accentColor: '#00d4ff',       // Minute hand / glow
    hourHandColor: '#ffffff',
    faceColor: '#0d1525',
    bezelColor: '#2a2a35',
    showDigital: true,
    showSecondTip: true
};

// Clock dimensions
let centerX, centerY, radius;

// Resize canvas to fill screen
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clock size based on smaller dimension
    const size = Math.min(canvas.width, canvas.height) * 0.7;
    radius = size / 2;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
}

// Wallpaper Engine property listener
window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
        if (properties.primarycolor) {
            const c = properties.primarycolor.value.split(' ').map(v => Math.round(v * 255));
            config.primaryColor = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        }
        if (properties.accentcolor) {
            const c = properties.accentcolor.value.split(' ').map(v => Math.round(v * 255));
            config.accentColor = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        }
        if (properties.showdigital !== undefined) {
            config.showDigital = properties.showdigital.value;
        }
        if (properties.showsecondtip !== undefined) {
            config.showSecondTip = properties.showsecondtip.value;
        }
    }
};

// Draw functions
function drawBezel() {
    // Outer shadow
    const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.85, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Metallic bezel
    const bezelGrad = ctx.createLinearGradient(
        centerX - radius, centerY - radius,
        centerX + radius, centerY + radius
    );
    bezelGrad.addColorStop(0, '#4a4a5a');
    bezelGrad.addColorStop(0.3, '#2a2a35');
    bezelGrad.addColorStop(0.5, '#1a1a25');
    bezelGrad.addColorStop(0.7, '#2a2a35');
    bezelGrad.addColorStop(1, '#4a4a5a');

    ctx.fillStyle = bezelGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.97, 0, Math.PI * 2);
    ctx.fill();

    // Glow ring
    ctx.strokeStyle = config.accentColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawFace(rotation) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);

    // Face background
    const faceGrad = ctx.createRadialGradient(
        centerX - radius * 0.2, centerY - radius * 0.2, 0,
        centerX, centerY, radius * 0.9
    );
    faceGrad.addColorStop(0, '#1e2a4a');
    faceGrad.addColorStop(0.7, '#0d1525');
    faceGrad.addColorStop(1, '#080c15');

    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow ring
    ctx.strokeStyle = config.accentColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Draw markers
    for (let i = 0; i < 60; i++) {
        const angle = (i * 6) * Math.PI / 180;
        const isHour = i % 5 === 0;

        const innerR = isHour ? radius * 0.72 : radius * 0.78;
        const outerR = radius * 0.82;

        const x1 = centerX + innerR * Math.sin(angle);
        const y1 = centerY - innerR * Math.cos(angle);
        const x2 = centerX + outerR * Math.sin(angle);
        const y2 = centerY - outerR * Math.cos(angle);

        ctx.strokeStyle = isHour ? '#ffffff' : 'rgba(200,200,220,0.3)';
        ctx.lineWidth = isHour ? 3 : 1;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Draw hour numbers (counter-rotate to stay upright)
    ctx.font = `${radius * 0.1}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 1; i <= 12; i++) {
        const angle = (i * 30) * Math.PI / 180;
        const textR = radius * 0.65;
        const x = centerX + textR * Math.sin(angle);
        const y = centerY - textR * Math.cos(angle);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-rotation); // Counter-rotate to keep text upright!
        ctx.fillText(i.toString(), 0, 0);
        ctx.restore();
    }

    ctx.restore();
}

function drawHands(hourAngle, minuteAngle, faceRotation) {
    // Hour and minute hands rotate with the face
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(faceRotation);
    ctx.translate(-centerX, -centerY);

    // Hour hand
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(hourAngle);

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.strokeStyle = config.hourHandColor;
    ctx.lineWidth = radius * 0.03;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.45);
    ctx.stroke();
    ctx.restore();

    // Minute hand
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(minuteAngle);

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = radius * 0.02;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.65);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
}

function drawSecondHand() {
    // Second hand is STATIONARY - always points up!
    ctx.save();
    ctx.translate(centerX, centerY);

    // Glow effect
    ctx.shadowColor = config.primaryColor;
    ctx.shadowBlur = 15;

    ctx.strokeStyle = config.primaryColor;
    ctx.lineWidth = radius * 0.01;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.1); // Tail
    ctx.lineTo(0, -radius * 0.72);
    ctx.stroke();

    ctx.restore();
}

function drawCenterCap() {
    // Outer cap
    const capGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.04);
    capGrad.addColorStop(0, '#505060');
    capGrad.addColorStop(0.7, '#303040');
    capGrad.addColorStop(1, '#202030');

    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Inner red dot
    ctx.shadowColor = config.primaryColor;
    ctx.shadowBlur = 10;

    const dotGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.015);
    dotGrad.addColorStop(0, config.primaryColor);
    dotGrad.addColorStop(1, '#c92a39');

    ctx.fillStyle = dotGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.015, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
}

function drawSecondTip(seconds) {
    if (!config.showSecondTip) return;

    // Second number at the tip of the second hand (fixed at top)
    const tipY = centerY - radius * 0.78;

    ctx.shadowColor = config.primaryColor;
    ctx.shadowBlur = 10;

    ctx.font = `bold ${radius * 0.08}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = config.primaryColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(seconds.toString().padStart(2, '0'), centerX, tipY);

    ctx.shadowBlur = 0;
}

function drawDigitalTime(time, faceRotation) {
    if (!config.showDigital) return;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(faceRotation);

    // Position relative to rotated face
    const y = radius * 0.35;

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.roundRect(-radius * 0.25, y - radius * 0.06, radius * 0.5, radius * 0.12, 5);
    ctx.fill();

    // Time text (counter-rotate to stay readable... or let it spin!)
    ctx.font = `${radius * 0.08}px 'Consolas', monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(time, 0, y);

    ctx.restore();
}

function draw() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const millis = now.getMilliseconds();

    // Smooth angles
    const secondAngle = (seconds * 6 + millis * 0.006) * Math.PI / 180;
    const minuteAngle = (minutes * 6 + seconds * 0.1) * Math.PI / 180;
    const hourAngle = (hours * 30 + minutes * 0.5) * Math.PI / 180;

    // Face rotates OPPOSITE to seconds (this is the wild part!)
    const faceRotation = -secondAngle;

    // Clear
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw everything
    drawBezel();
    drawFace(faceRotation);
    drawDigitalTime(now.toTimeString().slice(0, 8), faceRotation);
    drawHands(hourAngle, minuteAngle, faceRotation);
    drawSecondHand();
    drawCenterCap();
    drawSecondTip(seconds);

    requestAnimationFrame(draw);
}

// Initialize
resize();
window.addEventListener('resize', resize);
draw();

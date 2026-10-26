'use strict';
const canvas = document.querySelector('#flight');
const ctx = canvas.getContext('2d');
const pauseButton = document.querySelector('#pause');
const contextButton = document.querySelector('#context');
const sampleInput = document.querySelector('#samples');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let mode = 'observe';
let progress = 0;
let lastFrame = null;
let paused = reducedMotion.matches;
let environmentVisible = false;
let width = 0;
let height = 0;

function resize() {
  const bounds = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  width = bounds.width;
  height = bounds.height;
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}
new ResizeObserver(resize).observe(canvas);

function positionAt(value) {
  return { x: width * (0.89 - 0.59 * value), y: height * (0.48 + 0.085 * Math.sin(value * 5.7)) };
}

function drawBird(x, y, phase, opacity = 1) {
  const size = width < 600 ? 15 : 22;
  const wing = Math.sin(phase) * size;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = '#252a29';
  ctx.fillStyle = '#252a29';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.48, size * 0.16, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-size * 0.43, -size * 0.08, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.53, -size * 0.08);
  ctx.lineTo(-size * 0.76, -size * 0.01);
  ctx.lineTo(-size * 0.53, size * 0.03);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, 0);
  ctx.quadraticCurveTo(size * 0.1, -wing * 0.55 - 4, size * 0.55, -wing - size * 0.25);
  ctx.quadraticCurveTo(size * 0.25, -wing * 0.24, size * 0.18, size * 0.05);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -1);
  ctx.quadraticCurveTo(size * 0.4, -wing * 0.45, size * 0.92, -wing * 0.72 - size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.32, 0);
  ctx.lineTo(size * 0.95, size * 0.26);
  ctx.lineTo(size * 0.7, -size * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawObserver() {
  const x = width * 0.12;
  const y = height * 0.83;
  ctx.save();
  ctx.strokeStyle = '#454842';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y - 35, 7, 0, Math.PI * 2);
  ctx.moveTo(x, y - 28);
  ctx.lineTo(x - 3, y);
  ctx.lineTo(x - 13, y + 22);
  ctx.moveTo(x - 3, y);
  ctx.lineTo(x + 7, y + 22);
  ctx.moveTo(x, y - 22);
  ctx.lineTo(x + 13, y - 34);
  ctx.lineTo(x + 8, y - 40);
  ctx.stroke();
  ctx.fillStyle = '#454842';
  ctx.fillRect(x + 5, y - 43, 9, 4);
  ctx.restore();
  return { x: x + 12, y: y - 42 };
}

function drawEnvironment() {
  ctx.save();
  const horizon = height * 0.88;
  ctx.strokeStyle = '#9b9c8966';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.bezierCurveTo(width * 0.23, height * 0.81, width * 0.5, height * 0.95, width, horizon - 7);
  ctx.stroke();
  ctx.strokeStyle = '#92978480';
  for (let i = 0; i < 16; i++) {
    const x = width * (0.43 + i * 0.032);
    const y = horizon + 2 + Math.sin(i * 0.6) * 5;
    const stem = 10 + (i % 4) * 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 2, y - stem / 2, x + 3, y - stem);
    ctx.moveTo(x, y - stem * 0.4);
    ctx.lineTo(x - 6, y - stem * 0.7);
    ctx.moveTo(x + 1, y - stem * 0.65);
    ctx.lineTo(x + 8, y - stem * 0.85);
    ctx.stroke();
  }
  ctx.strokeStyle = '#9fa9aa88';
  for (let i = 0; i < 3; i++) {
    const x = width * (0.54 + i * 0.065);
    const y = height * (0.65 + i * 0.03);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 15, y - 8, x + 35, y + 8, x + 57, y - 3);
    ctx.stroke();
  }
  ctx.restore();
}

const lensText = {
  observe: {
    title: 'What do you see?',
    note: 'Start with the movement itself. What makes you want to explain it?',
    color: '#252a29'
  },
  messenger: {
    title: 'A messenger from the sky?',
    note: 'This lens evokes the belief discussed in class. Notice how a question can turn a movement into a sign.',
    color: '#986523'
  },
  motion: {
    title: 'How do its wings move?',
    note: 'Compare the recorded poses. Knowing where the bird moved does not establish why it moved.',
    color: '#234f85'
  }
};

document.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', () => {
    mode = button.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const text = lensText[mode];
    document.querySelector('#q').textContent = text.title;
    document.querySelector('#mode-note').textContent = text.note;
    document.querySelector('#sample-control').hidden = mode !== 'motion';
    document.querySelector('.question').style.color = text.color;
  });
});

contextButton.addEventListener('click', () => {
  environmentVisible = !environmentVisible;
  contextButton.setAttribute('aria-pressed', String(environmentVisible));
  contextButton.textContent = environmentVisible ? 'Hide environment' : 'Show environment';
});

function updatePauseLabel() {
  pauseButton.textContent = paused ? 'Play' : 'Pause';
  pauseButton.setAttribute('aria-label', paused ? 'Play the flight animation' : 'Pause the flight animation');
}
updatePauseLabel();
pauseButton.addEventListener('click', () => { paused = !paused; updatePauseLabel(); });
document.querySelector('#reset').addEventListener('click', () => { progress = 0; });
sampleInput.addEventListener('input', () => { document.querySelector('#count').value = sampleInput.value; });
reducedMotion.addEventListener('change', event => { if (event.matches) { paused = true; updatePauseLabel(); } });
document.addEventListener('visibilitychange', () => { lastFrame = null; });

function drawMotionRecord() {
  const count = Number(sampleInput.value);
  ctx.save();
  ctx.strokeStyle = '#234f8566';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 6]);
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const point = positionAt(i / (count - 1));
    if (i) ctx.lineTo(point.x, point.y); else ctx.moveTo(point.x, point.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < count; i++) {
    const value = i / (count - 1);
    const point = positionAt(value);
    drawBird(point.x, point.y, value * Math.PI * 12, 0.2);
    ctx.fillStyle = '#234f85';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '10px monospace';
    ctx.fillText(String(i + 1).padStart(2, '0'), point.x - 5, point.y + 36);
  }
  ctx.restore();
}

function frame(timestamp) {
  if (lastFrame !== null && !paused) progress = (progress + Math.min(timestamp - lastFrame, 80) / 14000) % 1;
  lastFrame = timestamp;
  ctx.clearRect(0, 0, width, height);
  if (environmentVisible) drawEnvironment();
  const eye = drawObserver();
  const point = positionAt(progress);
  if (mode === 'messenger') {
    ctx.save();
    ctx.strokeStyle = '#98652377';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(eye.x, eye.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.strokeStyle = '#98652355';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 35, Math.PI * 1.08, Math.PI * 1.9);
    ctx.stroke();
    ctx.restore();
  }
  if (mode === 'motion') drawMotionRecord();
  drawBird(point.x, point.y, progress * Math.PI * 12);
  window.requestAnimationFrame(frame);
}
resize();
window.requestAnimationFrame(frame);

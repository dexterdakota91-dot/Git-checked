import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const width = 1024;
const height = 1024;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#0f172a'); // slate-900
gradient.addColorStop(1, '#020617'); // slate-950
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Draw a glowing abstract "A" / Aetheris shape
ctx.save();
ctx.translate(width / 2, height / 2);

// Outer glow
ctx.shadowColor = '#0066FF'; // blue-500
ctx.shadowBlur = 100;

// Main shape
ctx.beginPath();
ctx.moveTo(0, -250);
ctx.lineTo(250, 250);
ctx.lineTo(100, 250);
ctx.lineTo(0, 50);
ctx.lineTo(-100, 250);
ctx.lineTo(-250, 250);
ctx.closePath();

const shapeGradient = ctx.createLinearGradient(-250, -250, 250, 250);
shapeGradient.addColorStop(0, '#34d399'); // emerald-400
shapeGradient.addColorStop(1, '#a855f7'); // purple-500

ctx.fillStyle = shapeGradient;
ctx.fill();

// Inner accent
ctx.beginPath();
ctx.moveTo(0, -100);
ctx.lineTo(100, 100);
ctx.lineTo(-100, 100);
ctx.closePath();
ctx.fillStyle = '#ffffff';
ctx.fill();

ctx.restore();

// Save to file
const buffer = canvas.toBuffer('image/png');
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, 'icon.png'), buffer);
console.log('Icon generated successfully at public/icon.png');

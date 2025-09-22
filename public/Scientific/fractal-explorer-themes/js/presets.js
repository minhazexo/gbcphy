
// js/presets.js
import { buildPalette } from './utils.js';

export const VIEW_PRESETS = [
  { name: 'Full Set', center: [-0.5, 0.0], scale: 3.2 },
  { name: 'Seahorse Valley', center: [-0.743643887037151, 0.131825904205330], scale: 0.0028 },
  { name: 'Elephant Valley', center: [0.285, 0.01], scale: 0.05 },
  { name: 'Triple Spiral', center: [-0.088, 0.654], scale: 0.0065 },
  { name: 'Spiral Nebula', center: [-0.761574, 0.0847596], scale: 0.005 },
  { name: 'Cusp (Main cardioid)', center: [0.25, 0.0], scale: 0.5 },
  { name: 'Valley of the Snail', center: [-0.7435, 0.1314], scale: 0.0008 },
  { name: 'Tuning (Small copy)', center: [-1.748, 0.0], scale: 0.05 },
];

export const JULIA_PRESETS = [
  { name: 'Classic: -0.8 + 0.156i', c: [-0.8, 0.156] },
  { name: 'Rabbit: -0.122 + 0.745i', c: [-0.122, 0.745] },
  { name: 'Dendrite: -0.74543 + 0.11301i', c: [-0.74543, 0.11301] },
  { name: 'Spiral: 0.285 + 0.01i', c: [0.285, 0.01] },
  { name: 'Flower: -0.4 + 0.6i', c: [-0.4, 0.6] },
  { name: 'Circles: 0.355 + 0.355i', c: [0.355, 0.355] },
];

export const PALETTES = {
  'Aurora': ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
  'Inferno': ['#000004', '#320a5a', '#781c6d', '#bb3654', '#fc7f3f', '#f9fd5a'],
  'Neon Nights': ['#000764', '#2068CB', '#EDFFFF', '#FFA500', '#ff2a68', '#000200'],
  'Retro Sun': ['#2b1055', '#7597de', '#f1f1e6', '#ffad5a', '#ff6b6b', '#2b1055'],
  'Monochrome': ['#000000', '#333333', '#777777', '#bbbbbb', '#ffffff'],
  'Emerald': ['#001219', '#005f73', '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00', '#ca6702'],
  'Magma': ['#000000','#1b0b0f','#431118','#7a1e22','#c73e1d','#ff7f11','#ffd166','#ffffff'],
  'Cyanotype': ['#001219','#0a9396','#94d2bd','#e9d8a6','#ee9b00','#ca6702','#bb3e03','#ae2012'],
};

export const THEMES = [
  { name: 'Aurora (Dark)', className: 'theme-aurora', palette: 'Neon Nights' },
  { name: 'Midnight Neon', className: 'theme-neon', palette: 'Neon Nights' },
  { name: 'Solar Dawn', className: 'theme-solar', palette: 'Retro Sun' },
  { name: 'Retro CRT', className: 'theme-retro', palette: 'Magma' },
  { name: 'Minimal Light', className: 'theme-light', palette: 'Aurora' },
  { name: 'AMOLED Black', className: 'theme-amoled', palette: 'Emerald' },
];

export function makePalette(name, size=256){ const stops = PALETTES[name] || PALETTES['Aurora']; return buildPalette(stops, size); }

export const DEFAULTS = {
  view: VIEW_PRESETS[0], paletteName: 'Neon Nights', iter: 600, colorScale: 5.0, smooth: true, quality: 2.0,
  mode: 'mandelbrot', juliaC: [-0.8, 0.156], colorMode: 0, paletteOffset: 0, trapParam: [0.25, 6.0], theme: 'theme-aurora',
};

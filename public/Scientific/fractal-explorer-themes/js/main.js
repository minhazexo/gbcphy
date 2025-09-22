
// js/main.js
import { Renderer } from './renderer.js';
import { Controls } from './controls.js';
import { Minimap } from './minimap.js';
import { VIEW_PRESETS, DEFAULTS, makePalette, PALETTES, JULIA_PRESETS, THEMES } from './presets.js';
import { FPSMeter, formatCenterZoom, downloadBlob } from './utils.js';

const canvas = document.getElementById('glcanvas');
const gridOverlay = document.getElementById('gridOverlay');
const minimapCanvas = document.getElementById('minimap');
const minimapViewport = document.getElementById('minimap-viewport');

const modeSelect = document.getElementById('modeSelect');
const iterEl = document.getElementById('iter');
const iterVal = document.getElementById('iterVal');
const colorScaleEl = document.getElementById('colorScale');
const scaleVal = document.getElementById('scaleVal');
const smoothEl = document.getElementById('smoothColor');
const iterByZoomEl = document.getElementById('iterByZoom');
const contZoomEl = document.getElementById('contZoom');
const presetSelect = document.getElementById('presetSelect');
const paletteSelect = document.getElementById('paletteSelect');
const themeSelect = document.getElementById('themeSelect');
const colorModeSelect = document.getElementById('colorModeSelect');
const qualitySelect = document.getElementById('qualitySelect');
const btnGoPreset = document.getElementById('btnGoPreset');
const btnReset = document.getElementById('btnReset');
const btnShare = document.getElementById('btnShare');
const btnScreenshot = document.getElementById('btnScreenshot');
const btnExport4K = document.getElementById('btnExport4K');
const coordEl = document.getElementById('coord');
const zoomEl = document.getElementById('zoomLevel');
const fpsEl = document.getElementById('fps');
const rendererTypeEl = document.getElementById('rendererType');
const gridToggleEl = document.getElementById('gridToggle');

// Julia UI
const juliaSection = document.getElementById('juliaSection');
const juliaReEl = document.getElementById('juliaRe');
const juliaImEl = document.getElementById('juliaIm');
const juliaPresetEl = document.getElementById('juliaPreset');
const btnJuliaFromCenter = document.getElementById('btnJuliaFromCenter');

const animColorsEl = document.getElementById('animColors');
const animSpeedEl = document.getElementById('animSpeed');

// Populate selects
for (const p of VIEW_PRESETS) { const opt=document.createElement('option'); opt.value=p.name; opt.textContent=p.name; presetSelect.appendChild(opt); }
for (const jp of JULIA_PRESETS) { const opt=document.createElement('option'); opt.value=jp.name; opt.textContent=jp.name; juliaPresetEl.appendChild(opt); }
for (const name of Object.keys(PALETTES)) { const opt=document.createElement('option'); opt.value=name; opt.textContent=name; paletteSelect.appendChild(opt); }
for (const t of THEMES) { const opt=document.createElement('option'); opt.value=t.className; opt.textContent=t.name; themeSelect.appendChild(opt); }

// Restore from URL
function parseHash(){ if(location.hash.length>1){ try{ return JSON.parse(decodeURIComponent(location.hash.slice(1))); }catch{} } return null; }
const saved = parseHash();

let state = {
  center: saved?.center ?? [...DEFAULTS.view.center],
  scale: saved?.scale ?? DEFAULTS.view.scale,
  iter: saved?.iter ?? DEFAULTS.iter,
  smooth: saved?.smooth ?? DEFAULTS.smooth,
  colorScale: saved?.colorScale ?? DEFAULTS.colorScale,
  autoZoom: false,
  mode: saved?.mode ?? DEFAULTS.mode,
  juliaC: saved?.juliaC ?? [...DEFAULTS.juliaC],
  colorMode: saved?.colorMode ?? DEFAULTS.colorMode,
  paletteOffset: saved?.paletteOffset ?? DEFAULTS.paletteOffset,
  trapParam: saved?.trapParam ?? [...DEFAULTS.trapParam],
  theme: saved?.theme ?? DEFAULTS.theme,
  iterByZoom: saved?.iterByZoom ?? false,
  grid: saved?.grid ?? false,
};

let palette = makePalette(DEFAULTS.paletteName, 256);
const renderer = new Renderer(canvas, { palette });
rendererTypeEl.textContent = renderer.type + (renderer.type === 'WEBGL' ? '2' : ' (CPU Fallback)');
renderer.setPalette(palette);
renderer.setQuality(saved?.quality ?? DEFAULTS.quality);

const fps = new FPSMeter(fpsEl);
const minimap = new Minimap(minimapCanvas, minimapViewport);
minimap.setPalette(palette);

// UI init
iterEl.value = state.iter; iterVal.textContent = state.iter;
colorScaleEl.value = state.colorScale; scaleVal.textContent = state.colorScale.toFixed(2);
smoothEl.checked = state.smooth; modeSelect.value = state.mode; colorModeSelect.value = String(state.colorMode);
qualitySelect.value = String(saved?.quality ?? DEFAULTS.quality);
juliaReEl.value = state.juliaC[0]; juliaImEl.value = state.juliaC[1]; juliaSection.style.display = state.mode==='julia' ? 'block':'none';
presetSelect.value = VIEW_PRESETS[0].name; themeSelect.value = state.theme; gridToggleEl.checked = state.grid; document.body.className = state.theme;
animColorsEl.checked = Boolean(saved?.animColors ?? true); animSpeedEl.value = saved?.animSpeed ?? 0.3;
iterByZoomEl.checked = state.iterByZoom;

function pushHash(){ const obj={ center:state.center, scale:state.scale, iter:state.iter, colorScale:state.colorScale, smooth:state.smooth, quality:Number(qualitySelect.value), mode:state.mode, juliaC:state.juliaC, colorMode:state.colorMode, paletteOffset:state.paletteOffset, trapParam:state.trapParam, theme:state.theme, iterByZoom:state.iterByZoom, grid:state.grid, animColors:animColorsEl.checked, animSpeed:Number(animSpeedEl.value) }; history.replaceState(null,'','#'+encodeURIComponent(JSON.stringify(obj))); }

// Event bindings
paletteSelect.addEventListener('change',()=>{ palette = makePalette(paletteSelect.value,256); renderer.setPalette(palette); minimap.setPalette(palette); minimap.rendered=false; });
qualitySelect.addEventListener('change',()=>{ renderer.setQuality(Number(qualitySelect.value)); resizeCanvas(); });
modeSelect.addEventListener('change',()=>{ state.mode = modeSelect.value; juliaSection.style.display = state.mode==='julia' ? 'block':'none'; pushHash(); });
colorModeSelect.addEventListener('change',()=>{ state.colorMode = parseInt(colorModeSelect.value,10); pushHash(); });
iterEl.addEventListener('input',()=>{ state.iter = parseInt(iterEl.value,10); iterVal.textContent = state.iter; });
colorScaleEl.addEventListener('input',()=>{ state.colorScale = parseFloat(colorScaleEl.value); scaleVal.textContent = state.colorScale.toFixed(2); });
smoothEl.addEventListener('change',()=>{ state.smooth = smoothEl.checked; });
iterByZoomEl.addEventListener('change',()=>{ state.iterByZoom = iterByZoomEl.checked; });
contZoomEl.addEventListener('change',()=>{ state.autoZoom = contZoomEl.checked; });

themeSelect.addEventListener('change',()=>{ state.theme = themeSelect.value; document.body.className = state.theme; // optionally auto-switch palette
  const t = THEMES.find(x=>x.className===state.theme); if(t){ paletteSelect.value = t.palette; palette = makePalette(t.palette,256); renderer.setPalette(palette); minimap.setPalette(palette); minimap.rendered=false; }
  pushHash();
});

gridToggleEl.addEventListener('change',()=>{ state.grid = gridToggleEl.checked; gridOverlay.hidden = !state.grid; pushHash(); });

btnGoPreset.addEventListener('click',()=>{ const p=VIEW_PRESETS.find(x=>x.name===presetSelect.value)??VIEW_PRESETS[0]; state.center=[...p.center]; state.scale=p.scale; syncInfo(); pushHash(); });

// Julia controls
juliaPresetEl.addEventListener('change',()=>{ const jp=JULIA_PRESETS.find(x=>x.name===juliaPresetEl.value); if(jp){ state.juliaC=[...jp.c]; juliaReEl.value=state.juliaC[0]; juliaImEl.value=state.juliaC[1]; pushHash(); } });
juliaReEl.addEventListener('input',()=>{ state.juliaC[0]=parseFloat(juliaReEl.value); pushHash(); });
juliaImEl.addEventListener('input',()=>{ state.juliaC[1]=parseFloat(juliaImEl.value); pushHash(); });
btnJuliaFromCenter.addEventListener('click',()=>{ state.juliaC=[state.center[0],state.center[1]]; juliaReEl.value=state.juliaC[0]; juliaImEl.value=state.juliaC[1]; pushHash(); });
canvas.addEventListener('contextmenu',(e)=>{ e.preventDefault(); const rect=canvas.getBoundingClientRect(); const px=(e.clientX-rect.left)/rect.width; const py=(e.clientY-rect.top)/rect.height; const aspect=canvas.clientWidth/canvas.clientHeight; const x=state.center[0]+(px-0.5)*state.scale*aspect; const y=state.center[1]+(py-0.5)*state.scale; state.juliaC=[x,y]; juliaReEl.value=x.toFixed(6); juliaImEl.value=y.toFixed(6); if(state.mode!=='julia'){ state.mode='julia'; modeSelect.value='julia'; juliaSection.style.display='block'; } pushHash(); });

btnReset.addEventListener('click',()=>{ const d=DEFAULTS.view; state.center=[...d.center]; state.scale=d.scale; state.iter=DEFAULTS.iter; state.colorScale=DEFAULTS.colorScale; state.smooth=DEFAULTS.smooth; state.mode=DEFAULTS.mode; state.juliaC=[...DEFAULTS.juliaC]; state.colorMode=DEFAULTS.colorMode; state.paletteOffset=DEFAULTS.paletteOffset; state.trapParam=[...DEFAULTS.trapParam]; state.theme=DEFAULTS.theme; state.iterByZoom=false; state.grid=false; document.body.className=state.theme; gridOverlay.hidden=true; iterEl.value=state.iter; iterVal.textContent=state.iter; colorScaleEl.value=state.colorScale; scaleVal.textContent=state.colorScale.toFixed(2); smoothEl.checked=state.smooth; modeSelect.value=state.mode; colorModeSelect.value=String(state.colorMode); juliaReEl.value=state.juliaC[0]; juliaImEl.value=state.juliaC[1]; juliaSection.style.display=state.mode==='julia'?'block':'none'; themeSelect.value=state.theme; syncInfo(); pushHash(); });

btnShare.addEventListener('click', async ()=>{ const url=new URL(location.href); url.hash=encodeURIComponent(JSON.stringify({ center:state.center, scale:state.scale, iter:state.iter, colorScale:state.colorScale, smooth:state.smooth, quality:Number(qualitySelect.value), mode:state.mode, juliaC:state.juliaC, colorMode:state.colorMode, paletteOffset:state.paletteOffset, trapParam:state.trapParam, theme:state.theme, iterByZoom:state.iterByZoom, grid:state.grid, animColors:animColorsEl.checked, animSpeed:Number(animSpeedEl.value) })); try{ await navigator.clipboard.writeText(url.toString()); btnShare.textContent='Copied!'; setTimeout(()=>btnShare.textContent='Share View',800);}catch{ alert(url.toString()); } });

btnScreenshot.addEventListener('click',()=>{ canvas.toBlob((b)=>{ if(b) downloadBlob('fractal.png',b); },'image/png',1.0); });

btnExport4K.addEventListener('click', async ()=>{ const targetW=3840, targetH=2160; const prev={ w:canvas.width, h:canvas.height, styleW:canvas.style.width, styleH:canvas.style.height }; canvas.style.width=targetW+'px'; canvas.style.height=targetH+'px'; renderer.quality=1; // use exact size
  canvas.width=targetW; canvas.height=targetH; renderFrame(true); await new Promise(r=>setTimeout(r,50)); canvas.toBlob((b)=>{ if(b) downloadBlob('fractal-4k.png',b); restore(); },'image/png',1.0);
  function restore(){ canvas.style.width=prev.styleW; canvas.style.height=prev.styleH; canvas.width=prev.w; canvas.height=prev.h; }
});

const controls = new Controls(canvas, (update)=>{ Object.assign(state, update); syncInfo(); }, ()=>({ center:state.center, scale:state.scale }));
minimapCanvas.parentElement.addEventListener('minimap-move', (e)=>{ const [x,y]=e.detail.world; state.center=[x,y]; syncInfo(); });

function resizeCanvas(){ const rect=canvas.getBoundingClientRect(); if(canvas.clientWidth!==rect.width||canvas.clientHeight!==rect.height){ canvas.style.width=rect.width+'px'; canvas.style.height=rect.height+'px'; } renderer.resize(); }
const ro=new ResizeObserver(()=>resizeCanvas()); ro.observe(document.getElementById('app')); resizeCanvas();

function syncInfo(){ const { c, zoom } = formatCenterZoom(state.center, state.scale); coordEl.textContent=c; zoomEl.textContent=zoom; }

function renderFrame(once=false){
  let iter = state.iter;
  const zoom = 3.5 / state.scale;
  if (state.iterByZoom) { const factor = Math.max(1, Math.log10(zoom+1) * 1.6); iter = Math.min(12000, Math.floor(iter * factor)); }
  renderer.render({ center:state.center, scale:state.scale, iter, smooth:state.smooth, colorScale:state.colorScale, mode:state.mode, juliaC:state.juliaC, colorMode:state.colorMode, paletteOffset:state.paletteOffset, trapParam:state.trapParam });
  if(!once){ fps.frame(); syncInfo(); pushHash(); minimap.ensureRendered(); minimap.updateViewport({ center:state.center, scale:state.scale, canvasW:canvas.clientWidth, canvasH:canvas.clientHeight }); }
}

let t0 = performance.now();
function tick(now){ const dt=Math.min(0.033,(now-t0)/1000); t0=now; if(state.autoZoom){ state.scale*=Math.pow(0.998,60*dt); }
  if(animColorsEl.checked){ state.paletteOffset = (state.paletteOffset + Number(animSpeedEl.value)*dt) % 1; }
  renderFrame(); requestAnimationFrame(tick); }
requestAnimationFrame(tick);

syncInfo();

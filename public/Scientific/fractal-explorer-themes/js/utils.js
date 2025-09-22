
// js/utils.js
export const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function hexToRgb(hex) { const s = hex.replace('#', ''); const bigint = parseInt(s.length === 3 ? s.split('').map(x => x + x).join('') : s, 16); return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]; }
export function buildPalette(stops, size = 256) {
  const palette = new Uint8Array(size * 4);
  const points = stops.map(c => Array.isArray(c) ? [c[0], hexToRgb(c[1])] : [null, hexToRgb(c)]);
  const ps = points.map((p, i) => p[0] != null ? p[0] : (i / (points.length - 1)));
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);
    let j = 0; while (j < ps.length - 1 && !(ps[j] <= t && t <= ps[j + 1])) j++;
    const t0 = ps[j], t1 = ps[j + 1] ?? 1;
    const local = (t1 - t0) > 1e-6 ? (t - t0) / (t1 - t0) : 0;
    const c0 = points[j][1], c1 = points[Math.min(j + 1, points.length - 1)][1];
    const r = Math.round(lerp(c0[0], c1[0], local));
    const g = Math.round(lerp(c0[1], c1[1], local));
    const b = Math.round(lerp(c0[2], c1[2], local));
    palette[i * 4 + 0] = r; palette[i * 4 + 1] = g; palette[i * 4 + 2] = b; palette[i * 4 + 3] = 255;
  }
  return palette;
}
export class FPSMeter { constructor(el){ this.el=el; this._last=performance.now(); this._frames=0; this._fps=0; } frame(){ this._frames++; const now=performance.now(); if(now-this._last>=500){ this._fps=(this._frames*1000)/(now-this._last); this._frames=0; this._last=now; if(this.el) this.el.textContent=this._fps.toFixed(0);} return this._fps; } }
export function formatCenterZoom(center, scale){ const zoom = 3.5/scale; const c = `${center[0].toFixed(8)}, ${center[1].toFixed(8)}`; return { c, zoom: zoom.toExponential(2) }; }
export function downloadBlob(filename, blob){ const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); },0); }
export function rectFromPoints(p0,p1){ const x = Math.min(p0.x,p1.x); const y = Math.min(p0.y,p1.y); const w = Math.abs(p1.x-p0.x); const h = Math.abs(p1.y-p0.y); return {x,y,w,h}; }

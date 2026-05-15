// mandlebrotWorker.js
let palette = new Uint8Array([0,0,0,255, 255,255,255,255]);

function samplePalette(t) {
  const N = palette.length / 4;
  const x = (t - Math.floor(t)) * N;
  const i0 = Math.floor(x) % N;
  const i1 = (i0 + 1) % N;
  const f = x - Math.floor(x);
  const idx0 = i0 * 4;
  const idx1 = i1 * 4;
  const r = palette[idx0] * (1-f) + palette[idx1] * f;
  const g = palette[idx0+1] * (1-f) + palette[idx1+1] * f;
  const b = palette[idx0+2] * (1-f) + palette[idx1+2] * f;
  return [r, g, b];
}

self.onmessage = function(e) {
  const msg = e.data;
  if(msg.type === 'palette') {
    palette = new Uint8Array(msg.palette);
    return;
  }
  if(msg.type === 'tile') {
    const tile = msg.tile;
    const params = msg.params;
    const jobId = msg.jobId;
    const x0 = tile.x0;
    const y0 = tile.y0;
    const w = tile.w;
    const h = tile.h;
    const width = params.width;
    const height = params.height;
    const center = params.center;
    const scale = params.scale;
    const iter = params.iter;
    const smooth = params.smooth;
    const colorScale = params.colorScale;
    const mode = params.mode;
    const juliaC = params.juliaC;
    const colorMode = params.colorMode;
    const paletteOffset = params.paletteOffset;
    const trapParam = params.trapParam;
    
    const aspect = width / height;
    const pixels = new Uint8ClampedArray(w * h * 4);
    
    for(let j = 0; j < h; j++) {
      const py = (y0 + j) / height;
      const yPoint = center[1] + (py - 0.5) * scale;
      for(let i = 0; i < w; i++) {
        const px = (x0 + i) / width;
        const xPoint = center[0] + (px - 0.5) * scale * aspect;
        
        let cRe, cIm, zRe, zIm;
        if(mode === 'julia') {
          cRe = juliaC[0];
          cIm = juliaC[1];
          zRe = xPoint;
          zIm = yPoint;
        } else {
          cRe = xPoint;
          cIm = yPoint;
          zRe = 0;
          zIm = 0;
        }
        
        let escaped = false;
        let nu = 0;
        let r2 = 0;
        let k = 0;
        let trapMin = 1e9;
        
        for(k = 0; k < iter; k++) {
          const zRe2 = zRe * zRe - zIm * zIm + cRe;
          const zIm2 = 2 * zRe * zIm + cIm;
          zRe = zRe2;
          zIm = zIm2;
          r2 = zRe * zRe + zIm * zIm;
          
          if(colorMode === 2) {
            const d = Math.abs(Math.hypot(zRe, zIm) - trapParam[0]);
            if(d < trapMin) trapMin = d;
          } else if(colorMode === 3) {
            const d = Math.min(Math.abs(zRe), Math.abs(zIm));
            if(d < trapMin) trapMin = d;
          }
          
          if(r2 > 256) {
            if(smooth) {
              const l = Math.log(r2) / 2;
              nu = k + 1 - Math.log(l) / Math.log(2);
            } else {
              nu = k;
            }
            escaped = true;
            break;
          }
        }
        
        const idx = (j * w + i) * 4;
        let t = 0;
        
        if(colorMode === 2 || colorMode === 3) {
          const ksharp = Math.max(trapParam[1], 0.0001);
          const v = 1 - Math.exp(-ksharp * trapMin);
          t = (v * colorScale + paletteOffset) % 1;
          if(t < 0) t += 1;
        } else if(!escaped) {
          pixels[idx] = 0;
          pixels[idx+1] = 0;
          pixels[idx+2] = 0;
          pixels[idx+3] = 255;
          continue;
        } else if(colorMode === 1) {
          t = ((k / iter) * colorScale + paletteOffset) % 1;
        } else {
          t = ((nu / iter) * colorScale + paletteOffset) % 1;
        }
        
        const rb = samplePalette(t);
        pixels[idx] = rb[0] | 0;
        pixels[idx+1] = rb[1] | 0;
        pixels[idx+2] = rb[2] | 0;
        pixels[idx+3] = 255;
      }
    }
    self.postMessage({type: 'tile', jobId: jobId, x0: x0, y0: y0, w: w, h: h, pixels: pixels.buffer}, [pixels.buffer]);
  }
};

// js/renderer.js
import { dpr, clamp } from './utils.js';
import { VERT, FRAG } from './shaders.js';
import { WorkerManager } from './worker.js';

function createShader(gl, type, src){ const sh=gl.createShader(type); gl.shaderSource(sh,src); gl.compileShader(sh); if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){ const log=gl.getShaderInfoLog(sh); gl.deleteShader(sh); throw new Error('Shader compile error: '+log);} return sh; }
function createProgram(gl,vs,fs){ const p=gl.createProgram(); gl.attachShader(p,vs); gl.attachShader(p,fs); gl.linkProgram(p); if(!gl.getProgramParameter(p,gl.LINK_STATUS)){ const log=gl.getProgramInfoLog(p); gl.deleteProgram(p); throw new Error('Program link error: '+log);} return p; }
function isWebGL2Available(){ try{ const c=document.createElement('canvas'); return !!c.getContext('webgl2',{antialias:false}); }catch{ return false; } }

export class Renderer{
  constructor(canvas, options={}){ this.canvas=canvas; this.mode='webgl'; this.palette=options.palette||null; this.quality=2.0; this.workerMgr=null; this._init(); }
  get type(){ return this.mode.toUpperCase(); }
  _init(){ if(isWebGL2Available()) this._initWebGL2(); else { this.mode='cpu'; this._initCPU(); } }
  _initWebGL2(){
    const gl=this.gl=this.canvas.getContext('webgl2',{antialias:false,alpha:false,desynchronized:true,powerPreference:'high-performance'});
    if(!gl){ this.mode='cpu'; return this._initCPU(); }
    const vs=createShader(gl,gl.VERTEX_SHADER,VERT); const fs=createShader(gl,gl.FRAGMENT_SHADER,FRAG); const prog=this.prog=createProgram(gl,vs,fs); gl.deleteShader(vs); gl.deleteShader(fs);
    this.loc={ a_pos:gl.getAttribLocation(prog,'a_pos'), u_center:gl.getUniformLocation(prog,'u_center'), u_scale:gl.getUniformLocation(prog,'u_scale'), u_resolution:gl.getUniformLocation(prog,'u_resolution'), u_maxIter:gl.getUniformLocation(prog,'u_maxIter'), u_smooth:gl.getUniformLocation(prog,'u_smooth'), u_colorScale:gl.getUniformLocation(prog,'u_colorScale'), u_palette:gl.getUniformLocation(prog,'u_palette'), u_mode:gl.getUniformLocation(prog,'u_mode'), u_juliaC:gl.getUniformLocation(prog,'u_juliaC'), u_colorMode:gl.getUniformLocation(prog,'u_colorMode'), u_paletteOffset:gl.getUniformLocation(prog,'u_paletteOffset'), u_trapParam:gl.getUniformLocation(prog,'u_trapParam') };
    const vbo=this.vbo=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vbo); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),gl.STATIC_DRAW);
    this.paletteTex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,this.paletteTex); this._uploadPalette(this.palette||new Uint8Array([0,0,0,255, 255,255,255,255]));
    gl.useProgram(prog); gl.uniform1i(this.loc.u_palette,0); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    this.resize();
  }
  _uploadPalette(pal){ const gl=this.gl; gl.bindTexture(gl.TEXTURE_2D,this.paletteTex); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE); const w=pal.length/4; gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,1,0,gl.RGBA,gl.UNSIGNED_BYTE,pal); }
  _initCPU(){ this.ctx2d=this.canvas.getContext('2d',{alpha:false}); this.workerMgr=new WorkerManager('workers/mandlebrotWorker.js'); this.resize(); }
  setPalette(p){ this.palette=p; if(this.mode==='webgl') this._uploadPalette(p); if(this.mode==='cpu') this.workerMgr.setPalette(p); }
  setQuality(s){ this.quality=clamp(Number(s)||1,1,4); this.resize(); }
  resize(){ const w=Math.floor(this.canvas.clientWidth*dpr*this.quality); const h=Math.floor(this.canvas.clientHeight*dpr*this.quality); if(this.canvas.width!==w||this.canvas.height!==h){ this.canvas.width=w; this.canvas.height=h; } }
  render(state){ if(this.mode==='webgl') this._renderGL(state); else this._renderCPU(state); }
  _renderGL(state){ const gl=this.gl; const {center,scale,iter,smooth,colorScale,mode,juliaC,colorMode,paletteOffset,trapParam}=state; gl.viewport(0,0,this.canvas.width,this.canvas.height); gl.useProgram(this.prog); gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo); gl.enableVertexAttribArray(this.loc.a_pos); gl.vertexAttribPointer(this.loc.a_pos,2,gl.FLOAT,false,0,0); gl.uniform2f(this.loc.u_center,center[0],center[1]); gl.uniform1f(this.loc.u_scale,scale); gl.uniform2f(this.loc.u_resolution,this.canvas.width,this.canvas.height); gl.uniform1i(this.loc.u_maxIter,iter|0); gl.uniform1i(this.loc.u_smooth,smooth?1:0); gl.uniform1f(this.loc.u_colorScale,colorScale); gl.uniform1i(this.loc.u_mode,mode==='julia'?1:0); gl.uniform2f(this.loc.u_juliaC,juliaC[0],juliaC[1]); gl.uniform1i(this.loc.u_colorMode,colorMode|0); gl.uniform1f(this.loc.u_paletteOffset, paletteOffset||0.0); gl.uniform2f(this.loc.u_trapParam, trapParam[0], trapParam[1]); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.paletteTex); gl.drawArrays(gl.TRIANGLES,0,6); }
  _renderCPU(state){ const {center,scale,iter,smooth,colorScale,mode,juliaC,colorMode,paletteOffset,trapParam}=state; const w=this.canvas.width,h=this.canvas.height; this.workerMgr.render(this.ctx2d,{ width:w,height:h, center,scale,iter,smooth,colorScale, mode,juliaC, colorMode, paletteOffset, trapParam }); }
}

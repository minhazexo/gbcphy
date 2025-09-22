
// js/shaders.js
export const VERT = `#version 300 es
precision highp float;
in vec2 a_pos; out vec2 v_uv;
void main(){ v_uv = (a_pos + 1.0) * 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// u_mode: 0 Mandelbrot, 1 Julia
// u_colorMode: 0 Smooth, 1 Escape, 2 OrbitTrap Circle, 3 OrbitTrap Cross
export const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv; out vec4 outColor;

uniform vec2 u_center; uniform float u_scale; uniform vec2 u_resolution;
uniform int u_maxIter; uniform bool u_smooth; uniform float u_colorScale; uniform sampler2D u_palette;
uniform int u_mode; uniform vec2 u_juliaC;
uniform int u_colorMode; uniform float u_paletteOffset; uniform vec2 u_trapParam; // x: radius, y: sharpness

vec2 cSquare(vec2 z){ return vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y); }
vec2 uvToComplex(vec2 uv){ float aspect = u_resolution.x/u_resolution.y; vec2 d = (uv-0.5)*vec2(aspect,1.0); return vec2(u_center.x + d.x*u_scale, u_center.y + d.y*u_scale); }

void main(){
  vec2 point = uvToComplex(v_uv);
  vec2 c = (u_mode==0)? point : u_juliaC;
  vec2 z = (u_mode==0)? vec2(0.0) : point;

  float nu = 0.0; bool escaped=false; int i=0; float r2=0.0; 
  float trapMin = 1e9; // orbit trap accumulator

  for(i=0;i<10000;i++){
    if(i>=u_maxIter) break;
    z = cSquare(z) + c; r2 = dot(z,z);
    // Orbit traps
    if(u_colorMode==2){ // circle radius u_trapParam.x around origin
      float d = abs(length(z) - u_trapParam.x);
      if(d<trapMin) trapMin=d;
    } else if(u_colorMode==3){ // cross: lines x=0 and y=0
      float d = min(abs(z.x), abs(z.y));
      if(d<trapMin) trapMin=d;
    }
    if(r2>256.0){
      if(u_smooth){ float l = log(r2)/2.0; nu = float(i) + 1.0 - log(l)/log(2.0); }
      else { nu = float(i); }
      escaped=true; break;
    }
  }

  float t=0.0;
  if(u_colorMode==2 || u_colorMode==3){
    // Map trap distance -> color index (smaller distance -> brighter)
    float k = max(u_trapParam.y, 0.0001);
    float v = 1.0 - exp(-k * trapMin); // [0,1)
    t = fract(v * u_colorScale + u_paletteOffset);
  } else if(!escaped){
    outColor = vec4(0.0,0.0,0.0,1.0); return;
  } else {
    if(u_colorMode==1){ // Escape time
      t = fract((float(i)/float(u_maxIter))*u_colorScale + u_paletteOffset);
    } else { // Smooth
      t = fract((nu/float(u_maxIter))*u_colorScale + u_paletteOffset);
    }
  }

  vec3 col = texture(u_palette, vec2(t, 0.5)).rgb;
  col = pow(col, vec3(0.9));
  outColor = vec4(col,1.0);
}
`;

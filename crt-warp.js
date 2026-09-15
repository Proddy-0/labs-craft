// crt-warp.js — fundo CRTWarp (port vanilla do React Bits @react-bits/CrtWarp)
// Shaders idênticos ao upstream; troca React/useEffect por init/dispose imperativo.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uBackgroundColor;
uniform float uCurvature;
uniform float uScanlineStrength;
uniform float uScanlineFrequency;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uBloom;
uniform float uBloomRadius;
uniform float uNoise;
uniform float uVignette;
uniform float uBrightness;
uniform float uPixelation;
uniform float uRgbShift;
uniform vec2 uPointer;
uniform float uMouseStrength;
uniform float uMouseReact;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 crtCurve(vec2 uv, float radius) {
  vec2 p = (uv - 0.5) * 2.0;
  float safeRadius = max(radius, 1.415);
  float cornerScale = safeRadius / sqrt(max(safeRadius * safeRadius - 2.0, 0.001));
  p = safeRadius * p / sqrt(max(safeRadius * safeRadius - dot(p, p), 0.001));
  p /= cornerScale;
  return p * 0.5 + 0.5;
}

float referencePlasma(vec2 uv, float t) {
  float frequencyScale = max(uWaveFrequency / 2.2, 0.001);
  uv = (uv - 0.5) * frequencyScale + 0.5;

  float scanline = 0.5 - 0.5 * cos(uv.y * 3.14159265 * uScanlineFrequency);
  scanline = mix(1.0, scanline, uScanlineStrength);

  uv *= vec2(80.0, 24.0);
  uv = ceil(uv);
  uv /= vec2(80.0, 24.0);

  float amplitude = uWaveAmplitude / 0.28;
  float field = 0.0;
  field += 0.7 * sin(0.5 * uv.x + t / 5.0);
  field += 3.0 * sin(1.6 * uv.y + t / 5.0);
  field += sin(10.0 * (uv.y * sin(t / 2.0) + uv.x * cos(t / 5.0)) + t / 2.0);

  float cx = uv.x + 0.5 * sin(t / 2.0);
  float cy = uv.y + 0.5 * cos(t / 4.0);
  field += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);
  field += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  field -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  field += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));

  return scanline * floor(3.0 * (0.5 + 0.499 * sin(field * amplitude))) / 3.0;
}

void main() {
  vec2 uv = vUv;
  if (uPixelation > 1.001) {
    vec2 cells = max(uResolution / uPixelation, vec2(1.0));
    uv = (floor(uv * cells) + 0.5) / cells;
  }

  float curveRadius = 1.1 + 0.42 / max(uCurvature, 0.001);
  if (uMouseReact > 0.5) {
    curveRadius *= exp(-uPointer.y * uMouseStrength * 0.4);
  }
  vec2 curvedUv = crtCurve(uv, curveRadius);
  if (uMouseReact > 0.5) {
    curvedUv.x -= uPointer.x * uMouseStrength * 0.035;
  }

  float signal = referencePlasma(curvedUv, uTime);
  float radius = 0.01 * uBloomRadius;
  float glow = signal * 0.2;
  glow += referencePlasma(curvedUv + vec2(radius, 0.0), uTime) * 0.12;
  glow += referencePlasma(curvedUv - vec2(radius, 0.0), uTime) * 0.12;
  glow += referencePlasma(curvedUv + vec2(0.0, radius), uTime) * 0.12;
  glow += referencePlasma(curvedUv - vec2(0.0, radius), uTime) * 0.12;
  glow += referencePlasma(curvedUv + vec2(radius), uTime) * 0.08;
  glow += referencePlasma(curvedUv - vec2(radius), uTime) * 0.08;
  glow += referencePlasma(curvedUv + vec2(radius, -radius), uTime) * 0.08;
  glow += referencePlasma(curvedUv + vec2(-radius, radius), uTime) * 0.08;

  float redSignal = referencePlasma(curvedUv + vec2(uRgbShift, 0.0), uTime);
  float blueSignal = referencePlasma(curvedUv - vec2(uRgbShift, 0.0), uTime);
  vec3 channelSignal = vec3(redSignal, signal, blueSignal);
  vec3 waveColor = uColor * (0.3 + signal * 0.7 + glow * uBloom * 0.65);
  waveColor += (channelSignal - signal) * 0.42;

  float edge = clamp(1.0 - dot(vUv - 0.5, vUv - 0.5) * 2.0, 0.0, 1.0);
  float edgeFade = mix(1.0, smoothstep(0.0, 1.0, edge), uVignette);
  float waveMask = clamp(signal * 0.82 + glow * 0.52, 0.0, 1.0) * edgeFade;

  float grain = hash21(gl_FragCoord.xy + vec2(fract(uTime) * 173.0));
  waveColor = max(waveColor * uBrightness, vec3(0.0));
  vec3 color = mix(uBackgroundColor, waveColor, waveMask);
  color += (grain - 0.5) * uNoise;
  gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
}
`;

const DEFAULTS = {
  color: '#642fd5',
  backgroundColor: '#07060c',
  speed: 0.15,
  curvature: 0,
  scanlineStrength: 0.75,
  scanlineFrequency: 285,
  waveAmplitude: 0.65,
  waveFrequency: 5.2,
  bloom: 3,
  bloomRadius: 0.1,
  noise: 0.25,
  vignette: 0,
  brightness: 1.25,
  pixelation: 1,
  rgbShift: 0.015,
  mouseReact: true,
  mouseStrength: 0.5,
  dpr: 1,
  fps: 30,
  paused: false
};

export function initCRTWarp(container, options = {}) {
  if (!container) return () => {};
  const o = { ...DEFAULTS, ...options };

  // prefers-reduced-motion: nao anima, so pinta o fundo solido.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    container.style.background = o.backgroundColor;
    return () => {};
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uSpeed: { value: o.speed },
      uColor: { value: new THREE.Color(o.color) },
      uBackgroundColor: { value: new THREE.Color(o.backgroundColor) },
      uCurvature: { value: o.curvature },
      uScanlineStrength: { value: o.scanlineStrength },
      uScanlineFrequency: { value: o.scanlineFrequency },
      uWaveAmplitude: { value: o.waveAmplitude },
      uWaveFrequency: { value: o.waveFrequency },
      uBloom: { value: o.bloom },
      uBloomRadius: { value: o.bloomRadius },
      uNoise: { value: o.noise },
      uVignette: { value: o.vignette },
      uBrightness: { value: o.brightness },
      uPixelation: { value: o.pixelation },
      uRgbShift: { value: o.rgbShift },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uMouseStrength: { value: o.mouseStrength },
      uMouseReact: { value: o.mouseReact ? 1 : 0 }
    }
  });

  scene.add(new THREE.Mesh(geometry, material));

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
  } catch (err) {
    container.style.background = o.backgroundColor;
    return () => {};
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.dpr));
  const canvas = renderer.domElement;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const resize = () => {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    material.uniforms.uResolution.value.set(canvas.width, canvas.height);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  let visible = true;
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  visibilityObserver.observe(container);

  const clock = new THREE.Clock();
  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerCurrent = new THREE.Vector2(0, 0);
  const interval = 1000 / Math.max(1, o.fps);
  let lastFrame = 0;
  let frameId = 0;

  const render = now => {
    frameId = requestAnimationFrame(render);
    if (!visible || document.hidden) return;
    if (now - lastFrame < interval) return;
    lastFrame = now - ((now - lastFrame) % interval);
    const delta = Math.min(clock.getDelta(), 0.1);
    if (!o.paused) material.uniforms.uTime.value += delta * material.uniforms.uSpeed.value;
    pointerCurrent.lerp(pointerTarget, 0.08);
    material.uniforms.uPointer.value.copy(pointerCurrent);
    renderer.render(scene, camera);
  };
  render(0);

  // O container e pointer-events:none (fundo), entao o pointer vem da janela.
  const onPointerMove = event => {
    pointerTarget.set(
      (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1,
      -((event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1)
    );
  };
  const onPointerLeave = () => pointerTarget.set(0, 0);
  if (o.mouseReact) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
  }

  return () => {
    cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  };
}

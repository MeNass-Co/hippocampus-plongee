"use client"

import { useRef, useEffect } from 'react'

/* GPU port of the original Canvas2D water effect — identical visual recipe
   (value-noise caustics, soft layer, bubbles, cursor glow) but the per-pixel
   work runs in a fragment shader, freeing the main thread for scrolling.
   Coordinates inside the shader stay in "third-res pixels" like the original
   so the motion and scale of every element match the previous version. */

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform vec2  u_res;      // canvas size in CSS pixels
uniform float u_time;
uniform vec2  u_mouse;    // glow position in CSS pixels
uniform float u_glow;     // 0..1 glow strength (fades in/out)
uniform float u_scale;    // glow radius multiplier (touch shrinks the lamp)

float hash(float a, float b) {
  // Sign-preserving fract, matching JS "(sin(n) * 43758.5453) % 1"
  float v = sin(a * 127.1 + b * 311.7) * 43758.5453;
  return sign(v) * fract(abs(v));
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  float n00 = hash(i.x, i.y);
  float n10 = hash(i.x + 1.0, i.y);
  float n01 = hash(i.x, i.y + 1.0);
  float n11 = hash(i.x + 1.0, i.y + 1.0);
  return mix(mix(n00, n10, s.x), mix(n01, n11, s.x), s.y);
}

float waterNoise(vec2 p, float t) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maxValue = 0.0;
  for (int i = 0; i < 3; i++) {
    value += amplitude * vnoise(vec2(p.x * frequency + t * 0.3, p.y * frequency + t * 0.2));
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value / maxValue;
}

void main() {
  // Match the original 1/3-resolution coordinate space
  vec2 px = gl_FragCoord.xy / 3.0;
  vec2 thirdRes = u_res / 3.0;
  // gl_FragCoord is bottom-up; the 2D canvas was top-down
  px.y = thirdRes.y - px.y;

  vec2 n = px / thirdRes * 3.0;

  float n1 = waterNoise(n, u_time);
  float n2 = waterNoise(n * 1.5 + vec2(5.2, 1.3), u_time * 1.3);
  float n3 = waterNoise(n * 0.7 + vec2(2.1, 4.7), u_time * 0.7);

  // Caustic pattern: sharp bright lines where waves focus light
  float caustic = pow(abs(sin(n1 * 6.28 + n2 * 3.14)), 3.0);
  float soft = n3 * 0.3;

  // Cursor glow: broad brightening of the caustics near the cursor
  vec2 mouseThird = u_mouse / 3.0;
  float dist = distance(px, mouseThird);
  float radius = 200.0 * u_scale;
  float mouseGlow = (dist < radius ? (1.0 - dist / radius) * 0.45 : 0.0) * u_glow;

  float brightness = caustic * 0.21 + soft * 0.09 + mouseGlow;

  // Teal-cyan: rgb(56, 217, 220)
  vec3 tint = vec3(56.0, 217.0, 220.0) / 255.0;
  vec3 color = tint * brightness * 3.0;
  float alpha = brightness * 2.5;

  // Spotlight halo on top of the caustics (the "flashlight")
  float spotDist = dist / (100.0 * u_scale); // 100 third-res px at full scale
  float spot = 0.0;
  if (spotDist < 1.0) {
    if (spotDist < 0.3) {
      spot = mix(0.25, 0.12, spotDist / 0.3);
    } else if (spotDist < 0.7) {
      spot = mix(0.12, 0.03, (spotDist - 0.3) / 0.4);
    } else {
      spot = mix(0.03, 0.0, (spotDist - 0.7) / 0.3);
    }
  }
  spot *= u_glow;
  color += tint * spot;
  alpha += spot;

  // Floating bubbles — same trajectories as the 2D version
  for (int i = 0; i < 15; i++) {
    float fi = float(i);
    float seed = fi * 137.5;
    float bx = mod(seed * 7.3 + u_time * (10.0 + fi * 3.0), thirdRes.x + 20.0) - 10.0;
    float by = thirdRes.y - (mod(seed * 3.7 + u_time * (15.0 + fi * 5.0), thirdRes.y + 20.0)) - 10.0;
    float size = 0.4 + mod(fi, 3.0) * 0.25;
    float bAlpha = 0.06 + mod(fi, 5.0) * 0.025;
    float bd = distance(px, vec2(bx, by));
    float bubble = (1.0 - smoothstep(size * 0.6, size + 0.6, bd)) * bAlpha;
    color += tint * bubble;
    alpha += bubble;
  }

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
`

export default function WaterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })
    if (!gl) return // transparent canvas — page background carries the scene

    /* Compile + link */
    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
      }
      return shader
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    /* Fullscreen triangle */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'u_res')
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')
    const uGlow = gl.getUniformLocation(program, 'u_glow')
    const uScale = gl.getUniformLocation(program, 'u_scale')

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND)

    /* State */
    let animationId = 0
    let time = 0
    let isVisible = true
    // Glow follows the pointer with a touch of liquid lag, and its strength
    // fades in/out so the flashlight breathes instead of blinking
    const pointer = { x: -10000, y: -10000 }
    const glowPos = { x: -10000, y: -10000 }
    let glowTarget = 0
    let glow = 0
    // A fingertip lamp is smaller and dimmer than a cursor: the finger sits
    // on the glass, so the light should read as a point, not a floodlight
    let glowScale = 1

    const handleVisibility = () => {
      isVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const resize = () => {
      // CSS-pixel resolution: 9x the detail of the old 1/3-res canvas
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const aimAt = (x: number, y: number, scale: number, strength: number) => {
      // First contact: snap the glow to the finger instead of sliding across
      if (glow < 0.01) {
        glowPos.x = x
        glowPos.y = y
      }
      pointer.x = x
      pointer.y = y
      glowScale = scale
      glowTarget = strength
    }

    // Browsers synthesize mouse events after taps — ignore mouse input for a
    // beat after any touch so the flashlight actually fades out on release
    let lastTouchAt = -10000
    const onMouseMove = (e: MouseEvent) => {
      if (performance.now() - lastTouchAt < 1000) return
      aimAt(e.clientX, e.clientY, 1, 1)
    }
    const onMouseLeave = () => {
      glowTarget = 0
    }
    const onTouchMove = (e: TouchEvent) => {
      lastTouchAt = performance.now()
      const t = e.touches[0]
      if (t) aimAt(t.clientX, t.clientY, 0.55, 0.5)
    }
    const onTouchEnd = (e: TouchEvent) => {
      lastTouchAt = performance.now()
      if (e.touches.length === 0) glowTarget = 0
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('touchstart', onTouchMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })

    let lastNow = performance.now()
    const draw = (now: number) => {
      animationId = requestAnimationFrame(draw)
      if (!isVisible || !gl) return

      const dt = Math.min((now - lastNow) / 1000, 0.1)
      lastNow = now
      time += dt * 0.48 // matches the old 0.016-per-30fps-frame pacing

      // Liquid pointer follow + glow strength easing
      const follow = 1 - Math.exp(-dt / 0.08)
      glowPos.x += (pointer.x - glowPos.x) * follow
      glowPos.y += (pointer.y - glowPos.y) * follow
      const ease = glowTarget > glow ? 0.12 : 0.45 // fast in, slow out
      glow += (glowTarget - glow) * (1 - Math.exp(-dt / ease))

      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, time)
      gl.uniform2f(uMouse, glowPos.x, glowPos.y)
      gl.uniform1f(uGlow, glow)
      gl.uniform1f(uScale, glowScale)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    animationId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationId)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('touchstart', onTouchMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
      }}
      aria-hidden="true"
    />
  )
}

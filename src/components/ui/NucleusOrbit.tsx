import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

type OrbiterConfig = {
  sizeRatio: number
  angle: number
  baseSpeed: number
  radiusXRatio: number
  radiusYRatio: number
  wobbleSeed: number
}

type OrbiterState = OrbiterConfig & {
  x: number
  y: number
  recoil: number
  speedBoost: number
}

const ORBITERS: OrbiterConfig[] = [
  {
    sizeRatio: 0.38,
    angle: -Math.PI * 0.68,
    baseSpeed: 0.54,
    radiusXRatio: 0.38,
    radiusYRatio: 0.31,
    wobbleSeed: 0.4,
  },
  {
    sizeRatio: 0.33,
    angle: Math.PI * 0.52,
    baseSpeed: 0.33,
    radiusXRatio: 0.39,
    radiusYRatio: 0.29,
    wobbleSeed: 2.1,
  },
]

function normalizeAngle(angle: number) {
  let value = angle
  while (value > Math.PI) value -= Math.PI * 2
  while (value < -Math.PI) value += Math.PI * 2
  return value
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

export default function NucleusOrbit() {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const orbiterRefs = useRef<Array<HTMLDivElement | null>>([])
  const sizeRef = useRef(520)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const orbiters: OrbiterState[] = ORBITERS.map(orbiter => ({
      ...orbiter,
      x: 0,
      y: 0,
      recoil: 0,
      speedBoost: 0,
    }))

    const resizeObserver = new ResizeObserver((entries) => {
      const nextSize = entries[0]?.contentRect.width
      if (nextSize) sizeRef.current = nextSize
    })
    resizeObserver.observe(container)
    sizeRef.current = container.getBoundingClientRect().width || 520

    const applyTransforms = (elapsed: number) => {
      const systemSize = sizeRef.current
      const centerDriftX = Math.sin(elapsed * 0.42) * systemSize * 0.008
      const centerDriftY = Math.cos(elapsed * 0.36) * systemSize * 0.007
      const centerScale = 1 + Math.sin(elapsed * 1.05) * 0.028

      if (centerRef.current) {
        centerRef.current.style.transform = `translate(-50%, -50%) translate(${centerDriftX}px, ${centerDriftY}px) scale(${centerScale})`
      }

      orbiters.forEach((orbiter, index) => {
        const node = orbiterRefs.current[index]
        if (!node) return

        const tilt = Math.sin(elapsed * (0.95 + index * 0.14) + orbiter.wobbleSeed) * 7
        const fluidPulse = Math.sin(elapsed * (1.18 + index * 0.17) + orbiter.wobbleSeed) * 0.05
        const proximityStretch = Math.max(orbiter.recoil, 0) / systemSize * 0.22
        const scaleX = 1 + fluidPulse + proximityStretch
        const scaleY = 1 - fluidPulse * 0.72 - proximityStretch * 0.45
        node.style.transform = `translate(-50%, -50%) translate(${orbiter.x}px, ${orbiter.y}px) rotate(${tilt}deg) scaleX(${scaleX}) scaleY(${scaleY})`
      })
    }

    if (reduceMotion) {
      const systemSize = sizeRef.current
      orbiters[0].x = Math.cos(orbiters[0].angle) * (systemSize * orbiters[0].radiusXRatio)
      orbiters[0].y = Math.sin(orbiters[0].angle) * (systemSize * orbiters[0].radiusYRatio)
      orbiters[1].x = Math.cos(orbiters[1].angle) * (systemSize * orbiters[1].radiusXRatio)
      orbiters[1].y = Math.sin(orbiters[1].angle) * (systemSize * orbiters[1].radiusYRatio)
      applyTransforms(0)
      return () => resizeObserver.disconnect()
    }

    let raf = 0
    let last = performance.now()
    let elapsed = 0

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.034)
      last = now
      elapsed += dt

      const systemSize = sizeRef.current

      orbiters.forEach((orbiter, index) => {
        const speedVariance
          = 1
            + Math.sin(elapsed * (0.72 + index * 0.11) + orbiter.wobbleSeed) * 0.2
            + Math.cos(elapsed * (1.55 + index * 0.06) + orbiter.wobbleSeed * 1.7) * 0.07

        const easing = 1 - Math.exp(-4.8 * dt)
        orbiter.speedBoost += (0 - orbiter.speedBoost) * easing
        orbiter.recoil += (0 - orbiter.recoil) * (1 - Math.exp(-5.6 * dt))
        const angularVelocity = Math.max(0.14, orbiter.baseSpeed * speedVariance + orbiter.speedBoost)
        orbiter.angle += angularVelocity * dt

        const orbitRadiusX
          = systemSize * orbiter.radiusXRatio
            + Math.sin(elapsed * 0.88 + orbiter.wobbleSeed) * systemSize * 0.024
            + orbiter.recoil
        const orbitRadiusY
          = systemSize * orbiter.radiusYRatio
            + Math.cos(elapsed * 0.63 + orbiter.wobbleSeed * 1.4) * systemSize * 0.02
            + orbiter.recoil * 0.72

        const innerDriftX = Math.cos(elapsed * (0.78 + index * 0.1) + orbiter.wobbleSeed) * systemSize * 0.016
        const innerDriftY = Math.sin(elapsed * (0.94 + index * 0.12) + orbiter.wobbleSeed * 1.2) * systemSize * 0.021

        orbiter.x = Math.cos(orbiter.angle) * orbitRadiusX + innerDriftX
        orbiter.y = Math.sin(orbiter.angle) * orbitRadiusY + innerDriftY
      })

      const [blobA, blobB] = orbiters
      const dx = blobB.x - blobA.x
      const dy = blobB.y - blobA.y
      const distance = Math.hypot(dx, dy) || 1
      const nearDistance = systemSize * ((blobA.sizeRatio + blobB.sizeRatio) * 0.58)
      const approachDistance = systemSize * ((blobA.sizeRatio + blobB.sizeRatio) * 0.76)

      if (distance < approachDistance) {
        const closeness = 1 - smoothstep(nearDistance, approachDistance, distance)
        const delta = normalizeAngle(blobB.angle - blobA.angle)
        const leading = delta >= 0 ? blobB : blobA
        const trailing = delta >= 0 ? blobA : blobB
        const steerBlend = 1 - Math.exp(-10 * dt)

        trailing.speedBoost += ((-0.12 * closeness) - trailing.speedBoost) * steerBlend
        leading.speedBoost += ((0.07 * closeness) - leading.speedBoost) * steerBlend
        trailing.recoil += ((systemSize * (0.006 + closeness * 0.010)) - trailing.recoil) * steerBlend
        leading.recoil += ((systemSize * (0.004 + closeness * 0.007)) - leading.recoil) * steerBlend
      }

      applyTransforms(elapsed)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-[520px] aspect-square mx-auto" aria-hidden="true">
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="ncx-hero-blob-distort">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
        </filter>
      </svg>

      <div
        className="absolute inset-[2%] rounded-full pointer-events-none opacity-90"
        style={{
          background: 'radial-gradient(circle at 50% 48%, rgba(123, 63, 228, 0.24) 0%, rgba(123, 63, 228, 0.12) 26%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      <div
        className="absolute inset-[18%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(169, 124, 250, 0.18) 0%, transparent 72%)',
          filter: 'blur(28px)',
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 w-[16%] h-[16%]"
        ref={centerRef}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <BlobVisual
          variant="core"
          style={{
            '--ncx-blob-fill': '#d7bcff',
            '--ncx-blob-shadow': 'rgba(169, 124, 250, 0.48)',
            '--ncx-blob-morph-duration': '10.5s',
          } as CSSProperties}
        />
      </div>

      <div
        className="absolute top-1/2 left-1/2 w-[38%] h-[38%]"
        ref={(node) => { orbiterRefs.current[0] = node }}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <BlobVisual
          variant="primary"
          style={{
            '--ncx-blob-fill': '#c9a9ff',
            '--ncx-blob-shadow': 'rgba(78, 31, 168, 0.54)',
            '--ncx-blob-morph-duration': '15.5s',
          } as CSSProperties}
        />
      </div>

      <div
        className="absolute top-1/2 left-1/2 w-[33%] h-[33%]"
        ref={(node) => { orbiterRefs.current[1] = node }}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <BlobVisual
          variant="secondary"
          style={{
            '--ncx-blob-fill': '#b993ff',
            '--ncx-blob-shadow': 'rgba(45, 10, 91, 0.58)',
            '--ncx-blob-morph-duration': '13.4s',
          } as CSSProperties}
        />
      </div>
    </div>
  )
}

function BlobVisual({
  variant,
  style,
}: {
  variant: 'primary' | 'secondary' | 'core'
  style: CSSProperties
}) {
  const isCore = variant === 'core'

  return (
    <div
      className={`ncx-liquid-blob ${isCore ? 'ncx-liquid-blob-core' : ''}`}
      style={style}
    >
      <div className="ncx-liquid-depth" />
      <div className="ncx-liquid-skin" />
      <div className="ncx-liquid-flow" />
      <div className="ncx-glitter" style={{ opacity: isCore ? 0.22 : 0.3 }} />
      <div className="ncx-blob-shine" />
      <div className="ncx-liquid-rim" />
    </div>
  )
}

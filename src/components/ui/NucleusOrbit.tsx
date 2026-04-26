import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

type OrbiterConfig = {
  driftPhase: number
  radiusXPulse: number
  radiusYPulse: number
  radiusYRatio: number
  radiusXRatio: number
  scalePhase: number
  sizeRatio: number
  tiltPhase: number
}

type Point = {
  x: number
  y: number
}

type TransformKeyframe = {
  offset: number
  transform: string
}

// Slower, more graceful orbit; denser keyframe sampling so the browser's
// linear interpolation is imperceptible between samples.
const LOOP_DURATION_MS = 26000
const LOOP_FPS = 32
const LOOP_FRAMES = Math.round((LOOP_DURATION_MS / 1000) * LOOP_FPS)
const CENTER_SIZE_RATIO = 0.16
const ORBITERS: readonly OrbiterConfig[] = [
  {
    driftPhase: 0.5,
    radiusXPulse: 0.014,
    radiusYPulse: 0.011,
    radiusYRatio: 0.31,
    radiusXRatio: 0.39,
    scalePhase: 0.35,
    sizeRatio: 0.38,
    tiltPhase: 0.4,
  },
  {
    driftPhase: 2.1,
    radiusXPulse: 0.012,
    radiusYPulse: 0.010,
    radiusYRatio: 0.28,
    radiusXRatio: 0.35,
    scalePhase: 2.2,
    sizeRatio: 0.33,
    tiltPhase: 2.05,
  },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function positionOrbiter(
  config: OrbiterConfig,
  orbitPhase: number,
  loopAngle: number,
  systemSize: number,
  orbitScale: number,
  driftScale: number,
): Point {
  const radiusX
    = systemSize * config.radiusXRatio * orbitScale
      + Math.sin(loopAngle * 2 + config.driftPhase) * systemSize * config.radiusXPulse * orbitScale
  const radiusY
    = systemSize * config.radiusYRatio * orbitScale
      + Math.cos(loopAngle * 3 + config.driftPhase * 0.75) * systemSize * config.radiusYPulse * orbitScale

  return {
    // Drop drift frequency from 3× → 2× and amplitude ~50% — fewer/softer micro-movements.
    x: Math.cos(orbitPhase) * radiusX + Math.cos(loopAngle * 2 + config.driftPhase) * systemSize * 0.007 * driftScale,
    y: Math.sin(orbitPhase) * radiusY + Math.sin(loopAngle * 1.5 + config.driftPhase * 1.2) * systemSize * 0.009 * driftScale,
  }
}

function enforceMinimumSeparation(pointA: Point, pointB: Point, minDistance: number) {
  const dx = pointB.x - pointA.x
  const dy = pointB.y - pointA.y
  const distance = Math.hypot(dx, dy) || 1

  if (distance >= minDistance) {
    return { pointA, pointB, distance }
  }

  const push = (minDistance - distance) / 2
  const nx = dx / distance
  const ny = dy / distance

  return {
    pointA: { x: pointA.x - nx * push, y: pointA.y - ny * push },
    pointB: { x: pointB.x + nx * push, y: pointB.y + ny * push },
    distance: minDistance,
  }
}

function enforceMinimumRadius(point: Point, minRadius: number) {
  const distance = Math.hypot(point.x, point.y) || 1

  if (distance >= minRadius) {
    return point
  }

  const scale = minRadius / distance
  return {
    x: point.x * scale,
    y: point.y * scale,
  }
}

function centerTransform(loopAngle: number, systemSize: number) {
  const x = Math.sin(loopAngle + 0.35) * systemSize * 0.005
  const y = Math.cos(loopAngle * 2 - 0.18) * systemSize * 0.0042
  const scale = 1 + Math.sin(loopAngle * 2 + 0.2) * 0.016
  return `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`
}

function orbiterTransform(
  point: Point,
  config: OrbiterConfig,
  loopAngle: number,
  closeness: number,
  index: number,
) {
  // Lower-frequency, lower-amplitude tilt + pulse so motion reads as a slow
  // breath instead of fast wobble.
  const tilt
    = Math.sin(loopAngle * (1.5 + index * 0.5) + config.tiltPhase) * 3.2
      + Math.cos(loopAngle * 2 + config.tiltPhase * 0.85) * 0.8
  const fluidPulse
    = Math.sin(loopAngle * 2 + config.scalePhase) * 0.022
      + Math.cos(loopAngle * 3 + config.scalePhase * 1.15) * 0.006
  const proximityStretch = closeness * 0.018
  const scaleX = 1 + fluidPulse + proximityStretch
  const scaleY = 1 - fluidPulse * 0.7 - proximityStretch * 0.26

  return `translate(-50%, -50%) translate(${point.x}px, ${point.y}px) rotate(${tilt}deg) scaleX(${scaleX}) scaleY(${scaleY})`
}

function buildLoopKeyframes(systemSize: number) {
  const center: TransformKeyframe[] = []
  const orbiters: TransformKeyframe[][] = [[], []]
  const isCompact = systemSize < 340
  const orbitScale = isCompact ? 0.94 : 1.02
  const driftScale = isCompact ? 0.78 : 0.9
  const combinedRadii = (ORBITERS[0].sizeRatio + ORBITERS[1].sizeRatio) / 2
  const minVisibleGap = systemSize * Math.min(ORBITERS[0].sizeRatio, ORBITERS[1].sizeRatio) * (isCompact ? 0.44 : 0.4)
  const minDistance = systemSize * combinedRadii + minVisibleGap
  const softDistance = minDistance + systemSize * (isCompact ? 0.14 : 0.11)
  const centerGapMultiplier = isCompact ? 0.2 : 0.17
  const minCenterDistances = ORBITERS.map(orbiter =>
    systemSize * (((CENTER_SIZE_RATIO + orbiter.sizeRatio) / 2) + orbiter.sizeRatio * centerGapMultiplier),
  )

  for (let frame = 0; frame <= LOOP_FRAMES; frame += 1) {
    const offset = frame / LOOP_FRAMES
    const loopAngle = offset * Math.PI * 2
    // Halve the harmonic wobbles and drop the highest-frequency term — the
    // orbit traces a near-clean ellipse with only gentle organic drift.
    const primaryPhase
      = -Math.PI * 0.72
        + loopAngle
        + Math.sin(loopAngle * 2 + 0.4) * 0.04
    const oppositeOffset
      = Math.PI
        + Math.sin(loopAngle * 1.5 - 0.85) * (isCompact ? 0.035 : 0.055)
        + Math.cos(loopAngle * 2 + 0.2) * (isCompact ? 0.012 : 0.020)
    const secondaryPhase = primaryPhase + oppositeOffset

    const rawPointA = positionOrbiter(ORBITERS[0], primaryPhase, loopAngle, systemSize, orbitScale, driftScale)
    const rawPointB = positionOrbiter(ORBITERS[1], secondaryPhase, loopAngle, systemSize, orbitScale, driftScale)
    const clearedPointA = enforceMinimumRadius(rawPointA, minCenterDistances[0])
    const clearedPointB = enforceMinimumRadius(rawPointB, minCenterDistances[1])
    const separated = enforceMinimumSeparation(clearedPointA, clearedPointB, minDistance)
    const pointA = enforceMinimumRadius(separated.pointA, minCenterDistances[0])
    const pointB = enforceMinimumRadius(separated.pointB, minCenterDistances[1])
    const distance = Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y)
    const closeness = clamp((softDistance - distance) / (softDistance - minDistance), 0, 1)

    center.push({
      offset,
      transform: centerTransform(loopAngle, systemSize),
    })
    orbiters[0].push({
      offset,
      transform: orbiterTransform(pointA, ORBITERS[0], loopAngle, closeness, 0),
    })
    orbiters[1].push({
      offset,
      transform: orbiterTransform(pointB, ORBITERS[1], loopAngle, closeness, 1),
    })
  }

  return { center, orbiters }
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
    const animations: Animation[] = []
    let resizeRaf = 0

    const setStaticTransforms = () => {
      const { center, orbiters } = buildLoopKeyframes(sizeRef.current)

      if (centerRef.current) centerRef.current.style.transform = center[0].transform
      orbiterRefs.current.forEach((node, index) => {
        if (node) node.style.transform = orbiters[index][0].transform
      })
    }

    const startLoop = () => {
      animations.splice(0).forEach(animation => animation.cancel())

      if (reduceMotion) {
        setStaticTransforms()
        return
      }

      const { center, orbiters } = buildLoopKeyframes(sizeRef.current)
      const nextAnimations: Animation[] = []

      if (centerRef.current) {
        nextAnimations.push(centerRef.current.animate(center, {
          duration: LOOP_DURATION_MS,
          easing: 'linear',
          iterations: Infinity,
          fill: 'both',
        }))
      }

      orbiterRefs.current.forEach((node, index) => {
        if (!node) return

        nextAnimations.push(node.animate(orbiters[index], {
          duration: LOOP_DURATION_MS,
          easing: 'linear',
          iterations: Infinity,
          fill: 'both',
        }))
      })

      const startTime = document.timeline.currentTime ?? 0
      nextAnimations.forEach((animation) => {
        animation.startTime = startTime
        animations.push(animation)
      })
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const nextSize = entries[0]?.contentRect.width
      if (!nextSize) return

      const quantizedSize = Math.round(nextSize / 8) * 8
      if (quantizedSize === sizeRef.current) return

      sizeRef.current = quantizedSize
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(startLoop)
    })
    resizeObserver.observe(container)
    sizeRef.current = Math.round((container.getBoundingClientRect().width || 520) / 8) * 8
    startLoop()

    return () => {
      cancelAnimationFrame(resizeRaf)
      animations.forEach(animation => animation.cancel())
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-[520px] aspect-square mx-auto" aria-hidden="true">
      <div
        className="absolute inset-[2%] rounded-full pointer-events-none opacity-90"
        style={{
          background: 'radial-gradient(circle at 50% 48%, rgba(123, 63, 228, 0.18) 0%, rgba(123, 63, 228, 0.08) 24%, transparent 68%)',
          filter: 'blur(28px)',
        }}
      />

      <div
        className="absolute inset-[18%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(169, 124, 250, 0.12) 0%, transparent 70%)',
          filter: 'blur(24px)',
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
            '--ncx-blob-fill': '#C9A9FF',
            '--ncx-blob-shadow': 'rgba(169, 124, 250, 0.32)',
            '--ncx-blob-morph-duration': '16s',
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
            '--ncx-blob-fill': '#A97CFA',
            '--ncx-blob-shadow': 'rgba(78, 31, 168, 0.54)',
            '--ncx-blob-morph-duration': '24s',
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
            '--ncx-blob-fill': '#8F55F0',
            '--ncx-blob-shadow': 'rgba(45, 10, 91, 0.58)',
            '--ncx-blob-morph-duration': '21s',
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

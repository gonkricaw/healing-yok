/*
 * Baterai pulang: objek khas Healing Yok. Level = skor Healing Bersih (0..99).
 * Naik: cairan bergelombang naik dan gelembung muncul. Turun: tetes merah jatuh.
 * Semua gerak memakai transform; reduced motion mematikan gelombang, gelembung, dan tetes (CSS).
 */
import { useEffect, useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export const chargeColor = (v: number) => (v >= 65 ? "var(--color-leaf)" : v >= 50 ? "var(--color-amber)" : "var(--color-warn)")

/** Angka yang berjalan ke nilai baru (ease-out quart, 700 ms). */
export function useTween(value: number, ms = 700) {
  const [v, setV] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = value
      setV(value)
      return
    }
    const a = from.current, t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 4)
      const x = a + (value - a) * e
      from.current = x
      setV(x)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return v
}

/** Arah perubahan terakhir, dengan kunci baru setiap kali berubah supaya animasi bisa diputar ulang. */
function useDelta(value: number) {
  const prev = useRef(value)
  const [d, setD] = useState({ dir: 0, key: 0 })
  useEffect(() => {
    const diff = value - prev.current
    prev.current = value
    if (Math.abs(diff) >= 1) setD((x) => ({ dir: Math.sign(diff), key: x.key + 1 }))
  }, [value])
  return d
}

// Garis luar digambar tangan: sedikit miring di setiap sisi.
const BODY = "M62 52 C120 46 190 49 240 53 C266 55 279 72 280 100 C283 240 281 420 278 548 C277 574 262 588 236 589 C170 592 110 591 62 588 C36 587 21 572 21 546 C18 400 19 240 22 96 C23 68 38 54 62 52 Z"
const CAP = "M106 52 C106 32 111 19 130 18 C152 15 172 16 191 19 C201 20 205 32 204 52"
const TOP = 58, BOTTOM = 588

export function Battery({ level, className, label = "Baterai pulang" }: { level: number; className?: string; label?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const shown = useTween(level)
  const delta = useDelta(Math.round(level))
  const y = BOTTOM - (Math.max(0, Math.min(99, level)) / 100) * (BOTTOM - TOP)
  const color = chargeColor(shown)
  // Gelombang: satu periode 120 unit, digulirkan oleh .bt-wave.
  let wave = "M-240 0"
  for (let x = -240; x < 560; x += 120) wave += ` q30 -12 60 0 t60 0`
  wave += " V700 H-240 Z"

  return (
    <svg viewBox="0 0 300 680" className={cn("overflow-visible", className)} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level)}>
      <defs>
        <clipPath id={id + "c"}>
          <path d={BODY} />
        </clipPath>
        <pattern id={id + "h"} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="16" stroke="var(--color-ink)" strokeOpacity=".22" strokeWidth="6" />
        </pattern>
        <filter id={id + "b"} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <path d={BODY} fill="var(--color-paper)" />
      <g clipPath={`url(#${id}c)`}>
        <g style={{ transform: `translateY(${y}px)`, transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
          <g className="bt-wave">
            <path d={wave} style={{ fill: color, transition: "fill 400ms" }} />
            <path d={wave} fill={`url(#${id}h)`} />
          </g>
          {delta.dir > 0 &&
            [40, 95, 150, 205, 250].map((x, i) => (
              <circle key={delta.key + "-" + i} className="bt-bubble" cx={x} cy={40 + (i % 2) * 30} r={7 + (i % 3) * 3} fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2.5" style={{ animationDelay: i * 90 + "ms" }} />
            ))}
        </g>
        {/* Garis ukur di sisi kanan */}
        {[0.25, 0.5, 0.75].map((k) => (
          <path key={k} d={`M248 ${BOTTOM - k * (BOTTOM - TOP)} h22`} stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
        ))}
      </g>
      <g filter={`url(#${id}b)`} fill="none" stroke="var(--color-ink)" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
        <path d={BODY} pathLength={1} className="bt-draw" />
        <path d={CAP} pathLength={1} className="bt-draw" style={{ animationDelay: "300ms" }} />
      </g>
      <text x="150" y="360" textAnchor="middle" className="num" style={{ font: "400 118px var(--font-display)", paintOrder: "stroke", stroke: "var(--color-ink)", strokeWidth: 10, strokeLinejoin: "round", fill: "var(--color-paper)" }}>
        {Math.round(shown)}
      </text>
      {delta.dir < 0 && <path key={delta.key} className="bt-drip" d="M150 600 c-12 18 -14 30 0 36 c14 -6 12 -18 0 -36 Z" fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="2.5" />}
    </svg>
  )
}

// Garis luar versi melebar, juga sedikit miring di tiap sisi.
const WIDE = "M40 22 C150 16 330 19 520 21 C548 22 560 34 561 58 C563 92 562 128 560 150 C559 170 547 180 522 181 C340 184 160 183 40 180 C20 179 9 168 9 146 C7 112 8 80 10 52 C11 32 22 23 40 22 Z"
const WIDE_CAP = "M562 72 C578 72 588 74 589 86 C590 100 590 112 588 122 C586 130 576 131 562 131"

/** Baterai gambar tangan versi melebar untuk layar sempit: sama gaya dengan versi tegak, numeral di dalam. */
export function BatteryWide({ level, className, label = "Baterai pulang" }: { level: number; className?: string; label?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const shown = useTween(level)
  const k = Math.max(0, Math.min(99, level)) / 100
  return (
    <svg viewBox="0 0 600 200" className={cn("overflow-visible", className)} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level)}>
      <defs>
        <clipPath id={id + "c"}>
          <path d={WIDE} />
        </clipPath>
        <pattern id={id + "h"} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="16" stroke="var(--color-ink)" strokeOpacity=".22" strokeWidth="6" />
        </pattern>
        <filter id={id + "b"} x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path d={WIDE} fill="var(--color-paper)" />
      <g clipPath={`url(#${id}c)`}>
        <g style={{ transform: `scaleX(${k})`, transformOrigin: "10px 0", transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
          <rect x="0" y="0" width="565" height="200" style={{ fill: chargeColor(shown), transition: "fill 400ms" }} />
          <rect x="0" y="0" width="565" height="200" fill={`url(#${id}h)`} />
        </g>
      </g>
      <g filter={`url(#${id}b)`} fill="none" stroke="var(--color-ink)" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
        <path d={WIDE} pathLength={1} className="bt-draw" />
        <path d={WIDE_CAP} pathLength={1} className="bt-draw" style={{ animationDelay: "300ms" }} />
      </g>
      <text x="285" y="135" textAnchor="middle" className="num" style={{ font: "400 112px var(--font-display)", paintOrder: "stroke", stroke: "var(--color-ink)", strokeWidth: 10, strokeLinejoin: "round", fill: "var(--color-paper)" }}>
        {Math.round(shown)}
      </text>
    </svg>
  )
}

/** Versi horizontal: strip di mobile, baris moda, dan dock. Isi memakai scaleX, bukan width. */
export function BatteryStrip({ level, className, size = "md", label = "Baterai pulang" }: { level: number; className?: string; size?: "sm" | "md" | "lg"; label?: string }) {
  const shown = useTween(level)
  const h = size === "sm" ? "h-4" : size === "lg" ? "h-12" : "h-8"
  return (
    <div className={cn("flex items-center", className)} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level)}>
      <div className={cn("relative flex-1 overflow-hidden border-ink bg-paper", h, size === "sm" ? "rounded-[6px] border-2" : "rounded-[12px_14px_11px_13px] border-[2.5px]")}>
        <div
          className="absolute inset-0 origin-left"
          style={{
            transform: `scaleX(${Math.max(0, Math.min(99, level)) / 100})`,
            transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1), background-color 400ms",
            backgroundColor: chargeColor(shown),
            backgroundImage: "repeating-linear-gradient(-35deg, transparent 0 8px, color-mix(in oklab, var(--color-ink) 22%, transparent) 8px 12px)",
          }}
        />
      </div>
      <span className={cn("ml-[3px] rounded-r-[4px] border-ink bg-paper", size === "sm" ? "h-2 w-1 border-2 border-l-0" : size === "lg" ? "h-6 w-2 border-[2.5px] border-l-0" : "h-4 w-1.5 border-[2.5px] border-l-0")} aria-hidden="true" />
    </div>
  )
}

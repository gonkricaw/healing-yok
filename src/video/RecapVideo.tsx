/*
 * Video rekap rencana 9:16 untuk Story/WhatsApp. Komposisinya sama dengan Kartu Healing di langkah 3:
 * judul putusan, baterai gambar tangan yang terisi, catatan plus minus, perforasi, dan stempel.
 * Komposisi Remotion murni (semua gerak dari useCurrentFrame), jadi bisa diputar di Player
 * dan dirender ke MP4 dengan Remotion CLI tanpa perubahan.
 */
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion"

export interface RecapNote {
  text: string
  sub: string
  tone: "plus" | "minus" | "ok"
}

export interface RecapProps {
  score: number
  verdict: string
  sub: string
  notes: RecapNote[]
  people: number
  stops: { time: string; name: string }[]
}

export const RECAP = { width: 1080, height: 1920, fps: 30, durationInFrames: 270 }

const ease = Easing.bezier(0.22, 1, 0.36, 1)
const C = { page: "#ffd94a", paper: "#fff8d6", ink: "#141414", muted: "#4d3f12", leaf: "#1d7553", amber: "#e8902a", warn: "#b3261e" }
const display = '"Bowlby One", system-ui, sans-serif'
const hand = '"Gochi Hand", cursive'
const body = '"Plus Jakarta Sans Variable", system-ui, sans-serif'
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

/** Masuk dari bawah dengan fade. `at` dalam frame. */
const rise = (f: number, at: number, dur = 18, rot = 0) => {
  const p = interpolate(f, [at, at + dur], [0, 1], { ...clampOpt, easing: ease })
  return { opacity: p, transform: `translateY(${(1 - p) * 60}px) rotate(${rot}deg)` }
}

// Baterai yang sama dengan di aplikasi, digambar ulang tanpa animasi CSS supaya deterministik per frame.
const BODY = "M62 52 C120 46 190 49 240 53 C266 55 279 72 280 100 C283 240 281 420 278 548 C277 574 262 588 236 589 C170 592 110 591 62 588 C36 587 21 572 21 546 C18 400 19 240 22 96 C23 68 38 54 62 52 Z"
const CAP = "M106 52 C106 32 111 19 130 18 C152 15 172 16 191 19 C201 20 205 32 204 52"

function DrawnBattery({ charge, color, f }: { charge: number; color: string; f: number }) {
  const y = 588 - (charge / 100) * 530
  const shift = -((f * 2) % 120)
  let wave = `M${-240 + shift} 0`
  for (let x = -240; x < 560; x += 120) wave += " q30 -12 60 0 t60 0"
  wave += ` V700 H${-240 + shift} Z`
  return (
    <svg viewBox="0 0 300 620" width={300} height={620} style={{ transform: "rotate(-2deg)", filter: `drop-shadow(12px 12px 0 ${C.ink})`, overflow: "visible" }}>
      <defs>
        <clipPath id="rv-c">
          <path d={BODY} />
        </clipPath>
        <pattern id="rv-h" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="16" stroke={C.ink} strokeOpacity=".22" strokeWidth="6" />
        </pattern>
      </defs>
      <path d={BODY} fill={C.paper} />
      <g clipPath="url(#rv-c)">
        <g transform={`translate(0 ${y})`}>
          <path d={wave} fill={color} />
          <path d={wave} fill="url(#rv-h)" />
        </g>
      </g>
      <path d={BODY} fill="none" stroke={C.ink} strokeWidth="7" strokeLinejoin="round" />
      <path d={CAP} fill="none" stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      <text x="150" y="360" textAnchor="middle" style={{ font: `400 120px ${display}`, paintOrder: "stroke", stroke: C.ink, strokeWidth: 11, strokeLinejoin: "round", fill: C.paper }}>
        {Math.round(charge)}
      </text>
    </svg>
  )
}

export function RecapVideo(props: RecapProps) {
  const f = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const charge = interpolate(f, [30, 90], [0, props.score], { ...clampOpt, easing: ease })
  const out = interpolate(f, [durationInFrames - 14, durationInFrames], [1, 0], clampOpt)
  const color = props.score >= 65 ? C.leaf : props.score >= 50 ? C.amber : C.warn
  const stops = props.stops.slice(0, 4)

  return (
    <AbsoluteFill style={{ background: C.page, backgroundImage: "radial-gradient(rgba(20,20,20,.1) 2px, transparent 2.6px)", backgroundSize: "44px 44px", color: C.ink, fontFamily: body, padding: 72, opacity: out }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: display, fontSize: 50, ...rise(f, 0) }}>
        <span style={{ width: 50, height: 50, background: C.leaf, border: `6px solid ${C.ink}`, borderRadius: "50% 50% 50% 10px", transform: "rotate(-45deg)" }} />
        Healing Yok
      </div>

      <div style={{ marginTop: 52, background: C.paper, border: `7px solid ${C.ink}`, borderRadius: "56px 64px 52px 60px", boxShadow: `14px 14px 0 ${C.ink}`, padding: "52px 52px 40px", ...rise(f, 8, 22, -1) }}>
        <div style={{ fontFamily: display, fontSize: 76, lineHeight: 1 }}>{props.verdict}</div>
        <div style={{ fontFamily: hand, fontSize: 42, color: C.muted, marginTop: 12, lineHeight: 1.15 }}>{props.sub}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 36, marginTop: 40 }}>
          <DrawnBattery charge={charge} color={color} f={f} />
          <div style={{ display: "grid", gap: 34, flex: 1 }}>
            {props.notes.map((n, i) => (
              <div key={i} style={rise(f, 60 + i * 12, 18, i % 2 ? 1.5 : -2)}>
                <b style={{ display: "block", fontFamily: display, fontWeight: 400, fontSize: 50, lineHeight: 1, color: n.tone === "minus" ? C.warn : n.tone === "plus" ? C.leaf : C.ink }}>{n.text}</b>
                <span style={{ display: "block", fontFamily: hand, fontSize: 36, color: C.muted, marginTop: 6, lineHeight: 1.1 }}>{n.sub}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: `6px dashed ${C.ink}`, margin: "40px -8px 30px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <span style={{ border: `7px solid ${C.warn}`, color: C.warn, borderRadius: 20, padding: "8px 22px", fontFamily: display, fontSize: 40, ...rise(f, 110, 18, -6) }}>Kartu Healing</span>
          <span style={{ fontFamily: hand, fontSize: 38, color: C.muted }}>berlaku untuk {props.people} orang</span>
        </div>
      </div>

      <div style={{ marginTop: 44, display: "grid", gap: 18 }}>
        {stops.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 28, alignItems: "baseline", fontSize: 42, ...rise(f, 130 + i * 9, 18, i % 2 ? 0.6 : -0.6) }}>
            <b style={{ width: 150, fontFamily: display, fontWeight: 400 }}>{s.time}</b>
            <span style={{ fontWeight: 700 }}>{s.name}</span>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 72, right: 72, bottom: 72, fontFamily: hand, fontSize: 48, lineHeight: 1.15, ...rise(f, 190, 18, -1.5) }}>
        Healing tidak harus jauh. Rencanakan punyamu di Healing Yok.
      </div>
    </AbsoluteFill>
  )
}

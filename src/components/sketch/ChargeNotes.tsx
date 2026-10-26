import { MODE } from "@/domain/data"
import type { Plan, Stop } from "@/domain/engine"
import type { Place } from "@/domain/data"
import { dmin, rpS } from "@/domain/format"
import { CrewDoodle, type CrewKind } from "@/components/ui/doodle-crew-footer-sunny"
import { cn } from "@/lib/utils"
import { useTween } from "./Battery"

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 24" className={cn("h-5 w-12 flex-none", className)} aria-hidden="true">
      <path d="M58 13 C44 9 26 16 6 12 M14 4 C10 8 7 10 4 12 C8 14 11 17 14 21" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Note({ sign, value, title, sub, tone, d, compact }: { sign: "+" | "−"; value: number; title: string; sub: string; tone: "plus" | "minus" | "ok"; d: number; compact?: boolean }) {
  const v = useTween(value)
  return (
    <li className="sk-in flex gap-2" style={{ "--d": d + "ms", "--rot": tone === "plus" ? "-2deg" : "1.5deg" } as React.CSSProperties}>
      <Arrow className={cn(tone === "minus" ? "mt-2 text-warn" : "mt-2 text-ink", compact && "hidden w-8 sm:block")} />
      <div>
        <b className={cn("num block font-display leading-none", compact ? "text-[17px] sm:text-[22px]" : "text-[clamp(19px,1.6vw,26px)]", tone === "minus" ? "text-warn" : tone === "plus" ? "text-leaf" : "text-ink")}>
          {tone === "ok" ? title : `${sign}${Math.round(v)} ${title}`}
        </b>
        <span className={cn("mt-1 block font-hand leading-tight text-muted", compact ? "text-[16px] sm:text-[18px]" : "text-[19px]")}>{sub}</span>
      </div>
    </li>
  )
}

export interface NoteData {
  sign: "+" | "−"
  value: number
  title: string
  sub: string
  tone: "plus" | "minus" | "ok"
}

/** Catatan plus minus yang menjelaskan isi baterai, dari Plan.parts. Dipakai tiket dan video rekap. */
export function noteList(plan: Plan, places: Stop[], hotel: Place | undefined, budget: number, people: number): NoteData[] {
  const names = [...(hotel ? [hotel.name] : []), ...places.map((p) => p.name)]
  const where = names.length ? names.slice(0, 2).join(", ") + (names.length > 2 ? `\u00a0+${names.length - 2}` : "") : "tempat pilihan kru"
  const { segar, jalan, budget: overBudget, lama } = plan.parts
  const out: NoteData[] = [
    { sign: "+", value: segar, title: "segar", sub: where, tone: "plus" },
    { sign: "−", value: jalan, title: "capek di jalan", sub: `${dmin(plan.roadMin)} naik ${MODE[plan.m].l.toLowerCase()}`, tone: "minus" },
  ]
  if (lama >= 0.5) out.push({ sign: "−", value: lama, title: "kelamaan", sub: "lebih dari 40% waktu habis di jalan", tone: "minus" })
  out.push(
    overBudget >= 0.5
      ? { sign: "−", value: overBudget, title: "lewat budget", sub: `kelebihan ${rpS(plan.over * budget)}, total ±${rpS(plan.total)}`, tone: "minus" }
      : { sign: "+", value: 0, title: "Budget aman", sub: `total ±${rpS(plan.total)}, ${rpS(plan.total / people)} per orang`, tone: "ok" },
  )
  return out
}

export const noteText = (n: NoteData) => (n.tone === "ok" ? n.title : `${n.sign}${Math.round(n.value)} ${n.title}`)

export function ChargeNotes({ plan, places, hotel, budget, people, compact, className }: { plan: Plan; places: Stop[]; hotel?: Place; budget: number; people: number; compact?: boolean; className?: string }) {
  return (
    <ul className={cn("grid gap-5", className)}>
      {noteList(plan, places, hotel, budget, people).map((n, i) => (
        <Note key={n.title} {...n} d={250 + i * 110} compact={compact} />
      ))}
    </ul>
  )
}
// Tiap tingkat baterai punya kru dan kalimatnya sendiri, jadi karakternya ikut bereaksi, bukan cuma balonnya.
const LINES: [number, CrewKind, string][] = [
  [75, "yeti", "Penuh! Pulang masih semangat."],
  [65, "kid", "Aman, capeknya sepadan."],
  [50, "cat", "Hmm, ada yang bikin capek."],
  [0, "ghost", "Merah nih. Coba tempat yang lebih dekat."],
]

export const crewFor = (level: number) => LINES.find(([min]) => level >= min)![1]

/** Kru di kaki baterai, kalimatnya ikut level. Kunci berganti saat kalimat berganti supaya balonnya muncul ulang. */
export function CrewSays({ level, height = 150, className }: { level: number; height?: number; className?: string }) {
  const [, kind, line] = LINES.find(([min]) => level >= min)!
  return (
    <div className={cn("flex items-end gap-2", className)}>
      <span key={kind} className="sk-in flex-none" style={{ "--rot": "-3deg" } as React.CSSProperties}>
        <CrewDoodle kind={kind} height={height} />
      </span>
      <p key={line} aria-live="polite" className="sk-in sk-card sk-raise-sm mb-12 px-3 py-1.5 font-hand text-[19px] leading-tight" style={{ "--rot": "-2deg" } as React.CSSProperties}>
        {line}
      </p>
    </div>
  )
}

/* Share link: state disimpan di location.hash. Hash adalah input dari luar, jadi setiap nilai divalidasi. */
import { BUDGET_MAX, BUDGET_MIN, BUDGET_STEP, DUR, GROUP, HOME, MODE, MOOD, START, TUA_PER_ORANG, type State } from "./data"
import { bestOf, byId, hotel, isStay, plans } from "./engine"
import { clamp } from "./format"
import { goStep } from "./store"

const own = <T extends object>(o: T, k: string | null): k is Extract<keyof T, string> => k !== null && Object.prototype.hasOwnProperty.call(o, k)

export function toHash(s: State) {
  const q = new URLSearchParams({ s: String(s.step), mood: s.mood, g: s.group, n: String(s.n), d: s.dur, w: s.waktu, h: s.home, b: String(s.budget), t: s.tua ? "1" : "0", c: String(s.capek), so: String(s.sosial), r: s.rain ? "1" : "0" })
  if (s.step > 1 && s.picks.length) q.set("p", s.picks.join("."))
  if (s.step === 3 && s.mode) q.set("m", s.mode)
  return "#" + q.toString()
}

/** State dari hash, atau null jika hash bukan rencana. Nilai yang tidak valid jatuh ke `base`. */
export function fromHash(hash: string, base: State): State | null {
  const q = new URLSearchParams(hash.replace(/^#/, ""))
  if (!q.has("d")) return null
  const num = (k: string, a: number, b: number, def: number) => {
    const v = Math.round(Number(q.get(k)))
    return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : def
  }
  const g = q.get("g"), mood = q.get("mood"), d = q.get("d"), w = q.get("w"), h = q.get("h"), m = q.get("m")
  const s: State = { ...base, cat: "semua", picks: [] }
  if (own(MOOD, mood)) s.mood = mood
  if (own(GROUP, g)) s.group = g
  if (own(DUR, d)) s.dur = d
  if (own(START, w)) s.waktu = w
  if (HOME.some((z) => z === h)) s.home = h as State["home"]
  s.n = s.group === "keluarga" || s.group === "sahabat" ? num("n", 2, 12, GROUP[s.group].n) : GROUP[s.group].n
  s.tua = q.get("t") === "1"
  s.budget = s.tua ? TUA_PER_ORANG * s.n : Math.round(num("b", BUDGET_MIN, BUDGET_MAX, s.budget) / BUDGET_STEP) * BUDGET_STEP
  s.capek = num("c", 0, 100, s.capek)
  s.sosial = num("so", 0, 100, s.sosial)
  s.rain = q.get("r") === "1"
  s.mode = own(MODE, m) ? m : null
  for (const id of (q.get("p") ?? "").split(".")) {
    const p = byId(id)
    if (!p || s.picks.includes(id)) continue
    const fits = p.cat === "stay" ? isStay(s) && !hotel(s) : s.picks.filter((x) => byId(x)?.cat !== "stay").length < DUR[s.dur].max
    if (fits) s.picks.push(id)
  }
  const step = num("s", 1, 3, 1)
  if (step === 1) return { ...s, step: 1 }
  // Tanpa pilihan, ikuti alur normal dari langkah 1 (autoPick). Rencana yang tidak lengkap berhenti di langkah 2.
  const two = s.picks.length ? { ...s, step: 2 as const } : goStep({ ...s, step: 1 }, 2).s
  if (step === 2) return two
  const three = goStep(two, 3)
  return three.toast ? two : { ...three.s, mode: three.s.mode ?? bestOf(plans(three.s)).m }
}

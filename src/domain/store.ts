/* Transisi state murni. UI hanya memanggil fungsi ini lalu menampilkan toast jika ada. */
import { DUR, GROUP, MOOD, TUA_PER_ORANG, type DurKey, type GroupKey, type MoodKey, type State, type Step } from "./data"
import { autoPick, bestOf, byId, countStops, hotel, isStay, plans } from "./engine"
import { clamp } from "./format"

export interface Result {
  s: State
  toast?: string
}

const lockTua = (s: State): State => (s.tua ? { ...s, budget: TUA_PER_ORANG * s.n } : s)

export function goStep(s: State, n: Step): Result {
  let x = s
  // Keluar dari langkah 1 selalu memilih ulang, supaya pilihan lama tidak nyangkut setelah kondisi berubah.
  if (s.step === 1 && n > 1) x = { ...x, picks: autoPick(x), cat: "semua" }
  if (n === 3) {
    if (isStay(x) && !hotel(x)) return { s: x, toast: "Pilih satu penginapan dulu" }
    if (!countStops(x) && !hotel(x)) return { s: x, toast: "Pilih minimal satu tempat" }
    if (!x.mode) x = { ...x, mode: bestOf(plans(x)).m }
  }
  return { s: { ...x, step: n } }
}

export const setMood = (s: State, mood: MoodKey): State => ({ ...s, mood, capek: MOOD[mood].c, sosial: MOOD[mood].s })
export const setGroup = (s: State, group: GroupKey): State => lockTua({ ...s, group, n: GROUP[group].n })
export const addPeople = (s: State, d: number): State => lockTua({ ...s, n: clamp(s.n + d, 2, 12) })
export const toggleTua = (s: State): State => lockTua({ ...s, tua: !s.tua })
export const setDur = (s: State, dur: DurKey): State => ({ ...s, dur })

export function togglePick(s: State, id: string): Result {
  const p = byId(id)
  if (!p) return { s }
  let picks = s.picks, toast: string | undefined
  if (picks.includes(id)) picks = picks.filter((x) => x !== id)
  else if (p.cat === "stay") picks = [...picks.filter((x) => byId(x)?.cat !== "stay"), id]
  else {
    const ns = picks.filter((x) => byId(x)?.cat !== "stay")
    if (ns.length >= DUR[s.dur].max) {
      picks = picks.filter((x) => x !== ns[0])
      toast = `${byId(ns[0])?.name} diganti`
    }
    picks = [...picks, id]
  }
  return { s: { ...s, picks, mode: null }, toast }
}

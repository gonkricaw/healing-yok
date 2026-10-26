/* Mesin skor dan jadwal. Murni: semua fungsi menerima State, tidak menyentuh DOM. Model skor: HANDOFF.md §6. */
import { CAT, DUR, MODE, MODES, P, START, Z, type ModeKey, type Place, type State, type ZoneKey } from "./data"
import { clamp, dmin, rpS } from "./format"

export type Stop = Place & { swapped?: string }
export type TlItem =
  | { k: "day"; ti: string }
  | { k: "go" | "stop" | "stay" | "end"; t: number; ti: string; sub?: string; sw?: string }
export interface Plan {
  m: ModeKey
  tl: TlItem[]
  trans: number
  roadMin: number
  placeCost: number
  stayCost: number
  total: number
  over: number
  score: number
  stress: number
  /** Rincian skor Healing Bersih: segar dikurangi jalan, budget, dan lama. Dipakai baterai. */
  parts: { segar: number; jalan: number; budget: number; lama: number }
}
export interface Advice {
  w: boolean
  b: string
  t: string
}

export const byId = (id: string) => P.find((p) => p.id === id)
export const isStay = (s: State) => DUR[s.dur].nights > 0
export const kids = (s: State) => s.group === "keluarga"
export const hours = (s: State) => (s.dur === "half" ? 5 : DUR[s.dur].nights ? DUR[s.dur].h : Math.max(5, Math.min(11, 23.5 - START[s.waktu])))

export function dist(a: ZoneKey, b: ZoneKey) {
  if (a === b) return 5
  const A = Z[a], B = Z[b]
  return Math.round(Math.hypot(A.x - B.x, A.y - B.y) * 1.25 + 3)
}

/** Skor kecocokan tempat 0..99. */
export function fit(s: State, p: Place) {
  const so = s.sosial / 100, c = s.capek / 100, d = DUR[s.dur]
  let f = p.heal - Math.abs(p.crowd - so) * 30
  if (kids(s) && !p.kids) f -= 25
  const km = dist(s.home, p.zone)
  f -= km * 0.2 * (0.5 + c)
  if (s.dur === "half" && km > 35) f -= 18
  if (p.cat !== "stay" && !d.nights && !p.best.includes(s.waktu)) f -= s.dur === "half" ? 9 : 4
  if (p.active) {
    f -= Math.max(0, c - 0.45) * 40
    if (s.mood === "seru") f += 6
  }
  const pp = s.budget / s.n
  const pc = p.cat === "stay" ? ((p.price ?? 0) * d.nights) / Math.min(p.cap ?? 1, s.n) : (p.cost ?? 0)
  if (pc > pp * 0.6) f -= 15
  if (s.rain && !p.indoor) f -= 18
  return Math.round(clamp(f, 0, 99))
}

export const avail = (s: State) => P.filter((p) => isStay(s) || p.cat !== "stay")
const nonStay = (picks: string[]) => picks.filter((id) => byId(id)?.cat !== "stay")
export const countStops = (s: State) => nonStay(s.picks).length

/** Penginapan terbaik (jika staycation) lalu tempat teratas dengan kategori berbeda. */
export function autoPick(s: State) {
  const list = avail(s).map((p) => ({ p, f: fit(s, p) })).sort((a, b) => b.f - a.f)
  const picks: string[] = [], cats = new Set<string>()
  if (isStay(s)) {
    const h = list.find((x) => x.p.cat === "stay")
    if (h) picks.push(h.p.id)
  }
  for (const x of list) {
    if (x.p.cat === "stay" || cats.has(x.p.cat)) continue
    if (nonStay(picks).length >= DUR[s.dur].max) break
    picks.push(x.p.id)
    cats.add(x.p.cat)
  }
  return picks
}

export const hotel = (s: State) => s.picks.map(byId).find((p) => p?.cat === "stay")

/** Tempat terpilih non-stay, diganti Plan B saat hujan, diurutkan pagi ke malam. */
export function stops(s: State): Stop[] {
  let st: Stop[] = s.picks.map(byId).filter((p): p is Place => !!p && p.cat !== "stay")
  if (s.rain) {
    const used = new Set(s.picks)
    st = st.map((p) => {
      if (p.indoor) return p
      const alt = P.filter((q) => q.cat !== "stay" && q.indoor && !used.has(q.id)).sort((a, b) => fit(s, b) - fit(s, a))[0]
      if (!alt) return p
      used.add(alt.id)
      return { ...alt, swapped: p.name }
    })
  }
  const rank = (p: Place) => (["pagi", "siang", "sore", "malam"] as const).findIndex((w) => p.best.includes(w))
  return st.map((p, i) => ({ p, i })).sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i).map((x) => x.p)
}

/** Zona yang dilewati berurutan (penginapan dulu), untuk peta rute. */
export const routeZones = (s: State): ZoneKey[] => {
  const h = isStay(s) ? hotel(s) : undefined
  return [...(h ? [h.zone] : []), ...stops(s).map((p) => p.zone)]
}

export function leg(s: State, m: ModeKey, km: number) {
  const n = s.n
  let c = 0, t = 0
  if (m === "umum") { c = n * (4000 + Math.min(km * 280, 16000)); t = (km / 16) * 60 + 18; if (km > 45) t *= 1.3 }
  if (m === "motor") { c = Math.ceil(n / 2) * km * 380; t = (km / 26) * 60 + 5 }
  if (m === "mobil") { c = Math.ceil(n / 7) * (km * 1300 + (km > 14 ? 13000 : 0)); t = (km / 18) * 60 + 10 }
  if (m === "taksi") { c = Math.ceil(n / 4) * (12000 + km * 4300); t = (km / 21) * 60 + 7 }
  if (m === "mix") { c = n * (4000 + Math.min(km * 260, 14000)) + (n > 2 ? Math.ceil(n / 4) * 22000 : n * 13000); t = (km / 19) * 60 + 12 }
  return { c, t: Math.round(t) }
}

export function stress(s: State, m: ModeKey) {
  const k = kids(s)
  return {
    umum: 0.5 + (k ? 0.2 : 0) + (s.dur === "half" ? 0 : 0.05),
    motor: 0.38 + (s.rain ? 0.4 : 0.08) + (k ? 0.35 : 0) + (s.n > 2 ? 0.1 : 0),
    mobil: 0.42,
    taksi: 0.16,
    mix: 0.3 + (k ? 0.1 : 0) + (s.rain ? 0.08 : 0),
  }[m]
}

/** Jadwal, ruas, biaya, dan skor Healing Bersih untuk satu moda. */
export function plan(s: State, m: ModeKey): Plan {
  const d = DUR[s.dur], st = stops(s), h = hotel(s), tl: TlItem[] = [], legs: { km: number; c: number; t: number }[] = []
  const go = (from: ZoneKey, to: ZoneKey, t: number, label: string) => {
    const km = dist(from, to), L = leg(s, m, km)
    legs.push({ km, ...L })
    tl.push({ k: "go", t, ti: label, sub: `${MODE[m].l}, ${dmin(L.t)}, ±${km} km` })
    return t + L.t / 60
  }
  if (d.nights && h) {
    for (let k = 0; k <= d.nights; k++) {
      tl.push({ k: "day", ti: `Hari ${k + 1}` })
      let t: number, pos = h.zone
      if (k === 0) {
        t = go(s.home, h.zone, START[s.waktu], `Berangkat dari ${Z[s.home].n}`)
        if (t < 14) { tl.push({ k: "stay", t, ti: `Titip barang di ${h.name}`, sub: "Check-in kamar jam 14.00" }); t = Math.max(t + 0.5, 14.5) }
        else { tl.push({ k: "stay", t, ti: `Check-in di ${h.name}`, sub: "Taruh barang, istirahat sebentar" }); t += 0.75 }
      } else {
        t = 7.5
        tl.push({ k: "stay", t, ti: `Sarapan dan santai di ${h.name}`, sub: "Tidak perlu buru-buru" })
        t = 10
      }
      const p = st[k]
      if (p) { t = go(pos, p.zone, t, `Jalan ke ${p.name}`); tl.push({ k: "stop", t, ti: p.name, sub: `${CAT[p.cat]}, sekitar 2,5 jam`, sw: p.swapped }); t += 2.5; pos = p.zone }
      if (k < d.nights) {
        if (p) t = go(pos, h.zone, t, `Balik ke ${h.name}`)
        tl.push({ k: "stay", t: Math.max(t, 18.5), ti: "Malam santai di penginapan", sub: "Makan malam, berenang, atau tidur cepat" })
      } else {
        t = go(pos, s.home, Math.max(t, 12), "Pulang")
        tl.push({ k: "end", t, ti: "Sampai rumah", sub: "Masih ada waktu istirahat sebelum Senin" })
      }
    }
  } else {
    const pts = [s.home, ...st.map((p) => p.zone), s.home]
    const road = pts.slice(1).reduce((a, z, i) => a + leg(s, m, dist(pts[i], z)).t, 0) / 60
    const stayH = clamp((hours(s) - road) / Math.max(1, st.length), 1, s.dur === "half" ? 2.5 : 3.5)
    let t = START[s.waktu], pos = s.home
    st.forEach((p, i) => {
      t = go(pos, p.zone, t, i ? `Lanjut ke ${p.name}` : `Berangkat dari ${Z[s.home].n}`)
      tl.push({ k: "stop", t, ti: p.name, sub: `${CAT[p.cat]}, sekitar ${dmin(Math.round(stayH * 60))}`, sw: p.swapped })
      t += stayH
      pos = p.zone
    })
    t = go(pos, s.home, t, "Pulang")
    tl.push({ k: "end", t, ti: "Sampai rumah" })
  }
  const nStops = st.length + (h ? 1 : 0)
  const park = m === "motor" ? Math.ceil(s.n / 2) * 5000 * nStops : m === "mobil" ? Math.ceil(s.n / 7) * 12000 * nStops : 0
  const trans = legs.reduce((a, l) => a + l.c, 0) + park
  const roadMin = legs.reduce((a, l) => a + l.t, 0)
  const placeCost = st.reduce((a, p) => a + (p.cost ?? 0) * s.n, 0)
  const stayCost = h ? Math.ceil(s.n / (h.cap ?? 1)) * (h.price ?? 0) * d.nights + s.n * 90000 * d.nights : 0
  const total = trans + placeCost + stayCost
  const fits = st.map((p) => fit(s, p))
  if (h) fits.push(fit(s, h), fit(s, h))
  const base = fits.length ? fits.reduce((a, b) => a + b, 0) / fits.length : 0
  const over = Math.max(0, total - s.budget) / s.budget
  const roadH = roadMin / 60
  const parts = {
    segar: base,
    jalan: stress(s, m) * roadH * 13 * (0.6 + s.capek / 100),
    budget: over * 35,
    lama: !d.nights && roadH / hours(s) > 0.4 ? 10 : 0,
  }
  const score = parts.segar - parts.jalan - parts.budget - parts.lama
  return { m, tl, trans, roadMin, placeCost, stayCost, total, over, score: Math.round(clamp(score, 0, 99)), stress: stress(s, m), parts }
}

export const plans = (s: State) => MODES.map((m) => plan(s, m))
export const bestOf = (all: Plan[]) => all.reduce((a, b) => (b.score > a.score ? b : a))
export const cheapestOf = (all: Plan[]) => all.reduce((a, b) => (b.total < a.total ? b : a))

/**
 * Baterai pulang: rencana yang akan didapat dari kondisi sekarang. Di langkah 1 memakai pilihan otomatis,
 * setelahnya memakai pilihan pengguna. Moda mengikuti pilihan, atau yang paling seimbang.
 */
export function projection(s: State) {
  const x = s.step === 1 || !s.picks.length ? { ...s, picks: autoPick(s) } : s
  const all = plans(x)
  const plan = all.find((p) => p.m === x.mode) ?? bestOf(all)
  return { plan, places: stops(x), hotel: hotel(x) }
}

export const label = (sc: number): [string, string] =>
  sc >= 80 ? ["Healing maksimal", "Pulang dengan baterai penuh"] : sc >= 65 ? ["Healing aman", "Capeknya sepadan"] : sc >= 50 ? ["Lumayan, tapi ada catatan", "Baca saran di bawah"] : ["Capek di jalan", "Lebih banyak macet daripada healing"]

/** Saran jujur untuk satu rencana, dibandingkan dengan semua moda. */
export function advice(s: State, p: Plan, all: Plan[]): Advice[] {
  const out: Advice[] = [], d = DUR[s.dur], best = bestOf(all)
  if (p.over > 0) {
    const ok = all.filter((x) => x.total <= s.budget).sort((a, b) => b.score - a.score)[0]
    out.push({ w: true, b: `Lewat budget ${rpS(p.total - s.budget)}`, t: ok ? `Ganti ke ${MODE[ok.m].l.toLowerCase()} supaya masih masuk budget.` : "Kurangi satu tempat atau pilih yang gratis masuk, seperti taman publik." })
  }
  if (!d.nights && p.roadMin / 60 / hours(s) > 0.4) out.push({ w: true, b: "Waktu di jalan terlalu lama", t: `Sekitar ${dmin(p.roadMin)} habis di perjalanan dari total ${Math.round(hours(s))} jam. Pilih tempat yang lebih dekat ke ${Z[s.home].n}.` })
  if (p.m === "motor" && kids(s)) out.push({ w: true, b: "Motor kurang cocok bawa anak", t: "Jarak jauh di motor bikin anak rewel dan orang tua capek. Coba taksi online atau mix." })
  if (p.m === "motor" && s.rain) out.push({ w: true, b: "Hujan dan motor", t: "Bisa basah sebelum sampai. Siapkan jas hujan atau ganti moda." })
  if (p.m === "umum" && s.capek > 65) out.push({ w: true, b: "Kamu sedang capek", t: "Desak-desakan di jam ramai bisa menghabiskan energi healing. Mix atau taksi online lebih ringan." })
  if (p.m !== best.m && best.score - p.score >= 6) out.push({ w: false, b: `Coba ${MODE[best.m].l.toLowerCase()}`, t: `Skor healing naik ${best.score - p.score} poin dengan selisih biaya ${(best.total >= p.total ? "+" : "−") + rpS(Math.abs(best.total - p.total))}.` })
  const sp = stops(s).filter((x) => x.active)
  if (sp.length) out.push({ w: false, b: "Bawa perlengkapan olahraga", t: `Untuk ${sp.map((x) => x.name).join(" dan ")}: baju ganti, handuk, dan air minum.${sp.some((x) => /renang|Pantai/i.test(x.name)) ? " Jangan lupa sunblock." : ""}` })
  if (s.waktu === "malam" && s.dur === "full") out.push({ w: false, b: "Full day dari malam", t: "Kamu akan pulang lewat tengah malam. Pastikan transportasi pulang masih tersedia." })
  if (p.score < 50) {
    const near = avail(s).filter((x) => x.cat !== "stay" && dist(s.home, x.zone) <= 12).sort((a, b) => fit(s, b) - fit(s, a))[0]
    if (near) out.push({ w: false, b: "Jujur saja", t: `Healing tidak harus jauh. ${near.name} lebih dekat dan bisa jadi pilihan yang lebih menenangkan.` })
  }
  if (!out.length) out.push({ w: false, b: "Rencana ini sehat", t: "Budget aman, perjalanan tidak menguras tenaga. Tinggal berangkat." })
  return out
}

import { describe, expect, it } from "vitest"
import { DUR, GROUP, HOME, INITIAL, START, type State } from "./data"
import { advice, bestOf, byId, cheapestOf, countStops, hotel, plan, plans, projection, stops } from "./engine"
import { fromHash, toHash } from "./share"
import { addPeople, goStep, setDur, setGroup, toggleTua } from "./store"

const at3 = (s: State) => goStep(goStep(s, 2).s, 3)

describe("checklist HANDOFF §9", () => {
  it("semua kombinasi durasi × waktu × grup × hujan × zona sampai ke langkah 3 tanpa NaN", () => {
    let n = 0
    for (const dur of Object.keys(DUR) as State["dur"][])
      for (const waktu of Object.keys(START) as State["waktu"][])
        for (const group of Object.keys(GROUP) as State["group"][])
          for (const rain of [false, true])
            for (const home of HOME) {
              const r = at3({ ...INITIAL, dur, waktu, group, n: GROUP[group].n, rain, home })
              expect(r.s.step, `${dur} ${waktu} ${group} ${home}`).toBe(3)
              for (const p of plans(r.s)) {
                expect(Number.isFinite(p.score) && Number.isFinite(p.total)).toBe(true)
                expect(advice(r.s, p, plans(r.s)).length).toBeGreaterThan(0)
              }
              n++
            }
    expect(n).toBe(1152)
  })

  it("mode tanggal tua mengunci budget dan ikut jumlah orang", () => {
    let s = toggleTua(INITIAL)
    expect(s.budget).toBe(200000)
    s = addPeople(s, 1)
    expect([s.n, s.budget]).toEqual([5, 250000])
    s = setGroup(s, "pasangan")
    expect([s.n, s.budget]).toEqual([2, 100000])
  })

  it("staycation tanpa penginapan memunculkan toast", () => {
    const two = goStep({ ...INITIAL, dur: "stay1" }, 2).s
    const r = goStep({ ...two, picks: two.picks.filter((id) => byId(id)?.cat !== "stay") }, 3)
    expect(r.toast).toBe("Pilih satu penginapan dulu")
    expect(r.s.step).toBe(2)
  })

  it("Plan B hujan mengganti tempat outdoor dan menandainya", () => {
    const dry = at3(INITIAL).s
    expect(stops(dry).some((p) => !p.indoor)).toBe(true)
    const wet = { ...dry, rain: true }
    expect(stops(wet).every((p) => p.indoor)).toBe(true)
    const marked = plan(wet, "taksi").tl.filter((x) => x.k === "stop" && x.sw)
    expect(marked.length).toBe(stops(dry).filter((p) => !p.indoor).length)
  })
})

describe("baterai pulang (rincian skor)", () => {
  it("komponen skor menjumlah ke skor yang ditampilkan", () => {
    for (const dur of Object.keys(DUR) as State["dur"][])
      for (const group of Object.keys(GROUP) as State["group"][]) {
        const s = at3({ ...INITIAL, dur, group, n: GROUP[group].n }).s
        for (const p of plans(s)) {
          const raw = p.parts.segar - p.parts.jalan - p.parts.budget - p.parts.lama
          expect(p.score).toBe(Math.round(Math.min(99, Math.max(0, raw))))
          expect(p.parts.jalan).toBeGreaterThanOrEqual(0)
          expect(p.parts.budget).toBeGreaterThanOrEqual(0)
        }
      }
  })

  it("default membuka baterai hijau (>= 65) dengan tempat dekat", () => {
    const pr = projection(INITIAL)
    expect(pr.plan.score).toBeGreaterThanOrEqual(65)
    expect(pr.plan.roadMin).toBeLessThan(120)
  })

  it("proyeksi di langkah 1 memakai pilihan otomatis dan moda terbaik", () => {
    const pr = projection(INITIAL)
    const s3 = at3(INITIAL).s
    expect(pr.plan.score).toBe(bestOf(plans(s3)).score)
    expect(pr.places.length).toBeGreaterThan(0)
  })

  it("dengan tempat yang sama, makin capek baterai pulang tidak naik", () => {
    // Pilihan otomatis boleh pindah saat kondisi berubah; sifat monoton hanya berlaku untuk pilihan tetap.
    const two = goStep(INITIAL, 2).s
    for (const m of ["umum", "motor", "mobil", "taksi", "mix"] as const) {
      const segar = plan({ ...two, capek: 10 }, m).score
      const remuk = plan({ ...two, capek: 95 }, m).score
      expect(remuk).toBeLessThanOrEqual(segar)
    }
  })
})

describe("skenario demo saran jujur", () => {
  it("keluarga 4 orang, staycation 2 malam, budget Rp900 rb: skor jatuh dan saran muncul", () => {
    // Skenario HANDOFF §9, ditulis eksplisit supaya tidak bergantung pada default.
    const s = at3({ ...INITIAL, mood: "bosan", capek: 35, sosial: 60, waktu: "pagi", dur: "stay2" }).s
    const all = plans(s), p = plan(s, s.mode!)
    expect(p.score).toBeLessThan(50)
    const tips = advice(s, p, all).map((a) => a.b)
    expect(tips.some((b) => b.startsWith("Lewat budget"))).toBe(true)
    expect(tips).toContain("Jujur saja")
    expect(bestOf(all).m).toBeDefined()
    expect(cheapestOf(all).total).toBe(Math.min(...all.map((x) => x.total)))
  })
})

describe("bug: pilihan lama nyangkut setelah ganti durasi", () => {
  it("lompat langsung ke langkah 3 dari langkah 1 memilih ulang sesuai durasi baru", () => {
    let s = at3({ ...INITIAL, dur: "stay2" }).s
    s = goStep(s, 1).s
    s = setDur(s, "half")
    const r = goStep(s, 3)
    expect(r.s.step).toBe(3)
    expect(hotel(r.s)).toBeUndefined()
    expect(countStops(r.s)).toBeLessThanOrEqual(DUR.half.max)
  })
})

describe("share link", () => {
  it("round trip langkah 3 menghasilkan rencana yang sama", () => {
    const s = at3({ ...INITIAL, dur: "stay2", group: "sahabat", n: 6, home: "bekasi", rain: true }).s
    const back = fromHash(toHash(s), INITIAL)!
    expect(back).toEqual(s)
    expect(plan(back, back.mode!).total).toBe(plan(s, s.mode!).total)
  })

  it("hash kosong atau asing bukan rencana", () => {
    expect(fromHash("", INITIAL)).toBeNull()
    expect(fromHash("#foo=bar", INITIAL)).toBeNull()
  })

  it("nilai rusak jatuh ke default yang aman", () => {
    const s = fromHash("#s=9&d=__proto__&g=constructor&n=999&b=-5&c=abc&so=1e9&h=mars&m=toString&p=villa.villa.x.tebet.monas.banteng.kotatua", INITIAL)!
    expect(s.dur).toBe(INITIAL.dur)
    expect(s.group).toBe(INITIAL.group)
    expect(s.n).toBe(12)
    expect(s.budget).toBe(50000)
    expect(s.capek).toBe(INITIAL.capek)
    expect(s.sosial).toBe(100)
    expect(s.home).toBe(INITIAL.home)
    expect(hotel(s)).toBeUndefined()
    expect(countStops(s)).toBeLessThanOrEqual(DUR.full.max)
    expect(s.step).toBe(3)
    expect(s.mode).not.toBe("toString")
  })

  it("staycation tanpa penginapan di link berhenti di langkah 2", () => {
    const s = fromHash("#s=3&d=stay1&p=tebet", INITIAL)!
    expect(s.step).toBe(2)
  })
})

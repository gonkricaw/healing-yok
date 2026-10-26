import { useMemo } from "react"
import { BUDGET_MAX, BUDGET_MIN, BUDGET_STEP, DUR, GROUP, HOME, MOOD, START, WAKTU, Z, type DurKey, type GroupKey, type MoodKey, type State, type Waktu, type ZoneKey } from "@/domain/data"
import { isStay, projection } from "@/domain/engine"
import { clock, rp, rpS } from "@/domain/format"
import { addPeople, setDur, setGroup, setMood, toggleTua } from "@/domain/store"
import { Btn, Chip, Question, Slider, Tile, Toggle } from "./controls"
import { MapCard } from "./MapCard"
import { Battery, BatteryStrip } from "./sketch/Battery"
import { ChargeNotes, CrewSays, crewFor } from "./sketch/ChargeNotes"
import { Doodle } from "./sketch/Doodles"
import { CrewDoodle } from "@/components/ui/doodle-crew-footer-sunny"

const capekText = (v: number) => (v < 25 ? "masih segar" : v < 50 ? "agak capek" : v < 75 ? "capek" : "remuk")
const sosialText = (v: number) => (v < 30 ? "pengin sepi" : v < 70 ? "boleh ramai sedikit" : "pengin ramai")
const keys = <T extends object>(o: T) => Object.keys(o) as (keyof T)[]
// Ikon kecil bergaris tangan, satu bobot dengan garis tinta lain.
const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="mx-auto size-5" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
)

export function StepKondisi({ s, set, onNext }: { s: State; set: (fn: (s: State) => State) => void; onNext: () => void }) {
  const pr = useMemo(() => projection(s), [s])
  const score = pr.plan.score
  const { segar, jalan, budget, lama } = pr.plan.parts

  return (
    <div className="grid grid-cols-1 gap-x-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] xl:gap-x-20">
      {/* Mobile: baterai jadi strip yang menempel di atas. */}
      <div className="sticky top-0 z-20 -mx-4 border-b-[2.5px] border-ink bg-page/95 px-4 py-2.5 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden">
        <div className="flex items-center gap-3">
          <span key={crewFor(score)} className="sk-in -my-2 flex-none">
            <CrewDoodle kind={crewFor(score)} height={58} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="font-hand text-[18px] leading-none whitespace-nowrap">Baterai pulang</span>
              <BatteryStrip level={score} className="flex-1" />
              <b className="num w-9 text-right font-display text-[26px] leading-none">{score}</b>
            </div>
        <p className="num mt-1.5 font-hand text-[16px] leading-tight text-muted">
          <span className="whitespace-nowrap text-leaf">+{Math.round(segar)} segar</span> · <span className="whitespace-nowrap text-warn">−{Math.round(jalan)} jalan</span>
          {lama >= 0.5 && <span className="text-warn"> · <span className="whitespace-nowrap">−{Math.round(lama)} kelamaan</span></span>}
          {budget >= 0.5 && <span className="text-warn"> · <span className="whitespace-nowrap">−{Math.round(budget)} budget</span></span>}
        </p>
          </div>
        </div>
      </div>

      {/* Desktop: baterai setinggi layar, menempel saat form digulir. */}
      <aside className="hidden lg:row-span-2 lg:block">
        <div className="sticky top-4 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-6 pt-4">
          <div className="relative">
            <Battery level={score} className="mx-auto h-[min(68vh,620px)] w-auto -rotate-2 [filter:drop-shadow(9px_9px_0_var(--color-ink))]" />
            <Doodle kind="star" size={34} className="-top-2 left-2" style={{ "--rot": "-12deg" } as React.CSSProperties} />
            <Doodle kind="sparkle" size={26} className="top-1/3 -right-3" style={{ "--d": "-1.4s" } as React.CSSProperties} />
            <Doodle kind="heart" size={28} className="bottom-6 -left-4" style={{ "--d": "-2.6s", "--rot": "10deg" } as React.CSSProperties} />
          </div>
          <div>
            <ChargeNotes plan={pr.plan} places={pr.places} hotel={pr.hotel} budget={s.budget} people={s.n} />
            <CrewSays level={score} className="mt-6" />
          </div>
        </div>
      </aside>

      <section className="min-w-0 pt-6 lg:col-start-2 lg:pt-10">
        <h1 className="sk-in font-display text-[clamp(40px,5.4vw,80px)] leading-[0.92] tracking-[-0.02em] text-balance">Pulang masih penuh, atau habis di jalan?</h1>
        <p className="sk-in mt-5 max-w-[44ch] text-[17px] font-medium" style={{ "--d": "120ms" } as React.CSSProperties}>
          Kami hitung rasa segar tempatnya dikurangi capek perjalanan. Geser kondisimu, baterainya ikut berubah.
        </p>

        <Question>Lagi merasa apa?</Question>
        <div className="flex flex-wrap gap-2.5">
          {keys(MOOD).map((k, i) => (
            <Chip key={k} i={i} on={s.mood === k} onClick={() => set((x) => setMood(x, k as MoodKey))}>
              {MOOD[k].l}
            </Chip>
          ))}
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-2">
          <Slider
            id="capek"
            label="Tingkat capek"
            min={0}
            max={100}
            value={s.capek}
            valueText={capekText(s.capek)}
            ends={["masih segar", "remuk"]}
            head={
              <div className="flex items-baseline justify-between gap-2">
                <b className="text-[15px]">Seberapa capek?</b>
                <span className="font-hand text-[19px]">{capekText(s.capek)}</span>
              </div>
            }
            onChange={(v) => set((x) => ({ ...x, capek: v }))}
          />
          <Slider
            id="sosial"
            label="Baterai sosial"
            min={0}
            max={100}
            value={s.sosial}
            valueText={sosialText(s.sosial)}
            ends={["pengin sepi", "pengin ramai"]}
            head={
              <div className="flex items-baseline justify-between gap-2">
                <b className="text-[15px]">Baterai sosial</b>
                <span className="font-hand text-[19px]">{sosialText(s.sosial)}</span>
              </div>
            }
            onChange={(v) => set((x) => ({ ...x, sosial: v }))}
          />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Btn onClick={onNext} className="px-7 py-3.5 text-[17px]">
            Cari tempat healing
          </Btn>
          <span className="font-hand text-[19px] text-muted">atau atur detailnya di bawah</span>
        </div>
      </section>

      <section className="min-w-0 pb-6 lg:col-start-2">
        <Question>Healing sama siapa?</Question>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {keys(GROUP).map((k, i) => (
            <Tile key={k} i={i} on={s.group === k} onClick={() => set((x) => setGroup(x, k as GroupKey))} title={GROUP[k].l} sub={GROUP[k].s} />
          ))}
        </div>
        {(s.group === "keluarga" || s.group === "sahabat") && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-hand text-[19px]">Jumlah orang</span>
            <div className="sk-card inline-flex items-center gap-1 p-1">
              <button type="button" aria-label="Kurangi" className="grid size-9 place-items-center rounded-full border-2 border-ink bg-paper2 disabled:opacity-40" disabled={s.n <= 2} onClick={() => set((x) => addPeople(x, -1))}>
                <Glyph d="M6 12.5 C9 11.6 14 12.2 18 11.6" />
              </button>
              <output className="num min-w-[78px] text-center font-display text-[18px]" aria-live="polite">
                {s.n} orang
              </output>
              <button type="button" aria-label="Tambah" className="grid size-9 place-items-center rounded-full border-2 border-ink bg-paper2 disabled:opacity-40" disabled={s.n >= 12} onClick={() => set((x) => addPeople(x, 1))}>
                <Glyph d="M6 12.5 C9 11.6 14 12.2 18 11.6 M12.2 6 C11.6 9 12.4 14 11.8 18" />
              </button>
            </div>
          </div>
        )}

        <Question>Berapa lama?</Question>
        <div className="grid grid-cols-2 gap-2.5">
          {keys(DUR).map((k, i) => (
            <Tile key={k} i={i + 1} on={s.dur === k} onClick={() => set((x) => setDur(x, k as DurKey))} title={DUR[k].l} sub={DUR[k].s} />
          ))}
        </div>

        <Question>{isStay(s) ? "Berangkat kapan?" : "Mulai jam berapa?"}</Question>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {keys(START).map((k, i) => (
            <Tile key={k} i={i + 2} on={s.waktu === k} onClick={() => set((x) => ({ ...x, waktu: k as Waktu }))} title={WAKTU[k]} sub={"mulai " + clock(START[k])} />
          ))}
        </div>

        <Question hint="ketuk zona di peta juga bisa">Berangkat dari</Question>
        <select
          aria-label="Berangkat dari"
          className="sk-card w-full appearance-none px-4 py-3 font-bold"
          value={s.home}
          onChange={(e) => set((x) => ({ ...x, home: e.target.value as ZoneKey }))}
        >
          {HOME.map((z) => (
            <option key={z} value={z}>
              {Z[z].n}
            </option>
          ))}
        </select>
        <MapCard className="mt-3" home={s.home} route={[]} onPick={(z) => set((x) => ({ ...x, home: z }))} label={`Peta zona Jabodetabek, titik berangkat ${Z[s.home].n}`} />

        <Question hint="untuk semua orang">Budget total</Question>
        <Slider
          id="budget"
          label="Budget total"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={s.budget}
          disabled={s.tua}
          valueText={`${rp(s.budget)}, ${rpS(s.budget / s.n)} per orang`}
          ends={["Rp50 rb", "Rp5 jt"]}
          head={
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="num font-display text-[26px] leading-none">{rp(s.budget)}</span>
              <span className="font-hand text-[19px]">{rpS(s.budget / s.n)} per orang</span>
            </div>
          }
          onChange={(v) => set((x) => ({ ...x, budget: v }))}
        />
        <Toggle on={s.tua} onClick={() => set(toggleTua)} title="Mode tanggal tua" sub="kunci budget Rp50 rb per orang, tetap bisa healing" />
      </section>
    </div>
  )
}

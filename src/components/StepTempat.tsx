import { useMemo } from "react"
import { CAT, DUR, GROUP, WAKTU, Z, type Cat, type State } from "@/domain/data"
import { avail, dist, fit, isStay, projection } from "@/domain/engine"
import { crowdL, rpS } from "@/domain/format"
import { cn } from "@/lib/utils"
import { Chip } from "./controls"
import { Battery, BatteryStrip, chargeColor } from "./sketch/Battery"
import { ChargeNotes } from "./sketch/ChargeNotes"

export function StepTempat({ s, set, pick }: { s: State; set: (fn: (s: State) => State) => void; pick: (id: string) => void }) {
  const d = DUR[s.dur]
  const pr = useMemo(() => projection(s), [s])
  const cats = ["semua", ...(Object.keys(CAT) as Cat[]).filter((c) => c !== "stay" || isStay(s))] as (Cat | "semua")[]
  const list = avail(s)
    .filter((p) => s.cat === "semua" || p.cat === s.cat)
    .map((p) => ({ p, f: fit(s, p) }))
    .sort((a, b) => b.f - a.f)

  return (
    <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.62fr)] xl:gap-x-16">
      <section className="min-w-0 lg:col-start-1">
        <h2 className="sk-in mt-7 font-display text-[clamp(32px,4vw,56px)] leading-[0.95] tracking-[-0.01em] text-balance">Tempat yang mengisi baterai</h2>
        <p className="mt-3 max-w-[52ch] text-[16px] font-medium">
          Kru sudah memilihkan yang paling pas. Ganti sesukamu, maksimal {d.max} tempat{isStay(s) ? " plus 1 penginapan" : ""}. Baterai di samping ikut berubah.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {[GROUP[s.group].l, `${s.n} orang`, d.l, `mulai ${WAKTU[s.waktu].toLowerCase()}`, `dari ${Z[s.home].n}`, `budget ${rpS(s.budget)}`].map((t) => (
            <span key={t} className="rounded-full border-2 border-ink bg-paper2 px-3 py-0.5 font-hand text-[17px]">
              {t}
            </span>
          ))}
        </div>
        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
          {cats.map((c, i) => (
            <Chip key={c} i={i} className="flex-none px-3.5 py-1.5 text-[13.5px]" on={s.cat === c} onClick={() => set((x) => ({ ...x, cat: c }))}>
              {c === "semua" ? "Semua" : CAT[c]}
            </Chip>
          ))}
        </div>
      </section>

      <aside className="sticky top-2 z-20 mt-2 mb-4 lg:static lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-7 lg:mb-0">
        <div className="sk-card sk-raise p-4 lg:sticky lg:top-4 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <b className="font-display text-[20px] leading-none">Baterai pulang</b>
            <span className="font-hand text-[18px] text-muted">dengan pilihan ini</span>
          </div>
          <div className="mt-3 flex items-center gap-3 lg:hidden">
            <BatteryStrip level={pr.plan.score} className="flex-1" />
            <b className="num font-display text-[28px] leading-none">{pr.plan.score}</b>
          </div>
          <div className="mt-2 hidden grid-cols-[150px_1fr] items-center gap-4 lg:grid">
            <Battery level={pr.plan.score} className="h-[300px] w-auto" />
            <ChargeNotes plan={pr.plan} places={pr.places} hotel={pr.hotel} budget={s.budget} people={s.n} className="gap-4" />
          </div>
        </div>
      </aside>

      <section className="min-w-0 lg:col-start-1">
        <div className="grid gap-4 xl:grid-cols-2">
          {list.map(({ p, f }, i) => {
            const on = s.picks.includes(p.id)
            const price = p.cat === "stay" ? `${rpS(p.price ?? 0)}/malam, ${p.cap} org/kamar` : `±${rpS(p.cost ?? 0)}/org`
            const tags = [price, crowdL(p.crowd), p.indoor ? "indoor" : "outdoor", p.kids ? "ramah anak" : "", p.active ? "bikin berkeringat" : "", p.best.length ? `enak ${p.best.join(", ")}` : ""].filter(Boolean)
            return (
              <article
                key={p.id}
                className={cn("sk-card relative flex flex-col p-4 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]", on ? "sk-raise -translate-y-0.5 bg-paper" : "bg-paper/85")}
                style={{ rotate: on ? "0deg" : i % 2 ? "0.4deg" : "-0.4deg" }}
              >
                {on && <span className="absolute -top-3 right-5 rotate-3 rounded-[6px] border-2 border-ink bg-ticket px-2 py-0.5 font-hand text-[16px]" aria-hidden="true">dipilih</span>}
                <div className="font-hand text-[17px] leading-tight text-muted">
                  {CAT[p.cat]}, {Z[p.zone].n}, ±{dist(s.home, p.zone)} km
                </div>
                <h3 className="mt-1 text-[19px] leading-snug font-extrabold tracking-[-0.015em]">{p.name}</h3>
                <p className="mt-1 flex-1 text-[14px] text-muted">{p.desc}</p>
                {p.ev && <span className="mt-2 self-start rounded-[8px_10px_7px_9px] border-2 border-ink bg-ticket px-2 py-0.5 text-[12.5px] font-bold text-[#141414]">{p.ev}</span>}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="rounded-full border-[1.5px] border-ink/60 px-2 py-px text-[12px]">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-3.5 flex items-center gap-3 border-t-2 border-dashed border-ink/40 pt-3">
                  <span className="font-hand text-[17px] leading-none">segar</span>
                  <span className="relative h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-paper2" aria-hidden="true">
                    <span className="absolute inset-0 origin-left" style={{ transform: `scaleX(${f / 100})`, backgroundColor: chargeColor(f) }} />
                  </span>
                  <b className="num w-7 font-display text-[18px] leading-none" aria-label={`kecocokan ${f}`}>
                    {f}
                  </b>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`${on ? "Batalkan" : "Pilih"} ${p.name}`}
                    onClick={() => pick(p.id)}
                    className={cn(
                      "rounded-full border-[2.5px] border-ink px-4 py-1.5 text-[13.5px] font-bold transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 active:translate-y-0.5",
                      on ? "bg-ink text-page" : "bg-paper sk-raise-sm",
                    )}
                  >
                    {on ? "Dipilih" : "Pilih"}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

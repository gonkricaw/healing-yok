import { lazy, Suspense, type CSSProperties } from "react"
import { DUR, GROUP, MODE, Z, type ModeKey, type State } from "@/domain/data"
import { advice, bestOf, cheapestOf, hotel, isStay, label, routeZones, stops, type Plan } from "@/domain/engine"
import { clock, dmin, rp, rpS } from "@/domain/format"
import { cn } from "@/lib/utils"
import { Btn, Toggle } from "./controls"
import { MapCard } from "./MapCard"
import { Battery, BatteryStrip, BatteryWide } from "./sketch/Battery"
import { ChargeNotes, noteList, noteText } from "./sketch/ChargeNotes"

const RecapPlayer = lazy(() => import("@/video/RecapPlayer"))

const H2 = ({ children, className }: { children: string; className?: string }) => (
  <h2 className={cn("mt-12 mb-3 font-display text-[clamp(26px,2.6vw,34px)] leading-tight tracking-[-0.01em]", className)}>{children}</h2>
)

// Kartu Healing: baterai gambar tangan jadi pusatnya, catatan plus minus menjelaskan isinya. Tidak ada baris statistik.
function Ticket({ s, p }: { s: State; p: Plan }) {
  const [lb, ls] = label(p.score)
  return (
    <section aria-live="polite" className="sk-card sk-raise sk-in relative mt-7 overflow-hidden bg-paper px-5 pt-6 pb-5 sm:px-7" style={{ "--rot": "-0.6deg" } as CSSProperties}>
      <h2 className="font-display text-[clamp(28px,2.8vw,38px)] leading-none text-balance">{lb}</h2>
      <p className="mt-1.5 font-hand text-[20px] leading-tight text-muted">
        {ls}. {DUR[s.dur].l}, {GROUP[s.group].l.toLowerCase()}, naik {MODE[p.m].l.toLowerCase()}.
      </p>
      {/* Layar sempit: baterai melebar penuh di bawah putusan, catatan di bawahnya. */}
      <BatteryWide level={p.score} label="Baterai pulang rencana ini" className="mt-5 w-full -rotate-1 [filter:drop-shadow(5px_5px_0_var(--color-ink))] sm:hidden" />
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,150px)_minmax(0,1fr)] sm:items-center sm:gap-5">
        <Battery level={p.score} label="Baterai pulang rencana ini" className="hidden h-[310px] w-auto -rotate-2 [filter:drop-shadow(7px_7px_0_var(--color-ink))] sm:block" />
        <ChargeNotes compact plan={p} places={stops(s)} hotel={isStay(s) ? hotel(s) : undefined} budget={s.budget} people={s.n} className="gap-3 sm:gap-4" />
      </div>
      {/* Perforasi: lubang sobekan sejajar garis putus-putus. */}
      <div className="relative -mx-7 my-5 h-7" aria-hidden="true">
        <span className="absolute top-0 -left-4 size-7 rounded-full border-[2.5px] border-ink bg-page" />
        <span className="absolute inset-x-7 top-1/2 border-t-[2.5px] border-dashed border-ink" />
        <span className="absolute top-0 -right-4 size-7 rounded-full border-[2.5px] border-ink bg-page" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="-rotate-6 rounded-[10px] border-[3px] border-warn px-3 py-1 font-display text-[17px] tracking-[0.02em] text-warn">Kartu Healing</span>
        <span className="font-hand text-[18px] text-muted">berlaku untuk {s.n} orang, sekali jalan</span>
      </div>
    </section>
  )
}
export function StepRencana(props: {
  s: State
  all: Plan[]
  p: Plan
  setMode: (m: ModeKey) => void
  toggleRain: () => void
  copyPlan: () => void
  copyLink: () => void
  goStep: (n: 1 | 2) => void
}) {
  const { s, all, p } = props
  const best = bestOf(all), cheap = cheapestOf(all)
  const route = routeZones(s)
  const [lb] = label(p.score)
  const recap = {
    score: p.score,
    verdict: lb,
    sub: `${DUR[s.dur].l}, ${GROUP[s.group].l.toLowerCase()}, naik ${MODE[p.m].l.toLowerCase()}`,
    notes: noteList(p, stops(s), isStay(s) ? hotel(s) : undefined, s.budget, s.n).map((x) => ({ text: noteText(x), sub: x.sub, tone: x.tone })),
    people: s.n,
    stops: p.tl.filter((x) => x.k === "stop" || x.k === "stay").map((x) => ({ time: x.k === "day" ? "" : clock(x.t), name: x.ti })),
  }

  // Mobile: tiket, moda, saran, peta dan jadwal, rincian. Desktop: kolom kanan untuk peta, jadwal, dan video.
  return (
    <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:grid-rows-[auto_auto_1fr] xl:gap-x-16">
      <section className="order-1 min-w-0 lg:order-none lg:col-start-1">
        <Ticket s={s} p={p} />
        <Toggle on={s.rain} onClick={props.toggleRain} title="Kalau hujan, pakai Plan B" sub="tempat outdoor diganti alternatif indoor terdekat" />
      </section>

      <section className="order-2 min-w-0 lg:order-none lg:col-start-1">
        <H2>Mau berangkat naik apa?</H2>
        <p className="max-w-[56ch] text-[15px] font-medium">Tiap moda menguras baterai berbeda. Angkanya adalah sisa baterai saat kamu sampai rumah.</p>
        <div className="mt-4 grid gap-2.5">
          {all.map((x) => {
            const on = x.m === p.m
            return (
              <button
                key={x.m}
                type="button"
                aria-pressed={on}
                onClick={() => props.setMode(x.m)}
                className={cn(
                  "sk-card grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3 text-left transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0.5",
                  on ? "sk-raise bg-paper" : "bg-paper/80 hover:sk-raise-sm",
                )}
              >
                <span className="text-[15.5px] font-extrabold">
                  {MODE[x.m].l}
                  {x.m === best.m && <em className="ml-2 rounded-full border-2 border-ink bg-leaf px-2 py-px align-middle font-hand text-[15px] font-normal text-on-leaf not-italic">paling seimbang</em>}
                  {x.m === cheap.m && x.m !== best.m && <em className="ml-2 rounded-full border-2 border-ink bg-paper2 px-2 py-px align-middle font-hand text-[15px] font-normal not-italic">paling hemat</em>}
                </span>
                <b className="num row-span-2 font-display text-[30px] leading-none">{x.score}</b>
                <span className="flex items-center gap-3">
                  <BatteryStrip level={x.score} size="sm" className="w-28 flex-none sm:w-40" />
                  <span className="font-hand text-[17px] leading-tight text-muted">
                    {rpS(x.trans)} transport, {dmin(x.roadMin)} di jalan{x.total > s.budget ? ", lewat budget" : ""}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <H2>Saran jujur</H2>
        <div className="grid gap-4 sm:grid-cols-2">
          {advice(s, p, all).map((a, i) => (
            <div
              key={a.b}
              className={cn("sk-card sk-raise-sm relative px-4 pt-5 pb-4 text-[14.5px]", a.w ? "bg-warn-soft" : "bg-leaf-soft")}
              style={{ rotate: i % 2 ? "1deg" : "-1deg" }}
            >
              <span className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-3 border-[1.5px] border-ink/50 bg-paper2/80" aria-hidden="true" />
              <b className={cn("block font-display text-[17px] leading-tight", a.w && "text-warn")}>{a.b}</b>
              <span className="mt-1 block">{a.t}</span>
            </div>
          ))}
        </div>
      </section>

      <aside className="order-3 min-w-0 lg:order-none lg:col-start-2 lg:row-span-3 lg:row-start-1">
        <H2 className="lg:mt-7">Rutenya</H2>
        <MapCard home={s.home} route={route} label={`Peta rute dari ${Z[s.home].n}, naik ${MODE[p.m].l.toLowerCase()}`}>
          Titik hijau berjalan menyusuri rute naik {MODE[p.m].l.toLowerCase()}, sekitar {dmin(p.roadMin)} di jalan.
        </MapCard>

        <H2>Jadwalnya</H2>
        <ol className="sk-card relative bg-paper px-4 py-3">
          <span className="absolute top-6 bottom-6 left-[98px] border-l-[2.5px] border-dashed border-ink/60" aria-hidden="true" />
          {p.tl.map((x, i) =>
            x.k === "day" ? (
              <li key={i} className="relative pt-3 pb-1 pl-[120px] font-display text-[18px] text-leaf">
                {x.ti}
              </li>
            ) : (
              <li key={i} className="relative grid grid-cols-[62px_20px_1fr] gap-3 py-2.5">
                <span className="num pt-0.5 font-display text-[16px]">{clock(x.t)}</span>
                <span
                  className={cn("relative z-10 mt-1 size-[18px] rounded-full border-[2.5px] border-ink", x.k === "stay" ? "bg-ticket" : x.k === "stop" ? "bg-leaf" : "bg-paper")}
                  aria-hidden="true"
                />
                <div>
                  <b className={cn("text-[15.5px] leading-snug", x.k === "stop" && "font-extrabold")}>{x.ti}</b>
                  {x.sub && <small className="block font-hand text-[17px] leading-tight text-muted">{x.sub}</small>}
                  {x.sw && <span className="mt-1 inline-block rounded-full border-2 border-warn px-2 font-hand text-[15px] text-warn">Plan B hujan, menggantikan {x.sw}</span>}
                </div>
              </li>
            ),
          )}
        </ol>

        <H2>Video rekap</H2>
        <div className="sk-card grid items-center gap-5 bg-paper p-4 sm:grid-cols-[minmax(0,230px)_1fr]">
          <div className="mx-auto w-full max-w-[230px]">
            <Suspense fallback={<div className="aspect-[9/16] w-full animate-pulse rounded-[20px] bg-paper2" />}>
              <RecapPlayer {...recap} />
            </Suspense>
          </div>
          <p className="text-[14.5px]">
            <b className="block font-display text-[20px] leading-tight">Rencana ini dalam 9 detik</b>
            <span className="mt-1 block font-hand text-[18px] leading-snug text-muted">Format 9:16, pas untuk Story atau status WhatsApp. Tekan putar, lalu rekam layar untuk dibagikan.</span>
          </p>
        </div>
      </aside>

      <section className="order-4 min-w-0 self-start lg:order-none lg:col-start-1">
        <p className="mt-8 font-hand text-[18px] text-muted">
          Rincian: transport {rp(p.trans)}, tiket dan jajan {rp(p.placeCost)}
          {p.stayCost ? `, penginapan dan makan ${rp(p.stayCost)}` : ""}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Btn onClick={props.copyPlan}>Salin rencana</Btn>
          <Btn ghost onClick={props.copyLink}>
            Salin link
          </Btn>
          <Btn ghost onClick={() => props.goStep(2)}>
            Ganti tempat
          </Btn>
          <Btn ghost onClick={() => props.goStep(1)}>
            Ubah kondisi
          </Btn>
        </div>
      </section>
    </div>
  )
}

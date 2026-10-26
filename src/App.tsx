import { useEffect, useMemo, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { DUR, GROUP, INITIAL, MODE, type State, type Step } from "@/domain/data"
import { bestOf, countStops, hotel, isStay, label, plans, projection } from "@/domain/engine"
import { clock, rp, rpS } from "@/domain/format"
import { fromHash, toHash } from "@/domain/share"
import { goStep as go, togglePick, type Result } from "@/domain/store"
import { copyText } from "@/lib/clipboard"
import { scrollToTop, startSmoothScroll } from "@/lib/smooth"
import { cn } from "@/lib/utils"
import { Btn } from "./components/controls"
import { BatteryStrip } from "./components/sketch/Battery"
import { SiteFooter } from "./components/SiteFooter"
import { StepKondisi } from "./components/StepKondisi"
import { StepRencana } from "./components/StepRencana"
import { StepTempat } from "./components/StepTempat"

const STEPS = ["Kondisi", "Tempat", "Rencana"] as const
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches

export default function App() {
  const [s, setS] = useState<State>(() => fromHash(location.hash, INITIAL) ?? INITIAL)
  const [toast, setToast] = useState({ text: "", key: 0 })
  const firstStep = useRef(true)

  const say = (text: string) => setToast((t) => ({ text, key: t.key + 1 }))
  const set = (fn: (x: State) => State) => setS(fn)
  const apply = (r: Result) => {
    setS(r.s)
    if (r.toast) say(r.toast)
  }
  // Pindah langkah lewat View Transitions supaya halaman berganti seperti membalik buku sketsa.
  const goStep = (n: Step) => {
    const r = go(s, n)
    if (r.toast) say(r.toast)
    const swap = () => flushSync(() => setS(r.s))
    if (r.s.step !== s.step && document.startViewTransition && !reduced()) document.startViewTransition(swap)
    else swap()
  }

  // Share link: hash selalu mencerminkan state. Ditunda sedikit karena Safari membatasi frekuensi replaceState.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        history.replaceState(null, "", toHash(s))
      } catch {
        /* hash hanya kenyamanan, aplikasi tetap jalan */
      }
    }, 250)
    return () => clearTimeout(id)
  }, [s])
  useEffect(() => {
    const on = () => {
      const next = fromHash(location.hash, INITIAL)
      if (next) setS(next)
    }
    addEventListener("hashchange", on)
    return () => removeEventListener("hashchange", on)
  }, [])

  useEffect(startSmoothScroll, [])
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false
      return
    }
    scrollToTop()
  }, [s.step])

  useEffect(() => {
    if (!toast.text) return
    const id = setTimeout(() => setToast((t) => ({ ...t, text: "" })), 2200)
    return () => clearTimeout(id)
  }, [toast.key, toast.text])

  const all = useMemo(() => (s.step === 3 ? plans(s) : []), [s])
  const p = all.find((x) => x.m === s.mode) ?? all[0]
  const pr = useMemo(() => (s.step === 3 ? null : projection(s)), [s])
  const charge = p ? p.score : (pr?.plan.score ?? 0)

  const link = () => location.origin + location.pathname + toHash(s)
  const copyLink = async () => say((await copyText(link())) ? "Link rencana tersalin" : "Gagal menyalin")
  const copyPlan = async () => {
    if (!p) return
    const [lb] = label(p.score)
    const lines = [`Healing Yok: ${DUR[s.dur].l}, ${GROUP[s.group].l} (${s.n} orang)`, `Baterai pulang ${p.score}/100, ${lb}`, `Naik ${MODE[p.m].l.toLowerCase()}`, ""]
    for (const x of p.tl) lines.push(x.k === "day" ? `\n${x.ti}` : `${clock(x.t)}  ${x.ti}`)
    lines.push("", `Total ±${rp(p.total)} (±${rp(p.total / s.n)} per orang)`, `Buka rencananya: ${link()}`)
    say((await copyText(lines.join("\n"))) ? "Rencana tersalin, tinggal kirim ke grup" : "Gagal menyalin")
  }

  const stepEnabled = (i: number) => i <= s.step || (i === 2 && s.picks.length > 0) || (i === 3 && !!s.mode)

  return (
    <>
      {/* Filter garis tangan bersama: dipakai .sk-card, .sk-line, .sk-range, dan .sk-rule-top. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id="sk-rough" x="-3%" y="-8%" width="106%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="mx-auto max-w-[1440px] px-4 pt-[max(14px,env(safe-area-inset-top))] sm:px-6 lg:px-10">
        <header className="flex items-center justify-between gap-3 py-2">
          <a href="#" onClick={(e) => (e.preventDefault(), goStep(1))} className="flex items-center gap-2.5 rounded-lg">
            <i className="inline-block size-[26px] -rotate-45 rounded-[50%_50%_50%_5px] border-[2.5px] border-ink bg-leaf" aria-hidden="true" />
            <span className="font-display text-[19px] leading-none tracking-[-0.01em] whitespace-nowrap sm:text-[22px]">Healing Yok</span>
          </a>
          <nav aria-label="Langkah" className="flex gap-1.5">
            {STEPS.map((name, k) => {
              const i = (k + 1) as Step
              const on = s.step === i
              return (
                <button
                  key={name}
                  type="button"
                  aria-current={on ? "step" : undefined}
                  aria-label={`Langkah ${i}, ${name}`}
                  disabled={!stepEnabled(i)}
                  onClick={() => goStep(i)}
                  className={cn(
                    "flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-[40%_55%_45%_60%] border-[2.5px] border-ink px-2.5 font-hand text-[18px] leading-none transition-[transform,background-color] duration-200 hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0",
                    on ? "bg-ink text-page" : "bg-paper",
                  )}
                >
                  <span className="num">{i}</span>
                  <span className={cn(on ? "inline" : "hidden md:inline")}>{name}</span>
                </button>
              )
            })}
          </nav>
        </header>

        <main className="pb-6">
          {s.step === 1 && <StepKondisi s={s} set={set} onNext={() => goStep(2)} />}
          {s.step === 2 && <StepTempat s={s} set={set} pick={(id) => apply(togglePick(s, id))} />}
          {s.step === 3 && p && (
            <StepRencana
              s={s}
              all={all}
              p={p}
              setMode={(m) => set((x) => ({ ...x, mode: m }))}
              toggleRain={() => {
                say(s.rain ? "Plan B dimatikan" : "Plan B hujan aktif")
                set((x) => ({ ...x, rain: !x.rain }))
              }}
              copyPlan={copyPlan}
              copyLink={copyLink}
              goStep={goStep}
            />
          )}
        </main>
      </div>

      <SiteFooter goStep={goStep} noDockLg={s.step === 1} />

      {/* Dock. Di langkah 1 desktop disembunyikan: hero sudah punya baterai dan tombol sendiri. */}
      <div className={cn("sk-rule-top fixed inset-x-0 bottom-0 z-30 bg-paper px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] sm:px-6 lg:px-10", s.step === 1 && "lg:hidden")}>
        <div className="mx-auto flex max-w-[1440px] items-center gap-4">
          <div className="hidden w-36 flex-none items-center gap-2 sm:flex">
            <BatteryStrip level={charge} size="sm" className="flex-1" label="Baterai pulang saat ini" />
            <b className="num font-display text-[20px] leading-none">{charge}</b>
          </div>
          <div className="min-w-0 flex-1 text-[13px] leading-snug">
            {s.step === 1 && (
              <>
                <b className="block truncate text-[14.5px]">
                  {GROUP[s.group].l}, {DUR[s.dur].l.toLowerCase()}, {s.n} orang
                </b>
                <span className="block truncate font-hand text-[16px] text-muted">budget {rpS(s.budget)}, baterai pulang {charge}</span>
              </>
            )}
            {s.step === 2 && (
              <>
                <b className="block truncate text-[14.5px]">
                  {countStops(s)} dari {DUR[s.dur].max} tempat dipilih
                </b>
                <span className="block truncate font-hand text-[16px] text-muted">{isStay(s) ? (hotel(s)?.name ?? "belum pilih penginapan") : "urutan diatur otomatis"}</span>
              </>
            )}
            {s.step === 3 && p && (
              <>
                <b className="block truncate text-[14.5px]">
                  Baterai {p.score}, {rpS(p.total)}
                </b>
                <span className="block truncate font-hand text-[16px] text-muted">
                  {MODE[p.m].l.toLowerCase()}
                  {p.m === bestOf(all).m ? ", paling seimbang" : ""}
                </span>
              </>
            )}
          </div>
          {s.step === 1 && <Btn onClick={() => goStep(2)}>Cari tempat</Btn>}
          {s.step === 2 && <Btn onClick={() => goStep(3)}>Lihat rencana</Btn>}
          {s.step === 3 && <Btn onClick={copyPlan}>Salin rencana</Btn>}
        </div>
      </div>

      <div
        role="status"
        className={cn(
          "pointer-events-none fixed bottom-24 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-[18px_22px_17px_20px] border-[2.5px] border-ink bg-ink px-5 py-2.5 text-center font-hand text-[19px] text-page transition-[opacity,translate] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
          toast.text ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        )}
      >
        {toast.text}
      </div>
    </>
  )
}

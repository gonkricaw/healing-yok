/* Kontrol dalam bahasa buku sketsa: stiker, kartu kertas bertinta, slider tinta. Dipilih = ditinta penuh. */
import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

const TILTS = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg", "1deg"]
const TILE_TILTS = ["-0.6deg", "0.4deg", "-0.3deg", "0.6deg"]
const press = "transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none active:duration-100"

export function Question({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <h3 className="mt-10 mb-3 font-display text-[21px] leading-tight tracking-[-0.01em]">
      {children}
      {hint && <small className="ml-2 font-hand text-[19px] font-normal tracking-normal text-muted">{hint}</small>}
    </h3>
  )
}

export function Chip({ on, onClick, children, i = 0, className }: { on: boolean; onClick: () => void; children: ReactNode; i?: number; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      style={{ rotate: TILTS[i % TILTS.length] } as CSSProperties}
      className={cn("sk-line rounded-full border-[2.5px] px-4 py-2 text-[14.5px] font-bold sk-raise-sm", press, on ? "bg-ink text-page" : "bg-paper", className)}
    >
      {children}
    </button>
  )
}

export function Tile({ on, onClick, title, sub, i = 0 }: { on: boolean; onClick: () => void; title: string; sub: string; i?: number }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      style={{ rotate: on ? "0deg" : TILE_TILTS[i % TILE_TILTS.length] } as CSSProperties}
      className={cn("sk-card px-4 py-3 text-left", press, on ? "bg-ink text-page sk-raise-sm" : "hover:sk-raise-sm")}
    >
      <b className="block text-[15px] leading-snug">{title}</b>
      <span className={cn("mt-0.5 block font-hand text-[17px] leading-snug", on ? "text-page/80" : "text-muted")}>{sub}</span>
    </button>
  )
}

export function Toggle({ on, onClick, title, sub }: { on: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cn("sk-card mt-3 flex w-full items-center gap-3 border-dashed px-4 py-3 text-left", press)}>
      <span className={cn("relative h-[26px] w-[46px] flex-none rounded-full border-[2.5px] border-ink transition-colors", on ? "bg-leaf" : "bg-paper2")}>
        <span className={cn("absolute top-[2px] left-[2px] size-[17px] rounded-full border-2 border-ink transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]", on ? "translate-x-5 bg-paper" : "bg-ink")} />
      </span>
      <span>
        <b className="block text-[15px]">{title}</b>
        <small className="block font-hand text-[17px] leading-tight text-muted">{sub}</small>
      </span>
    </button>
  )
}

export function Btn({ ghost, onClick, children, className }: { ghost?: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "sk-line rounded-full border-[2.5px] px-5 py-3 font-bold whitespace-nowrap",
        press,
        ghost ? "bg-paper sk-raise-sm" : "bg-ink text-page shadow-[0_4px_0_var(--color-leaf)] active:shadow-none",
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Slider(props: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  disabled?: boolean
  valueText: string
  ends: [string, string]
  head?: ReactNode
  onChange: (v: number) => void
}) {
  const fill = ((props.value - props.min) / (props.max - props.min)) * 100
  return (
    <div className="sk-card px-4 pt-3 pb-2.5" style={{ rotate: props.id === "sosial" ? "0.5deg" : "-0.5deg" }}>
      {props.head}
      <input
        id={props.id}
        type="range"
        className="sk-range mt-1.5"
        style={{ "--fill": fill + "%" } as CSSProperties}
        aria-label={props.label}
        aria-valuetext={props.valueText}
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(+e.target.value)}
      />
      <div className="flex justify-between font-hand text-[16px] text-muted">
        <span>{props.ends[0]}</span>
        <span>{props.ends[1]}</span>
      </div>
    </div>
  )
}

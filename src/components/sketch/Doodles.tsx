/* Doodle kecil (bintang, kilau, hati) dengan goresan yang sama seperti doodle di footer kru. Dekorasi, disembunyikan dari pembaca layar. */
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

const PATHS = {
  star: { d: "M0 -13 L3.6 -4.4 L13 -4 L5.8 2.2 L8.2 12 L0 6.6 L-8.2 12 L-5.8 2.2 L-13 -4 L-3.6 -4.4 Z", fill: "#ffd23f" },
  sparkle: { d: "M0 -13 C1 -4 4 -1 13 0 C4 1 1 4 0 13 C-1 4 -4 1 -13 0 C-4 -1 -1 -4 0 -13 Z", fill: "#8fdcff" },
  heart: { d: "M0 11 C-6 6 -13 1 -13 -5 C-13 -10 -8 -13 -4 -11 C-2 -10 -1 -8 0 -6 C1 -8 2 -10 4 -11 C8 -13 13 -10 13 -5 C13 1 6 6 0 11 Z", fill: "#ff5c7a" },
}

export function Doodle({ kind, size = 30, className, style }: { kind: keyof typeof PATHS; size?: number; className?: string; style?: CSSProperties }) {
  const p = PATHS[kind]
  return (
    <svg viewBox="-16 -16 32 32" width={size} height={size} className={cn("sk-float pointer-events-none absolute", className)} style={style} aria-hidden="true">
      <path d={p.d} fill={p.fill} stroke="var(--color-ink)" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
}

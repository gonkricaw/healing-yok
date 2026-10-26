import { lazy, Suspense, type ReactNode } from "react"
import type { ZoneKey } from "@/domain/data"
import { cn } from "@/lib/utils"

const ZoneMap3D = lazy(() => import("./ZoneMap3D"))

export function MapCard(props: { home: ZoneKey; route: ZoneKey[]; onPick?: (z: ZoneKey) => void; label: string; children?: ReactNode; className?: string }) {
  const h = "h-[240px] sm:h-[300px] lg:h-[340px]"
  return (
    <figure className={cn("sk-card overflow-hidden bg-paper", props.className)}>
      <Suspense fallback={<div className={cn("animate-pulse bg-paper2", h)} />}>
        <ZoneMap3D className={h} home={props.home} route={props.route} onPick={props.onPick} label={props.label} />
      </Suspense>
      {props.children && <figcaption className="border-t-[2.5px] border-dashed border-ink/50 px-4 py-3 font-hand text-[18px] leading-snug text-muted">{props.children}</figcaption>}
    </figure>
  )
}

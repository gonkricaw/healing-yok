import Lenis from "lenis"
import "lenis/dist/lenis.css"

let lenis: Lenis | null = null
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches

/** Smooth scroll roda mouse. Tidak aktif untuk reduced motion; sentuh tetap native. */
export function startSmoothScroll() {
  if (reduced()) return () => {}
  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true, syncTouch: false, autoRaf: true })
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 0.9 })
  else scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" })
}

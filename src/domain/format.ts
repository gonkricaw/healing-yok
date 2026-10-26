export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const rp = (v: number) => "Rp" + (Math.round(v / 1000) * 1000).toLocaleString("id-ID")
export const rpS = (v: number) => (v >= 1e6 ? "Rp" + (v / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt" : "Rp" + Math.round(v / 1000) + " rb")
export const dmin = (m: number) => (m < 60 ? m + " mnt" : Math.floor(m / 60) + " jam" + (m % 60 ? " " + (m % 60) + " mnt" : ""))
export const clock = (h: number) => {
  const t = Math.round(h * 12) * 5
  return String(Math.floor(t / 60) % 24).padStart(2, "0") + "." + String(t % 60).padStart(2, "0")
}
export const crowdL = (c: number) => (c > 0.75 ? "Ramai" : c > 0.5 ? "Sedang" : "Tenang")

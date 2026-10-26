import DoodleCrewFooter, { type CrewMember } from "@/components/ui/doodle-crew-footer-sunny"

// Halaman terakhir buku sketsa: kru lebih sedikit dari hero, tanpa kolom tautan.
const CREW: CrewMember[] = [
  { kind: "cat", letter: 0, seat: "front", offset: -0.36, name: "Belang", says: "Healing versiku: tidur siang." },
  { kind: "bird", letter: 2, seat: "top", name: "Cici", says: "Jangan lupa bawa minum!" },
  { kind: "ghost", letter: 5, seat: "behind", name: "Mumu", says: "Capek, tapi pengin jalan." },
  { kind: "yeti", letter: 10, seat: "front", offset: 0.42, scale: 0.92, flip: true, name: "Bruno", says: "Lewat budget? Ganti moda." },
]

/** `noDockLg`: dock disembunyikan di desktop (langkah 1), jadi bar bawah tidak perlu menyisakan ruangnya. */
export function SiteFooter({ goStep, noDockLg }: { goStep: (n: 1 | 2) => void; noDockLg?: boolean }) {
  return (
    <DoodleCrewFooter
      className={"hy-footer" + (noDockLg ? " hy-nodock-lg" : "")}
      preset="sunny"
      palette={{ background: "var(--color-page)", ink: "var(--color-ink)", accent: "var(--color-leaf)" }}
      fontFamily='"Bowlby One", system-ui, sans-serif'
      serifFamily='"Plus Jakarta Sans Variable", system-ui, sans-serif'
      wordmark="HEALING YOK"
      brand="Healing Yok"
      logo={<i className="inline-block size-[26px] -rotate-45 rounded-[50%_50%_50%_5px] border-[2.5px] border-ink bg-leaf" />}
      blurb=""
      tagline="Healing tidak harus jauh. Yang penting pulang dengan baterai penuh."
      columns={[]}
      actions={[
        { label: "Ubah kondisi", icon: "heart", variant: "outline", onClick: () => goStep(1) },
        { label: "Pilih tempat", icon: "star", variant: "solid", onClick: () => goStep(2) },
      ]}
      copyright="Mockup. Semua tempat, harga, event, dan estimasi perjalanan adalah data dummy."
      legal={[]}
      socials={[]}
      backToTopLabel="Ke atas"
      crewLabel="Healing Yok, kenalan dengan kru"
      crew={CREW}
      doodles={["heart", "star", "sparkle", "plane"]}
      doodleCount={8}
      tracking={0}
      height="0px"
    />
  )
}

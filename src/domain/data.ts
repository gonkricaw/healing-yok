/* Data dummy. Semua tempat, harga, event, dan jarak fiktif. */

export type Waktu = "pagi" | "siang" | "sore" | "malam"
export type Cat = "taman" | "kopi" | "event" | "bazaar" | "wisata" | "olahraga" | "stay"
export type ZoneKey = keyof typeof Z
export type DurKey = keyof typeof DUR
export type GroupKey = keyof typeof GROUP
export type MoodKey = keyof typeof MOOD
export type ModeKey = keyof typeof MODE

export interface Place {
  id: string
  name: string
  cat: Cat
  zone: ZoneKey
  /** Belanja per orang (tiket + jajan), non-stay. */
  cost?: number
  /** Khusus stay: harga per malam per kamar dan kapasitas per kamar. */
  price?: number
  cap?: number
  crowd: number
  /** Cadangan, belum dipakai di rumus. */
  calm: number
  kids: 0 | 1
  indoor: 0 | 1
  active?: 1
  heal: number
  best: Waktu[]
  ev?: string
  desc: string
}

export const Z = {
  jakpus: { n: "Jakarta Pusat", x: 0, y: 0 },
  jaksel: { n: "Jakarta Selatan", x: 0, y: -9 },
  jaktim: { n: "Jakarta Timur", x: 8, y: -4 },
  jakbar: { n: "Jakarta Barat", x: -9, y: 0 },
  jakut: { n: "Jakarta Utara", x: 1, y: 8 },
  bekasi: { n: "Bekasi", x: 19, y: -3 },
  depok: { n: "Depok", x: -1, y: -22 },
  tangerang: { n: "Tangerang", x: -21, y: -1 },
  bogor: { n: "Bogor", x: -1, y: -46 },
  puncak: { n: "Puncak", x: 14, y: -62 },
}
export const HOME: ZoneKey[] = ["jakpus", "jaksel", "jaktim", "jakbar", "jakut", "bekasi", "depok", "tangerang", "bogor"]
export const CAT: Record<Cat, string> = { taman: "Taman publik", kopi: "Ngopi & live music", event: "Event spesial", bazaar: "Bazaar kuliner", wisata: "Wisata", olahraga: "Olahraga & aktif", stay: "Staycation" }

export const P: Place[] = [
  { id: "banteng", name: "Lapangan Banteng", cat: "taman", zone: "jakpus", cost: 25000, crowd: 0.5, calm: 0.65, kids: 1, indoor: 0, heal: 73, best: ["sore", "malam"], desc: "Lapangan luas dan teduh di sore hari. Cocok jalan santai, piknik kecil, atau lihat lampu taman." },
  { id: "monas", name: "Monas", cat: "taman", zone: "jakpus", cost: 30000, crowd: 0.85, calm: 0.3, kids: 1, indoor: 0, heal: 66, best: ["pagi", "sore"], desc: "Ruang terbuka paling ikonik. Anak bebas lari-larian, tapi siang terik dan akhir pekan padat." },
  { id: "tebet", name: "Tebet Eco Park", cat: "taman", zone: "jaksel", cost: 20000, crowd: 0.7, calm: 0.6, kids: 1, indoor: 0, heal: 78, best: ["pagi"], desc: "Jalur hijau, jembatan, dan area main anak. Pagi hari masih adem dan belum terlalu ramai." },
  { id: "literasi", name: "Taman Literasi Blok M", cat: "taman", zone: "jaksel", cost: 35000, crowd: 0.45, calm: 0.72, kids: 1, indoor: 0, heal: 72, best: ["sore", "malam"], desc: "Taman dan ruang baca terbuka, dekat stasiun MRT. Enak buat yang ingin tenang tapi tetap di kota." },
  { id: "akustik", name: "Teras Akustik", cat: "kopi", zone: "jaksel", cost: 75000, crowd: 0.45, calm: 0.55, kids: 0, indoor: 1, heal: 75, best: ["malam"], ev: "Live akustik tiap malam", desc: "Kedai kopi semi-outdoor dengan panggung kecil. Lagu-lagu pelan, lampu temaram." },
  { id: "jazz", name: "Ruang Jazz Cikini", cat: "kopi", zone: "jakpus", cost: 95000, crowd: 0.5, calm: 0.6, kids: 0, indoor: 1, heal: 77, best: ["malam"], ev: "Jazz session Jumat–Sabtu", desc: "Ngopi atau mocktail sambil dengar jazz live di gedung tua yang direnovasi." },
  { id: "kebunkopi", name: "Kopi Kebun Sawangan", cat: "kopi", zone: "depok", cost: 55000, crowd: 0.3, calm: 0.85, kids: 1, indoor: 0, heal: 76, best: ["pagi", "sore"], desc: "Ngopi di bawah pohon dengan lapangan rumput kecil. Sepi, anak bisa main sementara orang tua santai." },
  { id: "bazaar", name: "Bazaar Kuliner Senayan", cat: "bazaar", zone: "jakpus", cost: 85000, crowd: 0.9, calm: 0.25, kids: 1, indoor: 0, heal: 68, best: ["sore", "malam"], ev: "Jumat–Minggu, 16.00–23.00", desc: "Puluhan tenant jajanan lokal dan musik DJ. Ramai, seru, dan gampang kalap belanja." },
  { id: "pasmal", name: "Pasar Malam Nusantara", cat: "bazaar", zone: "jaktim", cost: 60000, crowd: 0.85, calm: 0.3, kids: 1, indoor: 0, heal: 67, best: ["malam"], ev: "Akhir pekan ini", desc: "Jajanan daerah, permainan anak, dan kerajinan. Nostalgia pasar malam versi rapi." },
  { id: "festival", name: "Festival Pantai & Musik Ancol", cat: "event", zone: "jakut", cost: 125000, crowd: 0.85, calm: 0.3, kids: 1, indoor: 0, heal: 73, best: ["sore", "malam"], ev: "Sabtu ini, 16.00–22.00", desc: "Panggung musik di tepi pantai, food truck, dan lampion saat matahari terbenam." },
  { id: "museum", name: "Museum Sains Interaktif", cat: "event", zone: "jakpus", cost: 65000, crowd: 0.55, calm: 0.6, kids: 1, indoor: 1, heal: 71, best: ["pagi", "siang", "sore"], ev: "Pameran dinosaurus sampai akhir bulan", desc: "Indoor dan ber-AC. Anak bisa menyentuh, mencoba, dan bertanya. Aman kalau hujan." },
  { id: "galeri", name: "Galeri Seni Kemang", cat: "wisata", zone: "jaksel", cost: 40000, crowd: 0.35, calm: 0.78, kids: 1, indoor: 1, heal: 72, best: ["pagi", "siang", "sore"], desc: "Galeri kecil dengan pameran berganti tiap bulan. Hening, sejuk, dan bagus untuk me time." },
  { id: "kotatua", name: "Kawasan Kota Tua", cat: "wisata", zone: "jakbar", cost: 45000, crowd: 0.75, calm: 0.45, kids: 1, indoor: 0, heal: 70, best: ["pagi", "sore"], desc: "Bangunan tua, museum, dan sepeda ontel. Datang pagi sebelum panas dan ramai." },
  { id: "kebunraya", name: "Kebun Raya Bogor", cat: "wisata", zone: "bogor", cost: 50000, crowd: 0.55, calm: 0.82, kids: 1, indoor: 0, heal: 85, best: ["pagi"], desc: 'Pohon raksasa, udara sejuk, dan rumput luas. Healing paling "hijau", tapi butuh waktu perjalanan.' },
  { id: "cfd", name: "Sepedaan di CFD Sudirman", cat: "olahraga", active: 1, zone: "jakpus", cost: 20000, crowd: 0.8, calm: 0.4, kids: 1, indoor: 0, heal: 75, best: ["pagi"], ev: "Minggu pagi saja", desc: "Jalan protokol bebas kendaraan. Sewa sepeda, jogging, lalu sarapan bubur di pinggir jalan." },
  { id: "renang", name: "Kolam Renang Keluarga Rawamangun", cat: "olahraga", active: 1, zone: "jaktim", cost: 45000, crowd: 0.55, calm: 0.55, kids: 1, indoor: 0, heal: 77, best: ["pagi", "siang", "sore"], desc: "Kolam dewasa dan kolam anak terpisah, ada perosotan. Pagi airnya paling bersih dan sepi." },
  { id: "pantai", name: "Pantai Ancol", cat: "olahraga", active: 1, zone: "jakut", cost: 60000, crowd: 0.6, calm: 0.55, kids: 1, indoor: 0, heal: 74, best: ["pagi", "sore"], desc: "Main pasir, sepeda pantai, atau sekadar duduk menunggu matahari terbenam." },
  { id: "pantaitg", name: "Pantai Tanjung Pasir", cat: "olahraga", active: 1, zone: "tangerang", cost: 50000, crowd: 0.35, calm: 0.75, kids: 1, indoor: 0, heal: 78, best: ["pagi", "sore"], desc: "Pantai nelayan yang lebih sepi. Bisa sewa perahu kecil dan makan ikan bakar." },
  { id: "gokart", name: "Sirkuit Gokart Indoor", cat: "olahraga", active: 1, zone: "jakbar", cost: 150000, crowd: 0.5, calm: 0.3, kids: 1, indoor: 1, heal: 78, best: ["siang", "sore", "malam"], ev: "Promo 2 sesi akhir pekan", desc: "Balapan di lintasan indoor ber-AC dengan papan waktu. Ada kart dobel untuk anak." },
  { id: "panjat", name: "Panjat Tebing Indoor", cat: "olahraga", active: 1, zone: "jaksel", cost: 120000, crowd: 0.35, calm: 0.5, kids: 1, indoor: 1, heal: 75, best: ["siang", "sore", "malam"], desc: "Bouldering untuk pemula, dipandu instruktur. Capeknya enak, pikiran langsung kosong." },
  { id: "padel", name: "Padel & Mini Soccer", cat: "olahraga", active: 1, zone: "jaktim", cost: 110000, crowd: 0.55, calm: 0.35, kids: 0, indoor: 1, heal: 74, best: ["sore", "malam"], desc: "Sewa lapangan beratap per jam. Paling seru kalau datang rame-rame." },
  { id: "trampolin", name: "Trampoline Park", cat: "olahraga", active: 1, zone: "tangerang", cost: 95000, crowd: 0.6, calm: 0.35, kids: 1, indoor: 1, heal: 73, best: ["siang", "sore"], desc: "Lompat-lompatan, foam pit, dan dodgeball. Anak puas, orang tua ikut berkeringat." },
  { id: "hotelkota", name: "Hotel Kota Tenang", cat: "stay", zone: "jakpus", price: 650000, cap: 2, crowd: 0.4, calm: 0.72, kids: 1, indoor: 1, heal: 80, best: [], desc: "Kolam renang rooftop dan sarapan. Staycation tanpa macet keluar kota." },
  { id: "resort", name: "Resort Tepi Pantai", cat: "stay", zone: "jakut", price: 950000, cap: 3, crowd: 0.5, calm: 0.7, kids: 1, indoor: 1, heal: 84, best: [], desc: "Kamar menghadap laut, kids club, dan sunset dari balkon." },
  { id: "glamping", name: "Glamping Kebun Bogor", cat: "stay", zone: "bogor", price: 850000, cap: 4, crowd: 0.25, calm: 0.88, kids: 1, indoor: 0, heal: 87, best: [], desc: "Tenda nyaman di tengah kebun, api unggun malam, dan kabut pagi." },
  { id: "villa", name: "Villa Sejuk Puncak", cat: "stay", zone: "puncak", price: 1500000, cap: 6, crowd: 0.2, calm: 0.9, kids: 1, indoor: 1, heal: 90, best: [], desc: "Satu villa untuk rombongan. Dapur sendiri, halaman luas, dan udara dingin." },
]

export const START: Record<Waktu, number> = { pagi: 7.5, siang: 11, sore: 15, malam: 18 }
export const WAKTU: Record<Waktu, string> = { pagi: "Pagi", siang: "Siang", sore: "Sore", malam: "Malam" }
export const DUR = {
  half: { l: "Half day", s: "Sekitar 5 jam", h: 5, max: 2, nights: 0 },
  full: { l: "Full day", s: "Pulang-pergi sehari", h: 11, max: 3, nights: 0 },
  stay1: { l: "Staycation 1 malam", s: "Menginap, pulang besok", h: 30, max: 2, nights: 1 },
  stay2: { l: "Staycation 2 malam", s: "Akhir pekan panjang", h: 54, max: 3, nights: 2 },
}
export const GROUP = {
  sendiri: { l: "Sendiri", s: "Me time", n: 1 },
  pasangan: { l: "Pasangan", s: "Berdua saja", n: 2 },
  keluarga: { l: "Keluarga + anak", s: "Harus ramah anak", n: 4 },
  sahabat: { l: "Sahabat", s: "Rame-rame", n: 4 },
}
export const MOOD = {
  bosan: { l: "Bosan di rumah", c: 35, s: 60 },
  capek: { l: "Capek kerja", c: 80, s: 25 },
  qt: { l: "Butuh quality time", c: 45, s: 40 },
  seru: { l: "Pengin seru-seruan", c: 25, s: 85 },
}
export const MODE = {
  umum: { l: "Transportasi umum", s: "KRL, MRT, TransJakarta" },
  motor: { l: "Motor", s: "Kendaraan sendiri" },
  mobil: { l: "Mobil pribadi", s: "Bensin, tol, parkir" },
  taksi: { l: "Taksi online", s: "Pintu ke pintu" },
  mix: { l: "Mix", s: "Transportasi umum + ojol last mile" },
}
export const MODES = Object.keys(MODE) as ModeKey[]

export type Step = 1 | 2 | 3
export interface State {
  step: Step
  mood: MoodKey
  group: GroupKey
  n: number
  dur: DurKey
  waktu: Waktu
  home: ZoneKey
  budget: number
  tua: boolean
  capek: number
  sosial: number
  cat: Cat | "semua"
  picks: string[]
  mode: ModeKey | null
  rain: boolean
}

/** Default yang dibuka dengan baterai hijau dari output mesin skor apa adanya: keluarga, half day sore, tempat dekat. */
export const INITIAL: State = { step: 1, mood: "qt", group: "keluarga", n: 4, dur: "half", waktu: "sore", home: "jaksel", budget: 900000, tua: false, capek: 45, sosial: 40, cat: "semua", picks: [], mode: null, rain: false }

/** Mode tanggal tua: budget dikunci per orang. */
export const TUA_PER_ORANG = 50000
export const BUDGET_MIN = 50000
export const BUDGET_MAX = 5000000
export const BUDGET_STEP = 25000

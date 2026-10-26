/*
 * Peta 3D zona Jabodetabek. Ada karena jarak adalah inti skor: pengguna melihat titik berangkat,
 * tempat pilihan, dan rutenya. Three.js vanilla (tanpa R3F), dimuat lazy, DPR dibatasi 1,75,
 * loop berhenti saat kanvas tidak terlihat atau tab disembunyikan, dan statis saat reduced motion.
 */
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { HOME, Z, type ZoneKey } from "@/domain/data"

export interface ZoneMapProps {
  home: ZoneKey
  /** Zona yang dikunjungi berurutan, tanpa rumah. Kosong berarti hanya titik berangkat. */
  route: ZoneKey[]
  /** Jika ada, zona HOME bisa diklik untuk mengganti titik berangkat. */
  onPick?: (z: ZoneKey) => void
  label: string
  className?: string
}

const K = 0.42 // km grid ke unit scene
const ZONES = Object.keys(Z) as ZoneKey[]
const CENTER = new THREE.Vector3(((-21 + 19) / 2) * K, 0, (62 - 8) / 2 * K)
const at = (z: ZoneKey) => new THREE.Vector3(Z[z].x * K, 0, -Z[z].y * K).sub(CENTER)
const EASE = 0.08 // lerp per frame untuk tinggi, warna, kamera

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888"
// Gaya buku sketsa: petak kertas, garis tinta, warna rata (toon), bayangan kartun.
const palette = () => ({ tile: css("--color-paper2"), leaf: css("--color-leaf"), ticket: css("--color-ticket"), ink: css("--color-ink") })
const TOON = (() => {
  const t = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 180, 180, 180, 255, 255, 255, 255, 255]), 3, 1)
  t.minFilter = t.magFilter = THREE.NearestFilter
  t.needsUpdate = true
  return t
})()

export default function ZoneMap3D({ home, route, onPick, label, className }: ZoneMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<{ update: (home: ZoneKey, route: ZoneKey[]) => void } | null>(null)
  const pickRef = useRef(onPick)
  pickRef.current = onPick

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    } catch {
      return // tanpa WebGL, kartu tetap menampilkan label teks
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.NoToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute("aria-hidden", "true")
    renderer.domElement.style.display = "block"
    wrap.prepend(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 2, 0.1, 400)
    const look = new THREE.Vector3(0, 0, 0)
    scene.add(new THREE.AmbientLight(0xffffff, 1.1))
    const sun = new THREE.DirectionalLight(0xffffff, 1.9)
    sun.position.set(-8, 20, 12)
    scene.add(sun)

    const world = new THREE.Group()
    world.rotation.y = -Math.PI / 2.35 // sumbu utara-selatan memanjang mengikuti kanvas lebar
    scene.add(world)

    let C = palette()

    // Petak zona: prisma segi enam. Tinggi dan warna di-lerp ke target supaya perubahan terasa mulus.
    const tileGeo = new THREE.CylinderGeometry(1.7, 1.85, 1, 6)
    tileGeo.translate(0, 0.5, 0)
    const tiles = new Map<ZoneKey, { mesh: THREE.Mesh; mat: THREE.MeshToonMaterial; h: number; color: THREE.Color }>()
    const inkMat = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide })
    const edgeMat = new THREE.LineBasicMaterial({ color: C.ink })
    const edgeGeo = new THREE.EdgesGeometry(tileGeo, 20)
    const shadowGeo = new THREE.CircleGeometry(1.95, 6)
    const shadowMat = new THREE.MeshBasicMaterial({ color: C.ink, transparent: true, opacity: 0.16, depthWrite: false })
    for (const z of ZONES) {
      const mat = new THREE.MeshToonMaterial({ color: C.tile, gradientMap: TOON })
      const mesh = new THREE.Mesh(tileGeo, mat)
      mesh.position.copy(at(z))
      mesh.scale.y = 0.35
      mesh.userData.zone = z
      // Garis tinta tebal: kulit terbalik sedikit lebih besar, ditambah garis tepi.
      const hull = new THREE.Mesh(tileGeo, inkMat)
      hull.scale.set(1.09, 1.04, 1.09)
      hull.raycast = () => {}
      mesh.add(hull, new THREE.LineSegments(edgeGeo, edgeMat))
      const shadow = new THREE.Mesh(shadowGeo, shadowMat)
      shadow.rotation.x = -Math.PI / 2
      shadow.position.copy(at(z)).add(new THREE.Vector3(0.45, 0.01, 0.45))
      world.add(shadow, mesh)
      tiles.set(z, { mesh, mat, h: 0.35, color: new THREE.Color(C.tile) })
    }

    // Cincin di titik berangkat.
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.35, 48), new THREE.MeshBasicMaterial({ color: C.leaf, transparent: true, opacity: 0.7, side: THREE.DoubleSide }))
    ring.rotation.x = -Math.PI / 2
    world.add(ring)

    // Rute: busur per ruas, titik kecil berjalan menyusurinya.
    const routeGroup = new THREE.Group()
    world.add(routeGroup)
    const routeMat = new THREE.MeshBasicMaterial({ color: C.ink })
    const dotMat = new THREE.MeshToonMaterial({ color: C.leaf, gradientMap: TOON })
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), dotMat)
    const dotHull = new THREE.Mesh(dot.geometry, inkMat)
    dotHull.scale.setScalar(1.28)
    dot.add(dotHull)
    world.add(dot)
    let path: THREE.CurvePath<THREE.Vector3> | null = null

    // Label nama zona: DOM di atas kanvas, diposisikan per frame.
    const labels = new Map<ZoneKey, HTMLSpanElement>()
    for (const z of ZONES) {
      const el = document.createElement("span")
      el.className = "zm-label"
      el.textContent = Z[z].n
      el.setAttribute("aria-hidden", "true")
      wrap.appendChild(el)
      labels.set(z, el)
    }

    let cur = { home, route }
    let hover: ZoneKey | null = null
    let dirty = true
    const update = (h: ZoneKey, r: ZoneKey[]) => {
      cur = { home: h, route: r }
      for (const [z, t] of tiles) {
        const onRoute = r.includes(z)
        t.h = z === h ? 1.9 : onRoute ? 1.25 : 0.35
        t.color.set(z === h ? C.leaf : onRoute ? C.ticket : C.tile)
      }
      ring.position.copy(at(h)).setY(0.04)
      ;(ring.material as THREE.MeshBasicMaterial).color.set(C.leaf)
      routeGroup.children.forEach((m) => (m as THREE.Mesh).geometry.dispose())
      routeGroup.clear()
      const pts = [h, ...r, h]
      path = new THREE.CurvePath<THREE.Vector3>()
      for (let i = 0; i < pts.length - 1; i++) {
        if (pts[i] === pts[i + 1]) continue
        const a = at(pts[i]).setY(z0(pts[i], h, r)), b = at(pts[i + 1]).setY(z0(pts[i + 1], h, r))
        const mid = a.clone().lerp(b, 0.5).setY(Math.max(a.y, b.y) + a.distanceTo(b) * 0.32 + 0.6)
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
        path.add(curve)
        routeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.12, 6), routeMat))
      }
      dot.visible = path.curves.length > 0
      dirty = true
    }
    const z0 = (z: ZoneKey, h: ZoneKey, r: ZoneKey[]) => (z === h ? 1.9 : r.includes(z) ? 1.25 : 0.35)
    update(home, route)
    apiRef.current = { update }

    // Snap awal: tidak perlu animasi tumbuh dari nol.
    for (const t of tiles.values()) {
      t.mesh.scale.y = t.h
      t.mat.color.copy(t.color)
    }

    const recolor = () => {
      C = palette()
      routeMat.color.set(C.ink)
      inkMat.color.set(C.ink)
      edgeMat.color.set(C.ink)
      shadowMat.color.set(C.ink)
      dotMat.color.set(C.leaf)
      update(cur.home, cur.route)
    }
    const mq = matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", recolor)

    // Ukuran dan framing.
    const size = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = w + "px"
      renderer.domElement.style.height = h + "px"
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
      // Fit: jarak terdekat di mana semua zona plus ruang label masuk bingkai, untuk rasio apa pun.
      world.updateMatrixWorld(true)
      const pts = [...tiles.values()].map((t) => t.mesh.position.clone().setY(2.6).applyMatrix4(world.matrixWorld))
      let lo = 4, hi = 240
      for (let i = 0; i < 20; i++) {
        const d = (lo + hi) / 2
        camera.position.copy(DIR).multiplyScalar(d)
        camera.lookAt(look)
        camera.updateMatrixWorld()
        const ok = pts.every((p) => {
          const q = p.clone().project(camera)
          return Math.abs(q.x) < 0.84 && q.y < 0.72 && q.y > -0.86
        })
        if (ok) hi = d
        else lo = d
      }
      base.copy(DIR).multiplyScalar(hi)
      dirty = true
    }
    const base = new THREE.Vector3()
    const DIR = new THREE.Vector3(0, 0.78, 0.62).normalize()
    const ro = new ResizeObserver(size)
    ro.observe(wrap)
    size()
    camera.position.copy(base)

    // Pointer: parallax kamera (dibatasi) dan hover/klik zona.
    const ndc = new THREE.Vector2(9, 9)
    const aim = new THREE.Vector2()
    const ray = new THREE.Raycaster()
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      aim.copy(ndc)
      dirty = true
    }
    const onLeave = () => {
      ndc.set(9, 9)
      aim.set(0, 0)
      dirty = true
    }
    const onClick = () => {
      if (hover && pickRef.current && HOME.includes(hover)) pickRef.current(hover)
    }
    wrap.addEventListener("pointermove", onMove)
    wrap.addEventListener("pointerleave", onLeave)
    wrap.addEventListener("click", onClick)

    // Loop hanya berjalan saat terlihat.
    let visible = false, raf = 0
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      run()
    })
    io.observe(wrap)
    const run = () => {
      if (!raf && visible && !document.hidden) {

        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener("visibilitychange", run)
    // Cadangan: entri awal IntersectionObserver bisa terlewat saat kanvas muncul dari Suspense.
    requestAnimationFrame(() => {
      const r = wrap.getBoundingClientRect()
      if (r.bottom > 0 && r.top < innerHeight) {
        visible = true
        run()
      }
    })

    const v = new THREE.Vector3()
    const frame = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      raf = requestAnimationFrame(frame)
      const t = now / 1000
      let moving = false

      for (const t2 of tiles.values()) {
        const dh = t2.h - t2.mesh.scale.y
        if (Math.abs(dh) > 0.002 || !t2.mat.color.equals(t2.color)) {
          t2.mesh.scale.y += reduced ? dh : dh * EASE
          t2.mat.color.lerp(t2.color, reduced ? 1 : EASE)
          moving = true
        }
      }

      if (!reduced) {
        // Parallax kamera dari pointer, plus napas pelan dunia.
        const target = v.copy(base).add(new THREE.Vector3(aim.x * 2.2, aim.y * 1.4, 0))
        camera.position.lerp(target, 0.06)
        world.position.y = Math.sin(t * 0.6) * 0.12
        const s = 1 + Math.sin(t * 2.2) * 0.06
        ring.scale.set(s, s, 1)
        if (path && path.curves.length) {
          const u = (t / Math.max(3, path.curves.length * 1.6)) % 1
          dot.position.copy(path.getPointAt(u)).setY(path.getPointAt(u).y + 0.25)
        }
        moving = true
      } else if (path && path.curves.length && dirty) {
        dot.position.copy(path.getPointAt(0.25))
        camera.position.copy(base)
      }
      camera.lookAt(look)

      // Hover zona.
      let next: ZoneKey | null = null
      if (ndc.x < 2) {
        ray.setFromCamera(ndc, camera)
        const hit = ray.intersectObjects([...tiles.values()].map((x) => x.mesh), false)[0]
        next = (hit?.object.userData.zone as ZoneKey) ?? null
      }
      if (next !== hover) {
        hover = next
        wrap.style.cursor = hover && pickRef.current && HOME.includes(hover) ? "pointer" : ""
        dirty = true
      }

      if (!moving && !dirty) return
      dirty = false
      renderer.render(scene, camera)
      const w = wrap.clientWidth, h = wrap.clientHeight
      for (const [z, el] of labels) {
        const tile = tiles.get(z)!
        v.copy(tile.mesh.position).setY(tile.mesh.scale.y + 0.6).applyMatrix4(world.matrixWorld).project(camera)
        const show = z === cur.home || cur.route.includes(z) || z === hover
        el.style.opacity = show ? "1" : "0"
        el.dataset.kind = z === cur.home ? "home" : cur.route.includes(z) ? "stop" : "zone"
        el.style.transform = `translate(-50%,-100%) translate(${((v.x + 1) / 2) * w}px,${((1 - v.y) / 2) * h}px)`
      }
    }

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      mq.removeEventListener("change", recolor)
      document.removeEventListener("visibilitychange", run)
      wrap.removeEventListener("pointermove", onMove)
      wrap.removeEventListener("pointerleave", onLeave)
      wrap.removeEventListener("click", onClick)
      labels.forEach((el) => el.remove())
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
      apiRef.current = null
    }
    // Scene dibuat sekali; perubahan rumah/rute lewat apiRef.update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const routeKey = route.join(".")
  useEffect(() => {
    apiRef.current?.update(home, route)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home, routeKey])

  return <div ref={wrapRef} role="img" aria-label={label} className={"relative overflow-hidden " + (className ?? "")} />
}

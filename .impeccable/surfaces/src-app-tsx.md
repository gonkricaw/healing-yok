---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components"]
---

# Healing Yok app (all three steps)

Scope: the whole single-page app, src/App.tsx and src/components. Mode: Persuade on the first viewport (it must sell the mechanism to judges and first-time users), Operate below it (the form and the plan must stay fast to use on a phone).

Audience: pitch judges on a laptop, prospective users on phones, portfolio viewers. Job: decide where to heal and leave with a plan to send to the group.

## Direction contract

THESIS: The Healing Bersih score is a hand-drawn battery you watch fill with a place's refreshment and drain with travel stress and budget overrun, live, while you set your condition. Refuses the category default: a wizard form with a result card at the end.

OWN-WORLD: Sketchbook doodle crew. Sunny yellow ground (#ffd94a), paper cards (#fff8d6) with 3px ink (#141414) outlines, irregular corner radii and hard ink offset shadows, hatched leaf-green charge (#1d7553), red drain notes (#b3261e), sky sparkles. Bowlby One for headlines and numbers, Gochi Hand for handwritten annotations, Plus Jakarta Sans for UI text. Doodle crew characters from the footer component react to the charge. Night variant for dark mode: warm ink ground, paper tinted dark, cream ink. Every ink outline (cards, chips, sliders, dock rule) runs through the shared #sk-rough displacement filter so the whole app is hand-drawn, not only the battery. Default state opens charged (half day sore, nearby places) so the drain is discovered by moving a control.

STORY: The visitor sees a battery and the question "Pulang masih penuh, atau habis di jalan?", moves a slider, watches the battery and its plus and minus notes change, understands that travel costs healing, and presses "Cari tempat healing". Later steps keep the battery as the running instrument: places charge it, transport drains it, the plan ends with the charge you come home with.

FIRST VIEWPORT: Desktop 1440x900: nav top (brand lockup left: leaf pin plus Bowlby "Healing Yok", which absorbs the sketch's separate HEALING wordmark so the page never shows two wordmarks; step pills right). The dock is hidden on step 1 at desktop widths because the hero already carries the battery and the primary action. Left 40%: battery drawn by hand, nearly full height, liquid level equals the live projected score, three handwritten annotations to its right (+ segar from places, − capek di jalan, − lewat budget), a crew character at its foot with a speech bubble. Right 50%: Bowlby headline, one-line lede, mood stickers, capek and baterai sosial sliders, primary pill "Cari tempat healing". Mobile 390: battery becomes a horizontal charge strip pinned under the nav, headline and sliders follow.

FORM: "Baterai pulang", position 7 on the ordered structure list, seed key 3bbfa4cf. Signature interaction: dragging any condition control recomputes the plan and the battery level eases to the new charge with a liquid wave, bubbles when charging and a red drip when draining; annotations re-tick their numbers. Motion grammar: ease-out quart, outline draw-in on first view, View Transitions between steps, all off under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Footer: the doodle crew footer stays as the closing page, lighter (fewer crew, no columns).

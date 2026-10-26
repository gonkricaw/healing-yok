---
name: Healing Yok
description: A hand-drawn sketchbook where your trip is a battery you watch fill and drain.
colors:
  page: "#ffd94a"
  paper: "#fff8d6"
  paper2: "#ffeba0"
  ink: "#141414"
  muted: "#4d3f12"
  leaf: "#1d7553"
  leaf-soft: "#cfe8d3"
  on-leaf: "#fff8d6"
  ticket: "#f4c537"
  warn: "#b3261e"
  warn-soft: "#ffd8c8"
  sky: "#8fdcff"
  amber: "#e8902a"
  night-page: "#17150f"
  night-paper: "#24211a"
  night-paper2: "#2f2a1f"
  night-ink: "#f4ecd8"
  night-muted: "#cbbf9e"
  night-leaf: "#5fc597"
  night-leaf-soft: "#1f3a2b"
  night-on-leaf: "#10170f"
  night-ticket: "#ffd94a"
  night-warn: "#ff8a70"
  night-warn-soft: "#3d2219"
  night-amber: "#f4b14a"
typography:
  display:
    fontFamily: "Bowlby One, Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.4vw, 80px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bowlby One, Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.6vw, 34px)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Bowlby One, Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.55
  body:
    fontFamily: "Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 700
    lineHeight: 1.3
  hand:
    fontFamily: "Gochi Hand, Plus Jakarta Sans Variable, cursive"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.3
  numeral:
    fontFamily: "Bowlby One, Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "tnum"
rounded:
  card: "22px 26px 20px 24px"
  toast: "18px 22px 17px 20px"
  strip: "12px 14px 11px 13px"
  stamp: "10px"
  blob: "40% 55% 45% 60%"
  pill: "999px"
spacing:
  gap-chip: "10px"
  card-x: "16px"
  card-y: "12px"
  ticket-x: "28px"
  question-top: "40px"
  section-top: "48px"
  gutter-sm: "16px"
  gutter-md: "24px"
  gutter-lg: "40px"
  container: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
  tile:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px 16px"
  tile-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px 16px"
  step-pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.hand}"
    rounded: "{rounded.blob}"
    height: "36px"
  step-pill-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    typography: "{typography.hand}"
    rounded: "{rounded.toast}"
    padding: "10px 20px"
  dock:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "12px 16px"
---

# Design System: Healing Yok

## Overview

**Creative North Star: "The Doodle Crew Sketchbook"**

Every surface is a page torn from a sunny sketchbook: paper cards cut by hand and laid on a yellow ground, outlined in thick wobbling ink, propped up by a hard ink shadow, and annotated in handwriting. The one instrument that runs through the whole product is a hand-drawn battery whose liquid level is the live Healing Bersih score; places charge it, travel and budget overrun drain it. The world plays, but the numbers are always the loudest thing on the page.

Density is moderate and phone-first. Controls are big stickers and paper tiles, each slightly rotated as if stuck on by hand; selecting one inks it solid. The doodle crew (small striped characters from the footer) react to the charge and blink. A night variant keeps the same sketchbook but swaps to warm ink ground, dark paper and cream ink.

The world is hand-made through one shared device, the `#sk-rough` SVG displacement filter (fractal noise, base frequency 0.035, scale 2.6), applied to card outlines, sticker outlines, the slider and the dock rule. That filter is what makes the whole app drawn, not only the battery.

**Key Characteristics:**
- Sunny yellow ground with a faint 22px halftone dot texture, never a gradient.
- Paper surfaces with 2.5px ink outlines that wobble through `#sk-rough`.
- Irregular, hand-cut corner radii; no two corners of a card match.
- Hard, unblurred ink offset shadows as the only elevation.
- Three-voice type: Bowlby One shouts, Plus Jakarta Sans operates, Gochi Hand annotates.
- Small rotations (between -2deg and 2deg) on stickers, tiles, cards and the battery.
- The battery is the running instrument on every step.

## Colors

Sunny primaries on paper, held together by one near-black ink; every color pulls its weight as charge, drain, or surface.

### Primary
- **Charge Leaf** (leaf): the battery's charging liquid, slider progress, `+ segar` annotations, the "on" toggle, the home map label, and the primary button's under-lip. Also the brand pin. On data, green always means charge.

### Secondary
- **Drain Red** (warn): drain annotations (`- capek di jalan`, `- lewat budget`), low-charge battery fill, the rotated "Kartu Healing" stamp. Red means the trip is costing you.
- **Half-Charge Amber** (amber): battery fill between 50 and 64, the warning band between charge and drain.

### Tertiary
- **Ticket Yellow** (ticket): slider thumb and map stop labels; the brighter, warmer yellow that reads as an object on the page rather than the page itself.
- **Sparkle Sky** (sky): doodle sparkles and the crew world's sky. Decorative only, never carries data.

### Neutral
- **Sunny Ground** (page): the page itself; also the text color on inked (selected) controls.
- **Sketch Paper** (paper): every card, sticker, tile, dock and battery body.
- **Deep Paper** (paper2): recessed paper, such as the off toggle track.
- **Ink** (ink): all outlines, all body text, selected controls, toast, offset shadows, focus ring.
- **Pencil Brown** (muted): secondary and handwritten text, slider end labels, hints.
- **Leaf Wash / Drain Wash** (leaf-soft, warn-soft): tinted paper for advice cards that read as healthy or warning.

The night variant (`night-*` keys) is applied by `prefers-color-scheme: dark` unless `data-theme="light"`, or forced by `data-theme="dark"`. Sky keeps its value in both themes.

### Named Rules
**The Charge Color Rule.** Battery fill is chosen by score only: leaf at 65 and above, amber from 50 to 64, warn below 50. No other color ever fills a battery.

**The One Ink Rule.** Outlines, text, shadows and the focus ring are all the same ink token. Never introduce a second line color; a gray border breaks the sketchbook.

## Typography

**Display Font:** Bowlby One (with Plus Jakarta Sans Variable, system-ui)
**Body Font:** Plus Jakarta Sans Variable (with system-ui, Segoe UI, Roboto)
**Label/Hand Font:** Gochi Hand (with Plus Jakarta Sans Variable, cursive)

**Character:** A fat poster face for questions, verdicts and numbers; a clean geometric sans for anything you read or press; a quick pen hand for the notes in the margin.

### Hierarchy
- **Display** (400, clamp(40px, 5.4vw, 80px), 0.92): the hero question only. Step 2 uses a smaller sibling (clamp(32px, 4vw, 56px)).
- **Headline** (400, clamp(26px, 2.6vw, 34px), tight): section heads on step 3; the ticket verdict runs slightly larger (clamp(28px, 2.8vw, 38px), line-height 1).
- **Title** (400, 21px): form questions ("Lagi merasa apa?"), with an optional Gochi Hand hint beside them at 19px.
- **Lede** (500, 17px, max 44ch): the one-line explanation under the hero.
- **Body** (400, 15px, 1.55): base text.
- **Label** (700, 14.5px to 15px): button, chip and tile labels, dock summary.
- **Hand** (Gochi Hand 400, 16px to 20px): annotations, sub-lines, slider ends, step pills, toast, map labels.
- **Numeral** (Bowlby One, tabular): scores at 20px to 30px in rows and dock; the battery's own numeral is drawn at 112px in paper with a 10px ink stroke.

### Named Rules
**The Three Voices Rule.** Bowlby One for questions, verdicts and numbers; Plus Jakarta Sans for what you read and press; Gochi Hand for what the crew would scribble. A button label is never handwritten, and a paragraph is never Bowlby.

**The Sentence Case Rule.** All type is sentence case. There are no uppercase labels and no wide-tracked caps anywhere in the build.

## Layout

A single centered column capped at 1440px with gutters of 16px, 24px from `sm`, and 40px from `lg`. Step 1 at `lg` splits into a sticky battery aside (left, about 40%) and the form (right); below `lg` the battery collapses into a horizontal charge strip stuck under the nav with a bottom ink rule. Form rhythm: questions open 40px above their controls, step 3 section heads open 48px above; chips wrap with 10px gaps; cards pad 12px by 16px, the ticket 24px by 28px. A paper dock is fixed to the bottom with a hand-drawn top rule, carrying the mini battery, a two-line summary and the step's primary action; it is hidden on step 1 at desktop widths because the hero already carries both. Body background carries the 22px halftone. Layout holds from 360px to ultrawide.

## Elevation & Depth

Depth is printed, not lit: a solid ink block offset down and right, no blur, ever. Paper sits on the page; raised paper casts its ink shadow; pressed paper loses it.

### Shadow Vocabulary
- **Ink raise** (`box-shadow: 4px 4px 0 var(--color-ink)`): cards that matter, such as the Kartu Healing ticket.
- **Ink raise small** (`box-shadow: 3px 3px 0 var(--color-ink)`): chips, ghost buttons, selected tiles, tile hover.
- **Leaf lip** (`box-shadow: 0 4px 0 var(--color-leaf)`): the primary button only.
- **Thumb shadow** (`box-shadow: 2px 2px 0 var(--color-ink)`): slider thumb.
- **Battery drop** (`filter: drop-shadow(7px 7px 0 var(--color-ink))` to 9px): the drawn battery, since it is SVG.

### Named Rules
**The Hard Ink Rule.** Shadows are solid ink offsets with zero blur. A soft or colored ambient shadow does not exist in this world.

**The Press Rule.** On press, a raised control drops its shadow and moves down 2px; on hover it lifts 2px. Shadow and translation always travel together.

## Shapes

Hand-cut paper. Cards use four different corner radii (22px 26px 20px 24px); the toast and the battery strip follow the same uneven pattern. Stickers and buttons are full pills. Step pills are lumpy blobs (40% 55% 45% 60%). The brand pin is a teardrop (50% 50% 50% 5px rotated -45deg). All outlines are 2.5px ink (3px for the dock rule and the ticket stamp) drawn on a pseudo-element through `#sk-rough`, so the edge wobbles while the content stays crisp. The ticket adds a perforation: two page-colored half circles at the edges joined by a dashed ink line. Dashed outlines mark optional or toggle cards.

### Named Rules
**The Hand-Cut Rule.** No surface gets four equal corners unless it is a full pill or circle.

**The Wobble Rule.** Every ink outline on a card, sticker, slider or rule goes through the shared `#sk-rough` filter. A straight CSS border on paper is a bug.

## Components

### Buttons
- **Shape:** full pill (999px) with a 2.5px wobbling ink outline.
- **Primary:** ink fill, page-colored bold label, 12px by 20px, sitting on a leaf-green 4px lip. One per view: "Cari tempat healing", "Lihat rencana", "Salin rencana".
- **Ghost:** paper fill, ink label, small ink raise.
- **Hover / Active:** lift 2px on hover; on press move down 2px and lose the shadow, 200ms ease-out (100ms on press). Labels carry no arrows.

### Chips
- **Style:** paper sticker pills, bold 14.5px label, small ink raise, each rotated by a fixed tilt cycle (-2deg, 1.5deg, -1deg, 2deg, -1.5deg, 1deg).
- **State:** selected chips are inked solid (ink fill, page text). `aria-pressed` reflects state.

### Cards / Containers
- **Corner Style:** hand-cut (22px 26px 20px 24px).
- **Background:** paper; leaf-soft or warn-soft for advice cards.
- **Shadow Strategy:** flat at rest or ink raise (see Elevation).
- **Border:** 2.5px ink through `#sk-rough`, drawn inside the box so it survives `overflow: hidden`; dashed for toggles.
- **Internal Padding:** 12px by 16px.
- **Tiles:** option cards with a bold title and a Gochi Hand sub-line, tilted slightly (-0.6deg to 0.6deg) and straightened to 0deg when selected and inked.

### Inputs / Fields
- **Slider:** lives in a paper card with a Plus Jakarta label and a handwritten live value, a 14px ink-outlined pill track filled leaf up to the value, and a 28px ticket-yellow thumb with a 2px ink shadow that scales 1.15 and turns -8deg while dragged. Handwritten end labels sit below. Disabled at 45% opacity.
- **Toggle:** a dashed card holding a 46px by 26px ink-outlined track (paper2 off, leaf on) whose knob slides 20px.
- **Focus:** a 2.5px dashed ink outline, offset 3px (6px on sliders), on every focusable element.

### Navigation
- **Step pills:** 36px lumpy blobs, Gochi Hand 18px with a tabular step number; current step is inked, unreached steps sit at 40% opacity and are disabled. Below `md`, only the current pill shows its name.
- **Brand:** leaf teardrop pin plus Bowlby "Healing Yok" (19px, 22px from `sm`); the only wordmark on the page.

### Battery (signature)
The hand-drawn battery is the product's instrument. Vertical on the step 1 hero and inside the ticket, wide on narrow tickets, a strip in the mobile header, mode rows and dock. Liquid fill follows the Charge Color Rule with a -35deg ink hatch, a moving wave, rising bubbles when it charges and a red drip when it drains. The level eases to new values over 700ms to 900ms (ease-out). Outlines draw in once on first view. It is always a `meter` with a label and value.

### Charge notes and crew
Handwritten margin notes beside the battery: a Bowlby signed number (leaf for plus, warn for minus, ink for budget-safe) over a Gochi Hand reason, each pointed at the battery by a drawn arrow. A crew character at the battery's foot speaks through a paper speech bubble and changes with the charge.

### Kartu Healing (ticket)
The signature object: a raised paper card tilted -0.6deg with a Bowlby verdict, a handwritten summary, the battery and its notes, a perforated tear line, and a red "Kartu Healing" rubber stamp rotated -6deg. The 9:16 recap video mirrors the same composition.

### Toast
An ink slip with page-colored Gochi Hand text at 19px, hand-cut corners, rising 20px into place over 250ms and leaving after 2.2s.

## Do's and Don'ts

### Do:
- **Do** route every new ink outline through the shared `#sk-rough` filter using the existing card or line treatment.
- **Do** use the hard ink shadows (4px 4px 0 and 3px 3px 0) and drop them on press.
- **Do** fill batteries by the Charge Color Rule: leaf at 65 and above, amber from 50, warn below 50.
- **Do** give stickers, tiles and cards a small rotation within -2deg to 2deg, and straighten a tile when it is selected.
- **Do** keep scores in Bowlby One with tabular numerals.
- **Do** ease with the house curve cubic-bezier(0.22, 1, 0.36, 1), and collapse every animation to 1ms under `prefers-reduced-motion` (wave, bubbles and drip hidden, floating doodles stopped).
- **Do** move between steps with View Transitions (220ms out, 420ms in).
- **Do** use a dashed 2.5px ink outline for focus.

### Don't:
- **Don't** blur a shadow or tint it; depth is solid ink only.
- **Don't** use warn red outside drain notes, low-charge fills and the Kartu Healing stamp; on data, leaf always means charge and warn always means drain.
- **Don't** set button or chip labels in Gochi Hand, or paragraphs in Bowlby One.
- **Don't** add uppercase or letter-spaced labels; everything is sentence case.
- **Don't** give a paper surface four equal corners unless it is a pill or circle.
- **Don't** use gradients as decoration; gradients appear only as functional fills (slider progress, battery hatch, halftone dots).
- **Don't** add a second line color beside ink.

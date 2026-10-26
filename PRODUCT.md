# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People in Jabodetabek who want to "healing" (a short recharge outing) but cannot decide where to go: someone bored at home, a tired office worker, a young family with kids, a group of friends, or someone wanting me time. All segments are equal priority. They use it on their phone at the moment of deciding, often together with the people they will go with.

## Product Purpose

Turn "mau healing ke mana?" into a concrete plan in three steps: describe your condition (mood, who, duration, start time, departure zone, budget, tiredness, social battery), get matched places, then a full plan with an hourly schedule, transport comparison, cost breakdown, and honest advice. Success: the user leaves with a plan they trust enough to send to the group chat.

## Positioning

The **Healing Bersih** score: the refreshment a place gives minus the stress and fatigue of getting there and any budget overrun. When the trip would cancel out the healing, the product says so honestly and suggests something closer. A normal trip planner optimizes the destination; Healing Yok optimizes how you feel when you get home.

## Operating Context

Weekend and after-work decisions, phone first, shared via WhatsApp (copy plan text, share link that reopens the same plan, 9:16 recap video for Story). The current build is a mockup shown to three audiences at once: pitch judges or investors (first impression on a laptop or big screen), prospective users trying it on their phones, and a design portfolio showcase.

## Capabilities and Constraints

- Mockup only: no backend, no accounts, all places, prices, events, and distances are dummy data and must stay labeled as dummy.
- Scoring model and transport tariffs are deterministic rules (HANDOFF.md §6); they are tested and must not become nondeterministic.
- Stack: Vite + React + TypeScript + Tailwind v4 (shadcn structure), three.js, Lenis, Remotion Player. Deploys to Cloudflare Pages.
- UI copy is Bahasa Indonesia, casual but tidy, sentence case, no arrows in buttons, no em or en dashes.
- Not tracked in any project management tool.

## Brand Commitments

- Name: Healing Yok. Voice: casual, warm, honest ("Jujur saja"), never salesy.
- The Kartu Healing (ticket-style score card) is the signature object.
- The owner chose the hand-drawn sketchbook "doodle crew" world (ink wordmark, hand-drawn characters, drifting doodles) as the direction for the whole product, starting with the hero.

## Evidence on Hand

No real users, testimonials, partners, metrics, or photos exist. Do not fabricate any. Place data is fictional (src/domain/data.ts).

## Product Principles

1. Honesty over hype: show the real cost of travel in energy and money, even when it makes the plan look worse.
2. Decide fast: a usable plan within a minute, sensible defaults chosen for you.
3. Made to share: every plan is easy to send and reopens exactly the same.
4. Playful, not childish: delight supports the decision and never hides the numbers.

## Accessibility & Inclusion

Must work at 360px phones through ultrawide, light and dark, keyboard reachable with visible focus, and respect prefers-reduced-motion.

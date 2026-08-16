---
name: KOBO
description: A trusted campus trade board in your pocket — Find am. Pay safe.
colors:
  ink: "#1E211C"
  paper: "#F5F1E8"
  paper-bright: "#FFFDF7"
  lime: "#C8F135"
  cobalt: "#275DCE"
  cobalt-dark: "#1E47A8"
  mango: "#FFB000"
  coral: "#E95D4F"
  muted: "#5B6057"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(3.15rem, 7vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.82
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.25
rounded:
  menu: "10px"
  control: "12px"
  surface: "14px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "#FFFFFF"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-dark}"
    textColor: "#FFFFFF"
    rounded: "{rounded.surface}"
  button-secondary:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "10px 20px"
    height: "44px"
  input:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "10px 16px"
    height: "44px"
  notice-slip:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
---

# Design System: KOBO

## Overview

**Creative North Star: “The Trusted Campus Trade Board”**

KOBO should feel like the campus notice board has become a dependable pocket marketplace: immediate, local, tactile, and easy to scan. The world is built from deep charcoal discovery fields, warm paper slips, clipped notice-board details, bright lime location rails, cobalt trust actions, and mango service cues. It is deliberately not a generic blue marketplace or a polished corporate fintech dashboard.

The interface is mobile-first and compact without feeling cramped. Oversized condensed headings create the editorial voice; straightforward body copy and familiar line icons keep tasks legible. Colour is functional, not ornamental: lime means local context or the primary posting action, cobalt advances a trusted interaction, mango distinguishes services, and coral is reserved for alerts or destructive actions.

The approved visual comp and the final mobile and desktop implementations are aligned; the finish review verdict is **PASS**. The implemented files remain the source of truth when a rule here and shipped behaviour ever diverge.

**Key Characteristics:**

- Charcoal-to-paper page structure with high-contrast, condensed headlines.
- Paper notice slips with a right-edge ticket notch and a coloured category rail.
- A persistent lime campus strip that keeps locality visible while browsing.
- Cobalt for trusted actions and active navigation; lime for selling and campus context.
- Rounded, tactile controls with restrained lift rather than glossy effects.
- One clear next step in every loading, empty, error, and transaction-related state.

## Colors

The palette combines warm campus-paper neutrals with vivid, narrowly assigned utility colours.

### Primary

- **Campus Lime** (`lime`): location rails, the mobile Sell action, seller CTAs, and selected high-energy moments. Pair with Ink text, never white.
- **Trust Cobalt** (`cobalt`): primary buttons, links that advance a task, active navigation, category rails for products, and trust-oriented accents. Use `cobalt-dark` for hover.

### Secondary

- **Service Mango** (`mango`): service and calculator category cues, plus service-specific empty or promotional notices. Pair with Ink text.

### Tertiary

- **Alert Coral** (`coral`): unread counts, destructive actions, and genuine alert conditions. It is not a decorative accent.

### Neutral

- **Board Ink** (`ink`): hero, header, and footer fields; primary text on light surfaces.
- **Warm Paper** (`paper`): the page canvas and the notch colour cut from notice slips.
- **Bright Slip** (`paper-bright`): cards, menus, inputs, search fields, and secondary buttons.
- **Accessible Muted** (`muted`): supporting copy, inactive navigation, and placeholders. It has a 5.72:1 contrast ratio on Warm Paper and 6.34:1 on Bright Slip, so it is the required muted-text token on light surfaces. Do not replace it with low-opacity Ink for essential small text.

**The Assigned Accent Rule.** Lime means place or post, cobalt means trust or proceed, mango means services, and coral means attention or danger. Do not rotate these colours for variety.

**The Warm Ground Rule.** The page canvas is Warm Paper, not pure white. Bright Slip is reserved for interactive or raised content.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow and sans-serif fallbacks)  
**Body Font:** Manrope (with system-ui and sans-serif fallbacks)

**Character:** Barlow Condensed gives KOBO the urgency and hand-posted confidence of a campus notice. Manrope keeps search, prices, metadata, and instructions calm and legible on small screens.

### Hierarchy

- **Hero display:** Extra-bold, uppercase, tightly tracked, and intentionally compressed. The home hero scales from 3.15rem on mobile to 5.5rem on large screens and uses a 0.82 line-height.
- **Section headline:** Extra-bold uppercase Barlow Condensed at 1.875rem with a 1.0 line-height. Use for labels such as “Pick a lane” and “Recent near you.”
- **Card title:** Extra-bold uppercase Barlow Condensed, normally 1.5rem. Keep category titles short enough to remain a single strong block.
- **Body:** Manrope at 0.875–1rem, usually 1.5 line-height. Hero support copy may rise to 1.125rem with a 1.55 line-height on larger screens.
- **Label:** Manrope at 0.6875–0.75rem, bold or extra-bold. Uppercase eyebrow labels use wide tracking; navigation labels remain title case.

**The Two-Voice Rule.** Barlow Condensed speaks for brand, category, and section identity; Manrope handles every instruction, description, control, price, and piece of metadata.

**The Short Headline Rule.** Condensed uppercase type is for compact phrases, not paragraphs or error explanations.

## Layout

KOBO uses a single centred content boundary of `max-w-7xl` (1280px). Horizontal gutters are 16px on mobile, 24px from the small breakpoint, and 32px from the medium breakpoint. The main header is 64px high on mobile and 72px from 768px upward.

The home hero is a full-width Ink field. Mobile presents the message, search, and primary browse action in one column. At 768px it becomes a two-column composition: approximately 1.05fr for the message and 0.95fr for the four category tiles, with a minimum hero height of 500px. The first category tile is offset downward to preserve the staggered board composition.

The lime campus rail is sticky beneath the header (`top: 64px` mobile; `top: 72px` desktop) and scrolls horizontally without a visible scrollbar. Place names must never wrap or squeeze. The content area is a single stream until 1024px; then it becomes a narrow category lane (0.72fr, minimum 260px) beside a wider feed (1.28fr). Section spacing is typically 48px, card gaps 12px, and major content padding 32–56px depending on viewport.

On mobile, keep the five-item bottom navigation fixed and reserve bottom space so content is not obscured. The central Sell action projects above the bar and remains within thumb reach. Hide the desktop footer and desktop navigation below 768px; hide the bottom navigation at 768px and above. Core content must remain usable at 320px without horizontal page scrolling.

Product feeds use the compact two-column grid already established by Home; service feeds become two columns from 640px. Do not collapse the location rail into a dropdown unless the interaction and discoverability have been explicitly redesigned.

**The Locality-Stays-Visible Rule.** Campus context sits directly below global navigation and remains sticky; users should never have to infer where they are browsing.

## Elevation & Depth

The system is flat at the page level and lightly lifted at the object level. Depth comes from warm tonal layering, clipped paper silhouettes, coloured rails, and two restrained Ink-tinted shadows. Avoid glassmorphism, gradients, heavy outlines, and large diffuse glows.

### Shadow Vocabulary

- **Card:** `0 8px 20px -14px rgb(30 33 28 / 0.42)` — the default lift for cards, slips, buttons, and the campus rail.
- **Card hover:** `0 16px 34px -20px rgb(30 33 28 / 0.55)` — paired with a 2px upward translation for interactive cards.
- **Hero search:** `0 18px 40px -24px rgba(0,0,0,.8)` — only where a Bright Slip control sits on Ink.
- **Account disclosure:** `0 20px 55px -24px rgba(0,0,0,.7)` — reserved for floating menus over the app shell.

**The Lift-with-Purpose Rule.** Resting surfaces use only the Card shadow. Stronger elevation communicates hover or true overlay depth, not visual importance alone.

## Shapes

The core silhouette is a gently rounded rectangle with a 14px radius. Search, cards, primary and secondary buttons, and notice slips share it. Compact navigation controls use 12px; menu rows and avatars use 10px; badges and the central mobile Sell action are fully circular or pill-shaped.

The signature notice slip adds a 20px-high, 8px-wide semicircular notch at the middle of its right edge. The notch is filled with Warm Paper so the card appears clipped from the page. Category versions pair this edge with a fixed 80px coloured rail on the left. Preserve the notch’s quiet scale: it should read as a physical-paper cue, not a decorative scallop.

Borders are rare. Inputs use a 1px inset Ink stroke at rest and a 2px Cobalt inset stroke on focus. Dividers use low-opacity Ink on light surfaces or Paper on dark surfaces. Do not add borders to every card.

**The One-Radius Rule.** Start with 14px for any new primary surface or control; move to 10–12px only for compact nested elements.

## Components

### Buttons

- **Primary:** Trust Cobalt, white text, bold Manrope, 14px radius, at least 44px high, and 20px horizontal padding. Hover shifts to Cobalt Dark and the hover shadow.
- **Secondary:** Bright Slip with Ink text and the standard card shadow. Use for “Browse marketplace” and actions that sit beside a stronger primary action.
- **Lime seller action:** Campus Lime with Ink extra-bold text. Use for “Sell,” “Post a listing,” or equivalent creation actions; hover may lighten to `#D7FA59`.
- **Ghost:** Transparent, 12px radius, Ink at 70% on light surfaces. Hover uses a 5% Ink wash and full Ink text. On Ink surfaces, use Paper at 80% and a 10% white wash.
- **Disabled:** Keep the component shape but reduce opacity to 50%, remove pointer affordance, and prevent activation.
- **Focus:** All buttons and links use a visible 2px Cobalt focus ring with a 2px offset. Do not suppress it when replacing a component.

### Inputs / Search

Fields are Bright Slip, 14px radius, at least 44px high, with Ink input text and Accessible Muted placeholder text. Standard fields use an inset Ink stroke; focus changes it to a 2px Cobalt inset stroke. The home search is a larger composite surface with a leading line icon and a trailing Cobalt action. Its text input remains borderless because the parent surface owns focus and shape.

### Cards / Containers

Base cards are Bright Slip with a 14px radius, clipped overflow, and the Card shadow. Interactive cards transition over roughly 200–300ms, rise 2–4px, and use Card Hover shadow. Category tiles may use Cobalt, Lime, or Mango according to the assigned accent rule; text switches between white and Ink to maintain contrast.

### Notice Slips

Use a notice slip for a category lane, empty state, recoverable error, or concise next-step prompt—not as a generic wrapper around dense content. Category slips use the 80px accent rail, a Lucide line icon, uppercase condensed title, short Manrope description, and Cobalt chevron. Empty and error slips omit the rail when the message itself is primary and end with a single action.

### Navigation

Desktop navigation sits on Ink. Active items use Paper text and a 2px Lime bottom border; inactive items use Paper at 75% and brighten on hover. The mobile header keeps KOBO, current campus, and account access visible while the fixed five-position bottom bar owns primary navigation. In the bottom bar, active items are Cobalt, inactive items use Accessible Muted, and Sell is the centred raised Lime circle. The desktop footer repeats the Ink field and shifts links to Lime on hover.

### Icons

Use Lucide React line icons already present in the repository. Default sizes are 16–20px for controls and navigation, 24–28px for category rails or feature tiles. Use approximately 2px stroke weight (`1.8` is acceptable for large category icons). Icons support text; they do not replace an unfamiliar label. Mark decorative icons `aria-hidden="true"`; visible icon-only controls need an accessible name.

### States

- **Loading:** Use shape-matched skeleton slips in a 10% Ink tint. Mark them hidden from assistive technology and avoid content reflow.
- **Empty:** Say what is absent, explain the useful next step, and provide one creation CTA.
- **Error:** Use plain language (“We couldn’t load…”), a short recovery instruction, and a “Try again” button. Do not blame the user or rely on Coral alone.
- **Hover / active:** Use small colour shifts, chevron movement, or restrained vertical lift. Never make hover the only way to discover an action.
- **Motion:** Honour `prefers-reduced-motion`; reduce animation and transition durations to effectively instant and disable smooth scrolling.

### Content Voice

Write in plain, locally intelligible English. Be brief, practical, and explicit about place, money, and what happens next. “Find am. Pay safe.” is the brand line, not a licence to fill the product with slang. Prefer verbs such as Find, Browse, Post, Offer, Message, Pay, Confirm, and Try again. Use Ghana cedi notation consistently when money appears, and never call a payment flow “escrow” unless product and legal approval make that claim true.

### How to Extend

For a new screen, compose from the existing app shell first: Ink navigation, Warm Paper canvas, Bright Slip content, 14px controls, display headings, and one assigned accent. Reuse `.display-type`, `.section-title`, `.btn-*`, `.input-field`, `.card*`, `.badge`, `.notice-slip`, and `.no-scrollbar` from `frontend/src/index.css` before creating variants. Add durable primitive tokens in `frontend/tailwind.config.js` and mirror only foundational colours as CSS custom properties in `frontend/src/index.css`; do not scatter new hex values through JSX.

If a new category is needed, choose its rail colour by meaning rather than by novelty, use an existing Lucide icon, and test the resulting text/icon contrast. If a new state is needed, define loading, empty, error, disabled, success, offline, retry, and reconnect behaviour where relevant before shipping. Verify at 320px, around the 768px navigation switch, and at desktop width, with keyboard focus and reduced motion enabled.

## Do's and Don'ts

### Do:

- **Do** keep the page grounded in Warm Paper and reserve Bright Slip for cards, controls, and overlays.
- **Do** use Accessible Muted for small secondary text on light surfaces.
- **Do** keep the campus rail sticky and horizontally scrollable on narrow screens.
- **Do** provide approximately 44px minimum targets for primary controls and navigation.
- **Do** pair every colour-coded category or status with a label and, where useful, an icon.
- **Do** keep transaction and recovery copy explicit about the next action.
- **Do** preserve semantic elements, keyboard operation, visible focus, screen-reader labels, and reduced-motion handling.
- **Do** compare meaningful home-page changes against the approved comp and the final mobile and desktop screenshots.

### Don't:

- **Don't** turn KOBO into a generic white-and-blue marketplace; the Ink field, Warm Paper ground, and campus-board geometry are identity, not decoration.
- **Don't** use Lime, Mango, Cobalt, and Coral interchangeably or place white text on Lime/Mango.
- **Don't** replace the notice-slip notch with torn-paper textures, skeuomorphic pins, or noisy shadows; the shipped treatment is intentionally refined.
- **Don't** use Barlow Condensed for paragraphs, form values, prices, or instructions.
- **Don't** introduce emojis, mixed icon families, icon-only unfamiliar actions, or filled illustrations where a Lucide line icon already fits.
- **Don't** hide essential content behind hover, colour alone, or a mobile-only gesture.
- **Don't** fabricate seller trust, payment protection, campus coverage, or marketplace activity in interface copy.
- **Don't** add a new radius, shadow, or one-off hex value until the existing vocabulary demonstrably cannot express the need.

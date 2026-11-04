# Design System: 포항고 2026 인문사회 R&E 시네마 발표
**Authoritative implementation:** `v2-studio/src/themes.css`, `v2-studio/src/style.css`, `v2-studio/src/main.js`.
**Principle:** Four genuinely distinct research presentation identities, NOT one template with four color substitutions.

## 1. Visual Theme
A research conference meets cinematic title design. Readable assertions, authentic evidence, author citations, restrained movement and practical student presentation controls. Visuals clarify data and argument rather than add synthetic spectacle.

## 2. Four Theme Palettes & Rationale
- **신진욱 / Warm Justice Ledger:** aged cream `#faf4e9`, dark forest ink `#24433a`, ethical green `#136a57`, copper `#bf834e`. A warm, trustworthy research ledger for fairness and payment choices.
- **차민혁 / Digital Typography Lab:** deep violet-black `#150724`, soft white `#fff7fb`, acid-lime `#f7fb79`, vivid pink `#ff58b8`. Lexical change and the energy of youth language, with readable contrast.
- **허준완 / Investigation Casefile:** evidence black `#090e14`, parchment white `#f7ebdc`, aged gold `#e8b279`, terracotta `#d7745a`. Serious international-law dossier.
- **신승연 / Everyday Field Notebook:** warm ivory `#fff9e9`, dark teal ink `#1f4550`, vivid teal `#0e8176`, gold `#f0aa4f`. Observational school-life fieldwork.

## 3. Typography
- Match each theme's established font stack in `themes.css` rather than flattening all teams to one font.
- Large presentation titles, short evidence-aware assertions, generous line spacing for Korean paragraphs.
- Keep numbers, denominators, survey sample sizes and citation attribution legible at a projected-display distance.

## 4. Components & Movement
- Team-specific intro, timeline/stat cards, charts, quotes, speaker notes, final research recommendation.
- Motion must support sequence and explanation. Include reduced-motion/keyboard alternatives when changing transitions.
- Keep 1- and 2-presenter modes, 7-minute rehearsal/script view, question and answer, and accessible navigation.
- Never restyle a chart in a way that reverses scales, hides denominators or exaggerates survey findings.

## 5. Layout Constraints
- Slide layouts optimized for presentation displays, not responsive magazine content.
- Printable scripts / DOCX and source slide data remain aligned.
- 18–19 slide targets are project-specific, not a reason to fabricate additional material.
- Images require attribution and rights review in `v2-studio/public/assets/credits.json`.

## 6. Research Integrity
- Preserve actual survey questions, item-specific N, percent denominators, uncertainty and methodological limitations.
- Distinguish student hypotheses, measured findings, teacher suggestions and future recommendations.
- Do not fabricate interviews, expert endorsement, statistical significance or actual field observations.
- Keep each team's visual direction separate when importing into Stitch or Antigravity.

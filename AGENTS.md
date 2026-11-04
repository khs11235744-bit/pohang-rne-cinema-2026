# 2026 Pohang Humanities/Social Science R&E Cinematic Slides — Agent Instructions

## Objective
Support student research presentations; preserve academic integrity, actual data, visual distinctness and the teacher-approved script. Read `README.md`, `DESIGN.md` and the current team-specific JSON before changing a slide.

## Key files
- `v2-studio/data/*.json`: research facts, 7-minute script, slide data.
- `v2-studio/src/main.js`: presentation controls and script synchronization.
- `v2-studio/src/themes.css`: four different visual languages.
- `v2-studio/src/visuals.js`: charts/animations.
- `v2-studio/public/assets/credits.json`: image sourcing/rights.
- `v2-studio/qa/*.mjs`: test gates.
- `site/v2/`: static generated output (do not hand-edit generated output instead of source).

## Research & presentation guardrails
- Do not make up research observations, participant counts, interview quotes, peer-reviewed references, p-values or findings.
- Preserve each survey item's own denominator and the distinction between preliminary/final data.
- Differentiate survey opinion from observed conduct, hypothesis from conclusion, and interview testimony from verified fact.
- Student proposals should be justified by reported evidence and realistic implementation.
- Support classroom presentation without requiring paid external model APIs at runtime.
- Keep speaker notes, display text, scripts, exports and images synchronized.

## Required validation before deployment
`cd v2-studio && npm ci && npm run check && npm run build && node qa/smoke.mjs`.
Also examine slide overflow, contrast, transitions, chart labels, tablet/browser controls and print script output.
Never claim source modification means Cloudflare deployment occurred. Report source/test/deploy/live separately.

## Design tools
Use `DESIGN.md` with Stitch or Antigravity to maintain four distinct aesthetics rather than applying one generic AI-generated theme.

#!/usr/bin/env node
/**
 * Evidence-aware, LOCAL ONLY visual prompt briefs for R&E cinematic presentations.
 * Supports user-directed transfer into Mixboard / Google Flow without calling an API.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEAM_CODES = ["shin", "cha", "hu", "seung"];
const THEMES = {
 shin: "Analog school research ledger, warm cream paper, deep forest green, ethically balanced human-scale composition, factual typographic restraint.",
 cha: "Contemporary kinetic Korean typography study, dark purple, lime and bright pink, generational conversation represented with abstract graphic motifs, readable composition.",
 hu: "Careful international law dossier, charcoal ink, antique brass, maps and documentary evidence textures, sober and source-aware.",
 seung: "Everyday school fieldwork notebook, warm ivory, teal and gold, orderly observational scene without identifying real students."
};
const rawArgs = process.argv.slice(2);
const pick = name => { const i = rawArgs.indexOf(name); return i < 0 ? null : rawArgs[i+1]; };
const teamArg = pick("--team") || "all";
const selected = teamArg === "all" ? TEAM_CODES : [teamArg];
if(selected.some(x => !TEAM_CODES.includes(x))){
  console.error("Usage: node scripts/export-visual-briefs.mjs --team shin|cha|hu|seung|all [--out path] [--stdout]");
  process.exitCode = 2;
}else{
 const output = [];
 for (const code of selected) {
  const data = JSON.parse(readFileSync(join(root, "data", code+".json"), "utf8"));
  // Names, emails and phone numbers are removed even from free-text slide titles/claims.
  const names = (data.students||[]).map(s => String(s).trim()).filter(Boolean);
  const redact = value => {
   let s = String(value||"");
   for(const name of names){s = s.split(name).join("[학생]");}
   return s.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,"[이메일]")
     .replace(/(?:01[016789])[-\s]?\d{3,4}[-\s]?\d{4}/g,"[전화번호]");
  };
  const chunks = [
   "# R&E visual brief / "+code,
   "",
   "Project: "+redact(data.project || data.title),
   "Style: "+THEMES[code],
   "",
   "Research integrity rules:",
   "- Visuals are background illustration or explanatory B-roll, not evidence or reenacted factual records.",
   "- Do not invent survey answers, numerical charts, quotations, interviews or historical photographs.",
   "- Never generate photorealistic likenesses of identifiable students.",
   "- Keep citation text, denominators and numerical evidence in the original slides, not in image-generation prompts.",
   "- Confirm rights and image origin before presentation or publication.",
   ""
  ];
  for(const [i,slide] of (data.slides||[]).entries()){
   chunks.push(
    "## "+(i+1)+". "+redact(slide.title||"Untitled"),
    "Section: "+redact(slide.section||slide.kind||""),
    "Topic: "+redact(slide.claim||slide.subtitle||""),
    "Prompt: Design a supporting NON-DOCUMENTARY, NON-PHOTOREAL illustration or abstract background for this research presentation. "+THEMES[code],
    "Negative requirements: No factual photos, no fictional quotes, no fake charts, no logos, no student faces, no fabricated statistical values.",
    ""
   );
  }
  output.push(chunks.join("\n"));
 }
 const combined = output.join("\n\n---\n\n");
 const destination=pick("--out");
 if(destination){
   const target=resolve(destination);
   mkdirSync(dirname(target),{recursive:true});
   writeFileSync(target,combined,"utf8");
   console.log("Saved "+target+" ("+selected.length+" teams)");
 }else{
   process.stdout.write(combined+"\n");
 }
}

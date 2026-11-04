import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const exporter = resolve(root, "scripts", "export-visual-briefs.mjs");

for(const code of ["shin","cha","hu","seung"]){
 test("visual brief preserves research privacy and research guardrails: "+code,()=>{
  const data=JSON.parse(readFileSync(resolve(root,"data",code+".json"),"utf8"));
  const result=execFileSync(process.execPath,[exporter,"--team",code,"--stdout"],{encoding:"utf8"});
  assert.match(result,/No factual photos/);
  assert.match(result,/no fake charts/i);
  assert.match(result, new RegExp("R&E visual brief / "+code));
  for(const student of (data.students||[])){
   if(String(student).trim())assert.equal(result.includes(String(student).trim()),false,"personal name leaked in visual brief");
  }
 });
}

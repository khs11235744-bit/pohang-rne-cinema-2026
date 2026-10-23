import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const base=dirname(fileURLToPath(import.meta.url));
const teams=['shin','cha','hu','seung'];
const input={hub:resolve(base,'index.html')};
for(const team of teams){input[team]=resolve(base,team,'index.html');input[team+'Script']=resolve(base,team,'script.html');}
export default defineConfig({base:'./',build:{outDir:'dist',emptyOutDir:true,assetsInlineLimit:0,rollupOptions:{input}}});

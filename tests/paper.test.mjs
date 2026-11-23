import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { readSources, build } from '../scripts/build.mjs';
import { validate, html, inline, blocks, safeLink } from '../scripts/render.mjs';
import { createPreviewServer } from '../scripts/serve.mjs';
const [paper,pub] = await readSources();

test('all paper mathematics and tables render without errors',()=>{
 validate(paper,pub);
 const output=html(paper,pub);
 assert(!output.includes('katex-error'));
 assert(output.includes('<math'));
 assert(output.includes('<table>'));
 for(const section of paper.sections) assert(output.includes(`id="${section.id}"`));
 assert(!output.includes('Research status'));
});
test('publication notices preserve license restrictions, contribution permission and attribution',()=>{
 const license=paper.sections.find(s=>s.id==='license');
 const text=license.blocks.map(b=>b.content.map(p=>p.value).join('')).join('\n');
 for(const paragraph of [...pub.licenseParagraphs,pub.contributionPermission,pub.copyright]) assert(text.includes(paragraph));
 const legal=paper.sections.find(s=>s.id==='legal-disclaimer').blocks.map(b=>b.content.map(p=>p.value).join('')).join('\n');
 for(const paragraph of pub.disclaimerParagraphs) assert(legal.includes(paragraph));
 assert(text.includes('non-commercial')); assert(text.includes('pull-request'));
});
test('renderer rejects unsafe links and escapes proposed text',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,test','https://user:password@example.com','http://example.com']) assert.throws(()=>safeLink(url));
 assert.equal(inline([{kind:'text',value:'<script>alert(1)</script>'}]),'&lt;script&gt;alert(1)&lt;/script&gt;');
 assert.throws(()=>blocks([{kind:'equation',label:'bad',latex:'\\notacommand{',explanation:''}]));
 assert.throws(()=>blocks([{kind:'table',caption:'bad',headers:['a','b'],rows:[[[{kind:'text',value:'one'}]]]}]));
});
test('generated artifacts match the reviewed source',async()=>{
 await build(true);
 const tex=await readFile(new URL('../manuscript/proof-of-cipher.tex',import.meta.url),'utf8');
 assert(tex.includes('\\begin{document}')); assert(tex.includes('\\begin{longtable}'));
 assert(tex.includes(pub.publisher)); assert(!tex.includes('Research status'));
});
test('localhost reader serves math and fonts but never repository files',async()=>{
 const server=createPreviewServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const response=await fetch(base);assert.equal(response.status,200);assert((await response.text()).includes('Proof of Cipher'));
  assert.match(response.headers.get('content-security-policy'),/default-src 'none'/);
  assert.equal((await fetch(base+'/assets/katex.min.css')).status,200);
  for(const path of ['/.git/config','/manuscript/paper.json','/package.json','/%2e%2e/package.json','/assets/fonts/../../package.json']) assert.equal((await fetch(base+path)).status,404);
  assert.equal((await fetch(base,{method:'POST'})).status,405);
  const head=await fetch(base,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

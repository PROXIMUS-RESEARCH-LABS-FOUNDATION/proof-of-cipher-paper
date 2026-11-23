import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validate, markdown, latex, html } from './render.mjs';
export const root = fileURLToPath(new URL('../', import.meta.url));
export async function readSources() {
  return Promise.all(['paper','publication'].map(name=>readFile(resolve(root,`manuscript/${name}.json`),'utf8').then(JSON.parse)));
}
export async function build(check = false) {
  const [paper, pub] = await readSources(); validate(paper,pub);
  const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
  if(!/^\d+\.\d+\.\d+$/.test(pkg.version) || pkg.version.split('.').slice(0,2).join('.')!==paper.version) throw Error('Package and paper versions differ');
  const artifacts = {
    'paper.md': markdown(paper,pub).trimEnd() + '\n',
    'manuscript/proof-of-cipher.tex': latex(paper,pub),
    'LICENSE': `${pub.license}\n\n${pub.licenseParagraphs.join('\n\n')}\n\nLimited contribution permission\n\n${pub.contributionPermission}\n\n${pub.copyright}\n`,
    'DISCLAIMER.md': `# Legal disclaimer\n\n${pub.disclaimerParagraphs.join('\n\n')}\n\n${pub.copyright}\n`,
  };
  for (const [name,content] of Object.entries(artifacts)) {
    if (check) { if (await readFile(resolve(root,name),'utf8') !== content) throw Error(`${name} is stale. Run npm run build.`); }
    else await writeFile(resolve(root,name),content);
  }
  await mkdir(resolve(root,'dist/assets'),{recursive:true});
  await writeFile(resolve(root,'dist/index.html'),html(paper,pub));
  await cp(resolve(root,'reader.css'),resolve(root,'dist/reader.css'));
  await cp(resolve(root,'node_modules/katex/dist/katex.min.css'),resolve(root,'dist/assets/katex.min.css'));
  await cp(resolve(root,'node_modules/katex/dist/fonts'),resolve(root,'dist/assets/fonts'),{recursive:true});
  console.log(`${check ? 'Verified' : 'Built'} ${paper.sections.length} manuscript sections, Markdown, LaTeX and local reader.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build(process.argv.includes('--check'));

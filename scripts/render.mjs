import katex from 'katex';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const texEscape = value => String(value).replace(/[\\{}$&#%_^~]/g, c => ({'\\':'\\textbackslash{}','{':'\\{','}':'\\}','$':'\\$','&':'\\&','#':'\\#','%':'\\%','_':'\\_','^':'\\textasciicircum{}','~':'\\textasciitilde{}'}[c])).replaceAll('©','\\copyright{}').replaceAll('’',"'").replaceAll('“','``').replaceAll('”',"''");
const mdEscape = value => String(value).replace(/[\\`*_\[\]<>|]/g, c => c === '|' ? '&#124;' : `\\${c}`);
export function safeLink(value) {
  if (!/^(https:\/\/|mailto:)/.test(value)) throw Error('Only HTTPS and mailto links are allowed');
  const url = new URL(value);
  if (url.username || url.password || /[\s<>"{}\\]/.test(value)) throw Error('Invalid publication link');
  return value;
}
export function inline(parts, format = 'html') {
  return parts.map(p => {
    if (p.kind === 'math') {
      // Rendering every expression strictly catches broken manuscript mathematics.
      const html = katex.renderToString(p.value, { throwOnError: true, strict: 'ignore', trust: false });
      return format === 'html' ? `<span class="inline-math">${html}</span>` : format === 'tex' ? `\\(${p.value}\\)` : `$${p.value.replaceAll('|', '\\vert ')}$`;
    }
    const value = format === 'html' ? escapeHtml(p.value) : format === 'tex' ? texEscape(p.value) : mdEscape(p.value);
    if (p.kind === 'link') {
      const url = safeLink(p.href);
      return format === 'html' ? `<a href="${escapeHtml(url)}">${value}</a>` : format === 'tex' ? `\\href{${texEscape(url)}}{${value}}` : `[${value}](${url})`;
    }
    if (p.kind === 'strong') return format === 'html' ? `<strong>${value}</strong>` : format === 'tex' ? `\\textbf{${value}}` : `**${value}**`;
    if (p.kind === 'code') return format === 'html' ? `<code>${value}</code>` : format === 'tex' ? `\\texttt{${value}}` : '`' + p.value.replaceAll('`','\\`') + '`';
    if (p.kind !== 'text') throw Error(`Unknown inline kind: ${p.kind}`);
    return value;
  }).join('');
}
export function blocks(items, format = 'html') {
  return items.map(b => {
    if (b.kind === 'paragraph') {
      const value = inline(b.content, format);
      return format === 'html' ? `<p>${value}</p>` : value + '\n';
    }
    if (b.kind === 'equation') {
      const math = katex.renderToString(b.latex, {displayMode: true, throwOnError: true, strict: 'ignore', trust: false});
      if (format === 'html') return `<figure class="equation"><figcaption>${escapeHtml(b.label)}</figcaption><div class="math">${math}</div><p>${escapeHtml(b.explanation)}</p></figure>`;
      if (format === 'tex') return `\\paragraph{${texEscape(b.label)}}\n\\[${b.latex}\\]\n${texEscape(b.explanation)}\n`;
      return `**${mdEscape(b.label)}**\n\n$$\n${b.latex}\n$$\n\n${mdEscape(b.explanation)}\n`;
    }
    if (b.kind === 'table') {
      if (b.rows.some(row => row.length !== b.headers.length)) throw Error(`Table column mismatch: ${b.caption}`);
      if (format === 'html') return `<div class="table-scroll"><table><caption>${escapeHtml(b.caption)}</caption><thead><tr>${b.headers.map(h=>`<th scope="col">${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(row=>`<tr>${row.map(cell=>`<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      if (format === 'tex') return `\\begin{longtable}{${b.headers.map(()=>`p{${(0.88/b.headers.length).toFixed(3)}\\textwidth}`).join('')}}\n\\caption{${texEscape(b.caption)}}\\\\\n\\toprule\n${b.headers.map(texEscape).join(' & ')}\\\\\n\\midrule\n\\endhead\n${b.rows.map(row=>row.map(c=>inline(c,'tex')).join(' & ')+'\\\\').join('\n')}\n\\bottomrule\n\\end{longtable}\n`;
      return `**${mdEscape(b.caption)}**\n\n| ${b.headers.map(mdEscape).join(' | ')} |\n| ${b.headers.map(()=> '---').join(' | ')} |\n${b.rows.map(row=>`| ${row.map(c=>inline(c,'md')).join(' | ')} |`).join('\n')}\n`;
    }
    if (b.kind === 'definitions') {
      if (format === 'html') return `<dl>${b.items.map(i=>`<dt>${escapeHtml(i.term)}</dt><dd>${inline(i.description)}</dd>`).join('')}</dl>`;
      if (format === 'tex') return `\\begin{description}\n${b.items.map(i=>`\\item[${texEscape(i.term)}] ${inline(i.description,'tex')}`).join('\n')}\n\\end{description}`;
      return b.items.map(i=>`- **${mdEscape(i.term)}** - ${inline(i.description,'md')}`).join('\n')+'\n';
    }
    if (b.kind === 'references') {
      if (format === 'html') return `<ol>${b.items.map(i=>`<li>${inline(i)}</li>`).join('')}</ol>`;
      if (format === 'tex') return `\\begin{enumerate}\n${b.items.map(i=>`\\item ${inline(i,'tex')}`).join('\n')}\n\\end{enumerate}`;
      return b.items.map((i,n)=>`${n+1}. ${inline(i,'md')}`).join('\n')+'\n';
    }
    if (b.kind === 'subsection') return (format === 'html' ? `<h3>${escapeHtml(b.title)}</h3>` : format === 'tex' ? `\\subsection*{${texEscape(b.title)}}\n` : `### ${mdEscape(b.title)}\n\n`)+blocks(b.blocks,format);
    throw Error(`Unknown block kind: ${b.kind}`);
  }).join('\n\n');
}
export function validate(paper, publication) {
  if (!paper.title || !paper.version || !paper.sections.length) throw Error('Missing manuscript metadata');
  if (new Set(paper.sections.map(s=>s.id)).size !== paper.sections.length) throw Error('Duplicate section IDs');
  for (const s of paper.sections) if (!/^[a-z0-9-]+$/.test(s.id) || !s.title || !s.blocks.length) throw Error('Invalid manuscript section');
  for (const id of ['license','legal-disclaimer','publication-details','contributions']) if (!paper.sections.some(s=>s.id===id)) throw Error(`Missing ${id}`);
  safeLink(publication.website); safeLink(publication.repository);
  blocks(paper.sections.flatMap(s=>s.blocks));
}
export function markdown(p, pub) {
  return `# ${p.title}: ${p.subtitle}\n\nVersion ${p.version} - ${p.date}\n\n${pub.publisher}\n\n[Read on the website](${pub.website}) - [Source and contributions](${pub.repository})\n\n${p.description}\n\n` + p.sections.map(s=>`## ${s.title}\n\n${blocks(s.blocks,'md')}`).join('\n\n') + '\n';
}
export function latex(p, pub) {
  return `% Generated from manuscript/paper.json. Run npm run build after editing that file.\n\\documentclass[10pt,a4paper]{article}\n\\usepackage[T1]{fontenc}\n\\usepackage[utf8]{inputenc}\n\\usepackage[a4paper,margin=23mm]{geometry}\n\\usepackage{lmodern,amsmath,amssymb,mathtools,longtable,booktabs,array,hyperref}\n\\hypersetup{hidelinks,pdftitle={${texEscape(p.title)}},pdfauthor={${texEscape(pub.publisher)}}}\n\\setlength{\\parindent}{0pt}\n\\setlength{\\parskip}{6pt}\n\\begin{document}\n\\title{${texEscape(p.title)}\\\\${texEscape(p.subtitle)}}\n\\author{${texEscape(pub.publisher)}}\n\\date{Version ${texEscape(p.version)} - ${texEscape(p.date)}}\n\\maketitle\n${texEscape(p.description)}\n\n\\href{${pub.website}}{Read on the website} - \\href{${pub.repository}}{Source and contributions}\n\\tableofcontents\n\n` + p.sections.map(s=>`\\section*{${texEscape(s.title)}}\n\\addcontentsline{toc}{section}{${texEscape(s.title)}}\n${blocks(s.blocks,'tex')}`).join('\n\n') + '\n\\end{document}\n';
}
export function html(p, pub) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeHtml(p.description)}"><title>${escapeHtml(p.title)} - ${escapeHtml(pub.publisher)}</title><link rel="stylesheet" href="/assets/katex.min.css"><link rel="stylesheet" href="/reader.css"></head><body><a class="skip" href="#paper">Skip to paper</a><header class="topbar"><a href="https://www.proximus.sh">PROXIMUS</a><nav aria-label="Publication links"><a href="${pub.website}">Website</a><a href="${pub.repository}">GitHub</a><a href="#license">License</a></nav></header><main id="paper"><header class="title"><p>${escapeHtml(pub.publisher)}</p><h1>${escapeHtml(p.title)}</h1><p class="subtitle">${escapeHtml(p.subtitle)}</p><p>${escapeHtml(p.description)}</p><p class="meta">Version ${escapeHtml(p.version)} - ${escapeHtml(p.date)}</p></header><details class="contents"><summary>Contents</summary><ol>${p.sections.map(s=>`<li><a href="#${s.id}">${escapeHtml(s.title)}</a></li>`).join('')}</ol></details>${p.sections.map(s=>`<section id="${s.id}"><h2>${escapeHtml(s.title)}</h2>${blocks(s.blocks)}</section>`).join('')}</main><footer>${escapeHtml(pub.copyright)}</footer></body></html>\n`;
}

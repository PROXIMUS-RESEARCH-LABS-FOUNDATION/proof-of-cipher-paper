import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
export function createPreviewServer() {
 return createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'self' 'unsafe-inline'; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  res.setHeader('Cache-Control','no-store');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  const path=req.url?.split('?')[0] || '/';
  const allowed=path==='/'||path==='/index.html'||path==='/reader.css'||path==='/assets/katex.min.css'||/^\/assets\/fonts\/[A-Za-z0-9_-]+\.(woff2?|ttf)$/.test(path);
  if(!allowed){res.writeHead(404);res.end('Not found');return;}
  try { const file=path==='/'?'/index.html':path,body=await readFile(resolve(root,'.'+file));res.writeHead(200,{'Content-Type':types[extname(file)]});res.end(req.method==='HEAD'?undefined:body); }
  catch{res.writeHead(404);res.end('Build the reader with npm run build.');}
 });
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||3000);
 if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT must be between 1 and 65535');
 createPreviewServer().listen(port,'127.0.0.1',()=>console.log(`Paper preview: http://127.0.0.1:${port}`));
}

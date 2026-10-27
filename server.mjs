import http from 'node:http';
import {readFile,writeFile,mkdir,rename,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const DATA=path.join(ROOT,'data');
const PORT=Number(process.env.COMPUTERWORLD_PORT||5173);
const BUILT=process.argv.includes('--built');
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf','.json':'application/json; charset=utf-8'};
const LOCAL_HOSTS=new Set(['127.0.0.1','localhost','[::1]']);
export function validCatalog(data){
 if(!data||!Array.isArray(data.products)||data.products.length>500)return false;
 if(typeof data.whatsapp!=='string'||!/^\d{0,20}$/.test(data.whatsapp)||typeof data.address!=='string'||data.address.length>500||typeof data.demo!=='boolean')return false;
 const ids=new Set();
 for(const p of data.products){
  if(!p||typeof p.id!=='string'||!p.id||p.id.length>100||ids.has(p.id))return false;ids.add(p.id);
  if(typeof p.title!=='string'||!p.title.trim()||p.title.length>150||typeof p.description!=='string'||p.description.length>5000||typeof p.category!=='string'||p.category.length>100)return false;
  if(typeof p.image!=='string'||p.image.length>2000||!(/^(https:\/\/|\/api\/images\/|\/assets\/)/.test(p.image)))return false;
  if(typeof p.price!=='string'||(p.price!==''&&(!Number.isFinite(Number(p.price))||Number(p.price)<0)))return false;
  if(typeof p.visible!=='boolean'||typeof p.featured!=='boolean')return false;
 }
 return true;
}
async function body(req,limit){const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>limit){const e=new Error('Archivo demasiado grande');e.status=413;throw e;}chunks.push(chunk)}return Buffer.concat(chunks)}
function send(res,status,data,type='application/json; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type.startsWith('application/json')?JSON.stringify(data):data)}
async function serveFile(res,file){try{if(!(await stat(file)).isFile())return false;const bytes=await readFile(file);send(res,200,bytes,TYPES[path.extname(file)]||'application/octet-stream');return true}catch(e){if(e.code==='ENOENT')return false;throw e}}
export async function startServer(port=PORT,options={}){
 const dataRoot=options.dataDirectory||DATA;
 const FILE=path.join(dataRoot,'catalog.json');
 const UPLOADS=path.join(dataRoot,'uploads');
 const built=options.built??BUILT;
 await mkdir(UPLOADS,{recursive:true});
 const server=http.createServer();
 const vite=built?null:await (await import('vite')).createServer({root:ROOT,configFile:path.join(ROOT,'vite.config.mjs'),server:{middlewareMode:true,hmr:{server}},appType:'custom'});
 let writes=Promise.resolve();
 server.on('request',async(req,res)=>{
  try{
   const url=new URL(req.url||'/',`http://${req.headers.host}`);
   if(!LOCAL_HOSTS.has(url.hostname)){send(res,403,{error:'Esta copia solo permite acceso local.'});return}
   if(['POST','PUT','DELETE','PATCH'].includes(req.method)&&req.headers.origin!==url.origin){send(res,403,{error:'Origen no permitido.'});return}
   if(url.pathname==='/api/catalog'){
    if(req.method==='GET'){try{send(res,200,JSON.parse(await readFile(FILE,'utf8')))}catch(e){if(e.code==='ENOENT')send(res,200,null);else throw e}return}
    if(req.method==='PUT'){
     let data;try{data=JSON.parse((await body(req,2*1024*1024)).toString())}catch(e){send(res,e.status||400,{error:'Datos inválidos o demasiado grandes.'});return}
     if(!validCatalog(data)){send(res,400,{error:'Revisá los datos del catálogo.'});return}
     const task=writes.catch(()=>{}).then(async()=>{const tmp=path.join(dataRoot,`catalog-${randomUUID()}.tmp`);await writeFile(tmp,JSON.stringify(data,null,2),'utf8');await rename(tmp,FILE)});
     writes=task;await task;send(res,200,{ok:true});return;
    }
    send(res,405,{error:'Método no permitido'});return;
   }
   if(url.pathname==='/api/upload'){
    if(req.method!=='POST'){send(res,405,{error:'Método no permitido'});return}
    const bytes=await body(req,6*1024*1024);
    const request=new Request(url,{method:'POST',headers:{'Content-Type':req.headers['content-type']||''},body:bytes});
    const form=await request.formData();const file=form.get('file');
    if(!(file instanceof File)||file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type)){send(res,400,{error:'Usá JPG, PNG o WebP de hasta 5 MB.'});return}
    const content=Buffer.from(await file.arrayBuffer());
    const valid=file.type==='image/jpeg'?content[0]===255&&content[1]===216&&content[2]===255:file.type==='image/png'?content.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):content.toString('ascii',0,4)==='RIFF'&&content.toString('ascii',8,12)==='WEBP';
    if(!valid){send(res,400,{error:'El archivo no es una imagen válida.'});return}
    const ext={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}[file.type];
    const id=randomUUID()+ext;await writeFile(path.join(UPLOADS,id),content);send(res,200,{url:'/api/images/'+id});return;
   }
   if(url.pathname.startsWith('/api/images/')){
    const id=url.pathname.slice('/api/images/'.length);
    if(!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(id)||!await serveFile(res,path.join(UPLOADS,id)))send(res,404,{error:'Foto no encontrada'});return;
   }
   if(url.pathname.startsWith('/api/')){send(res,404,{error:'Ruta no encontrada'});return}
   if(req.method!=='GET'&&req.method!=='HEAD'){send(res,405,{error:'Método no permitido'});return}
   if(vite){
    if(url.pathname==='/'||url.pathname==='/admin'||url.pathname==='/admin/'){
     const html=await vite.transformIndexHtml(url.pathname,await readFile(path.join(ROOT,'index.html'),'utf8'));
     send(res,200,html,'text/html; charset=utf-8');return;
    }
    vite.middlewares(req,res,()=>send(res,404,'No encontrado','text/plain; charset=utf-8'));return;
   }
   const target=path.resolve(ROOT,'dist','.'+decodeURIComponent(url.pathname));
   const dist=path.resolve(ROOT,'dist');
   if(!target.startsWith(dist+path.sep)&&target!==dist){send(res,403,{error:'Ruta no permitida'});return}
   if(url.pathname==='/'||url.pathname==='/admin'||url.pathname==='/admin/')await serveFile(res,path.join(dist,'index.html'));
   else if(!await serveFile(res,target))send(res,404,'No encontrado','text/plain; charset=utf-8');
  }catch(e){console.error(e.message);if(!res.headersSent)send(res,e.status||500,{error:e.status===413?'Archivo demasiado grande.':'No se pudo completar la operación.'});else res.end()}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve)});
 const origin=`http://127.0.0.1:${server.address().port}`;
 console.log(`\nComputerworld local\nPágina: ${origin}\nAdministración: ${origin}/admin\nPara detener: Ctrl+C\n`);
 return {server,vite,origin,close:async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));await vite?.close()}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 startServer().catch(e=>{console.error(e.code==='EADDRINUSE'?'El puerto 5173 está ocupado. Cerrá la otra ventana de Computerworld e intentá de nuevo.':e.message);process.exitCode=1});
}

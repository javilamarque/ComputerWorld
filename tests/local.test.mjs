import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {startServer,validCatalog} from '../server.mjs';

test('guarda catálogo y foto, rechaza otro origen y recupera cambios al reiniciar',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'computerworld-test-'));
 let app;
 const product={id:'local-test',title:'Gabinete RGB',category:'Gabinetes gamer',description:'Producto de prueba',image:'/assets/gabinete.webp',price:'120000',visible:true,featured:true};
 const catalog={products:[product],whatsapp:'5491154068752',address:'Achupallas 6506, Villa Dorrego',demo:true};
 try{
  app=await startServer(0,{dataDirectory:dir,built:true});
  let r=await fetch(app.origin+'/api/catalog');assert.equal(r.status,200);assert.equal(await r.json(),null);
  r=await fetch(app.origin+'/api/catalog',{method:'PUT',headers:{Origin:'https://otro-sitio.example','Content-Type':'application/json'},body:JSON.stringify(catalog)});assert.equal(r.status,403);
  r=await fetch(app.origin+'/api/catalog',{method:'PUT',headers:{Origin:app.origin,'Content-Type':'application/json'},body:JSON.stringify({...catalog,products:[{...product,price:'-1'}]})});assert.equal(r.status,400);
  r=await fetch(app.origin+'/api/catalog',{method:'PUT',headers:{Origin:app.origin,'Content-Type':'application/json'},body:JSON.stringify(catalog)});assert.equal(r.status,200);
  assert.deepEqual(JSON.parse(await readFile(path.join(dir,'catalog.json'),'utf8')),catalog);
  const bytes=await readFile(new URL('../public/assets/mouse.webp',import.meta.url));
  const form=new FormData();form.set('file',new File([bytes],'mouse.webp',{type:'image/webp'}));
  r=await fetch(app.origin+'/api/upload',{method:'POST',headers:{Origin:app.origin},body:form});assert.equal(r.status,200);const {url}=await r.json();
  r=await fetch(app.origin+url);assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),bytes);
  const bad=new FormData();bad.set('file',new File(['not-an-image'],'foto.png',{type:'image/png'}));
  r=await fetch(app.origin+'/api/upload',{method:'POST',headers:{Origin:app.origin},body:bad});assert.equal(r.status,400);
  r=await fetch(app.origin+'/admin');assert.equal(r.status,200);assert.match(await r.text(),/Computerworld/);
  await app.close();app=null;
  app=await startServer(0,{dataDirectory:dir,built:true});
  assert.deepEqual(await (await fetch(app.origin+'/api/catalog')).json(),catalog);
  assert.equal((await fetch(app.origin+url)).status,200);
 }finally{await app?.close();await rm(dir,{recursive:true,force:true})}
});

test('rechaza imágenes ejecutables y productos duplicados',()=>{
 const p={id:'1',title:'Mouse',category:'Mouse gamer',description:'',image:'javascript:alert(1)',price:'',visible:true,featured:false};
 const c={products:[p],whatsapp:'',address:'',demo:true};assert.equal(validCatalog(c),false);
 p.image='/assets/mouse.webp';c.products.push(p);assert.equal(validCatalog(c),false);
});

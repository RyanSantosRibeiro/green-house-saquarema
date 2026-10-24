import fs from 'node:fs/promises';
import sharp from 'sharp';
const base = 'https://greenhousesaqua.com.br/wp-content/uploads/';
const assets = {
  logo:'2024/01/vdfv.png',
  symbol:'2024/01/cropped-Green-housefrfgre-270x270.png',
  saquarema:'2024/10/saquarema-2019-768x512_upscayl_3x_realesrgan-x4plus.webp',
  surf:'2024/09/WhatsApp-Image-2024-09-05-at-17.38.41.jpeg',
  surf2:'2024/09/WhatsApp-Image-2024-09-05-at-17.38.42.webp',
  surf3:'2024/09/WhatsApp-Image-2024-09-05-at-17.38.40.webp',
  quarto:'2024/08/552d1893-4812-4d1c-a252-ba9fba351450.webp',
  coletivo:'2024/08/WhatsApp-Image-2024-08-15-at-15.34.40-1-1080x1440.webp',
  camping:'2024/08/WhatsApp-Image-2024-08-15-at-15.34.40-e1725033466610-768x1364.png',
  chale:'2024/09/8645ba38-c3f1-4950-8158-443af00cd723.webp',
  casa:'2024/09/IMG_5172-_1_-1024x768.webp',
  convivio:'2024/09/IMG_0613-1-768x1024.webp',
  verde:'2024/09/IMG_5179-1024x1024.webp',
  jardim:'2024/09/IMG_2665-768x1024.webp',
  varanda:'2024/09/IMG_0610-_1_-768x1024.webp',
  cozinha:'2024/09/IMG_3031-_1_-768x1024.webp',
  coworking:'2024/09/IMG_4945-768x1024.webp',
  escritorio:'2024/09/IMG_4947-768x1024.webp',
  comunidade:'2024/09/IMG_1599-768x1024.webp',
  mesa:'2024/09/IMG_6346-768x1024.webp'
};
const manifest=[];
await fs.mkdir('.cache/originals',{recursive:true});
await Promise.all(Object.entries(assets).map(async([name,path])=>{
  const url=base+path;
  const response=await fetch(url); if(!response.ok) throw new Error(`${name}: ${response.status}`);
  const input=Buffer.from(await response.arrayBuffer());
  await fs.writeFile(`.cache/originals/${name}.${path.split('.').at(-1)}`,input);
  const meta=await sharp(input).metadata();
  const sizes=name==='logo'||name==='symbol'?[Math.min(500,meta.width)]:[640,1000,1600].filter((w,i,a)=>w<=meta.width||(i===0));
  for(const width of sizes) await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality:84}).toFile(`public/images/${name}-${width}.webp`);
  manifest.push({name,url,width:meta.width,height:meta.height,variants:sizes});
}));
await fs.writeFile('docs/assets.json',JSON.stringify(manifest,null,2));
const tiles=await Promise.all(manifest.map(async(a,i)=>{
 const src=`public/images/${a.name}-${a.variants[0]}.webp`;
 const photo=await sharp(src).resize(250,170,{fit:'inside',background:'#ddd'}).extend({top:0,bottom:26,left:0,right:0,background:'#fff'}).png().toBuffer();
 const caption=Buffer.from(`<svg width="250" height="196"><text x="8" y="190" font-size="15" font-family="sans-serif">${a.name} (${a.width}x${a.height})</text></svg>`);
 const combined=await sharp({create:{width:250,height:196,channels:3,background:'#eee'}}).composite([{input:photo,top:0,left:0},{input:caption}]).png().toBuffer();
 return {input:combined,left:(i%4)*250,top:Math.floor(i/4)*196};
}));
await sharp({create:{width:1000,height:Math.ceil(tiles.length/4)*196,channels:3,background:'#eee'}}).composite(tiles).png().toFile('.cache/contact-sheet.png');
console.log(manifest.map(x=>`${x.name}: ${x.width}x${x.height} [${x.variants}]`).join('\n'));

import fs from 'node:fs/promises';
import sharp from 'sharp';
const {items,assets}=JSON.parse(await fs.readFile('.cache/instagram.json','utf8'));
const manifest=[];
for(const [i,item] of items.entries()) {
 const asset=assets.find(a=>a.url===item.src);
 await sharp(asset.path).rotate().resize({width:640,withoutEnlargement:true}).webp({quality:85}).toFile(`public/images/reel-${i+1}.webp`);
 manifest.push({image:`reel-${i+1}.webp`,post:item.href.split('?')[0]});
}
await fs.writeFile('docs/instagram-sources.json',JSON.stringify(manifest,null,2));
console.log('4 capas convertidas para WebP.');

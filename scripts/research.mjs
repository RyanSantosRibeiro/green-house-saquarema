import fs from 'node:fs/promises';
await fs.mkdir('.cache', { recursive: true });
const pages = ['','acomodacoes-hospedagem-saquarema/','coliving/','curso-de-surf/','contato/'];
await Promise.all(pages.map(async (page) => {
  const html = await (await fetch(`https://greenhousesaqua.com.br/${page}`)).text();
  const name = page.replaceAll('/', '') || 'home';
  await fs.writeFile(`.cache/${name}.html`, html);
  const urls = [...new Set([...html.matchAll(/https?:[^\s"'<>\\)]+\.(?:jpg|jpeg|png|webp|svg)(?:\?[^\s"'<>]*)?/gi)].map(x => x[0]))];
  console.log(JSON.stringify({page, images:urls}));
}));

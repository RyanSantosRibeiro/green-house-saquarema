# Green House Saqua

Site institucional frontend para hospedagem, coliving e surf em Saquarema. Inspirado no ritmo visual do Uaradei, com identidade própria em verde, branco e amarelo e fotos reais da Green House.

## Executar

Node.js 22.12+ ou 24 LTS.

```powershell
npm.cmd install
npm.cmd run dev
```

Prévia local: **http://127.0.0.1:4189/**. A porta 3000 dos projetos VTEX fica preservada.

```powershell
npm.cmd run check
npm.cmd run build
```

Build estático em `dist/`. Para Vercel/Netlify: `npm run build`, saída `dist`. Não requer banco de dados, login, API ou chave privada.

## Funcionalidades
- Hero com três fotos, rotação de 8 segundos, setas, indicadores, pausa e gesto lateral no celular.
- Detalhes de quartos privativos, coletivos, chalé e camping em modal acessível.
- Coliving, coworking, curso de surf e consulta de outras experiências.
- Galeria com ampliação e navegação por teclado; aba com quatro reels reais.
- Consulta com interesse, datas opcionais e quantidade de pessoas; monta um rascunho no WhatsApp. O visitante precisa enviar a mensagem, e a equipe confirma a reserva.
- FAQ, endereço, mapa externo, telefone, e-mail, Instagram, Booking e Airbnb.
- Layout responsivo, foco visível, menu mobile e preferência de movimento reduzido.

## Estrutura e edição
- `index.html`: conteúdo institucional, SEO, formulário e estrutura dos modais.
- `src/data.js`: acomodações, fotos, reels e contatos.
- `src/main.js`: navegação, galeria, consulta e animações GSAP.
- `src/style.css`: estilos e adaptação a diferentes telas.
- `public/images/`: imagens locais em WebP.
- `public/fonts/`: fontes locais e licenças.
- `docs/CONTENT-SOURCES.md`: fontes verificadas e informações divergentes.
- `docs/VALIDATION.md`: resultados dos testes realizados.
- `DESIGN.md`: direção visual e decisões de composição.

Para atualizar informações, edite HTML/dados e execute check/build. As imagens já estão prontas no projeto. `scripts/assets.mjs` pode refazer o download e a otimização das imagens do site oficial; grava os originais em `.cache/`, que não é versionada. `scripts/research.mjs` auxilia uma nova conferência. A importação inicial das capas do Instagram depende da coleta no navegador e de seu manifesto temporário; os links permanentes estão documentados.

## Desempenho e comportamento
Vite + JavaScript nativo + GSAP/ScrollTrigger. Sem biblioteca de UI ou player pesado. Fontes locais, WebP, prioridade para a primeira foto e lazy loading nas fotos inferiores. Scroll nativo, animações com transform/opacity e parallax apenas no desktop. Carrossel suspenso fora da tela, em aba oculta, com foco nos controles ou modal aberto. Seleção manual pausa a rotação.

Valores ficam sob consulta porque as páginas atuais têm mensalidades divergentes. O endereço segue a página ligada pelo menu atual e também precisa de confirmação com a empresa. Ver `docs/CONTENT-SOURCES.md`.

## Antes da publicação definitiva
Confirmar informações e direitos das imagens com a empresa, especialmente endereço, tarifas e serviços incluídos. Definir o domínio do novo site, adicionar canonical e converter `og:image` em URL absoluta. Esta entrega é local; não substitui o site atual e não tem deploy nem repositório remoto configurado.
# green-house-saquarema

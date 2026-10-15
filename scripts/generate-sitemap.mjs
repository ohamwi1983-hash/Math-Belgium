// Génère dist/sitemap.xml après le build, à partir de la liste réelle des chapitres
// (src/content/chaptersIndex.ts) — jamais une liste dupliquée à la main, qui se périmerait dès
// qu'un chapitre est ajouté (voir CLAUDE.md : "ajouter un chapitre = ajouter un fichier de
// données + une entrée dans chaptersIndex.ts", rien d'autre à tenir à jour). Chargé via
// `vite.ssrLoadModule` (API officielle de Vite pour exécuter du code source TS/ESM hors
// navigateur, ex. scripts de prerendering) plutôt qu'un import Node direct, impossible sans
// transpileur sur un fichier .ts.
import { createServer } from 'vite'
import { writeFileSync } from 'node:fs'

const BASE_URL = 'https://math-belgium.vercel.app'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const { LEVELS } = await vite.ssrLoadModule('/src/content/chaptersIndex.ts')
await vite.close()

const urls = ['/']
for (const level of LEVELS) {
  for (const chapter of level.chapters) {
    urls.push(`/${level.slug}/${chapter.slug}`)
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${BASE_URL}${u}</loc></url>`).join('\n')}
</urlset>
`

writeFileSync('dist/sitemap.xml', xml)
console.log(`sitemap.xml généré (${urls.length} URLs)`)

// Génère dist/sitemap.xml après le build, à partir de la liste réelle des routes
// (voir scripts/routes.mjs — jamais une liste dupliquée à la main).
import { writeFileSync } from 'node:fs'
import { getRoutes } from './routes.mjs'

const BASE_URL = 'https://math-belgium.vercel.app'

const urls = await getRoutes()

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${BASE_URL}${u}</loc></url>`).join('\n')}
</urlset>
`

writeFileSync('dist/sitemap.xml', xml)
console.log(`sitemap.xml généré (${urls.length} URLs)`)

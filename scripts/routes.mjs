// Source commune de la liste des routes réelles du site, à partir de
// src/content/chaptersIndex.ts (jamais une liste dupliquée à la main — voir CLAUDE.md : ajouter
// un chapitre = ajouter un fichier de données + une entrée dans chaptersIndex.ts, rien d'autre).
// Utilisée par le sitemap ET le pré-rendu statique, pour qu'ils ne puissent jamais diverger.
// `vite.ssrLoadModule` : API officielle de Vite pour exécuter du code source TS/ESM hors
// navigateur (ex. scripts de build), impossible sans transpileur sur un fichier .ts autrement.
import { createServer } from 'vite'

export async function getRoutes() {
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  const { LEVELS } = await vite.ssrLoadModule('/src/content/chaptersIndex.ts')
  await vite.close()

  const routes = ['/']
  for (const level of LEVELS) {
    for (const chapter of level.chapters) {
      routes.push(`/${level.slug}/${chapter.slug}`)
    }
  }
  return routes
}

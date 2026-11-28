/*
 * Petit serveur statique avec repli SPA (toute adresse inconnue → index.html), pour servir le build de test.
 * Usage : node scripts/verif-espace/serveur.mjs <dossier du build> [port]   (NON importé par l'application)
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

export function demarrerServeur(racine, port = 5420) {
  const serveur = createServer(async (req, res) => {
    const chemin = decodeURIComponent((req.url || '/').split('?')[0])
    let fichier = normalize(join(racine, chemin))
    if (!fichier.startsWith(normalize(racine))) {
      res.writeHead(403).end()
      return
    }
    try {
      const s = await stat(fichier)
      if (s.isDirectory()) fichier = join(fichier, 'index.html')
      await stat(fichier)
    } catch {
      fichier = join(racine, 'index.html')
    }
    try {
      const contenu = await readFile(fichier)
      res.writeHead(200, { 'Content-Type': TYPES[extname(fichier)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
      res.end(contenu)
    } catch {
      res.writeHead(404).end()
    }
  })
  return new Promise((ok) => serveur.listen(port, () => ok(serveur)))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , racine, port] = process.argv
  if (!racine) {
    console.error('Usage : node scripts/verif-espace/serveur.mjs <dossier du build> [port]')
    process.exit(1)
  }
  await demarrerServeur(racine, Number(port) || 5420)
  console.log(`Build servi sur http://localhost:${Number(port) || 5420}/`)
}

// Tests unitaires du lecteur de formules (`src/lib/lectureFormules.ts`) : chaque cas de
// `scripts/lecture-formules-cas.json` est une paire [LaTeX, lecture attendue]. Lancement :
//   npm run test:lecture
// `--ecrire` réécrit les lectures attendues avec la sortie actuelle (à RELIRE avant de commiter :
// une lecture doit se comprendre à l'oreille sans voir la formule).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const fichierCas = fileURLToPath(new URL('./lecture-formules-cas.json', import.meta.url))
const vite = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, entries: [] },
})
const { analyserLecture } = await vite.ssrLoadModule('/src/lib/lectureFormules.ts')
await vite.close()

const cas = JSON.parse(readFileSync(fichierCas, 'utf8'))
if (process.argv.includes('--ecrire')) {
  const nouveaux = cas.map(([tex]) => [tex, analyserLecture(tex).lecture])
  writeFileSync(fichierCas, '[\n' + nouveaux.map((c) => '  ' + JSON.stringify(c)).join(',\n') + '\n]\n')
  console.log(`${nouveaux.length} lectures réécrites dans ${fichierCas}`)
  process.exit(0)
}
let echecs = 0
for (const [tex, attendu] of cas) {
  const { lecture, inconnues } = analyserLecture(tex)
  if (lecture !== attendu || inconnues.length) {
    echecs++
    console.log(`✗ ${tex}\n    attendu : ${attendu}\n    obtenu  : ${lecture}${inconnues.length ? `\n    inconnues : ${inconnues.join(', ')}` : ''}`)
  }
}
console.log(`${cas.length - echecs} / ${cas.length} cas conformes`)
process.exit(echecs ? 1 : 0)

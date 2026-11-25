// Contrôle de la lecture en mots de TOUTES les formules des chapitres et d'un échantillon des
// générateurs (`src/lib/lectureFormules.ts`) — à lancer après l'ajout d'une notation LaTeX nouvelle :
//   npm run controle:lecture            (chapitres + adaptateurs papier, 10 tirages par générateur)
//   npm run controle:lecture -- 60      (60 tirages)
// Échoue si une commande LaTeX est inconnue du lecteur, si une lecture est vide ou si elle contient
// encore « \ », « { », « _ », « ^ » ou un nom de commande. Les fichiers App*.tsx (aides d'écran) ne
// sont pas parcourus ici : voir `.claude/rules/content-authoring.md` (« Lecture en mots des formules »).
import { createServer } from 'vite'

const TIRAGES = Number(process.argv[2] || 10)
const vite = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, entries: [] },
})
const { analyserLecture } = await vite.ssrLoadModule('/src/lib/lectureFormules.ts')
const { LEVELS } = await vite.ssrLoadModule('/src/content/chaptersIndex.ts')
const { EVALUATION_ADAPTER_REGISTRY } = await vite.ssrLoadModule('/src/lib/evaluationAdapterRegistry.ts')
await vite.close()

const formules = new Map() // tex → source
const ajouter = (tex, source) => { if (typeof tex === 'string' && tex.trim() && !formules.has(tex)) formules.set(tex, source) }
function parcourir(v, source, vus = new Set()) {
  if (v == null) return
  if (typeof v === 'string') { for (const m of v.matchAll(/\$([^$]+)\$/g)) ajouter(m[1], source); return }
  if (typeof v !== 'object' || vus.has(v)) return
  vus.add(v)
  if (Array.isArray(v)) { for (const x of v) parcourir(x, source, vus); return }
  if ((v.type === 'latex' || v.type === 'katex') && typeof v.valeur === 'string') ajouter(v.valeur, source)
  for (const x of Object.values(v)) parcourir(x, source, vus)
}
for (const l of LEVELS) for (const c of l.chapters) parcourir(c, `${l.slug}/${c.slug}`)
const nChapitres = formules.size
for (const [id, ad] of Object.entries(EVALUATION_ADAPTER_REGISTRY)) {
  const variantes = (ad.catalogueVariantes || []).map((c) => c.id)
  for (let k = 0; k < TIRAGES; k++) {
    let inst
    try {
      inst = variantes.length && ad.genererInstanceAvecVariante && k % 2 === 0
        ? ad.genererInstanceAvecVariante(variantes[(k / 2) % variantes.length])
        : ad.genererInstance()
    } catch { continue }
    for (const m of ['construireEnonce', 'construireCorrection', 'correctionDetaillee', 'reponseBreve', 'enoncePapier', 'bareme']) {
      if (typeof ad[m] === 'function') { try { parcourir(ad[m](inst), id) } catch { /* adaptateur sans cette partie */ } }
    }
  }
}

const inconnues = new Map()
const fautives = []
for (const [tex, source] of formules) {
  const { lecture, inconnues: inc } = analyserLecture(tex)
  for (const c of inc) if (!inconnues.has(c)) inconnues.set(c, `${source} : ${tex}`)
  if (!lecture.trim() && !/^(\\[,;:! ]|\\quad|\\qquad|\s|~)*$/.test(tex)) fautives.push(`(vide) ${source} : ${tex}`)
  else if (/[\\{}_^$]/.test(lecture) || /\b(d?frac|sqrt|mathbb|mathrm|left|right|cdot|times|infty|begin|end|operatorname)\b/.test(lecture))
    fautives.push(`${source} : ${tex}\n      → ${lecture}`)
}
console.log(`${formules.size} formules distinctes (${nChapitres} des chapitres, ${formules.size - nChapitres} des générateurs, ${TIRAGES} tirages)`)
for (const [c, ex] of inconnues) console.log(`✗ commande inconnue \\${c} — ${ex.slice(0, 160)}`)
for (const f of fautives.slice(0, 40)) console.log(`✗ ${f}`)
if (inconnues.size || fautives.length) {
  console.log(`${inconnues.size} commande(s) inconnue(s), ${fautives.length} lecture(s) fautive(s)`)
  process.exit(1)
}
console.log('Toutes les formules ont une lecture en mots.')
process.exit(0)

// Vérification au build : chaque énoncé soigné des questions « démonstration » (ENONCES_DEMONSTRATION,
// src/lib/evaluationPayload.ts) doit retrouver SON bloc d'exemple dans le chapitre. Un énoncé apparié
// au mauvais exemple donne une question dont le corrigé ne correspond pas (dérive déjà rencontrée :
// ajout d'un exemple « dB » qui décalait tous les suivants). Échec du build pour les chapitres de
// CHAPITRES_ENONCES_VERIFIES ; simple avertissement pour les autres (appariement encore positionnel).
// Même mécanisme que scripts/routes.mjs : `vite.ssrLoadModule` exécute le TS source hors navigateur.
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let erreurs = 0
let avertissements = 0
try {
  const { LEVELS } = await vite.ssrLoadModule('/src/content/chaptersIndex.ts')
  const { apparierEnoncesDemonstration, CHAPITRES_ENONCES_VERIFIES } = await vite.ssrLoadModule('/src/lib/evaluationPayload.ts')
  for (const level of LEVELS) {
    for (const chapitre of level.chapters) {
      const strict = CHAPITRES_ENONCES_VERIFIES.includes(chapitre.slug)
      for (const section of chapitre.sections) {
        const { orphelins, enTrop, blocsSansEnonce } = apparierEnoncesDemonstration(chapitre.slug, section)
        const lieu = `${level.slug}/${chapitre.slug} § ${section.id}`
        const problemes = [
          ...orphelins.map((o) => `énoncé « ${o.cle} » : ${o.nombreBlocs === 0 ? 'aucun exemple correspondant' : `${o.nombreBlocs} exemples correspondants (clé ambiguë)`}`),
          ...(enTrop > 0 ? [`${enTrop} énoncé(s) positionnel(s) sans exemple`] : []),
          ...(strict ? blocsSansEnonce.map((i) => `exemple n° ${i + 1} sans énoncé soigné`) : []),
        ]
        for (const p of problemes) {
          if (strict) {
            erreurs++
            console.error(`✗ ${lieu} — ${p}`)
          } else {
            avertissements++
          }
        }
      }
    }
  }
} finally {
  await vite.close()
}
if (erreurs > 0) {
  console.error(`\nverifier-enonces-evaluation : ${erreurs} problème(s) d'appariement énoncé ↔ exemple.`)
  process.exit(1)
}
console.log(`verifier-enonces-evaluation : OK${avertissements > 0 ? ` (${avertissements} avertissement(s) sur des chapitres à appariement positionnel)` : ''}`)

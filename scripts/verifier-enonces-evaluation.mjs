// Vérification au build : chaque énoncé soigné des questions « démonstration » (ENONCES_DEMONSTRATION,
// src/lib/evaluationPayload.ts) doit retrouver SON bloc d'exemple dans le chapitre. Un énoncé apparié
// au mauvais exemple donne une question dont le corrigé ne correspond pas (dérive déjà rencontrée :
// ajout d'un exemple « dB » qui décalait tous les suivants). Échec du build pour les chapitres de
// CHAPITRES_ENONCES_VERIFIES ; simple avertissement pour les autres (appariement encore positionnel).
// Même mécanisme que scripts/routes.mjs : `vite.ssrLoadModule` exécute le TS source hors navigateur.
// Contrôle aussi la banque des questions « Formule » (src/lib/questionsFormules/) : chapitres, sections, ids, « $ ».
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

  // Banque des questions « Formule » (src/lib/questionsFormules/) : chaque chapitre et chaque section
  // existent, ids uniques dans leur chapitre, énoncé et corrigé non vides, aucun `$` orphelin ni `$$`.
  const { QUESTIONS_FORMULES } = await vite.ssrLoadModule('/src/lib/questionsFormules/index.ts')
  const chapitresParSlug = new Map(LEVELS.flatMap((l) => l.chapters.map((c) => [c.slug, c])))
  for (const [slug, sections] of Object.entries(QUESTIONS_FORMULES)) {
    const chapitre = chapitresParSlug.get(slug)
    if (!chapitre) {
      erreurs++
      console.error(`✗ questions « Formule » : chapitre inconnu « ${slug} »`)
      continue
    }
    const ids = new Set()
    for (const [sectionId, questions] of Object.entries(sections)) {
      const lieu = `questions « Formule » ${slug} § ${sectionId}`
      if (!chapitre.sections.some((s) => s.id === sectionId)) {
        erreurs++
        console.error(`✗ ${lieu} — section inconnue`)
      }
      for (const q of questions) {
        const id = q.id.replace(/\s+/g, ' ').trim()
        const textes = [q.enonce, ...(Array.isArray(q.corrige) ? q.corrige : [q.corrige])]
        const problemes = [
          ...(ids.has(id) ? [`id en double « ${id} »`] : []),
          ...(!q.enonce.trim() || textes.slice(1).every((t) => !t.trim()) ? ['énoncé ou corrigé vide'] : []),
          ...textes.filter((t) => t.includes('$$') || (t.match(/\$/g) ?? []).length % 2 === 1).map((t) => `« $ » orphelin ou « $$ » : ${t.slice(0, 60)}`),
        ]
        ids.add(id)
        for (const p of problemes) {
          erreurs++
          console.error(`✗ ${lieu} — ${p}`)
        }
      }
    }
  }
} finally {
  await vite.close()
}
if (erreurs > 0) {
  console.error(`\nverifier-enonces-evaluation : ${erreurs} problème(s) (appariement énoncé ↔ exemple, banque « Formule »).`)
  process.exit(1)
}
console.log(`verifier-enonces-evaluation : OK${avertissements > 0 ? ` (${avertissements} avertissement(s) sur des chapitres à appariement positionnel)` : ''}`)

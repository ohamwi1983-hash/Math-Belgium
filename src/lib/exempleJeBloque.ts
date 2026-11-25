import type { Block, ChapterContent, ChapterSection } from '../content/types'
import { prerequisJeBloque } from './prerequisChapitre'
import type { PrerequisResolu } from './prerequisChapitre'

/**
 * « Je bloque » (côté élève, planche 10, version simple PAR SECTION) : l'exemple résolu à montrer quand
 * l'élève rate deux essais sur un écran d'un générateur. PUR, sans DOM.
 *
 * Section = celle qui porte la carte « S'entraîner » (bloc `entrainement`) du générateur — la MÊME que
 * le lien de retour de la page du générateur (`trouverSectionGenerateur` : la première, si le générateur
 * est cité dans plusieurs sections). Exemple = un bloc `exemple` ou `exempleLibre` de cette section ; s'il
 * y en a plusieurs, le plus proche de la carte (à distance égale, celui d'avant : on l'a lu avant
 * d'arriver à la carte). Les démonstrations (`exempleLibre` dont le libellé commence par
 * « Démonstration ») ne sont pas des exemples d'exercice : jamais choisies. Un exemple « Pour aller plus
 * loin » (badge ou libellé) ne l'est que s'il n'y en a pas d'autre. Aucun exemple : `bloc` vaut `null` (le
 * panneau montre alors « L'essentiel » de l'étape et le lien vers l'étape).
 *
 * Chapitres autonomes (25/11/2026) : `prerequis` = étapes d'AUTRES chapitres dont l'étape a besoin
 * (champ `utilise` : les indispensables, plus les `utile` dont `jeBloque` cite ce générateur) — bloc
 * « Tu as besoin de… » sous l'exemple (rappel + « Revoir l'étape », nouvel onglet).
 */
export interface CibleJeBloque {
  section: ChapterSection
  /** Numéro de l'étape dans le parcours du chapitre (1 = première section). */
  numero: number
  bloc: Extract<Block, { kind: 'exemple' | 'exempleLibre' }> | null
  prerequis: PrerequisResolu[]
}

function estExempleDExercice(b: Block): b is Extract<Block, { kind: 'exemple' | 'exempleLibre' }> {
  if (b.kind === 'exemple') return true
  return b.kind === 'exempleLibre' && !/^\s*démonstration/i.test(b.label ?? '')
}

function pourAllerPlusLoin(b: Extract<Block, { kind: 'exemple' | 'exempleLibre' }>): boolean {
  return /pour aller plus loin/i.test(b.kind === 'exemple' ? (b.badge ?? '') : (b.label ?? ''))
}

export function cibleJeBloque(chapter: ChapterContent, generatorId: string): CibleJeBloque | null {
  const index = chapter.sections.findIndex((s) => s.blocks.some((b) => b.kind === 'entrainement' && b.generatorId === generatorId))
  if (index < 0) return null
  const section = chapter.sections[index]
  const carte = section.blocks.findIndex((b) => b.kind === 'entrainement' && b.generatorId === generatorId)
  let bloc: CibleJeBloque['bloc'] = null
  let distance = Infinity
  section.blocks.forEach((b, i) => {
    if (!estExempleDExercice(b)) return
    const d = Math.abs(i - carte) + (i > carte ? 0.5 : 0) + (pourAllerPlusLoin(b) ? 1000 : 0)
    if (d < distance) {
      distance = d
      bloc = b
    }
  })
  return { section, numero: index + 1, bloc, prerequis: prerequisJeBloque(section, generatorId) }
}

import type { ChapterSection, UtiliseEntree } from '../content/types'
import { resoudreReference } from './lienChapitre'
import type { CibleResolue } from './lienChapitre'

/**
 * Prérequis d'une étape (champ `utilise` des sections, chapitres autonomes) — PUR, sans DOM. Servent à
 * l'encadré « Ce chapitre utilise… » (carte), à « Cette étape utilise » (en tête d'étape) et au bloc
 * « Tu as besoin de… » de « Je bloque » (`lib/exempleJeBloque.ts`).
 */
export interface PrerequisResolu {
  entree: UtiliseEntree
  cible: CibleResolue & { section: ChapterSection; numero: number }
}

/** Entrées `utilise` résolues (celles dont la cible est inconnue sont ignorées : le build les refuse). */
export function resoudreUtilise(entrees: UtiliseEntree[] | undefined): PrerequisResolu[] {
  const res: PrerequisResolu[] = []
  for (const entree of entrees ?? []) {
    const cible = resoudreReference(entree.cible)
    if (cible?.section && cible.numero) res.push({ entree, cible: cible as PrerequisResolu['cible'] })
  }
  return res
}

/** Phrases du rappel : `rappel` de l'entrée, sinon « L'essentiel » de l'étape citée. */
export function phrasesRappel(p: PrerequisResolu): string[] {
  return p.entree.rappel ? [p.entree.rappel] : (p.cible.section.essentiel ?? [])
}

/** Prérequis montrés par « Je bloque » pour ce générateur : les indispensables de l'étape, plus les
 * entrées `utile` dont `jeBloque` cite le générateur. */
export function prerequisJeBloque(section: ChapterSection, generatorId: string): PrerequisResolu[] {
  return resoudreUtilise(section.utilise).filter((p) => p.entree.poids === 'indispensable' || p.entree.jeBloque?.includes(generatorId))
}

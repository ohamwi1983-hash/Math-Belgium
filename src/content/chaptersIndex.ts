import type { ChapterContent } from './types'
import { fonctionsComposees } from './chapters/5e-4h/fonctions-composees'
import { trigonometrie } from './chapters/5e-4h/trigonometrie'
import { suites } from './chapters/5e-4h/suites'
import { limitesAsymptotes } from './chapters/5e-4h/limites-asymptotes'
import { fonctionSecondDegre } from './chapters/4e/fonction-second-degre'
import { equationsInequationsSecondDegre } from './chapters/4e/equations-inequations-second-degre'
import { caracteristiquesFonctionsReference } from './chapters/4e/caracteristiques-fonctions-reference'
import { fonctionsReciproquesCyclometriques } from './chapters/6e-6h/fonctions-reciproques-cyclometriques'
import { fonctionsExponentielles } from './chapters/6e-6h/fonctions-exponentielles'
import { fonctionsLogarithmes } from './chapters/6e-6h/fonctions-logarithmes'

export interface LevelEntry {
  slug: string
  label: string
  chapters: ChapterContent[]
}

/**
 * Registre de navigation : un niveau (4e / 5e-4h / 6e-6h) et la liste de ses chapitres.
 * Ajouter un chapitre = ajouter son fichier de données ici, jamais une nouvelle route codée à la main.
 */
export const LEVELS: LevelEntry[] = [
  { slug: '4e', label: '4e', chapters: [fonctionSecondDegre, equationsInequationsSecondDegre, caracteristiquesFonctionsReference] },
  { slug: '5e-4h', label: '5e (4h)', chapters: [fonctionsComposees, trigonometrie, suites, limitesAsymptotes] },
  { slug: '6e-6h', label: '6e (6h)', chapters: [fonctionsReciproquesCyclometriques, fonctionsExponentielles, fonctionsLogarithmes] },
]

export function findChapter(levelSlug: string, chapterSlug: string): ChapterContent | undefined {
  return LEVELS.find((l) => l.slug === levelSlug)?.chapters.find((c) => c.slug === chapterSlug)
}

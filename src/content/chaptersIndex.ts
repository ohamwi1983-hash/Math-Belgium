import type { ChapterContent } from './types'
import { fonctionsComposees } from './chapters/5e-4h/fonctions-composees'

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
  { slug: '4e', label: '4e', chapters: [] },
  { slug: '5e-4h', label: '5e (4h)', chapters: [fonctionsComposees] },
  { slug: '6e-6h', label: '6e (6h)', chapters: [] },
]

export function findChapter(levelSlug: string, chapterSlug: string): ChapterContent | undefined {
  return LEVELS.find((l) => l.slug === levelSlug)?.chapters.find((c) => c.slug === chapterSlug)
}

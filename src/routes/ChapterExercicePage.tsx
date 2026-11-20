import { useParams, Navigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'
import { LEVELS, findChapter } from '../content/chaptersIndex'
import { usePageNonIndexee } from '../lib/useDocumentMeta'

/** Page `/{levelSlug}/{chapterSlug}/exercices` — même panneau que `/exercice`
 * (`ExercicePage.tsx`), mais pré-verrouillé sur LE chapitre dont vient le visiteur (lien « Générer une
 * feuille d'exercices » en bas de `ChapterPage.tsx`) : pas de sélecteur niveau/heures/chapitre à
 * re-choisir, voir `EvaluationGeneratorPanel`'s prop `verrouille`. Publique, comme `/exercice`
 * (décision de l'utilisateur : les élèves s'en servent pour préparer leurs évaluations). */
export function ChapterExercicePage() {
  const { levelSlug, chapterSlug } = useParams<{ levelSlug: string; chapterSlug: string }>()
  const chapter = levelSlug && chapterSlug ? findChapter(levelSlug, chapterSlug) : undefined
  usePageNonIndexee(chapter ? `Feuille d'exercices — ${chapter.title}` : "Feuille d'exercices")

  if (!chapter || !levelSlug || !chapterSlug) return <Navigate to="/" replace />

  const level = LEVELS.find((l) => l.slug === levelSlug)

  return (
    <>
      <SiteHeader
        breadcrumb={[
          { label: level?.label ?? levelSlug, to: '/' },
          { label: chapter.title, to: `/${levelSlug}/${chapterSlug}` },
          { label: "Feuille d'exercices" },
        ]}
      />
      <div className="page-tool">
        <header className="chapter-head">
          <p className="eyebrow">{chapter.level}</p>
          <h1 className="chapter-title">Feuille d'exercices — {chapter.title}</h1>
        </header>

        <EvaluationGeneratorPanel mode="exercice" verrouille={{ levelSlug, chapitreSlug: chapterSlug }} />
      </div>
    </>
  )
}

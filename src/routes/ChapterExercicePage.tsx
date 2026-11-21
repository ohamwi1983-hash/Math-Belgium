import { Link, useParams, Navigate, useSearchParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'
import { AssistantEleve } from '../components/eleve/AssistantEleve'
import { LEVELS, findChapter } from '../content/chaptersIndex'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { usePageNonIndexee } from '../lib/useDocumentMeta'

/** Page `/{levelSlug}/{chapterSlug}/exercices` — publique, comme `/exercice` (décision de
 * l'utilisateur : les élèves s'en servent pour préparer leurs évaluations), verrouillée sur LE
 * chapitre dont vient le visiteur (lien en bas de `ChapterPage.tsx`). Visiteur non connecté (élève) :
 * assistant « Préparer mon évaluation » sur ce chapitre (`AssistantEleve`, « Changer de chapitre » →
 * `/exercice`). Professeur connecté : panneau des feuilles d'exercices tel quel, pré-verrouillé
 * (`EvaluationGeneratorPanel`, prop `verrouille`). */
export function ChapterExercicePage() {
  const { levelSlug, chapterSlug } = useParams<{ levelSlug: string; chapterSlug: string }>()
  const chapter = levelSlug && chapterSlug ? findChapter(levelSlug, chapterSlug) : undefined
  const compte = useCompte()
  const connecte = estConnecteActif(compte)
  // « Voir comme un élève » (décision de l'utilisateur) : `?vue=eleve` montre l'assistant au professeur.
  const [params] = useSearchParams()
  const vueEleve = connecte && params.get('vue') === 'eleve'
  const professeur = connecte && !vueEleve
  usePageNonIndexee(chapter ? `${professeur ? "Feuille d'exercices" : 'Préparer mon évaluation'} — ${chapter.title}` : "Feuille d'exercices")

  if (!chapter || !levelSlug || !chapterSlug) return <Navigate to="/" replace />

  const level = LEVELS.find((l) => l.slug === levelSlug)

  return (
    <>
      <SiteHeader
        breadcrumb={[
          { label: level?.label ?? levelSlug, to: '/' },
          { label: chapter.title, to: `/${levelSlug}/${chapterSlug}` },
          { label: professeur ? "Feuille d'exercices" : 'Préparer mon évaluation' },
        ]}
      />
      <div className="page-tool">
        {vueEleve && (
          <p className="vue-eleve-bandeau" role="status">
            Tu vois cette page comme un élève. <Link to={`/${levelSlug}/${chapterSlug}/exercices`}>Revenir à ma page</Link>
          </p>
        )}
        {professeur ? (
          <>
            <header className="chapter-head">
              <p className="eyebrow">{chapter.level}</p>
              <h1 className="chapter-title">Feuille d'exercices — {chapter.title}</h1>
              <Link className="vue-eleve-lien" to={`/${levelSlug}/${chapterSlug}/exercices?vue=eleve`}>
                Voir comme un élève
              </Link>
            </header>
            <EvaluationGeneratorPanel mode="exercice" verrouille={{ levelSlug, chapitreSlug: chapterSlug }} />
          </>
        ) : !vueEleve && compte.etat === 'chargement' ? (
          <p className="eleve-aide" role="status">
            Chargement…
          </p>
        ) : (
          <AssistantEleve key={`${levelSlug}/${chapterSlug}`} verrouille={{ levelSlug, chapitreSlug: chapterSlug }} />
        )}
      </div>
    </>
  )
}

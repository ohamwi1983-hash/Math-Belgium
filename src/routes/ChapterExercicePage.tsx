import { Link, useParams, Navigate, useSearchParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'
import { EspaceConception } from '../components/compte/EspaceConception'
import { AssistantEleve } from '../components/eleve/AssistantEleve'
import { LEVELS, findChapter } from '../content/chaptersIndex'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { usePageNonIndexee } from '../lib/useDocumentMeta'
import { numeroRepere, useOrdreChapitres } from '../lib/ordreChapitres'

/** Page `/{levelSlug}/{chapterSlug}/exercices` — publique, comme `/exercice` (décision de
 * l'utilisateur : les élèves s'en servent pour préparer leurs évaluations), verrouillée sur LE
 * chapitre dont vient le visiteur (lien en bas de `ChapterPage.tsx`). Visiteur non connecté (élève) :
 * assistant « Me préparer à l'évaluation » sur ce chapitre (`AssistantEleve`, « Changer de chapitre » →
 * `/exercice`). Professeur connecté : panneau des feuilles d'exercices tel quel, pré-verrouillé
 * (`EvaluationGeneratorPanel`, prop `verrouille`), dans le cadre « Mon espace » (`EspaceConception`). */
export function ChapterExercicePage() {
  const { levelSlug, chapterSlug } = useParams<{ levelSlug: string; chapterSlug: string }>()
  const chapter = levelSlug && chapterSlug ? findChapter(levelSlug, chapterSlug) : undefined
  const compte = useCompte()
  const { ordre } = useOrdreChapitres()
  const connecte = estConnecteActif(compte)
  // « Voir comme un élève » (décision de l'utilisateur) : `?vue=eleve` montre l'assistant au professeur.
  const [params] = useSearchParams()
  const vueEleve = connecte && params.get('vue') === 'eleve'
  const professeur = connecte && !vueEleve
  usePageNonIndexee(chapter ? `${professeur ? "Feuille d'exercices" : "Me préparer à l'évaluation"} — ${chapter.title}` : "Feuille d'exercices")

  if (!chapter || !levelSlug || !chapterSlug) return <Navigate to="/" replace />

  const level = LEVELS.find((l) => l.slug === levelSlug)

  return (
    <>
      <SiteHeader
        breadcrumb={[
          { label: level?.label ?? levelSlug, to: '/' },
          { label: chapter.title, to: `/${levelSlug}/${chapterSlug}` },
          { label: professeur ? "Feuille d'exercices" : "Me préparer à l'évaluation" },
        ]}
      />
      <div className="page-tool">
        {vueEleve && (
          <p className="vue-eleve-bandeau" role="status">
            Tu vois cette page comme un élève. <Link to={`/${levelSlug}/${chapterSlug}/exercices`}>Revenir à ma page</Link>
          </p>
        )}
        {professeur ? (
          <EspaceConception
            type="feuille"
            titre={`Feuille d'exercices — ${chapter.title}`}
            sousTitre={`${level?.label ?? chapter.level} · chapitre ${numeroRepere(chapter, ordre)}`}
            sansNiveau
            lienEleve={`/${levelSlug}/${chapterSlug}/exercices?vue=eleve`}
            panneau={(publier) => <EvaluationGeneratorPanel mode="exercice" verrouille={{ levelSlug, chapitreSlug: chapterSlug }} onResume={publier} />}
          />
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

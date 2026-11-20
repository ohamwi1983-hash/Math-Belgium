import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'
import { PageReservee } from '../components/compte/PageReservee'
import { usePageNonIndexee } from '../lib/useDocumentMeta'

/** `/exercice` — panneau des feuilles d'exercices (et remédiations). Réservé aux professeurs
 * connectés (décision de l'utilisateur : cours et générateurs publics, panneau de conception
 * derrière la connexion) ; sans Supabase configuré : « Connexion indisponible ». */
export function ExercicePage() {
  usePageNonIndexee("Feuilles d'exercices")
  return (
    <>
      <SiteHeader />
      <div className="page-tool">
        <header className="chapter-head">
          <p className="eyebrow">Math-Belgium</p>
          <h1 className="chapter-title">Feuilles d'exercices</h1>
        </header>

        <PageReservee>
          <EvaluationGeneratorPanel mode="exercice" />
        </PageReservee>
      </div>
    </>
  )
}

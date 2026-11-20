import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'
import { usePageNonIndexee } from '../lib/useDocumentMeta'

/** `/exercice` — panneau des feuilles d'exercices (et remédiations). PUBLIC (décision de
 * l'utilisateur : les élèves s'en servent pour préparer leurs évaluations). Connecté : école et nom
 * du professeur sur les copies, enregistrements dans le coffre ; sans session : cartouche par défaut,
 * enregistrements dans le navigateur. Seul `/evaluation` exige une session. */
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

        <EvaluationGeneratorPanel mode="exercice" />
      </div>
    </>
  )
}

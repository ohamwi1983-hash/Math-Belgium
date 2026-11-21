import { Link, useSearchParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'
import { AssistantEleve } from '../components/eleve/AssistantEleve'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { usePageNonIndexee } from '../lib/useDocumentMeta'

/** `/exercice` — PUBLIC (décision de l'utilisateur : les élèves s'en servent pour préparer leurs
 * évaluations). Visiteur non connecté (élève) : assistant « Préparer mon évaluation » (feuille
 * d'exercices ou évaluation blanche, `components/eleve/AssistantEleve.tsx`). Professeur connecté
 * (`estConnecteActif`) : panneau des feuilles d'exercices tel quel (école et nom sur les copies, coffre).
 * Seul `/evaluation` exige une session. */
export function ExercicePage() {
  const compte = useCompte()
  const professeur = estConnecteActif(compte)
  // « Voir comme un élève » (décision de l'utilisateur) : le professeur connecté voit l'assistant
  // des élèves avec `?vue=eleve`, sans se déconnecter.
  const [params] = useSearchParams()
  const vueEleve = professeur && params.get('vue') === 'eleve'
  usePageNonIndexee(professeur && !vueEleve ? "Feuilles d'exercices" : 'Préparer mon évaluation')
  return (
    <>
      <SiteHeader />
      <div className="page-tool">
        {vueEleve ? (
          <>
            <p className="vue-eleve-bandeau" role="status">
              Tu vois cette page comme un élève. <Link to="/exercice">Revenir à ma page</Link>
            </p>
            <AssistantEleve />
          </>
        ) : professeur ? (
          <>
            <header className="chapter-head">
              <p className="eyebrow">Math-Belgium</p>
              <h1 className="chapter-title">Feuilles d'exercices</h1>
              <Link className="vue-eleve-lien" to="/exercice?vue=eleve">
                Voir comme un élève
              </Link>
            </header>
            <EvaluationGeneratorPanel mode="exercice" />
          </>
        ) : compte.etat === 'chargement' ? (
          // Session stockée en cours de lecture : ni l'assistant ni le panneau (pas de bascule visible).
          <p className="eleve-aide" role="status">
            Chargement…
          </p>
        ) : (
          <AssistantEleve />
        )}
      </div>
    </>
  )
}

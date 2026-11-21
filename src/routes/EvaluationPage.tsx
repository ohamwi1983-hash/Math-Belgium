import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'
import { EspaceConception } from '../components/compte/EspaceConception'
import { PageReservee } from '../components/compte/PageReservee'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { usePageNonIndexee } from '../lib/useDocumentMeta'

/** `/evaluation` — panneau des évaluations et examens pour tout professeur connecté (avant les
 * comptes, il n'existait que derrière le mot de passe de `/admin`, qui garde ce rôle tant que
 * Supabase n'est pas configuré). Connecté : cadre « Mon espace » (`EspaceConception` : menu,
 * bandeau sombre qui porte le titre) ; sinon (chargement, redirection, configuration manquante) :
 * titre habituel au-dessus de la garde. */
export function EvaluationPage() {
  usePageNonIndexee('Évaluations et examens')
  const compte = useCompte()
  return (
    <>
      <SiteHeader />
      <div className="page-tool">
        {!estConnecteActif(compte) && (
          <header className="chapter-head">
            <p className="eyebrow">Espace professeur</p>
            <h1 className="chapter-title">Évaluations et examens</h1>
          </header>
        )}

        <PageReservee>
          <EspaceConception type="evaluation" titre="Évaluations et examens" panneau={(publier) => <EvaluationGeneratorPanel onResume={publier} />} />
        </PageReservee>
      </div>
    </>
  )
}

import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'
import { PageReservee } from '../components/compte/PageReservee'
import { usePageNonIndexee } from '../lib/useDocumentMeta'

/** `/evaluation` — panneau des évaluations et examens pour tout professeur connecté (avant les
 * comptes, il n'existait que derrière le mot de passe de `/admin`, qui garde ce rôle tant que
 * Supabase n'est pas configuré). */
export function EvaluationPage() {
  usePageNonIndexee('Évaluations et examens')
  return (
    <>
      <SiteHeader />
      <div className="page-tool">
        <header className="chapter-head">
          <p className="eyebrow">Espace professeur</p>
          <h1 className="chapter-title">Évaluations et examens</h1>
        </header>

        <PageReservee>
          <EvaluationGeneratorPanel />
        </PageReservee>
      </div>
    </>
  )
}

import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'

export function ExercicePage() {
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

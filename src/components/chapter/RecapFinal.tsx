import type { ChapterContent } from '../../content/types'
import { RichText } from '../Math'
import { ChecklistRelecture } from './ChecklistRelecture'
import { FeatureTable } from './FeatureTable'
import { CarteEntrainement } from './CarteEntrainement'

/** Récapitulatif final ("Ce qu'il faut retenir") + checklist de relecture + note de transition. */
export function RecapFinal({ recap }: { recap: ChapterContent['recap'] }) {
  return (
    <div className="synthese">
      <h2>Ce qu'il faut retenir</h2>
      {recap.items && (
        <ul>
          {recap.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )}
      {recap.table && <FeatureTable block={{ kind: 'featureTable', ...recap.table }} />}
      {recap.checklist && <ChecklistRelecture checklist={recap.checklist} />}
      {recap.forward && (
        <p className="forward">
          <RichText text={recap.forward} />
        </p>
      )}
      {recap.entrainement && <CarteEntrainement block={recap.entrainement} />}
    </div>
  )
}

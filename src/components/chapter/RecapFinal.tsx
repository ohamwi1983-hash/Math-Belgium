import type { ChapterContent } from '../../content/types'
import { RichText } from '../Math'
import { ChecklistRelecture } from './ChecklistRelecture'

/** Récapitulatif final ("Ce qu'il faut retenir") + checklist de relecture + note de transition. */
export function RecapFinal({ recap }: { recap: ChapterContent['recap'] }) {
  return (
    <div className="synthese">
      <h2>Ce qu'il faut retenir</h2>
      <ul>
        {recap.items.map((item, i) => (
          <li key={i}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
      {recap.checklist && <ChecklistRelecture checklist={recap.checklist} />}
      {recap.forward && (
        <p className="forward">
          <RichText text={recap.forward} />
        </p>
      )}
    </div>
  )
}

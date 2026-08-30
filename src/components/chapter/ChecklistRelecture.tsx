import type { ChapterContent } from '../../content/types'
import { RichText } from '../Math'

export type ChecklistRelectureData = NonNullable<ChapterContent['recap']['checklist']>

/**
 * Checklist "avant de rendre sa copie" — questions à se poser avant de rendre l'examen, sous
 * forme de callout astuce. Distincte de `RecapFinal` (le récapitulatif "Ce qu'il faut retenir") :
 * l'une résume la théorie, l'autre est une liste de vérifications de méthode.
 */
export function ChecklistRelecture({ checklist }: { checklist: ChecklistRelectureData }) {
  return (
    <div className="callout callout-astuce" style={{ marginTop: 22 }}>
      <p className="callout-label">
        <span className="icon">💡</span> {checklist.label ?? 'Astuce — avant de rendre ta copie'}
      </p>
      <ul>
        {checklist.items.map((item, i) => (
          <li key={i}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

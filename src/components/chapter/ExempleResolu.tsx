import type { Block } from '../../content/types'
import { RichText } from '../Math'
import { Illustration } from '../illustrations/Illustration'

/** Bloc "Exemple résolu" : formule de départ, étapes tagguées, résultat encadré.
 *
 * Le cadre de résultat n'est rendu QUE s'il a réellement quelque chose à afficher (un tag ou un
 * texte). Certains exemples se suffisent de leurs étapes — ou renvoient à un tableau/diagramme
 * placé juste après — et n'ont pas de résultat final unique à encadrer : sans ce garde-fou, le
 * cadre se dessinait quand même, produisant un rectangle vide (bordure rouge via `.is-empty`,
 * d'où le signalement) au bas de l'exemple. Attention : `result.isEmpty` NE signifie PAS « pas de
 * résultat » — c'est la teinte d'alerte d'un résultat qui vaut l'ensemble vide (ex.
 * $\operatorname{dom}(f\circ g) = \varnothing$ dans « Fonctions composées »), qui a bien un
 * contenu et doit continuer à s'afficher. C'est donc l'absence de contenu, et non ce drapeau, qui
 * supprime le cadre. */
export function ExempleResolu({ block }: { block: Extract<Block, { kind: 'exemple' }> }) {
  const aUnResultat = block.result.tag.trim() !== '' || block.result.text.trim() !== ''
  return (
    <div className="exemple">
      <div className="exemple-head">
        Exemple résolu
        {block.badge && <span className="badge">{block.badge}</span>}
      </div>
      <div className="exemple-body">
        {block.formula && (
          <p className="formula">
            <RichText text={block.formula} />
          </p>
        )}
        {block.steps.map((step, i) => (
          <div className="step" key={i}>
            <span className="tag">{step.tag}</span>
            <RichText text={step.text} />
          </div>
        ))}
        {aUnResultat && (
          <div className={`exemple-result${block.result.isEmpty ? ' is-empty' : ''}`}>
            <span className="tag">{block.result.tag}</span>
            <RichText text={block.result.text} />
          </div>
        )}
        {block.illustration && <Illustration spec={block.illustration} />}
      </div>
    </div>
  )
}

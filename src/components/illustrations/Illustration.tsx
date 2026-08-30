import type { IllustrationSpec } from '../../content/types'
import { MachineDiagram } from './MachineDiagram'
import { DomainNumberLine } from './DomainNumberLine'
import { CompositionIntroDiagram } from './CompositionIntroDiagram'
import { ChainDiagram } from './ChainDiagram'
import { CompositionSchematicDiagram } from './CompositionSchematicDiagram'
import { CompositionNumericDiagram } from './CompositionNumericDiagram'
import { FunctionGraph } from './FunctionGraph'
import { CurvePlot } from './CurvePlot'
import { FencedEnclosure } from './FencedEnclosure'
import { SetMapping } from './SetMapping'
import { UnitCircleArc } from './UnitCircleArc'

const DEFAULT_CAPTIONS: Partial<Record<IllustrationSpec['kind'], string>> = {
  machine: 'x entre dans la machine f, il en ressort f(x)',
  compositionIntro: 'g agit en premier (la machine la plus proche de x), f agit en second',
  compositionSchematic: 'la valeur lue en sortie du premier graphe redevient l’entrée du second',
}

function renderSvg(spec: IllustrationSpec) {
  switch (spec.kind) {
    case 'machine':
      return <MachineDiagram />
    case 'domainLine':
      return <DomainNumberLine {...spec} />
    case 'compositionIntro':
      return <CompositionIntroDiagram />
    case 'chain':
      return <ChainDiagram {...spec} />
    case 'compositionSchematic':
      return <CompositionSchematicDiagram />
    case 'compositionNumeric':
      return <CompositionNumericDiagram {...spec} />
    case 'functionGraph':
      return <FunctionGraph {...spec} />
    case 'curvePlot':
      return <CurvePlot {...spec} />
    case 'fencedEnclosure':
      return <FencedEnclosure {...spec} />
    case 'setMapping':
      return <SetMapping {...spec} />
    case 'unitCircleArc':
      return <UnitCircleArc {...spec} />
  }
}

/** Wraps any illustration spec in the shared figure/diagram-frame/figcaption chrome. */
export function Illustration({ spec }: { spec: IllustrationSpec }) {
  const caption = 'caption' in spec ? spec.caption : DEFAULT_CAPTIONS[spec.kind]
  return (
    <figure>
      <div className="diagram-frame">{renderSvg(spec)}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

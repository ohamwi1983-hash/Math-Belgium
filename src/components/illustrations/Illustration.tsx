import type { IllustrationSpec } from '../../content/types'
import { RichText } from '../Math'
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
import { CircleDiagram } from './CircleDiagram'
import { TrigCircleReference } from './TrigCircleReference'
import { CircleAngles } from './CircleAngles'
import { RightTriangle } from './RightTriangle'
import { TriangleGeneric } from './TriangleGeneric'
import { Triangulation } from './Triangulation'
import { SequencePlot } from './SequencePlot'
import { Histogram } from './Histogram'
import { BoxPlot } from './BoxPlot'
import { ComplexPlane } from './ComplexPlane'
import { NumberSetsNesting } from './NumberSetsNesting'
import { VectorPlane } from './VectorPlane'
import { VennDiagram } from './VennDiagram'
import { WeightedTree } from './WeightedTree'
import { OutcomeGrid } from './OutcomeGrid'
import { PolygonDiagonals } from './PolygonDiagonals'
import { CircularPermutation } from './CircularPermutation'
import { GroupPartition } from './GroupPartition'
import { LetterTiles } from './LetterTiles'
import { PascalTriangle } from './PascalTriangle'
import { CategoricalBarChart } from './CategoricalBarChart'
import { SequenceOutcomes } from './SequenceOutcomes'
import { FrequencyStabilization } from './FrequencyStabilization'
import { UniversePartition } from './UniversePartition'
import { NaturalFrequencies } from './NaturalFrequencies'
import { ComplementBar } from './ComplementBar'
import { SolidRevolution } from './SolidRevolution'

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
    case 'circleDiagram':
      return <CircleDiagram {...spec} />
    case 'trigCircleReference':
      return <TrigCircleReference {...spec} />
    case 'circleAngles':
      return <CircleAngles {...spec} />
    case 'rightTriangle':
      return <RightTriangle {...spec} />
    case 'triangleGeneric':
      return <TriangleGeneric {...spec} />
    case 'triangulation':
      return <Triangulation {...spec} />
    case 'sequencePlot':
      return <SequencePlot {...spec} />
    case 'histogram':
      return <Histogram {...spec} />
    case 'boxPlot':
      return <BoxPlot {...spec} />
    case 'complexPlane':
      return <ComplexPlane {...spec} />
    case 'numberSetsNesting':
      return <NumberSetsNesting {...spec} />
    case 'vectorPlane':
      return <VectorPlane {...spec} />
    case 'vennDiagram':
      return <VennDiagram {...spec} />
    case 'weightedTree':
      return <WeightedTree {...spec} />
    case 'outcomeGrid':
      return <OutcomeGrid {...spec} />
    case 'polygonDiagonals':
      return <PolygonDiagonals {...spec} />
    case 'circularPermutation':
      return <CircularPermutation {...spec} />
    case 'groupPartition':
      return <GroupPartition {...spec} />
    case 'letterTiles':
      return <LetterTiles {...spec} />
    case 'pascalTriangle':
      return <PascalTriangle {...spec} />
    case 'categoricalBarChart':
      return <CategoricalBarChart {...spec} />
    case 'sequenceOutcomes':
      return <SequenceOutcomes {...spec} />
    case 'frequencyStabilization':
      return <FrequencyStabilization {...spec} />
    case 'universePartition':
      return <UniversePartition {...spec} />
    case 'naturalFrequencies':
      return <NaturalFrequencies {...spec} />
    case 'complementBar':
      return <ComplementBar {...spec} />
    case 'solidRevolution':
      return <SolidRevolution {...spec} />
  }
}

/** Wraps any illustration spec in the shared figure/diagram-frame/figcaption chrome. */
export function Illustration({ spec }: { spec: IllustrationSpec }) {
  const caption = 'caption' in spec ? spec.caption : DEFAULT_CAPTIONS[spec.kind]
  const compact = 'compact' in spec && spec.compact === true
  return (
    <figure>
      <div className={compact ? 'diagram-frame diagram-frame--compact' : 'diagram-frame'}>{renderSvg(spec)}</div>
      {caption && (
        <figcaption>
          <RichText text={caption} />
        </figcaption>
      )}
    </figure>
  )
}

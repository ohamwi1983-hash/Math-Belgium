import type { Block } from '../../content/types'
import { RichText } from '../Math'
import { Illustration } from '../illustrations/Illustration'
import { Rappel, Methode, Attention, Astuce, PiegeClassique } from './Callouts'
import { ExempleResolu } from './ExempleResolu'
import { WrongRight } from './WrongRight'
import { CarteEntrainement } from './CarteEntrainement'

/** Renders one content block. Sections/intros are just ordered arrays of these. */
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.kind) {
    case 'para':
      return (
        <p>
          <RichText text={block.text} />
        </p>
      )
    case 'subheading':
      return <h3 className="sub-title">{block.text}</h3>
    case 'rappel':
      return <Rappel block={block} />
    case 'methode':
      return <Methode block={block} />
    case 'attention':
      return <Attention block={block} />
    case 'astuce':
      return <Astuce block={block} />
    case 'piege':
      return <PiegeClassique block={block} />
    case 'exemple':
      return <ExempleResolu block={block} />
    case 'wrongRight':
      return <WrongRight block={block} />
    case 'illustration':
      return <Illustration spec={block.illustration} />
    case 'entrainement':
      return <CarteEntrainement block={block} />
  }
}

export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </>
  )
}

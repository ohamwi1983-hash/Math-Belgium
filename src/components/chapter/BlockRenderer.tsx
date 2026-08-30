import type { Block } from '../../content/types'
import { RichText } from '../Math'
import { Illustration } from '../illustrations/Illustration'
import { Rappel, Methode, Attention, Astuce, PiegeClassique } from './Callouts'
import { ExempleResolu } from './ExempleResolu'
import { WrongRight } from './WrongRight'
import { CarteEntrainement } from './CarteEntrainement'
import { SignTable } from './SignTable'

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
    case 'list':
      return (
        <ul className="plain">
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )
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
    case 'illustrationGroup':
      return (
        <div className="diag-multi">
          {block.items.map((spec, i) => (
            <Illustration key={i} spec={spec} />
          ))}
        </div>
      )
    case 'entrainement':
      return <CarteEntrainement block={block} />
    case 'signTable':
      return <SignTable block={block} />
    case 'video':
      return (
        <div className="video-frame-wrap no-export">
          <span className="video-icon" aria-hidden="true">
            🎬
          </span>
          Vidéo à venir — {block.title}
        </div>
      )
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

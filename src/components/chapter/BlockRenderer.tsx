import type { Block } from '../../content/types'
import { RichText } from '../Math'
import { Illustration } from '../illustrations/Illustration'
import { Rappel, Methode, Attention, Astuce, PiegeClassique, Definition, Intuition, Historique, Application } from './Callouts'
import { ExempleResolu } from './ExempleResolu'
import { WrongRight } from './WrongRight'
import { CarteEntrainement } from './CarteEntrainement'
import { SignTable } from './SignTable'
import { FeatureTable } from './FeatureTable'
import { OperationChain } from './OperationChain'
import { InteractiveWidget } from './InteractiveWidget'
import { TablePhi } from '../TablePhi'

/** Renders one content block. Sections/intros are just ordered arrays of these.
 *
 * `enTiroir` (exemples seulement) : l'exemple est rendu à sa place pour l'impression, l'export et
 * le pré-rendu, mais masqué à l'écran du parcours, où il est relu pas à pas dans un tiroir en fin
 * d'étape (voir `ContenuEtape`). */
export function BlockRenderer({ block, enTiroir }: { block: Block; enTiroir?: boolean }) {
  switch (block.kind) {
    case 'para':
      return (
        <p>
          <RichText text={block.text} />
        </p>
      )
    case 'subheading':
      return (
        <h3 className="sub-title">
          <RichText text={block.text} />
        </h3>
      )
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
    case 'intuition':
      return <Intuition block={block} />
    case 'definition':
      return <Definition block={block} />
    case 'historique':
      return <Historique block={block} />
    case 'application':
      return <Application block={block} />
    case 'exemple':
      return <ExempleResolu block={block} className={enTiroir ? 'en-tiroir' : undefined} />
    case 'exempleLibre':
      return (
        <div className={`callout callout-exemple${enTiroir ? ' en-tiroir' : ''}`}>
          <p className="callout-label">{block.label ?? 'Exemple résolu'}</p>
          <BlockList blocks={block.blocks} />
        </div>
      )
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
    case 'atelier':
      return (
        <div className="atelier-frame-wrap no-export" id={`atelier-${block.tag}`}>
          <p className="atelier-label">
            <span aria-hidden="true">🛠️</span> {block.label}
          </p>
          <InteractiveWidget tag={block.tag} />
          {block.caption && <p className="atelier-caption">{block.caption}</p>}
        </div>
      )
    case 'signTable':
      return <SignTable block={block} />
    case 'featureTable':
      return <FeatureTable block={block} />
    case 'operationChain':
      return <OperationChain block={block} />
    case 'tablePhi':
      return (
        <figure className="table-phi-cours-bloc">
          <TablePhi />
          {block.caption && (
            <figcaption>
              <RichText text={block.caption} />
            </figcaption>
          )}
        </figure>
      )
    case 'video':
      return block.youtubeId ? (
        <div className="video-embed no-export" id={`video-${block.youtubeId}`}>
          <iframe
            src={`https://www.youtube.com/embed/${block.youtubeId}`}
            title={block.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
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

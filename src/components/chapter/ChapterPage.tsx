import type { ChapterContent } from '../../content/types'
import { RichText } from '../Math'
import { BlockList } from './BlockRenderer'
import { RecapFinal } from './RecapFinal'
import { ExerciseGeneratorSection } from './ExerciseGeneratorSection'
import { ExportSection } from './ExportSection'

/** Ouvre ou referme toutes les sections repliables du chapitre affiché (manipulation DOM directe,
 * volontairement hors de l'état React : `<details>` gère déjà son état d'ouverture nativement, pas
 * besoin de le dupliquer en state pour un simple bouton "Tout déplier/replier"). */
function toutesLesSections(open: boolean) {
  document
    .querySelectorAll<HTMLDetailsElement>('.chapter-section[data-repliable]')
    .forEach((details) => {
      details.open = open
    })
}

/**
 * Gabarit unique partagé par tous les chapitres. Un chapitre est entièrement défini par ses
 * données (`ChapterContent`) — voir CLAUDE.md, section "Gabarit ChapterPage".
 */
export function ChapterPage({ chapter }: { chapter: ChapterContent }) {
  return (
    <div className={`page chapter-${chapter.slug}`}>
      <header className="chapter-head">
        <p className="eyebrow">
          {chapter.level} — Chapitre {chapter.chapterNumber}
        </p>
        <h1 className="chapter-title">{chapter.title}</h1>
        <p className="chapter-lede">
          <RichText text={chapter.lede} />
        </p>
        <nav className="toc no-export">
          <div className="toc-head">
            <p className="toc-label">Dans ce chapitre</p>
            <div className="toc-plier">
              <button type="button" onClick={() => toutesLesSections(true)}>
                Tout déplier
              </button>
              <button type="button" onClick={() => toutesLesSections(false)}>
                Tout replier
              </button>
            </div>
          </div>
          <ol>
            {chapter.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {chapter.intro && (
        <section className="chapter-section intro-section">
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            {chapter.intro.title}
          </h2>
          <BlockList blocks={chapter.intro.blocks} />
        </section>
      )}

      {chapter.sections.map((section, index) => (
        <details className="chapter-section" data-repliable id={section.id} key={section.id} open={index === 0}>
          <summary className="section-head">
            <span className="section-chevron" aria-hidden="true" />
            <span className="section-num">{section.number}</span>
            <h2 className="section-title">{section.title}</h2>
          </summary>
          <div className="section-body">
            {section.kicker && <p className="section-kicker">{section.kicker}</p>}
            <BlockList blocks={section.blocks} />
          </div>
        </details>
      ))}

      <RecapFinal recap={chapter.recap} />

      <ExerciseGeneratorSection chapter={chapter} />
      <ExportSection chapter={chapter} />
    </div>
  )
}

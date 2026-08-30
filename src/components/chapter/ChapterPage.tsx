import type { ChapterContent } from '../../content/types'
import { RichText } from '../Math'
import { BlockList } from './BlockRenderer'
import { RecapFinal } from './RecapFinal'
import { ExportSection } from './ExportSection'

/**
 * Gabarit unique partagé par tous les chapitres. Un chapitre est entièrement défini par ses
 * données (`ChapterContent`) — voir CLAUDE.md, section "Gabarit ChapterPage".
 */
export function ChapterPage({ chapter }: { chapter: ChapterContent }) {
  return (
    <div className="page">
      <header className="chapter-head">
        <p className="eyebrow">
          {chapter.level} — Chapitre {chapter.chapterNumber}
        </p>
        <h1 className="chapter-title">{chapter.title}</h1>
        <p className="chapter-lede">
          <RichText text={chapter.lede} />
        </p>
        <nav className="toc no-export">
          <p className="toc-label">Dans ce chapitre</p>
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

      {chapter.sections.map((section) => (
        <section className="chapter-section" id={section.id} key={section.id}>
          <div className="section-head">
            <span className="section-num">{section.number}</span>
            <h2 className="section-title">{section.title}</h2>
          </div>
          {section.kicker && <p className="section-kicker">{section.kicker}</p>}
          <BlockList blocks={section.blocks} />
        </section>
      ))}

      <RecapFinal recap={chapter.recap} />

      <ExportSection chapter={chapter} />
    </div>
  )
}

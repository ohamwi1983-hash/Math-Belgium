import type { ChapterContent } from '../../content/types'
import { RichText } from '../Math'
import { BlockList } from './BlockRenderer'
import { RecapFinal } from './RecapFinal'
import { Formulaire } from './Formulaire'
import { ExerciseGeneratorSection } from './ExerciseGeneratorSection'
import { ExportSection } from './ExportSection'
import { LectureAids } from './LectureAids'

/**
 * Gabarit unique partagé par tous les chapitres. Un chapitre est entièrement défini par ses
 * données (`ChapterContent`) — voir CLAUDE.md, section "Gabarit ChapterPage".
 *
 * `.chapter-layout` enveloppe `LectureAids` (qui rend aussi bien le tiroir mobile que le sommaire
 * permanent desktop/tablette, voir `LectureAids.tsx`) et `.page.chapter-main` (tout le contenu du
 * chapitre, inchangé) comme deux enfants flex — bascule entre les deux présentations gérée en CSS
 * pur selon la largeur d'écran (`.chapter-layout` dans `index.css`), jamais en JS.
 */
export function ChapterPage({ chapter }: { chapter: ChapterContent }) {
  return (
    <div className={`chapter-layout chapter-${chapter.slug}`}>
      <LectureAids chapter={chapter} />
      <div className="page chapter-main">
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

        {chapter.sections.map((section) => (
          <section className="chapter-section" id={section.id} key={section.id}>
            <div className="section-head">
              <span className="section-num">{section.number}</span>
              <h2 className="section-title">{section.title}</h2>
            </div>
            <div className="section-body">
              {section.kicker && <p className="section-kicker">{section.kicker}</p>}
              <BlockList blocks={section.blocks} />
            </div>
          </section>
        ))}

        <RecapFinal recap={chapter.recap} />
        <Formulaire formulaire={chapter.formulaire} chapter={chapter} />

        <ExerciseGeneratorSection chapter={chapter} />
        <ExportSection chapter={chapter} />
      </div>
    </div>
  )
}

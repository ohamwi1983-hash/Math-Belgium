import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { LEVELS } from '../content/chaptersIndex'

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <div className="page">
        <header className="chapter-head">
          <p className="eyebrow">FWB — mathématiques</p>
          <h1 className="chapter-title">Chapitres de cours</h1>
          <p className="home-lede">
            Des chapitres de cours narratifs, niveau par niveau, chacun renvoyant vers les
            exercices interactifs correspondants sur la plateforme d’entraînement.
          </p>
        </header>

        {LEVELS.map((level) => (
          <section className="level-section" key={level.slug}>
            <h2 className="level-title">{level.label}</h2>
            <p className="level-kicker">{level.chapters.length} chapitre{level.chapters.length > 1 ? 's' : ''}</p>
            {level.chapters.length === 0 ? (
              <p className="empty-note">Aucun chapitre publié pour l’instant.</p>
            ) : (
              <ul className="chapter-list">
                {level.chapters.map((chapter) => (
                  <li key={chapter.slug}>
                    <Link className="chapter-card" to={`/${level.slug}/${chapter.slug}`}>
                      <p className="chapter-card-eyebrow">Chapitre {chapter.chapterNumber}</p>
                      <p className="chapter-card-title">{chapter.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  )
}

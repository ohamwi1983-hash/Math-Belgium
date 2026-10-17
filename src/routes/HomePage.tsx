import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { HomeChapterIcon, type HomeIconKind } from '../components/HomeChapterIcon'
import { LEVELS } from '../content/chaptersIndex'
import { useDocumentMeta } from '../lib/useDocumentMeta'

/** Icône par chapitre (voir `HomeChapterIcon.tsx`) — une valeur par `slug`, jamais une icône
 * générique partagée par catégorie (piège déjà rencontré et corrigé : une première version
 * réutilisait la même courbe pour 10 chapitres à la fois). Vit ici plutôt que dans
 * `ChapterContent` (`content/types.ts`) : c'est une métadonnée de LISTE (page d'accueil), pas une
 * propriété du contenu du chapitre lui-même. */
const CHAPTER_ICON: Record<string, HomeIconKind> = {
  'fonction-second-degre': 'parabola',
  'equations-inequations-second-degre': 'parabolaRoots',
  'caracteristiques-fonctions-reference': 'curveFamily',
  'statistique-descriptive': 'bars',
  'cercle-trigonometrique-triangles': 'circleAngle',
  'calcul-vectoriel': 'vector',
  'geometrie-analytique-plane': 'axesPoint',
  'geometrie-dans-espace': 'cube',
  'fonctions-composees': 'curve',
  trigonometrie: 'sineWave',
  suites: 'sequence',
  'limites-asymptotes': 'curveAsymptote',
  'derivees-applications': 'curveTangent',
  'fonctions-reciproques-cyclometriques': 'curveMirror',
  'fonctions-exponentielles': 'expCurve',
  'fonctions-logarithmes': 'logCurve',
  'primitives-integrales': 'curveArea',
  'nombres-complexes': 'complexPlane',
  probabilites: 'tree',
  'analyse-combinatoire': 'gridSelect',
  'variables-aleatoires': 'bump',
  'lieux-geometriques': 'circleLocus',
  coniques: 'ellipse',
}

/** Teinte par niveau — réutilise les jetons déjà dédiés au codage couleur des diagrammes
 * (`--accent`/`--sky`/`--plan`, voir `index.css`), jamais une couleur inventée pour l'occasion. */
const LEVEL_TONE = ['accent', 'sky', 'plan'] as const

export function HomePage() {
  useDocumentMeta(
    'Chapitres de maths — FWB',
    'Chapitres de cours de mathématiques narratifs pour la 4e, 5e et 6e (FWB), avec liens directs vers des exercices interactifs auto-corrigés.',
    '/',
  )

  return (
    <>
      <SiteHeader />
      <div className="page page-wide">
        <header className="home-hero">
          <div className="home-hero-text">
            <p className="eyebrow">Fédération Wallonie-Bruxelles · Mathématiques</p>
            <h1 className="chapter-title">Chaque chapitre, en un coup d'œil</h1>
            <p className="home-lede">
              Vingt-trois chapitres narratifs, classés par année — chacun renvoie vers ses exercices
              interactifs auto-corrigés.
            </p>
          </div>
          <svg viewBox="0 0 160 110" width="160" height="110" fill="none" aria-hidden="true" className="home-hero-svg">
            <path d="M12 94V12M12 94H148" className="home-hero-axis" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 80C40 80 48 24 82 24C104 24 112 46 148 46" className="home-hero-curve" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </header>

        {LEVELS.map((level, i) => {
          const tone = LEVEL_TONE[i] ?? 'accent'
          return (
            <section className="home-level" key={level.slug} style={{ '--level-c': `var(--${tone})`, '--level-c-ink': `var(--${tone}-ink)` } as React.CSSProperties}>
              <div className="home-level-head">
                <h2 className="home-level-number">{level.label.replace(/\s*\(.*\)/, '')}</h2>
                <span className="home-level-count">
                  {level.chapters.length} chapitre{level.chapters.length > 1 ? 's' : ''}
                </span>
              </div>

              {level.chapters.length === 0 ? (
                <p className="empty-note">Aucun chapitre publié pour l'instant.</p>
              ) : (
                <div className="home-chapter-grid">
                  {level.chapters.map((chapter) => (
                    <Link className="home-chapter-card" to={`/${level.slug}/${chapter.slug}`} key={chapter.slug}>
                      <HomeChapterIcon kind={CHAPTER_ICON[chapter.slug] ?? 'curve'} className="home-chapter-icon" />
                      <span>
                        <span className="home-chapter-num">{String(chapter.chapterNumber).padStart(2, '0')}</span>
                        <span className="home-chapter-title">{chapter.title}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}

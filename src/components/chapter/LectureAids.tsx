import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ChapterContent } from '../../content/types'
import { estGenerateurMigre, generatorLink } from '../../lib/generatorLink'

interface SectionRepere {
  id: string
  number: number
  title: string
}

interface GenerateurRepere {
  title: string
  generatorId: string
  chantier: string
  sectionTitle: string
}

interface VideoRepere {
  title: string
  youtubeId: string
  sectionTitle: string
}

interface AtelierRepere {
  title: string
  tag: string
  sectionTitle: string
}

type Onglet = 'contenu' | 'exercices' | 'videos' | 'ateliers'

/** Scanne l'intro + chaque section du chapitre et ne garde que les blocs du `kind` demandé —
 * même source que `CarteEntrainement`/`BlockRenderer`, jamais une liste entretenue à part. */
function blocsDuChapitre<K extends 'entrainement' | 'video' | 'atelier'>(chapter: ChapterContent, kind: K) {
  const blocsIntro = chapter.intro?.blocks ?? []
  const toutesLesSections = [{ id: null as string | null, title: chapter.intro?.title ?? '', blocks: blocsIntro }, ...chapter.sections]
  return toutesLesSections.flatMap((section) =>
    section.blocks
      .filter((block): block is Extract<typeof block, { kind: K }> => block.kind === kind)
      .map((block) => ({ block, sectionId: section.id, sectionTitle: section.title })),
  )
}

function genererateursDuChapitre(chapter: ChapterContent): GenerateurRepere[] {
  return blocsDuChapitre(chapter, 'entrainement').map(({ block, sectionTitle }) => ({
    title: block.title,
    generatorId: block.generatorId,
    chantier: block.chantier,
    sectionTitle,
  }))
}

/** Seules les vidéos déjà intégrées (`youtubeId` renseigné) sont listées — un placeholder "à
 * venir" n'a rien à montrer une fois atteint. */
function videosDuChapitre(chapter: ChapterContent): VideoRepere[] {
  return blocsDuChapitre(chapter, 'video')
    .filter(({ block }) => !!block.youtubeId)
    .map(({ block, sectionTitle }) => ({ title: block.title, youtubeId: block.youtubeId as string, sectionTitle }))
}

/** `block.label` porte systématiquement le préfixe "Manipule toi-même — "/"Manipule toi-même : "
 * (convention des 55 ateliers du site, vérifiée par grep) — retiré ici pour un intitulé de liste
 * plus court, l'onglet "Ateliers" portant déjà cette idée de manipulation. */
function ateliersDuChapitre(chapter: ChapterContent): AtelierRepere[] {
  return blocsDuChapitre(chapter, 'atelier').map(({ block, sectionTitle }) => ({
    title: block.label.replace(/^Manipule toi-même\s*[:—]\s*/, ''),
    tag: block.tag,
    sectionTitle,
  }))
}

/**
 * Aides de navigation pour un chapitre long, pensées pour la lecture sur smartphone : une fois
 * DANS une section, ou au milieu d'un long défilement, deux besoins restent entiers : "où j'en
 * suis ?" et "comment sauter ailleurs sans tout remonter ?" (les sections ne se replient plus,
 * voir `ChapterPage` — ce mécanisme-ci reste nécessaire indépendamment de ça). Comparées et
 * validées avec l'utilisateur via un artefact interactif avant implémentation ("Je prends toutes
 * les options") :
 *
 * - barre de progression (fixe, tout en haut) ;
 * - en-tête de section collant, juste en dessous (numéro + titre de la section actuellement lue) ;
 * - bouton flottant "Sections" (bas, gauche) qui ouvre un tiroir à onglets (Contenu / Exercices /
 *   Vidéos / Ateliers — seuls ceux ayant au moins une entrée sont affichés), chacun listant les
 *   cibles correspondantes du chapitre, validé via un artefact interactif avant implémentation.
 *   L'onglet "Ateliers" (widgets `kind: 'atelier'`, voir `BlockRenderer`) a été ajouté après coup,
 *   sur demande explicite, avec maquette comparée avant implémentation (3 pistes : 4e onglet au
 *   texte raccourci "Ateliers" plutôt que "Simulations" — trop long pour tenir à largeur égale sur
 *   petit écran ; bandeau scrollable ; fusion dans l'onglet Exercices) — la première a été retenue ;
 * - bouton flottant "remonter en haut" (bas, droite), visible seulement après un peu de défilement.
 *
 * Toutes du DOM direct (pas de refs par section) : chaque section est retrouvée par
 * `document.getElementById(section.id)`, le même id que celui posé par `ChapterPage`.
 */
export function LectureAids({ chapter }: { chapter: ChapterContent }) {
  const sections: SectionRepere[] = chapter.sections.map((s) => ({ id: s.id, number: s.number, title: s.title }))
  const generateurs = genererateursDuChapitre(chapter)
  const videos = videosDuChapitre(chapter)
  const ateliers = ateliersDuChapitre(chapter)

  const [progression, setProgression] = useState(0)
  const [indexCourant, setIndexCourant] = useState(0)
  const [enteteVisible, setEnteteVisible] = useState(false)
  const [boutonHautVisible, setBoutonHautVisible] = useState(false)
  const [tiroirOuvert, setTiroirOuvert] = useState(false)
  const [ongletActif, setOngletActif] = useState<Onglet>('contenu')
  const elementsRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    elementsRef.current = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    let frameId = 0
    function mesurer() {
      frameId = 0
      const scrollY = window.scrollY
      const hauteurMax = document.documentElement.scrollHeight - window.innerHeight
      setProgression(hauteurMax > 0 ? Math.min(100, (scrollY / hauteurMax) * 100) : 0)

      const elements = elementsRef.current
      if (elements.length > 0) {
        let idx = 0
        const seuil = scrollY + 72
        elements.forEach((el, i) => {
          if (el.offsetTop <= seuil) idx = i
        })
        setIndexCourant(idx)
        setEnteteVisible(scrollY > elements[0].offsetTop - 80)
      }

      setBoutonHautVisible(scrollY > 400)
    }

    function onScroll() {
      if (frameId) return
      frameId = requestAnimationFrame(mesurer)
    }

    mesurer()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [chapter.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tiroirOuvert) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setTiroirOuvert(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tiroirOuvert])

  // Arrivée directe sur `#sectionId` (ex. lien "Retour à la section" depuis une page de
  // générateur, voir `EntrainementPage`) : React n'a pas encore peint la section au moment où le
  // navigateur tenterait son ancrage natif — on scrolle nous-mêmes, une fois montés, comme
  // `allerASection` au clic.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    const section = document.getElementById(id)
    if (!section || !section.matches('.chapter-section')) return
    requestAnimationFrame(() => section.scrollIntoView({ block: 'start' }))
  }, [chapter.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (sections.length === 0) return null

  function allerASection(section: SectionRepere) {
    document.getElementById(section.id)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    setTiroirOuvert(false)
  }

  function allerAVideo(video: VideoRepere) {
    document.getElementById(`video-${video.youtubeId}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    setTiroirOuvert(false)
  }

  function allerAAtelier(atelier: AtelierRepere) {
    document.getElementById(`atelier-${atelier.tag}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    setTiroirOuvert(false)
  }

  function remonterEnHaut() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const courante = sections[indexCourant]
  const onglets: { id: Onglet; label: string }[] = [
    { id: 'contenu', label: 'Contenu' },
    ...(generateurs.length > 0 ? [{ id: 'exercices' as const, label: 'Exercices' }] : []),
    ...(videos.length > 0 ? [{ id: 'videos' as const, label: 'Vidéos' }] : []),
    ...(ateliers.length > 0 ? [{ id: 'ateliers' as const, label: 'Ateliers' }] : []),
  ]
  const ongletCourant = onglets.some((o) => o.id === ongletActif) ? ongletActif : 'contenu'

  /** Liste d'un onglet (Contenu/Exercices/Vidéos/Ateliers) — partagée entre le tiroir mobile et le
   * sommaire permanent desktop/tablette (`.chapter-sidebar`, voir `ChapterPage`) : même données,
   * seule la fermeture du tiroir (`fermerApres`) diffère, puisque le sommaire fixe n'a rien à
   * fermer. */
  function rendreListeOnglet(prefixeClasse: 'lecture-sheet' | 'lecture-sidebar', fermerApres: boolean) {
    const onNaviguer = fermerApres ? () => setTiroirOuvert(false) : undefined
    return (
      <>
        {ongletCourant === 'contenu' &&
          sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`${prefixeClasse}-item${i === indexCourant ? ' current' : ''}`}
              onClick={() => allerASection(s)}
            >
              <span className="n">{s.number}</span>
              <span>{s.title}</span>
            </button>
          ))}

        {ongletCourant === 'exercices' &&
          generateurs.map((g, i) => {
            const href = generatorLink(g.chantier, g.generatorId)
            const migre = estGenerateurMigre(g.chantier, g.generatorId)
            const contenu = (
              <>
                <span className="lecture-sheet-exercice-id">{g.generatorId}</span>
                <span className="lecture-sheet-item-texte">
                  <span>{g.title}</span>
                  <span className="lecture-sheet-item-section">{g.sectionTitle}</span>
                </span>
                {!migre && (
                  <span className="arrow" aria-hidden="true">
                    ↗
                  </span>
                )}
              </>
            )
            return migre ? (
              <Link key={g.generatorId + i} className={`${prefixeClasse}-item lecture-sheet-item-exercice`} to={href} onClick={onNaviguer}>
                {contenu}
              </Link>
            ) : (
              <a
                key={g.generatorId + i}
                className={`${prefixeClasse}-item lecture-sheet-item-exercice`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNaviguer}
              >
                {contenu}
              </a>
            )
          })}

        {ongletCourant === 'videos' &&
          videos.map((v, i) => (
            <button key={v.youtubeId + i} type="button" className={`${prefixeClasse}-item lecture-sheet-item-video`} onClick={() => allerAVideo(v)}>
              <span className="lecture-sheet-video-icon" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span>{v.title}</span>
            </button>
          ))}

        {ongletCourant === 'ateliers' &&
          ateliers.map((a, i) => (
            <button key={a.tag + i} type="button" className={`${prefixeClasse}-item lecture-sheet-item-atelier`} onClick={() => allerAAtelier(a)}>
              <span className="lecture-sheet-atelier-icon" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                  <circle cx="11" cy="17" r="2" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span className="lecture-sheet-item-texte">
                <span>{a.title}</span>
                <span className="lecture-sheet-item-section">{a.sectionTitle}</span>
              </span>
            </button>
          ))}
      </>
    )
  }

  // 4 onglets (avec "Ateliers") ne tiennent plus sur une seule ligne dans le sommaire desktop/
  // tablette, large de 240px (.chapter-sidebar) — contrairement au tiroir mobile, nettement plus
  // large (354px+), où 4 onglets en largeur égale continuent de tenir sans accroc (vérifié par
  // capture d'écran à 390px et 360px). `.lecture-sheet-tabs-wrap` ne change donc que le rendu du
  // sommaire fixe (voir la règle CSS `.chapter-sidebar .lecture-sheet-tabs-wrap`), repliant les 4
  // pastilles en grille 2×2 — jamais le cas à 3 onglets ou moins, qui continue de tenir sur une
  // seule ligne telle quelle.
  const ongletsNav = onglets.length > 1 && (
    <div className={`lecture-sheet-tabs${onglets.length > 3 ? ' lecture-sheet-tabs-wrap' : ''}`} role="tablist">
      {onglets.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={ongletCourant === o.id}
          className={`lecture-sheet-tab${ongletCourant === o.id ? ' active' : ''}`}
          onClick={() => setOngletActif(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <div className="lecture-progress no-export" aria-hidden="true">
        <div className="lecture-progress-fill" style={{ width: `${progression}%` }} />
      </div>

      <div className={`lecture-sticky-head no-export${enteteVisible ? ' visible' : ''}`} aria-hidden={!enteteVisible}>
        <span className="num">{courante.number}</span>
        <span>{courante.title}</span>
      </div>

      <button
        type="button"
        className="lecture-fab-toc no-export"
        onClick={() => setTiroirOuvert(true)}
        aria-haspopup="dialog"
        aria-expanded={tiroirOuvert}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="14" y2="18" />
        </svg>
        Sections
      </button>

      <button
        type="button"
        className={`lecture-fab-top no-export${boutonHautVisible ? ' visible' : ''}`}
        onClick={remonterEnHaut}
        aria-label="Remonter en haut du chapitre"
        tabIndex={boutonHautVisible ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>

      <div
        className={`lecture-sheet no-export${tiroirOuvert ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Aller à un endroit du chapitre"
        onClick={(e) => {
          if (e.target === e.currentTarget) setTiroirOuvert(false)
        }}
      >
        <div className="lecture-sheet-body">
          <p className="lecture-sheet-title">Ce chapitre</p>
          {ongletsNav}
          {rendreListeOnglet('lecture-sheet', true)}
          <button type="button" className="lecture-sheet-close" onClick={() => setTiroirOuvert(false)}>
            Fermer
          </button>
        </div>
      </div>

      {/* Sommaire permanent, à côté du texte — tablette/PC uniquement (voir `.chapter-layout` dans
          index.css, qui bascule entre ce sommaire fixe et le tiroir ci-dessus selon la largeur
          d'écran). Rendu dans l'arbre React en permanence, affichage géré en CSS pur : même
          principe que le tiroir/les boutons flottants ci-dessus, jamais un second montage/démontage
          conditionnel en JS qui dupliquerait la logique de bascule. */}
      <aside className="chapter-sidebar no-export">
        <p className="lecture-sheet-title">Ce chapitre</p>
        {ongletsNav}
        <div className="lecture-sidebar-list">{rendreListeOnglet('lecture-sidebar', false)}</div>
      </aside>
    </>
  )
}

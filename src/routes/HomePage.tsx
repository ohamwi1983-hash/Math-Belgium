import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { LEVELS, type LevelEntry } from '../content/chaptersIndex'
import type { ChapterContent } from '../content/types'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { lireDernieresEtapes, lireParcours, titreCourt, type DerniereEtape, type EtatParcours } from '../lib/parcoursChapitre'
import { ATTRIBUT_ANNEE, anneeDeDepart, ecrireAnneeChoisie } from '../lib/anneeAccueil'

/** Teinte par niveau — réutilise les jetons déjà dédiés au codage couleur des diagrammes
 * (`--accent`/`--sky`/`--plan`, voir `index.css`), jamais une couleur inventée pour l'occasion. */
const LEVEL_TONE = ['accent', 'sky', 'plan'] as const

const BASE_URL = 'https://math-belgium.vercel.app'

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

/**
 * Ce que l'accueil montre selon l'année, en CSS seulement (règles générées depuis `LEVELS`, donc
 * présentes dans la page pré-rendue) : sans année (`<html>` sans `data-annee-accueil`), les cartes
 * « Tu es en… » ; avec une année, ses onglets, son titre et SES chapitres. Les trois années restent
 * dans le DOM (liens des 24 chapitres dans le HTML pré-rendu, pour les moteurs de recherche).
 */
const REGLES_ANNEES = [
  `html:not([${ATTRIBUT_ANNEE}]) .accueil-avec-annee{display:none}`,
  `html[${ATTRIBUT_ANNEE}] .annees-choix{display:none}`,
  ...LEVELS.map((l) => `html:not([${ATTRIBUT_ANNEE}="${l.slug}"]) [data-annee-bloc="${l.slug}"]{display:none}`),
  // Avant le chargement du JS (attribut posé par `index.html`) : l'onglet de l'année déjà marqué.
  ...LEVELS.map((l) => `html[${ATTRIBUT_ANNEE}="${l.slug}"] .onglet-annee[data-niveau="${l.slug}"]{background:var(--ink);color:var(--surface)}`),
].join('\n')

interface EtatChapitre {
  chapter: ChapterContent
  etat: EtatParcours
  total: number
  lues: number
  termine: boolean
  commence: boolean
  courant: boolean
}

interface Reprise {
  chapter: ChapterContent
  numero: number
  titre: string
  href: string
  lues: number
  total: number
}

/** Progression de chaque chapitre (lue dans le navigateur) et étape à reprendre de chaque année. */
function lireProgression(): { chapitres: Record<string, EtatChapitre[]>; reprises: Record<string, Reprise | null> } {
  const dernieres = lireDernieresEtapes()
  const chapitres: Record<string, EtatChapitre[]> = {}
  const reprises: Record<string, Reprise | null> = {}
  for (const level of LEVELS) {
    const d: DerniereEtape | undefined = dernieres[level.slug]
    reprises[level.slug] = null
    chapitres[level.slug] = level.chapters.map((chapter) => {
      const etat = lireParcours(chapter)
      const total = chapter.sections.length
      const lues = etat.lues.length
      const section = d && d.chapitre === chapter.slug ? chapter.sections.find((s) => s.id === d.section) : undefined
      if (section) {
        reprises[level.slug] = {
          chapter,
          numero: section.number,
          titre: titreCourt(section),
          href: `/${level.slug}/${chapter.slug}#${encodeURIComponent(section.id)}`,
          lues,
          total,
        }
      }
      return { chapter, etat, total, lues, termine: total > 0 && lues === total, commence: lues > 0 || etat.derniere !== null, courant: !!section }
    })
  }
  return { chapitres, reprises }
}

function Barre({ valeur, total, ton }: { valeur: number; total: number; ton?: 'courant' }) {
  return (
    <span className={`accueil-barre${ton ? ` ${ton}` : ''}`} aria-hidden="true">
      <span style={{ width: `${total ? (100 * valeur) / total : 0}%` }} />
    </span>
  )
}

const Coche = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5 9-10" />
  </svg>
)

/** Bandeau sombre « Reprendre » : dernière étape ouverte de l'année. */
function BandeauReprendre({ reprise }: { reprise: Reprise }) {
  return (
    <Link className="accueil-reprendre" to={reprise.href}>
      <span className="reprendre-corps">
        <span className="reprendre-sur">Reprendre</span>
        <span className="reprendre-chapitre">{reprise.chapter.title}</span>
        <span className="reprendre-etape">
          Étape {reprise.numero} · {reprise.titre}
        </span>
        <span className="reprendre-progression">
          <Barre valeur={reprise.lues} total={reprise.total} ton="courant" />
          <span>
            {reprise.lues} / {reprise.total}
            <span className="sr-only"> étapes comprises</span>
          </span>
        </span>
      </span>
      <span className="reprendre-bouton" aria-hidden="true">
        Continuer ›
      </span>
    </Link>
  )
}

/** « Préparer mon interro » : l'assistant élève, sur le chapitre en cours s'il y en a un
 * (`/{niveau}/{chapitre}/exercices`, page verrouillée sur ce chapitre), sinon `/exercice?niveau=…`
 * (l'assistant présélectionne l'année de l'onglet). */
function CartePreparer({ reprise, niveau }: { reprise: Reprise | null; niveau: string }) {
  const href = reprise ? `/${reprise.chapter.levelSlug}/${reprise.chapter.slug}/exercices` : `/exercice?niveau=${encodeURIComponent(niveau)}`
  return (
    <Link className="accueil-preparer" to={href}>
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l2 2 4-4" />
        <rect x="4" y="3" width="16" height="18" rx="2" />
      </svg>
      <span className="preparer-corps">
        <span className="preparer-titre">Préparer mon interro</span>
        <span className="preparer-desc">
          {reprise ? <>Feuille d'exercices ou évaluation blanche sur « {reprise.chapter.title} ».</> : <>Feuille d'exercices ou évaluation blanche, sur le chapitre et les notions annoncés.</>}
        </span>
      </span>
      <span className="accueil-chevron" aria-hidden="true">
        ›
      </span>
    </Link>
  )
}

/** « Mon suivi » (`/suivi`, planche 13) : étapes comprises, essais des générateurs, cartes et plan de
 * révision de l'année — tout lu dans ce navigateur, rien d'envoyé. */
function CarteSuivi({ niveau }: { niveau: string }) {
  return (
    <Link className="accueil-preparer accueil-suivi" to={`/suivi?niveau=${encodeURIComponent(niveau)}`}>
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
      <span className="preparer-corps">
        <span className="preparer-titre">Mon suivi</span>
        <span className="preparer-desc">Ce que tu as compris, tes exercices, ton plan de révision. Gardé sur cet appareil.</span>
      </span>
      <span className="accueil-chevron" aria-hidden="true">
        ›
      </span>
    </Link>
  )
}

function ListeChapitres({ level, etats }: { level: LevelEntry; etats: EtatChapitre[] }) {
  return (
    <ul className="accueil-chapitres">
      {etats.map(({ chapter, total, lues, termine, commence, courant }) => (
        <li key={chapter.slug}>
          <Link className={`accueil-chapitre${courant ? ' courant' : ''}${termine ? ' termine' : ''}`} to={`/${level.slug}/${chapter.slug}`}>
            <span className="chapitre-pastille" aria-hidden="true">
              {termine ? <Coche /> : chapter.chapterNumber}
            </span>
            <span className="chapitre-corps">
              <span className="chapitre-tete">
                <span className="chapitre-num">Chapitre {chapter.chapterNumber}</span>
                {(termine || commence) && <span className={`chapitre-pill${termine ? ' termine' : ''}`}>{termine ? 'terminé' : 'en cours'}</span>}
              </span>
              <span className="chapitre-titre">{chapter.title}</span>
              <span className="chapitre-etat">
                {commence && <Barre valeur={lues} total={total} ton={courant && !termine ? 'courant' : undefined} />}
                <span className="chapitre-compte">
                  {termine ? (
                    <>
                      <span className="compte-telephone">chapitre terminé</span>
                      <span className="compte-ordi">
                        {total} / {total} étapes
                      </span>
                    </>
                  ) : commence ? (
                    `${lues} / ${total} étapes`
                  ) : (
                    pluriel(total, 'étape')
                  )}
                </span>
              </span>
            </span>
            <span className="accueil-chevron" aria-hidden="true">
              ›
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * Page d'accueil « Mon année d'abord » (maquettes A, décision de l'utilisateur du 22/11/2026) :
 * l'élève choisit son année une fois (mémorisée dans son navigateur), puis voit « Reprendre »
 * (dernière étape ouverte de cette année), « Préparer mon interro » et SES chapitres avec leur
 * progression — celle des pages de chapitre (`lib/parcoursChapitre.ts`), jamais envoyée.
 */
export function HomePage() {
  useDocumentMeta({
    title: 'Chapitres de maths — FWB',
    description:
      'Chapitres de cours de mathématiques narratifs pour la 4e, 5e et 6e (FWB), avec liens directs vers des exercices interactifs auto-corrigés.',
    path: '/',
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Chapitres de maths — FWB',
      description:
        'Chapitres de cours de mathématiques narratifs pour la 4e, 5e et 6e (FWB), avec liens directs vers des exercices interactifs auto-corrigés.',
      url: BASE_URL,
      inLanguage: 'fr-BE',
    },
  })

  const [annee, setAnnee] = useState<string | null>(anneeDeDepart)
  const { chapitres, reprises } = useMemo(lireProgression, [])
  const onglets = useRef<(HTMLButtonElement | null)[]>([])
  const ongletAFocaliser = useRef<number>(-1)

  // L'année décide en CSS de ce qui est montré (voir `REGLES_ANNEES`) ; l'onglet choisi au clavier
  // (ou depuis une carte « Tu es en… ») reçoit le focus une fois visible.
  useLayoutEffect(() => {
    const racine = document.documentElement
    if (annee) racine.setAttribute(ATTRIBUT_ANNEE, annee)
    else racine.removeAttribute(ATTRIBUT_ANNEE)
    if (ongletAFocaliser.current >= 0) {
      onglets.current[ongletAFocaliser.current]?.focus()
      ongletAFocaliser.current = -1
    }
  }, [annee])

  function choisir(slug: string, focus?: boolean) {
    if (focus) ongletAFocaliser.current = LEVELS.findIndex((l) => l.slug === slug)
    setAnnee(slug)
    ecrireAnneeChoisie(slug)
  }

  function clavierOnglets(e: React.KeyboardEvent, i: number) {
    const n = LEVELS.length
    const cible = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (cible < 0) return
    e.preventDefault()
    choisir(LEVELS[cible].slug, true)
  }

  return (
    <>
      <SiteHeader />
      <style>{REGLES_ANNEES}</style>
      <main className="accueil">
        <div className="accueil-tete">
          <div>
            <p className="accueil-sur">Mathématiques · FWB</p>
            <h1 className="accueil-titre">
              Mes maths
              {LEVELS.map((l) => (
                <span key={l.slug} data-annee-bloc={l.slug}>
                  {' '}
                  de {l.label}
                </span>
              ))}
            </h1>
          </div>
          <div className="annees-onglets accueil-avec-annee" role="tablist" aria-label="Mon année">
            {LEVELS.map((l, i) => (
              <button
                key={l.slug}
                ref={(el) => {
                  onglets.current[i] = el
                }}
                type="button"
                role="tab"
                id={`onglet-annee-${l.slug}`}
                className="onglet-annee"
                data-niveau={l.slug}
                aria-selected={annee === l.slug}
                aria-controls={`annee-${l.slug}`}
                tabIndex={annee === l.slug || (!annee && i === 0) ? 0 : -1}
                onClick={() => choisir(l.slug)}
                onKeyDown={(e) => clavierOnglets(e, i)}
              >
                {l.label}
                <span className="onglet-compte"> · {pluriel(l.chapters.length, 'chapitre')}</span>
              </button>
            ))}
          </div>
        </div>

        <section className="annees-choix" aria-labelledby="titre-choix-annee">
          <h2 id="titre-choix-annee">Tu es en…</h2>
          <p className="choix-aide">Choisis ton année : tu verras tes chapitres et où tu en es. Tu pourras en changer quand tu veux.</p>
          <div className="choix-cartes">
            {LEVELS.map((l, i) => (
              <button
                key={l.slug}
                type="button"
                className="choix-carte"
                style={{ '--annee-c': `var(--${LEVEL_TONE[i] ?? 'accent'})` } as React.CSSProperties}
                onClick={() => choisir(l.slug, true)}
              >
                <span className="choix-nom">{l.label}</span>
                <span className="choix-compte">{pluriel(l.chapters.length, 'chapitre')}</span>
              </button>
            ))}
          </div>
        </section>

        {LEVELS.map((l) => {
          const reprise = reprises[l.slug]
          return (
            <div key={l.slug} className="accueil-annee" id={`annee-${l.slug}`} role="tabpanel" aria-labelledby={`onglet-annee-${l.slug}`} data-annee-bloc={l.slug}>
              <div className="accueil-actions">
                {reprise && <BandeauReprendre reprise={reprise} />}
                <CartePreparer reprise={reprise} niveau={l.slug} />
                <CarteSuivi niveau={l.slug} />
              </div>
              <h2 className="accueil-liste-titre">
                Les {pluriel(l.chapters.length, 'chapitre')} de {l.label}
              </h2>
              {/* Numéros du site = simple repère (décision du 25/11/2026) : le professeur peut suivre un autre ordre. */}
              <p className="accueil-ordre-note">Numérotés dans l'ordre du site : ton professeur peut les voir dans un autre ordre.</p>
              {l.chapters.length === 0 ? <p className="empty-note">Aucun chapitre publié pour l'instant.</p> : <ListeChapitres level={l} etats={chapitres[l.slug]} />}
            </div>
          )
        })}

        <p className="accueil-appareil accueil-avec-annee">Ta progression reste sur cet appareil : rien n'est envoyé.</p>
      </main>
    </>
  )
}

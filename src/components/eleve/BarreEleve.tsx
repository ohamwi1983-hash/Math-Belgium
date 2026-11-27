import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LEVELS, findChapter } from '../../content/chaptersIndex'
import { anneeDeDepart } from '../../lib/anneeAccueil'
import { lireDernieresEtapes } from '../../lib/parcoursChapitre'
import { ROUTE_ENTRAINER, ROUTE_PLAN, lienEntrainer } from '../../lib/guideEleve'
import { IconeEleve, type NomIconeEleve } from './IconesEleve'
import './guideEleve.css'

type Onglet = 'accueil' | 'cours' | 'entrainer' | 'interro'

export function decoder(fragment: string): string {
  try {
    return decodeURIComponent(fragment)
  } catch {
    return fragment
  }
}

/** Page d'un chapitre : `/{niveau}/{chapitre}` d'un niveau connu, chapitre existant. */
function chapitreDe(chemin: string) {
  const m = /^\/([^/]+)\/([^/]+)\/?$/.exec(chemin)
  if (!m || !LEVELS.some((l) => l.slug === m[1])) return null
  return findChapter(m[1], m[2]) ?? null
}

/**
 * Où la barre du bas apparaît (téléphone seulement, CSS < 760 px) : accueil, M'entraîner, Ma progression
 * et le plan, page de classe, carte / Réviser / Exercices d'un chapitre. JAMAIS dans une étape (la barre
 * « ‹ · J'ai compris · › » occupe déjà le bas), dans un générateur (barre [Aide][Valider]), ni dans les
 * pages du professeur.
 */
export function ongletBarreEleve(chemin: string, fragment: string): Onglet | null {
  const c = chemin.replace(/\/+$/, '') || '/'
  if (c === '/') return 'accueil'
  if (c === ROUTE_ENTRAINER) return 'entrainer'
  if (c === '/suivi' || c === ROUTE_PLAN) return 'interro'
  if (c === '/classe') return 'accueil'
  const chapitre = chapitreDe(c)
  if (chapitre) {
    if (fragment === 'projeter' || chapitre.sections.some((s) => s.id === fragment)) return null
    return 'cours'
  }
  return null
}

/** « Cours » : le chapitre affiché, sinon le dernier ouvert de l'année de l'accueil, sinon la liste des chapitres. */
function lienCours(chemin: string): string {
  const ici = chapitreDe(chemin)
  if (ici) return `/${ici.levelSlug}/${ici.slug}`
  const annee = anneeDeDepart()
  const d = annee ? lireDernieresEtapes()[annee] : undefined
  if (annee && d && findChapter(annee, d.chapitre)) return `/${annee}/${d.chapitre}`
  return '/#chapitres'
}

const ONGLETS: { id: Onglet; libelle: string; icone: NomIconeEleve }[] = [
  { id: 'accueil', libelle: 'Accueil', icone: 'accueil' },
  { id: 'cours', libelle: 'Cours', icone: 'cours' },
  { id: 'entrainer', libelle: 'M’entraîner', icone: 'entrainer' },
  { id: 'interro', libelle: 'Mon interro', icone: 'interro' },
]

/**
 * Barre du bas du côté élève sur téléphone (maquette `accueil.png` du 27/11/2026) : Accueil, Cours,
 * M'entraîner, Mon interro. Montée une seule fois (`App.tsx`), elle se décide d'après l'adresse ; rien au
 * pré-rendu (navigation propre au navigateur : « Cours » dépend de la dernière étape ouverte). `<html
 * data-barre-eleve>` réserve la place en bas de page (`guideEleve.css`).
 */
export function HoteBarreEleve() {
  const { pathname, hash } = useLocation()
  const fragment = decoder(hash.slice(1))
  const prerendu = typeof window !== 'undefined' && (window as Window & { __prerendu?: boolean }).__prerendu
  const actif = prerendu ? null : ongletBarreEleve(pathname, fragment)

  useEffect(() => {
    const racine = document.documentElement
    if (actif) racine.setAttribute('data-barre-eleve', '')
    else racine.removeAttribute('data-barre-eleve')
    return () => racine.removeAttribute('data-barre-eleve')
  }, [actif])

  if (!actif) return null
  const niveau = chapitreDe(pathname)?.levelSlug ?? anneeDeDepart()
  const chapitre = chapitreDe(pathname)?.slug
  const liens: Record<Onglet, string> = { accueil: '/', cours: lienCours(pathname), entrainer: lienEntrainer(niveau, chapitre), interro: ROUTE_PLAN }
  return (
    <nav className="ge-barre no-export" aria-label="Navigation de l’élève">
      {ONGLETS.map((o) => (
        <Link key={o.id} to={liens[o.id]} className={`ge-barre-lien${o.id === actif ? ' actif' : ''}`} aria-current={o.id === actif ? 'page' : undefined}>
          <IconeEleve nom={o.icone} />
          <span>{o.libelle}</span>
        </Link>
      ))}
    </nav>
  )
}

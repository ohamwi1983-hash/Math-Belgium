import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { Classe } from '../../lib/carnet'
import { useCompte } from '../../lib/compteContexte'
import { couleurClasse } from '../carnet/contexteCarnet'

/** Ce que le carnet donne au menu (pages `/carnet/*` seulement) : classes, séances par classe,
 * créneaux d'aujourd'hui à noter. */
export interface MenuCarnetDonnees {
  classes: Classe[]
  nombreSeances: (id: string) => number
  aNoter: number
}

const SOUS_PAGES_PLUS = ['/carnet/agenda', '/carnet/horaire', '/carnet/reglages']

/**
 * Menu UNIQUE « Mon espace » des pages professeur : profil, coffre, administration, carnet de
 * matière vue (`/carnet/*`, qui n'a plus de second menu), feuilles d'exercices et évaluations
 * (professeur connecté). Classes CSS du carnet (`carnet.css`) + `espace-*` (`profil.css`), à
 * importer par la page. Lien actif : `aria-current="page"` (NavLink).
 *
 * Ordinateur (≥ 760 px) : colonne de gauche — Mon profil · Carnet de matière vue · Feuilles
 * d'exercices · Évaluations et examens · Mon coffre, puis, à part, Administration (admin) et Se
 * déconnecter. « Carnet de matière vue » se DÉPLIE (bouton `aria-expanded`) : Aujourd'hui (« n à
 * noter ») · Ma semaine · Mes classes (une entrée par classe, couleur et nombre de séances, + Ajouter
 * une classe) · Agenda d'une période · Mon horaire · Réglages. Déplié d'office dans le carnet,
 * replié ailleurs (déplié à la main hors du carnet : « Mes classes » au lieu de la liste, que seule
 * la page du carnet charge). `compact` (pages de conception, qui ont besoin de largeur) : de 760 à
 * 1 359 px, colonne d'icônes (libellés lus par les lecteurs d'écran et en `title`).
 *
 * Téléphone (< 760 px) : UNE barre fixe en bas. Dans le carnet : Aujourd'hui · Semaine · Classes ·
 * Plus (« Plus » = Agenda, Mon horaire, Réglages, puis le reste de l'espace). Ailleurs : Carnet ·
 * Feuilles · Coffre · Profil · Plus (Évaluations et examens, Administration, Se déconnecter).
 * Les listes s'ouvrent au-dessus de la barre (Échap ou clic à côté pour fermer).
 */
export function MenuEspace({ children, carnet, compact = false }: { children: ReactNode; carnet?: MenuCarnetDonnees; compact?: boolean }) {
  const id = useId()
  const compte = useCompte()
  const navigate = useNavigate()
  const location = useLocation()
  const chemin = location.pathname.replace(/\/+$/, '')
  const dansCarnet = chemin === '/carnet' || chemin.startsWith('/carnet/')
  const [feuille, setFeuille] = useState<'classes' | 'plus' | null>(null)
  const [carnetOuvert, setCarnetOuvert] = useState(dansCarnet)
  const barre = useRef<HTMLElement>(null)
  const admin = compte.profil?.est_admin === true

  useEffect(() => setCarnetOuvert(dansCarnet), [dansCarnet])

  // Changement de page : la liste du bas se referme. Dans le carnet (comme son ancien menu) :
  // défilement en haut, ou vers l'ancre demandée.
  useEffect(() => {
    setFeuille(null)
    if (!dansCarnet) return
    if (location.hash) {
      const cible = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (cible) {
        requestAnimationFrame(() => cible.scrollIntoView({ block: 'start' }))
        return
      }
    }
    window.scrollTo({ top: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement au changement d'adresse
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!feuille) return
    const dehors = (e: PointerEvent) => {
      if (!barre.current?.contains(e.target as Node)) setFeuille(null)
    }
    const echap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFeuille(null)
        barre.current?.querySelector<HTMLButtonElement>(`[aria-controls="${id}-${feuille}"]`)?.focus()
      }
    }
    document.addEventListener('pointerdown', dehors)
    document.addEventListener('keydown', echap)
    return () => {
      document.removeEventListener('pointerdown', dehors)
      document.removeEventListener('keydown', echap)
    }
  }, [feuille, id])

  const seDeconnecter = () => {
    setFeuille(null)
    void compte.seDeconnecter().then(() => navigate('/'))
  }

  const titre = (libelle: string) => (compact ? { title: libelle } : {})
  const lien = (to: string, libelle: string, icone: ReactNode, end = false) => (
    <NavLink to={to} end={end} className="carnet-menu-lien" {...titre(libelle)}>
      <span className="espace-menu-texte">
        {icone}
        <span className="espace-menu-libelle">{libelle}</span>
      </span>
    </NavLink>
  )
  const boutonDeconnexion = (
    <button type="button" className="carnet-menu-lien espace-menu-bouton" onClick={seDeconnecter} disabled={!compte.client} {...titre('Se déconnecter')}>
      <IconeSortie />
      <span className="espace-menu-libelle">Se déconnecter</span>
    </button>
  )
  const lienClasse = (c: Classe, classes: Classe[], nombre: number) => (
    <NavLink to={`/carnet/classe/${c.id}`} className="carnet-menu-lien">
      <span className="carnet-menu-classe">
        <span className={`carnet-point carnet-c${couleurClasse(classes, c.id)}`} aria-hidden="true" />
        {c.nom}
      </span>
      <span className="carnet-menu-compte">
        {nombre}
        <span className="carnet-sr"> séances</span>
      </span>
    </NavLink>
  )
  const ajouterClasse = (
    <NavLink to="/carnet/classes" className="carnet-menu-lien carnet-menu-ajout">
      + Ajouter une classe
    </NavLink>
  )
  const aNoter = carnet?.aNoter ?? 0
  const lienAujourdhui = (
    <NavLink to="/carnet" end className="carnet-menu-lien">
      Aujourd'hui
      {aNoter > 0 && <span className="carnet-menu-compte">{aNoter} à noter</span>}
    </NavLink>
  )
  const liensCarnetRares = (
    <>
      <li>
        <NavLink to="/carnet/agenda" className="carnet-menu-lien">
          Agenda d'une période
        </NavLink>
      </li>
      <li>
        <NavLink to="/carnet/horaire" className="carnet-menu-lien">
          Mon horaire
        </NavLink>
      </li>
      <li>
        <NavLink to="/carnet/reglages" className="carnet-menu-lien">
          Réglages
        </NavLink>
      </li>
    </>
  )

  const sousMenuCarnet = (
    <div className="espace-sous-menu" id={`${id}-carnet`}>
      <ul>
        <li>{lienAujourdhui}</li>
        <li>
          <NavLink to="/carnet/semaine" className="carnet-menu-lien">
            Ma semaine
          </NavLink>
        </li>
        {!carnet && (
          <li>
            <NavLink to="/carnet/classes" className="carnet-menu-lien">
              Mes classes
            </NavLink>
          </li>
        )}
      </ul>
      {carnet && (
        <>
          <p className="carnet-menu-groupe" id={`${id}-classes`}>
            Mes classes
          </p>
          <ul aria-labelledby={`${id}-classes`}>
            {carnet.classes.map((c) => (
              <li key={c.id}>{lienClasse(c, carnet.classes, carnet.nombreSeances(c.id))}</li>
            ))}
            <li>{ajouterClasse}</li>
          </ul>
        </>
      )}
      <ul className="espace-sous-menu-rare">{liensCarnetRares}</ul>
    </div>
  )

  const surClasse = chemin.startsWith('/carnet/classe')
  const surPlus = SOUS_PAGES_PLUS.includes(chemin)
  const boutonFeuille = (quoi: 'classes' | 'plus', libelle: string, icone: ReactNode, actif: boolean) => (
    <button
      type="button"
      className={`carnet-barre-bouton${actif ? ' active' : ''}`}
      aria-expanded={feuille === quoi}
      aria-controls={`${id}-${quoi}`}
      onClick={() => setFeuille(feuille === quoi ? null : quoi)}
    >
      {icone}
      {libelle}
    </button>
  )

  return (
    <div className={`carnet-cadre espace-cadre${compact ? ' compact' : ''}`}>
      <nav className="carnet-menu espace-menu" aria-label="Mon espace">
        <p className="espace-menu-titre">Mon espace</p>
        <ul>
          <li>{lien('/profil', 'Mon profil', <IconeProfil />, true)}</li>
          <li className="espace-menu-carnet">
            <div className="espace-menu-ligne">
              <Link to="/carnet" className={`carnet-menu-lien espace-menu-parent${dansCarnet ? ' ouvert' : ''}`} {...titre('Carnet de matière vue')}>
                <span className="espace-menu-texte">
                  <IconeCarnet />
                  <span className="espace-menu-libelle">Carnet de matière vue</span>
                </span>
              </Link>
              <button
                type="button"
                className="espace-menu-deplier"
                aria-expanded={carnetOuvert}
                aria-controls={`${id}-carnet`}
                aria-label={carnetOuvert ? 'Replier le carnet' : 'Déplier le carnet'}
                onClick={() => setCarnetOuvert(!carnetOuvert)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
            {carnetOuvert && sousMenuCarnet}
          </li>
          <li>{lien('/exercice', "Feuilles d'exercices", <IconeFeuille />)}</li>
          <li>{lien('/evaluation', 'Évaluations et examens', <IconeEvaluation />)}</li>
          <li>{lien('/coffre', 'Mon coffre', <IconeCoffre />)}</li>
        </ul>
        <ul className="carnet-menu-rare">
          {admin && <li>{lien('/admin', 'Administration', <IconeAdmin />)}</li>}
          <li>{boutonDeconnexion}</li>
        </ul>
      </nav>

      <div className="carnet-contenu">{children}</div>

      <nav className="carnet-barre-bas" aria-label="Mon espace" ref={barre}>
        {feuille === 'classes' && carnet && (
          <ul className="carnet-feuille" id={`${id}-classes`}>
            {carnet.classes.map((c) => (
              <li key={c.id}>{lienClasse(c, carnet.classes, carnet.nombreSeances(c.id))}</li>
            ))}
            <li>{ajouterClasse}</li>
          </ul>
        )}
        {feuille === 'plus' &&
          (dansCarnet ? (
            <ul className="carnet-feuille" id={`${id}-plus`}>
              {liensCarnetRares}
              <li className="espace-feuille-groupe" aria-hidden="true">
                Mon espace
              </li>
              <li>{lien('/profil', 'Mon profil', <IconeProfil />, true)}</li>
              <li>{lien('/coffre', 'Mon coffre', <IconeCoffre />)}</li>
              <li>{lien('/exercice', "Feuilles d'exercices", <IconeFeuille />)}</li>
              <li>{lien('/evaluation', 'Évaluations et examens', <IconeEvaluation />)}</li>
              {admin && <li>{lien('/admin', 'Administration', <IconeAdmin />)}</li>}
              <li>{boutonDeconnexion}</li>
            </ul>
          ) : (
            <ul className="carnet-feuille" id={`${id}-plus`}>
              <li>{lien('/evaluation', 'Évaluations et examens', <IconeEvaluation />)}</li>
              {admin && <li>{lien('/admin', 'Administration', <IconeAdmin />)}</li>}
              <li>{boutonDeconnexion}</li>
            </ul>
          ))}
        {dansCarnet ? (
          <div className="carnet-barre-onglets">
            <NavLink to="/carnet" end className="carnet-barre-bouton">
              <IconeJour />
              Aujourd'hui
              {aNoter > 0 && (
                <span className="carnet-barre-pastille">
                  {aNoter}
                  <span className="carnet-sr"> à noter</span>
                </span>
              )}
            </NavLink>
            <NavLink to="/carnet/semaine" className="carnet-barre-bouton">
              <IconeSemaine />
              Semaine
            </NavLink>
            {carnet ? (
              boutonFeuille('classes', 'Classes', <IconeClasses />, surClasse)
            ) : (
              <NavLink to="/carnet/classes" className="carnet-barre-bouton">
                <IconeClasses />
                Classes
              </NavLink>
            )}
            {boutonFeuille('plus', 'Plus', <IconePlus />, surPlus)}
          </div>
        ) : (
          <div className="carnet-barre-onglets">
            <NavLink to="/carnet" className="carnet-barre-bouton">
              <IconeCarnet mode="barre" />
              Carnet
            </NavLink>
            <NavLink to="/exercice" className="carnet-barre-bouton">
              <IconeFeuille mode="barre" />
              Feuilles
            </NavLink>
            <NavLink to="/coffre" className="carnet-barre-bouton">
              <IconeCoffre mode="barre" />
              Coffre
            </NavLink>
            <NavLink to="/profil" end className="carnet-barre-bouton">
              <IconeProfil mode="barre" />
              Profil
            </NavLink>
            {boutonFeuille('plus', 'Plus', <IconePlus />, false)}
          </div>
        )}
      </nav>
    </div>
  )
}

type ModeIcone = 'menu' | 'barre' | 'bandeau'

function proprietes(mode: ModeIcone) {
  const barre = mode === 'barre'
  const bandeau = mode === 'bandeau'
  return {
    width: bandeau ? 26 : barre ? 22 : 18,
    height: bandeau ? 26 : barre ? 22 : 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: barre ? 1.8 : 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    className: bandeau ? undefined : barre ? 'carnet-barre-icone' : 'espace-menu-icone',
  }
}

function IconeProfil({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

export function IconeCarnet({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

export function IconeFeuille({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  )
}

export function IconeEvaluation({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M9 11l2 2 4-4" />
      <rect x="4" y="3" width="16" height="18" rx="2" />
    </svg>
  )
}

function IconeCoffre({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5h8v2" />
    </svg>
  )
}

function IconeAdmin() {
  return (
    <svg {...proprietes('menu')}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    </svg>
  )
}

function IconeSortie() {
  return (
    <svg {...proprietes('menu')}>
      <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
    </svg>
  )
}

function IconePlus() {
  return (
    <svg {...proprietes('barre')}>
      <circle cx="6" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="18" cy="12" r="1.3" />
    </svg>
  )
}

/* Icônes de la barre du carnet (reprises de l'ancien `MenuCarnet`). */
function IconeJour() {
  return (
    <svg {...proprietes('barre')}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

function IconeSemaine() {
  return (
    <svg {...proprietes('barre')}>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10h17M9 10v10M14.5 10v10M8 3v4M16 3v4" />
    </svg>
  )
}

function IconeClasses() {
  return (
    <svg {...proprietes('barre')}>
      <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z" />
      <path d="M5 16.5a3 3 0 0 1 3-3h11M9 8h6" />
    </svg>
  )
}

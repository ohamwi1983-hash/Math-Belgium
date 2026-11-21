import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { Classe } from '../../lib/carnet'
import { couleurClasse } from './contexteCarnet'

/**
 * Menu du carnet. Ordinateur (≥ 760 px) : colonne de gauche — Aujourd'hui · Ma semaine · Mes classes
 * (une entrée par classe + « Ajouter une classe ») · Agenda d'une période, puis, à part, Mon horaire
 * et Réglages. Téléphone : barre fixe en bas (Aujourd'hui · Semaine · Classes · Plus) ; « Classes »
 * et « Plus » ouvrent une petite liste au-dessus de la barre (Échap ou clic à côté pour fermer).
 * Lien actif : `aria-current="page"` (NavLink).
 */
export function MenuCarnet({ classes, nombreSeances, aNoter, children }: { classes: Classe[]; nombreSeances: (id: string) => number; aNoter: number; children: ReactNode }) {
  const id = useId()
  const location = useLocation()
  const [feuille, setFeuille] = useState<'classes' | 'plus' | null>(null)
  const barre = useRef<HTMLElement>(null)
  const chemin = location.pathname.replace(/\/+$/, '')

  // Changement de page : la feuille se referme ; défilement en haut (ou vers l'ancre demandée).
  useEffect(() => {
    setFeuille(null)
    if (location.hash) {
      const cible = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (cible) {
        requestAnimationFrame(() => cible.scrollIntoView({ block: 'start' }))
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!feuille) return
    const dehors = (e: PointerEvent) => {
      if (!barre.current?.contains(e.target as Node)) setFeuille(null)
    }
    const echap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFeuille(null)
        barre.current?.querySelector<HTMLButtonElement>(`[aria-controls="${id}-${feuille}-feuille"]`)?.focus()
      }
    }
    document.addEventListener('pointerdown', dehors)
    document.addEventListener('keydown', echap)
    return () => {
      document.removeEventListener('pointerdown', dehors)
      document.removeEventListener('keydown', echap)
    }
  }, [feuille, id])

  const lienClasse = (c: Classe) => (
    <NavLink to={`/carnet/classe/${c.id}`} className="carnet-menu-lien">
      <span className="carnet-menu-classe">
        <span className={`carnet-point carnet-c${couleurClasse(classes, c.id)}`} aria-hidden="true" />
        {c.nom}
      </span>
      <span className="carnet-menu-compte">
        {nombreSeances(c.id)}
        <span className="carnet-sr"> séances</span>
      </span>
    </NavLink>
  )

  const surClasse = chemin.startsWith('/carnet/classe')
  const surPlus = ['/carnet/agenda', '/carnet/horaire', '/carnet/reglages'].includes(chemin)

  return (
    <div className="carnet-cadre">
      <nav className="carnet-menu" aria-label="Carnet">
        <p className="carnet-menu-titre">Mon carnet</p>
        <ul>
          <li>
            <NavLink to="/carnet" end className="carnet-menu-lien">
              Aujourd'hui
              {aNoter > 0 && <span className="carnet-menu-compte">{aNoter} à noter</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/carnet/semaine" className="carnet-menu-lien">
              Ma semaine
            </NavLink>
          </li>
        </ul>
        <p className="carnet-menu-groupe" id={`${id}-classes`}>
          Mes classes
        </p>
        <ul aria-labelledby={`${id}-classes`}>
          {classes.map((c) => (
            <li key={c.id}>{lienClasse(c)}</li>
          ))}
          <li>
            <NavLink to="/carnet/classes" className="carnet-menu-lien carnet-menu-ajout">
              + Ajouter une classe
            </NavLink>
          </li>
        </ul>
        <p className="carnet-menu-groupe" id={`${id}-docs`}>
          Documents
        </p>
        <ul aria-labelledby={`${id}-docs`}>
          <li>
            <NavLink to="/carnet/agenda" className="carnet-menu-lien">
              Agenda d'une période
            </NavLink>
          </li>
        </ul>
        <ul className="carnet-menu-rare">
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
        </ul>
      </nav>

      <div className="carnet-contenu">{children}</div>

      <nav className="carnet-barre-bas" aria-label="Carnet" ref={barre}>
        {feuille === 'classes' && (
          <ul className="carnet-feuille" id={`${id}-classes-feuille`}>
            {classes.map((c) => (
              <li key={c.id}>{lienClasse(c)}</li>
            ))}
            <li>
              <NavLink to="/carnet/classes" className="carnet-menu-lien carnet-menu-ajout">
                + Ajouter une classe
              </NavLink>
            </li>
          </ul>
        )}
        {feuille === 'plus' && (
          <ul className="carnet-feuille" id={`${id}-plus-feuille`}>
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
          </ul>
        )}
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
          <button
            type="button"
            className={`carnet-barre-bouton${surClasse ? ' active' : ''}`}
            aria-expanded={feuille === 'classes'}
            aria-controls={feuille === 'classes' ? `${id}-classes-feuille` : undefined}
            onClick={() => setFeuille(feuille === 'classes' ? null : 'classes')}
          >
            <IconeClasses />
            Classes
          </button>
          <button
            type="button"
            className={`carnet-barre-bouton${surPlus ? ' active' : ''}`}
            aria-expanded={feuille === 'plus'}
            aria-controls={feuille === 'plus' ? `${id}-plus-feuille` : undefined}
            onClick={() => setFeuille(feuille === 'plus' ? null : 'plus')}
          >
            <IconePlus />
            Plus
          </button>
        </div>
      </nav>
    </div>
  )
}

const svg = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  className: 'carnet-barre-icone',
}

function IconeJour() {
  return (
    <svg {...svg}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

function IconeSemaine() {
  return (
    <svg {...svg}>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10h17M9 10v10M14.5 10v10M8 3v4M16 3v4" />
    </svg>
  )
}

function IconeClasses() {
  return (
    <svg {...svg}>
      <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z" />
      <path d="M5 16.5a3 3 0 0 1 3-3h11M9 8h6" />
    </svg>
  )
}

function IconePlus() {
  return (
    <svg {...svg}>
      <circle cx="6" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="18" cy="12" r="1.3" />
    </svg>
  )
}

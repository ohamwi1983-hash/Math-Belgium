import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCompte } from '../../lib/compteContexte'

/**
 * Menu « Mon espace » des pages professeur (aujourd'hui : « Mon profil »). Même rendu que le menu du
 * carnet (`components/carnet/MenuCarnet.tsx`) : il réutilise ses classes CSS (`carnet.css`, à importer
 * par la page) — les deux menus pourront être unifiés plus tard.
 * Ordinateur (≥ 760 px) : colonne de gauche — Mon profil · Carnet de matière vue · Feuilles
 * d'exercices · Évaluations et examens · Mon coffre, puis, à part, Administration (admin seulement)
 * et Se déconnecter. Téléphone : barre fixe en bas (Carnet · Feuilles · Coffre · Profil · Plus) ;
 * « Plus » ouvre une petite liste au-dessus de la barre (Évaluations et examens, Administration,
 * Se déconnecter ; Échap ou clic à côté pour fermer). Lien actif : `aria-current="page"` (NavLink).
 */
export function MenuEspace({ children }: { children: ReactNode }) {
  const id = useId()
  const compte = useCompte()
  const navigate = useNavigate()
  const location = useLocation()
  const [plus, setPlus] = useState(false)
  const barre = useRef<HTMLElement>(null)
  const admin = compte.profil?.est_admin === true

  useEffect(() => setPlus(false), [location.pathname])

  useEffect(() => {
    if (!plus) return
    const dehors = (e: PointerEvent) => {
      if (!barre.current?.contains(e.target as Node)) setPlus(false)
    }
    const echap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPlus(false)
        barre.current?.querySelector<HTMLButtonElement>(`[aria-controls="${id}-plus"]`)?.focus()
      }
    }
    document.addEventListener('pointerdown', dehors)
    document.addEventListener('keydown', echap)
    return () => {
      document.removeEventListener('pointerdown', dehors)
      document.removeEventListener('keydown', echap)
    }
  }, [plus, id])

  const seDeconnecter = () => {
    setPlus(false)
    void compte.seDeconnecter().then(() => navigate('/'))
  }

  const boutonDeconnexion = (
    <button type="button" className="carnet-menu-lien espace-menu-bouton" onClick={seDeconnecter} disabled={!compte.client}>
      <IconeSortie />
      Se déconnecter
    </button>
  )

  return (
    <div className="carnet-cadre espace-cadre">
      <nav className="carnet-menu espace-menu" aria-label="Mon espace">
        <p className="espace-menu-titre">Mon espace</p>
        <ul>
          <li>
            <NavLink to="/profil" end className="carnet-menu-lien">
              <span className="espace-menu-texte">
                <IconeProfil />
                Mon profil
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/carnet" className="carnet-menu-lien">
              <span className="espace-menu-texte">
                <IconeCarnet />
                Carnet de matière vue
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/exercice" className="carnet-menu-lien">
              <span className="espace-menu-texte">
                <IconeFeuille />
                Feuilles d'exercices
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/evaluation" className="carnet-menu-lien">
              <span className="espace-menu-texte">
                <IconeEvaluation />
                Évaluations et examens
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/coffre" className="carnet-menu-lien">
              <span className="espace-menu-texte">
                <IconeCoffre />
                Mon coffre
              </span>
            </NavLink>
          </li>
        </ul>
        <ul className="carnet-menu-rare">
          {admin && (
            <li>
              <NavLink to="/admin" className="carnet-menu-lien">
                <span className="espace-menu-texte">
                  <IconeAdmin />
                  Administration
                </span>
              </NavLink>
            </li>
          )}
          <li>{boutonDeconnexion}</li>
        </ul>
      </nav>

      <div className="carnet-contenu">{children}</div>

      <nav className="carnet-barre-bas" aria-label="Mon espace" ref={barre}>
        {plus && (
          <ul className="carnet-feuille" id={`${id}-plus`}>
            <li>
              <NavLink to="/evaluation" className="carnet-menu-lien">
                <span className="espace-menu-texte">
                  <IconeEvaluation />
                  Évaluations et examens
                </span>
              </NavLink>
            </li>
            {admin && (
              <li>
                <NavLink to="/admin" className="carnet-menu-lien">
                  <span className="espace-menu-texte">
                    <IconeAdmin />
                    Administration
                  </span>
                </NavLink>
              </li>
            )}
            <li>{boutonDeconnexion}</li>
          </ul>
        )}
        <div className="carnet-barre-onglets">
          <NavLink to="/carnet" className="carnet-barre-bouton">
            <IconeCarnet barre />
            Carnet
          </NavLink>
          <NavLink to="/exercice" className="carnet-barre-bouton">
            <IconeFeuille barre />
            Feuilles
          </NavLink>
          <NavLink to="/coffre" className="carnet-barre-bouton">
            <IconeCoffre barre />
            Coffre
          </NavLink>
          <NavLink to="/profil" end className="carnet-barre-bouton">
            <IconeProfil barre />
            Profil
          </NavLink>
          <button type="button" className="carnet-barre-bouton" aria-expanded={plus} aria-controls={`${id}-plus`} onClick={() => setPlus(!plus)}>
            <IconePlus />
            Plus
          </button>
        </div>
      </nav>
    </div>
  )
}

function proprietes(barre: boolean) {
  return {
    width: barre ? 22 : 18,
    height: barre ? 22 : 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: barre ? 1.8 : 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    className: barre ? 'carnet-barre-icone' : 'espace-menu-icone',
  }
}

function IconeProfil({ barre = false }: { barre?: boolean }) {
  return (
    <svg {...proprietes(barre)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

function IconeCarnet({ barre = false }: { barre?: boolean }) {
  return (
    <svg {...proprietes(barre)}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

function IconeFeuille({ barre = false }: { barre?: boolean }) {
  return (
    <svg {...proprietes(barre)}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  )
}

function IconeEvaluation({ barre = false }: { barre?: boolean }) {
  return (
    <svg {...proprietes(barre)}>
      <path d="M9 11l2 2 4-4" />
      <rect x="4" y="3" width="16" height="18" rx="2" />
    </svg>
  )
}

function IconeCoffre({ barre = false }: { barre?: boolean }) {
  return (
    <svg {...proprietes(barre)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5h8v2" />
    </svg>
  )
}

function IconeAdmin() {
  return (
    <svg {...proprietes(false)}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    </svg>
  )
}

function IconeSortie() {
  return (
    <svg {...proprietes(false)}>
      <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
    </svg>
  )
}

function IconePlus() {
  return (
    <svg {...proprietes(true)}>
      <circle cx="6" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="18" cy="12" r="1.3" />
    </svg>
  )
}

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCompte } from '../../lib/compteContexte'
import { IconeAccueil, IconeAdmin, IconeProfil, IconeRetour, IconeSortie } from './IconesEspace'

/** Téléphone : tiroir par le bas (voile) ; au-delà, liste déroulante ancrée à droite. */
const TELEPHONE = '(max-width: 759px)'

interface Destination {
  to: string
  libelle: string
  icone: ReactNode
  /** « Tu es ici » sur toute page de l'espace professeur (carnet, documents, réglages…). */
  prefixe?: boolean
  badge?: string
}

/**
 * À droite de l'en-tête du site (maquettes « Bannière A » et « Menu A » du 22/11/2026). Rien du tout
 * quand Supabase n'est pas configuré (pages publiques inchangées). Ne charge pas supabase-js : sur une
 * page de cours, le menu s'affiche d'après la présence d'une session stockée.
 * - Visiteur : bouton bordé « Professeur » (icône personne) → `/connexion?retour=<page>` ; absent des
 *   pages de connexion / inscription / mot de passe (il y mènerait sur elles-mêmes).
 * - Connecté : pastille ronde (initiale du nom affiché) + ▾, `aria-label="Mon compte"`. Le menu (réduit le
 *   27/11/2026 : les outils sont dans le menu « Espace professeur » des pages professeur, `MenuEspace`) :
 *   en-tête (initiale, nom), « Espace professeur » (`/espace`, « Tu es ici » sur toute page professeur),
 *   « Retour au site élève », Administration (admin seulement), « Se déconnecter » à part. Téléphone : tiroir par le bas avec
 *   voile (voile, Échap, lien ou glisser vers le bas pour fermer) ; ordinateur : liste déroulante
 *   (clic à côté, Échap, Tab hors du menu). Ouvert : focus sur le premier lien ; fermé par Échap / voile :
 *   focus rendu au bouton.
 */
export function MenuCompte() {
  const compte = useCompte()
  const location = useLocation()
  const navigate = useNavigate()
  const id = useId()
  const [ouvert, setOuvert] = useState(false)
  const racine = useRef<HTMLDivElement>(null)
  const bouton = useRef<HTMLButtonElement>(null)
  const panneau = useRef<HTMLElement>(null)
  const glisse = useRef<{ y: number; dy: number } | null>(null)

  const fermer = (rendreFocus: boolean) => {
    setOuvert(false)
    if (rendreFocus) bouton.current?.focus()
  }

  useEffect(() => {
    if (!ouvert) return
    // Focus sur le premier lien du menu.
    panneau.current?.querySelector<HTMLElement>('a, button')?.focus()
    const dehors = (e: PointerEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false)
    }
    const clavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOuvert(false)
        bouton.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dehors)
    document.addEventListener('keydown', clavier)
    // Tiroir du téléphone : la page dessous ne défile pas.
    const telephone = window.matchMedia(TELEPHONE).matches
    const avant = document.documentElement.style.overflow
    if (telephone) document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('pointerdown', dehors)
      document.removeEventListener('keydown', clavier)
      if (telephone) document.documentElement.style.overflow = avant
    }
  }, [ouvert])

  useEffect(() => setOuvert(false), [location.pathname])

  if (compte.etat === 'indisponible') return null
  const pagesCompte = ['/connexion', '/inscription', '/mot-de-passe']
  if (compte.etat === 'anonyme' || compte.etat === 'inactif') {
    if (pagesCompte.includes(location.pathname)) return null
    const retour = location.pathname === '/' ? '' : `?retour=${encodeURIComponent(location.pathname)}`
    return (
      <Link className="menu-compte-lien" to={`/connexion${retour}`}>
        <IconeProfil mode="compte" />
        Professeur<span className="sr-only"> : me connecter</span>
      </Link>
    )
  }

  const admin = compte.profil?.est_admin === true
  const nom = compte.profil?.nom_affiche?.trim() ?? ''
  const initiale = initialeDe(nom)
  const chemin = location.pathname.replace(/\/+$/, '') || '/'
  // Depuis la réorganisation de l'espace professeur (27/11/2026) : les outils sont dans le menu
  // « Espace professeur » des pages professeur ; la pastille ne garde que l'essentiel.
  const espaceIci = ['/espace', '/carnet', '/coffre', '/profil', '/exercice', '/evaluation', '/partage'].some((d) => chemin === d || chemin.startsWith(`${d}/`)) || /^\/[^/]+\/[^/]+\/exercices$/.test(chemin)
  const liens: Destination[] = [
    { to: '/espace', libelle: 'Espace professeur', icone: <IconeAccueil mode="compte" />, prefixe: true },
    { to: '/', libelle: 'Retour au site élève', icone: <IconeRetour mode="compte" /> },
    ...(admin ? [{ to: '/admin', libelle: 'Administration', icone: <IconeAdmin mode="compte" />, badge: 'admin' }] : []),
  ]

  const debutGlisse = (e: React.TouchEvent) => {
    // Glisser vers le bas pour fermer : seulement quand la liste est tout en haut.
    glisse.current = panneau.current && panneau.current.scrollTop <= 0 ? { y: e.touches[0].clientY, dy: 0 } : null
  }
  const suiteGlisse = (e: React.TouchEvent) => {
    if (!glisse.current || !panneau.current) return
    const dy = Math.max(0, e.touches[0].clientY - glisse.current.y)
    glisse.current.dy = dy
    panneau.current.style.transform = dy > 0 ? `translateY(${dy}px)` : ''
  }
  const finGlisse = () => {
    if (!glisse.current || !panneau.current) return
    const { dy } = glisse.current
    glisse.current = null
    panneau.current.style.transform = ''
    if (dy > 80) fermer(true)
  }

  return (
    <div
      className="menu-compte"
      ref={racine}
      onBlur={(e) => {
        // Tab hors du menu (ordinateur) : il se referme.
        if (ouvert && e.relatedTarget && !racine.current?.contains(e.relatedTarget as Node)) setOuvert(false)
      }}
    >
      <button
        type="button"
        ref={bouton}
        className="menu-compte-bouton"
        aria-label="Mon compte"
        aria-expanded={ouvert}
        aria-controls={`${id}-menu`}
        onClick={() => setOuvert((o) => !o)}
      >
        <span className="menu-compte-initiale" aria-hidden="true">
          {initiale}
        </span>
        <span className="menu-compte-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {ouvert && (
        <>
          <div className="menu-compte-voile" aria-hidden="true" onClick={() => fermer(true)} />
          <nav
            className="menu-compte-panneau"
            id={`${id}-menu`}
            aria-label="Mon compte"
            ref={panneau}
            onTouchStart={debutGlisse}
            onTouchMove={suiteGlisse}
            onTouchEnd={finGlisse}
            onTouchCancel={finGlisse}
          >
            <span className="menu-compte-poignee" aria-hidden="true" />
            <div className="menu-compte-tete">
              <span className="menu-compte-initiale grande" aria-hidden="true">
                {initiale}
              </span>
              <span className="menu-compte-identite">
                {nom && <span className="menu-compte-nom">{nom}</span>}
                <span className="menu-compte-role">{compte.utilisateur?.email ?? 'Professeur'}</span>
              </span>
            </div>
            <ul className="menu-compte-groupe menu-compte-liens" aria-label="Mon compte">
              {liens.map((d) => {
                const exact = chemin === d.to
                const ici = exact || (d.prefixe === true && espaceIci)
                return (
                  <li key={d.to}>
                    <Link
                      to={d.to}
                      className={`menu-compte-lien-menu${ici ? ' ici' : ''}`}
                      aria-current={exact ? 'page' : ici ? 'true' : undefined}
                      onClick={() => setOuvert(false)}
                    >
                      {d.icone}
                      <span className="menu-compte-libelle">{d.libelle}</span>
                      {ici ? <span className="menu-compte-ici">Tu es ici</span> : d.badge && <span className="menu-compte-badge">{d.badge}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              className="menu-compte-sortie"
              onClick={() => {
                setOuvert(false)
                void compte.seDeconnecter().then(() => navigate('/'))
              }}
              disabled={!compte.client}
            >
              <IconeSortie mode="compte" />
              Se déconnecter
            </button>
          </nav>
        </>
      )}
    </div>
  )
}

/** Initiale du nom affiché, sans la civilité (« M. Dupont » → « D », « Mme Leroy » → « L »). */
function initialeDe(nom: string): string {
  const mots = nom.split(/\s+/).filter(Boolean)
  const civilites = /^(m\.?|mme\.?|mlle\.?|mr\.?|madame|monsieur|mademoiselle|dr\.?)$/i
  const mot = mots.find((m) => !civilites.test(m)) ?? mots[0] ?? ''
  const lettre = mot.match(/\p{L}|\p{N}/u)?.[0] ?? ''
  return lettre ? lettre.toLocaleUpperCase('fr') : '?'
}

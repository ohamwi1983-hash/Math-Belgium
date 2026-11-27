import { useEffect, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Classe } from '../../lib/carnet'
import { useCompte } from '../../lib/compteContexte'
import { IconeAccueil, IconeAdmin, IconeCarnet, IconeDocuments, IconeEvaluation, IconeFeuille, IconeGroupe, IconePreparer, IconeReglages, IconeRetour, IconeSortie, type ModeIcone } from './IconesEspace'
import './espace.css'

export { IconeCarnet, IconeEvaluation, IconeFeuille }

/** Ce que le carnet donne au menu (pages `/carnet/*` seulement) : classes, séances par classe,
 * créneaux d'aujourd'hui à noter (pastille « n à noter » de « Mes classes »). */
export interface MenuCarnetDonnees {
  classes: Classe[]
  nombreSeances: (id: string) => number
  aNoter: number
}

export type CleEspace = 'tableau' | 'classes' | 'preparer' | 'documents' | 'reglages' | 'admin'

interface SousEntree {
  to: string
  libelle: string
  /** Pages (sans fragment) où cette sous-entrée est active, en plus de son adresse. */
  aussi?: (chemin: string) => boolean
}

export interface Porte {
  cle: Exclude<CleEspace, 'admin'>
  to: string
  libelle: string
  /** Libellé de la barre du bas (téléphone). */
  barre: string
  icone: (mode: ModeIcone) => ReactNode
  sous: SousEntree[]
  /** Phrase d'explication sous le titre de la porte (carte du tableau de bord, en-tête de la page). */
  phrase: string
  /** Résumé d'une ligne (cartes du tableau de bord sur téléphone). */
  court: string
  /** Liens directs de la carte du tableau de bord. */
  liens: { to: string; libelle: string }[]
}

const pageExercicesChapitre = (chemin: string) => /^\/[^/]+\/[^/]+\/exercices$/.test(chemin)

/**
 * Les portes de l'espace professeur (décision du 27/11/2026, maquettes « dashboard » / « classes » /
 * « préparer » / « téléphone ») : le tableau de bord puis les quatre portes, chacune avec ses
 * sous-entrées (dépliées quand la porte est active). Les adresses d'avant restent celles des pages
 * (`/carnet`, `/coffre`, `/profil`, `/exercice`, `/evaluation`) : rien ne casse.
 */
export const PORTES: Porte[] = [
  { cle: 'tableau', to: '/espace', libelle: 'Tableau de bord', barre: 'Accueil', icone: (m) => <IconeAccueil mode={m} />, sous: [], phrase: 'Ta journée de cours, ce qui arrive, et les quatre portes.', court: '', liens: [] },
  {
    cle: 'classes',
    to: '/carnet',
    libelle: 'Mes classes',
    barre: 'Classes',
    phrase: 'Ton journal de classe : ce que tu vois, quand, et avec qui.',
    court: 'Matière vue, agenda, horaire, page des élèves',
    liens: [
      { to: '/carnet', libelle: 'Matière vue et agenda' },
      { to: '/carnet/horaire', libelle: 'Mon horaire' },
      { to: '/carnet/agenda', libelle: 'Devoirs et évaluations prévus' },
      { to: '/carnet#page-des-eleves', libelle: 'Page des élèves (code de classe)' },
    ],
    icone: (m) => <IconeGroupe mode={m} />,
    sous: [
      { to: '/carnet', libelle: "Vue d'ensemble" },
      { to: '/carnet/semaine', libelle: 'Ma semaine', aussi: (c) => c === '/carnet/aujourdhui' },
      { to: '/carnet/agenda', libelle: 'Agenda' },
      { to: '/carnet/horaire', libelle: 'Mon horaire' },
      { to: '/carnet/classes', libelle: 'Ajouter une classe' },
    ],
  },
  {
    cle: 'preparer',
    to: '/espace/preparer',
    libelle: 'Préparer un cours',
    barre: 'Préparer',
    phrase: 'Tout ce qui sert en classe ou sur papier.',
    court: "Projeter, feuilles d'exercices, évaluations",
    liens: [
      { to: '/espace/preparer#projeter', libelle: 'Projeter un chapitre' },
      { to: '/exercice', libelle: "Créer une feuille d'exercices" },
      { to: '/evaluation', libelle: 'Créer une évaluation ou un examen' },
      { to: '/espace/preparer#remediation', libelle: 'Feuille de remédiation' },
    ],
    icone: (m) => <IconePreparer mode={m} />,
    sous: [
      { to: '/espace/preparer#projeter', libelle: 'Projeter un chapitre' },
      { to: '/exercice', libelle: "Feuille d'exercices", aussi: pageExercicesChapitre },
      { to: '/evaluation', libelle: 'Évaluation ou examen' },
      { to: '/espace/preparer#remediation', libelle: 'Remédiation' },
    ],
  },
  {
    cle: 'documents',
    to: '/coffre',
    libelle: 'Mes documents',
    barre: 'Documents',
    phrase: 'Ce que tu as enregistré, pour le réimprimer ou le partager.',
    court: 'Enregistrés, partagés, projections annotées',
    liens: [
      { to: '/coffre', libelle: 'Évaluations et feuilles enregistrées' },
      { to: '/coffre#partages', libelle: 'Partagés avec moi / par moi' },
      { to: '/coffre#projections', libelle: 'Projections annotées' },
    ],
    icone: (m) => <IconeDocuments mode={m} />,
    sous: [
      { to: '/coffre', libelle: 'Enregistrés', aussi: (c) => c.startsWith('/partage/') },
      { to: '/coffre#partages', libelle: 'Partagés' },
      { to: '/coffre#projections', libelle: 'Projections annotées' },
    ],
  },
  {
    cle: 'reglages',
    to: '/profil',
    libelle: 'Réglages',
    barre: 'Réglages',
    phrase: "À régler une fois, en début d'année.",
    court: 'Profil, écoles, ordre des chapitres, agenda',
    liens: [
      { to: '/profil#profil', libelle: 'Mon profil et mes écoles' },
      { to: '/profil#cartouche', libelle: 'En-tête des copies' },
      { to: '/profil#ordre-chapitres', libelle: 'Mon ordre des chapitres' },
      { to: '/carnet/reglages', libelle: "Réglages de l'agenda" },
      { to: '/profil#compte', libelle: 'Mon compte' },
    ],
    icone: (m) => <IconeReglages mode={m} />,
    sous: [
      { to: '/profil#profil', libelle: 'Mon profil et mes écoles' },
      { to: '/profil#cartouche', libelle: 'En-tête des copies' },
      { to: '/profil#ordre-chapitres', libelle: 'Mon ordre des chapitres' },
      { to: '/carnet/reglages', libelle: "Réglages de l'agenda" },
      { to: '/profil#compte', libelle: 'Mon compte' },
    ],
  },
]

/** Porte de la page affichée (`null` : page hors de l'espace professeur). */
export function porteDe(chemin: string): CleEspace | null {
  const c = chemin.replace(/\/+$/, '') || '/'
  if (c === '/espace') return 'tableau'
  if (c === '/carnet/reglages' || c === '/profil') return 'reglages'
  if (c === '/carnet' || c.startsWith('/carnet/')) return 'classes'
  if (c === '/espace/preparer' || c === '/exercice' || c === '/evaluation' || pageExercicesChapitre(c)) return 'preparer'
  if (c === '/coffre' || c.startsWith('/partage/')) return 'documents'
  if (c === '/admin') return 'admin'
  return null
}

function decouper(to: string): { chemin: string; ancre: string } {
  const i = to.indexOf('#')
  return i < 0 ? { chemin: to, ancre: '' } : { chemin: to.slice(0, i), ancre: to.slice(i) }
}

/** Sous-entrée active : même page, et même fragment quand elle en a un (sinon : aucun fragment d'une
 * sœur de la même page). */
function sousActive(s: SousEntree, soeurs: SousEntree[], chemin: string, ancre: string): boolean {
  const { chemin: page, ancre: sonAncre } = decouper(s.to)
  if (s.aussi?.(chemin)) return true
  if (page !== chemin) return false
  if (sonAncre) return ancre === sonAncre
  return !soeurs.some((x) => x !== s && decouper(x.to).chemin === chemin && decouper(x.to).ancre !== '' && decouper(x.to).ancre === ancre)
}

/**
 * Menu UNIQUE « Espace professeur » de toutes les pages professeur (tableau de bord, Mes classes, Préparer
 * un cours — feuilles d'exercices et panneau des évaluations compris —, Mes documents, partage, Réglages,
 * administration). Remplace l'ancien menu « Mon espace » et les groupes de liens du menu du compte.
 *
 * Ordinateur (≥ 760 px) : colonne de gauche — « ESPACE PROFESSEUR », Tableau de bord, Mes classes,
 * Préparer un cours, Mes documents, Réglages (sous-entrées de la porte active dépliées), puis à part
 * Administration (admin), Retour au site élève, Se déconnecter. `compact` (pages de conception, qui ont
 * besoin de largeur) : de 760 à 1 359 px, colonne d'icônes (libellés lus et en infobulle).
 *
 * Téléphone (< 760 px) : barre fixe en bas Accueil · Classes · Préparer · Documents · Réglages, et les
 * sous-entrées de la porte active en onglets défilants en tête du contenu. Administration et
 * déconnexion : menu du compte (pastille de l'en-tête).
 *
 * Changement de page : défilement en haut, ou vers l'ancre demandée (`/profil#compte`).
 */
export function MenuEspace({ children, carnet, compact = false }: { children: ReactNode; carnet?: MenuCarnetDonnees; compact?: boolean }) {
  const compte = useCompte()
  const navigate = useNavigate()
  const location = useLocation()
  const chemin = location.pathname.replace(/\/+$/, '') || '/'
  const ancre = location.hash
  const active = porteDe(chemin)
  const admin = compte.profil?.est_admin === true
  const aNoter = carnet?.aNoter ?? 0

  // `MenuCarnetDonnees.classes` / `nombreSeances` : gardés pour l'appel du carnet (la liste des classes
  // est désormais la vue d'ensemble de « Mes classes », plus le menu).
  // Changement de page ou d'ancre : vers l'ancre (le contenu peut arriver après : deux essais), sinon en haut.
  useEffect(() => {
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1))
      let essais = 0
      const aller = () => {
        const cible = document.getElementById(id)
        if (cible) cible.scrollIntoView({ block: 'start' })
        else if (++essais < 8) window.setTimeout(aller, 150)
      }
      requestAnimationFrame(aller)
      return
    }
    window.scrollTo({ top: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement au changement d'adresse
  }, [location.pathname, location.hash])

  const seDeconnecter = () => void compte.seDeconnecter().then(() => navigate('/'))
  const titre = (libelle: string) => (compact ? { title: libelle } : {})
  const porteActive = PORTES.find((p) => p.cle === active)

  const lienSous = (s: SousEntree, soeurs: SousEntree[], classe: string) => {
    const ici = sousActive(s, soeurs, chemin, ancre)
    return (
      <Link to={s.to} className={`${classe}${ici ? ' ici' : ''}`} aria-current={ici ? 'page' : undefined}>
        {s.libelle}
      </Link>
    )
  }

  return (
    <div className={`ep-cadre${compact ? ' compact' : ''}`}>
      <nav className="ep-menu" aria-label="Espace professeur">
        <p className="ep-menu-titre">Espace professeur</p>
        <ul className="ep-portes">
          {PORTES.map((p) => {
            const ici = active === p.cle
            const exact = chemin === p.to && (p.sous.length === 0 || sousActive(p.sous[0], p.sous, chemin, ancre))
            return (
              <li key={p.cle} className={`ep-porte ep-porte-${p.cle}${ici ? ' active' : ''}`}>
                <Link to={p.to} className="ep-porte-lien" aria-current={exact ? 'page' : ici ? 'true' : undefined} {...titre(p.libelle)}>
                  <span className="ep-porte-icone" aria-hidden="true">
                    {p.icone('menu')}
                  </span>
                  <span className="ep-libelle">{p.libelle}</span>
                  {p.cle === 'classes' && aNoter > 0 && (
                    <span className="ep-pastille">
                      {aNoter}
                      <span className="ep-sr"> à noter aujourd'hui</span>
                    </span>
                  )}
                </Link>
                {ici && p.sous.length > 0 && (
                  <ul className="ep-sous" aria-label={`${p.libelle} : sous-pages`}>
                    {p.sous.map((s) => (
                      <li key={s.to}>{lienSous(s, p.sous, 'ep-sous-lien')}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
        <ul className="ep-rare">
          {admin && (
            <li>
              <Link to="/admin" className="ep-rare-lien" aria-current={active === 'admin' ? 'page' : undefined} {...titre('Administration')}>
                <IconeAdmin />
                <span className="ep-libelle">Administration</span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/" className="ep-rare-lien" {...titre('Retour au site élève')}>
              <IconeRetour />
              <span className="ep-libelle">Retour au site élève</span>
            </Link>
          </li>
          <li>
            <button type="button" className="ep-rare-lien" onClick={seDeconnecter} disabled={!compte.client} {...titre('Se déconnecter')}>
              <IconeSortie />
              <span className="ep-libelle">Se déconnecter</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="carnet-contenu ep-contenu">
        {porteActive && porteActive.sous.length > 0 && (
          <nav className="ep-onglets" aria-label={`${porteActive.libelle} : sous-pages`}>
            <ul>
              {porteActive.sous.map((s) => (
                <li key={s.to}>{lienSous(s, porteActive.sous, 'ep-onglet')}</li>
              ))}
            </ul>
          </nav>
        )}
        {children}
      </div>

      <nav className="ep-barre" aria-label="Espace professeur">
        {PORTES.map((p) => (
          <Link key={p.cle} to={p.to} className={`ep-barre-bouton${active === p.cle ? ' active' : ''}`} aria-current={active === p.cle ? (chemin === p.to ? 'page' : 'true') : undefined}>
            {p.icone('barre')}
            <span>{p.barre}</span>
            {p.cle === 'classes' && aNoter > 0 && (
              <span className="ep-barre-pastille">
                {aNoter}
                <span className="ep-sr"> à noter</span>
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}

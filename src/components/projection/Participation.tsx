import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import type { Role } from '../../lib/projection/diapos'
import { useCompte } from '../../lib/compteContexte'
import type { Classe } from '../../lib/carnet'
import type { Evenement, PeriodeBulletin } from '../../lib/agendaEvenements'
import {
  beneficiaires,
  calculerScores,
  classementEquipes,
  cloturerPeriode,
  dateAvecJour,
  dateCourte,
  ecrireClasseChoisie,
  ecrirePoints,
  ecrireReglages,
  elevesDe,
  EQUIPES_DEFAUT,
  equipeDe,
  equipesAJour,
  equipesAuHasard,
  jourIso,
  lireClasseChoisie,
  lireEleves,
  lireHistorique,
  lirePoints,
  lireReglages,
  podium,
  pointsPositifs,
  PREFIXE_STOCKAGE,
  proposer,
  reglagesDefaut,
  regleDefaut,
  tirerEleve,
  toutEffacer,
} from '../../lib/participation'
import type { Affichage, GenrePoint, ListeEleves, Marche, Periode, PointParticipation, ReglagesParticipation } from '../../lib/participation'
import { EditeurEleves } from '../participation/EditeurEleves'
import './participation.css'

/**
 * Points de participation (P6, maquette validée du 28/11/2026). D'office des ÉQUIPES (on gagne ensemble ; seuls les
 * scores d'équipe sont projetés), sinon un PODIUM (les 3 premiers, ex aequo ensemble, et « + n points aujourd'hui » —
 * jamais le bas du classement). +1 bonne réponse, +1 bonne idée (d'office), −1 pénalité (désactivée d'office, jamais
 * projetée). « Interroger quelqu'un » favorise ceux qui n'ont pas participé aujourd'hui (×3). Période + règle du
 * bonus projetée, bilan de fin de période.
 *
 * Données : sur CET APPAREIL seulement (`lib/participation.ts`, `localStorage`) — jamais au serveur, jamais dans la
 * vidéo (tout est posé HORS du cadre de la diapo filmé), ni dans le PowerPoint / PDF (rien n'est une annotation).
 * Deux fenêtres (deux écrans) : les données passent par le stockage (événement `storage`), ce qui est projeté (panneau
 * affiché / replié, « +1 », tirage montré, règle, bilan) par un `BroadcastChannel` propre à la participation.
 * La vue du professeur (deux écrans) remplace sa colonne « Suivante / Notes » par la grille des élèves ; en un seul
 * écran, la grille est un panneau replié chez le professeur — visible de la classe s'il le déplie, donc SANS les points
 * de chacun ni les ronds « pas encore participé » (dit dans le panneau).
 */

const CANAL = 'math-belgium-participation'
export const CLASSE_LOCALE = 'locale'

interface Affiche {
  /** Participation lancée (« Commencer ») pour cette séance. */
  actif: boolean
  /** Panneau projeté affiché (bouton « Points » de la barre). */
  visible: boolean
  /** Panneau replié en pastille « Équipes ▸ » / « Podium ▸ ». */
  replie: boolean
  regle: boolean
  bilan: boolean
  /** Prénom tiré au sort, montré au tableau (« Montrer au tableau ») ; `n` change à chaque demande. */
  tire: { nom: string; n: number } | null
  classe: string | null
  /** Nom de la classe (« 5e A »), pour la fenêtre des diapos qui ne lit pas le carnet. */
  nom?: string
}
const AFFICHE_DEPART: Affiche = { actif: false, visible: true, replie: false, regle: false, bilan: false, tire: null, classe: null }

type Message = { type: 'affiche'; de: string; affiche: Affiche } | { type: 'demande'; de: string } | { type: 'toast'; de: string; texte: string; id: number }

/** Données d'une classe lues sur l'appareil. */
function lireDonnees(classe: string | null) {
  const liste = classe ? lireEleves(classe) : null
  const eleves = elevesDe(liste)
  const r = classe ? lireReglages(classe) : null
  const reglages = r ? { ...r, equipes: equipesAJour(r.equipes, eleves) } : null
  return { liste, eleves, reglages, points: classe ? lirePoints(classe) : [] }
}

/** Évaluations annoncées et bulletins (carnet), pour proposer la fin de la période. */
interface Agenda {
  evenements: Evenement[]
  periodes: PeriodeBulletin[]
}

/**
 * État de la participation pour cette fenêtre : classes (carnet), classe choisie, liste, réglages, points ; ce qui est
 * projeté (partagé avec l'autre fenêtre) ; actions.
 */
export function useParticipation(chapter: ChapterContent, role: Role) {
  const compte = useCompte()
  const client = compte.client
  const [classes, setClasses] = useState<Pick<Classe, 'id' | 'nom' | 'niveau'>[]>([])
  const [agenda, setAgenda] = useState<Agenda | null>(null)
  const [affiche, setAffiche] = useState<Affiche>(() => ({ ...AFFICHE_DEPART, classe: lireClasseChoisie() }))
  const afficheRef = useRef(affiche)
  afficheRef.current = affiche
  const classe = affiche.classe
  const [donnees, setDonnees] = useState(() => lireDonnees(classe))
  const [toast, setToast] = useState<{ texte: string; id: number } | null>(null)
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const id = useMemo(() => Math.random().toString(36).slice(2), [])
  const canal = useRef<BroadcastChannel | null>(null)

  // Classes du carnet (en arrière-plan ; sans carnet : « Ma classe », gardée sur l'appareil).
  useEffect(() => {
    if (role === 'diapos' || !client) return
    let vivant = true
    void (async () => {
      try {
        const [{ listerClasses }, { chargerAgenda }] = await Promise.all([import('../../lib/carnetDonnees'), import('../../lib/agendaDonnees')])
        const [cl, ag] = await Promise.all([listerClasses(client).catch(() => []), chargerAgenda(client).catch(() => null)])
        if (!vivant) return
        setClasses(cl.map((c) => ({ id: c.id, nom: c.nom, niveau: c.niveau })))
        if (ag) setAgenda({ evenements: ag.evenements, periodes: ag.periodes })
      } catch {
        // carnet indisponible : la classe locale suffit
      }
    })()
    return () => {
      vivant = false
    }
  }, [client, role])

  // Classe proposée d'office : la dernière choisie, sinon une classe de l'année du chapitre, sinon la première.
  useEffect(() => {
    if (affiche.classe || role === 'diapos') return
    if (!classes.length) return
    const c = classes.find((x) => x.niveau === chapter.levelSlug) ?? classes[0]
    setAffiche((a) => ({ ...a, classe: c.id }))
  }, [classes, affiche.classe, chapter.levelSlug, role])

  const relire = useCallback(() => setDonnees(lireDonnees(afficheRef.current.classe)), [])
  // Nom de la classe partagé avec la fenêtre des diapos (elle ne lit pas le carnet).
  const nomConnu = classes.find((c) => c.id === affiche.classe)?.nom
  useEffect(() => {
    if (nomConnu && afficheRef.current.nom !== nomConnu) {
      const a = { ...afficheRef.current, nom: nomConnu }
      afficheRef.current = a
      setAffiche(a)
      try {
        canal.current?.postMessage({ type: 'affiche', de: id, affiche: a })
      } catch {
        // rien
      }
    }
  }, [nomConnu, id])
  useEffect(() => relire(), [classe, relire])
  // Autre fenêtre (ou autre onglet) : la liste, les réglages ou les points ont changé.
  useEffect(() => {
    const surStockage = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith(PREFIXE_STOCKAGE)) relire()
    }
    window.addEventListener('storage', surStockage)
    return () => window.removeEventListener('storage', surStockage)
  }, [relire])
  // « Aujourd'hui » change à minuit ; les compteurs du jour se relisent chaque minute.
  useEffect(() => {
    const t = window.setInterval(() => setMaintenant(Date.now()), 60000)
    return () => window.clearInterval(t)
  }, [])

  // Canal : ce qui est projeté.
  const envoyer = useCallback((m: Message) => {
    try {
      canal.current?.postMessage(m)
    } catch {
      // rien
    }
  }, [])
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const c = new BroadcastChannel(CANAL)
    canal.current = c
    c.onmessage = (e: MessageEvent<Message>) => {
      const m = e.data
      if (!m || m.de === id) return
      if (m.type === 'affiche') {
        afficheRef.current = m.affiche
        setAffiche(m.affiche)
      } else if (m.type === 'demande') {
        if (afficheRef.current.actif) envoyer({ type: 'affiche', de: id, affiche: afficheRef.current })
      } else if (m.type === 'toast') setToast({ texte: m.texte, id: m.id })
    }
    envoyer({ type: 'demande', de: id })
    return () => {
      c.close()
      if (canal.current === c) canal.current = null
    }
  }, [id, envoyer])

  const majAffiche = useCallback(
    (f: (a: Affiche) => Affiche) => {
      const a = f(afficheRef.current)
      if (a === afficheRef.current) return
      afficheRef.current = a
      setAffiche(a)
      envoyer({ type: 'affiche', de: id, affiche: a })
    },
    [envoyer, id],
  )
  const montrerToast = useCallback(
    (texte: string) => {
      const t = { texte, id: Date.now() }
      setToast(t)
      envoyer({ type: 'toast', de: id, ...t })
    },
    [envoyer, id],
  )

  const { eleves, reglages, points, liste } = donnees
  const scores = useMemo(() => (reglages ? calculerScores(eleves, reglages, points, maintenant) : null), [eleves, reglages, points, maintenant])

  const choisirClasse = (c: string) => {
    ecrireClasseChoisie(c)
    majAffiche((a) => ({ ...a, classe: c, tire: null }))
  }
  const enregistrerReglages = (r: ReglagesParticipation) => {
    if (!classe) return
    ecrireReglages(classe, r)
    relire()
  }
  const ajouterPoint = (p: Omit<PointParticipation, 't'>) => {
    if (!classe || !reglages) return
    const l = [...lirePoints(classe), { ...p, t: Date.now() }]
    ecrirePoints(classe, l)
    setMaintenant(Date.now())
    relire()
    if (p.v > 0 && p.genre !== 'penalite') {
      const eq = p.e !== null ? equipeDe(reglages.equipes, p.e) : (p.eq ?? -1)
      const qui = reglages.affichage === 'equipes' && eq >= 0 ? reglages.equipes[eq].nom : reglages.prenomProjete && p.e ? p.e : p.genre === 'idee' ? 'bonne idée' : 'bonne réponse'
      montrerToast(`+1 ${reglages.prenomProjete && p.e && reglages.affichage === 'equipes' ? `${p.e} · ${qui}` : qui}`)
      // Le panneau replié se déplie 3 s après un point, puis se replie.
      if (afficheRef.current.replie) {
        majAffiche((a) => ({ ...a, replie: false }))
        window.setTimeout(() => majAffiche((a) => ({ ...a, replie: true })), 3000)
      }
    }
  }
  const donner = (e: string, genre: GenrePoint) => ajouterPoint({ e, v: genre === 'penalite' ? -1 : 1, genre })
  const donnerEquipe = (eq: number, v: 1 | -1) => ajouterPoint({ e: null, eq, v, genre: v > 0 ? 'reponse' : 'penalite' })
  const annuler = () => {
    if (!classe) return
    const l = lirePoints(classe)
    l.pop()
    ecrirePoints(classe, l)
    relire()
  }
  const nouvellePeriode = (r: ReglagesParticipation, periode: Periode) => {
    if (!classe) return
    cloturerPeriode(classe, r, eleves, points, Date.now())
    enregistrerReglages({ ...r, periode, regle: regleDefaut(r.affichage, periode), equipes: equipesAuHasard(eleves, r.nbEquipes, r.equipes) })
    majAffiche((a) => ({ ...a, bilan: false }))
  }
  const effacerTout = () => {
    if (!classe) return
    toutEffacer(classe)
    majAffiche((a) => ({ ...a, actif: false, tire: null, bilan: false, regle: false }))
    relire()
  }

  return {
    role,
    classes,
    agenda,
    classe,
    nomClasse: classes.find((c) => c.id === classe)?.nom ?? (classe === CLASSE_LOCALE ? 'Ma classe' : (affiche.nom ?? '')),
    liste,
    eleves,
    reglages,
    points,
    scores,
    maintenant,
    affiche,
    toast,
    majAffiche,
    choisirClasse,
    enregistrerReglages,
    relire,
    donner,
    donnerEquipe,
    annuler,
    nouvellePeriode,
    effacerTout,
  }
}

export type Participation = ReturnType<typeof useParticipation>

// ---------- pictogrammes ----------

export function IconeCoupe({ taille = 22 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9.5 17h5" />
    </svg>
  )
}
function IconeDe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
      <circle cx="15" cy="15" r="1.2" fill="currentColor" />
      <circle cx="15" cy="9" r="1.2" fill="currentColor" />
      <circle cx="9" cy="15" r="1.2" fill="currentColor" />
    </svg>
  )
}

// ---------- ce qui est PROJETÉ (jamais dans la diapo filmée) ----------

const libellePeriode = (r: ReglagesParticipation) => `Jusqu’au ${dateCourte(r.periode.fin)}`
/** Règle courte sous les barres : « Top 3 : +1 point à l'interro du 4/12 ». */
const regleCourte = (r: ReglagesParticipation) => `Top 3 : +1 point à ${r.periode.libelle}`

/**
 * Panneau projeté (en haut à droite, repliable) : barres des équipes, ou podium ; « +1 » bref ; tirage montré ; règle ;
 * bilan. Rendu dans la fenêtre de la classe (un écran, ou fenêtre des diapos), HORS du cadre filmé de la diapo.
 */
export function ParticipationProjetee({ part, masquer }: { part: Participation; masquer?: boolean }) {
  const { affiche, reglages, scores, toast } = part
  const [toastVisible, setToastVisible] = useState<{ texte: string; id: number } | null>(null)
  useEffect(() => {
    if (!toast) return
    setToastVisible(toast)
    const t = window.setTimeout(() => setToastVisible(null), 1500)
    return () => window.clearTimeout(t)
  }, [toast])
  const [tireVisible, setTireVisible] = useState<string | null>(null)
  useEffect(() => {
    // Montré 4 s à partir de la demande (`n` = horodatage) : un nouvel affichage ne le ressort jamais.
    const reste = affiche.tire ? 4000 - (Date.now() - affiche.tire.n) : 0
    if (!affiche.tire || reste <= 0) return
    setTireVisible(affiche.tire.nom)
    const t = window.setTimeout(() => setTireVisible(null), reste)
    return () => {
      window.clearTimeout(t)
      setTireVisible(null)
    }
  }, [affiche.tire])
  if (!reglages || !scores || masquer) return null
  const equipes = reglages.affichage === 'equipes'
  return (
    <>
      {affiche.actif && affiche.visible && !affiche.bilan && (
        affiche.replie ? (
          <button type="button" className="part-projete part-pastille projection-interactif" onClick={(e) => (e.stopPropagation(), part.majAffiche((a) => ({ ...a, replie: false })))} aria-label={equipes ? 'Déplier les scores des équipes' : 'Déplier le podium'}>
            <IconeCoupe taille={18} /> {equipes ? 'Équipes' : 'Podium'} ▸
          </button>
        ) : (
          <div className="part-projete part-panneau-projete projection-interactif" onClick={(e) => e.stopPropagation()} aria-label={equipes ? 'Scores des équipes' : 'Podium'}>
            <div className="part-projete-tete">
              <IconeCoupe taille={18} /> <span>{equipes ? libellePeriode(reglages) : `Podium · ${libellePeriode(reglages).toLowerCase()}`}</span>
              <button type="button" className="part-replier" aria-label="Replier le panneau" title="Replier (libère la diapo)" onClick={() => part.majAffiche((a) => ({ ...a, replie: true }))}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
            {equipes ? <BarresEquipes r={reglages} scores={scores.equipes} /> : <Podium marches={podium(pointsPositifs(part.points))} />}
            {equipes ? <p className="part-regle-courte">{regleCourte(reglages)}</p> : <p className="part-total">+ {scores.totalAujourdhui} point{scores.totalAujourdhui > 1 ? 's' : ''} gagnés aujourd’hui</p>}
          </div>
        )
      )}
      {affiche.actif && toastVisible && (
        <div key={toastVisible.id} className="part-toast" role="status">
          <span className="part-toast-plus">{toastVisible.texte.slice(0, 2)}</span> {toastVisible.texte.slice(3)}
        </div>
      )}
      {tireVisible && (
        <div className="part-tire" role="status">
          <span className="part-tire-lbl">Interrogé</span>
          {tireVisible}
        </div>
      )}
      {affiche.regle && (
        <div className="part-carte-regle projection-interactif" role="dialog" aria-label="Règle du bonus" onClick={(e) => (e.stopPropagation(), part.majAffiche((a) => ({ ...a, regle: false })))}>
          <p className="part-carte-sur">
            Points de participation · {equipes ? 'par équipes' : 'podium'} · du {dateCourte(reglages.periode.debut)} au {dateCourte(reglages.periode.fin)}
          </p>
          <p className="part-carte-regle-texte">{reglages.regle}</p>
          <p className="part-carte-points">
            +1 bonne réponse{reglages.idee ? ' · +1 bonne idée, bel effort (même si la réponse est fausse)' : ''}
          </p>
          {equipes && (
            <ul className="part-carte-equipes">
              {reglages.equipes.map((e) => (
                <li key={e.nom} style={{ ['--c' as string]: e.couleur }}>
                  <i /> {e.nom}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {affiche.bilan && <BilanProjete part={part} />}
    </>
  )
}

function BarresEquipes({ r, scores }: { r: ReglagesParticipation; scores: number[] }) {
  const ordre = classementEquipes(r, scores)
  const max = Math.max(1, ...scores)
  return (
    <ol className="part-barres">
      {ordre.map((i) => (
        <li key={i} style={{ ['--c' as string]: r.equipes[i].couleur }}>
          <span className="part-barre-nom">{r.equipes[i].nom}</span>
          <span className="part-barre-fond">
            <i style={{ width: `${(100 * scores[i]) / max}%` }} />
          </span>
          <b>{scores[i]}</b>
        </li>
      ))}
    </ol>
  )
}

const COULEURS_MARCHE: Record<number, string> = { 1: '#b65c1f', 2: '#8a97a1', 3: '#a5714a' }
function Podium({ marches }: { marches: Marche[] }) {
  if (!marches.length) return <p className="part-vide-projete">Pas encore de point : à vous !</p>
  const ordre = [marches.find((m) => m.rang === 2), marches.find((m) => m.rang === 1), marches.find((m) => m.rang === 3)].filter(Boolean) as Marche[]
  return (
    <div className="part-podium">
      {ordre.map((m) => (
        <div key={m.rang} className="part-podium-col">
          <span className="part-podium-qui">
            {m.noms.join(', ')}
            <small>{m.points}</small>
          </span>
          <span className="part-marche" style={{ height: m.rang === 1 ? 64 : m.rang === 2 ? 46 : 34, background: COULEURS_MARCHE[m.rang] }}>
            {m.rang}
          </span>
        </div>
      ))}
    </div>
  )
}

function BilanProjete({ part }: { part: Participation }) {
  const r = part.reglages!
  const sc = part.scores!
  const equipes = r.affichage === 'equipes'
  // Équipes : trois rangs au plus, ex aequo sur la même marche, jamais une équipe à 0 point.
  const marchesEquipes = podium(new Map(r.equipes.map((e, i) => [e.nom, sc.equipes[i]])))
  const couleur = (noms: string[]) => (noms.length === 1 ? (r.equipes.find((e) => e.nom === noms[0])?.couleur ?? '#8a97a1') : '#8a97a1')
  const marches = podium(pointsPositifs(part.points))
  const ontParticipe = part.eleves.filter((e) => part.points.some((p) => p.e === e && p.v > 0 && p.genre !== 'penalite')).length
  return (
    <div className="part-bilan projection-interactif" role="dialog" aria-label="Bilan de la période" onClick={(e) => e.stopPropagation()}>
      <p className="part-bilan-sur">
        Bilan · du {dateCourte(r.periode.debut)} au {dateCourte(r.periode.fin)}
      </p>
      <h2 className="part-bilan-titre">Bravo à toute la {part.nomClasse || 'classe'} !</h2>
      {equipes ? (
        <div className="part-podium part-podium--grand">
          {[2, 1, 3]
            .map((rang) => marchesEquipes.find((m) => m.rang === rang))
            .filter((m): m is Marche => !!m)
            .map((m) => (
              <div key={m.rang} className="part-podium-col">
                <span className="part-podium-qui">
                  {m.noms.join(', ')}
                  <small>{m.points}</small>
                </span>
                <span className="part-marche" style={{ height: m.rang === 1 ? 150 : m.rang === 2 ? 108 : 80, background: couleur(m.noms) }}>
                  {m.rang}
                </span>
              </div>
            ))}
          {marchesEquipes.length === 0 && <p className="part-vide-projete">Pas encore de point pendant cette période.</p>}
        </div>
      ) : (
        <Podium marches={marches} />
      )}
      <p className="part-bilan-texte">
        {equipes ? (marchesEquipes.flatMap((m) => m.noms).length > 1 ? 'Ces équipes' : 'Cette équipe') : 'Les premiers du podium'} {equipes && marchesEquipes.flatMap((m) => m.noms).length === 1 ? 'gagne' : 'gagnent'} <b>+1 point à {r.periode.libelle}</b>.
        <br />
        <span className="part-bilan-chiffres">
          {sc.totalPeriode} points gagnés ensemble · {ontParticipe} élève{ontParticipe > 1 ? 's' : ''} sur {part.eleves.length} {ontParticipe > 1 ? 'ont' : 'a'} participé.
        </span>
      </p>
    </div>
  )
}

// ---------- bouton « Points » de la barre ----------

export function BoutonPoints({ part, actif, onClick, compacte = false }: { part: Participation; actif: boolean; onClick: () => void; compacte?: boolean }) {
  return (
    <button
      type="button"
      className={`projection-outil part-bouton${actif ? ' actif' : ''}`}
      aria-pressed={actif}
      aria-label="Points de participation"
      title={part.affiche.actif ? 'Points de participation (afficher / masquer)' : 'Points de participation : réglages de la classe'}
      onClick={onClick}
    >
      <IconeCoupe />
      {compacte && <span>Points</span>}
    </button>
  )
}

// ---------- panneau du professeur : un toucher = un point ----------

/**
 * Grille des élèves (vue du professeur, ou panneau replié en un seul écran) : toucher le prénom = +1 bonne réponse,
 * 💡 = +1 bonne idée, −1 seulement si la pénalité est activée ; au clavier, premières lettres + Entrée ; « Annuler » ;
 * « Interroger quelqu'un » ; en équipes, +1 / −1 à une équipe entière. `prive` : vue du professeur (deux écrans) —
 * sinon (un seul écran, visible de la classe) ni les points de chacun ni les ronds « pas encore participé ».
 */
export function PanneauPoints({ part, prive, onReglages, onFermer }: { part: Participation; prive: boolean; onReglages: () => void; onFermer?: () => void }) {
  const idChamp = useId()
  const { reglages, scores, eleves, affiche } = part
  const [saisie, setSaisie] = useState('')
  const [choix, setChoix] = useState(0)
  const [tire, setTire] = useState<string | null>(null)
  const [dernier, setDernier] = useState<string | null>(null)
  const [tri, setTri] = useState<'equipe' | 'alpha'>('equipe')
  const [confirmerFin, setConfirmerFin] = useState(false)
  const propositions = useMemo(() => proposer(eleves, saisie), [eleves, saisie])
  useEffect(() => setChoix(0), [saisie])
  if (!reglages || !scores) {
    return (
      <div className="part-panneau">
        <p className="part-vide">Aucune classe réglée pour les points de participation.</p>
        <button type="button" className="part-bouton-plein" onClick={onReglages}>
          Régler la classe
        </button>
      </div>
    )
  }
  const equipes = reglages.affichage === 'equipes'
  const ordre = tri === 'alpha' || !equipes ? [...eleves].sort((a, b) => a.localeCompare(b, 'fr', { numeric: true })) : reglages.equipes.flatMap((e) => e.membres)
  const point = (e: string, genre: GenrePoint) => {
    part.donner(e, genre)
    setDernier(e)
  }
  const derniersPoints = part.points[part.points.length - 1]
  const libelleAnnuler = derniersPoints ? `${derniersPoints.v > 0 ? '+1' : '−1'} ${derniersPoints.e ?? reglages.equipes[derniersPoints.eq ?? 0]?.nom ?? ''}` : null
  const tirer = () => {
    const t = tirerEleve(eleves, scores.participe, tire ? [tire] : [])
    setTire(t)
  }
  const pasEncore = eleves.filter((e) => !scores.participe.has(e)).length
  const finAtteinte = jourIso(new Date(part.maintenant)) >= reglages.periode.fin
  return (
    <div className={`part-panneau${prive ? ' prive' : ''}`}>
      <div className="part-tete">
        <div className="part-tete-titre">
          <p className="part-surtitre">{prive ? 'Vue du professeur · points de participation' : 'Points de participation'}</p>
          <p className="part-titre">
            {part.nomClasse} · {equipes ? 'par équipes' : 'podium'} · jusqu’au {dateCourte(reglages.periode.fin)}
          </p>
        </div>
        <div className="part-chiffres">
          <span>
            <small>Aujourd’hui</small>+{scores.totalAujourdhui}
          </span>
          {prive && (
            <span>
              <small>Ont participé</small>
              {scores.participe.size} / {eleves.length}
            </span>
          )}
        </div>
        <div className="part-tete-actions">
          {!affiche.actif ? (
            <button type="button" className="part-bouton-plein" onClick={() => part.majAffiche((a) => ({ ...a, actif: true, visible: true }))}>
              Commencer
            </button>
          ) : (
            <button type="button" className="part-bouton" aria-pressed={affiche.visible} title="Afficher ou masquer le panneau au tableau" onClick={() => part.majAffiche((a) => ({ ...a, visible: !a.visible }))}>
              Au tableau : {affiche.visible ? 'affiché' : 'masqué'}
            </button>
          )}
          <button type="button" className="part-bouton" aria-pressed={affiche.bilan} onClick={() => part.majAffiche((a) => ({ ...a, bilan: !a.bilan, actif: true }))}>
            {affiche.bilan ? 'Fermer le bilan' : 'Bilan'}
          </button>
          <button type="button" className="part-bouton" onClick={onReglages}>
            Réglages
          </button>
          {onFermer && (
            <button type="button" className="part-bouton" aria-label="Replier le panneau des points" onClick={onFermer}>
              ✕
            </button>
          )}
        </div>
      </div>
      {!prive && <p className="part-avertissement">Ce panneau est visible au tableau : les points de chacun sont cachés. Ouvre la vue à deux écrans pour les voir.</p>}
      {finAtteinte && !affiche.bilan && <p className="part-fin">La période se termine {jourIso(new Date(part.maintenant)) === reglages.periode.fin ? 'aujourd’hui' : 'déjà'} : affiche le bilan au tableau (« Bilan »).</p>}
      {affiche.bilan && <BilanProfesseur part={part} confirmer={confirmerFin} setConfirmer={setConfirmerFin} />}
      <div className="part-ligne">
        <button type="button" className="part-interroger" onClick={tirer}>
          <IconeDe /> Interroger quelqu’un
        </button>
        <div className="part-champ">
          <label htmlFor={idChamp} className="sr-only">
            Donner un point au clavier : taper les premières lettres du prénom, puis Entrée
          </label>
          <input
            id={idChamp}
            type="text"
            autoComplete="off"
            value={saisie}
            placeholder="Taper les premières lettres…"
            onChange={(e) => setSaisie(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setChoix((c) => Math.min(propositions.length - 1, c + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setChoix((c) => Math.max(0, c - 1))
              } else if (e.key === 'Enter' && propositions.length) {
                e.preventDefault()
                point(propositions[choix] ?? propositions[0], 'reponse')
                setSaisie('')
              } else if (e.key === 'Escape') setSaisie('')
            }}
            aria-describedby={`${idChamp}-p`}
          />
          <span id={`${idChamp}-p`} className="part-propositions" aria-live="polite">
            {propositions.slice(0, 4).map((p, i) => (
              <span key={p} className={i === choix ? 'on' : ''}>
                {p}
              </span>
            ))}
            {propositions.length > 0 && <span aria-hidden="true">⏎</span>}
          </span>
        </div>
        <button type="button" className="part-bouton" disabled={!libelleAnnuler} onClick={part.annuler} title="Retirer le dernier point donné">
          ↶ Annuler{libelleAnnuler ? ` « ${libelleAnnuler} »` : ''}
        </button>
      </div>
      {tire && (
        <div className="part-tirage" role="status">
          <IconeDe />
          <span>
            Tiré au sort : <b>{tire}</b>
            {prive && !scores.participe.has(tire) ? ` — pas encore participé aujourd’hui (comme ${Math.max(0, pasEncore - 1)} autre${pasEncore - 1 > 1 ? 's' : ''}).` : '.'}
          </span>
          <button type="button" className="part-bouton" onClick={() => part.majAffiche((a) => ({ ...a, tire: { nom: tire, n: Date.now() } }))}>
            Montrer au tableau
          </button>
          <button type="button" className="part-bouton" onClick={tirer}>
            Un autre
          </button>
        </div>
      )}
      {equipes && (
        <div className="part-equipes-boutons" role="group" aria-label="Point à une équipe entière">
          {reglages.equipes.map((e, i) => (
            <span key={e.nom} className="part-equipe-bouton" style={{ ['--c' as string]: e.couleur }}>
              <button type="button" onClick={() => part.donnerEquipe(i, 1)} title={`+1 à toute l’équipe ${e.nom}`}>
                <i /> +1 {e.nom}
              </button>
              {reglages.penalite && (
                <button type="button" className="moins" aria-label={`−1 à l’équipe ${e.nom}`} onClick={() => part.donnerEquipe(i, -1)}>
                  −1
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      <p className="part-legende">
        Toucher le prénom : <b>+1 bonne réponse</b>
        {reglages.idee && (
          <>
            {' '}
            · 💡 : <b>+1 bonne idée</b>
          </>
        )}
        {prive && (
          <>
            {' '}
            · <span className="part-rond" aria-hidden="true" /> pas encore participé aujourd’hui
          </>
        )}
        {equipes && (
          <span className="part-tri">
            Trier :{' '}
            <button type="button" aria-pressed={tri === 'equipe'} onClick={() => setTri('equipe')}>
              par équipe
            </button>{' '}
            ·{' '}
            <button type="button" aria-pressed={tri === 'alpha'} onClick={() => setTri('alpha')}>
              alphabétique
            </button>
          </span>
        )}
      </p>
      <ul className="part-grille">
        {ordre.map((e) => {
          const eq = equipeDe(reglages.equipes, e)
          const pts = scores.eleves.get(e) ?? 0
          const auj = scores.aujourdhui.get(e) ?? 0
          return (
            <li key={e} className={`part-tuile${tire === e ? ' tire' : ''}${dernier === e ? ' vient' : ''}`} style={{ ['--c' as string]: equipes && eq >= 0 ? reglages.equipes[eq].couleur : '#8a97a1' }}>
              <button type="button" className="part-tuile-princ" onClick={() => point(e, 'reponse')} aria-label={`+1 bonne réponse : ${e}`}>
                <b>{e}</b>
                {prive && (
                  <span>
                    {pts} pt{Math.abs(pts) > 1 ? 's' : ''}
                    {auj ? ` · ${auj > 0 ? '+' : '−'}${Math.abs(auj)} auj.` : ''}
                  </span>
                )}
                {prive && !scores.participe.has(e) && <span className="part-rond" title="Pas encore participé aujourd’hui" />}
              </button>
              {reglages.idee && (
                <button type="button" className="part-tuile-idee" onClick={() => point(e, 'idee')} aria-label={`+1 bonne idée : ${e}`} title="+1 bonne idée, bel effort">
                  💡
                </button>
              )}
              {reglages.penalite && (
                <button type="button" className="part-tuile-moins" onClick={() => point(e, 'penalite')} aria-label={`−1 pénalité : ${e}`} title="−1 (jamais projeté)">
                  −1
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Bilan chez le professeur : qui reçoit le bonus (POUR LUI SEUL en deux écrans), « Copier la liste », « Nouvelle période ». */
function BilanProfesseur({ part, confirmer, setConfirmer }: { part: Participation; confirmer: boolean; setConfirmer: (b: boolean) => void }) {
  const r = part.reglages!
  const b = beneficiaires(r, part.eleves, part.points, part.maintenant)
  const [copie, setCopie] = useState(false)
  const texte = r.affichage === 'equipes' ? b.equipes.map((i) => `${r.equipes[i].nom} : ${r.equipes[i].membres.join(', ')}`).join('\n') : b.eleves.join(', ')
  const prive = part.role === 'prof'
  return (
    <div className="part-bilan-prof">
      <p className="part-bilan-prof-tete">{prive ? 'Pour toi seul · qui reçoit le bonus' : 'Qui reçoit le bonus'}</p>
      {prive ? (
        r.affichage === 'equipes' ? (
          <ul>
            {b.equipes.map((i) => (
              <li key={i}>
                <b>{r.equipes[i].nom}</b> : {r.equipes[i].membres.join(', ')}
              </li>
            ))}
          </ul>
        ) : (
          <p>{b.eleves.join(', ') || 'Personne pour l’instant.'}</p>
        )
      ) : (
        <p className="part-note">La liste n’est pas affichée (ce panneau est visible au tableau) : copie-la pour ton journal de classe.</p>
      )}
      <div className="part-ligne">
        <button type="button" className="part-bouton" onClick={() => void navigator.clipboard?.writeText(texte).then(() => setCopie(true), () => setCopie(false))}>
          {copie ? 'Liste copiée' : 'Copier la liste'}
        </button>
        {confirmer ? (
          <span className="part-confirmer" role="alertdialog" aria-label="Nouvelle période ?">
            Remettre les points à zéro et refaire les équipes ? Le bilan reste dans l’historique.
            <button type="button" className="part-bouton-plein" onClick={() => (setConfirmer(false), part.nouvellePeriode(r, periodeSuivante()))}>
              Nouvelle période
            </button>
            <button type="button" className="part-bouton" onClick={() => setConfirmer(false)}>
              Annuler
            </button>
          </span>
        ) : (
          <button type="button" className="part-bouton-plein" onClick={() => setConfirmer(true)}>
            Nouvelle période…
          </button>
        )}
      </div>
    </div>
  )
}

/** Nouvelle période : deux semaines (le professeur la change dans les réglages). */
function periodeSuivante(): Periode {
  const aujourdhui = new Date()
  const fin = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() + 14)
  return { debut: jourIso(aujourdhui), fin: jourIso(fin), libelle: `la fin de la période (${dateCourte(jourIso(fin))})` }
}

/** « Jusqu'à l'interro du ven. 4/12 », « Jusqu'au bulletin (18/12) ». */
const jusqua = (libelle: string) => (libelle.startsWith('le ') ? `Jusqu’au ${libelle.slice(3)}` : `Jusqu’à ${libelle}`)

// ---------- réglages ----------

/** Périodes proposées : la prochaine interro annoncée de la classe, le prochain bulletin, sinon une date choisie. */
function periodesProposees(agenda: Agenda | null, classe: string | null, maintenant: number): Periode[] {
  const auj = jourIso(new Date(maintenant))
  const res: Periode[] = []
  const interro = agenda?.evenements.filter((e) => e.type === 'interrogation' && e.classe_id === classe && e.du >= auj).sort((a, b) => a.du.localeCompare(b.du))[0]
  if (interro) res.push({ debut: auj, fin: interro.du, libelle: `l’interro du ${dateAvecJour(interro.du)}` })
  const bulletin = agenda?.periodes.filter((p) => p.remise >= auj).sort((a, b) => a.remise.localeCompare(b.remise))[0]
  if (bulletin) res.push({ debut: auj, fin: bulletin.remise, libelle: `le bulletin (${dateCourte(bulletin.remise)})` })
  return res
}

/**
 * Réglages (une fois par classe et par période) : classe et élèves (liste sur l'appareil), ce qui est projeté (équipes
 * d'office, sinon podium), équipes (4 à 6, au hasard ou à la main, noms à changer), points (bonne idée, pénalité,
 * prénom au tableau), période, règle du bonus ; « Projeter la règle », « Commencer ».
 */
export function ReglagesParticipationDialogue({ part, fermer }: { part: Participation; fermer: () => void }) {
  const id = useId()
  const { classe, eleves } = part
  const [brouillon, setBrouillon] = useState<ReglagesParticipation | null>(() => part.reglages ?? (eleves.length ? reglagesDefaut(eleves, new Date()) : null))
  const [main, setMain] = useState(false)
  const [autreDate, setAutreDate] = useState('')
  const [effacer, setEffacer] = useState(false)
  useEffect(() => {
    setBrouillon(part.reglages ?? (part.eleves.length ? reglagesDefaut(part.eleves, new Date()) : null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classe])
  const surListe = (l: ListeEleves | null) => {
    const el = elevesDe(l)
    setBrouillon((b) => (b ? { ...b, equipes: equipesAJour(b.equipes, el) } : el.length ? reglagesDefaut(el, new Date()) : null))
    part.relire()
  }
  const maj = (f: (b: ReglagesParticipation) => ReglagesParticipation) => setBrouillon((b) => (b ? f(b) : b))
  const periodes = periodesProposees(part.agenda, classe, part.maintenant)
  const choisirPeriode = (p: Periode) => maj((b) => ({ ...b, periode: p, regle: b.regle === regleDefaut(b.affichage, b.periode) || !b.regle ? regleDefaut(b.affichage, p) : b.regle }))
  const choisirAffichage = (a: Affichage) => maj((b) => ({ ...b, affichage: a, regle: b.regle === regleDefaut(b.affichage, b.periode) ? regleDefaut(a, b.periode) : b.regle }))
  const valider = (commencer: boolean, regle = false) => {
    if (!brouillon) return
    part.enregistrerReglages(brouillon)
    part.majAffiche((a) => ({ ...a, actif: commencer || a.actif || regle, visible: true, regle, bilan: false }))
    fermer()
  }
  const listeClasses = part.classes.length ? part.classes : [{ id: CLASSE_LOCALE, nom: 'Ma classe', niveau: null }]
  return (
    <div className="part-voile" role="presentation" onClick={(e) => e.stopPropagation()}>
      <div className="part-reglages" role="dialog" aria-modal="true" aria-labelledby={`${id}-t`}>
        <div className="part-reglages-tete">
          <div>
            <p className="part-surtitre">Projection · points de participation</p>
            <h2 id={`${id}-t`}>Réglages de la {part.nomClasse || 'classe'}</h2>
          </div>
          <button type="button" className="part-bouton" onClick={fermer}>
            ✕ Fermer
          </button>
        </div>
        <div className="part-reglages-corps">
          <div>
            <section className="part-bloc">
              <h3>Classe et élèves</h3>
              <label className="sr-only" htmlFor={`${id}-c`}>
                Classe
              </label>
              <select id={`${id}-c`} className="part-select" value={classe ?? ''} onChange={(e) => part.choisirClasse(e.target.value)}>
                {!classe && <option value="">Choisis la classe…</option>}
                {listeClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
              {classe && <EditeurEleves classeId={classe} onChange={surListe} titre={false} />}
            </section>
            {brouillon && (
              <section className="part-bloc">
                <h3>Ce qui est projeté</h3>
                <div className="part-choix2" role="radiogroup" aria-label="Ce qui est projeté">
                  <button type="button" role="radio" aria-checked={brouillon.affichage === 'equipes'} className={`part-carte-mode${brouillon.affichage === 'equipes' ? ' on' : ''}`} onClick={() => choisirAffichage('equipes')}>
                    <b>
                      Par équipes <span className="part-reco">recommandé</span>
                    </b>
                    Seuls les scores des équipes sont projetés. On gagne ensemble.
                  </button>
                  <button type="button" role="radio" aria-checked={brouillon.affichage === 'podium'} className={`part-carte-mode${brouillon.affichage === 'podium' ? ' on' : ''}`} onClick={() => choisirAffichage('podium')}>
                    <b>Individuel, podium</b>
                    Les 3 premiers et « + n points aujourd’hui ». Jamais le bas du classement.
                  </button>
                </div>
                {brouillon.affichage === 'equipes' && (
                  <>
                    <div className="part-ligne">
                      <span>Équipes :</span>
                      {[4, 5, 6].map((n) => (
                        <button key={n} type="button" className={`part-rond-nb${brouillon.nbEquipes === n ? ' on' : ''}`} aria-pressed={brouillon.nbEquipes === n} onClick={() => maj((b) => ({ ...b, nbEquipes: n, equipes: equipesAuHasard(eleves, n, b.equipes) }))}>
                          {n}
                        </button>
                      ))}
                      <button type="button" className="part-bouton" onClick={() => maj((b) => ({ ...b, equipes: equipesAuHasard(eleves, b.nbEquipes, b.equipes) }))}>
                        Tirer au hasard
                      </button>
                      <button type="button" className="part-bouton" aria-pressed={main} onClick={() => setMain((m) => !m)}>
                        Les faire moi-même
                      </button>
                    </div>
                    <ul className="part-equipes">
                      {brouillon.equipes.map((e, i) => (
                        <li key={i} style={{ ['--c' as string]: e.couleur }}>
                          <i aria-hidden="true" />
                          <label className="sr-only" htmlFor={`${id}-eq${i}`}>
                            Nom de l’équipe {i + 1}
                          </label>
                          <input id={`${id}-eq${i}`} type="text" value={e.nom} onChange={(ev) => maj((b) => ({ ...b, equipes: b.equipes.map((x, j) => (j === i ? { ...x, nom: ev.target.value } : x)) }))} />
                          <small>{e.membres.length}</small>
                        </li>
                      ))}
                    </ul>
                    {main && (
                      <ul className="part-affectation">
                        {[...eleves].sort((a, b) => a.localeCompare(b, 'fr', { numeric: true })).map((el) => (
                          <li key={el}>
                            <span>{el}</span>
                            <select
                              aria-label={`Équipe de ${el}`}
                              value={equipeDe(brouillon.equipes, el)}
                              onChange={(ev) => {
                                const k = Number(ev.target.value)
                                maj((b) => ({ ...b, equipes: b.equipes.map((x, j) => ({ ...x, membres: j === k ? [...x.membres.filter((m) => m !== el), el] : x.membres.filter((m) => m !== el) })) }))
                              }}
                            >
                              {brouillon.equipes.map((x, j) => (
                                <option key={j} value={j}>
                                  {x.nom}
                                </option>
                              ))}
                            </select>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
          {brouillon && (
            <div>
              <section className="part-bloc">
                <h3>Points</h3>
                <div className="part-ligne-pt">
                  <span className="pts plus">+1</span> Bonne réponse <span className="part-toujours">toujours</span>
                </div>
                <label className="part-ligne-pt">
                  <span className="pts plus">+1</span> Bonne idée, bel effort <small>même si la réponse est fausse</small>
                  <input type="checkbox" role="switch" checked={brouillon.idee} onChange={(e) => maj((b) => ({ ...b, idee: e.target.checked }))} />
                </label>
                <label className="part-ligne-pt">
                  <span className="pts moins">−1</span> Pénalité <small>jamais projetée</small>
                  <input type="checkbox" role="switch" checked={brouillon.penalite} onChange={(e) => maj((b) => ({ ...b, penalite: e.target.checked }))} />
                </label>
                <label className="part-ligne-pt">
                  <span className="pts">Aa</span> Prénom dans le « +1 » au tableau <small>désactivé d’office</small>
                  <input type="checkbox" role="switch" checked={brouillon.prenomProjete} onChange={(e) => maj((b) => ({ ...b, prenomProjete: e.target.checked }))} />
                </label>
              </section>
              <section className="part-bloc">
                <h3>Période</h3>
                <div className="part-ligne">
                  {periodes.map((p) => (
                    <button key={p.fin + p.libelle} type="button" className={`part-bouton${brouillon.periode.fin === p.fin && brouillon.periode.libelle === p.libelle ? ' on' : ''}`} aria-pressed={brouillon.periode.fin === p.fin && brouillon.periode.libelle === p.libelle} onClick={() => choisirPeriode(p)}>
                      {jusqua(p.libelle)}
                    </button>
                  ))}
                  <label className="part-autre-date">
                    Autre date…
                    <input
                      type="date"
                      value={autreDate}
                      min={jourIso(new Date(part.maintenant))}
                      onChange={(e) => {
                        setAutreDate(e.target.value)
                        if (e.target.value) choisirPeriode({ debut: jourIso(new Date(part.maintenant)), fin: e.target.value, libelle: `la fin de la période (${dateCourte(e.target.value)})` })
                      }}
                    />
                  </label>
                </div>
                <p className="part-note">
                  Jusqu’au <b>{dateAvecJour(brouillon.periode.fin)}</b>
                </p>
                <label className="part-lbl" htmlFor={`${id}-regle`}>
                  Règle du bonus, projetée au début
                </label>
                <textarea id={`${id}-regle`} className="part-regle" rows={2} value={brouillon.regle} onChange={(e) => maj((b) => ({ ...b, regle: e.target.value }))} />
                <p className="part-note">Modifiable. Le site ne touche jamais aux notes : c’est toi qui ajoutes le bonus.</p>
              </section>
              <section className="part-bloc">
                <h3>Données</h3>
                <ul className="part-donnees">
                  <li>Sur cet appareil seulement, comme tes annotations. Jamais envoyées au site.</li>
                  <li>Jamais dans la vidéo enregistrée ni dans le PowerPoint / PDF.</li>
                  <li>Historique des périodes gardé ({classe ? lireHistorique(classe).length : 0}) ; « Tout effacer » à tout moment.</li>
                </ul>
                {effacer ? (
                  <span className="part-confirmer" role="alertdialog" aria-label="Tout effacer ?">
                    Effacer la liste, les équipes, les points et l’historique de cette classe sur cet appareil ?
                    <button type="button" className="part-bouton danger" onClick={() => (setEffacer(false), part.effacerTout(), setBrouillon(null))}>
                      Tout effacer
                    </button>
                    <button type="button" className="part-bouton" onClick={() => setEffacer(false)}>
                      Annuler
                    </button>
                  </span>
                ) : (
                  <button type="button" className="part-bouton danger" onClick={() => setEffacer(true)}>
                    Tout effacer…
                  </button>
                )}
              </section>
            </div>
          )}
        </div>
        <div className="part-reglages-pied">
          {!eleves.length && <p className="part-note">Colle d’abord la liste des élèves (ou choisis « Numéros seulement »).</p>}
          <button type="button" className="part-bouton" disabled={!brouillon || !eleves.length} onClick={() => valider(false, true)}>
            Projeter la règle
          </button>
          <button type="button" className="part-bouton-plein" disabled={!brouillon || !eleves.length} onClick={() => valider(true)}>
            Commencer
          </button>
        </div>
      </div>
    </div>
  )
}

export { EQUIPES_DEFAUT }

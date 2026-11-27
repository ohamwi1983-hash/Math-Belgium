/**
 * Matière vue proposée en fin de projection (chantier M, décision du professeur du 27/11/2026, maquette
 * « fin-projection ») — logique PURE (aucun React, aucun appel réseau, aucun stockage) :
 * - ce que la projection a MONTRÉ : diapos atteintes par étape (« 14 diapos sur 14 », « vue en partie »),
 *   sous-parties touchées (une diapo de figure / d'exemple / d'atelier appartient au dernier intertitre
 *   `subheading` qui la précède dans l'étape : même découpage que `carnet.ts::structureChapitre`) ;
 * - les générateurs ouverts depuis la projection (bouton « Ouvrir le générateur » des cartes S'entraîner ;
 *   le QR code scanné par les élèves ne laisse aucune trace, il n'est pas compté) ;
 * - le créneau de l'HORAIRE pendant lequel la projection a eu lieu, pour une classe de l'année du
 *   chapitre (sinon rien : préparation chez soi) ;
 * - la séance du carnet à créer ou à COMPLÉTER (mêmes tables, mêmes fonctions que « Noter la séance » :
 *   `SaisieSeance`, `normaliserParties`, `ajouterSeance` / `modifierSeance` côté composant).
 * Rien n'est écrit sans le clic du professeur (« Enregistrer dans Mes classes »).
 */
import type { ChapterContent } from '../../content/types'
import { generateursChapitre, normaliserParties, structureChapitre, unitesCouvertes, unitesSection, type Classe, type PartieSection, type SaisieSeance, type Seance } from '../carnet'
import { champHeure, creneauxDuJour, seanceDuCreneau, type CaseHoraire, type Creneau, type GrilleHoraire, type HeureSupprimee } from '../horaire'

/* ------------------------------------------------------------------------------- ce qui a été montré */

/** Diapo réduite à ce qu'il faut ici (clé stable de `diapos.ts` + étape). */
export interface DiapoSuivie {
  cle: string
  sectionId: string
}

export interface EtapeMontree {
  /** Id de la section (étape). */
  id: string
  numero: number
  titre: string
  /** Diapos de l'étape atteintes pendant la projection / diapos de l'étape dans la projection. */
  vues: number
  total: number
  /** Sous-parties (`sectionId/slug`) dont au moins une diapo a été montrée. */
  sousParties: string[]
}

/** Rang du bloc (dans `section.blocks`) d'une diapo, d'après sa clé (`<id>:<rang>` ou `<id>:<rang>~<page>`) ;
 * `null` pour le titre, L'essentiel et les cartes Teste-toi (rattachés à l'étape, pas à une sous-partie). */
export function rangBloc(cle: string, sectionId: string): number | null {
  if (!cle.startsWith(`${sectionId}:`)) return null
  const m = /^(\d+)(?:~\d+)?$/.exec(cle.slice(sectionId.length + 1))
  return m ? Number(m[1]) : null
}

/** Sous-partie d'un bloc : le dernier intertitre de premier niveau AVANT lui dans l'étape (`null` : avant le
 * premier intertitre, ou étape sans intertitre). */
export function sousPartieDuBloc(chapitre: ChapterContent, structure: PartieSection[], sectionId: string, rang: number): string | null {
  const section = chapitre.sections.find((s) => s.id === sectionId)
  const partie = structure.find((s) => s.id === sectionId)
  if (!section || !partie) return null
  let n = 0
  section.blocks.forEach((b, i) => {
    if (i < rang && b.kind === 'subheading') n++
  })
  return n > 0 ? (partie.sousParties[n - 1]?.id ?? null) : null
}

/**
 * Étapes montrées, dans l'ordre du chapitre : une étape figure dès qu'UNE de ses diapos a été atteinte.
 * `diapos` = diapos de la projection (après découpage) ; `vues` = clés des diapos atteintes.
 */
export function etapesMontrees(chapitre: ChapterContent, diapos: DiapoSuivie[], vues: Iterable<string>): EtapeMontree[] {
  const atteintes = new Set(vues)
  const structure = structureChapitre(chapitre)
  const res: EtapeMontree[] = []
  for (const partie of structure) {
    const siennes = diapos.filter((d) => d.sectionId === partie.id)
    const vuesIci = siennes.filter((d) => atteintes.has(d.cle))
    if (vuesIci.length === 0) continue
    const sousParties = new Set<string>()
    for (const d of vuesIci) {
      const rang = rangBloc(d.cle, partie.id)
      const sp = rang === null ? null : sousPartieDuBloc(chapitre, structure, partie.id, rang)
      if (sp) sousParties.add(sp)
    }
    res.push({
      id: partie.id,
      numero: partie.numero,
      titre: partie.titre,
      vues: vuesIci.length,
      total: siennes.length,
      sousParties: partie.sousParties.map((p) => p.id).filter((id) => sousParties.has(id)),
    })
  }
  return res
}

/** Étape montrée en partie (toutes ses diapos n'ont pas été atteintes). */
export function enPartie(e: Pick<EtapeMontree, 'vues' | 'total'>): boolean {
  return e.vues < e.total
}

/**
 * Unités cochées d'office pour une étape montrée : toutes (étape montrée en entier, ou étape sans
 * sous-partie) ; sinon les sous-parties touchées — à défaut (seuls le titre ou L'essentiel ont été
 * montrés), la première sous-partie : l'étape a été COMMENCÉE.
 */
export function unitesProposees(e: EtapeMontree, partie: PartieSection | undefined): string[] {
  if (!partie) return [e.id]
  const toutes = unitesSection(partie)
  if (!enPartie(e) || partie.sousParties.length === 0) return toutes
  return e.sousParties.length > 0 ? e.sousParties : toutes.slice(0, 1)
}

export interface GenerateurOuvert {
  id: string
  titre: string
}

/** Générateurs ouverts (ordre d'ouverture, sans doublon), avec le titre de leur carte S'entraîner. */
export function generateursOuverts(chapitre: ChapterContent, ids: Iterable<string>): GenerateurOuvert[] {
  const tous = generateursChapitre(chapitre)
  const vus = new Set<string>()
  const res: GenerateurOuvert[] = []
  for (const id of ids) {
    if (vus.has(id)) continue
    vus.add(id)
    res.push({ id, titre: tous.find((g) => g.id === id)?.titre ?? '' })
  }
  return res
}

/* ------------------------------------------------------------------------------- créneau de l'horaire */

/** Une projection finie moins de 10 min après la fin du cours compte encore (on quitte à la sonnerie). */
export const TOLERANCE_FIN_MINUTES = 10

export interface CreneauProjection {
  classe: Classe
  creneau: Creneau
}

/**
 * Créneau de l'horaire pendant lequel la projection a eu lieu : une heure de cours (ou heure double) AUJOURD'HUI
 * d'une classe de l'année du chapitre, commencée au plus tard à la fin de la projection et finie au plus tôt
 * `TOLERANCE_FIN_MINUTES` avant son début ; plusieurs : le plus long recouvrement (puis le plus récent). Hors
 * de ses heures de cours (préparation chez soi), week-end, congé, heure supprimée par l'agenda : `null`.
 * `debut` / `fin` = minutes depuis minuit le jour `date` (projection commencée la veille : `debut` = 0).
 */
export function creneauDeLaProjection(p: {
  date: string
  debut: number
  fin: number
  niveau: string
  classes: Classe[]
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
  supprimee?: HeureSupprimee
}): CreneauProjection | null {
  const { creneaux } = creneauxDuJour(p.date, p.grilles, p.cases, { supprimee: p.supprimee })
  let meilleur: CreneauProjection | null = null
  let recouvrement = -1
  for (const c of creneaux) {
    const classe = p.classes.find((k) => k.id === c.classe_id)
    if (!classe || classe.niveau !== p.niveau) continue
    if (c.debut > p.fin || c.fin + TOLERANCE_FIN_MINUTES < p.debut) continue
    const r = Math.max(0, Math.min(c.fin, p.fin) - Math.max(c.debut, p.debut))
    if (r > recouvrement || (r === recouvrement && meilleur && c.debut > meilleur.creneau.debut)) {
      meilleur = { classe, creneau: c }
      recouvrement = r
    }
  }
  return meilleur
}

/* ------------------------------------------------------------------------------- séance à écrire */

export interface ChoixMatiere {
  classeId: string
  date: string
  /** Créneau choisi (`null` : sans heure précise). */
  creneau: Pick<Creneau, 'heureDebut' | 'heureFin' | 'debut' | 'fin'> | null
  /** Unités cochées (ids de sections ou de sous-parties). */
  unites: string[]
  generateurs: string[]
  devoir: string
  /** Date de remise (0007 appliqué et prochain cours connu), sinon `null`. */
  devoirPour: string | null
}

/** Séance déjà notée qu'on COMPLÈTE : celle du créneau (même classe, même date, heures qui se recouvrent) si
 * elle porte sur le même chapitre ; sans créneau, une séance de la classe ce jour-là sur ce chapitre.
 * `autre` : une séance sur un AUTRE chapitre occupe déjà le créneau (la nouvelle sera ajoutée à côté). */
export function seanceACompleter(choix: Pick<ChoixMatiere, 'classeId' | 'date' | 'creneau'>, chapitre: Pick<ChapterContent, 'levelSlug' | 'slug'>, seances: Seance[]): { seance: Seance | null; autre: Seance | null } {
  const memeChapitre = (s: Seance) => s.niveau === chapitre.levelSlug && s.chapitre === chapitre.slug
  if (choix.creneau) {
    const c: Creneau = { ecole_id: '', classe_id: choix.classeId, date: choix.date, jour: 0, nbHeures: 1, ...choix.creneau }
    const duCreneau = seances.filter((s) => seanceDuCreneau(c, [s]) !== null)
    const meme = duCreneau.find(memeChapitre) ?? null
    return { seance: meme, autre: meme ? null : (duCreneau[0] ?? null) }
  }
  const duJour = seances.filter((s) => s.classe_id === choix.classeId && s.date_seance === choix.date)
  return { seance: duJour.find(memeChapitre) ?? null, autre: null }
}

/** Ajoute une consigne à celle d'une séance existante (rien si vide ou déjà présente). */
export function devoirComplete(avant: string, ajout: string): string {
  const a = avant.trim()
  const b = ajout.trim()
  if (!b || a.includes(b)) return a
  return a ? `${a}\n${b}` : b
}

/**
 * Saisie à envoyer à `ajouterSeance` (`existante` absente) ou `modifierSeance` (`existante` : parties et
 * générateurs RÉUNIS à ceux déjà notés, consigne ajoutée, le reste gardé tel quel — devoir joint,
 * évaluation, objectif, remarque…). `devoirs` : 0007 appliqué (colonnes du devoir présentes).
 */
export function saisieMatiere(chapitre: ChapterContent, choix: ChoixMatiere, existante: Seance | null, devoirs: boolean): SaisieSeance {
  const structure = structureChapitre(chapitre)
  if (existante) {
    const unites = new Set([...unitesCouvertes(existante.parties, structure), ...existante.parties, ...choix.unites])
    const gens = [...existante.generateurs, ...choix.generateurs.filter((g) => !existante.generateurs.includes(g))]
    const devoir = devoirComplete(existante.devoir, choix.devoir)
    return {
      classe_id: existante.classe_id,
      date_seance: existante.date_seance,
      heure_debut: existante.heure_debut,
      heure_fin: existante.heure_fin,
      numero_heure: existante.numero_heure,
      numero_heure_fin: existante.numero_heure_fin ?? null,
      niveau: existante.niveau,
      chapitre: existante.chapitre,
      parties: normaliserParties(unites, structure),
      generateurs: gens,
      devoir,
      remarque: existante.remarque,
      ...(devoirs
        ? {
            devoir_pour: existante.devoir_pour ?? (choix.devoir.trim() ? choix.devoirPour : null),
            devoir_generateurs: existante.devoir_generateurs ?? [],
            objectif: existante.objectif ?? '',
            competences: existante.competences ?? [],
            evaluation_type: existante.evaluation_type ?? null,
            evaluation_parties: existante.evaluation_parties ?? [],
            evaluation_evenement: existante.evaluation_evenement ?? null,
            evaluation_generateurs: existante.evaluation_generateurs ?? [],
          }
        : {}),
    }
  }
  const c = choix.creneau
  return {
    classe_id: choix.classeId,
    date_seance: choix.date,
    heure_debut: c ? champHeure(c.debut) : null,
    heure_fin: c ? champHeure(c.fin) : null,
    numero_heure: c ? c.heureDebut : null,
    numero_heure_fin: c && c.heureFin > c.heureDebut ? c.heureFin : null,
    niveau: chapitre.levelSlug,
    chapitre: chapitre.slug,
    parties: normaliserParties(choix.unites, structure),
    generateurs: [...choix.generateurs],
    devoir: choix.devoir.trim(),
    remarque: '',
    ...(devoirs
      ? {
          devoir_pour: choix.devoir.trim() ? choix.devoirPour : null,
          devoir_generateurs: [],
          objectif: '',
          competences: [],
          evaluation_type: null,
          evaluation_parties: [],
          evaluation_evenement: null,
          evaluation_generateurs: [],
        }
      : {}),
  }
}

/* ------------------------------------------------------------------------------- proposition gardée */

/** Proposition (gardée dans le navigateur pour « Plus tard » : aucun nom d'élève, rien d'autre que la matière). */
export interface PropositionMatiere {
  /** Identifiant de la séance de projection (stable au rechargement de la page). */
  id: string
  niveau: string
  chapitre: string
  /** Horodatages (ms) du début et de la fin de la projection. */
  debut: number
  fin: number
  etapes: EtapeMontree[]
  generateurs: string[]
  /** Créneau trouvé dans l'horaire (classe, date, heures). */
  classeId: string
  date: string
  creneau: Pick<Creneau, 'heureDebut' | 'heureFin' | 'debut' | 'fin'>
}

/** Durée de vie d'une proposition gardée (« Plus tard »). */
export const JOURS_PROPOSITION = 14

/** Lecture tolérante d'une liste gardée (navigateur) : entrées mal formées ou trop vieilles écartées. */
export function lirePropositions(brut: unknown, maintenant: number): PropositionMatiere[] {
  if (!Array.isArray(brut)) return []
  const texte = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length < 200
  const nombre = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  const res: PropositionMatiere[] = []
  for (const x of brut) {
    if (!x || typeof x !== 'object') continue
    const p = x as Record<string, unknown>
    const c = p.creneau as Record<string, unknown> | null
    if (!texte(p.id) || !texte(p.niveau) || !texte(p.chapitre) || !nombre(p.debut) || !nombre(p.fin) || !texte(p.classeId) || !texte(p.date) || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) continue
    if (!c || !nombre(c.heureDebut) || !nombre(c.heureFin) || !nombre(c.debut) || !nombre(c.fin)) continue
    if (maintenant - p.fin > JOURS_PROPOSITION * 86_400_000) continue
    const etapes = Array.isArray(p.etapes)
      ? (p.etapes as Record<string, unknown>[]).filter((e) => e && texte(e.id) && nombre(e.numero) && nombre(e.vues) && nombre(e.total)).map((e) => ({
          id: e.id as string,
          numero: e.numero as number,
          titre: typeof e.titre === 'string' ? e.titre : '',
          vues: e.vues as number,
          total: e.total as number,
          sousParties: Array.isArray(e.sousParties) ? (e.sousParties as unknown[]).filter(texte) : [],
        }))
      : []
    const generateurs = Array.isArray(p.generateurs) ? (p.generateurs as unknown[]).filter(texte) : []
    res.push({ id: p.id, niveau: p.niveau, chapitre: p.chapitre, debut: p.debut, fin: p.fin, etapes, generateurs, classeId: p.classeId, date: p.date, creneau: { heureDebut: c.heureDebut, heureFin: c.heureFin, debut: c.debut, fin: c.fin } })
  }
  return res
}

/** Ajoute ou remplace (même id) une proposition ; 10 au plus, les plus récentes. */
export function avecProposition(liste: PropositionMatiere[], p: PropositionMatiere): PropositionMatiere[] {
  return [p, ...liste.filter((x) => x.id !== p.id)].sort((a, b) => b.fin - a.fin).slice(0, 10)
}

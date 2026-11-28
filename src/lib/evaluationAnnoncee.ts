/**
 * Évaluation annoncée (et devoir donné) : contenu PRÉCISÉ, fiche, modification, suppression — logique PURE
 * (maquettes « fiche-eval » validées le 28/11/2026, `.claude/rules/comptes.md`, « Évaluations et devoirs annoncés »).
 *
 * Une évaluation annoncée = l'événement « Interrogation » de l'agenda (0006 : date, heure, classe, premier
 * chapitre dans `chapitre`, NOM dans `intitule` — vide = « Interro ») + sa séance d'annonce (0007 / 0008) :
 * - `evaluation_parties` : les points (sections) retenus. Une entrée SANS « # » est une section du chapitre de la
 *   séance (format d'avant, toujours lu) ; `slug#section` = une section d'un AUTRE chapitre de la même année
 *   (≤ 67 caractères avec les contenus actuels : la limite de 0007 est 80). L'ordre des chapitres est celui de la
 *   première apparition.
 * - `evaluation_generateurs` : exercices retenus (ids uniques sur tout le site) ET codes des quiz « Connaître »
 *   des chapitres retenus ; liste VIDE = tous (règle de 0008, anciennes annonces).
 * - `evaluation_competences` (0013, facultative) : compétences évaluées `[1, 2, 3]`. Sans 0013, ou pour une
 *   ancienne annonce : déduites (Connaître d'office + compétences des exercices retenus).
 * Ce module ne dépend que du contenu des chapitres et de la table LÉGÈRE des générateurs (`generateursPilote.ts`).
 */
import { findChapter, LEVELS } from '../content/chaptersIndex'
import type { ChapterContent } from '../content/types'
import { titreCourtChapitre } from '../entrainement/export/examen'
import { generateursChapitre, structureChapitre, texteBrut } from './carnet'
import type { Evenement } from './agendaEvenements'
import { GENERATEURS_EVALUATION_PILOTE } from './generateursPilote'
import { competencesGenerateur } from './competencesGenerateur'
import { generatorLink } from './generatorLink'
import type { InterroPubliee } from './pageClasse'

export type Competence = 1 | 2 | 3
export const COMPETENCES: Competence[] = [1, 2, 3]
export const NOM_COMPETENCE: Record<Competence, string> = { 1: 'Connaître', 2: 'Appliquer', 3: 'Transférer' }

/* ------------------------------------------------------------------------------------------- nom */

/** Noms proposés en puces (« autre nom… » = texte libre). */
export const NOMS_PROPOSES = ['Interro', 'Contrôle', 'Bilan'] as const
export const NOM_MAX = 60
const ANCIEN_BILAN = 'Contrôle-bilan'

/** Nom affiché d'une évaluation d'après l'intitulé de l'événement (vide = « Interro », format d'avant compris). */
export function nomEvaluation(intitule: string | null | undefined, typeSeance?: string | null): string {
  const t = (intitule ?? '').replace(/\s+/g, ' ').trim()
  if (t) return t
  return typeSeance === 'bilan' ? ANCIEN_BILAN : 'Interro'
}

/** Intitulé enregistré : « Interro » reste vide (comme avant : les anciennes lectures disent « Interro »). */
export function intituleDeNom(nom: string): string {
  const t = nom.replace(/\s+/g, ' ').trim()
  return t === '' || t.toLowerCase() === 'interro' ? '' : t
}

/** Type de la séance d'annonce (0007) : « bilan » pour un bilan, sinon « annonce ». */
export function typeDeNom(nom: string): 'annonce' | 'bilan' {
  return /^(contr[ôo]le-)?bilan$/i.test(nom.trim()) ? 'bilan' : 'annonce'
}

export function erreurNom(nom: string): string | null {
  const t = nom.replace(/\s+/g, ' ').trim()
  if (t === '') return 'Écris le nom de l’évaluation (par exemple « Examen blanc »).'
  if (t.length > NOM_MAX) return `Nom trop long : ${NOM_MAX} caractères au plus.`
  return null
}

/** Désignation avec l'article, pour les phrases : « l'interro », « le contrôle », « l'évaluation « Examen blanc » ». */
export function designation(nom: string): { le: string; Le: string; feminin: boolean; court: string } {
  const t = nom.trim()
  const bas = t.toLowerCase()
  let le: string
  let feminin = true
  if (bas === 'interro' || bas === 'interrogation') le = 'l’interro'
  else if (bas === 'contrôle' || bas === 'controle' || bas === 'bilan' || bas === 'contrôle-bilan') {
    le = `le ${bas}`
    feminin = false
  } else le = `l’évaluation « ${t} »`
  return { le, Le: le.charAt(0).toUpperCase() + le.slice(1), feminin, court: bas === 'interro' || bas === 'contrôle' || bas === 'bilan' || bas === 'contrôle-bilan' ? bas : 'évaluation' }
}

/* ------------------------------------------------------------------------------------ dates */

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const jourSemaine = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay()
export const ecartJours = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 864e5)
/** « vendredi 4/12 ». */
export const jourLong = (iso: string) => `${JOURS[jourSemaine(iso)]} ${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`
/** « ven. 4/12 ». */
export const jourCourt = (iso: string) => `${JOURS[jourSemaine(iso)].slice(0, 3)}. ${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`

/** « dans 7 jours », « demain », « aujourd'hui », « il y a 2 jours ». */
export function dansJours(date: string, aujourdhui: string): string {
  const n = ecartJours(aujourdhui, date)
  if (n === 0) return 'aujourd’hui'
  if (n === 1) return 'demain'
  if (n === -1) return 'hier'
  return n > 0 ? `dans ${n} jours` : `il y a ${-n} jours`
}

/** Heure ordinale : « 3e heure », « 1re heure », « 3e–4e heure », « heure zéro ». */
export function heureOrdinale(debut: number | null, fin?: number | null): string {
  if (debut === null) return ''
  const o = (k: number) => (k === 0 ? 'heure zéro' : `${k}${k === 1 ? 're' : 'e'}`)
  if (fin !== null && fin !== undefined && fin > debut) return debut === 0 ? `heure zéro à ${o(fin)} heure` : `${o(debut)}–${o(fin)} heure`
  return debut === 0 ? 'heure zéro' : `${o(debut)} heure`
}

/** État d'un point d'après la matière vue (`annonceClasse.ts::etatsEtapes`). */
export type EtatPoint = { etat: 'vue'; date: string } | { etat: 'commencee'; date: string } | { etat: 'pas-vue' }

/** « vue lundi 23/11 (il y a 4 jours) », « vue hier », « vue aujourd'hui », « commencée jeudi 26/11 (hier) », « pas encore vue ». */
export function texteVu(e: EtatPoint | undefined, aujourdhui: string): string {
  if (!e || e.etat === 'pas-vue') return 'pas encore vue'
  const n = ecartJours(e.date, aujourdhui)
  if (e.etat === 'vue') {
    if (n <= 0) return 'vue aujourd’hui'
    if (n === 1) return 'vue hier'
    return `vue ${jourLong(e.date)} (il y a ${n} jours)`
  }
  if (n <= 0) return 'commencée aujourd’hui'
  return `commencée ${jourLong(e.date)} (${n === 1 ? 'hier' : `il y a ${n} jours`})`
}

/* ------------------------------------------------------------------------------ exercices */

export interface ExerciceEval {
  id: string
  titre: string
  competence: Competence
}

export interface PointEval {
  id: string
  numero: number
  /** Titre en RichText. */
  titre: string
  exercices: ExerciceEval[]
}

export interface ChapitreEval {
  niveau: string
  slug: string
  /** Titre court (« Fonctions exponentielles »), texte brut. */
  titre: string
  points: PointEval[]
  /** Code du quiz du chapitre (carte `recap.entrainement`), `null` sans quiz. */
  quiz: string | null
  /** Ligne « Connaître » retenue (compétence 1 cochée, et le quiz gardé s'il existe). */
  connaitre: boolean
}

export interface ContenuEval {
  nom: string
  competences: Competence[]
  chapitres: ChapitreEval[]
}

const sansCode = (label: string) => label.replace(/\s*\([^()]*\)\s*$/, '').trim()

/** Exercices d'un point (section) : ceux du panneau des évaluations (table légère, ordre de la table), sinon les
 * cartes « S'entraîner » de la section. Nom = libellé de la table, sinon titre de la carte, sinon le code. */
export function exercicesDuPoint(chapitre: ChapterContent, sectionId: string): ExerciceEval[] {
  const cartes = generateursChapitre(chapitre)
  const titreCarte = (id: string) => {
    const c = cartes.find((g) => g.id === id)
    return c ? texteBrut(c.titre) : ''
  }
  const table = GENERATEURS_EVALUATION_PILOTE.filter((g) => g.chapitreSlug === chapitre.slug && g.sectionId === sectionId)
  const vus = new Set<string>()
  const res: ExerciceEval[] = []
  if (table.length > 0) {
    for (const g of table) {
      if (vus.has(g.generatorId)) continue
      vus.add(g.generatorId)
      res.push({ id: g.generatorId, titre: sansCode(g.label) || titreCarte(g.generatorId) || g.generatorId, competence: (g.processus ?? 2) as Competence })
    }
    return res
  }
  for (const c of cartes.filter((g) => g.sectionId === sectionId)) {
    if (vus.has(c.id)) continue
    vus.add(c.id)
    res.push({ id: c.id, titre: texteBrut(c.titre) || c.id, competence: competencesGenerateur(c.id, texteBrut(c.titre))[0] ?? 2 })
  }
  return res
}

export function quizDuChapitre(chapitre: ChapterContent): string | null {
  return chapitre.recap.entrainement?.generatorId ?? null
}

export function titreCourt(chapitre: ChapterContent): string {
  return titreCourtChapitre(chapitre.slug, texteBrut(chapitre.title))
}

/* -------------------------------------------------------------------------- choix de l'écran */

/** Ce que l'écran d'annonce garde pour un chapitre. */
export interface ChoixChapitre {
  /** « niveau/slug ». */
  cle: string
  /** Ids des points cochés. */
  points: string[]
  /** Exercices touchés pour être retirés. */
  retires: string[]
  /** Ligne « Connaître » cochée (n'a d'effet que si la compétence 1 l'est). */
  connaitre: boolean
}

export interface ChoixEval {
  nom: string
  competences: Competence[]
  chapitres: ChoixChapitre[]
}

/** Un point reste-t-il après le filtre des compétences ? Il disparaît s'il avait des exercices et qu'aucun
 * n'est d'une compétence cochée ; un point sans aucun exercice reste (matière à étudier). */
export function pointVisible(exercices: ExerciceEval[], competences: Competence[]): boolean {
  return exercices.length === 0 || exercices.some((x) => competences.includes(x.competence))
}

/** Contenu retenu d'après les choix de l'écran (aperçu, enregistrement, texte copié). */
export function contenuDepuisChoix(c: ChoixEval): ContenuEval {
  const chapitres: ChapitreEval[] = []
  for (const ch of c.chapitres) {
    const [niveau, slug] = ch.cle.split('/')
    const contenu = niveau && slug ? findChapter(niveau, slug) : undefined
    if (!contenu) continue
    const structure = structureChapitre(contenu)
    const points: PointEval[] = []
    for (const s of structure) {
      if (!ch.points.includes(s.id)) continue
      const tous = exercicesDuPoint(contenu, s.id)
      if (!pointVisible(tous, c.competences)) continue
      points.push({ id: s.id, numero: s.numero, titre: s.titre, exercices: tous.filter((x) => c.competences.includes(x.competence) && !ch.retires.includes(x.id)) })
    }
    const quiz = quizDuChapitre(contenu)
    chapitres.push({ niveau, slug, titre: titreCourt(contenu), points, quiz, connaitre: c.competences.includes(1) && (quiz ? ch.connaitre : true) && points.length > 0 })
  }
  return { nom: c.nom.replace(/\s+/g, ' ').trim() || 'Interro', competences: [...c.competences].sort() as Competence[], chapitres: chapitres.filter((x) => x.points.length > 0) }
}

/* -------------------------------------------------------------------------------- stockage */

/** Parties (`evaluation_parties`) → points par chapitre (`slug`), dans l'ordre de première apparition. */
export function decoderParties(parties: string[], chapitreSeance: string): { slug: string; sections: string[] }[] {
  const res: { slug: string; sections: string[] }[] = []
  for (const p of parties) {
    const i = p.indexOf('#')
    const slug = i >= 0 ? p.slice(0, i) : chapitreSeance
    const section = i >= 0 ? p.slice(i + 1) : p.split('/')[0]
    if (!slug || !section) continue
    let ch = res.find((x) => x.slug === slug)
    if (!ch) res.push((ch = { slug, sections: [] }))
    if (!ch.sections.includes(section)) ch.sections.push(section)
  }
  return res
}

export function encoderParties(chapitres: { slug: string; points: { id: string }[] }[], chapitreSeance: string): string[] {
  return chapitres.flatMap((c) => c.points.map((p) => (c.slug === chapitreSeance ? p.id : `${c.slug}#${p.id}`)))
}

/** Ce qui est enregistré pour un contenu (séance d'annonce). */
export function stockageDepuisContenu(c: ContenuEval, chapitreSeance: string): { parties: string[]; generateurs: string[]; competences: Competence[] } {
  const gens = c.chapitres.flatMap((ch) => [...ch.points.flatMap((p) => p.exercices.map((x) => x.id)), ...(ch.connaitre && ch.quiz ? [ch.quiz] : [])])
  return { parties: encoderParties(c.chapitres, chapitreSeance), generateurs: [...new Set(gens)], competences: c.competences }
}

/** Séance d'annonce telle que la lit ce module (champs de 0007 / 0008 / 0013). */
export interface SeanceAnnonce {
  niveau: string
  chapitre: string
  evaluation_type?: string | null
  evaluation_parties?: string[]
  evaluation_generateurs?: string[]
  evaluation_competences?: number[]
}

/** Choix de l'écran d'après une évaluation enregistrée (modifier) ; aussi la base de la fiche. */
export function choixDepuisStockage(e: Pick<Evenement, 'intitule' | 'chapitre'>, s: SeanceAnnonce | undefined): ChoixEval {
  const nom = nomEvaluation(e.intitule, s?.evaluation_type)
  const [niveauEv, slugEv] = (e.chapitre ?? '').split('/')
  const niveau = s?.niveau ?? niveauEv ?? ''
  const chapitreSeance = s?.chapitre ?? slugEv ?? ''
  const blocs = s ? decoderParties(s.evaluation_parties ?? [], chapitreSeance) : []
  if (blocs.length === 0 && slugEv) blocs.push({ slug: slugEv, sections: [] })
  const retenus = s?.evaluation_generateurs ?? []
  const tout = retenus.length === 0
  const chapitres: ChoixChapitre[] = []
  const comps = new Set<Competence>()
  for (const b of blocs) {
    const contenu = findChapter(niveau, b.slug) ?? (niveauEv ? findChapter(niveauEv, b.slug) : undefined)
    if (!contenu) continue
    const retires: string[] = []
    for (const sec of b.sections) {
      for (const x of exercicesDuPoint(contenu, sec)) {
        if (tout || retenus.includes(x.id)) comps.add(x.competence)
        else retires.push(x.id)
      }
    }
    const quiz = quizDuChapitre(contenu)
    chapitres.push({ cle: `${contenu.levelSlug}/${contenu.slug}`, points: b.sections, retires, connaitre: !quiz || tout || retenus.includes(quiz) })
  }
  const stockees = (s?.evaluation_competences ?? []).filter((x): x is Competence => x === 1 || x === 2 || x === 3)
  // Sans 0013 (ou ancienne annonce) : Connaître d'office + compétences des exercices retenus.
  const competences: Competence[] = stockees.length > 0 ? [...new Set(stockees)].sort() : ([...new Set<Competence>([1, ...comps])].sort() as Competence[])
  return { nom, competences, chapitres }
}

/** Contenu d'une évaluation enregistrée (fiche, page des élèves, texte copié). */
export function contenuEnregistre(e: Pick<Evenement, 'intitule' | 'chapitre'>, s: SeanceAnnonce | undefined): ContenuEval {
  const choix = choixDepuisStockage(e, s)
  const c = contenuDepuisChoix(choix)
  // Une annonce sans séance (0007 absent) : le chapitre seul, sans point.
  if (c.chapitres.length === 0 && choix.chapitres.length > 0) {
    const [niveau, slug] = choix.chapitres[0].cle.split('/')
    const contenu = findChapter(niveau, slug)
    if (contenu) c.chapitres.push({ niveau, slug, titre: titreCourt(contenu), points: [], quiz: null, connaitre: false })
  }
  return c
}

/* --------------------------------------------------------------------- chapitre précédent */

/**
 * Chapitres ouverts d'office dans l'écran d'annonce (règle choisie, dite au professeur) : le chapitre EN COURS de
 * la classe (celui de sa dernière séance) ; et le chapitre PRÉCÉDENT (autre chapitre de la même année) si sa
 * dernière séance date d'au plus 14 jours — « la classe vient de le finir ». Dans le chapitre en cours, les points
 * vus ou commencés sont cochés ; dans le précédent, seulement ceux vus ces 7 derniers jours.
 */
export const JOURS_CHAPITRE_PRECEDENT = 14
export const JOURS_POINTS_PRECEDENT = 7

export function chapitrePrecedent(
  seances: { classe_id: string; niveau: string; chapitre: string; date_seance: string; parties: string[] }[],
  classeId: string,
  enCours: string,
  aujourdhui: string,
): string | null {
  const [niveau] = enCours.split('/')
  const derniere = new Map<string, string>()
  for (const s of seances) {
    if (s.classe_id !== classeId || s.niveau !== niveau || s.parties.length === 0) continue
    const cle = `${s.niveau}/${s.chapitre}`
    if (cle === enCours || !findChapter(s.niveau, s.chapitre)) continue
    if (!derniere.has(cle) || s.date_seance > (derniere.get(cle) as string)) derniere.set(cle, s.date_seance)
  }
  const meilleur = [...derniere.entries()].filter(([, d]) => d <= aujourdhui && ecartJours(d, aujourdhui) <= JOURS_CHAPITRE_PRECEDENT).sort((a, b) => (a[1] < b[1] ? 1 : -1))[0]
  return meilleur ? meilleur[0] : null
}

/* -------------------------------------------------------------------------- différences */

export interface Changement {
  quoi: 'Date' | 'Nom' | 'Compétences' | 'Points' | 'Exercices' | 'Consigne' | 'Pour le'
  lignes: string[]
}

export interface Moment {
  date: string
  heureDebut: number | null
  heureFin: number | null
}

export const texteMoment = (m: Moment) => `${jourCourt(m.date)}${m.heureDebut !== null ? ` · ${heureOrdinale(m.heureDebut, m.heureFin).replace(' heure', ' h')}` : ''}`

/** Ce qui va changer entre l'évaluation enregistrée et la saisie (récapitulatif « Ce qui va changer »). */
export function changementsEvaluation(avant: { moment: Moment; contenu: ContenuEval }, apres: { moment: Moment; contenu: ContenuEval }): Changement[] {
  const res: Changement[] = []
  const a = avant.moment
  const b = apres.moment
  if (a.date !== b.date || a.heureDebut !== b.heureDebut || a.heureFin !== b.heureFin) res.push({ quoi: 'Date', lignes: [`${texteMoment(a)} → ${texteMoment(b)}`] })
  if (avant.contenu.nom !== apres.contenu.nom) res.push({ quoi: 'Nom', lignes: [`${avant.contenu.nom} → ${apres.contenu.nom}`] })
  const ca = avant.contenu.competences
  const cb = apres.contenu.competences
  const comp = [...cb.filter((x) => !ca.includes(x)).map((x) => `+ ${NOM_COMPETENCE[x]}`), ...ca.filter((x) => !cb.includes(x)).map((x) => `− ${NOM_COMPETENCE[x]}`)]
  if (comp.length > 0) res.push({ quoi: 'Compétences', lignes: comp })
  const pts = (c: ContenuEval) => new Map(c.chapitres.flatMap((ch) => ch.points.map((p) => [`${ch.slug}#${p.id}`, `${p.numero}. ${texteBrut(p.titre)}`] as const)))
  const pa = pts(avant.contenu)
  const pb = pts(apres.contenu)
  const lp = [...[...pb].filter(([k]) => !pa.has(k)).map(([, t]) => `+ ${t}`), ...[...pa].filter(([k]) => !pb.has(k)).map(([, t]) => `− ${t}`)]
  if (lp.length > 0) res.push({ quoi: 'Points', lignes: lp })
  const exs = (c: ContenuEval) => new Map(c.chapitres.flatMap((ch) => ch.points.flatMap((p) => p.exercices.map((x) => [x.id, `${x.id} ${x.titre}`] as const))))
  const xa = exs(avant.contenu)
  const xb = exs(apres.contenu)
  const lx = [...[...xb].filter(([k]) => !xa.has(k)).map(([, t]) => `+ ${t}`), ...[...xa].filter(([k]) => !xb.has(k)).map(([, t]) => `− ${t}`)]
  if (lx.length > 0) res.push({ quoi: 'Exercices', lignes: lx })
  return res
}

/** « Fonctions exponentielles, point 7 ; Fonctions logarithmes, points 1 et 2 ». */
export function texteMatiere(c: ContenuEval): string {
  return c.chapitres
    .map((ch) => {
      const n = ch.points.map((p) => p.numero)
      if (n.length === 0) return ch.titre
      return `${ch.titre}, point${n.length > 1 ? 's' : ''} ${n.length > 1 ? `${n.slice(0, -1).join(', ')} et ${n[n.length - 1]}` : n[0]}`
    })
    .join(' ; ')
}

/** Message pour prévenir les élèves d'une modification. */
export function messageModification(o: { classe: string; avant: Moment; apres: Moment; nomAvant: string; contenu: ContenuEval }): string {
  const d = designation(o.nomAvant)
  const deplacee = o.avant.date !== o.apres.date || o.avant.heureDebut !== o.apres.heureDebut || o.avant.heureFin !== o.apres.heureFin
  const quand = `${jourLong(o.apres.date)}${o.apres.heureDebut !== null ? `, ${heureOrdinale(o.apres.heureDebut, o.apres.heureFin)}` : ''}`
  const debut = deplacee
    ? `Changement pour ${d.le} de mathématiques (${o.classe}) : ${d.feminin ? 'elle est déplacée' : 'il est déplacé'} au ${quand}.`
    : `Changement pour ${d.le} de mathématiques du ${quand} (${o.classe}) : le contenu change.`
  const nom = o.contenu.nom !== o.nomAvant ? ` Nouveau nom : ${o.contenu.nom}.` : ''
  const matiere = texteMatiere(o.contenu)
  return `${debut}${nom}${matiere ? ` Matière : ${matiere}.` : ''}`
}

/** Message pour prévenir les élèves d'une suppression. */
export function messageSuppression(o: { classe: string; nom: string; date: string }): string {
  const d = designation(o.nom)
  return `${d.Le} de mathématiques du ${jourLong(o.date)} (${o.classe}) est annulé${d.feminin ? 'e' : ''}.`
}

/* ------------------------------------------------------------------------------- devoir */

export interface ContenuDevoir {
  consigne: string
  pour: string | null
  niveau: string
  chapitre: string
  exercices: { id: string; titre: string }[]
}

export function exercicesDevoir(niveau: string, chapitre: string, ids: string[]): { id: string; titre: string }[] {
  const c = findChapter(niveau, chapitre)
  const cartes = c ? generateursChapitre(c) : []
  return ids.map((id) => ({ id, titre: texteBrut(cartes.find((g) => g.id === id)?.titre ?? '') || id }))
}

export function changementsDevoir(a: ContenuDevoir, b: ContenuDevoir): Changement[] {
  const res: Changement[] = []
  if ((a.pour ?? '') !== (b.pour ?? '')) res.push({ quoi: 'Pour le', lignes: [`${a.pour ? jourCourt(a.pour) : 'sans date'} → ${b.pour ? jourCourt(b.pour) : 'sans date'}`] })
  if (a.consigne.trim() !== b.consigne.trim()) res.push({ quoi: 'Consigne', lignes: [b.consigne.trim() ? `« ${b.consigne.trim()} »` : '(sans consigne)'] })
  const ia = a.exercices.map((x) => x.id)
  const ib = b.exercices.map((x) => x.id)
  const lx = [...b.exercices.filter((x) => !ia.includes(x.id)).map((x) => `+ ${x.id} ${x.titre}`), ...a.exercices.filter((x) => !ib.includes(x.id)).map((x) => `− ${x.id} ${x.titre}`)]
  if (lx.length > 0) res.push({ quoi: 'Exercices', lignes: lx })
  return res
}

export function messageModificationDevoir(o: { classe: string; contenu: ContenuDevoir }): string {
  const c = o.contenu
  const exos = c.exercices.length > 0 ? ` Exercices en ligne : ${c.exercices.map((x) => x.id).join(', ')}.` : ''
  return `Changement pour le devoir de mathématiques (${o.classe}) : ${c.pour ? `à rendre pour le ${jourLong(c.pour)}` : 'sans date de remise'}.${c.consigne.trim() ? ` Consigne : ${c.consigne.trim()}` : ''}${c.consigne.trim() && !/[.!?]$/.test(c.consigne.trim()) ? '.' : ''}${exos}`
}

export function messageSuppressionDevoir(o: { classe: string; pour: string | null }): string {
  return `Le devoir de mathématiques${o.pour ? ` pour le ${jourLong(o.pour)}` : ''} (${o.classe}) est annulé.`
}

/* ------------------------------------------------------------------------- séance vide */

/** La séance d'annonce n'a-t-elle rien d'autre que l'évaluation (ou le devoir) qu'on retire ? Alors elle part avec. */
export function seanceSansRienDAutre(
  s: { parties: string[]; generateurs: string[]; devoir: string; remarque: string; devoir_generateurs?: string[]; devoir_pour?: string | null; objectif?: string; competences?: string[]; evaluation_type?: string | null },
  retire: 'evaluation' | 'devoir',
): boolean {
  const matiere = s.parties.length > 0 || s.generateurs.length > 0
  const autres = (s.remarque ?? '').trim() !== '' || (s.objectif ?? '').trim() !== '' || (s.competences ?? []).length > 0
  const devoir = (s.devoir ?? '').trim() !== '' || (s.devoir_generateurs ?? []).length > 0
  const evaluation = !!s.evaluation_type
  return !matiere && !autres && (retire === 'evaluation' ? !devoir : !evaluation)
}

/** Chapitres de l'année d'une classe (pour « + Ajouter un chapitre »). */
export function chapitresDeLAnnee(niveau: string): ChapterContent[] {
  return LEVELS.find((l) => l.slug === niveau)?.chapters ?? []
}

/* --------------------------------------------------------------------------- texte copié */


export const SITE = 'https://math-belgium.vercel.app'
const absolu = (href: string) => (href.startsWith('/') ? `${SITE}${href}` : href)
const echap = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Texte pour le journal de classe / Smartschool : les MÊMES lignes que le bloc publié (`BlocEvaluation`), codes des
 * exercices compris, en texte ET en HTML. Sans « dans n jours » (le texte reste dans le journal).
 */
export function textesBloc(i: InterroPubliee, o: { classe: string; lienPlan: string | null }): { texte: string; html: string } {
  const nom = i.nom?.trim() || (i.type === 'bilan' ? 'Contrôle-bilan' : 'Interro')
  const titre = `Mathématiques (${o.classe}) — ${nom} ${jourLong(i.date)}${i.heure ? ` · ${i.heure}` : ''}`
  const comps = (i.competences ?? []).map((c) => NOM_COMPETENCE[c])
  const chapitres = i.chapitres ?? [{ niveau: i.niveau, chapitre: i.chapitre, titre: i.titre, points: i.etapes.map((e) => ({ ...e, exercices: [] })), connaitre: null }]
  const t: string[] = [titre]
  const h: string[] = [`<p><strong>${echap(titre)}</strong></p>`]
  if (comps.length > 0) {
    t.push(`Compétences évaluées : ${comps.join(' · ')}`)
    h.push(`<p>Compétences évaluées : ${echap(comps.join(' · '))}</p>`)
  }
  for (const ch of chapitres) {
    t.push('', ch.titre)
    h.push(`<p><strong>${echap(ch.titre)}</strong></p><ul>`)
    for (const p of ch.points) {
      t.push(`${p.numero}. ${texteBrut(p.titre)}`)
      const exos = p.exercices.map((x) => ({ x, href: ch.niveau ? absolu(generatorLink(ch.niveau, x.id)) : '' }))
      for (const { x, href } of exos) t.push(`   – ${x.id} ${x.titre}${href ? ` : ${href}` : ''}`)
      h.push(
        `<li>${p.numero}. ${echap(texteBrut(p.titre))}${exos.length > 0 ? `<ul>${exos.map(({ x, href }) => `<li>${href ? `<a href="${echap(href)}">${echap(x.id)}</a>` : echap(x.id)} ${echap(x.titre)}</li>`).join('')}</ul>` : ''}</li>`,
      )
    }
    h.push('</ul>')
  }
  if (!i.chapitres && i.generateurs.length > 0) {
    t.push('', `Pour t’entraîner : ${i.generateurs.map((g) => g.id).join(', ')}`)
    h.push(`<p>Pour t’entraîner : ${echap(i.generateurs.map((g) => g.id).join(', '))}</p>`)
  }
  const connaitre = chapitres.filter((c) => c.connaitre !== null)
  if (connaitre.length > 0) {
    const codes = connaitre.flatMap((c) => c.connaitre ?? [])
    const ligne = `Connaître : questions « formule » et quiz vrai/faux${codes.length > 0 ? ` — ${codes.join(', ')}` : ''}`
    t.push('', ligne)
    h.push(`<p>${echap(ligne)}</p>`)
  }
  if (o.lienPlan) {
    t.push('', `Je prépare mon interro : ${absolu(o.lienPlan)}`)
    h.push(`<p><a href="${echap(absolu(o.lienPlan))}">Je prépare mon interro</a></p>`)
  }
  return { texte: t.join('\n'), html: h.join('') }
}

/** Texte d'un devoir (journal de classe / Smartschool) : pour quand, consigne, exercices en ligne avec leur lien. */
export function textesDevoir(d: ContenuDevoir, o: { classe: string }): { texte: string; html: string } {
  const titre = `Mathématiques (${o.classe}) — Devoir${d.pour ? ` pour le ${jourLong(d.pour)}` : ''}`
  const t: string[] = [titre]
  const h: string[] = [`<p><strong>${echap(titre)}</strong></p>`]
  if (d.consigne.trim()) {
    t.push(d.consigne.trim())
    h.push(`<p>${echap(d.consigne.trim()).replace(/\n/g, '<br>')}</p>`)
  }
  if (d.exercices.length > 0) {
    t.push('Exercices en ligne :')
    h.push('<p>Exercices en ligne :</p><ul>')
    for (const x of d.exercices) {
      const href = absolu(generatorLink(d.niveau, x.id))
      t.push(`   – ${x.id} ${x.titre} : ${href}`)
      h.push(`<li><a href="${echap(href)}">${echap(x.id)}</a> ${echap(x.titre)}</li>`)
    }
    h.push('</ul>')
  }
  return { texte: t.join('\n'), html: h.join('') }
}

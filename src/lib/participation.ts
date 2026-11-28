/**
 * Points de participation (P6, maquette validée du 28/11/2026) — module PUR + stockage sur L'APPAREIL du
 * professeur (`localStorage`, try/catch partout). Décision du professeur : la liste des élèves n'est JAMAIS
 * envoyée au serveur, jamais dans la vidéo enregistrée, ni dans le PowerPoint / PDF, ni sur la page des élèves.
 *
 * Par classe (id du carnet, ou `locale` sans carnet) :
 * - `participation:eleves:<classe>` : la liste (prénoms collés depuis Smartschool / un tableur, ou « numéros
 *   seulement », 1 à n) — aussi saisie depuis la page de la classe dans Mes classes ;
 * - `participation:reglages:<classe>` : affichage (équipes d'office, sinon podium), équipes, points, période, règle ;
 * - `participation:points:<classe>` : les points de la période en cours (un événement par point, horodaté) ;
 * - `participation:historique:<classe>` : les périodes terminées (bilans) ;
 * - `participation:classe` : la dernière classe choisie.
 * Un élève est désigné par son prénom (unique dans la liste : doublons numérotés « Léa (2) »).
 */

export type Affichage = 'equipes' | 'podium'
export type GenrePoint = 'reponse' | 'idee' | 'penalite'

export interface ListeEleves {
  /** `numeros` : « 1 », « 2 »… jusqu'à `nombre` (aucun prénom sur l'appareil). */
  mode: 'noms' | 'numeros'
  noms: string[]
  nombre: number
}

export interface Equipe {
  nom: string
  couleur: string
  membres: string[]
}

export interface Periode {
  /** `AAAA-MM-JJ` (inclus). */
  debut: string
  fin: string
  /** « l'interro du ven. 4/12 », « le bulletin du 18/12 », « le 18/12 ». */
  libelle: string
}

export interface ReglagesParticipation {
  v: 1
  affichage: Affichage
  nbEquipes: number
  equipes: Equipe[]
  /** « +1 Bonne idée, bel effort » (d'office). */
  idee: boolean
  /** « −1 Pénalité » (désactivée d'office ; jamais projetée). */
  penalite: boolean
  /** Montrer le prénom de l'élève dans le « +1 » projeté (désactivé d'office : « +1 Les Pythagoriciens »). */
  prenomProjete: boolean
  periode: Periode
  regle: string
}

export interface PointParticipation {
  /** Horodatage. */
  t: number
  /** Élève (prénom ou numéro), ou null pour un point d'équipe entière. */
  e: string | null
  /** Équipe (indice) pour un point d'équipe entière. */
  eq?: number
  v: 1 | -1
  genre: GenrePoint
}

export interface PeriodeTerminee {
  periode: Periode
  affichage: Affichage
  equipes: { nom: string; points: number; membres: string[] }[]
  eleves: { nom: string; points: number }[]
  total: number
  termineeLe: number
}

/** Noms d'équipes : des mathématiciennes et mathématiciens de partout. Couleurs distinctes (et toujours avec leur nom). */
export const EQUIPES_DEFAUT: { nom: string; couleur: string }[] = [
  { nom: 'Les Pythagoriciens', couleur: '#0c828a' },
  { nom: 'Les Hypatie', couleur: '#1d52a8' },
  { nom: 'Les Thalès', couleur: '#b65c1f' },
  { nom: 'Les Al-Khwârizmî', couleur: '#6a4fb3' },
  { nom: 'Les Noether', couleur: '#7a1f3d' },
  { nom: 'Les Ramanujan', couleur: '#2f7a4f' },
]

// ---------- lecture d'une liste collée ----------

/**
 * Liste collée (Smartschool, tableur, liste de classe) : un prénom par ligne, ou séparés par des virgules /
 * points-virgules / tabulations. Espaces repliés, lignes vides et numéros d'ordre de tête (« 1. », « 12 - ») retirés,
 * doublons numérotés (« Léa », « Léa (2) »). Aucun caractère n'est refusé pendant la frappe (la lecture se fait ici).
 */
export function lireListe(texte: string): string[] {
  const morceaux = texte
    .split(/[\n\r;,\t]+/)
    .map((x) => x.replace(/^\s*\d+\s*[.)\-–—:]\s*/, '').replace(/\s+/g, ' ').trim())
    .filter((x) => x.length > 0 && x.length <= 60)
  const vus = new Map<string, number>()
  const res: string[] = []
  for (const m of morceaux) {
    const cle = m.toLocaleLowerCase('fr')
    const n = (vus.get(cle) ?? 0) + 1
    vus.set(cle, n)
    res.push(n > 1 ? `${m} (${n})` : m)
  }
  return res.slice(0, 60)
}

/** Les élèves d'une liste (prénoms ou numéros « 1 » à « n »). */
export function elevesDe(l: ListeEleves | null): string[] {
  if (!l) return []
  if (l.mode === 'numeros') return Array.from({ length: Math.max(0, Math.min(60, l.nombre)) }, (_, i) => String(i + 1))
  return l.noms
}

/** Texte à recopier sur un autre appareil (« Copier la liste ») : un prénom par ligne, ou « numéros : 24 ». */
export function texteListe(l: ListeEleves): string {
  return l.mode === 'numeros' ? `numéros : ${l.nombre}` : l.noms.join('\n')
}

/** « Coller une liste » : le texte copié par `texteListe` (ou n'importe quelle liste de prénoms). */
export function listeDepuisTexte(texte: string): ListeEleves {
  const m = /^\s*num[ée]ros\s*:\s*(\d{1,2})\s*$/i.exec(texte)
  if (m) return { mode: 'numeros', noms: [], nombre: Math.min(60, Number(m[1])) }
  return { mode: 'noms', noms: lireListe(texte), nombre: 0 }
}

// ---------- normalisation (recherche au clavier) ----------

export const sansAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('fr')

/** Élèves dont le prénom (ou le numéro) commence par `debut` (accents et casse ignorés), dans l'ordre alphabétique. */
export function proposer(eleves: string[], debut: string): string[] {
  const d = sansAccents(debut.trim())
  if (!d) return []
  return eleves.filter((e) => sansAccents(e).startsWith(d)).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
}

// ---------- équipes ----------

/** Mélange (Fisher-Yates) ; `alea` injectable pour les tests. */
export function melanger<T>(l: T[], alea: () => number = Math.random): T[] {
  const r = [...l]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Équipes tirées au hasard, de tailles égales à un près. Les noms déjà choisis sont gardés. */
export function equipesAuHasard(eleves: string[], n: number, avant: Equipe[] = [], alea: () => number = Math.random): Equipe[] {
  const k = Math.max(2, Math.min(6, n))
  const res: Equipe[] = Array.from({ length: k }, (_, i) => ({ nom: avant[i]?.nom ?? EQUIPES_DEFAUT[i].nom, couleur: avant[i]?.couleur ?? EQUIPES_DEFAUT[i].couleur, membres: [] }))
  melanger(eleves, alea).forEach((e, i) => res[i % k].membres.push(e))
  for (const eq of res) eq.membres.sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
  return res
}

/** Équipes remises d'accord avec la liste : élèves partis retirés, nouveaux élèves dans l'équipe la plus petite. */
export function equipesAJour(equipes: Equipe[], eleves: string[]): Equipe[] {
  const presents = new Set(eleves)
  const res = equipes.map((e) => ({ ...e, membres: e.membres.filter((m) => presents.has(m)) }))
  const places = new Set(res.flatMap((e) => e.membres))
  for (const e of eleves) {
    if (places.has(e) || res.length === 0) continue
    const plusPetite = res.reduce((a, b) => (b.membres.length < a.membres.length ? b : a))
    plusPetite.membres.push(e)
  }
  return res
}

export function equipeDe(equipes: Equipe[], eleve: string): number {
  return equipes.findIndex((e) => e.membres.includes(eleve))
}

// ---------- dates et période ----------

export const jourIso = (t: Date) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
export function dateCourte(iso: string): string {
  const [, m, j] = iso.split('-').map(Number)
  return `${j}/${m}`
}
export function dateAvecJour(iso: string): string {
  const [a, m, j] = iso.split('-').map(Number)
  return `${JOURS[new Date(a, m - 1, j).getDay()]} ${j}/${m}`
}

export function regleDefaut(affichage: Affichage, periode: Periode): string {
  return affichage === 'equipes' ? `Les 3 premières équipes gagnent +1 point à ${periode.libelle}.` : `Les 3 premiers gagnent +1 point à ${periode.libelle}.`
}

export function reglagesDefaut(eleves: string[], maintenant: Date): ReglagesParticipation {
  const fin = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + 14)
  const periode: Periode = { debut: jourIso(maintenant), fin: jourIso(fin), libelle: `la fin de la période (${dateCourte(jourIso(fin))})` }
  return {
    v: 1,
    affichage: 'equipes',
    nbEquipes: eleves.length >= 20 ? 5 : 4,
    equipes: equipesAuHasard(eleves, eleves.length >= 20 ? 5 : 4),
    idee: true,
    penalite: false,
    prenomProjete: false,
    periode,
    regle: regleDefaut('equipes', periode),
  }
}

// ---------- scores ----------

const debutDuJour = (maintenant: number) => {
  const d = new Date(maintenant)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export interface Scores {
  /** Points de la période par élève (pénalités comprises : chez le professeur seulement). */
  eleves: Map<string, number>
  /** Points d'aujourd'hui par élève (positifs et négatifs). */
  aujourdhui: Map<string, number>
  /** Élèves qui ont gagné au moins un point aujourd'hui. */
  participe: Set<string>
  /** Scores PROJETÉS des équipes : points positifs de leurs membres + points d'équipe entière (jamais de pénalité). */
  equipes: number[]
  /** Points positifs gagnés aujourd'hui par toute la classe (chiffre collectif projeté). */
  totalAujourdhui: number
  /** Points positifs de toute la période. */
  totalPeriode: number
}

export function calculerScores(eleves: string[], r: Pick<ReglagesParticipation, 'equipes'>, points: PointParticipation[], maintenant: number): Scores {
  const jour = debutDuJour(maintenant)
  const sc: Scores = { eleves: new Map(eleves.map((e) => [e, 0])), aujourdhui: new Map(), participe: new Set(), equipes: r.equipes.map(() => 0), totalAujourdhui: 0, totalPeriode: 0 }
  for (const p of points) {
    const auj = p.t >= jour
    if (p.e !== null) {
      sc.eleves.set(p.e, (sc.eleves.get(p.e) ?? 0) + p.v)
      if (auj) sc.aujourdhui.set(p.e, (sc.aujourdhui.get(p.e) ?? 0) + p.v)
      if (auj && p.v > 0) sc.participe.add(p.e)
    }
    if (p.v > 0 && p.genre !== 'penalite') {
      sc.totalPeriode++
      if (auj) sc.totalAujourdhui++
      const eq = p.e !== null ? equipeDe(r.equipes, p.e) : (p.eq ?? -1)
      if (eq >= 0 && eq < sc.equipes.length) sc.equipes[eq]++
    }
  }
  return sc
}

/** Points positifs d'un élève (classement du podium : jamais de pénalité au tableau). */
export function pointsPositifs(points: PointParticipation[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const p of points) if (p.e !== null && p.v > 0 && p.genre !== 'penalite') m.set(p.e, (m.get(p.e) ?? 0) + 1)
  return m
}

/** Marche du podium : noms ex aequo ensemble, au plus 3 marches (aucun autre rang, aucun « dernier »). */
export interface Marche {
  rang: 1 | 2 | 3
  noms: string[]
  points: number
}

export function podium(scores: Map<string, number>): Marche[] {
  const valeurs = [...new Set([...scores.values()].filter((v) => v > 0))].sort((a, b) => b - a).slice(0, 3)
  return valeurs.map((v, i) => ({
    rang: (i + 1) as 1 | 2 | 3,
    noms: [...scores.entries()].filter(([, p]) => p === v).map(([n]) => n).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true })),
    points: v,
  }))
}

/** Équipes classées (pour les barres et le bilan) : indices triés par score décroissant, nom en cas d'égalité. */
export function classementEquipes(r: Pick<ReglagesParticipation, 'equipes'>, scores: number[]): number[] {
  return r.equipes.map((_, i) => i).sort((a, b) => scores[b] - scores[a] || r.equipes[a].nom.localeCompare(r.equipes[b].nom, 'fr'))
}

/** Équipes (ou élèves) qui reçoivent le bonus : les trois premiers rangs (ex aequo compris, jamais un score nul). */
export function beneficiaires(r: ReglagesParticipation, eleves: string[], points: PointParticipation[], maintenant: number): { equipes: number[]; eleves: string[] } {
  if (r.affichage === 'equipes') {
    const s = calculerScores(eleves, r, points, maintenant).equipes
    const rangs = [...new Set(s.filter((v) => v > 0))].sort((a, b) => b - a).slice(0, 3)
    const eqs = r.equipes.map((_, i) => i).filter((i) => rangs.includes(s[i]))
    return { equipes: eqs, eleves: eqs.flatMap((i) => r.equipes[i].membres) }
  }
  return { equipes: [], eleves: podium(pointsPositifs(points)).flatMap((m) => m.noms) }
}

// ---------- « Interroger quelqu'un » ----------

/**
 * Tirage au sort : un élève qui n'a pas encore participé aujourd'hui a TROIS fois plus de chances. `exclus` : ceux
 * qu'on ne veut pas tirer (« Un autre » écarte le tiré précédent).
 */
export function tirerEleve(eleves: string[], participe: Set<string>, exclus: string[] = [], alea: () => number = Math.random): string | null {
  const candidats = eleves.filter((e) => !exclus.includes(e))
  const liste = candidats.length ? candidats : eleves
  if (!liste.length) return null
  const poids = liste.map((e) => (participe.has(e) ? 1 : 3))
  let x = alea() * poids.reduce((a, b) => a + b, 0)
  for (let i = 0; i < liste.length; i++) {
    x -= poids[i]
    if (x < 0) return liste[i]
  }
  return liste[liste.length - 1]
}

// ---------- stockage sur l'appareil ----------

const CLE = {
  eleves: (c: string) => `participation:eleves:${c}`,
  reglages: (c: string) => `participation:reglages:${c}`,
  points: (c: string) => `participation:points:${c}`,
  historique: (c: string) => `participation:historique:${c}`,
  classe: 'participation:classe',
}
export const PREFIXE_STOCKAGE = 'participation:'

function lire<T>(cle: string): T | null {
  try {
    const brut = localStorage.getItem(cle)
    return brut ? (JSON.parse(brut) as T) : null
  } catch {
    return null
  }
}
function ecrire(cle: string, v: unknown): boolean {
  try {
    if (v === null) localStorage.removeItem(cle)
    else localStorage.setItem(cle, JSON.stringify(v))
    return true
  } catch {
    return false
  }
}

export function lireEleves(classe: string): ListeEleves | null {
  const l = lire<Partial<ListeEleves>>(CLE.eleves(classe))
  if (!l || (l.mode !== 'noms' && l.mode !== 'numeros')) return null
  const noms = Array.isArray(l.noms) ? l.noms.filter((x): x is string => typeof x === 'string').slice(0, 60) : []
  const nombre = typeof l.nombre === 'number' && l.nombre > 0 ? Math.min(60, Math.floor(l.nombre)) : 0
  if (l.mode === 'noms' && !noms.length) return null
  if (l.mode === 'numeros' && !nombre) return null
  return { mode: l.mode, noms, nombre }
}
export const ecrireEleves = (classe: string, l: ListeEleves | null) => ecrire(CLE.eleves(classe), l)

export function lireReglages(classe: string): ReglagesParticipation | null {
  const r = lire<ReglagesParticipation>(CLE.reglages(classe))
  if (!r || r.v !== 1 || !Array.isArray(r.equipes) || !r.periode) return null
  return {
    ...r,
    affichage: r.affichage === 'podium' ? 'podium' : 'equipes',
    equipes: r.equipes.filter((e) => e && typeof e.nom === 'string' && Array.isArray(e.membres)).slice(0, 6),
    idee: r.idee !== false,
    penalite: !!r.penalite,
    prenomProjete: !!r.prenomProjete,
    regle: typeof r.regle === 'string' ? r.regle : '',
  }
}
export const ecrireReglages = (classe: string, r: ReglagesParticipation | null) => ecrire(CLE.reglages(classe), r)

export function lirePoints(classe: string): PointParticipation[] {
  const l = lire<PointParticipation[]>(CLE.points(classe))
  return Array.isArray(l) ? l.filter((p) => p && typeof p.t === 'number' && (p.v === 1 || p.v === -1)) : []
}
export const ecrirePoints = (classe: string, l: PointParticipation[]) => ecrire(CLE.points(classe), l.length ? l : null)

export function lireHistorique(classe: string): PeriodeTerminee[] {
  const l = lire<PeriodeTerminee[]>(CLE.historique(classe))
  return Array.isArray(l) ? l : []
}
export const ecrireHistorique = (classe: string, l: PeriodeTerminee[]) => ecrire(CLE.historique(classe), l.length ? l : null)

export const lireClasseChoisie = () => lire<string>(CLE.classe)
export const ecrireClasseChoisie = (c: string) => ecrire(CLE.classe, c)

/** « Tout effacer » d'une classe : liste, réglages, points et historique. */
export function toutEffacer(classe: string) {
  for (const k of [CLE.eleves(classe), CLE.reglages(classe), CLE.points(classe), CLE.historique(classe)]) ecrire(k, null)
}

/** Clôture d'une période : bilan gardé dans l'historique, points remis à zéro. */
export function cloturerPeriode(classe: string, r: ReglagesParticipation, eleves: string[], points: PointParticipation[], maintenant: number): PeriodeTerminee {
  const sc = calculerScores(eleves, r, points, maintenant)
  const bilan: PeriodeTerminee = {
    periode: r.periode,
    affichage: r.affichage,
    equipes: r.equipes.map((e, i) => ({ nom: e.nom, points: sc.equipes[i], membres: e.membres })),
    eleves: eleves.map((e) => ({ nom: e, points: sc.eleves.get(e) ?? 0 })),
    total: sc.totalPeriode,
    termineeLe: maintenant,
  }
  ecrireHistorique(classe, [bilan, ...lireHistorique(classe)].slice(0, 20))
  ecrirePoints(classe, [])
  return bilan
}

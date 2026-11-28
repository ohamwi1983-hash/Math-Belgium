/**
 * Page de classe à code (élèves SANS compte) — partie PURE et LÉGÈRE, partagée par la page élève
 * (`/classe`) et le carnet du professeur. Aucune dépendance au contenu des chapitres ni à Supabase :
 * la page élève ne télécharge que ce fichier, son composant et le client Supabase.
 *
 * Règles (`.claude/rules/comptes.md`, « Page de classe ») :
 * - le serveur ne contient QUE ce que le professeur publie (`pages_classe.contenu`, copie construite
 *   par `pageClasseContenu.ts`), lu par code via la fonction `lire_page_classe` (0010) ;
 * - côté élève, seul le CODE (et la dernière version vue, publiée par le professeur, pour le hors
 *   ligne) est gardé dans le navigateur — aucune donnée d'élève ne quitte l'appareil.
 */

/** 32 symboles sans 0/O ni 1/I (même alphabet que les codes d'invitation, `0001_comptes.sql`). */
export const ALPHABET_CODE_CLASSE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const LONGUEUR_CODE_CLASSE = 6
const CODE_VALIDE = /^[A-HJ-NP-Z2-9]{6}$/

/** Saisie de l'élève → code : espaces, tirets (« - – — ») et points ignorés, majuscules. La saisie
 * elle-même n'est jamais filtrée (règle CLAUDE.md) : on normalise seulement pour lire. */
export function normaliserCodeClasse(brut: string): string {
  return brut.replace(/[\s.\-‐-―−_]/g, '').toUpperCase()
}

export function codeClasseValide(code: string): boolean {
  return CODE_VALIDE.test(code)
}

/** Pourquoi une saisie n'est pas un code (message à hauteur d'élève), `null` si elle en est un. */
export function erreurCodeClasse(brut: string): string | null {
  const code = normaliserCodeClasse(brut)
  if (code === '') return 'Tape le code que ton professeur t’a donné.'
  if (/[01OI]/.test(code)) return 'Un code ne contient jamais de 0, de O, de 1 ni de I (on les confond trop facilement) : relis-le avec ton professeur.'
  if (!/^[A-Z0-9]+$/.test(code)) return 'Un code n’a que des lettres et des chiffres.'
  if (code.length < LONGUEUR_CODE_CLASSE) return `Il manque ${LONGUEUR_CODE_CLASSE - code.length === 1 ? 'un caractère' : `${LONGUEUR_CODE_CLASSE - code.length} caractères`} : un code en a 6.`
  if (code.length > LONGUEUR_CODE_CLASSE) return 'Un code a exactement 6 caractères : il y en a trop.'
  return codeClasseValide(code) ? null : 'Ce code n’est pas valable : relis-le.'
}

/** « K7Q4MX » → « K7Q-4MX » (lecture plus facile, au tableau comme à l'écran). */
export function codeAffiche(code: string): string {
  return code.length === 6 ? `${code.slice(0, 3)}-${code.slice(3)}` : code
}

/* --------------------------------------------------------------------------------- contenu publié */

/** Une étape (section) du chapitre : titre en RichText, précision (sous-parties vues, ou « sans … »). */
export interface EtapePubliee {
  id: string
  numero: number
  titre: string
  precision: string
}

export interface GenerateurPublie {
  id: string
  titre: string
  /** Compétence de l'exercice (1 Connaître, 2 Appliquer, 3 Transférer), depuis le 28/11/2026. */
  competence?: 1 | 2 | 3
}

/** Un point (section) d'un chapitre de l'évaluation, avec SES exercices (depuis le 28/11/2026). */
export interface PointPublie extends EtapePubliee {
  exercices: GenerateurPublie[]
}

/** Un chapitre de l'évaluation (plusieurs possibles depuis le 28/11/2026). */
export interface ChapitrePublie {
  niveau: string
  chapitre: string
  /** « Chapitre 3 — Suites » (numéro du professeur) ou « Suites » : jamais le numéro du site. */
  titre: string
  points: PointPublie[]
  /** Ligne « Connaître » : `null` = pas de ligne ; sinon les codes des quiz (vide : questions « formule » seules). */
  connaitre: string[] | null
}

export interface InterroPubliee {
  /** `AAAA-MM-JJ`. */
  date: string
  /** « 2e heure », « 09h35 → 10h25 » ; absente si l'heure n'est pas publiée. */
  heure?: string
  /** « Interro » ou « Contrôle-bilan ». */
  type: 'interro' | 'bilan'
  /** Titre court du chapitre (« Suites »), vide s'il est inconnu. */
  titre: string
  niveau: string
  chapitre: string
  etapes: EtapePubliee[]
  generateurs: GenerateurPublie[]
  /* Depuis le 28/11/2026 (facultatifs : une ancienne copie publiée reste lue avec les champs ci-dessus) : */
  /** Identifiant de l'évaluation (événement de l'agenda) : « date changée », « Ton interro a changé ». */
  id?: string
  /** Nom choisi par le professeur (« Interro », « Contrôle », « Bilan », « Examen blanc »…). */
  nom?: string
  competences?: (1 | 2 | 3)[]
  /** Chapitre par chapitre, les points et leurs exercices. */
  chapitres?: ChapitrePublie[]
  /** SUR L'APPAREIL SEULEMENT (jamais publié) : date vue auparavant, quand le professeur l'a changée. */
  avant?: string
}

export interface DevoirPublie {
  /** Date de remise (`AAAA-MM-JJ`), `null` sans date. */
  pour: string | null
  /** Séance où il a été donné. */
  donne_le: string
  texte: string
  niveau: string
  chapitre: string
  generateurs: GenerateurPublie[]
}

export interface SeancePubliee {
  date: string
  heure?: string
  niveau: string
  chapitre: string
  /** Titre court du chapitre. */
  titre: string
  etapes: EtapePubliee[]
}

/** Ce que le carnet publie (`pages_classe.contenu`, clés imposées par 0010). */
export interface ContenuPageClasse {
  v: 1
  interros: InterroPubliee[]
  devoirs: DevoirPublie[]
  seances: SeancePubliee[]
}

/** Interrupteurs de ce qui est publié (colonnes de `pages_classe`). */
export interface ReglagesPageClasse {
  publier_interros: boolean
  publier_devoirs: boolean
  publier_matiere: boolean
  publier_heure: boolean
  publier_nom: boolean
}

export const REGLAGES_PAGE_DEFAUT: ReglagesPageClasse = { publier_interros: true, publier_devoirs: true, publier_matiere: true, publier_heure: false, publier_nom: false }

/** Ce que reçoit l'élève (`lire_page_classe`, statut « ok ») : seules les rubriques publiées sont là. */
export interface PageEleve {
  classe: string
  /** Date de la dernière publication (ISO), `null` si rien n'a encore été publié. */
  misAJour: string | null
  professeur: string | null
  interros: InterroPubliee[] | null
  devoirs: DevoirPublie[] | null
  seances: SeancePubliee[] | null
}

export type ReponsePageClasse =
  | { statut: 'ok'; page: PageEleve }
  | { statut: 'inconnu' }
  | { statut: 'trop_essais'; reessayerDans: number }

/* ------------------------------------------------------------- lecture tolérante (côté élève) */

const SLUG = /^[a-z0-9-]{1,80}$/
const ID = /^[A-Za-z0-9_-]{1,80}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

function texte(v: unknown, max = 2000): string {
  return typeof v === 'string' ? v.slice(0, max) : ''
}

function dateOuNull(v: unknown): string | null {
  return typeof v === 'string' && DATE.test(v) ? v : null
}

function tableau(v: unknown, max: number): unknown[] {
  return Array.isArray(v) ? v.slice(0, max) : []
}

function objet(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function lireEtapes(v: unknown): EtapePubliee[] {
  return tableau(v, 20).flatMap((x) => {
    const o = objet(x)
    if (!o || typeof o.id !== 'string' || !ID.test(o.id)) return []
    const numero = typeof o.numero === 'number' && Number.isInteger(o.numero) && o.numero >= 0 && o.numero < 100 ? o.numero : 0
    return [{ id: o.id, numero, titre: texte(o.titre, 300), precision: texte(o.precision, 400) }]
  })
}

function lireCompetence(v: unknown): 1 | 2 | 3 | undefined {
  return v === 1 || v === 2 || v === 3 ? v : undefined
}

function lireGenerateurs(v: unknown, max = 12): GenerateurPublie[] {
  return tableau(v, max).flatMap((x) => {
    const o = objet(x)
    if (!o || typeof o.id !== 'string' || !ID.test(o.id)) return []
    const c = lireCompetence(o.competence)
    return [{ id: o.id, titre: texte(o.titre, 200) || o.id, ...(c ? { competence: c } : {}) }]
  })
}

function lireChapitres(v: unknown): ChapitrePublie[] | undefined {
  if (!Array.isArray(v)) return undefined
  return tableau(v, 8).flatMap((x) => {
    const o = objet(x)
    if (!o) return []
    const points: PointPublie[] = tableau(o.points, 30).flatMap((y) => {
      const p = objet(y)
      const e = p ? lireEtapes([p])[0] : undefined
      return p && e ? [{ ...e, exercices: lireGenerateurs(p.exercices, 20) }] : []
    })
    const connaitre = Array.isArray(o.connaitre) ? o.connaitre.filter((c): c is string => typeof c === 'string' && ID.test(c)).slice(0, 4) : null
    return [{ niveau: slugOuVide(o.niveau), chapitre: slugOuVide(o.chapitre), titre: texte(o.titre, 200), points, connaitre }]
  })
}

function slugOuVide(v: unknown): string {
  return typeof v === 'string' && SLUG.test(v) ? v : ''
}

function lireInterros(v: unknown): InterroPubliee[] {
  return tableau(v, 10).flatMap((x) => {
    const o = objet(x)
    const date = o ? dateOuNull(o.date) : null
    if (!o || !date) return []
    const heure = texte(o.heure, 60)
    const id = typeof o.id === 'string' && ID.test(o.id) ? o.id : ''
    const nom = texte(o.nom, 80).trim()
    const competences = Array.isArray(o.competences) ? [...new Set(o.competences.map(lireCompetence).filter((c): c is 1 | 2 | 3 => c !== undefined))].sort() : undefined
    const chapitres = lireChapitres(o.chapitres)
    const avant = dateOuNull(o.avant)
    return [
      {
        date,
        ...(heure ? { heure } : {}),
        type: o.type === 'bilan' ? 'bilan' : 'interro',
        titre: texte(o.titre, 200),
        niveau: slugOuVide(o.niveau),
        chapitre: slugOuVide(o.chapitre),
        etapes: lireEtapes(o.etapes),
        generateurs: lireGenerateurs(o.generateurs, 40),
        ...(id ? { id } : {}),
        ...(nom ? { nom } : {}),
        ...(competences ? { competences } : {}),
        ...(chapitres ? { chapitres } : {}),
        ...(avant && avant !== date ? { avant } : {}),
      },
    ]
  })
}

/** Nom affiché d'une interro publiée (« Interro », « Contrôle-bilan » d'une ancienne copie, nom choisi). */
export function nomInterro(i: Pick<InterroPubliee, 'nom' | 'type'>): string {
  return i.nom?.trim() || (i.type === 'bilan' ? 'Contrôle-bilan' : 'Interro')
}

/** Chapitres d'une interro publiée ; une ancienne copie (un chapitre, étapes et générateurs à part) est relue en un
 * chapitre dont les points n'ont pas d'exercices (ses générateurs restent dans `generateurs`). */
export function chapitresInterro(i: InterroPubliee): ChapitrePublie[] {
  if (i.chapitres) return i.chapitres
  return [{ niveau: i.niveau, chapitre: i.chapitre, titre: i.titre, points: i.etapes.map((e) => ({ ...e, exercices: [] })), connaitre: null }]
}

/** Points (`slug#section`) et exercices d'une interro publiée, dans l'ordre : mêmes clés que le plan de révision. */
export function clesInterro(i: InterroPubliee): { niveau: string; etapes: string[]; gens: string[] } {
  const chs = chapitresInterro(i)
  const etapes = chs.flatMap((c) => (c.chapitre ? c.points.map((p) => `${c.chapitre}#${p.id}`) : []))
  const gens = i.chapitres ? chs.flatMap((c) => [...c.points.flatMap((p) => p.exercices.map((x) => x.id)), ...(c.connaitre ?? [])]) : i.generateurs.map((g) => g.id)
  return { niveau: chs.find((c) => c.niveau)?.niveau ?? i.niveau, etapes, gens: [...new Set(gens)] }
}

/** Empreinte d'une interro (date, points, exercices, nom) : un plan de révision fait depuis cette annonce sait
 * qu'elle a changé (« Ton interro a changé : mettre mon plan à jour »). */
export function signatureAnnonce(o: { date: string; etapes: string[]; gens: string[]; nom: string }): string {
  return `${o.date}|${o.etapes.join(',')}|${[...o.gens].sort().join(',')}|${o.nom.trim().toLowerCase()}`
}

export function signatureInterro(i: InterroPubliee): string {
  const k = clesInterro(i)
  return signatureAnnonce({ date: i.date, etapes: k.etapes, gens: k.gens, nom: nomInterro(i) })
}

function lireDevoirs(v: unknown): DevoirPublie[] {
  return tableau(v, 12).flatMap((x) => {
    const o = objet(x)
    if (!o) return []
    const t = texte(o.texte)
    const generateurs = lireGenerateurs(o.generateurs)
    if (!t.trim() && generateurs.length === 0) return []
    return [{ pour: dateOuNull(o.pour), donne_le: dateOuNull(o.donne_le) ?? '', texte: t, niveau: slugOuVide(o.niveau), chapitre: slugOuVide(o.chapitre), generateurs }]
  })
}

function lireSeances(v: unknown): SeancePubliee[] {
  return tableau(v, 6).flatMap((x) => {
    const o = objet(x)
    const date = o ? dateOuNull(o.date) : null
    if (!o || !date) return []
    const heure = texte(o.heure, 60)
    return [{ date, ...(heure ? { heure } : {}), niveau: slugOuVide(o.niveau), chapitre: slugOuVide(o.chapitre), titre: texte(o.titre, 200), etapes: lireEtapes(o.etapes) }]
  })
}

/** Réponse de `lire_page_classe` → valeur sûre pour l'affichage (tout champ inattendu ignoré). */
export function lireReponsePageClasse(brut: unknown): ReponsePageClasse | null {
  const o = objet(brut)
  if (!o) return null
  if (o.statut === 'inconnu') return { statut: 'inconnu' }
  if (o.statut === 'trop_essais') {
    const s = typeof o.reessayer_dans === 'number' && o.reessayer_dans > 0 ? Math.ceil(o.reessayer_dans) : 60
    return { statut: 'trop_essais', reessayerDans: s }
  }
  if (o.statut !== 'ok') return null
  return {
    statut: 'ok',
    page: {
      classe: texte(o.classe, 60),
      misAJour: typeof o.mis_a_jour === 'string' ? o.mis_a_jour : null,
      professeur: typeof o.professeur === 'string' && o.professeur.trim() ? o.professeur.slice(0, 80) : null,
      interros: 'interros' in o ? lireInterros(o.interros) : null,
      devoirs: 'devoirs' in o ? lireDevoirs(o.devoirs) : null,
      seances: 'seances' in o ? lireSeances(o.seances) : null,
    },
  }
}

/** La version gardée sur l'appareil, filtrée à la date du jour comme le ferait le serveur (une
 * interro passée ou un devoir rendu ne doit pas réapparaître hors ligne). */
export function pageAuJour(page: PageEleve, aujourdhui: string): PageEleve {
  return {
    ...page,
    interros: page.interros ? page.interros.filter((i) => i.date >= aujourdhui) : null,
    devoirs: page.devoirs ? page.devoirs.filter((d) => d.pour === null || d.pour >= aujourdhui) : null,
  }
}

/* --------------------------------------------------------------------------------------- liens */

/** Lien vers une étape du chapitre (`#sectionId` = étape du parcours). `null` si un morceau est mal formé. */
export function lienEtape(niveau: string, chapitre: string, sectionId: string): string | null {
  return SLUG.test(niveau) && SLUG.test(chapitre) && ID.test(sectionId) ? `/${niveau}/${chapitre}#${sectionId}` : null
}

/**
 * Point d'accroche du **plan de révision** (« Ma progression » + « Plan de révision ») : tant que
 * cette constante vaut `null`, la page de classe n'affiche pas le bouton « Mon plan de révision ».
 * FORMAT DE L'ADRESSE (à utiliser tel quel par tout bouton « Je prépare mon interro », accueil compris) :
 * `<route>?date=AAAA-MM-JJ&niveau=<niveau>&chapitre=<chapitre>&etapes=<id>,<id>&gen=<id>,<id>&type=bilan`
 * — la date de l'interro, son chapitre, ses étapes (ids de sections), les générateurs retenus par le
 * professeur (`gen`, facultatif) et `type=bilan` pour un contrôle-bilan (absent = interro). Lus par
 * `PlanRevisionPage`, qui ouvre le plan prérempli « annoncé par ton professeur » ; rien d'autre n'est transmis.
 */
export const ROUTE_PLAN_REVISION: string | null = '/suivi/plan'

export function lienPlanRevision(
  i: Pick<InterroPubliee, 'date' | 'niveau' | 'chapitre' | 'etapes'> & Partial<Pick<InterroPubliee, 'generateurs' | 'type' | 'chapitres' | 'nom' | 'id' | 'titre'>>,
  route: string | null = ROUTE_PLAN_REVISION,
): string | null {
  if (!route) return null
  const p = new URLSearchParams({ date: i.date })
  const complete: InterroPubliee = { titre: '', generateurs: [], type: 'interro', ...i } as InterroPubliee
  const k = clesInterro(complete)
  const chs = chapitresInterro(complete).filter((c) => c.chapitre)
  const premier = chs[0]?.chapitre || i.chapitre
  if (k.niveau && premier) {
    p.set('niveau', k.niveau)
    p.set('chapitre', premier)
  }
  // Un seul chapitre : ids seuls (format d'avant) ; plusieurs : « slug#section ».
  const unSeul = chs.length <= 1
  const etapes = unSeul ? k.etapes.map((e) => e.split('#')[1] ?? e) : k.etapes
  if (etapes.length > 0) p.set('etapes', etapes.join(','))
  if (k.gens.length > 0) p.set('gen', k.gens.join(','))
  if (i.type === 'bilan') p.set('type', 'bilan')
  if (i.nom && i.nom.trim().toLowerCase() !== 'interro') p.set('nom', i.nom.trim())
  if (i.id) p.set('id', i.id)
  return `${route}?${p.toString().replace(/%2F/g, '/').replace(/%2C/g, ',')}`
}

/* ---------------------------------------------------------------------------------- dates */

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const JOURS_COURTS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

function parties(iso: string): { a: number; m: number; j: number; jour: number } | null {
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!r) return null
  const a = Number(r[1])
  const m = Number(r[2])
  const j = Number(r[3])
  return { a, m, j, jour: new Date(Date.UTC(a, m - 1, j)).getUTCDay() }
}

/** « Jeudi 3 décembre » (année ajoutée si elle diffère de celle d'aujourd'hui). */
export function dateEleve(iso: string, aujourdhui: string): string {
  const d = parties(iso)
  if (!d) return iso
  const annee = aujourdhui.slice(0, 4) !== iso.slice(0, 4) ? ` ${d.a}` : ''
  const jour = JOURS[d.jour]
  return `${jour.charAt(0).toUpperCase()}${jour.slice(1)} ${d.j === 1 ? '1er' : d.j} ${MOIS[d.m - 1]}${annee}`
}

/** Morceaux d'une date courte pour une pastille : « ven. », « 27 », « nov. ». */
export function morceauxDate(iso: string): { jour: string; numero: string; mois: string } | null {
  const d = parties(iso)
  return d ? { jour: JOURS_COURTS[d.jour], numero: d.j === 1 ? '1er' : String(d.j), mois: MOIS_COURTS[d.m - 1] } : null
}

/** Nombre de jours (calendrier) de `aujourdhui` à `date` (0 = aujourd'hui). */
export function joursAvant(date: string, aujourdhui: string): number {
  const a = parties(aujourdhui)
  const b = parties(date)
  if (!a || !b) return 0
  return Math.round((Date.UTC(b.a, b.m - 1, b.j) - Date.UTC(a.a, a.m - 1, a.j)) / 864e5)
}

/** Date locale `AAAA-MM-JJ` d'un instant. */
export function dateLocale(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** « mis à jour aujourd'hui à 16 h 20 », « hier à 16 h 20 », « le 21 novembre à 9 h 05 ». */
export function texteMiseAJour(iso: string | null, maintenant: Date): string {
  if (!iso) return 'rien n’a encore été publié'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const heure = `${d.getHours()} h ${String(d.getMinutes()).padStart(2, '0')}`
  const ecart = joursAvant(dateLocale(d), dateLocale(maintenant))
  if (ecart === 0) return `aujourd’hui à ${heure}`
  if (ecart === -1) return `hier à ${heure}`
  return `le ${d.getDate() === 1 ? '1er' : d.getDate()} ${MOIS[d.getMonth()]}${d.getFullYear() !== maintenant.getFullYear() ? ` ${d.getFullYear()}` : ''} à ${heure}`
}

/* --------------------------------------------------------------- mémoire de l'appareil (élève) */

/** Clés `localStorage` : le code de la classe, et la dernière version vue (hors ligne). Rien d'autre :
 * ni nom, ni réponse, ni activité de l'élève. */
export const CLE_CODE_CLASSE = 'classe:code'
export const CLE_DERNIERE_PAGE = 'classe:derniere'

export interface PageGardee {
  code: string
  /** Moment où cette version a été reçue du serveur (ISO). */
  recueLe: string
  page: PageEleve
}

export function lireCodeGarde(): string | null {
  try {
    const c = localStorage.getItem(CLE_CODE_CLASSE)
    return c && codeClasseValide(c) ? c : null
  } catch {
    return null
  }
}

export function garderCode(code: string): void {
  try {
    localStorage.setItem(CLE_CODE_CLASSE, code)
  } catch {
    /* navigation privée, stockage bloqué : la page marche sans */
  }
}

export function lirePageGardee(code: string): PageGardee | null {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_DERNIERE_PAGE) ?? 'null') as { code?: unknown; recueLe?: unknown; page?: unknown } | null
    if (!brut || brut.code !== code || typeof brut.recueLe !== 'string') return null
    const lu = lireReponsePageClasse({ statut: 'ok', ...(brut.page as object) })
    return lu && lu.statut === 'ok' ? { code, recueLe: brut.recueLe, page: lu.page } : null
  } catch {
    return null
  }
}

/** Garde la version reçue ; renvoie la page annotée : une interro dont le professeur a changé la date depuis la
 * dernière version vue sur CET appareil porte `avant` (« date changée »), gardé tant que la date reste nouvelle. */
export function garderPage(code: string, recue: PageEleve, recueLe: Date): PageEleve {
  const precedente = lirePageGardee(code)?.page.interros ?? []
  const page: PageEleve = {
    ...recue,
    interros: recue.interros
      ? recue.interros.map((i) => {
          const avant = i.id ? precedente.find((x) => x.id === i.id) : undefined
          if (!avant) return i
          const date = avant.date !== i.date ? (avant.avant ?? avant.date) : avant.avant
          return date && date !== i.date ? { ...i, avant: date } : i
        })
      : null,
  }
  const brute = {
    classe: page.classe,
    mis_a_jour: page.misAJour,
    ...(page.professeur ? { professeur: page.professeur } : {}),
    ...(page.interros ? { interros: page.interros } : {}),
    ...(page.devoirs ? { devoirs: page.devoirs } : {}),
    ...(page.seances ? { seances: page.seances } : {}),
  }
  try {
    localStorage.setItem(CLE_DERNIERE_PAGE, JSON.stringify({ code, recueLe: recueLe.toISOString(), page: brute }))
  } catch {
    /* sans stockage : pas de version hors ligne */
  }
  return page
}

/** « Quitter cette classe sur cet appareil » (ou code qui ne marche plus) : tout est oublié. */
export function oublierClasse(): void {
  try {
    localStorage.removeItem(CLE_CODE_CLASSE)
    localStorage.removeItem(CLE_DERNIERE_PAGE)
  } catch {
    /* rien à faire */
  }
}

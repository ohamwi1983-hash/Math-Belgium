/**
 * Plan de révision jusqu'à l'interro (planche 13, rapport des maquettes « côté élève » § 4) — logique
 * PURE : aucune lecture du navigateur, aucune date « maintenant » cachée (tout est passé en argument),
 * pour être testée seule (`scripts/tester-plan-revision.mts`). Le stockage du plan et des cases cochées
 * vit dans `planRevisionStockage.ts`, l'affichage dans `routes/PlanRevisionPage.tsx`.
 *
 * Principe : un plan DE BASE est calculé une fois pour toutes à partir des réglages (premier jour,
 * date de l'interro, minutes par jour, jour libre, étapes) — il ne dépend ni du jour courant ni des
 * cases cochées, donc il ne « bouge » pas d'un jour à l'autre. Puis, chaque fois qu'on l'affiche, les
 * tâches des jours PASSÉS restées non cochées sont reportées sur les jours qui viennent (jamais plus de
 * `SURPLUS_MAX` minutes de plus par jour) ; s'il ne reste pas assez de temps, on garde l'essentiel :
 * les cartes et un exercice par étape. Rien ne s'accumule.
 *
 * Dates : chaînes « AAAA-MM-JJ » (jour du calendrier local de l'élève), calculées en UTC pour
 * échapper aux changements d'heure.
 */

export type Jour = string

export interface GenerateurPlan {
  id: string
  titre: string
}

export interface EtapePlan {
  /** Identifiant stable, unique dans le plan (`{chapitre}#{section}`). */
  cle: string
  numero: number
  titre: string
  /** Générateurs de l'étape, le plus utile d'abord (celui à retravailler s'il y en a un). */
  generateurs: GenerateurPlan[]
  /** Nombre de cartes « Teste-toi » de l'étape. */
  cartes: number
  /** Cartes de l'étape marquées « À revoir » (état actuel, lu à chaque affichage). */
  cartesARevoir: number
  /** Étape « À retravailler » dans Mon suivi : un exercice de plus quand le temps le permet. */
  aRetravailler: boolean
}

export interface ReglagesPlan {
  /** Premier jour du plan (jour où l'élève l'a fait). */
  debut: Jour
  /** Jour de l'interro (aucune tâche ce jour-là). */
  interro: Jour
  /** Temps visé par jour : 10, 20 ou 30 minutes. */
  minutesParJour: number
  /** Jour de la semaine sans révision (0 = dimanche … 6 = samedi), `null` : aucun. */
  jourLibre: number | null
  /** Étapes à réviser, dans l'ordre du cours. */
  etapes: EtapePlan[]
}

export type TypeTache = 'relire' | 'exercices' | 'exemple' | 'cartes' | 'cartesRevoir' | 'blanche'

export interface Tache {
  /** Identifiant stable (case à cocher). Une tâche reportée garde l'identifiant d'origine, suivi de
   * `#i` pour un exercice reporté seul. */
  id: string
  type: TypeTache
  /** Clé de l'étape (absente pour l'évaluation blanche et les cartes « À revoir » de la veille). */
  etape?: string
  minutes: number
  /** Nombre d'exercices ou de cartes. */
  nombre: number
  generateur?: GenerateurPlan
  /** Cartes : 1 = première fois, 2 = le lendemain, 3 = trois jours après, 4 = une semaine après. */
  revue?: number
  /** Tâche reportée : jour prévu à l'origine. */
  reporteeDe?: Jour
  /** Cochée (ou, pour des cartes, les mêmes cartes revues un jour suivant). Rempli par `construirePlan`. */
  faite?: boolean
}

export type RoleJour = 'apprendre' | 'melange' | 'blanche' | 'veille' | 'essentiel' | 'libre' | 'interro'
export type StatutJour = 'fait' | 'partiel' | 'rate' | 'aujourdhui' | 'avenir' | 'passe'

export interface JourPlan {
  jour: Jour
  role: RoleJour
  statut: StatutJour
  /** Étapes travaillées ce jour (apprentissage), dans l'ordre. */
  etapes: string[]
  taches: Tache[]
  /** Tâches de CE jour reportées ailleurs (jour passé) : où elles sont allées, ou `null` si abandonnées. */
  reports: { tache: Tache; vers: Jour | null }[]
  /** Minutes prévues (tâches affichées). */
  minutes: number
}

export interface Plan {
  jours: JourPlan[]
  /** Moyenne des minutes prévues sur les jours de travail du plan de base. */
  minutesMoyennes: number
  /** Une partie du retard n'a pas pu être rattrapée : le plan a gardé l'essentiel. */
  essentielSeulement: boolean
  /** L'interro est passée (ou c'est aujourd'hui). */
  termine: boolean
}

/** Minutes estimées : un exercice de générateur, un exemple refait, « L'essentiel » relu. */
export const MINUTES_EXERCICE = 4
export const MINUTES_EXEMPLE = 5
export const MINUTES_RELIRE = 2
export const MINUTES_BLANCHE = 20
export const MINUTES_VEILLE = 10
/** Jamais plus de 10 minutes de plus qu'un jour normal, même pour rattraper un jour raté. */
export const SURPLUS_MAX = 10
/** Écarts des revues de cartes (répétition espacée) : le lendemain, 3 jours, une semaine. */
export const ECARTS_REVUES = [1, 3, 7] as const

export const minutesCartes = (n: number) => (n <= 0 ? 0 : Math.max(1, Math.ceil(n * 0.8)))

// --------------------------------------------------------------------------------------------
// Dates
// --------------------------------------------------------------------------------------------

const RE_JOUR = /^(\d{4})-(\d{2})-(\d{2})$/

export function estJour(s: unknown): s is Jour {
  if (typeof s !== 'string') return false
  const m = RE_JOUR.exec(s)
  if (!m) return false
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]
}

function versMs(j: Jour): number {
  const m = RE_JOUR.exec(j)
  if (!m) throw new Error(`jour invalide : ${j}`)
  return Date.UTC(+m[1], +m[2] - 1, +m[3])
}

function depuisMs(ms: number): Jour {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export const ajouterJours = (j: Jour, n: number): Jour => depuisMs(versMs(j) + n * 86400000)
export const ecartJours = (a: Jour, b: Jour): number => Math.round((versMs(b) - versMs(a)) / 86400000)
/** 0 = dimanche … 6 = samedi. */
export const jourSemaine = (j: Jour): number => new Date(versMs(j)).getUTCDay()

/** Jour local (calendrier de l'appareil) d'un instant. */
export function jourLocal(d: Date): Jour {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// --------------------------------------------------------------------------------------------
// Plan de base
// --------------------------------------------------------------------------------------------

interface JourBase {
  jour: Jour
  role: RoleJour
  etapes: string[]
  taches: Tache[]
}

const total = (taches: Tache[]) => taches.reduce((s, t) => s + t.minutes, 0)

/** Tâches d'apprentissage d'une étape, avec `nbEx` exercices (0 : seulement les cartes). */
function tachesEtape(jour: Jour, e: EtapePlan, nbEx: number, relire: boolean): Tache[] {
  const t: Tache[] = []
  if (relire) t.push({ id: `${jour}:relire:${e.cle}`, type: 'relire', etape: e.cle, minutes: MINUTES_RELIRE, nombre: 1 })
  if (nbEx > 0) {
    if (e.generateurs.length > 0) t.push({ id: `${jour}:ex:${e.cle}`, type: 'exercices', etape: e.cle, minutes: nbEx * MINUTES_EXERCICE, nombre: nbEx, generateur: e.generateurs[0] })
    else t.push({ id: `${jour}:exemple:${e.cle}`, type: 'exemple', etape: e.cle, minutes: MINUTES_EXEMPLE, nombre: 1 })
  }
  if (e.cartes > 0) t.push({ id: `${jour}:cartes:${e.cle}:1`, type: 'cartes', etape: e.cle, minutes: minutesCartes(e.cartes), nombre: e.cartes, revue: 1 })
  return t
}

/** Apprentissage d'un groupe d'étapes un même jour : le plus complet qui tient dans le budget. */
function apprendre(jour: Jour, etapes: EtapePlan[], budget: number): Tache[] {
  const essais: { ex: (e: EtapePlan) => number; relire: boolean }[] = [
    { ex: (e) => (e.aRetravailler ? 3 : 2), relire: true },
    { ex: () => 2, relire: true },
    { ex: () => 1, relire: true },
    { ex: () => 1, relire: false },
  ]
  let dernier: Tache[] = []
  for (const essai of essais) {
    dernier = etapes.flatMap((e) => tachesEtape(jour, e, essai.ex(e), essai.relire))
    if (total(dernier) <= budget) return dernier
  }
  // Trop d'étapes pour ce jour : les cartes de chacune, un exercice seulement pour une partie d'entre
  // elles (les étapes à retravailler gardent le leur le plus longtemps) ; les autres exercices
  // viendront l'avant-veille (évaluation blanche) et dans les jours de mélange.
  const nbEx = new Map(etapes.map((e) => [e.cle, 1]))
  const retrait = [...etapes.filter((e) => !e.aRetravailler).reverse(), ...etapes.filter((e) => e.aRetravailler).reverse()]
  for (const e of retrait) {
    nbEx.set(e.cle, 0)
    dernier = etapes.flatMap((x) => tachesEtape(jour, x, nbEx.get(x.cle) ?? 0, false))
    if (total(dernier) <= budget) return dernier
  }
  return dernier
}

/** Jour de mélange : exercices des étapes, celles à retravailler d'abord, à tour de rôle. */
function melanger(jour: Jour, etapes: EtapePlan[], minutes: number, decalage: number): Tache[] {
  if (etapes.length === 0) return []
  const ordre = [...etapes.filter((e) => e.aRetravailler), ...etapes.filter((e) => !e.aRetravailler)]
  const tournant = ordre.map((_, i) => ordre[(i + decalage) % ordre.length])
  const parEtape = new Map<string, number>()
  let reste = minutes
  for (let tour = 0; tour < 6 && reste > 0; tour++) {
    for (const e of tournant) {
      const cout = e.generateurs.length ? MINUTES_EXERCICE : MINUTES_EXEMPLE
      if (e.generateurs.length === 0 && (parEtape.get(e.cle) ?? 0) >= 1) continue
      if (cout > reste && parEtape.size > 0) continue
      parEtape.set(e.cle, (parEtape.get(e.cle) ?? 0) + 1)
      reste -= cout
    }
    if (tournant.every((e) => e.generateurs.length === 0)) break
  }
  const res: Tache[] = []
  for (const e of tournant) {
    const n = parEtape.get(e.cle)
    if (!n) continue
    if (e.generateurs.length) res.push({ id: `${jour}:ex:${e.cle}`, type: 'exercices', etape: e.cle, minutes: n * MINUTES_EXERCICE, nombre: n, generateur: e.generateurs[0] })
    else res.push({ id: `${jour}:exemple:${e.cle}`, type: 'exemple', etape: e.cle, minutes: MINUTES_EXEMPLE, nombre: 1 })
  }
  return res
}

/** Le seul jour avant l'interro (interro demain) : l'essentiel, cartes « À revoir » et un exercice par étape. */
function essentiel(jour: Jour, etapes: EtapePlan[], budget: number): Tache[] {
  const t: Tache[] = []
  const aRevoir = etapes.reduce((s, e) => s + e.cartesARevoir, 0)
  const cartes = aRevoir > 0 ? aRevoir : etapes.reduce((s, e) => s + e.cartes, 0)
  if (cartes > 0) t.push({ id: `${jour}:revoir`, type: 'cartesRevoir', minutes: Math.min(MINUTES_VEILLE, minutesCartes(cartes)), nombre: cartes })
  const prioritaires = [...etapes.filter((e) => e.aRetravailler), ...etapes.filter((e) => !e.aRetravailler)]
  for (const e of prioritaires) {
    const cout = e.generateurs.length ? MINUTES_EXERCICE : MINUTES_EXEMPLE
    if (total(t) + cout > budget + SURPLUS_MAX && t.some((x) => x.type !== 'cartesRevoir')) break
    if (e.generateurs.length) t.push({ id: `${jour}:ex:${e.cle}`, type: 'exercices', etape: e.cle, minutes: MINUTES_EXERCICE, nombre: 1, generateur: e.generateurs[0] })
    else t.push({ id: `${jour}:exemple:${e.cle}`, type: 'exemple', etape: e.cle, minutes: MINUTES_EXEMPLE, nombre: 1 })
  }
  return t
}

export function planDeBase(r: ReglagesPlan): JourBase[] {
  const budget = r.minutesParJour
  const nbJours = ecartJours(r.debut, r.interro)
  if (nbJours <= 0) return [{ jour: r.interro, role: 'interro', etapes: [], taches: [] }]
  const jours: JourBase[] = []
  for (let i = 0; i < nbJours; i++) {
    const jour = ajouterJours(r.debut, i)
    jours.push({ jour, role: r.jourLibre !== null && jourSemaine(jour) === r.jourLibre ? 'libre' : 'melange', etapes: [], taches: [] })
  }
  // Jamais un plan sans aucun jour de travail : si tous sont « libres », le dernier redevient un jour de travail.
  if (jours.every((j) => j.role === 'libre')) jours[jours.length - 1].role = 'melange'
  const travail = jours.filter((j) => j.role !== 'libre')
  const n = travail.length
  const etapes = r.etapes

  if (n === 1) {
    travail[0].role = 'essentiel'
    travail[0].etapes = etapes.map((e) => e.cle)
    travail[0].taches = essentiel(travail[0].jour, etapes, budget)
  } else {
    const veille = travail[n - 1]
    const blanche = n >= 4 ? travail[n - 2] : null
    const apprentissage = travail.slice(0, blanche ? n - 2 : n - 1)
    veille.role = 'veille'
    if (blanche) blanche.role = 'blanche'

    // Étapes réparties dans l'ordre : une par jour s'il y a assez de jours (les jours restants
    // mélangent), sinon par paquets égaux.
    const L = apprentissage.length
    const groupes: EtapePlan[][] = apprentissage.map(() => [])
    if (etapes.length <= L) etapes.forEach((e, i) => groupes[i].push(e))
    else etapes.forEach((e, i) => groupes[Math.floor((i * L) / etapes.length)].push(e))
    const apprisLe = new Map<string, Jour>()
    apprentissage.forEach((j, i) => {
      if (groupes[i].length) {
        j.role = 'apprendre'
        j.etapes = groupes[i].map((e) => e.cle)
        j.taches = apprendre(j.jour, groupes[i], budget)
        for (const e of groupes[i]) apprisLe.set(e.cle, j.jour)
      }
    })

    // Cartes qui reviennent : le lendemain, 3 jours, une semaine (sur le premier jour de travail à
    // partir de là, avant la veille, qui reprend de toute façon les cartes « À revoir »).
    const avantVeille = travail.slice(0, n - 1)
    for (const e of etapes) {
      const appris = apprisLe.get(e.cle)
      if (!appris || e.cartes <= 0) continue
      ECARTS_REVUES.forEach((ecart, k) => {
        const cible = ajouterJours(appris, ecart)
        const jour = avantVeille.find((j) => j.jour >= cible && j.jour > appris)
        if (!jour) return
        if (jour.taches.some((t) => t.etape === e.cle && t.type === 'cartes')) return
        const tache: Tache = { id: `${jour.jour}:cartes:${e.cle}:${k + 2}`, type: 'cartes', etape: e.cle, minutes: minutesCartes(e.cartes), nombre: e.cartes, revue: k + 2 }
        const plafond = jour.role === 'blanche' ? MINUTES_BLANCHE + SURPLUS_MAX : budget + SURPLUS_MAX
        if (total(jour.taches) + tache.minutes <= plafond) jour.taches.push(tache)
      })
    }

    // Jours de mélange : ce qu'il reste de temps, en exercices.
    let decalage = 0
    for (const j of apprentissage) {
      if (j.role !== 'melange') continue
      j.etapes = etapes.map((e) => e.cle)
      j.taches = [...melanger(j.jour, etapes, Math.max(MINUTES_EXERCICE, budget - total(j.taches)), decalage++), ...j.taches]
    }

    if (blanche) {
      blanche.etapes = etapes.map((e) => e.cle)
      blanche.taches = [{ id: `${blanche.jour}:blanche`, type: 'blanche', minutes: MINUTES_BLANCHE, nombre: 1 }, ...blanche.taches]
    }
    veille.etapes = etapes.map((e) => e.cle)
    const aRevoir = etapes.reduce((s, e) => s + e.cartesARevoir, 0)
    const cartes = aRevoir > 0 ? aRevoir : etapes.reduce((s, e) => s + e.cartes, 0)
    if (cartes > 0) veille.taches = [{ id: `${veille.jour}:revoir`, type: 'cartesRevoir', minutes: MINUTES_VEILLE, nombre: cartes }]
    else veille.taches = melanger(veille.jour, etapes, MINUTES_VEILLE, decalage).map((t) => (t.type === 'exercices' ? { ...t, nombre: 1, minutes: MINUTES_EXERCICE } : t))
  }
  jours.push({ jour: r.interro, role: 'interro', etapes: [], taches: [] })
  return jours
}

// --------------------------------------------------------------------------------------------
// Jours passés et reports
// --------------------------------------------------------------------------------------------

const RE_ID_CARTES = /^(\d{4}-\d{2}-\d{2}):cartes:(.+):\d$/

/** Cases cochées, et, par étape, le dernier jour où ses cartes ont été revues (case cochée). */
interface Coches {
  ids: ReadonlySet<string>
  cartesVues: Map<string, Jour>
}

function lireCoches(faites: Iterable<string>): Coches {
  const ids = new Set(faites)
  const cartesVues = new Map<string, Jour>()
  for (const id of ids) {
    const m = RE_ID_CARTES.exec(id)
    if (m && (cartesVues.get(m[2]) ?? '') < m[1]) cartesVues.set(m[2], m[1])
  }
  return { ids, cartesVues }
}

/** Ce qu'il reste à faire d'une tâche : la tâche entière, ou ses exercices non faits. Des cartes revues
 * un jour suivant (autre case de la même étape) comptent comme faites : ce sont les mêmes cartes. */
function resteAFaire(t: Tache, c: Coches): Tache[] {
  if (c.ids.has(t.id)) return []
  if (t.type === 'cartes' && t.etape) {
    const prevu = t.id.slice(0, 10)
    const vu = c.cartesVues.get(t.etape)
    if (vu && vu >= prevu) return []
  }
  if (t.type === 'exercices' && t.nombre > 1) {
    const res: Tache[] = []
    for (let i = 0; i < t.nombre; i++) {
      const id = `${t.id}#${i}`
      if (!c.ids.has(id)) res.push({ ...t, id, nombre: 1, minutes: MINUTES_EXERCICE })
    }
    return res
  }
  return [t]
}

const AUCUNE_COCHE: Coches = { ids: new Set(), cartesVues: new Map() }

/** Essentiel d'un retard : les cartes, et le premier exercice manqué de chaque étape. */
function trierEssentiel(manquees: Tache[]): { essentielles: Tache[]; autres: Tache[] } {
  const essentielles: Tache[] = []
  const autres: Tache[] = []
  const etapesVues = new Set<string>()
  for (const t of manquees) {
    if (t.type === 'cartes' || t.type === 'cartesRevoir') essentielles.push(t)
    else if ((t.type === 'exercices' || t.type === 'exemple') && t.etape && !etapesVues.has(t.etape)) {
      etapesVues.add(t.etape)
      essentielles.push(t)
    } else autres.push(t)
  }
  return { essentielles, autres }
}

export function construirePlan(r: ReglagesPlan, aujourdhui: Jour, faitesListe: Iterable<string>): Plan {
  const coches = lireCoches(faitesListe)
  const base = planDeBase(r)
  const termine = aujourdhui >= r.interro
  const jours: JourPlan[] = base.map((b) => ({
    jour: b.jour,
    role: b.role,
    statut: b.role === 'interro' ? (aujourdhui === b.jour ? 'aujourdhui' : aujourdhui > b.jour ? 'passe' : 'avenir') : aujourdhui === b.jour ? 'aujourdhui' : aujourdhui > b.jour ? 'passe' : 'avenir',
    etapes: b.etapes,
    taches: b.taches.map((t) => ({ ...t })),
    reports: [],
    minutes: total(b.taches),
  }))
  const travailBase = base.filter((b) => b.role !== 'libre' && b.role !== 'interro')
  const minutesMoyennes = travailBase.length ? Math.round(travailBase.reduce((s, b) => s + total(b.taches), 0) / travailBase.length) : 0

  // Jours passés : statut, et tâches manquées (l'évaluation blanche ne se reporte pas : 20 minutes ne
  // tiennent jamais dans le surplus permis ; elle reste proposée en tête du plan).
  const manquees: { tache: Tache; de: JourPlan }[] = []
  for (const j of jours) {
    if (j.statut !== 'passe' || j.role === 'interro') continue
    if (j.role === 'libre' || j.taches.length === 0) continue
    const reste = j.taches.flatMap((t) => resteAFaire(t, coches))
    const auDepart = j.taches.flatMap((t) => resteAFaire(t, AUCUNE_COCHE)).length
    j.statut = reste.length === 0 ? 'fait' : reste.length < auDepart ? 'partiel' : 'rate'
    for (const t of reste) {
      if (t.type === 'blanche') j.reports.push({ tache: t, vers: null })
      else manquees.push({ tache: { ...t, reporteeDe: t.reporteeDe ?? j.jour }, de: j })
    }
  }

  let essentielSeulement = false
  if (manquees.length && !termine) {
    // Jours qui peuvent recevoir : à partir d'aujourd'hui, jours de travail ; la veille ne prend que des cartes.
    const cibles = jours.filter((j) => j.jour >= aujourdhui && j.role !== 'libre' && j.role !== 'interro')
    const surplus = new Map(cibles.map((j) => [j.jour, 0]))
    const accepte = (j: JourPlan, t: Tache) => !(j.role === 'veille' && t.type !== 'cartes' && t.type !== 'cartesRevoir')
    // Une revue de cartes déjà prévue ce jour-là pour la même étape suffit (pas deux fois les mêmes cartes).
    const doublon = (j: JourPlan, t: Tache) =>
      (t.type === 'cartes' && j.taches.some((x) => x.type === 'cartes' && x.etape === t.etape)) || (t.type === 'cartesRevoir' && j.taches.some((x) => x.type === 'cartesRevoir'))
    const placer = (m: { tache: Tache; de: JourPlan }): boolean => {
      for (const j of cibles) {
        if (!accepte(j, m.tache)) continue
        if (doublon(j, m.tache)) {
          m.de.reports.push({ tache: m.tache, vers: j.jour })
          return true
        }
        const s = surplus.get(j.jour) ?? 0
        if (s + m.tache.minutes > SURPLUS_MAX) continue
        surplus.set(j.jour, s + m.tache.minutes)
        j.taches.push(m.tache)
        j.minutes += m.tache.minutes
        m.de.reports.push({ tache: m.tache, vers: j.jour })
        return true
      }
      return false
    }
    // Faire de la place pour l'essentiel : alléger un jour (relecture, exercices au-delà d'un par étape).
    const alleger = (m: { tache: Tache; de: JourPlan }): boolean => {
      for (const j of cibles) {
        if (!accepte(j, m.tache)) continue
        let libere = 0
        const besoin = m.tache.minutes - (SURPLUS_MAX - (surplus.get(j.jour) ?? 0))
        const nouvelles: Tache[] = []
        for (const t of j.taches) {
          if (libere >= besoin || t.reporteeDe) {
            nouvelles.push(t)
            continue
          }
          if (t.type === 'relire') {
            libere += t.minutes
            continue
          }
          if (t.type === 'exercices' && t.nombre > 1) {
            const enMoins = Math.min(t.nombre - 1, Math.ceil((besoin - libere) / MINUTES_EXERCICE))
            libere += enMoins * MINUTES_EXERCICE
            nouvelles.push({ ...t, nombre: t.nombre - enMoins, minutes: (t.nombre - enMoins) * MINUTES_EXERCICE })
            continue
          }
          nouvelles.push(t)
        }
        if (libere < besoin) continue
        j.taches = [...nouvelles, m.tache]
        j.minutes = total(j.taches)
        surplus.set(j.jour, (surplus.get(j.jour) ?? 0) + Math.max(0, m.tache.minutes - libere))
        m.de.reports.push({ tache: m.tache, vers: j.jour })
        return true
      }
      return false
    }
    const { essentielles, autres } = trierEssentiel(manquees.map((m) => m.tache))
    const parTache = new Map(manquees.map((m) => [m.tache.id, m]))
    for (const t of essentielles) {
      const m = parTache.get(t.id)!
      if (!placer(m) && !alleger(m)) {
        m.de.reports.push({ tache: t, vers: null })
        essentielSeulement = true
      }
    }
    for (const t of autres) {
      const m = parTache.get(t.id)!
      if (!placer(m)) {
        m.de.reports.push({ tache: t, vers: null })
        essentielSeulement = true
      }
    }
  } else if (manquees.length) {
    for (const m of manquees) m.de.reports.push({ tache: m.tache, vers: null })
  }

  for (const j of jours) for (const t of j.taches) t.faite = resteAFaire(t, coches).length === 0
  return { jours, minutesMoyennes, essentielSeulement, termine }
}

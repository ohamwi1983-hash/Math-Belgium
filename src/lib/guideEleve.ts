import type { Essai } from './suiviEssais'
import type { DevoirPublie, EtapePubliee, InterroPubliee, PageEleve } from './pageClasse'
import { joursAvant, lienPlanRevision, nomInterro } from './pageClasse'

/**
 * Côté élève plus clair (chantier E, maquettes `maquette-eleve/` du 27/11/2026) — logique PURE, sans DOM
 * ni stockage : bilan d'un exercice, état d'un générateur (à revoir / nouveau / réussi), résumé de la
 * carte « Ma classe » de l'accueil, aide « ? » de chaque page. Les lectures du navigateur sont faites par
 * l'appelant. Testée seule : `node --experimental-strip-types scripts/tester-guide-eleve.mts`.
 */

/* ------------------------------------------------------------------------------------- routes */

/** Page « M'entraîner » (publique, non indexée, jamais pré-rendue). */
export const ROUTE_ENTRAINER = '/entrainer'
/** Plan de révision (chantier A : « Je prépare mon interro »). */
export const ROUTE_PLAN = '/suivi/plan'

export function lienEntrainer(niveau?: string | null, chapitre?: string | null): string {
  const p = new URLSearchParams()
  if (niveau) p.set('niveau', niveau)
  if (niveau && chapitre) p.set('chapitre', chapitre)
  const q = p.toString()
  return q ? `${ROUTE_ENTRAINER}?${q}` : ROUTE_ENTRAINER
}

/* ---------------------------------------------------------------------------- fin d'exercice */

const pluriel = (n: number, un: string, plusieurs: string) => (n > 1 ? plusieurs : un)

/**
 * Bilan d'un exercice en UNE phrase, d'après le résultat de chaque écran (« o » juste du premier coup,
 * « a » juste avec une aide, « r » réponse révélée — mêmes lettres que `suivi:essais:v1`).
 * « 3 réponses justes du premier coup, 1 avec une aide. »
 */
export function bilanExercice(ecrans: string): string {
  const o = [...ecrans].filter((c) => c === 'o').length
  const a = [...ecrans].filter((c) => c === 'a').length
  const r = [...ecrans].filter((c) => c === 'r').length
  const total = o + a + r
  if (total === 0) return 'Exercice terminé.'
  if (total === 1) return o ? 'Réponse juste du premier coup.' : a ? 'Réponse juste, avec une aide.' : 'Réponse révélée : relis le corrigé, puis refais-en un.'
  if (o === total) return total === 2 ? 'Les deux réponses justes du premier coup.' : `Les ${total} réponses justes du premier coup.`
  const morceaux: string[] = []
  if (o) morceaux.push(`${o} ${pluriel(o, 'réponse juste', 'réponses justes')} du premier coup`)
  if (a) morceaux.push(o ? `${a} avec une aide` : `${a} ${pluriel(a, 'réponse juste', 'réponses justes')} avec une aide`)
  if (r) morceaux.push(`${r} ${pluriel(r, 'réponse révélée', 'réponses révélées')}`)
  const phrase = morceaux.join(', ')
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}.`
}

/** Ton du bilan (émoji et couleur de la carte de fin) : `bien` sans écran révélé ni aide, `aide`, `rate`. */
export function tonBilan(ecrans: string): 'bien' | 'aide' | 'rate' {
  return ecrans.includes('r') ? 'rate' : ecrans.includes('a') ? 'aide' : 'bien'
}

/* -------------------------------------------------------------- état d'un générateur (élève) */

export type EtatGenerateur = 'revoir' | 'nouveau' | 'reussi'

/**
 * État d'un générateur pour la page « M'entraîner », d'après SES essais (du plus ancien au plus récent) :
 * jamais fait → `nouveau` ; même règle que « À retravailler » de Mon suivi (`suiviChapitres.ts`) — au
 * moins 2 ratés sur les 3 derniers essais, ou dernier essai raté → `revoir` ; sinon `reussi`.
 */
export function etatGenerateur(essais: readonly Essai[] | undefined): EtatGenerateur {
  if (!essais || essais.length === 0) return 'nouveau'
  const trois = essais.slice(-3)
  const rates = trois.filter((e) => e.e.includes('r')).length
  if (rates >= 2 || essais[essais.length - 1].e.includes('r')) return 'revoir'
  return 'reussi'
}

export const LIBELLE_ETAT_GENERATEUR: Record<EtatGenerateur, string> = { revoir: 'à revoir', nouveau: 'nouveau', reussi: 'réussi' }

/** Ordre d'affichage : à revoir d'abord, puis nouveau, puis réussi (ordre du chapitre gardé à égalité). */
export function trierParEtat<T extends { etat: EtatGenerateur }>(liste: readonly T[]): T[] {
  const rang: Record<EtatGenerateur, number> = { revoir: 0, nouveau: 1, reussi: 2 }
  return liste.map((x, i) => ({ x, i })).sort((a, b) => rang[a.x.etat] - rang[b.x.etat] || a.i - b.i).map((y) => y.x)
}

/* ------------------------------------------------------------------- carte « Ma classe » */

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

/** « mardi 2/12 » (date `AAAA-MM-JJ`). */
export function dateCourteEleve(iso: string): string {
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!r) return iso
  const d = new Date(Date.UTC(Number(r[1]), Number(r[2]) - 1, Number(r[3])))
  return `${JOURS[d.getUTCDay()]} ${Number(r[3])}/${Number(r[2])}`
}

/** « aujourd'hui », « demain », « dans 5 jours » ; `null` si la date est passée. */
export function delaiEleve(date: string, aujourdhui: string): string | null {
  const n = joursAvant(date, aujourdhui)
  if (n < 0) return null
  if (n === 0) return 'aujourd’hui'
  if (n === 1) return 'demain'
  return `dans ${n} jours`
}

/** « point 3 », « points 2 et 5 », « points 6 à 8 », « points 1, 2 et 4 » (numéros triés, suites de 3 et plus regroupées). */
export function texteEtapes(etapes: readonly Pick<EtapePubliee, 'numero'>[]): string {
  const nums = [...new Set(etapes.map((e) => e.numero).filter((n) => n > 0))].sort((a, b) => a - b)
  if (nums.length === 0) return ''
  if (nums.length === 1) return `point ${nums[0]}`
  const morceaux: string[] = []
  for (let i = 0; i < nums.length; ) {
    let j = i
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++
    if (j - i >= 2) morceaux.push(`${nums[i]} à ${nums[j]}`)
    else for (let k = i; k <= j; k++) morceaux.push(String(nums[k]))
    i = j + 1
  }
  return `points ${morceaux.length === 1 ? morceaux[0] : `${morceaux.slice(0, -1).join(', ')} et ${morceaux[morceaux.length - 1]}`}`
}

export interface ResumeClasse {
  /** « 5e A ». */
  classe: string
  interro: {
    /** « Interro mardi 2/12 · dans 5 jours » (« Contrôle-bilan … »). */
    titre: string
    /** « Suites — points 6 à 8 ». */
    detail: string
    /** Lien du plan de révision prérempli (`lienPlanRevision`). */
    plan: string | null
    /** Date vue auparavant sur cet appareil (« date changée »). */
    avant?: string
    /** L'interro publiée (nouveau format : chapitres, points, exercices), pour « Voir le contenu ». */
    complete?: InterroPubliee
  } | null
  /** « Devoir pour jeudi 3/12 : … » (le plus proche), `null` sans devoir. */
  devoir: string | null
  /** Rien d'annoncé (interros et devoirs vides ou non publiés). */
  vide: boolean
}

function texteDevoir(d: DevoirPublie): string {
  const premiere = d.texte.split(/\r?\n/).map((l) => l.trim()).find(Boolean) ?? ''
  const quoi = premiere ? (premiere.length > 70 ? `${premiere.slice(0, 68).trimEnd()}…` : premiere) : d.generateurs.map((g) => g.id).join(', ')
  return `${d.pour ? `Devoir pour ${dateCourteEleve(d.pour)}` : 'Devoir'} : ${quoi}`
}

/**
 * Ce que montre la carte « Ma classe » : la prochaine interro publiée (et le lien « Je prépare mon
 * interro » vers le plan de révision prérempli, format de `pageClasse.ts::lienPlanRevision`), puis le
 * devoir à rendre le plus proche. La page doit déjà être filtrée à la date du jour (`pageAuJour`).
 */
export function resumeClasse(page: PageEleve, aujourdhui: string): ResumeClasse {
  const interros = (page.interros ?? []).filter((i) => i.date >= aujourdhui).sort((a, b) => a.date.localeCompare(b.date))
  const prochaine: InterroPubliee | undefined = interros[0]
  const devoirs = (page.devoirs ?? []).slice().sort((a, b) => (a.pour ?? '9999').localeCompare(b.pour ?? '9999'))
  let interro: ResumeClasse['interro'] = null
  if (prochaine) {
    const delai = delaiEleve(prochaine.date, aujourdhui)
    const detail = prochaine.chapitres
      ? prochaine.chapitres.map((c) => [c.titre, texteEtapes(c.points)].filter(Boolean).join(' — ')).join(' ; ')
      : [prochaine.titre, texteEtapes(prochaine.etapes)].filter(Boolean).join(' — ')
    interro = {
      titre: `${nomInterro(prochaine)} ${dateCourteEleve(prochaine.date)}${delai ? ` · ${delai}` : ''}`,
      detail,
      plan: lienPlanRevision(prochaine),
      ...(prochaine.avant ? { avant: prochaine.avant } : {}),
      ...(prochaine.chapitres ? { complete: prochaine } : {}),
    }
  }
  return { classe: page.classe, interro, devoir: devoirs[0] ? texteDevoir(devoirs[0]) : null, vide: !interro && devoirs.length === 0 }
}

/* --------------------------------------------------------------------------- aide « ? » */

export interface AidePage {
  titre: string
  /** Deux phrases : à quoi sert la page, quoi faire. */
  phrases: [string, string]
}

/**
 * Aide « ? » de chaque page côté élève, d'après l'adresse (et le fragment pour la page d'un chapitre).
 * `null` : pas d'aide (pages du professeur, générateurs — leur barre a déjà « Aa » et « Je bloque »).
 */
export function aideDePage(chemin: string, fragment: string): AidePage | null {
  const c = chemin.replace(/\/+$/, '') || '/'
  if (c === '/') return { titre: 'L’accueil', phrases: ['Ici, tu retrouves ton année : ton cours, tes exercices et la préparation de ton interro.', 'Touche « Mon cours » pour reprendre là où tu t’étais arrêté, ou entre le code de ta classe si ton professeur t’en a donné un.'] }
  if (c === ROUTE_ENTRAINER) return { titre: 'M’entraîner', phrases: ['Cette page sert à t’exercer sur un chapitre : une feuille à imprimer, ou un exercice corrigé tout de suite à l’écran.', 'Choisis ton chapitre, puis commence par les exercices « à revoir » : ce sont ceux qui t’ont posé problème.'] }
  if (c === ROUTE_PLAN) return { titre: 'Préparer mon interro', phrases: ['Ce plan découpe ta révision jour par jour jusqu’à ton interro, en quelques minutes par jour.', 'Fais les tâches du jour et coche-les : si tu rates un jour, le plan se décale tout seul.'] }
  if (c === '/suivi') return { titre: 'Ma progression', phrases: ['Cette page montre ce que tu as compris et tes derniers exercices, chapitre par chapitre.', 'Commence par « À retravailler » : chaque ligne te dit quel point relire et quel exercice refaire.'] }
  if (c === '/classe') return { titre: 'Ma classe', phrases: ['Cette page montre ce que ton professeur a publié pour ta classe : interros, devoirs et matière vue.', 'Entre une seule fois le code donné en classe : il reste sur cet appareil, rien d’autre n’est envoyé.'] }
  const morceaux = c.split('/').filter(Boolean)
  if (morceaux.length === 2 && morceaux[0] !== 'carnet' && morceaux[0] !== 'espace') {
    if (fragment === 'reviser') return { titre: 'Réviser', phrases: ['Cet onglet sert à vérifier ce que tu retiens du chapitre, avec des cartes « Teste-toi » et la fiche du chapitre.', 'Réponds dans ta tête, retourne la carte, puis dis honnêtement si tu savais : les cartes « à revoir » reviennent.'] }
    if (fragment === 'entrainer') return { titre: 'Exercices', phrases: ['Cet onglet rassemble les exercices corrigés du chapitre, point par point, et les feuilles à imprimer.', 'Choisis le point que tu viens de lire et fais 2 ou 3 exercices : la correction est immédiate.'] }
    if (fragment && fragment !== 'projeter') return { titre: 'Un point du cours', phrases: ['Chaque point explique une idée, avec « L’essentiel » à retenir et des exemples résolus pas à pas.', 'Lis jusqu’au bout, touche « J’ai compris », puis entraîne-toi sur ce point avant de passer au suivant.'] }
    return { titre: 'Le chapitre', phrases: ['Cette page présente le chapitre point par point : tu vois où tu en es et ce qu’il reste à lire.', 'Touche « Continuer » pour reprendre ta lecture ; les onglets « Réviser » et « Exercices » servent après.'] }
  }
  return null
}

/* ------------------------------------------------------------------- pastilles expliquées */

/** Une ligne par compétence (fin d'exercice : toucher une pastille l'explique). */
export const EXPLICATION_COMPETENCE: Record<1 | 2 | 3, string> = {
  1: 'c’est savoir restituer une définition, une propriété ou une formule du cours.',
  2: 'c’est utiliser une méthode du cours dans un cas nouveau.',
  3: 'c’est choisir toi-même la méthode dans une situation que tu n’as jamais vue.',
}

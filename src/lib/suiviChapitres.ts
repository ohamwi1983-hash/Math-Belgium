import type { ChapterContent, ChapterSection } from '../content/types'
import type { EtatCarte, EtatParcours } from './parcoursChapitre'
import { insecables } from './parcoursChapitre'
import { verdict, type Essai, type VerdictEssai } from './suiviEssais'

/**
 * « Mon suivi » (planche 13) : ce que la page montre, calculé à partir de ce qui est DÉJÀ gardé dans
 * le navigateur — progression des pages de chapitre (`parcours:…`), cartes « Teste-toi » (`cartes:…`)
 * et essais des générateurs (`suivi:essais:v1`). Fonctions pures : les lectures du navigateur sont
 * faites par l'appelant (`routes/SuiviPage.tsx`).
 *
 * Rattachement d'un générateur à son étape : les blocs `entrainement` des sections du chapitre
 * (`chaptersIndex.ts`), comme `trouverSectionGenerateur` ; la carte de fin de synthèse
 * (`recap.entrainement`, souvent le quiz vrai/faux du chapitre) forme une ligne « Tout le chapitre ».
 */

export interface GenerateurSuivi {
  id: string
  chantier: string
  titre: string
}

export interface EssaiDate extends Essai {
  generateur: string
  verdict: VerdictEssai
}

export type TonEtape = 'bien' | 'retravailler' | 'compris' | 'commence' | 'vierge'

export interface SuiviEtape {
  /** `undefined` : ligne « Tout le chapitre » (carte de fin de synthèse). */
  section?: ChapterSection
  numero: number | null
  titre: string
  /** Lien vers l'étape (ou la carte du chapitre). */
  href: string
  lue: boolean
  generateurs: GenerateurSuivi[]
  /** Tous les essais des générateurs de l'étape, du plus ancien au plus récent. */
  essais: EssaiDate[]
  reussis: number
  avecAide: number
  cartesTotal: number
  cartesSu: number
  cartesRevoir: number
  ton: TonEtape
  /** Pourquoi l'étape est « À retravailler » (phrases complètes, typographie française). */
  pourquoi: string | null
  /** Générateur à refaire en premier (celui qui a raté), sinon le premier de l'étape. */
  generateurConseille: GenerateurSuivi | null
  /** Instant de la dernière activité connue (essai), 0 sinon. */
  derniereActivite: number
}

export interface SuiviChapitre {
  chapter: ChapterContent
  etapes: SuiviEtape[]
  lues: number
  total: number
  /** Une activité quelconque (étape ouverte, comprise, carte, essai). */
  actif: boolean
  derniereActivite: number
}

const pluriel = (n: number, un: string, plusieurs: string) => (n > 1 ? plusieurs : un)

function generateursDe(blocks: ChapterSection['blocks']): GenerateurSuivi[] {
  const vus = new Set<string>()
  const res: GenerateurSuivi[] = []
  for (const b of blocks) {
    if (b.kind === 'entrainement' && !vus.has(b.generatorId)) {
      vus.add(b.generatorId)
      res.push({ id: b.generatorId, chantier: b.chantier, titre: b.title })
    }
  }
  return res
}

/** Pourquoi retravailler, d'après les 3 derniers essais de chaque générateur et les cartes « À revoir ». */
function raisons(generateurs: GenerateurSuivi[], essaisPar: Record<string, Essai[]>, cartesRevoir: number): { pourquoi: string | null; conseille: GenerateurSuivi | null; quand: number } {
  let pire: { g: GenerateurSuivi; texte: string; poids: number; quand: number } | null = null
  for (const g of generateurs) {
    const liste = essaisPar[g.id] ?? []
    if (!liste.length) continue
    const trois = liste.slice(-3)
    const rates = trois.filter((e) => verdict(e.e) === 'rate').length
    const dernier = liste[liste.length - 1]
    let candidat: { texte: string; poids: number } | null = null
    if (rates >= 2) candidat = { texte: `${rates} ratés sur tes ${trois.length} derniers essais de ${g.id}`, poids: rates }
    else if (verdict(dernier.e) === 'rate') candidat = { texte: `dernier essai de ${g.id} raté`, poids: 1 }
    if (candidat && (!pire || candidat.poids > pire.poids || (candidat.poids === pire.poids && dernier.t > pire.quand))) pire = { g, ...candidat, quand: dernier.t }
  }
  const morceaux: string[] = []
  if (pire) morceaux.push(pire.texte)
  if (cartesRevoir > 0) morceaux.push(`${cartesRevoir} ${pluriel(cartesRevoir, 'carte « Teste-toi » marquée', 'cartes « Teste-toi » marquées')} « À revoir »`)
  if (!morceaux.length) return { pourquoi: null, conseille: null, quand: 0 }
  const phrase = morceaux.join(', et ')
  return { pourquoi: insecables(`${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}.`), conseille: pire?.g ?? null, quand: pire?.quand ?? 0 }
}

function construireEtape(
  chapter: ChapterContent,
  section: ChapterSection | undefined,
  generateurs: GenerateurSuivi[],
  essaisPar: Record<string, Essai[]>,
  parcours: EtatParcours,
  cartes: Record<string, EtatCarte>,
  titreLigne: string,
): SuiviEtape {
  const essais: EssaiDate[] = generateurs
    .flatMap((g) => (essaisPar[g.id] ?? []).map((e) => ({ ...e, generateur: g.id, verdict: verdict(e.e) })))
    .sort((a, b) => a.t - b.t)
  const nbCartes = section?.cartes?.length ?? 0
  let cartesSu = 0
  let cartesRevoir = 0
  for (let i = 0; i < nbCartes; i++) {
    const etat = cartes[`${section!.id}:${i}`]
    if (etat === 'su') cartesSu++
    else if (etat === 'revoir') cartesRevoir++
  }
  const lue = !!section && parcours.lues.includes(section.id)
  const ouverte = !!section && parcours.derniere === section.id
  const { pourquoi, conseille } = raisons(generateurs, essaisPar, cartesRevoir)
  const reussis = essais.filter((e) => e.verdict !== 'rate').length
  const avecAide = essais.filter((e) => e.verdict === 'aide').length
  const ton: TonEtape = pourquoi ? 'retravailler' : essais.length ? 'bien' : lue ? 'compris' : ouverte || cartesSu > 0 ? 'commence' : 'vierge'
  const base = `/${chapter.levelSlug}/${chapter.slug}`
  return {
    section,
    numero: section?.number ?? null,
    titre: titreLigne,
    href: section ? `${base}#${encodeURIComponent(section.id)}` : base,
    lue,
    generateurs,
    essais,
    reussis,
    avecAide,
    cartesTotal: nbCartes,
    cartesSu,
    cartesRevoir,
    ton,
    pourquoi,
    generateurConseille: conseille ?? generateurs[0] ?? null,
    derniereActivite: essais.length ? essais[essais.length - 1].t : 0,
  }
}

export function suiviChapitre(
  chapter: ChapterContent,
  essaisPar: Record<string, Essai[]>,
  parcours: EtatParcours,
  cartes: Record<string, EtatCarte>,
  titreCourt: (s: ChapterSection) => string,
): SuiviChapitre {
  const etapes = chapter.sections.map((s) => construireEtape(chapter, s, generateursDe(s.blocks), essaisPar, parcours, cartes, titreCourt(s)))
  const fin = chapter.recap.entrainement
  if (fin && !etapes.some((e) => e.generateurs.some((g) => g.id === fin.generatorId))) {
    etapes.push(construireEtape(chapter, undefined, [{ id: fin.generatorId, chantier: fin.chantier, titre: fin.title }], essaisPar, parcours, cartes, 'Tout le chapitre'))
  }
  const derniereActivite = Math.max(0, ...etapes.map((e) => e.derniereActivite))
  const actif = parcours.derniere !== null || parcours.lues.length > 0 || Object.keys(cartes).length > 0 || derniereActivite > 0
  return { chapter, etapes, lues: parcours.lues.length, total: chapter.sections.length, actif, derniereActivite }
}

/** Les étapes « À retravailler » d'un chapitre, la plus récemment ratée d'abord. */
export function aRetravailler(c: SuiviChapitre): SuiviEtape[] {
  return c.etapes.filter((e) => e.ton === 'retravailler').sort((a, b) => b.derniereActivite - a.derniereActivite || (a.numero ?? 99) - (b.numero ?? 99))
}

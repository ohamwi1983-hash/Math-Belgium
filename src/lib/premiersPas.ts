/**
 * Carte « Premiers pas » du tableau de bord (`/espace`, maquette « premiers » validée le 27/11/2026) :
 * six étapes pour qu'un professeur tout neuf règle le site, chacune cochée AUTOMATIQUEMENT d'après les
 * données réelles — jamais une case à cocher à la main :
 *   1. Ton école           : au moins une école (Réglages → Mes écoles) ;
 *   2. Tes classes         : au moins une classe (0002) ;
 *   3. Ton horaire         : une grille ET au moins une case de la semaine (0003) ;
 *   4. Ton ordre des chapitres (FACULTATIF) : un ordre enregistré (0011), ou « Passer cette étape »
 *      (repère du navigateur) ;
 *   5. Projeter un premier chapitre : une projection lancée depuis ce navigateur (repère local posé par
 *      `LanceurProjection`, rien n'est envoyé) ;
 *   6. Annoncer une évaluation : une interrogation dans l'agenda (0006) ou une séance qui annonce une
 *      interro / un contrôle-bilan (0007).
 * « Masquer » est mémorisé dans le navigateur (par professeur) et se défait depuis Réglages ; la carte
 * disparaît d'elle-même quand les six étapes sont faites. PUR sauf les petites fonctions de mémoire
 * (`localStorage`, try/catch partout : navigation privée, stockage bloqué → la carte reste utilisable).
 */

export type ClePremierPas = 'ecole' | 'classes' | 'horaire' | 'ordre' | 'projeter' | 'annoncer'

export interface EtapePremiersPas {
  cle: ClePremierPas
  numero: number
  titre: string
  phrase: string
  fait: boolean
  facultatif: boolean
  /** Bouton vers le bon écran. */
  action: { libelle: string; to: string }
}

export interface DonneesPremiersPas {
  ecoles: number
  classes: { id: string }[]
  /** Une grille d'école ET au moins une case de la semaine. */
  horaireSaisi: boolean
  ordreEnregistre: boolean
  ordrePasse: boolean
  projectionLancee: boolean
  evaluationAnnoncee: boolean
}

/** Écran où l'on annonce une évaluation : la page de la classe (« + Événement pour la … », Noter la séance
 * → Évaluation), sinon Mes classes. Un seul endroit à changer si un écran « Annoncer » dédié arrive. */
export function lienAnnoncerEvaluation(classeId: string | null): string {
  return classeId ? `/carnet/classe/${encodeURIComponent(classeId)}` : '/carnet'
}

export function etapesPremiersPas(d: DonneesPremiersPas): EtapePremiersPas[] {
  const premiere = d.classes[0]?.id ?? null
  return [
    {
      cle: 'ecole',
      numero: 1,
      titre: 'Ton école',
      phrase: "Nom et logo pour l'en-tête des copies.",
      fait: d.ecoles > 0,
      facultatif: false,
      action: { libelle: 'Ajouter mon école', to: '/profil#ecoles' },
    },
    {
      cle: 'classes',
      numero: 2,
      titre: 'Tes classes',
      phrase: '5e A, 6e B, 4e C… avec leur année.',
      fait: d.classes.length > 0,
      facultatif: false,
      action: { libelle: 'Ajouter mes classes', to: '/carnet/classes' },
    },
    {
      cle: 'horaire',
      numero: 3,
      titre: 'Ton horaire',
      phrase: "Quand tu vois chaque classe : le tableau de bord sait alors ce que tu as aujourd'hui.",
      fait: d.horaireSaisi,
      facultatif: false,
      action: { libelle: 'Saisir mon horaire', to: '/carnet/horaire' },
    },
    {
      cle: 'ordre',
      numero: 4,
      titre: 'Ton ordre des chapitres',
      phrase: "Si tu ne suis pas l'ordre du site (facultatif).",
      fait: d.ordreEnregistre || d.ordrePasse,
      facultatif: true,
      action: { libelle: 'Ranger mes chapitres', to: '/profil#ordre-chapitres' },
    },
    {
      cle: 'projeter',
      numero: 5,
      titre: 'Projeter un premier chapitre',
      phrase: "Essaie le stylo, l'équerre, le traceur.",
      fait: d.projectionLancee,
      facultatif: false,
      action: { libelle: 'Projeter un chapitre', to: '/espace/preparer#projeter' },
    },
    {
      cle: 'annoncer',
      numero: 6,
      titre: 'Annoncer une évaluation',
      phrase: 'Ce que tes élèves verront sur leur page.',
      fait: d.evaluationAnnoncee,
      facultatif: false,
      action: { libelle: 'Annoncer une évaluation', to: lienAnnoncerEvaluation(premiere) },
    },
  ]
}

/** « 2 sur 6 », et la première étape pas encore faite (celle qui porte le bouton principal). */
export function avancement(etapes: EtapePremiersPas[]): { faites: number; total: number; courante: EtapePremiersPas | null; fini: boolean } {
  const faites = etapes.filter((e) => e.fait).length
  return { faites, total: etapes.length, courante: etapes.find((e) => !e.fait) ?? null, fini: faites === etapes.length }
}

/** Une évaluation est-elle annoncée ? Interrogation de l'agenda (passée ou à venir) ou séance qui en annonce une. */
export function evaluationAnnoncee(evenements: { type: string }[], seances: { evaluation_type?: string | null }[]): boolean {
  return evenements.some((e) => e.type === 'interrogation') || seances.some((s) => s.evaluation_type === 'annonce' || s.evaluation_type === 'bilan')
}

/* ------------------------------------------------------------------------------- mémoire du navigateur */

const CLE_MASQUE = 'espace:premiers-pas:masque:'
const CLE_ORDRE_PASSE = 'espace:premiers-pas:ordre-passe:'
/** Repère local « une projection a été lancée depuis ce navigateur » (date ISO), posé par le lanceur. */
export const CLE_PROJECTION_LANCEE = 'espace:premiere-projection'
/** Événement de la page quand un repère change (même onglet : `storage` ne part que vers les autres). */
export const EVENEMENT_PREMIERS_PAS = 'premiers-pas:change'

function lireCle(cle: string): string | null {
  try {
    return localStorage.getItem(cle)
  } catch {
    return null
  }
}

function ecrireCle(cle: string, valeur: string | null) {
  try {
    if (valeur === null) localStorage.removeItem(cle)
    else localStorage.setItem(cle, valeur)
  } catch {
    /* stockage bloqué : le choix vaut pour cette visite */
  }
  try {
    window.dispatchEvent(new Event(EVENEMENT_PREMIERS_PAS))
  } catch {
    /* rien */
  }
}

export const premiersPasMasques = (uid: string) => lireCle(CLE_MASQUE + uid) !== null
export const masquerPremiersPas = (uid: string, masque: boolean) => ecrireCle(CLE_MASQUE + uid, masque ? new Date().toISOString() : null)
export const ordrePasse = (uid: string) => lireCle(CLE_ORDRE_PASSE + uid) !== null
export const passerOrdre = (uid: string) => ecrireCle(CLE_ORDRE_PASSE + uid, new Date().toISOString())
export const projectionLancee = () => lireCle(CLE_PROJECTION_LANCEE) !== null
/** Appelé par le lanceur de projection au clic « Lancer » (rien n'est envoyé). */
export function noterProjectionLancee() {
  if (!projectionLancee()) ecrireCle(CLE_PROJECTION_LANCEE, new Date().toISOString())
}

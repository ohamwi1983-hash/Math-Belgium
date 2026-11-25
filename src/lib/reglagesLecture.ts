/**
 * Réglages « Confort de lecture » de l'élève (panneau « Aa », maquettes planches 01 à 06, décision du
 * professeur du 25/11/2026). Gardés SUR CET APPAREIL seulement (`localStorage`, clé `lecture:reglages`),
 * jamais envoyés : aucun compte, aucun serveur.
 *
 * Mécanisme : chaque réglage différent du réglage du site devient un attribut `data-<clé>` sur `<html>`
 * (`data-police="atkinson"`, `data-taille="3"`, `data-theme="sombre"`…) ; le CSS (`src/lecture.css`)
 * traduit ces attributs en variables (`--l-echelle`, `--l-interligne`…) et en jeux de couleurs. Une
 * valeur égale au réglage du site n'écrit RIEN (pas d'attribut) : la page pré-rendue et un visiteur sans
 * réglage ont exactement le DOM d'avant.
 *
 * Anti-flash : le script en ligne d'`index.html` applique les mêmes attributs AVANT l'affichage (même
 * mécanisme que `data-annee-accueil`). **À garder en accord** : `ATTRIBUTS` ci-dessous ↔ le tableau `R`
 * de ce script (mêmes clés, mêmes valeurs admises, même valeur par défaut en tête).
 *
 * Extensible : un réglage = son type, `ATTRIBUTS` (valeur du site en tête) et le script. L'onglet « Aides »
 * (lot A2) y a mis `ligne`, `bande`, `unbloc`, `exemples`, `loupe`, `signes`, `correspondances` ; la voix
 * (lot suivant) ajoutera les siennes.
 */

import { useSyncExternalStore } from 'react'
import policeDys400 from '../assets/polices/opendyslexic-latin-400-normal.woff2?url'
import policeDys700 from '../assets/polices/opendyslexic-latin-700-normal.woff2?url'

export type Police = 'andika' | 'atkinson' | 'opendyslexic'
export type Taille = '1' | '2' | '3' | '4' | '5'
export type Cran = '1' | '2' | '3'
export type Largeur = 'large' | 'moyenne' | 'etroite'
export type Theme = 'auto' | 'clair' | 'sombre' | 'creme' | 'contraste'
export type Animations = 'auto' | 'reduites'
/** Onglet « Aides » (planches 07 et 09) : suivre la ligne, hauteur de la bande, un bloc à la fois,
 * exemples résolus guidés, loupe sur les formules, plus d'air autour des signes, correspondances. */
export type SuivreLigne = 'aucune' | 'regle' | 'masque'
export type HauteurBande = '2' | '1' | '3'
export type OuiNon = 'non' | 'oui'
export type ExemplesGuides = 'guides' | 'libres'

export interface ReglagesLecture {
  police: Police
  /** 100 / 112 / 125 / 145 / 170 % */
  taille: Taille
  /** 1,6 (site) / 1,8 / 2 */
  interligne: Cran
  /** lettres + 0 / 0,035 / 0,08 em, mots + 0 / 0,12 / 0,24 em */
  espacement: Cran
  /** ≈ 70 (plafond d'office) / 60 / 50 signes */
  largeur: Largeur
  theme: Theme
  animations: Animations
  /** Règle de lecture (bande claire) ou masque (le reste assombri) qui suit le doigt, la souris, ↑ ↓. */
  ligne: SuivreLigne
  /** Hauteur de la bande : 2 lignes (site), 1 ou 3. */
  bande: HauteurBande
  /** Un bloc à la fois : le bloc en cours net et entouré, les autres effacés (jamais cachés). */
  unbloc: OuiNon
  /** Exemples résolus guidés (activé d'office) : étape en cours entourée, précédentes discrètes, « Écouter l'étape ». */
  exemples: ExemplesGuides
  /** Agrandir une formule au toucher (loupe avec « Se lit : … » et « Écouter »). */
  loupe: OuiNon
  /** Plus d'air autour de =, +, −, × (jamais dans un indice ni un exposant). */
  signes: OuiNon
  /** Couleurs ET soulignés qui se correspondent dans quelques exemples clés (`\htmlClass{m1}{…}`). */
  correspondances: OuiNon
}

export type CleReglage = keyof ReglagesLecture

/** Valeurs admises de chaque réglage, la PREMIÈRE étant le réglage du site (aucun attribut posé). */
export const ATTRIBUTS: { [K in CleReglage]: readonly ReglagesLecture[K][] } = {
  police: ['andika', 'atkinson', 'opendyslexic'],
  taille: ['1', '2', '3', '4', '5'],
  interligne: ['1', '2', '3'],
  espacement: ['1', '2', '3'],
  largeur: ['large', 'moyenne', 'etroite'],
  theme: ['auto', 'clair', 'sombre', 'creme', 'contraste'],
  animations: ['auto', 'reduites'],
  ligne: ['aucune', 'regle', 'masque'],
  bande: ['2', '1', '3'],
  unbloc: ['non', 'oui'],
  exemples: ['guides', 'libres'],
  loupe: ['non', 'oui'],
  signes: ['non', 'oui'],
  correspondances: ['non', 'oui'],
}

const CLES = Object.keys(ATTRIBUTS) as CleReglage[]

export const DEFAUT: ReglagesLecture = Object.fromEntries(CLES.map((k) => [k, ATTRIBUTS[k][0]])) as unknown as ReglagesLecture

/** Réglages du TEXTE seulement (ceux que les préréglages fixent ; le thème et les animations restent). */
export const CLES_TEXTE = ['police', 'taille', 'interligne', 'espacement', 'largeur'] as const
type ReglagesTexte = Pick<ReglagesLecture, (typeof CLES_TEXTE)[number]>

export interface Prereglage {
  id: 'site' | 'confort' | 'dys' | 'grand'
  nom: string
  desc: string
  reglages: ReglagesTexte
}

/** Préréglages en un clic (valeurs du rapport des maquettes, § 1). */
export const PREREGLAGES: Prereglage[] = [
  { id: 'site', nom: 'Réglage du site', desc: 'Comme aujourd’hui', reglages: { police: 'andika', taille: '1', interligne: '1', espacement: '1', largeur: 'large' } },
  { id: 'confort', nom: 'Lecture confortable', desc: 'Un peu plus grand, plus aéré', reglages: { police: 'andika', taille: '2', interligne: '2', espacement: '2', largeur: 'moyenne' } },
  { id: 'dys', nom: 'Dys', desc: 'Atkinson, lignes courtes, très aéré', reglages: { police: 'atkinson', taille: '2', interligne: '3', espacement: '3', largeur: 'etroite' } },
  { id: 'grand', nom: 'Grand texte', desc: 'Basse vision : 145 %', reglages: { police: 'atkinson', taille: '4', interligne: '2', espacement: '2', largeur: 'moyenne' } },
]

/** Facteurs de taille (affichage dans le panneau ; le CSS a les mêmes valeurs sous `data-taille`). */
export const ECHELLES: Record<Taille, number> = { '1': 1, '2': 1.12, '3': 1.25, '4': 1.45, '5': 1.7 }

export const CLE_STOCKAGE = 'lecture:reglages'

function valide<K extends CleReglage>(k: K, v: unknown): v is ReglagesLecture[K] {
  return (ATTRIBUTS[k] as readonly unknown[]).includes(v)
}

/** Lit les réglages gardés (valeurs inconnues ignorées : un ancien format ne casse rien). */
export function lireReglages(): ReglagesLecture {
  const r: ReglagesLecture = { ...DEFAUT }
  try {
    const brut: unknown = JSON.parse(localStorage.getItem(CLE_STOCKAGE) || 'null')
    if (brut && typeof brut === 'object') {
      for (const k of CLES) {
        const v = (brut as Record<string, unknown>)[k]
        if (valide(k, v)) (r as unknown as Record<string, unknown>)[k] = v
      }
    }
  } catch {
    // stockage indisponible (navigation privée stricte…) : réglage du site
  }
  return r
}

function ecrire(r: ReglagesLecture) {
  try {
    if (estReglageDuSite(r)) localStorage.removeItem(CLE_STOCKAGE)
    else localStorage.setItem(CLE_STOCKAGE, JSON.stringify(r))
  } catch {
    // rien : le réglage vaut pour cette visite seulement
  }
}

export function estReglageDuSite(r: ReglagesLecture): boolean {
  return CLES.every((k) => r[k] === DEFAUT[k])
}

export function prereglageActif(r: ReglagesLecture): Prereglage | undefined {
  return PREREGLAGES.find((p) => CLES_TEXTE.every((k) => r[k] === p.reglages[k]))
}

/** Pose les attributs sur `<html>` (aucun pour une valeur par défaut) et la couleur de la barre du navigateur. */
export function appliquerReglages(r: ReglagesLecture, racine: HTMLElement = document.documentElement) {
  for (const k of CLES) {
    const attr = `data-${k}`
    if (r[k] === DEFAUT[k]) racine.removeAttribute(attr)
    else racine.setAttribute(attr, r[k])
  }
  if (estReglageDuSite(r)) racine.removeAttribute('data-lecture-perso')
  else racine.setAttribute('data-lecture-perso', '')
  if (r.police === 'opendyslexic') chargerOpenDyslexic()
  majCouleurBarre(r.theme)
}

/** OpenDyslexic (© Abbie Gonzalez, SIL OFL 1.1 — `assets/polices/OFL-OpenDyslexic.txt`) : enregistrée
 * SEULEMENT quand l'élève la choisit (aucun `@font-face` dans les feuilles de style : sinon l'export HTML
 * d'un chapitre la recopierait, et `buildHtml.ts` la téléchargerait pour tout le monde). */
let openDyslexicChargee = false
function chargerOpenDyslexic() {
  if (openDyslexicChargee || typeof document === 'undefined' || typeof FontFace === 'undefined') return
  openDyslexicChargee = true
  for (const [poids, url] of [['400', policeDys400], ['700', policeDys700]] as const) {
    try {
      const f = new FontFace('OpenDyslexic', `url(${url}) format("woff2")`, { weight: poids, style: 'normal', display: 'swap' })
      document.fonts.add(f)
      void f.load().catch(() => undefined)
    } catch {
      // police indisponible : la police de secours de `--l-police` prend le relais
    }
  }
}

/** `<meta name="theme-color">` : le thème choisi gagne sur celui de l'appareil (barre du navigateur). */
const COULEUR_BARRE: Partial<Record<Theme, string>> = { clair: '#ffffff', sombre: '#161f27', creme: '#f8f1e1', contraste: '#ffffff' }
const ORIGINE_BARRE = new WeakMap<HTMLMetaElement, string>()
function majCouleurBarre(theme: Theme) {
  if (typeof document === 'undefined') return
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    if (!ORIGINE_BARRE.has(m)) ORIGINE_BARRE.set(m, m.content)
    m.content = COULEUR_BARRE[theme] ?? ORIGINE_BARRE.get(m) ?? m.content
  })
}

// ---------- magasin (abonnement) ----------

let courant: ReglagesLecture | null = null
const abonnes = new Set<() => void>()

export function reglagesCourants(): ReglagesLecture {
  if (!courant) courant = typeof window === 'undefined' ? { ...DEFAUT } : lireReglages()
  return courant
}

export function changerReglages(partiel: Partial<ReglagesLecture>) {
  const r = { ...reglagesCourants(), ...partiel }
  courant = r
  ecrire(r)
  appliquerReglages(r)
  abonnes.forEach((f) => f())
}

export function revenirAuReglageDuSite() {
  changerReglages({ ...DEFAUT })
}

export function abonnerReglages(f: () => void): () => void {
  abonnes.add(f)
  return () => abonnes.delete(f)
}

/** Autre onglet du même navigateur : le réglage change partout. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== CLE_STOCKAGE && e.key !== null) return
    courant = lireReglages()
    appliquerReglages(courant)
    abonnes.forEach((f) => f())
  })
}

/** Animations réduites : choix de l'élève OU préférence de l'appareil (à utiliser au lieu de
 * `matchMedia('(prefers-reduced-motion: reduce)')` seul). */
export function animationsReduites(): boolean {
  if (typeof window === 'undefined') return false
  return reglagesCourants().animations === 'reduites' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/** Réglages courants dans un composant React (re-rendu à chaque changement). */
export function useReglagesLecture(): ReglagesLecture {
  return useSyncExternalStore(abonnerReglages, reglagesCourants, () => DEFAUT)
}

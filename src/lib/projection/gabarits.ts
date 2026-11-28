/**
 * Gabarits de l'écran blanc (mode projection, planche P2 du 28/11/2026), PUR (aucun React, aucun DOM) :
 * tableau de signes, tableau de variations, arbre de probabilités, diagramme de Venn, droite graduée,
 * tableau statistique, tableau de valeurs.
 *
 * Un gabarit est un ÉLÉMENT de la page blanche (comme une courbe du traceur) : son type, ses réglages (taille),
 * sa place, son échelle et le CONTENU DE SES CASES (texte tapé, jamais une image). Annuler, deux écrans, export
 * annoté et conservation dans le navigateur le traitent comme les autres éléments.
 *
 * `disposer` donne, en px logiques à l'échelle 1, les traits à dessiner et les cases à toucher. Rien n'est jamais
 * calculé à la place de la classe : le gabarit ne remplit ni les produits, ni les totaux, ni les signes.
 */
import { analyser, enLatex } from './calculatrice'

export type TypeGabarit = 'signes' | 'variations' | 'arbre' | 'venn' | 'droite' | 'statistique' | 'valeurs'

/** Lignes possibles du tableau statistique, dans l'ordre. */
export const LIGNES_STAT = ['valeur', 'effectif', 'cumule', 'frequence', 'frequenceCumulee'] as const
export type LigneStat = (typeof LIGNES_STAT)[number]
export const NOMS_LIGNES_STAT: Record<LigneStat, string> = {
  valeur: 'Valeur',
  effectif: 'Effectif',
  cumule: 'Effectif cumulé',
  frequence: 'Fréquence',
  frequenceCumulee: 'Fréquence cumulée',
}
const DEFAUT_LIGNE_STAT: Record<LigneStat, string> = {
  valeur: 'Valeur x_i',
  effectif: 'Effectif n_i',
  cumule: 'Effectif cumulé',
  frequence: 'Fréquence f_i',
  frequenceCumulee: 'Fréquence cumulée',
}

/** Réglages de taille (le dernier choix est retenu pour le prochain gabarit, voir `lireReglages`). */
export interface ReglagesGabarit {
  /** Tableau de signes : facteurs (lignes), valeurs qui annulent (colonnes), ligne du produit. */
  facteurs: number
  valeurs: number
  produit: boolean
  /** Tableau de variations : nombre d'intervalles, ligne du signe de la dérivée. */
  intervalles: number
  derivee: boolean
  /** Arbre : niveaux (2 ou 3) et branches par nœud (2 ou 3 ; 3 niveaux × 3 branches = 27 feuilles : refusé). */
  niveaux: number
  branches: number
  /** Venn : 2 ou 3 ensembles. */
  ensembles: number
  /** Droite graduée : de … à …, pas. */
  de: number
  a: number
  pas: number
  /** Tableaux statistique / de valeurs : nombre de colonnes de données. */
  colonnes: number
  lignesStat: Record<LigneStat, boolean>
  total: boolean
  /** Tableau de valeurs : 2 lignes (x, f(x)) ou 3 (x, f(x), g(x)). */
  lignesValeurs: number
}

export const REGLAGES_DEFAUT: ReglagesGabarit = {
  facteurs: 2,
  valeurs: 2,
  produit: true,
  intervalles: 2,
  derivee: true,
  niveaux: 2,
  branches: 2,
  ensembles: 2,
  de: -5,
  a: 5,
  pas: 1,
  colonnes: 5,
  lignesStat: { valeur: true, effectif: true, cumule: false, frequence: true, frequenceCumulee: false },
  total: true,
  lignesValeurs: 2,
}

const borne = (v: unknown, min: number, max: number, defaut: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : defaut)

/** Réglages complets et bornés (lecture tolérante : une donnée abîmée retombe sur la valeur par défaut). */
export function reglagesComplets(r: Partial<ReglagesGabarit> | undefined): ReglagesGabarit {
  const d = REGLAGES_DEFAUT
  const x = r ?? {}
  const niveaux = borne(x.niveaux, 2, 3, d.niveaux)
  const pas = typeof x.pas === 'number' && x.pas > 0 && x.pas <= 1000 ? x.pas : d.pas
  let de = typeof x.de === 'number' && Number.isFinite(x.de) ? x.de : d.de
  let a = typeof x.a === 'number' && Number.isFinite(x.a) ? x.a : d.a
  if (a <= de) [de, a] = [d.de, d.a]
  // Au plus 40 graduations (lisibles) : sinon on revient au réglage par défaut.
  if ((a - de) / pas > 40) [de, a] = [d.de, d.a]
  const ls = { ...d.lignesStat }
  for (const k of LIGNES_STAT) if (typeof x.lignesStat?.[k] === 'boolean') ls[k] = x.lignesStat[k]
  if (!LIGNES_STAT.some((k) => ls[k])) ls.valeur = true
  return {
    facteurs: borne(x.facteurs, 1, 4, d.facteurs),
    valeurs: borne(x.valeurs, 1, 4, d.valeurs),
    produit: typeof x.produit === 'boolean' ? x.produit : d.produit,
    intervalles: borne(x.intervalles, 1, 4, d.intervalles),
    derivee: typeof x.derivee === 'boolean' ? x.derivee : d.derivee,
    niveaux,
    branches: niveaux === 3 ? 2 : borne(x.branches, 2, 3, d.branches),
    ensembles: borne(x.ensembles, 2, 3, d.ensembles),
    de,
    a,
    pas,
    colonnes: borne(x.colonnes, 2, 10, d.colonnes),
    lignesStat: ls,
    total: typeof x.total === 'boolean' ? x.total : d.total,
    lignesValeurs: borne(x.lignesValeurs, 2, 3, d.lignesValeurs),
  }
}

/** Intervalle de la droite graduée : bornes en TEXTE (saisie libre : « −2 », « -inf », « +∞ », « 1/2 »). */
export interface IntervalleDroite {
  g: string
  d: string
  /** Crochet ouvert (borne exclue). Une borne infinie est toujours ouverte. */
  gOuvert: boolean
  dOuvert: boolean
}

/** Gabarit posé sur une page blanche (élément d'annotation). */
export interface Gabarit {
  genre: 'gabarit'
  id: string
  type: TypeGabarit
  /** Coin haut gauche, en px de la page (voir `vue.ts`). */
  x: number
  y: number
  /** Échelle (poignées des coins : proportions gardées). */
  k: number
  r: ReglagesGabarit
  /** Contenu des cases (texte tapé, tel quel). Absent = texte par défaut de la case ; '' = vidée. */
  cases: Record<string, string>
  /** Droite graduée : intervalles et façon de les combiner. */
  intervalles?: IntervalleDroite[]
  combinaison?: 'reunion' | 'intersection'
}

export const NOMS_GABARITS: Record<TypeGabarit, string> = {
  signes: 'Tableau de signes',
  variations: 'Tableau de variations',
  arbre: 'Arbre de probabilités',
  venn: 'Diagramme de Venn',
  droite: 'Droite graduée',
  statistique: 'Tableau statistique',
  valeurs: 'Tableau de valeurs',
}
export const TYPES_GABARITS = Object.keys(NOMS_GABARITS) as TypeGabarit[]

// ---------- saisie d'une case → LaTeX ----------

const MOTS_LATEX = new Set(['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'frac', 'dfrac', 'overline', 'infty', 'text', 'mathrm', 'left', 'right', 'nearrow', 'searrow'])

/**
 * Texte d'une case → LaTeX affiché (KaTeX). Jamais d'erreur : ce qui n'est pas reconnu est écrit tel quel.
 * - signes du tableau : « + », « − », « 0 », « ‖ » (ou « | », « || »), « ↗ » « ↘ » ;
 * - « −∞ », « -inf », « +oo » ; « non A » ou « !A » → Ā ;
 * - expression (« x+3 », « (x−1)(x+3) », « 0,25 », « 1/2 ») : parseur de la calculatrice (fraction, virgule) ;
 * - sinon : texte (mots en `\text{…}`, indices « x_i » gardés).
 */
export function saisieVersLatex(saisie: string): string {
  const t = saisie.replace(/[−–—]/g, '-').trim()
  if (!t) return ''
  if (t === '+' || t === '-') return t
  if (/^(‖|\|\||\|)$/.test(t)) return '\\|'
  if (t === '↗' || t === '/') return '\\nearrow'
  if (t === '↘' || t === '\\') return '\\searrow'
  const inf = /^([+-]?)\s*(∞|inf(ini)?|oo)$/i.exec(t)
  if (inf) return `${inf[1] || '+'}\\infty`
  const non = /^(?:non\s+|!)([A-Za-z])$/i.exec(t)
  if (non) return `\\overline{${non[1]}}`
  if (/^[A-Za-z]$/.test(t)) return t
  try {
    const arbre = analyser(t, { variable: true })
    return enLatex(arbre, 'rad', { fractions: true }).replace(/\\dfrac/g, '\\frac')
  } catch {
    // Texte libre : mots en \text{…}, le reste échappé.
  }
  return t
    .replace(/[\\#$%&{}~^]/g, (c) => (c === '^' ? '^' : c === '\\' ? '' : `\\${c}`))
    .replace(/([A-Za-zÀ-ÿ]{2,})/g, (m) => (MOTS_LATEX.has(m) ? m : `\\text{${m}}`))
    .replace(/,/g, '{,}')
    .replace(/\s+/g, '\\ ')
}

// ---------- disposition ----------

export type Forme =
  | { f: 'ligne'; x1: number; y1: number; x2: number; y2: number; ep?: number; pointille?: boolean; couleur?: string }
  | { f: 'rect'; x: number; y: number; w: number; h: number; fond?: string; opacite?: number; bord?: string; ep?: number; rx?: number }
  | { f: 'cercle'; cx: number; cy: number; r: number; bord: string; fond?: string; ep?: number }
  | { f: 'chemin'; d: string; bord?: string; fond?: string; ep?: number }
  | { f: 'texte'; x: number; y: number; t: string; taille: number; couleur?: string; gras?: boolean; ancre?: 'start' | 'middle' | 'end'; police?: 'mono' | 'sans' }

/** Case à toucher : rectangle (px à l'échelle 1), texte par défaut, nom lisible (clavier, lecteur d'écran). */
export interface CaseGabarit {
  id: string
  x: number
  y: number
  w: number
  h: number
  defaut?: string
  /** Nom lisible : « x − 1 sous −3 ». */
  nom: string
  /** Case vide hachurée (« reste à remplir », jamais exportée) ; case de probabilité : pointillé tant qu'elle est vide. */
  hachuree?: boolean
  pointillee?: boolean
  /** Fond blanc (la case recouvre un trait : « 0 » posé sur la barre verticale). */
  fond?: boolean
  taille?: number
  couleur?: string
}

export interface Disposition {
  w: number
  h: number
  formes: Forme[]
  cases: CaseGabarit[]
}

const TRAIT = '#33434f'

/** Texte d'une case (contenu tapé, sinon texte par défaut). */
export function texteCase(g: Pick<Gabarit, 'cases'>, c: Pick<CaseGabarit, 'id' | 'defaut'>): string {
  const v = g.cases[c.id]
  return v === undefined ? (c.defaut ?? '') : v
}

function nomLisible(g: Gabarit, id: string, repli: string): string {
  const t = g.cases[id]
  return t && t.trim() ? t.trim().replace(/-/g, '−') : repli
}

function tableauSignes(g: Gabarit): Disposition {
  const { facteurs: n, valeurs: m, produit } = g.r
  const LAB = 230
  const V = 78
  const S = 104
  const H = 72
  const lignes = 1 + n + (produit ? 1 : 0)
  const w = LAB + (m + 2) * V + (m + 1) * S
  const h = lignes * H
  const formes: Forme[] = []
  const cases: CaseGabarit[] = []
  // Abscisse du centre de la colonne de la valeur j (0 = −∞, m + 1 = +∞) et de la colonne du signe j (0…m).
  const xV = (j: number) => LAB + j * (V + S) + V / 2
  formes.push({ f: 'rect', x: 0, y: 0, w, h, bord: TRAIT, ep: 2.5, fond: '#fff' })
  formes.push({ f: 'ligne', x1: LAB, y1: 0, x2: LAB, y2: h, ep: 2.5 })
  for (let i = 1; i < lignes; i++) formes.push({ f: 'ligne', x1: 0, y1: i * H, x2: w, y2: i * H, ep: i === 1 ? 3.5 : 2 })
  for (let j = 1; j <= m; j++) formes.push({ f: 'ligne', x1: xV(j), y1: H, x2: xV(j), y2: h, ep: 2 })
  const valeur = (j: number) => (j === 0 ? '−∞' : j === m + 1 ? '+∞' : nomLisible(g, `v${j}`, `la valeur ${j}`))
  cases.push({ id: 'x', x: 0, y: 0, w: LAB, h: H, defaut: 'x', nom: 'en-tête de la colonne de gauche' })
  for (let j = 0; j <= m + 1; j++) cases.push({ id: `v${j}`, x: xV(j) - V / 2, y: 0, w: V, h: H, defaut: j === 0 ? '−∞' : j === m + 1 ? '+∞' : undefined, nom: `valeur ${j === 0 ? 'de gauche' : j === m + 1 ? 'de droite' : j}` })
  for (let i = 1; i < lignes; i++) {
    const y = i * H
    const estProduit = produit && i === lignes - 1
    const nomLigne = nomLisible(g, `l${i}`, estProduit ? 'ligne du produit' : `facteur ${i}`)
    cases.push({ id: `l${i}`, x: 0, y, w: LAB, h: H, nom: `nom de la ligne ${i}`, taille: 27 })
    // Case du signe : tout l'intervalle entre deux barres, sauf la place des « 0 » / « ‖ » posés sur les barres.
    for (let j = 0; j <= m; j++) {
      const x1 = j === 0 ? LAB + 6 : xV(j) + 30
      const x2 = j === m ? w - 6 : xV(j + 1) - 30
      cases.push({ id: `s${i}-${j}`, x: x1, y: y + 4, w: x2 - x1, h: H - 8, nom: `${nomLigne}, entre ${valeur(j)} et ${valeur(j + 1)}`, hachuree: true })
    }
    for (let j = 1; j <= m; j++) cases.push({ id: `z${i}-${j}`, x: xV(j) - 26, y: y + 12, w: 52, h: H - 24, nom: `${nomLigne}, sous ${valeur(j)}`, fond: true })
  }
  return { w, h, formes, cases }
}

function tableauVariations(g: Gabarit): Disposition {
  const { intervalles: k, derivee } = g.r
  const LAB = 160
  const V = 96
  const S = 130
  const HT = 66
  const HF = 160
  const w = LAB + (k + 1) * V + k * S
  const h = HT + (derivee ? HT : 0) + HF
  const formes: Forme[] = []
  const cases: CaseGabarit[] = []
  const xV = (j: number) => LAB + j * (V + S) + V / 2
  const xS = (j: number) => LAB + j * (V + S) + V + S / 2
  formes.push({ f: 'rect', x: 0, y: 0, w, h, bord: TRAIT, ep: 2.5, fond: '#fff' })
  formes.push({ f: 'ligne', x1: LAB, y1: 0, x2: LAB, y2: h, ep: 2.5 })
  formes.push({ f: 'ligne', x1: 0, y1: HT, x2: w, y2: HT, ep: 3.5 })
  if (derivee) formes.push({ f: 'ligne', x1: 0, y1: 2 * HT, x2: w, y2: 2 * HT, ep: 2 })
  const valeur = (j: number) => nomLisible(g, `v${j}`, j === 0 ? 'la valeur de gauche' : j === k ? 'la valeur de droite' : `la valeur ${j}`)
  cases.push({ id: 'x', x: 0, y: 0, w: LAB, h: HT, defaut: 'x', nom: 'en-tête de la colonne de gauche' })
  for (let j = 0; j <= k; j++) cases.push({ id: `v${j}`, x: xV(j) - V / 2, y: 0, w: V, h: HT, defaut: j === 0 ? '−∞' : j === k ? '+∞' : undefined, nom: `valeur ${j === 0 ? 'de gauche' : j === k ? 'de droite' : j}` })
  let y = HT
  if (derivee) {
    for (let j = 1; j < k; j++) formes.push({ f: 'ligne', x1: xV(j), y1: y, x2: xV(j), y2: y + HT, ep: 2 })
    cases.push({ id: 'ld', x: 0, y, w: LAB, h: HT, defaut: "f'(x)", nom: 'nom de la ligne du signe' })
    for (let j = 0; j < k; j++) cases.push({ id: `d-${j}`, x: xS(j) - S / 2, y, w: S, h: HT, nom: `signe entre ${valeur(j)} et ${valeur(j + 1)}`, hachuree: true })
    for (let j = 1; j < k; j++) cases.push({ id: `dz-${j}`, x: xV(j) - 26, y: y + 10, w: 52, h: HT - 20, nom: `signe sous ${valeur(j)}`, fond: true })
    y += HT
  }
  cases.push({ id: 'lf', x: 0, y, w: LAB, h: HF, defaut: 'f(x)', nom: 'nom de la ligne des variations' })
  for (let j = 0; j <= k; j++) {
    cases.push({ id: `fh-${j}`, x: xV(j) - V / 2, y: y + 6, w: V, h: 52, nom: `valeur en haut sous ${valeur(j)}` })
    cases.push({ id: `fb-${j}`, x: xV(j) - V / 2, y: y + HF - 58, w: V, h: 52, nom: `valeur en bas sous ${valeur(j)}` })
  }
  for (let j = 0; j < k; j++) cases.push({ id: `fl-${j}`, x: xS(j) - S / 2 + 8, y: y + 40, w: S - 16, h: HF - 80, nom: `flèche entre ${valeur(j)} et ${valeur(j + 1)}`, hachuree: true, taille: 52 })
  return { w, h, formes, cases }
}

/** Noms par défaut des événements d'un niveau de l'arbre. */
function nomsNiveau(niveau: number, branches: number): string[] {
  const lettres = ['A', 'B', 'C'][niveau - 1]
  if (branches === 2) return [lettres, `non ${lettres}`]
  return niveau === 1 ? ['A', 'B', 'C'] : niveau === 2 ? ['D', 'E', 'F'] : ['G', 'H', 'I']
}

function arbre(g: Gabarit): Disposition {
  const N = g.r.niveaux
  const B = g.r.branches
  const feuilles = Math.pow(B, N)
  const esp = Math.min(118, 660 / feuilles)
  const L = N === 2 ? 270 : 220
  const X0 = 24
  const NOEUD = 76
  const PROD = 130
  const w = X0 + N * L + NOEUD / 2 + 24 + PROD
  const h = feuilles * esp
  const formes: Forme[] = []
  const cases: CaseGabarit[] = []
  // Ordonnée d'un nœud : milieu de ses feuilles.
  type Noeud = { niveau: number; rang: number; y: number; chemin: number[] }
  const noeuds: Noeud[] = [{ niveau: 0, rang: 0, y: h / 2, chemin: [] }]
  for (let n = 1; n <= N; n++) {
    const parNoeud = Math.pow(B, N - n)
    for (let r = 0; r < Math.pow(B, n); r++) noeuds.push({ niveau: n, rang: r, y: (r * parNoeud + parNoeud / 2) * esp, chemin: [] })
  }
  const xN = (n: number) => X0 + n * L
  for (const nd of noeuds) {
    if (nd.niveau === 0) continue
    const parent = noeuds.find((p) => p.niveau === nd.niveau - 1 && p.rang === Math.floor(nd.rang / B))!
    const x1 = nd.niveau === 1 ? X0 : xN(nd.niveau - 1) + NOEUD / 2 - 4
    const x2 = xN(nd.niveau) - NOEUD / 2 + 4
    formes.push({ f: 'ligne', x1, y1: parent.y, x2, y2: nd.y, ep: 3 })
    const id = `${nd.niveau}-${nd.rang}`
    const noms = nomsNiveau(nd.niveau, B)
    cases.push({ id: `n${id}`, x: xN(nd.niveau) - NOEUD / 2, y: nd.y - 26, w: NOEUD, h: 52, defaut: noms[nd.rang % B], nom: `événement ${noms[nd.rang % B]} (niveau ${nd.niveau})`, taille: 30 })
    // Case de probabilité au milieu de la branche, un peu au-dessus (branche du haut) ou en dessous.
    const mx = (x1 + x2) / 2
    const my = (parent.y + nd.y) / 2
    const haut = nd.y < parent.y || (nd.y === parent.y && nd.rang % B === 0)
    cases.push({ id: `p${id}`, x: mx - 46, y: haut ? my - 50 : my + 4, w: 92, h: 44, nom: `probabilité de la branche vers ${nomLisible(g, `n${id}`, noms[nd.rang % B])} (niveau ${nd.niveau})`, pointillee: true, fond: true, taille: 24 })
    if (nd.niveau === N) cases.push({ id: `f${id}`, x: xN(N) + NOEUD / 2 + 24, y: nd.y - 22, w: PROD, h: 44, nom: `produit de la feuille ${nd.rang + 1}`, pointillee: true, taille: 22, couleur: '#33434f' })
  }
  formes.push({ f: 'cercle', cx: X0, cy: h / 2, r: 5, bord: TRAIT, fond: TRAIT, ep: 2 })
  return { w, h, formes, cases }
}

const COULEURS_VENN = ['#1d52a8', '#b65c1f', '#2f7a4f']
const FONDS_VENN = ['rgb(29 82 168 / 0.06)', 'rgb(182 92 31 / 0.06)', 'rgb(47 122 79 / 0.06)']

function venn(g: Gabarit): Disposition {
  const trois = g.r.ensembles === 3
  const w = 560
  const h = trois ? 470 : 390
  const formes: Forme[] = [{ f: 'rect', x: 2, y: 2, w: w - 4, h: h - 4, bord: TRAIT, ep: 3, fond: '#fff' }]
  const cases: CaseGabarit[] = []
  formes.push({ f: 'texte', x: 28, y: 44, t: 'Ω', taille: 28, couleur: TRAIT })
  const noms = ['A', 'B', 'C']
  const nom = (i: number) => nomLisible(g, `e${i}`, noms[i])
  if (!trois) {
    const c = [
      [205, 200],
      [355, 200],
    ]
    const R = 132
    c.forEach(([cx, cy], i) => formes.push({ f: 'cercle', cx, cy, r: R, bord: COULEURS_VENN[i], fond: FONDS_VENN[i], ep: 3 }))
    cases.push({ id: 'e0', x: 92, y: 40, w: 70, h: 46, defaut: 'A', nom: 'nom du premier ensemble', couleur: COULEURS_VENN[0], taille: 30 })
    cases.push({ id: 'e1', x: 398, y: 40, w: 70, h: 46, defaut: 'B', nom: 'nom du deuxième ensemble', couleur: COULEURS_VENN[1], taille: 30 })
    cases.push({ id: 'z10', x: 104, y: 174, w: 92, h: 52, nom: `${nom(0)} seul` })
    cases.push({ id: 'z11', x: 238, y: 174, w: 84, h: 52, nom: `${nom(0)} et ${nom(1)}` })
    cases.push({ id: 'z01', x: 364, y: 174, w: 92, h: 52, nom: `${nom(1)} seul` })
    cases.push({ id: 'z00', x: 462, y: 322, w: 84, h: 52, nom: `ni ${nom(0)} ni ${nom(1)}` })
  } else {
    const c = [
      [215, 175],
      [345, 175],
      [280, 288],
    ]
    const R = 118
    c.forEach(([cx, cy], i) => formes.push({ f: 'cercle', cx, cy, r: R, bord: COULEURS_VENN[i], fond: FONDS_VENN[i], ep: 3 }))
    cases.push({ id: 'e0', x: 84, y: 34, w: 70, h: 46, defaut: 'A', nom: 'nom du premier ensemble', couleur: COULEURS_VENN[0], taille: 30 })
    cases.push({ id: 'e1', x: 406, y: 34, w: 70, h: 46, defaut: 'B', nom: 'nom du deuxième ensemble', couleur: COULEURS_VENN[1], taille: 30 })
    cases.push({ id: 'e2', x: 372, y: 400, w: 70, h: 46, defaut: 'C', nom: 'nom du troisième ensemble', couleur: COULEURS_VENN[2], taille: 30 })
    const z = (id: string, x: number, y: number, n: string) => cases.push({ id, x: x - 38, y: y - 24, w: 76, h: 48, nom: n })
    z('z100', 165, 140, `${nom(0)} seul`)
    z('z010', 395, 140, `${nom(1)} seul`)
    z('z001', 280, 350, `${nom(2)} seul`)
    z('z110', 280, 125, `${nom(0)} et ${nom(1)} seulement`)
    z('z101', 210, 265, `${nom(0)} et ${nom(2)} seulement`)
    z('z011', 350, 265, `${nom(1)} et ${nom(2)} seulement`)
    z('z111', 280, 218, `${nom(0)}, ${nom(1)} et ${nom(2)}`)
    z('z000', 505, 420, `aucun des trois`)
  }
  return { w, h, formes, cases }
}

function tableauLignes(g: Gabarit, lignes: { id: string; defaut: string }[], LAB: number, C: number, H: number, total: boolean): Disposition {
  const n = g.r.colonnes
  const T = total ? 110 : 0
  const w = LAB + n * C + T
  const h = lignes.length * H
  const formes: Forme[] = [{ f: 'rect', x: 0, y: 0, w, h, bord: TRAIT, ep: 2.5, fond: '#fff' }]
  formes.push({ f: 'ligne', x1: LAB, y1: 0, x2: LAB, y2: h, ep: 2.5 })
  for (let j = 1; j < n; j++) formes.push({ f: 'ligne', x1: LAB + j * C, y1: 0, x2: LAB + j * C, y2: h, ep: 1.6 })
  if (total) formes.push({ f: 'ligne', x1: LAB + n * C, y1: 0, x2: LAB + n * C, y2: h, ep: 2.5 })
  for (let i = 1; i < lignes.length; i++) formes.push({ f: 'ligne', x1: 0, y1: i * H, x2: w, y2: i * H, ep: i === 1 ? 3 : 1.6 })
  const cases: CaseGabarit[] = []
  lignes.forEach((l, i) => {
    const nomLigne = nomLisible(g, `l-${l.id}`, l.defaut)
    cases.push({ id: `l-${l.id}`, x: 0, y: i * H, w: LAB, h: H, defaut: l.defaut, nom: `nom de la ligne ${i + 1}`, taille: 24 })
    for (let j = 0; j < n; j++) cases.push({ id: `c-${l.id}-${j}`, x: LAB + j * C, y: i * H, w: C, h: H, nom: `${nomLigne}, colonne ${j + 1}`, hachuree: i > 0, taille: 26 })
    if (total) cases.push({ id: `t-${l.id}`, x: LAB + n * C, y: i * H, w: T, h: H, defaut: i === 0 ? 'Total' : undefined, nom: `${nomLigne}, total`, hachuree: i > 0, taille: 26 })
  })
  return { w, h, formes, cases }
}

/** Ensemble « gardé » de la droite graduée : morceaux [a ; b] avec crochets (bornes infinies possibles). */
export interface Morceau1D {
  a: number
  b: number
  aOuvert: boolean
  bOuvert: boolean
}

/** Borne tapée → nombre (±∞ compris) ; null si illisible. */
export function lireBorne(s: string): number | null {
  const t = s.replace(/[−–—]/g, '-').trim()
  if (!t) return null
  const inf = /^([+-]?)\s*(∞|inf(ini)?|oo)$/i.exec(t)
  if (inf) return inf[1] === '-' ? -Infinity : Infinity
  try {
    const a = analyser(t)
    // Évaluation simple (nombres, fractions, √, π) sans exception visible.
    const v = evaluerSansX(a)
    return Number.isFinite(v) ? v : null
  } catch {
    return null
  }
}

function evaluerSansX(n: ReturnType<typeof analyser>): number {
  switch (n.t) {
    case 'nb':
      return n.v
    case 'cst':
      return n.nom === 'pi' ? Math.PI : n.nom === 'e' ? Math.E : NaN
    case 'par':
      return evaluerSansX(n.a)
    case 'neg':
      return -evaluerSansX(n.a)
    case 'bin': {
      const a = evaluerSansX(n.a)
      const b = evaluerSansX(n.b)
      return n.op === '+' ? a + b : n.op === '-' ? a - b : n.op === '/' ? a / b : a * b
    }
    case 'pow':
      return Math.pow(evaluerSansX(n.a), evaluerSansX(n.b))
    case 'fn':
      return n.nom === 'racine' ? Math.sqrt(evaluerSansX(n.a)) : n.nom === 'abs' ? Math.abs(evaluerSansX(n.a)) : NaN
    default:
      return NaN
  }
}

/** Intervalles lus (bornes infinies toujours ouvertes) ; `erreur` si une borne est illisible ou mal rangée. */
export function lireIntervalles(l: IntervalleDroite[]): { morceaux: Morceau1D[]; erreur: string | null } {
  const morceaux: Morceau1D[] = []
  for (const [i, it] of l.entries()) {
    const a = lireBorne(it.g)
    const b = lireBorne(it.d)
    if (a === null || b === null) return { morceaux, erreur: `Intervalle ${i + 1} : écris deux bornes (un nombre, ou −∞ / +∞).` }
    if (a > b || (a === b && (it.gOuvert || it.dOuvert))) return { morceaux, erreur: `Intervalle ${i + 1} : la borne de gauche doit être plus petite que celle de droite.` }
    if (a === Infinity || b === -Infinity) return { morceaux, erreur: `Intervalle ${i + 1} : −∞ s'écrit à gauche, +∞ à droite.` }
    morceaux.push({ a, b, aOuvert: it.gOuvert || a === -Infinity, bOuvert: it.dOuvert || b === Infinity })
  }
  return { morceaux, erreur: null }
}

/** Réunion de morceaux (triés, fusionnés quand ils se touchent par une borne comprise). */
export function reunion(ms: Morceau1D[]): Morceau1D[] {
  const t = [...ms].sort((p, q) => p.a - q.a || Number(p.aOuvert) - Number(q.aOuvert))
  const res: Morceau1D[] = []
  for (const m of t) {
    const d = res[res.length - 1]
    if (d && (m.a < d.b || (m.a === d.b && !(m.aOuvert && d.bOuvert)))) {
      if (m.b > d.b || (m.b === d.b && !m.bOuvert)) {
        d.b = m.b
        d.bOuvert = m.bOuvert
      }
    } else res.push({ ...m })
  }
  return res
}

/** Intersection de tous les morceaux (vide possible). */
export function intersection(ms: Morceau1D[]): Morceau1D[] {
  if (ms.length === 0) return []
  let cur: Morceau1D | null = { ...ms[0] }
  for (const m of ms.slice(1)) {
    if (!cur) break
    const a = Math.max(cur.a, m.a)
    const aOuvert: boolean = a === cur.a && a === m.a ? cur.aOuvert || m.aOuvert : a === cur.a ? cur.aOuvert : m.aOuvert
    const b = Math.min(cur.b, m.b)
    const bOuvert: boolean = b === cur.b && b === m.b ? cur.bOuvert || m.bOuvert : b === cur.b ? cur.bOuvert : m.bOuvert
    cur = a < b || (a === b && !aOuvert && !bOuvert) ? { a, b, aOuvert, bOuvert } : null
  }
  return cur ? [cur] : []
}

/** Couleurs sûres pour les daltoniens (Okabe-Ito) : vert bleuté = gardé, vermillon = exclu ; jamais la couleur seule. */
export const VERT_GARDE = '#009E73'
export const ROUGE_EXCLU = '#D55E00'
const MOT_GARDE = '#00684c'
const MOT_EXCLU = '#a3410a'
const CROCHET = '#b65c1f'

/** Texte d'une graduation : virgule, vrai signe moins. */
export function texteNombre(v: number): string {
  const r = Math.round(v * 1000) / 1000
  return String(r === 0 ? 0 : r).replace('.', ',').replace('-', '−')
}

function droite(g: Gabarit): Disposition {
  const { de, a, pas } = g.r
  const n = Math.max(1, Math.round((a - de) / pas))
  const U = Math.max(40, Math.min(110, 1000 / n))
  const M = 60
  const w = M + n * U + M + 20
  const h = 170
  const Y = 86
  const X = (v: number) => M + ((v - de) / pas) * U
  const xMin = 8
  const xMax = w - 26
  const formes: Forme[] = []
  const cases: CaseGabarit[] = []
  const { morceaux, erreur } = lireIntervalles(g.intervalles ?? [])
  const garde = erreur ? [] : g.combinaison === 'intersection' ? intersection(morceaux) : reunion(morceaux)
  const vx = (v: number) => (v === -Infinity ? xMin : v === Infinity ? xMax : Math.max(xMin, Math.min(xMax, X(v))))
  const HB = 28
  if (!erreur && (g.intervalles?.length ?? 0) > 0) {
    // Exclu = complément du gardé dans la droite visible.
    let x0 = xMin
    const blocs: { x1: number; x2: number; garde: boolean }[] = []
    for (const m of garde) {
      const x1 = vx(m.a)
      const x2 = vx(m.b)
      if (x1 > x0) blocs.push({ x1: x0, x2: x1, garde: false })
      if (x2 > x1) blocs.push({ x1, x2, garde: true })
      x0 = Math.max(x0, x2)
    }
    if (x0 < xMax) blocs.push({ x1: x0, x2: xMax, garde: false })
    for (const b of blocs) {
      formes.push({ f: 'rect', x: b.x1, y: Y - HB / 2, w: b.x2 - b.x1, h: HB, fond: b.garde ? VERT_GARDE : ROUGE_EXCLU, opacite: b.garde ? 0.34 : 0.3, rx: 4 })
      if (b.x2 - b.x1 >= 64) formes.push({ f: 'texte', x: (b.x1 + b.x2) / 2, y: Y - HB / 2 - 14, t: b.garde ? 'gardé' : 'exclu', taille: 24, gras: true, couleur: b.garde ? MOT_GARDE : MOT_EXCLU, ancre: 'middle', police: 'sans' })
    }
  }
  formes.push({ f: 'ligne', x1: xMin, y1: Y, x2: w - 14, y2: Y, ep: 3, couleur: TRAIT })
  formes.push({ f: 'chemin', d: `M ${w - 26} ${Y - 10} L ${w - 8} ${Y} L ${w - 26} ${Y + 10} Z`, fond: TRAIT })
  const bornesFinies = new Set<number>()
  for (const m of garde) {
    if (Number.isFinite(m.a)) bornesFinies.add(m.a)
    if (Number.isFinite(m.b)) bornesFinies.add(m.b)
  }
  for (let i = 0; i <= n; i++) {
    const v = de + i * pas
    const x = X(v)
    formes.push({ f: 'ligne', x1: x, y1: Y - HB / 2, x2: x, y2: Y + HB / 2, ep: 3, couleur: TRAIT })
    const gras = [...bornesFinies].some((b) => Math.abs(b - v) < 1e-9)
    formes.push({ f: 'texte', x, y: Y + (gras ? 70 : 60), t: texteNombre(v), taille: 24, couleur: gras ? '#7a3c11' : TRAIT, gras, ancre: 'middle', police: 'mono' })
  }
  // Bornes qui ne tombent pas sur une graduation : leur nombre en gras sous le crochet.
  for (const b of bornesFinies) {
    const surGraduation = Math.abs((b - de) / pas - Math.round((b - de) / pas)) < 1e-9
    if (!surGraduation && b >= de - pas && b <= a + pas) formes.push({ f: 'texte', x: X(b), y: Y + 70, t: texteNombre(b), taille: 22, couleur: '#7a3c11', gras: true, ancre: 'middle', police: 'mono' })
  }
  // Crochets : « [ » tourné vers l'intérieur = compris, « ] » vers l'extérieur = exclu (comme dans le cours).
  for (const m of garde) {
    for (const [v, ouvert, gauche] of [
      [m.a, m.aOuvert, true],
      [m.b, m.bOuvert, false],
    ] as const) {
      if (!Number.isFinite(v)) continue
      const x = X(v)
      // Bras vers la droite (« [ ») : borne gauche comprise, ou borne droite exclue.
      const versDroite = gauche ? !ouvert : ouvert
      const dx = versDroite ? 14 : -14
      const xv = x + (versDroite ? -4 : 4)
      formes.push({ f: 'chemin', d: `M ${xv + dx} ${Y - 38} H ${xv} V ${Y + 38} H ${xv + dx}`, bord: CROCHET, ep: 6 })
    }
  }
  return { w, h, formes, cases }
}

/** Disposition d'un gabarit (px à l'échelle 1). */
export function disposer(g: Gabarit): Disposition {
  switch (g.type) {
    case 'signes':
      return tableauSignes(g)
    case 'variations':
      return tableauVariations(g)
    case 'arbre':
      return arbre(g)
    case 'venn':
      return venn(g)
    case 'droite':
      return droite(g)
    case 'statistique': {
      const lignes = LIGNES_STAT.filter((k) => g.r.lignesStat[k]).map((k) => ({ id: k, defaut: DEFAUT_LIGNE_STAT[k] }))
      return tableauLignes(g, lignes, 250, 92, 64, g.r.total)
    }
    case 'valeurs': {
      const lignes = [
        { id: 'x', defaut: 'x' },
        { id: 'f', defaut: 'f(x)' },
        ...(g.r.lignesValeurs >= 3 ? [{ id: 'g', defaut: 'g(x)' }] : []),
      ]
      return tableauLignes(g, lignes, 140, 92, 64, false)
    }
  }
}

/** Nouveau gabarit : centré en largeur, sous la petite barre ; échelle réduite s'il est plus large que la page. */
export function nouveauGabarit(type: TypeGabarit, r: ReglagesGabarit, id: string): Gabarit {
  const g: Gabarit = { genre: 'gabarit', id, type, x: 0, y: 0, k: 1, r: reglagesComplets(r), cases: {} }
  if (type === 'droite') {
    g.intervalles = [{ g: '−2', d: '3', gOuvert: true, dOuvert: false }]
    g.combinaison = 'reunion'
  }
  const d = disposer(g)
  const k = Math.min(1, 1180 / d.w, 520 / d.h)
  g.k = Math.round(k * 1000) / 1000
  g.x = Math.round((1280 - d.w * g.k) / 2)
  // Plutôt en haut (sous la petite barre) : le petit clavier trouve sa place dessous.
  g.y = Math.round(Math.max(96, Math.min(130, (720 - d.h * g.k) / 2 - 20)))
  return g
}

/** Réglages « + colonne » / « + ligne » d'un gabarit posé (null = pas de sens pour ce type). */
export function ajouterColonne(g: Gabarit): Gabarit | null {
  const r = { ...g.r }
  if (g.type === 'signes') r.valeurs = Math.min(4, r.valeurs + 1)
  else if (g.type === 'variations') r.intervalles = Math.min(4, r.intervalles + 1)
  else if (g.type === 'statistique' || g.type === 'valeurs') r.colonnes = Math.min(10, r.colonnes + 1)
  else return null
  return { ...g, r: reglagesComplets(r) }
}
export function ajouterLigne(g: Gabarit): Gabarit | null {
  const r = { ...g.r }
  if (g.type === 'signes') r.facteurs = Math.min(4, r.facteurs + 1)
  else if (g.type === 'valeurs') r.lignesValeurs = Math.min(3, r.lignesValeurs + 1)
  else if (g.type === 'variations' && !r.derivee) r.derivee = true
  else return null
  return { ...g, r: reglagesComplets(r) }
}
export const peutAjouterColonne = (g: Gabarit) =>
  (g.type === 'signes' && g.r.valeurs < 4) || (g.type === 'variations' && g.r.intervalles < 4) || ((g.type === 'statistique' || g.type === 'valeurs') && g.r.colonnes < 10)
export const peutAjouterLigne = (g: Gabarit) => (g.type === 'signes' && g.r.facteurs < 4) || (g.type === 'valeurs' && g.r.lignesValeurs < 3) || (g.type === 'variations' && !g.r.derivee)

// ---------- réglages retenus (navigateur, try/catch) ----------

const CLE_REGLAGES = 'projection:gabarit-reglages'

export function lireReglages(): { type: TypeGabarit; r: ReglagesGabarit } {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_REGLAGES) ?? 'null') as { type?: string; r?: Partial<ReglagesGabarit> } | null
    const type = TYPES_GABARITS.includes(brut?.type as TypeGabarit) ? (brut!.type as TypeGabarit) : 'signes'
    return { type, r: reglagesComplets(brut?.r) }
  } catch {
    return { type: 'signes', r: { ...REGLAGES_DEFAUT } }
  }
}

export function retenirReglages(type: TypeGabarit, r: ReglagesGabarit) {
  try {
    localStorage.setItem(CLE_REGLAGES, JSON.stringify({ type, r }))
  } catch {
    // Stockage refusé : le choix vaut pour cette visite.
  }
}

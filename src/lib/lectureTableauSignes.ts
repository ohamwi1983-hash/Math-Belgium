/**
 * Lecture « case par case » d'un tableau de signes / de variations (planche 09 des maquettes côté
 * élève, démo validée « lecture-guidee.html », onglet 9).
 *
 * Module PUR (aucun DOM) : à partir d'un modèle de tableau (lignes alignées colonne par colonne,
 * même forme que le bloc `signTable` du contenu), produit une phrase en français pour chaque case
 * et un résumé du tableau. Les phrases sont écrites pour être lues (lecteur d'écran, voix) : les
 * nombres et expressions y sont dits en mots (« x plus 3 », « moins l'infini »).
 *
 * Convention du modèle (celle de `signTable`) : `rows[0]` est la ligne des valeurs de x ; dans
 * chaque ligne, les cellules alternent point (indices pairs : bornes, racines, valeurs interdites)
 * et intervalle (indices impairs). Le libellé de ligne est la colonne 0 de la grille rendue.
 */

export interface LigneModele {
  label: string
  cells: string[]
}

export interface ModeleTableau {
  caption?: string
  rows: LigneModele[]
}

export interface CaseLecture {
  /** Phrase dite pour la case (lecteur d'écran, voix). */
  phrase: string
  /** Repère visuel court, avec les symboles du tableau (« Ligne « x + 3 » · entre −3 et 1 »). */
  position: string
}

/** `grille[r][c]` : `c = 0` = libellé de la ligne `r`, `c ≥ 1` = cellule `c − 1`. `null` = case
 * non navigable (borne vide, intervalle vide de la ligne des x). */
export type GrilleLecture = (CaseLecture | null)[][]

/* ------------------------------------------------------------------------------------------ */
/*  Lecture des nombres et expressions en mots.                                                 */
/*  À REMPLACER PAR `lireFormule` (lot V, `src/lib/lectureFormules.ts`) quand il sera livré :    */
/*  ce petit lecteur ne couvre que ce qui apparaît dans les tableaux de signes du site          */
/*  (nombres, x + 3, x², x₁, f′(x), √2⁄2, 1⁄e, ±∞, parenthèses simples).                        */
/* ------------------------------------------------------------------------------------------ */

const EXPOSANTS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁻': '−', '⁺': '+', 'ˣ': 'x', 'ⁿ': 'n',
}
const INDICES: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ₙ': 'n',
}
const LETTRE = /\p{L}/u

function parentheseFermante(s: string, ouvrante: number): number {
  let prof = 0
  for (let i = ouvrante; i < s.length; i++) {
    if (s[i] === '(') prof++
    else if (s[i] === ')') {
      prof--
      if (prof === 0) return i
    }
  }
  return s.length
}

/** Lit en mots un nombre ou une expression écrits avec les symboles Unicode du site. */
export function lireTexteMath(source: string): string {
  const s = source.replace(/\|\|/g, '‖').trim()
  const mots: string[] = []
  let i = 0
  // Dernier élément lu : une valeur (nombre, lettre, parenthèse fermée) appelle « fois » devant
  // une parenthèse ouvrante (« (x − 1)(x − 4) »).
  let derniereValeur = false
  const suivantNonBlanc = (k: number) => {
    while (k < s.length && /\s/.test(s[k])) k++
    return k
  }
  while (i < s.length) {
    const ch = s[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }
    if (/[0-9]/.test(ch)) {
      const m = /^[0-9]+(?:,[0-9]+)?/.exec(s.slice(i))!
      mots.push(m[0])
      i += m[0].length
      derniereValeur = true
      continue
    }
    if (ch in EXPOSANTS) {
      let brut = ''
      while (i < s.length && s[i] in EXPOSANTS) brut += EXPOSANTS[s[i++]]
      const apresParenthese = mots[mots.length - 1] === 'fin de parenthèse'
      if (apresParenthese) mots[mots.length - 1] += ','
      if (brut === '2') mots.push(apresParenthese ? 'au carré' : 'carré')
      else if (brut === '3') mots.push('au cube')
      else mots.push('puissance', lireTexteMath(brut))
      derniereValeur = true
      continue
    }
    if (ch in INDICES) {
      let brut = ''
      while (i < s.length && s[i] in INDICES) brut += INDICES[s[i++]]
      mots.push('indice', brut)
      derniereValeur = true
      continue
    }
    if (LETTRE.test(ch)) {
      let mot = ''
      while (i < s.length && LETTRE.test(s[i]) && !(s[i] in EXPOSANTS) && !(s[i] in INDICES)) mot += s[i++]
      let prime = ''
      while (i < s.length && (s[i] === '′' || s[i] === '″' || s[i] === "'")) {
        prime += s[i] === '″' ? ' seconde' : ' prime'
        i++
      }
      const k = suivantNonBlanc(i)
      const estFonction = s[k] === '(' && (prime !== '' || /^[fghuvFGH]$/.test(mot) || mot.length > 2)
      mots.push(mot === 'π' ? 'pi' : mot === 'arctan' ? 'arc tangente' : mot + prime)
      if (estFonction) {
        const fin = parentheseFermante(s, k)
        mots.push('de', lireTexteMath(s.slice(k + 1, fin)))
        i = fin + 1
      }
      derniereValeur = true
      continue
    }
    if (ch === '′' || ch === '″') {
      mots.push(ch === '″' ? 'seconde' : 'prime')
      i++
      continue
    }
    if (ch === '−' || ch === '-' || ch === '–' || ch === '+') {
      const k = suivantNonBlanc(i + 1)
      const signe = ch === '+' ? 'plus' : 'moins'
      if (s[k] === '∞') {
        mots.push(`${signe} l'infini`)
        i = k + 1
        derniereValeur = true
      } else {
        mots.push(signe)
        i++
        derniereValeur = false
      }
      continue
    }
    if (ch === '(') {
      const fin = parentheseFermante(s, i)
      if (derniereValeur) mots.push('fois')
      mots.push('parenthèse,', lireTexteMath(s.slice(i + 1, fin)) + ',', 'fin de parenthèse')
      i = fin + 1
      derniereValeur = true
      continue
    }
    const SYMBOLES: Record<string, string> = {
      '∞': "l'infini", '·': 'fois', '×': 'fois', '*': 'fois', '/': 'sur', '⁄': 'sur', '÷': 'sur',
      '√': 'racine carrée de', '=': 'égale', '≈': 'environ', '<': 'plus petit que', '>': 'plus grand que',
      '≤': 'plus petit ou égal à', '≥': 'plus grand ou égal à', ';': 'point-virgule', '‖': 'double barre',
      '∄': "n'existe pas", '↗': 'croît', '↘': 'décroît', ',': ',', ')': '',
    }
    if (ch in SYMBOLES) {
      if (SYMBOLES[ch]) mots.push(SYMBOLES[ch])
      derniereValeur = ch === '∞'
      i++
      continue
    }
    mots.push(ch)
    i++
  }
  return mots
    .join(' ')
    .replace(/\s+,/g, ',')
    .replace(/,,/g, ',')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Convertit un petit LaTeX de tableau (en-têtes et libellés des générateurs, lus dans
 * l'annotation KaTeX) vers la notation Unicode que lit `lireTexteMath`. */
export function latexVersTexte(latex: string): string {
  let s = latex
  const groupe = (k: number): [string, number] => {
    // lit {…} ou un seul caractère à partir de k ; renvoie [contenu, indice après]
    while (s[k] === ' ') k++
    if (s[k] !== '{') return [s[k] ?? '', k + 1]
    let prof = 0
    for (let j = k; j < s.length; j++) {
      if (s[j] === '{') prof++
      else if (s[j] === '}') {
        prof--
        if (prof === 0) return [s.slice(k + 1, j), j + 1]
      }
    }
    return [s.slice(k + 1), s.length]
  }
  const simple = (t: string) => /^[\p{L}0-9,]+$/u.test(t)
  const remplacerCommande = (nom: string, f: (args: string[]) => string, nbArgs: number) => {
    let k
    while ((k = s.indexOf(nom)) >= 0) {
      let j = k + nom.length
      const args: string[] = []
      for (let a = 0; a < nbArgs; a++) {
        const [g, apres] = groupe(j)
        args.push(latexVersTexte(g))
        j = apres
      }
      s = s.slice(0, k) + f(args) + s.slice(j)
    }
  }
  s = s.replace(/\\left|\\right|\\displaystyle|\\[,;!]|\\quad|\\qquad/g, '')
  remplacerCommande('\\dfrac', ([a, b]) => (simple(a) && simple(b) ? `${a}⁄${b}` : `(${a})⁄(${b})`), 2)
  remplacerCommande('\\tfrac', ([a, b]) => (simple(a) && simple(b) ? `${a}⁄${b}` : `(${a})⁄(${b})`), 2)
  remplacerCommande('\\frac', ([a, b]) => (simple(a) && simple(b) ? `${a}⁄${b}` : `(${a})⁄(${b})`), 2)
  remplacerCommande('\\sqrt', ([a]) => (simple(a) ? `√${a}` : `√(${a})`), 1)
  remplacerCommande('\\text', ([a]) => a, 1)
  remplacerCommande('\\mathrm', ([a]) => a, 1)
  remplacerCommande('\\operatorname', ([a]) => a, 1)
  s = s
    .replace(/\\infty/g, '∞')
    .replace(/\\cdot|\\times/g, '·')
    .replace(/\\pi/g, 'π')
    .replace(/\\ln/g, 'ln')
    .replace(/\\leq?/g, '≤')
    .replace(/\\geq?/g, '≥')
    .replace(/\\approx/g, '≈')
  // Exposants et indices
  const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '−': '⁻', '+': '⁺', x: 'ˣ', n: 'ⁿ' }
  const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', n: 'ₙ' }
  for (const [marque, table] of [['^', SUP], ['_', SUB]] as const) {
    let k
    while ((k = s.indexOf(marque)) >= 0) {
      const [g, apres] = groupe(k + 1)
      const conv = [...g].every((c) => c in table) ? [...g].map((c) => table[c]).join('') : `(${g})`
      s = s.slice(0, k) + conv + s.slice(apres)
    }
  }
  return s
    .replace(/[{}]/g, '')
    .replace(/\\/g, '')
    .replace(/-/g, '−')
    .replace(/\s+/g, ' ')
    .trim()
}

/* ------------------------------------------------------------------------------------------ */
/*  Analyse du tableau                                                                         */
/* ------------------------------------------------------------------------------------------ */

type TypeLigne = 'x' | 'signes' | 'variations' | 'concavite' | 'texte'

interface InfoLigne {
  type: TypeLigne
  /** Libellé tel qu'affiché. */
  label: string
  cells: string[]
  /** « Ligne x plus 3 », « Ligne du produit »… (début des phrases de la ligne). */
  nom: string
  /** Ce dont on parle : « x plus 3 », « le produit », « f prime de x », « le numérateur x moins 2 ». */
  sujet: string
  /** Même chose sans « le numérateur » / « le dénominateur ». */
  sujetCourt?: string
  feminin: boolean
  /** Ligne de signes obtenue par la règle des signes à partir des lignes `operandes`. */
  combine?: 'produit' | 'quotient' | 'inconnu'
  operandes?: number[]
  trinome?: boolean
  /** Ligne « signe de f′(x) » (1) ou « signe de f″(x) » (2). */
  derivee?: 1 | 2
  /** Nom de la fonction (lignes de variations / concavité). */
  fonction?: string
}

const estPlus = (t: string) => t.trim() === '+'
const estMoins = (t: string) => ['−', '-', '–'].includes(t.trim())
const estSigne = (t: string) => estPlus(t) || estMoins(t)
const estZero = (t: string) => t.trim() === '0'
const estInterdite = (t: string) => ['‖', '||', '∄'].includes(t.trim())
const signeNorm = (t: string): '+' | '−' => (estPlus(t) ? '+' : '−')
const motSigne = (s: '+' | '−') => (s === '+' ? 'plus' : 'moins')
const adjSigne = (s: '+' | '−', fem: boolean) => (s === '+' ? (fem ? 'positive' : 'positif') : fem ? 'négative' : 'négatif')
/** Typographie française du texte affiché : apostrophe ’, espace insécable avant « : ; ? ! » et dans « … ». */
const insecables = (t: string) => t.replace(/'/g, '’').replace(/ ([:;?!»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')
const majuscule = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t)

function joinEt(items: string[], avant = ''): string {
  const l = items.map((x) => avant + x)
  if (l.length <= 1) return l.join('')
  return l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1]
}

/** « de » / « à » / « à partir de » devant un groupe (contractions et élisions). */
function prep(p: 'de' | 'à' | 'à partir de' | "jusqu'à", groupe: string): string {
  if (groupe.startsWith('le ')) {
    const reste = groupe.slice(3)
    if (p === 'de') return 'du ' + reste
    if (p === 'à') return 'au ' + reste
    if (p === 'à partir de') return 'à partir du ' + reste
    return "jusqu'au " + reste
  }
  if ((p === 'de' || p === 'à partir de') && /^[aeéèiouyh]/i.test(groupe)) return p.slice(0, -2) + "d'" + groupe
  return `${p} ${groupe}`
}

const RE_FONCTION = /^([a-zA-Z])\s*(′|″|'|'')?\s*\(\s*[a-z]\s*\)$/

function exprDepuisLegende(caption: string | undefined, expr: string): string | undefined {
  if (!caption) return undefined
  const k = caption.indexOf(expr)
  if (k < 0) return undefined
  const m = /^\s*=\s*([^,—]+)/.exec(caption.slice(k + expr.length))
  return m ? m[1].replace(/\s+et\s.*$/, '').trim() : undefined
}

function ressembleTrinome(expr: string | undefined): boolean {
  if (!expr) return false
  if (/[³⁴⁻e]/.test(expr)) return false
  if (/²/.test(expr)) return true
  return /^[−-]?[0-9,]*\s*\([^()]*x[^()]*\)\s*·?\s*\([^()]*x[^()]*\)$/.test(expr.trim())
}

function nomLigneTexte(label: string): string {
  const m = /^courbe\s*\/\s*(.+)$/i.exec(label.trim())
  if (m) return `position de la courbe par rapport à ${lireTexteMath(m[1])}`
  const g = /^(\p{L}{3,})\s*\/\s*(.+)$/u.exec(label.trim())
  if (g) return `${g[1]} par rapport à ${lireTexteMath(g[2])}`
  return lireTexteMath(label)
}

function analyser(m: ModeleTableau): InfoLigne[] | null {
  const n = m.rows[0]?.cells.length ?? 0
  if (m.rows.length < 2 || n < 3 || n % 2 === 0 || m.rows.some((r) => r.cells.length !== n)) return null
  const infos: InfoLigne[] = []
  const caption = m.caption
  // Rôle numérateur / dénominateur : « x − 2 (N) » (cours) ou « N : x − 2 » (générateurs).
  const RE_ROLE = /^\s*(N|D)\s*:\s*|\s*\((N|D)\)\s*$/
  const aRoles = m.rows.some((r) => RE_ROLE.test(r.label))
  const nbRole = (x: 'N' | 'D') => m.rows.filter((r) => { const k = RE_ROLE.exec(r.label); return k && (k[1] ?? k[2]) === x }).length
  m.rows.forEach((row, r) => {
    const label = row.label.trim()
    const cells = row.cells.map((c) => c.trim())
    if (r === 0) {
      const v = lireTexteMath(label) || 'x'
      infos.push({ type: 'x', label, cells, nom: `Ligne des valeurs de ${v}`, sujet: v, feminin: false })
      return
    }
    const intervalles = cells.filter((_, j) => j % 2 === 1)
    const type: TypeLigne = intervalles.some((t) => /[↗↘]/.test(t))
      ? 'variations'
      : intervalles.some((t) => /[∪∩]/.test(t))
        ? 'concavite'
        : intervalles.every((t) => t === '' || estSigne(t)) && intervalles.some(estSigne)
          ? 'signes'
          : 'texte'
    if (type === 'variations' || type === 'concavite') {
      const f = /(?:variations?|concavit[ée])\s+de\s+([a-zA-Z])\b/i.exec(label)?.[1] ?? (/^[a-zA-Z]$/.test(label) ? label : 'f')
      infos.push({
        type,
        label,
        cells,
        nom: type === 'variations' ? `Ligne des variations de ${f}` : `Ligne de la concavité de ${f}`,
        sujet: f,
        feminin: true,
        fonction: f,
      })
      return
    }
    if (type === 'texte') {
      const nom = nomLigneTexte(label)
      const position = nom.startsWith('position')
      infos.push({ type, label, cells, nom: position ? `Ligne de la ${nom}` : `Ligne ${nom}`, sujet: position ? `la ${nom}` : nom, feminin: false })
      return
    }
    // Ligne de signes
    let expr = label
    let role: 'numérateur' | 'dénominateur' | undefined
    let plusieurs = false
    const mr = RE_ROLE.exec(expr)
    if (mr) {
      const k = (mr[1] ?? mr[2]) as 'N' | 'D'
      role = k === 'N' ? 'numérateur' : 'dénominateur'
      plusieurs = nbRole(k) > 1
      expr = expr.replace(RE_ROLE, '').trim()
    }
    const bas = expr.toLowerCase()
    let combine: InfoLigne['combine']
    if (/^(signe du )?produit$/.test(bas)) combine = 'produit'
    else if (/^(signe du )?quotient$/.test(bas)) combine = 'quotient'
    if (combine) {
      const le = combine === 'produit' ? 'le produit' : 'le quotient'
      infos.push({ type, label, cells, nom: `Ligne du ${combine}`, sujet: le, feminin: false, combine })
      return
    }
    const prefixe = /^signe\s+de\s+(.+)$/i.exec(expr)
    if (prefixe) expr = prefixe[1].trim()
    const fm = RE_FONCTION.exec(expr)
    const sujetSeul = lireTexteMath(expr)
    const info: InfoLigne = {
      type,
      label,
      cells,
      nom: prefixe ? `Ligne du signe de ${sujetSeul}` : role ? (plusieurs ? `Ligne ${sujetSeul}, facteur du ${role}` : `Ligne du ${role} ${sujetSeul}`) : `Ligne ${sujetSeul}`,
      sujet: role && !plusieurs ? `le ${role} ${sujetSeul}` : sujetSeul,
      sujetCourt: sujetSeul,
      feminin: !!fm && !role,
    }
    if (fm && fm[2]) info.derivee = fm[2] === '″' || fm[2] === "''" ? 2 : 1
    const exprT = fm ? exprDepuisLegende(caption, expr) : expr
    info.trinome = ressembleTrinome(exprT) || (!!fm && !info.derivee && /a\s*[<>]\s*0/.test(caption ?? ''))
    infos.push(info)
  })
  // Lignes combinées : explicites (produit / quotient) ou dernière ligne de signes qui vaut, sur
  // chaque intervalle, le produit des signes des lignes au-dessus (au moins deux).
  const signes = infos.map((x, r) => (x.type === 'signes' ? r : -1)).filter((r) => r >= 0)
  signes.forEach((r, idx) => {
    const info = infos[r]
    const avant = signes.slice(0, idx)
    if (info.combine) {
      info.operandes = avant
      if (info.combine === 'produit' && aRoles) info.combine = 'quotient'
      return
    }
    if (idx === signes.length - 1 && avant.length >= 2) {
      const ok = info.cells.every((t, j) => {
        if (j % 2 === 0) return true
        if (!estSigne(t)) return t === ''
        const ops = avant.map((a) => infos[a].cells[j])
        if (!ops.every(estSigne)) return false
        const neg = ops.filter(estMoins).length
        return signeNorm(t) === (neg % 2 ? '−' : '+')
      })
      if (ok) {
        info.combine = aRoles ? 'quotient' : 'inconnu'
        info.operandes = avant
        info.trinome = false
      }
    }
  })
  return infos
}

/* ------------------------------------------------------------------------------------------ */
/*  Phrases                                                                                    */
/* ------------------------------------------------------------------------------------------ */

interface Contexte {
  infos: InfoLigne[]
  xs: string[] // cellules de la ligne des x (symboles)
  v: string // nom de la variable en mots
  n: number
}

const xMot = (c: Contexte, j: number) => lireTexteMath(c.xs[j]) || '…'
const enX = (c: Contexte, j: number) => (/∞/.test(c.xs[j]) ? `en ${xMot(c, j)}` : `en ${c.v} égale ${xMot(c, j)}`)
const intervalleMot = (c: Contexte, k: number) => `pour ${c.v} entre ${xMot(c, k - 1)} et ${xMot(c, k + 1)}`
const colonneInterdite = (c: Contexte, j: number) => c.infos.some((x) => estInterdite(x.cells[j] ?? ''))

function zerosLigne(info: InfoLigne): number[] {
  return info.cells.map((t, j) => (j % 2 === 0 && estZero(t) ? j : -1)).filter((j) => j >= 0)
}

function signeAttenduTrinome(info: InfoLigne, c: Contexte, k: number): '+' | '−' | null {
  if (!/^\+∞$/.test(c.xs[c.n - 1]) || !/^[−-]∞$/.test(c.xs[0])) return null
  const a = info.cells[c.n - 2]
  if (!estSigne(a)) return null
  const sa = signeNorm(a)
  const z = zerosLigne(info)
  if (z.length === 2 && k > z[0] && k < z[1]) return sa === '+' ? '−' : '+'
  if (z.length > 2) return null
  return sa
}

function pourquoiIntervalleSignes(info: InfoLigne, c: Contexte, k: number): string {
  const t = info.cells[k]
  if (info.combine && info.operandes) {
    const ops = info.operandes.map((r) => c.infos[r].cells[k])
    if (!ops.every(estSigne)) return ''
    const neg = ops.filter(estMoins).length
    const res: '+' | '−' = neg % 2 ? '−' : '+'
    if (res !== signeNorm(t)) return ''
    const mots = ops.map((o) => motSigne(signeNorm(o)))
    if (ops.length === 2) {
      if (info.combine === 'produit') return `${mots[0]} fois ${mots[1]} donne ${motSigne(res)}`
      if (info.combine === 'quotient') return `${mots[0]} divisé par ${mots[1]} donne ${motSigne(res)}`
      return `règle des signes : ${mots[0]} et ${mots[1]} donnent ${motSigne(res)}`
    }
    if (neg === 0) return 'règle des signes : aucune ligne négative, donc plus'
    return `règle des signes : ${neg} ligne${neg > 1 ? 's' : ''} négative${neg > 1 ? 's' : ''}, un nombre ${neg % 2 ? 'impair, donc moins' : 'pair, donc plus'}`
  }
  if (info.trinome) {
    const attendu = signeAttenduTrinome(info, c, k)
    if (!attendu || attendu !== signeNorm(t)) return ''
    const sa = signeNorm(info.cells[c.n - 2])
    const z = zerosLigne(info)
    if (z.length === 2) {
      return k > z[0] && k < z[1]
        ? `entre les racines, le trinôme a le signe contraire de a, qui est ${motSigne(sa)}`
        : `à l'extérieur des racines, le trinôme a le signe de a, ici ${motSigne(sa)}`
    }
    if (z.length === 1) return `une seule racine (double) : le trinôme a le signe de a de chaque côté, ici ${motSigne(sa)}`
    return `pas de racine : le trinôme a partout le signe de a, ici ${motSigne(sa)}`
  }
  const z = zerosLigne(info)
  if (z.length === 1 && !info.cells.some(estInterdite)) {
    const gauche = info.cells.filter((_, j) => j % 2 === 1 && j < z[0])
    const droite = info.cells.filter((_, j) => j % 2 === 1 && j > z[0])
    if (gauche.length && droite.length && gauche.every((g) => estSigne(g) && signeNorm(g) === signeNorm(gauche[0])) && droite.every((d) => estSigne(d) && signeNorm(d) === signeNorm(droite[0]))) {
      const sg = signeNorm(gauche[0])
      const sd = signeNorm(droite[0])
      if (sg !== sd) return `En effet, ${info.sujet} s'annule en ${xMot(c, z[0])} : ${adjSigne(sg, info.feminin)} avant, ${adjSigne(sd, info.feminin)} après`
    }
  }
  return ''
}

function phraseSignes(info: InfoLigne, c: Contexte, j: number): string | null {
  const t = info.cells[j]
  if (j % 2 === 1) {
    if (!estSigne(t)) return null
    const p = pourquoiIntervalleSignes(info, c, j)
    return `${info.nom}, ${intervalleMot(c, j)} : signe ${motSigne(signeNorm(t))}.${p ? ' ' + majuscule(p) + '.' : ''}`
  }
  const borne = j === 0 || j === c.n - 1
  if (t === '' && borne) return null
  const ou = enX(c, j)
  const operandesAvec = (test: (x: string) => boolean, court = false) =>
    (info.operandes ?? []).filter((r) => test(c.infos[r].cells[j])).map((r) => (court ? (c.infos[r].sujetCourt ?? c.infos[r].sujet) : c.infos[r].sujet))
  if (estZero(t)) {
    let p = ''
    if (info.combine) {
      const z = operandesAvec(estZero)
      const verbe = z.length > 1 ? "s'annulent" : "s'annule"
      if (z.length && info.combine === 'quotient') p = `En effet, ${joinEt(z)} ${verbe} ici, sans annuler le dénominateur : le quotient vaut zéro`
      else if (z.length) p = `En effet, ${joinEt(z)} ${verbe} ici, donc ${info.sujet} aussi`
    } else if (info.trinome) {
      p = zerosLigne(info).length === 1 ? `C'est la racine double du trinôme` : `C'est une racine du trinôme`
    } else if (zerosLigne(info).length === 1) {
      p = `C'est la racine ${prep('de', info.sujet)}`
    }
    return `${info.nom}, ${ou} : zéro.${p ? ' ' + majuscule(p) + '.' : ''}`
  }
  if (estInterdite(t)) {
    let p = ''
    if (info.combine) {
      const d = operandesAvec(estZero, true)
      if (d.length) p = `En effet, ${joinEt(d)}, au dénominateur, ${d.length > 1 ? "s'annulent" : "s'annule"} : on ne divise jamais par zéro`
    }
    return `${info.nom}, ${ou} : ${t === '∄' ? "n'existe pas" : 'double barre'}, valeur interdite.${p ? ' ' + majuscule(p) + '.' : ''}`
  }
  const quoi = estSigne(t) ? `signe ${motSigne(signeNorm(t))}` : 'pas de zéro'
  return `${info.nom}, ${ou} : ${quoi}, car ${info.sujet} ne s'annule pas ${ou}.`
}

interface Extremite {
  sorte: 'max' | 'min' | 'pi' | 'ni' | 'pasPi' | 'interdite' | 'ah' | 'valeur'
  val?: string
  point?: { nom: string; a: string; b: string }
}

function lireExtremite(t: string): Extremite | null {
  const s = t.trim()
  if (!s) return null
  if (estInterdite(s)) return { sorte: 'interdite' }
  let m
  if ((m = /^(maximum|max|minimum|min)\.?\s*(?:\((.*)\)|(.*))$/i.exec(s))) {
    const val = (m[2] ?? m[3] ?? '').trim()
    return { sorte: /^max/i.test(m[1]) ? 'max' : 'min', val: val || undefined }
  }
  if (/^ni\b/i.test(s)) return { sorte: 'ni' }
  if (/^pas de PI/i.test(s)) return { sorte: 'pasPi' }
  if ((m = /^PI\b\s*(?:\((.*)\)|(.*))$/.exec(s))) {
    const val = (m[1] ?? m[2] ?? '').trim()
    return { sorte: 'pi', val: val || undefined }
  }
  if ((m = /^([A-Z])\s*\(\s*([^;]+);([^)]+)\)$/.exec(s))) return { sorte: 'max', val: m[3].trim(), point: { nom: m[1], a: m[2].trim(), b: m[3].trim() } }
  if ((m = /^AH\b\s*(.*)$/.exec(s))) {
    const eq = /=\s*(.+)$/.exec(m[1])
    return { sorte: 'ah', val: eq ? eq[1].trim() : undefined }
  }
  return { sorte: 'valeur', val: s }
}

function direction(t: string): 'croît' | 'décroît' | null {
  if (/↗/.test(t)) return 'croît'
  if (/↘/.test(t)) return 'décroît'
  return null
}

/** Extrémum déduit des flèches voisines quand la cellule ne porte qu'une valeur. */
function sorteDeduite(info: InfoLigne, j: number): Extremite | null {
  const e = lireExtremite(info.cells[j])
  if (!e || e.sorte !== 'valeur' || j === 0 || j === info.cells.length - 1) return e
  const g = direction(info.cells[j - 1])
  const d = direction(info.cells[j + 1])
  if (g === 'croît' && d === 'décroît') return { ...e, sorte: 'max' }
  if (g === 'décroît' && d === 'croît') return { ...e, sorte: 'min' }
  return e
}

function groupeTrajet(e: Extremite | null): string | null {
  if (!e) return null
  const val = e.val ? ' ' + lireTexteMath(e.val) : ''
  switch (e.sorte) {
    case 'max':
      return `son maximum${val}`
    case 'min':
      return `son minimum${val}`
    case 'pi':
      return "le point d'inflexion"
    case 'ah':
    case 'valeur':
      return e.val ? lireTexteMath(e.val) : null
    default:
      return null
  }
}

const ligneDerivee = (c: Contexte, ordre: 1 | 2) => c.infos.find((x) => x.type === 'signes' && x.derivee === ordre)

function phraseVariations(info: InfoLigne, c: Contexte, j: number): string | null {
  const f = info.fonction ?? 'f'
  const t = info.cells[j]
  if (j % 2 === 1) {
    const dir = direction(t)
    if (!dir) return t ? `${info.nom}, ${intervalleMot(c, j)} : ${t}.` : null
    const extra = t.replace(/[↗↘]/g, '').trim()
    const de = groupeTrajet(sorteDeduite(info, j - 1))
    const a = groupeTrajet(sorteDeduite(info, j + 1))
    let trajet = ''
    if (de && a) trajet = ` ${prep('de', de)} ${prep('à', a)}`
    else if (a) trajet = ` ${prep("jusqu'à", a)}`
    else if (de) trajet = ` ${prep('à partir de', de)}`
    const raisons: string[] = []
    const d1 = ligneDerivee(c, 1)
    if (d1 && estSigne(d1.cells[j]) && (signeNorm(d1.cells[j]) === '+') === (dir === 'croît')) raisons.push(`${d1.sujet} est ${adjSigne(signeNorm(d1.cells[j]), d1.feminin)}`)
    const d2 = ligneDerivee(c, 2)
    if (extra && d2 && estSigne(d2.cells[j]) && (signeNorm(d2.cells[j]) === '+') === /convexe/.test(extra)) raisons.push(`${d2.sujet} est ${adjSigne(signeNorm(d2.cells[j]), d2.feminin)}`)
    return `${info.nom}, ${intervalleMot(c, j)} : ${f} ${dir}${trajet}${extra ? ` et elle est ${extra}` : ''}${raisons.length ? ', car ' + raisons.join(' et ') : ''}.`
  }
  const e = sorteDeduite(info, j)
  if (!e) return null
  const borne = j === 0 || j === c.n - 1
  const ou = enX(c, j)
  if (borne && (e.sorte === 'valeur' || e.sorte === 'ah')) {
    const val = e.val ? lireTexteMath(e.val) : ''
    if (e.sorte === 'ah') return `${info.nom}, quand ${c.v} tend vers ${xMot(c, j)} : ${f} tend vers ${val}, asymptote horizontale d'équation y égale ${val}.`
    if (/∞/.test(c.xs[j])) return `${info.nom}, quand ${c.v} tend vers ${xMot(c, j)} : ${f} tend vers ${val}.`
    if (colonneInterdite(c, j)) return `${info.nom}, quand ${c.v} s'approche de ${xMot(c, j)} : ${f} tend vers ${val}.`
    return `${info.nom}, ${ou} : ${f} vaut ${val}.`
  }
  const d1 = ligneDerivee(c, 1)
  const d2 = ligneDerivee(c, 2)
  const gauche = d1?.cells[j - 1] ?? ''
  const droite = d1?.cells[j + 1] ?? ''
  const vaut = e.val ? `, ${f} vaut ${lireTexteMath(e.val)}` : ''
  switch (e.sorte) {
    case 'max':
    case 'min': {
      const quoi = e.sorte === 'max' ? 'maximum' : 'minimum'
      const ou2 = e.point ? `, au point ${e.point.nom} de coordonnées ${lireTexteMath(e.point.a)} et ${lireTexteMath(e.point.b)}` : vaut
      let p = ''
      if (d1 && estSigne(gauche) && estSigne(droite)) {
        const sg = signeNorm(gauche)
        const sd = signeNorm(droite)
        if ((e.sorte === 'max' && sg === '+' && sd === '−') || (e.sorte === 'min' && sg === '−' && sd === '+')) p = `, car ${d1.sujet} passe de ${motSigne(sg)} à ${motSigne(sd)}`
      }
      return `${info.nom}, ${ou} : ${quoi}${ou2}${p}.`
    }
    case 'pi': {
      let p = ''
      if (d2 && estSigne(d2.cells[j - 1]) && estSigne(d2.cells[j + 1]) && signeNorm(d2.cells[j - 1]) !== signeNorm(d2.cells[j + 1])) p = `, car ${d2.sujet} change de signe`
      return `${info.nom}, ${ou} : point d'inflexion${vaut}${p}.`
    }
    case 'ni':
      return `${info.nom}, ${ou} : ni maximum ni minimum.`
    case 'pasPi':
      return `${info.nom}, ${ou} : pas de point d'inflexion.`
    case 'interdite':
      return `${info.nom}, ${ou} : ${f} n'est pas définie, valeur interdite.`
    default:
      return `${info.nom}, ${ou} : ${f} vaut ${lireTexteMath(e.val ?? '')}.`
  }
}

function phraseConcavite(info: InfoLigne, c: Contexte, j: number): string | null {
  const f = info.fonction ?? 'f'
  const t = info.cells[j]
  const d2 = ligneDerivee(c, 2)
  if (j % 2 === 1) {
    if (!t) return null
    const convexe = /∪/.test(t)
    const concave = /∩/.test(t)
    if (!convexe && !concave) return `${info.nom}, ${intervalleMot(c, j)} : ${t}.`
    let p = ''
    if (d2 && estSigne(d2.cells[j]) && (signeNorm(d2.cells[j]) === '+') === convexe) p = `, car ${d2.sujet} est ${adjSigne(signeNorm(d2.cells[j]), d2.feminin)}`
    return `${info.nom}, ${intervalleMot(c, j)} : ${f} est ${convexe ? 'convexe, tournée vers le haut' : 'concave, tournée vers le bas'}${p}.`
  }
  // Points : même lecture que les variations (point d'inflexion, valeur, valeur interdite)
  return phraseVariations({ ...info, fonction: f }, c, j)
}

function phraseTexte(info: InfoLigne, c: Contexte, r: number, j: number): string | null {
  const t = info.cells[j]
  if (!t) return null
  // Ligne de signes la plus proche au-dessus : le « pourquoi » de la ligne de texte.
  let s: InfoLigne | undefined
  for (let k = r - 1; k > 0; k--) if (c.infos[k].type === 'signes') {
    s = c.infos[k]
    break
  }
  let p = ''
  if (s) {
    const st = s.cells[j]
    if (estSigne(st)) p = `, car ${s.sujet} est ${adjSigne(signeNorm(st), s.feminin)}`
    else if (estZero(st)) p = `, car ${s.sujet} s'annule`
  }
  const ou = j % 2 === 1 ? intervalleMot(c, j) : enX(c, j)
  return `${info.nom}, ${ou} : ${t}${p}.`
}

function phraseX(c: Contexte, j: number): string | null {
  const t = c.xs[j]
  const nom = c.infos[0].nom
  if (j % 2 === 1) return t ? `${nom}, ${intervalleMot(c, j)} : ${t}.` : null
  if (!t) return null
  if (j === 0) {
    if (/∞/.test(t)) return `${nom} : le tableau commence à ${xMot(c, j)}.`
    return `${nom} : le tableau commence en ${c.v} égale ${xMot(c, j)}${colonneInterdite(c, j) ? ', valeur interdite, exclue' : ''}.`
  }
  if (j === c.n - 1) {
    if (/∞/.test(t)) return `${nom} : le tableau va jusqu'à ${xMot(c, j)}.`
    return `${nom} : le tableau va jusqu'à ${c.v} égale ${xMot(c, j)}${colonneInterdite(c, j) ? ', valeur interdite, exclue' : ''}.`
  }
  const parts: string[] = []
  const zeros = c.infos.filter((x) => x.type === 'signes' && estZero(x.cells[j])).map((x) => x.sujet)
  if (zeros.length) parts.push(`${joinEt(zeros)} ${zeros.length > 1 ? "s'annulent" : "s'annule"}`)
  if (colonneInterdite(c, j)) parts.push('valeur interdite')
  for (const x of c.infos) {
    if (x.type !== 'variations' && x.type !== 'concavite') continue
    const e = sorteDeduite(x, j)
    const f = x.fonction ?? 'f'
    if (e?.sorte === 'max') parts.push(`${f} atteint son maximum`)
    else if (e?.sorte === 'min') parts.push(`${f} atteint son minimum`)
    else if (e?.sorte === 'pi') parts.push(`point d'inflexion de ${f}`)
  }
  for (const x of c.infos) if (x.type === 'texte' && x.cells[j]) parts.push(`${x.sujet} : ${x.cells[j]}`)
  return `${nom}, ${c.v} égale ${xMot(c, j)} : ${parts.length ? 'ici, ' + parts.join(' ; ') : 'valeur remarquable du tableau'}.`
}

function phraseLibelle(info: InfoLigne, c: Contexte): string {
  switch (info.type) {
    case 'x':
      return `${info.nom}, de ${xMot(c, 0)} à ${xMot(c, c.n - 1)}.`
    case 'signes':
      if (info.combine) return `${info.nom} : son signe vient de la règle des signes, colonne par colonne.`
      return `${info.nom} : le signe ${prep('de', info.sujet)}, intervalle par intervalle.`
    case 'variations':
      return `${info.nom} : une flèche qui monte, ${info.fonction} croît ; une flèche qui descend, ${info.fonction} décroît.`
    case 'concavite':
      return `${info.nom} : un creux, ${info.fonction} est convexe ; une bosse, ${info.fonction} est concave.`
    default:
      return `${info.nom}.`
  }
}

function positionVisuelle(info: InfoLigne, c: Contexte, r: number, col: number): string {
  const ligne = r === 0 ? `Ligne des valeurs de ${info.label || 'x'}` : `Ligne « ${info.label} »`
  if (col === 0) return `${ligne} · libellé`
  const j = col - 1
  const v = c.infos[0].label || 'x'
  if (j % 2 === 1) return `${ligne} · entre ${c.xs[j - 1]} et ${c.xs[j + 1]}`
  return `${ligne} · ${/∞/.test(c.xs[j]) ? 'en ' + c.xs[j] : `${v} = ${c.xs[j]}`}`
}

/** Phrases de toutes les cases ; `null` si le modèle n'a pas la forme d'un tableau de signes. */
export function grilleLecture(m: ModeleTableau): GrilleLecture | null {
  const infos = analyser(m)
  if (!infos) return null
  const c: Contexte = { infos, xs: infos[0].cells, v: infos[0].sujet, n: infos[0].cells.length }
  return infos.map((info, r) => {
    const ligne: (CaseLecture | null)[] = [{ phrase: insecables(phraseLibelle(info, c)), position: insecables(positionVisuelle(info, c, r, 0)) }]
    for (let j = 0; j < c.n; j++) {
      let phrase: string | null
      switch (info.type) {
        case 'x':
          phrase = phraseX(c, j)
          break
        case 'signes':
          phrase = phraseSignes(info, c, j)
          break
        case 'variations':
          phrase = phraseVariations(info, c, j)
          break
        case 'concavite':
          phrase = phraseConcavite(info, c, j)
          break
        default:
          phrase = phraseTexte(info, c, r, j)
      }
      ligne.push(phrase ? { phrase: insecables(phrase), position: insecables(positionVisuelle(info, c, r, j + 1)) } : null)
    }
    return ligne
  })
}

/* ------------------------------------------------------------------------------------------ */
/*  Résumé                                                                                     */
/* ------------------------------------------------------------------------------------------ */

function decrireSegment(c: Contexte, a: number, b: number): string {
  const ga = /^[−-]∞$/.test(c.xs[a])
  const db = /^\+∞$/.test(c.xs[b])
  if (ga && db) return `pour tout ${c.v}`
  if (ga) return `pour ${c.v} plus petit que ${xMot(c, b)}`
  if (db) return `pour ${c.v} plus grand que ${xMot(c, a)}`
  return `entre ${xMot(c, a)} et ${xMot(c, b)}`
}

/** Intervalles consécutifs de même valeur réunis quand le point qui les sépare n'est ni un zéro ni
 * une valeur interdite, ni un extrémum. */
function segments(info: InfoLigne, c: Contexte, cle: (t: string) => string | null, coupe: (j: number) => boolean) {
  const segs: { a: number; b: number; cle: string }[] = []
  for (let j = 1; j < c.n; j += 2) {
    const k = cle(info.cells[j])
    if (k === null) continue
    const der = segs[segs.length - 1]
    if (der && der.b === j - 1 && der.cle === k && !coupe(j - 1)) der.b = j + 1
    else segs.push({ a: j - 1, b: j + 1, cle: k })
  }
  return segs
}

/** « croît pour x plus petit que −1 et entre −1 et 1, décroît … » : segments consécutifs de même
 * valeur (séparés par une valeur interdite) réunis dans un même morceau. */
function morceaux(c: Contexte, segs: { a: number; b: number; cle: string }[]): string[] {
  const out: { cle: string; descs: string[] }[] = []
  for (const s of segs) {
    const der = out[out.length - 1]
    if (der && der.cle === s.cle) der.descs.push(decrireSegment(c, s.a, s.b))
    else out.push({ cle: s.cle, descs: [decrireSegment(c, s.a, s.b)] })
  }
  return out.map((m) => `${m.cle} ${joinEt(m.descs)}`)
}

function resumeSignes(info: InfoLigne, c: Contexte): string {
  const segs = segments(info, c, (t) => (estSigne(t) ? signeNorm(t) : null), (j) => estZero(info.cells[j]) || estInterdite(info.cells[j]) || colonneInterdite(c, j))
  const pos = segs.filter((s) => s.cle === '+').map((s) => decrireSegment(c, s.a, s.b))
  const neg = segs.filter((s) => s.cle === '−').map((s) => decrireSegment(c, s.a, s.b))
  const parties = [pos.length ? `${adjSigne('+', info.feminin)} ${joinEt(pos)}` : '', neg.length ? `${adjSigne('−', info.feminin)} ${joinEt(neg)}` : ''].filter(Boolean)
  let t = `${info.sujet} est ${parties.join(', ')}.`
  const z = zerosLigne(info).map((j) => xMot(c, j))
  if (z.length) t += ` ${info.feminin ? 'Elle' : 'Il'} s'annule ${joinEt(z, 'en ')}.`
  const interdites = info.cells.map((x, j) => (j % 2 === 0 && estInterdite(x) ? xMot(c, j) : '')).filter(Boolean)
  if (interdites.length) t += ` Valeur${interdites.length > 1 ? 's' : ''} interdite${interdites.length > 1 ? 's' : ''} : ${joinEt(interdites)}.`
  return t
}

function resumeVariations(info: InfoLigne, c: Contexte): string {
  const f = info.fonction ?? 'f'
  const phrases: string[] = []
  const coupe = (j: number) => {
    const e = sorteDeduite(info, j)
    return !!e && ['max', 'min', 'interdite'].includes(e.sorte)
  }
  if (info.type === 'variations') {
    const m = morceaux(c, segments(info, c, direction, coupe))
    if (m.length) phrases.push(`${f} ${m.length > 1 ? m.slice(0, -1).join(', ') + ', puis ' + m[m.length - 1] : m[0]}.`)
  }
  const forme = (t: string) => (/∪|convexe/.test(t) ? 'convexe' : /∩|concave/.test(t) ? 'concave' : null)
  if (info.cells.some((t, j) => j % 2 === 1 && forme(t))) {
    const segs = segments(info, c, forme, (j) => {
      const e = sorteDeduite(info, j)
      return !!e && ['pi', 'interdite'].includes(e.sorte)
    })
    phrases.push(`${phrases.length ? 'Elle' : f} est ${morceaux(c, segs).join(', ')}.`)
  }
  const remarquables: string[] = []
  const interdites: string[] = []
  for (let j = 2; j < c.n - 1; j += 2) {
    const e = sorteDeduite(info, j)
    if (!e) continue
    const val = e.val ? ' ' + lireTexteMath(e.val) : ''
    if (e.sorte === 'max') remarquables.push(`maximum${val} ${enX(c, j)}`)
    else if (e.sorte === 'min') remarquables.push(`minimum${val} ${enX(c, j)}`)
    else if (e.sorte === 'pi') remarquables.push(`point d'inflexion ${enX(c, j)}`)
    else if (e.sorte === 'interdite') interdites.push(xMot(c, j))
  }
  if (remarquables.length) phrases.push(majuscule(remarquables.join(' ; ')) + '.')
  if (interdites.length) phrases.push(`Valeur${interdites.length > 1 ? 's' : ''} interdite${interdites.length > 1 ? 's' : ''} : ${joinEt(interdites)}.`)
  return phrases.join(' ')
}

function resumeTexte(info: InfoLigne, c: Contexte): string {
  const segs = segments(info, c, (t) => t || null, (j) => !!info.cells[j])
  const points = info.cells.map((t, j) => (j % 2 === 0 && t ? `${t} ${enX(c, j)}` : '')).filter(Boolean)
  return `${info.sujet} : ${morceaux(c, segs).join(', ')}${points.length ? ' ; ' + points.join(' ; ') : ''}.`
}

/** Conclusion du tableau (sans « Résumé du tableau : », ajouté à l'annonce), générée depuis les données : la dernière ligne de signes, ou les
 * lignes de variations / concavité / texte quand il y en a. */
export function resumeTableau(m: ModeleTableau): string {
  const infos = analyser(m)
  if (!infos) return ''
  const c: Contexte = { infos, xs: infos[0].cells, v: infos[0].sujet, n: infos[0].cells.length }
  const autres = infos.filter((x) => x.type === 'variations' || x.type === 'concavite' || x.type === 'texte')
  const signes = infos.filter((x) => x.type === 'signes')
  const lignes = autres.length ? autres : signes.slice(-1)
  const textes = lignes.map((x) => (x.type === 'signes' ? resumeSignes(x, c) : x.type === 'texte' ? resumeTexte(x, c) : resumeVariations(x, c)))
  const t = textes.join(' ')
  return insecables(/^(le|la) /.test(t) ? majuscule(t) : t)
}

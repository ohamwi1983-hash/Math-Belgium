/**
 * Calculatrice du mode projection : petit parseur MAISON (jamais `eval` ni `Function`), PUR.
 *
 * Saisie libre (règle du dépôt : rien n'est bloqué pendant la frappe) ; ce module lit ce qui est
 * écrit, et une saisie illisible donne un message d'erreur, jamais un champ effacé. Reconnaît :
 * nombres (virgule ou point décimal), + − × ÷ (et * / - · –), parenthèses, puissance (^), ², √,
 * π, e, Ans, sin / cos / tan et leurs réciproques (asin, arcsin, sin⁻¹…), ln, log (base 10),
 * multiplication implicite (2π, 3(1+2), 2sin(30)). Modes DEG / RAD.
 *
 * Grammaire (précédences croissantes) :
 *   somme    := produit (('+' | '-') produit)*
 *   produit  := unaire (('×' | '÷') unaire | unaire-implicite)*
 *   unaire   := ('-' | '+') unaire | puissance          (−2² = −4)
 *   puissance:= postfixe ('^' unaire)?                  (associative à droite : 2^3^2 = 2^9)
 *   postfixe := atome '²'*
 *   atome    := nombre | π | e | Ans | '(' somme ')' | fonction argument | '√' argument
 *   argument := '(' somme ')' | puissance               (sin(30)² = (sin 30)² ; sin 30 accepté)
 */

export type ModeAngle = 'deg' | 'rad'

type NomFonction = 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' | 'ln' | 'log' | 'racine'

type Noeud =
  | { t: 'nb'; v: number; src: string }
  | { t: 'cst'; nom: 'pi' | 'e' | 'ans' }
  | { t: 'neg'; a: Noeud }
  | { t: 'bin'; op: '+' | '-' | '*' | '/' | 'implicite'; a: Noeud; b: Noeud }
  | { t: 'pow'; a: Noeud; b: Noeud }
  | { t: 'fn'; nom: NomFonction; a: Noeud }
  | { t: 'par'; a: Noeud }

type Jeton =
  | { t: 'nb'; v: number; src: string }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' | '²' | '(' | ')' | '√' }
  | { t: 'cst'; v: 'pi' | 'e' | 'ans' }
  | { t: 'fn'; v: NomFonction }

export class ErreurCalcul extends Error {
  readonly genre: 'syntaxe' | 'domaine'
  constructor(message: string, genre: 'syntaxe' | 'domaine') {
    super(message)
    this.genre = genre
  }
}

// Noms reconnus, du plus long au plus court (lecture gloutonne : « asin » avant « sin »).
const NOMS: [string, Jeton][] = (
  [
    ['arcsin', { t: 'fn', v: 'asin' }],
    ['arccos', { t: 'fn', v: 'acos' }],
    ['arctan', { t: 'fn', v: 'atan' }],
    ['racine', { t: 'fn', v: 'racine' }],
    ['sqrt', { t: 'fn', v: 'racine' }],
    ['asin', { t: 'fn', v: 'asin' }],
    ['acos', { t: 'fn', v: 'acos' }],
    ['atan', { t: 'fn', v: 'atan' }],
    ['sin', { t: 'fn', v: 'sin' }],
    ['cos', { t: 'fn', v: 'cos' }],
    ['tan', { t: 'fn', v: 'tan' }],
    ['tg', { t: 'fn', v: 'tan' }],
    ['ans', { t: 'cst', v: 'ans' }],
    ['log', { t: 'fn', v: 'log' }],
    ['ln', { t: 'fn', v: 'ln' }],
    ['pi', { t: 'cst', v: 'pi' }],
    ['e', { t: 'cst', v: 'e' }],
  ] as [string, Jeton][]
).sort((a, b) => b[0].length - a[0].length)

const INVERSE: Partial<Record<NomFonction, NomFonction>> = { sin: 'asin', cos: 'acos', tan: 'atan' }

export function decouper(saisie: string): Jeton[] {
  const s = saisie.replace(/[−–—]/g, '-')
  const jetons: Jeton[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (/\s/.test(c)) {
      i++
      continue
    }
    const nb = /^(\d+(?:[.,]\d*)?|[.,]\d+)/.exec(s.slice(i))
    if (nb) {
      const src = nb[1]
      jetons.push({ t: 'nb', v: Number(src.replace(',', '.')), src })
      i += src.length
      continue
    }
    if ('+-*/^()²√×÷·:'.includes(c)) {
      const v = c === '×' || c === '·' ? '*' : c === '÷' || c === ':' ? '/' : (c as '+' | '-' | '*' | '/' | '^' | '²' | '(' | ')' | '√')
      jetons.push({ t: 'op', v })
      i++
      continue
    }
    if (c === 'π') {
      jetons.push({ t: 'cst', v: 'pi' })
      i++
      continue
    }
    if (/[a-zA-Z]/.test(c)) {
      const reste = s.slice(i).toLowerCase()
      const trouve = NOMS.find(([n]) => reste.startsWith(n))
      if (!trouve) throw new ErreurCalcul(`« ${s.slice(i).match(/^[a-zA-Z]+/)?.[0]} » n'est pas reconnu`, 'syntaxe')
      i += trouve[0].length
      let jeton = trouve[1]
      // sin⁻¹ / sin^-1 : réciproque.
      const suite = s.slice(i)
      const inv = /^(⁻¹|\^\(?-1\)?(?![\d.,]))/.exec(suite)
      if (jeton.t === 'fn' && INVERSE[jeton.v] && inv) {
        jeton = { t: 'fn', v: INVERSE[jeton.v]! }
        i += inv[1].length
      }
      jetons.push(jeton)
      continue
    }
    throw new ErreurCalcul(`Caractère « ${c} » non reconnu`, 'syntaxe')
  }
  return jetons
}

export function analyser(saisie: string): Noeud {
  const jetons = decouper(saisie)
  if (jetons.length === 0) throw new ErreurCalcul('Rien à calculer', 'syntaxe')
  let k = 0
  const voir = () => jetons[k]
  const estOp = (j: Jeton | undefined, v: string) => !!j && j.t === 'op' && j.v === v
  const debutAtome = (j: Jeton | undefined) => !!j && (j.t === 'nb' || j.t === 'cst' || j.t === 'fn' || estOp(j, '(') || estOp(j, '√'))

  const somme = (): Noeud => {
    let a = produit()
    while (estOp(voir(), '+') || estOp(voir(), '-')) {
      const op = (jetons[k++] as { v: '+' | '-' }).v
      a = { t: 'bin', op, a, b: produit() }
    }
    return a
  }
  const produit = (): Noeud => {
    let a = unaire()
    for (;;) {
      const j = voir()
      if (estOp(j, '*') || estOp(j, '/')) {
        k++
        a = { t: 'bin', op: (j as { v: '*' | '/' }).v, a, b: unaire() }
      } else if (debutAtome(j)) {
        a = { t: 'bin', op: 'implicite', a, b: puissance() }
      } else return a
    }
  }
  const unaire = (): Noeud => {
    if (estOp(voir(), '-')) {
      k++
      return { t: 'neg', a: unaire() }
    }
    if (estOp(voir(), '+')) {
      k++
      return unaire()
    }
    return puissance()
  }
  const puissance = (): Noeud => {
    const a = postfixe()
    if (estOp(voir(), '^')) {
      k++
      if (!voir()) throw new ErreurCalcul('Exposant manquant après « ^ »', 'syntaxe')
      return { t: 'pow', a, b: unaire() }
    }
    return a
  }
  const postfixe = (): Noeud => {
    let a = atome()
    while (estOp(voir(), '²')) {
      k++
      a = { t: 'pow', a, b: { t: 'nb', v: 2, src: '2' } }
    }
    return a
  }
  const parenthese = (): Noeud => {
    k++ // (
    const a = somme()
    if (estOp(voir(), ')')) k++
    else if (voir()) throw new ErreurCalcul('Parenthèse fermante attendue', 'syntaxe')
    // Parenthèses non fermées en fin de saisie : fermées d'office, comme sur une calculatrice.
    return { t: 'par', a }
  }
  const argument = (): Noeud => (estOp(voir(), '(') ? parenthese() : puissance())
  const atome = (): Noeud => {
    const j = voir()
    if (!j) throw new ErreurCalcul('Expression incomplète', 'syntaxe')
    if (j.t === 'nb') {
      k++
      if (!Number.isFinite(j.v)) throw new ErreurCalcul('Nombre illisible', 'syntaxe')
      return { t: 'nb', v: j.v, src: j.src }
    }
    if (j.t === 'cst') {
      k++
      return { t: 'cst', nom: j.v }
    }
    if (j.t === 'fn') {
      k++
      if (!voir()) throw new ErreurCalcul(`Argument manquant après ${j.v}`, 'syntaxe')
      return { t: 'fn', nom: j.v, a: argument() }
    }
    if (estOp(j, '√')) {
      k++
      if (!voir()) throw new ErreurCalcul('Argument manquant après √', 'syntaxe')
      return { t: 'fn', nom: 'racine', a: estOp(voir(), '(') ? parenthese() : postfixe() }
    }
    if (estOp(j, '(')) return parenthese()
    if (estOp(j, ')')) throw new ErreurCalcul('Parenthèse fermante en trop', 'syntaxe')
    throw new ErreurCalcul(`« ${j.t === 'op' ? (j.v === '*' ? '×' : j.v === '/' ? '÷' : j.v) : ''} » mal placé`, 'syntaxe')
  }
  const arbre = somme()
  if (k < jetons.length) {
    const j = jetons[k]
    throw new ErreurCalcul(estOp(j, ')') ? 'Parenthèse fermante en trop' : 'Expression mal formée', 'syntaxe')
  }
  return arbre
}

const DEG = Math.PI / 180

/** Valeurs exactes des angles remarquables en degrés (sin 30° = 0,5 et non 0,49999999999999994). */
function trigDegres(nom: 'sin' | 'cos' | 'tan', x: number): number {
  const r = ((x % 360) + 360) % 360
  if (nom === 'tan') {
    if (r % 180 === 90) throw new ErreurCalcul(`tan(${formaterNombreTexte(x)}°) n'existe pas`, 'domaine')
    if (r % 180 === 0) return 0
    if (r % 180 === 45) return 1
    if (r % 180 === 135) return -1
    return Math.tan(r * DEG)
  }
  const s = nom === 'sin' ? r : (r + 90) % 360 // cos x = sin(x + 90°)
  const exacts: Record<number, number> = { 0: 0, 30: 0.5, 90: 1, 150: 0.5, 180: 0, 210: -0.5, 270: -1, 330: -0.5 }
  if (s in exacts) return exacts[s]
  return Math.sin(s * DEG)
}

export function evaluer(n: Noeud, mode: ModeAngle, ans: number): number {
  const ev = (m: Noeud): number => {
    switch (m.t) {
      case 'nb':
        return m.v
      case 'cst':
        return m.nom === 'pi' ? Math.PI : m.nom === 'e' ? Math.E : ans
      case 'par':
        return ev(m.a)
      case 'neg':
        return -ev(m.a)
      case 'bin': {
        const a = ev(m.a)
        const b = ev(m.b)
        if (m.op === '+') return a + b
        if (m.op === '-') return a - b
        if (m.op === '/') {
          if (b === 0) throw new ErreurCalcul('Division par zéro', 'domaine')
          return a / b
        }
        return a * b
      }
      case 'pow': {
        const a = ev(m.a)
        const b = ev(m.b)
        if (a === 0 && b < 0) throw new ErreurCalcul('Division par zéro', 'domaine')
        if (a < 0 && !Number.isInteger(b)) {
          // Racine impaire d'un négatif : (−8)^(1/3) = −2.
          const inv = 1 / b
          if (Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) % 2 !== 0) return -Math.pow(-a, b)
          throw new ErreurCalcul('Puissance non définie (base négative)', 'domaine')
        }
        return Math.pow(a, b)
      }
      case 'fn': {
        const x = ev(m.a)
        switch (m.nom) {
          case 'sin':
          case 'cos':
          case 'tan':
            if (mode === 'deg') return trigDegres(m.nom, x)
            if (m.nom === 'tan' && Math.abs(Math.cos(x)) < 1e-15) throw new ErreurCalcul('tan non définie ici', 'domaine')
            return m.nom === 'sin' ? Math.sin(x) : m.nom === 'cos' ? Math.cos(x) : Math.tan(x)
          case 'asin':
          case 'acos': {
            if (x < -1 - 1e-12 || x > 1 + 1e-12) throw new ErreurCalcul(`${m.nom === 'asin' ? 'sin⁻¹' : 'cos⁻¹'} : valeur hors de [−1 ; 1]`, 'domaine')
            const c = Math.max(-1, Math.min(1, x))
            const r = m.nom === 'asin' ? Math.asin(c) : Math.acos(c)
            return mode === 'deg' ? r / DEG : r
          }
          case 'atan':
            return mode === 'deg' ? Math.atan(x) / DEG : Math.atan(x)
          case 'ln':
            if (x <= 0) throw new ErreurCalcul('ln : seulement pour un nombre strictement positif', 'domaine')
            return Math.log(x)
          case 'log':
            if (x <= 0) throw new ErreurCalcul('log : seulement pour un nombre strictement positif', 'domaine')
            return Math.log10(x)
          case 'racine':
            if (x < 0) throw new ErreurCalcul('√ d’un nombre négatif', 'domaine')
            return Math.sqrt(x)
        }
      }
    }
  }
  const v = ev(n)
  if (!Number.isFinite(v)) throw new ErreurCalcul('Résultat trop grand', 'domaine')
  return nettoyer(v)
}

/** Bruit d'arrondi effacé : 30,000000000000004 → 30 ; 1e-17 → 0. */
function nettoyer(v: number): number {
  const r = Math.round(v)
  if (Math.abs(v - r) < 1e-10 * Math.max(1, Math.abs(v))) return r === 0 ? 0 : r
  if (Math.abs(v) < 1e-14) return 0
  return Number(v.toPrecision(15))
}

// ---------- valeur exacte (reconnaissance numérique) ----------

const TOL = 1e-11

function fraction(v: number, qMax: number): [number, number] | null {
  // Fractions continues : meilleure approximation de dénominateur ≤ qMax.
  let [h0, h1, k0, k1] = [0, 1, 1, 0]
  let x = v
  for (let n = 0; n < 40; n++) {
    const a = Math.floor(x)
    ;[h0, h1] = [h1, a * h1 + h0]
    ;[k0, k1] = [k1, a * k1 + k0]
    if (k1 > qMax) return null
    if (h1 > 0 && Math.abs(v - h1 / k1) <= TOL * Math.abs(v)) return [h1, k1]
    const f = x - a
    if (f < 1e-15) return null
    x = 1 / f
  }
  return null
}

const pgcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : pgcd(b, a % b))

function latexFraction(signe: string, num: string, q: number): string {
  return q === 1 ? `${signe}${num}` : `${signe}\\frac{${num}}{${q}}`
}

/**
 * Forme exacte simple d'un résultat, quand elle existe : entier, fraction p/q (q ≤ 1 000),
 * multiple rationnel de π (q ≤ 60), ou ±(a√b)/q (le carré est une fraction simple). Sinon null
 * (la calculatrice affiche alors le décimal). Reconnaissance par la valeur, à 10⁻¹¹ près.
 */
export function formeExacte(v: number): string | null {
  if (!Number.isFinite(v)) return null
  if (Number.isInteger(v)) return Math.abs(v) < 1e15 ? signeLatex(v) + String(Math.abs(v)) : null
  const signe = v < 0 ? '-' : ''
  const a = Math.abs(v)
  const f = fraction(a, 1000)
  if (f) return latexFraction(signe, String(f[0]), f[1])
  const fp = fraction(a / Math.PI, 60)
  if (fp && fp[0] <= 1000) return latexFraction(signe, `${fp[0] === 1 ? '' : fp[0]}\\pi`, fp[1])
  const f2 = fraction(a * a, 1000)
  if (f2 && f2[0] * f2[1] <= 100000) {
    // √(p/q) = √(p·q) / q, puis on sort les carrés : √(p·q) = c√d.
    const [p, q] = f2
    let d = p * q
    let c = 1
    for (let i = 2; i * i <= d; i++) {
      while (d % (i * i) === 0) {
        d /= i * i
        c *= i
      }
    }
    if (d === 1) return null
    const g = pgcd(c, q)
    const c2 = c / g
    const q2 = q / g
    return latexFraction(signe, `${c2 === 1 ? '' : c2}\\sqrt{${d}}`, q2)
  }
  return null
}

function signeLatex(v: number) {
  return v < 0 ? '-' : ''
}

// ---------- affichage décimal (virgule, « − », espaces fines) ----------

function grouper(chiffres: string, depuisGauche: boolean, sep: string): string {
  if (chiffres.length <= 4 && !depuisGauche) return chiffres
  if (chiffres.length <= 3) return chiffres
  const parts: string[] = []
  if (depuisGauche) for (let i = 0; i < chiffres.length; i += 3) parts.push(chiffres.slice(i, i + 3))
  else for (let i = chiffres.length; i > 0; i -= 3) parts.unshift(chiffres.slice(Math.max(0, i - 3), i))
  return parts.join(sep)
}

/** Décimal à 10 chiffres significatifs ; `tronque` = la valeur affichée est arrondie. */
export function formaterDecimal(v: number): { texte: string; latex: string; tronque: boolean } {
  const arrondi = Number(v.toPrecision(10))
  const tronque = arrondi !== v
  const abs = Math.abs(arrondi)
  const signeT = arrondi < 0 ? '−' : ''
  const signeL = arrondi < 0 ? '-' : ''
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-6)) {
    const [m, e] = abs.toExponential(9).split('e')
    const mant = m.replace(/\.?0+$/, '')
    const [ent, dec] = mant.split('.')
    const exp = Number(e)
    return {
      texte: `${signeT}${ent}${dec ? ',' + grouper(dec, true, ' ') : ''} × 10^${exp < 0 ? '−' : ''}${Math.abs(exp)}`,
      latex: `${signeL}${ent}${dec ? '{,}' + grouper(dec, true, '\\,') : ''} \\times 10^{${exp}}`,
      tronque,
    }
  }
  const decimales = abs === 0 ? 0 : abs >= 1 ? Math.max(0, 9 - Math.floor(Math.log10(abs))) : 9 - Math.floor(Math.log10(abs))
  const s = abs.toFixed(Math.min(100, decimales))
  let [ent, dec = ''] = s.split('.')
  dec = dec.replace(/0+$/, '')
  return {
    texte: `${signeT}${grouper(ent, false, ' ')}${dec ? ',' + grouper(dec, true, ' ') : ''}`,
    latex: `${signeL}${grouper(ent, false, '\\,')}${dec ? '{,}' + grouper(dec, true, '\\,') : ''}`,
    tronque,
  }
}

export function formaterNombreTexte(v: number): string {
  return formaterDecimal(v).texte
}

// ---------- expression en LaTeX (écho et étiquette épinglée) ----------

const LATEX_FN: Record<NomFonction, string> = {
  sin: '\\sin',
  cos: '\\cos',
  tan: '\\tan',
  asin: '\\sin^{-1}',
  acos: '\\cos^{-1}',
  atan: '\\tan^{-1}',
  ln: '\\ln',
  log: '\\log',
  racine: '\\sqrt',
}

function nombreLatex(src: string): string {
  return src.replace(/^[.,]/, '0,').replace(/[.,]$/, '').replace(/[.,]/, '{,}')
}

export function enLatex(n: Noeud, mode: ModeAngle): string {
  const lx = (m: Noeud): string => {
    switch (m.t) {
      case 'nb':
        return nombreLatex(m.src)
      case 'cst':
        return m.nom === 'pi' ? '\\pi' : m.nom === 'e' ? '\\mathrm{e}' : '\\mathrm{Ans}'
      case 'par':
        return `\\left(${lx(m.a)}\\right)`
      case 'neg':
        return `-${lx(m.a)}`
      case 'bin':
        return m.op === 'implicite' ? `${lx(m.a)}\\,${lx(m.b)}` : `${lx(m.a)} ${m.op === '*' ? '\\times' : m.op === '/' ? '\\div' : m.op} ${lx(m.b)}`
      case 'pow': {
        const base = m.a.t === 'nb' || m.a.t === 'cst' || m.a.t === 'par' ? lx(m.a) : `\\left(${lx(m.a)}\\right)`
        return `{${base}}^{${lx(m.b.t === 'par' ? m.b.a : m.b)}}`
      }
      case 'fn': {
        if (m.nom === 'racine') return `\\sqrt{${lx(m.a.t === 'par' ? m.a.a : m.a)}}`
        // Degrés : sin(40) s'affiche sin(40°) (argument numérique simple).
        const degre = mode === 'deg' && (m.nom === 'sin' || m.nom === 'cos' || m.nom === 'tan')
        const interieur = m.a.t === 'par' ? m.a.a : m.a
        const simple = interieur.t === 'nb' || (interieur.t === 'neg' && interieur.a.t === 'nb')
        const arg = degre && simple ? `${lx(interieur)}^\\circ` : lx(interieur)
        return `${LATEX_FN[m.nom]}\\left(${arg}\\right)`
      }
    }
  }
  return lx(n)
}

// ---------- calcul complet ----------

export type Resultat =
  | { ok: true; saisie: string; latexExpression: string; valeur: number; latexExact: string | null; latexDecimal: string; texteDecimal: string; tronque: boolean; mode: ModeAngle }
  | { ok: false; saisie: string; erreur: string }

export function calculer(saisie: string, mode: ModeAngle, ans: number): Resultat {
  try {
    // « 3 × 4 = » : le « = » final (geste naturel sur une calculatrice, et l'aide le propose) demande le
    // calcul, il n'en fait pas partie. Avant le 25/11/2026 il donnait « Caractère « = » non reconnu » et
    // « Épingler » restait grisé (retour du professeur).
    const arbre = analyser(saisie.replace(/[=\s]+$/, ''))
    const valeur = evaluer(arbre, mode, ans)
    const d = formaterDecimal(valeur)
    return { ok: true, saisie, latexExpression: enLatex(arbre, mode), valeur, latexExact: formeExacte(valeur), latexDecimal: d.latex, texteDecimal: d.texte, tronque: d.tronque, mode }
  } catch (e) {
    return { ok: false, saisie, erreur: e instanceof ErreurCalcul ? e.message : 'Expression illisible' }
  }
}

/** Valeur affichée : un décimal exact tel quel ; sinon la forme exacte (si demandée et reconnue), ou ≈ décimal. */
export function latexValeur(r: Extract<Resultat, { ok: true }>, exact: boolean): string {
  if (exact && r.latexExact && r.tronque) return `= ${r.latexExact}`
  return `${r.tronque ? '\\approx' : '='} ${r.latexDecimal}`
}

/**
 * Lecture en mots (français parlé) des formules LaTeX du site — `lireFormule(tex)`.
 *
 * Sert à deux choses : l'`aria-label` de chaque formule (KaTeX en `output: 'html'` rend des formules
 * invisibles aux lecteurs d'écran) et, plus tard, la lecture à voix haute. Lecteur MAISON pour le
 * sous-ensemble LaTeX du site (décision du professeur : pas de MathML + Speech Rule Engine, trop
 * lourd dans le HTML pré-rendu et de qualité variable en français).
 *
 * Trois étapes, jamais une suite d'expressions régulières :
 * 1. `jetons` : découpage du source (commandes, accolades, nombres français « 3{,}5 », « 1\,000 »…) ;
 * 2. `analyser` puis `structurer` : arbre (fractions, racines, indices/exposants, accents,
 *    environnements) puis appariement des délimiteurs (parenthèses, crochets, intervalles
 *    « ]a ; b] », valeurs absolues, accolades d'ensemble) ;
 * 3. `lireSuite` : texte parlé, unité par unité, avec les règles de produit implicite (« 2 x »,
 *    mais « 3 fois u indice n », « n fois, parenthèse, … »), de fractions simples (« 3 sur 4 ») ou
 *    composées (« fraction, …, sur …, fin de fraction ») et la ponctuation qui donne des pauses
 *    utiles à la voix (virgules, deux-points).
 *
 * Conventions (maquette « côté élève », planche 08) : « u indice n plus 1 égale 3 fois u indice n »,
 * « u indice n égale u indice 1 plus, parenthèse, n moins 1, fin de parenthèse, fois r »,
 * « S indice n égale : fraction, n fois, parenthèse, u indice 1 plus u indice n, fin de parenthèse,
 * sur 2, fin de fraction », « q au cube égale 8 », « intervalle ouvert en moins l'infini, fermé en
 * moins 2 ». Une commande inconnue n'est jamais lue (ni « backslash », ni son nom) : son contenu
 * l'est, et `analyserLecture` la signale (contrôle exhaustif, voir `.claude/rules/cote-eleve.md`).
 *
 * Ne lève jamais d'exception : en cas d'imprévu, le texte de repli est le source débarrassé des
 * commandes.
 */

// ---------------------------------------------------------------------------------------------
// 1. Jetons
// ---------------------------------------------------------------------------------------------

type Jeton =
  | { t: 'cmd'; v: string }
  | { t: 'car'; v: string }
  | { t: 'num'; ent: string; dec: string; point?: boolean }
  | { t: 'ouv' }
  | { t: 'fer' }
  | { t: 'sup' }
  | { t: 'sub' }
  | { t: 'amp' }
  | { t: 'nl' }
  | { t: 'prime' }
  | { t: 'txt'; v: string }

const COMMANDES_TEXTE = new Set(['text', 'textrm', 'textit', 'textbf', 'textup', 'textsf', 'texttt', 'mbox',
  'textnormal', 'hbox', 'emph'])

/** Caractères Unicode écrits directement dans le source, ramenés à la commande équivalente. */
const UNICODE: Record<string, string> = {
  '×': 'times', '·': 'cdot', '⋅': 'cdot', '÷': 'div', '±': 'pm', '∓': 'mp',
  '≤': 'leq', '⩽': 'leq', '≥': 'geq', '⩾': 'geq', '≠': 'neq', '≈': 'approx', '≃': 'simeq', '≡': 'equiv',
  '∞': 'infty', '∈': 'in', '∉': 'notin', '⊂': 'subset', '⊆': 'subseteq', '∪': 'cup', '∩': 'cap',
  '∅': 'varnothing', '→': 'to', '⟶': 'to', '↦': 'mapsto', '⇒': 'Rightarrow', '⟹': 'implies',
  '⇔': 'Leftrightarrow', '⟺': 'iff', '⇐': 'Leftarrow', '∀': 'forall', '∃': 'exists', '∘': 'circ',
  '∑': 'sum', '∏': 'prod', '∫': 'int', '√': 'sqrt', '…': 'ldots', '⋯': 'cdots', '∥': 'parallel',
  '⊥': 'perp', 'ℝ': 'R@bb', 'ℕ': 'N@bb', 'ℤ': 'Z@bb', 'ℚ': 'Q@bb', 'ℂ': 'C@bb', '∖': 'setminus',
  'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'ε': 'varepsilon', 'θ': 'theta', 'λ': 'lambda',
  'μ': 'mu', 'π': 'pi', 'ρ': 'rho', 'σ': 'sigma', 'τ': 'tau', 'φ': 'varphi', 'ω': 'omega', 'Δ': 'Delta',
  'Σ': 'Sigma', 'Φ': 'Phi', 'Ω': 'Omega', 'Γ': 'Gamma',
}

const ESPACES_MILLIERS = /^(?:\\,|\\ |~|\{\\,\}|\\;|\\:|\\thinspace\s?| | | )(\d{3})(?!\d)/

function jetons(source: string): Jeton[] {
  const s = source
    .replace(/[−–—]/g, '-')
    .replace(/′/g, "'")
    .replace(/″/g, "''")
  const out: Jeton[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+)\s*/.exec(s.slice(i))
      if (m && COMMANDES_TEXTE.has(m[1]) && s[i + m[0].length] === '{') {
        // Texte : contenu brut (espaces compris), accolades équilibrées.
        let j = i + m[0].length + 1
        let prof = 1
        let txt = ''
        while (j < s.length) {
          const d = s[j]
          if (d === '\\' && j + 1 < s.length) { txt += d + s[j + 1]; j += 2; continue }
          if (d === '{') prof++
          else if (d === '}') { prof--; if (prof === 0) break }
          txt += d
          j++
        }
        out.push({ t: 'txt', v: txt })
        i = j + 1
      } else if (m) {
        out.push({ t: 'cmd', v: m[1] })
        i += m[0].length
      } else if (s[i + 1] === '\\') {
        out.push({ t: 'nl' })
        i += 2
      } else if (i + 1 < s.length) {
        out.push({ t: 'cmd', v: s[i + 1] })
        i += 2
      } else i++
      continue
    }
    if (/\s/.test(c)) {
      i++
      continue
    }
    if (c === '%') {
      // Commentaire LaTeX (KaTeX n'affiche rien jusqu'à la fin de la ligne).
      const fin = s.indexOf('\n', i)
      i = fin < 0 ? s.length : fin + 1
      continue
    }
    if (/\d/.test(c)) {
      let ent = /^\d+/.exec(s.slice(i))![0]
      i += ent.length
      let dec = ''
      let point = false
      for (;;) {
        const reste = s.slice(i)
        const mil = !dec && ent.length <= 3 + Math.floor(ent.length / 3) * 3 ? ESPACES_MILLIERS.exec(reste) : null
        if (mil && /^\d{1,3}$|^\d{1,3}(\d{3})+$/.test(ent)) {
          ent += mil[1]
          i += mil[0].length
          continue
        }
        if (dec) break
        const vir = /^\{,\}(\d+)/.exec(reste)
        if (vir) {
          dec = vir[1]
          i += vir[0].length
          continue
        }
        // « 0,5 » sans accolades : décimal, sauf dans une liste « 0,1,\ldots » ou « 2,3,4 ».
        const virNue = /^,(\d+)/.exec(reste)
        const precedent = out[out.length - 1]
        const dansIndice = precedent?.t === 'ouv' && out[out.length - 2]?.t === 'sub'
        if (virNue && reste[virNue[0].length] !== ',' && !(precedent && precedent.t === 'car' && precedent.v === ',') && !(dansIndice && ent !== '0')) {
          dec = virNue[1]
          i += virNue[0].length
          continue
        }
        const pt = /^\.(\d+)/.exec(reste)
        if (pt) {
          dec = pt[1]
          point = true
          i += pt[0].length
          continue
        }
        break
      }
      out.push({ t: 'num', ent, dec, point })
      continue
    }
    if (c === '{') out.push({ t: 'ouv' })
    else if (c === '}') out.push({ t: 'fer' })
    else if (c === '^') out.push({ t: 'sup' })
    else if (c === '_') out.push({ t: 'sub' })
    else if (c === '&') out.push({ t: 'amp' })
    else if (c === "'") out.push({ t: 'prime' })
    else if (c === '²' || c === '³') out.push({ t: 'sup' }, { t: 'num', ent: c === '²' ? '2' : '3', dec: '' })
    else if (UNICODE[c]) out.push({ t: 'cmd', v: UNICODE[c] })
    else out.push({ t: 'car', v: c })
    i++
  }
  return out
}

// ---------------------------------------------------------------------------------------------
// 2. Arbre
// ---------------------------------------------------------------------------------------------

type Classe = 'ord' | 'bin' | 'rel' | 'punct'

type Noeud =
  | { k: 'num'; ent: string; dec: string; point?: boolean }
  | { k: 'id'; v: string; dit: string; fonte?: string }
  | { k: 'sym'; v: string; dit: string; c: Classe }
  | { k: 'grp'; corps: Noeud[] }
  | { k: 'frac'; num: Noeud[]; den: Noeud[]; binom?: boolean }
  | { k: 'racine'; idx: Noeud[] | null; corps: Noeud[] }
  | { k: 'acc'; a: 'vec' | 'barre' | 'chapeau' | 'tilde' | 'point'; corps: Noeud[] }
  | { k: 'texte'; v: string }
  | { k: 'fonc'; nom: string; dit: string; paren: boolean }
  | { k: 'grand'; nom: 'lim' | 'sum' | 'prod' | 'int' | 'max' | 'min' | 'cup' | 'cap' }
  | { k: 'env'; nom: string; lignes: Noeud[][][] }
  | { k: 'delim'; v: string; cote?: 'g' | 'd' }
  | { k: 'esp'; quad: boolean }
  | { k: 'marque'; sub?: Noeud[]; sup?: Noeud[]; primes?: number; fact?: boolean }
  | { k: 'scr'; base: Noeud; sub: Noeud[] | null; sup: Noeud[] | null; primes: number }
  | { k: 'fact'; corps: Noeud }
  | { k: 'post'; dit: string }
  | { k: 'etc' }
  | { k: 'barre'; mot: string; corps: Noeud[] }
  | { k: 'dessus'; dessus: Noeud[]; corps: Noeud[] }
  | { k: 'mod'; corps: Noeud[] }
  | { k: 'cloture'; g: string; d: string; corps: Noeud[] }

const GRECQUES: Record<string, string> = {
  alpha: 'alpha', beta: 'bêta', gamma: 'gamma', delta: 'delta', epsilon: 'epsilon', varepsilon: 'epsilon',
  zeta: 'dzêta', eta: 'êta', theta: 'thêta', vartheta: 'thêta', iota: 'iota', kappa: 'kappa',
  lambda: 'lambda', mu: 'mu', nu: 'nu', xi: 'ksi', pi: 'pi', varpi: 'pi', rho: 'rhô', varrho: 'rhô',
  sigma: 'sigma', varsigma: 'sigma', tau: 'tau', upsilon: 'upsilon', phi: 'phi', varphi: 'phi',
  chi: 'khi', psi: 'psi', omega: 'oméga', Gamma: 'grand gamma', Delta: 'delta', Theta: 'grand thêta',
  Lambda: 'grand lambda', Xi: 'grand ksi', Pi: 'grand pi', Sigma: 'grand sigma', Upsilon: 'grand upsilon',
  Phi: 'grand phi', Psi: 'grand psi', Omega: 'grand oméga',
}

const RELATIONS: Record<string, string> = {
  '=': 'égale', neq: 'différent de', ne: 'différent de', '<': 'inférieur à', '>': 'supérieur à',
  lt: 'inférieur à', gt: 'supérieur à', leq: 'inférieur ou égal à', le: 'inférieur ou égal à',
  leqslant: 'inférieur ou égal à', geq: 'supérieur ou égal à', ge: 'supérieur ou égal à',
  geqslant: 'supérieur ou égal à', approx: 'vaut environ', simeq: 'vaut environ', thickapprox: 'vaut environ',
  equiv: '≡', sim: '∼', in: 'appartient à', notin: "n'appartient pas à", ni: 'contient',
  subset: 'est inclus dans', subseteq: 'est inclus dans', subsetneq: 'est strictement inclus dans',
  supset: 'contient', supseteq: 'contient', not_subset: "n'est pas inclus dans",
  Rightarrow: 'implique', implies: 'implique', Longrightarrow: 'implique',
  Leftarrow: 'est impliqué par', impliedby: 'est impliqué par', Longleftarrow: 'est impliqué par',
  Leftrightarrow: 'équivaut à', iff: 'équivaut à', Longleftrightarrow: 'équivaut à',
  to: '→', rightarrow: '→', longrightarrow: '→', xrightarrow: '→', mapsto: 'a pour image', longmapsto: 'a pour image',
  leftrightarrow: 'correspond à', longleftrightarrow: 'correspond à', leftarrow: 'est remplacé par', parallel: 'est parallèle à',
  nparallel: "n'est pas parallèle à", perp: 'est perpendiculaire à', propto: 'est proportionnel à',
  ll: 'est très inférieur à', gg: 'est très supérieur à', coloneqq: 'est défini par', cong: 'est isométrique à',
  mid: '|', nmid: 'ne divise pas', Diamond: 'comparé à', diamond: 'comparé à', nless: "n'est pas inférieur à", ngtr: "n'est pas supérieur à",
  nleq: "n'est pas inférieur ou égal à", ngeq: "n'est pas supérieur ou égal à",
}

const BINAIRES: Record<string, string> = {
  '+': 'plus', '-': 'moins', pm: 'plus ou moins', mp: 'moins ou plus', times: 'fois', cdot: 'fois',
  ast: 'fois', '*': 'fois', div: 'divisé par', '/': 'sur', cup: 'union', cap: 'inter',
  setminus: 'privé de', backslash: 'privé de', circ: 'rond', wedge: 'et', land: 'et', vee: 'ou',
  lor: 'ou', oplus: 'plus', bullet: 'fois', smallsetminus: 'privé de',
}

const SYMBOLES: Record<string, string> = {
  infty: "l'infini", emptyset: "l'ensemble vide", varnothing: "l'ensemble vide", ell: 'l', hbar: 'h barre',
  partial: 'd rond', nabla: 'nabla', forall: 'pour tout', exists: 'il existe', nexists: "il n'existe pas",
  neg: 'non', lnot: 'non', angle: 'angle', triangle: 'triangle', square: 'case', Box: 'case',
  blacksquare: 'fin de la démonstration', qed: 'fin de la démonstration', checkmark: 'correct',
  star: 'étoile', lozenge: 'losange', dagger: 'dague', prime: 'prime', therefore: 'donc', because: 'car',
  '%': 'pour cent', '$': 'dollars', '&': 'et', '#': 'numéro', '_': 'tiret bas', aleph: 'aleph',
  imath: 'i', jmath: 'j', top: 'transposée', bot: 'faux', clubsuit: 'trèfle', heartsuit: 'cœur',
  spadesuit: 'pique', diamondsuit: 'carreau', degree: 'degrés', euro: 'euros', infin: "l'infini",
  nearrow: 'croît', searrow: 'décroît', uparrow: 'flèche vers le haut', downarrow: 'flèche vers le bas',
  Uparrow: 'flèche vers le haut', Downarrow: 'flèche vers le bas', nwarrow: 'flèche vers le haut à gauche',
  swarrow: 'flèche vers le bas à gauche',
}

/** Fonctions nommées : [mot dit, l'argument composé se lit-il avec « parenthèse » ?] */
const FONCTIONS: Record<string, [string, boolean]> = {
  sin: ['sinus', true], cos: ['cosinus', true], tan: ['tangente', true], tg: ['tangente', true],
  cot: ['cotangente', true], cotg: ['cotangente', true], sec: ['sécante', true], csc: ['cosécante', true],
  cosec: ['cosécante', true], arcsin: ['arc sinus', true], arccos: ['arc cosinus', true],
  arctan: ['arc tangente', true], arccot: ['arc cotangente', true], Arcsin: ['arc sinus', true],
  Arccos: ['arc cosinus', true], Arctan: ['arc tangente', true], sinh: ['sinus hyperbolique', true],
  cosh: ['cosinus hyperbolique', true], tanh: ['tangente hyperbolique', true], sh: ['sinus hyperbolique', true],
  ch: ['cosinus hyperbolique', true], th: ['tangente hyperbolique', true], ln: ['l n', true],
  log: ['log', true], lg: ['log', true], exp: ['exponentielle', true], det: ['déterminant', false],
  dim: ['dimension', false], ker: ['noyau', false], deg: ['degré', false], gcd: ['PGCD', false],
  pgcd: ['PGCD', false], PGCD: ['PGCD', false], ppcm: ['PPCM', false], PPCM: ['PPCM', false],
  arg: ['argument', true], Arg: ['argument', true], Re: ['partie réelle', true], Im: ['partie imaginaire', true],
  dom: ['domaine', false], im: ['ensemble image', false], sgn: ['signe', true], card: ['cardinal', false],
  Var: ['variance', false], Cov: ['covariance', false], id: ['identité', false], Id: ['identité', false],
  dist: ['distance', false], distance: ['distance', false], sup: ['borne supérieure', false], inf: ['borne inférieure', false],
  aire: ['aire', false], pr: ['projection', false],
}

const ACCENTS: Record<string, 'vec' | 'barre' | 'chapeau' | 'tilde' | 'point'> = {
  vec: 'vec', overrightarrow: 'vec', overleftrightarrow: 'vec', bar: 'barre', overline: 'barre',
  hat: 'chapeau', widehat: 'chapeau', tilde: 'tilde', widetilde: 'tilde', dot: 'point',
}

/** Commandes sans effet sur la lecture (style, espacement fin, taille). */
const TRANSPARENTES = new Set([
  'displaystyle', 'textstyle', 'scriptstyle', 'scriptscriptstyle', 'limits', 'nolimits', 'nonumber',
  'notag', 'normalsize', 'small', 'large', 'Large', 'huge', 'footnotesize', 'scriptsize', 'tiny',
  'rm', 'bf', 'it', 'sf', 'tt', 'cal', 'strut', 'mathstrut', 'allowbreak', 'nobreak', 'relax',
  'quad@', 'protect', 'nolinebreak', 'newline@', 'hline', 'cline@', 'toprule', 'midrule', 'bottomrule', 'arraystretch@',
])

const ESPACEMENTS = new Set([',', ';', ':', '!', ' ', '>', 'enspace', 'thinspace', 'medspace', 'thickspace',
  'negthinspace', 'negmedspace', 'negthickspace', 'nobreakspace', 'space'])

const TAILLES_DELIM = new Set(['big', 'Big', 'bigg', 'Bigg', 'bigl', 'Bigl', 'biggl', 'Biggl', 'bigr', 'Bigr',
  'biggr', 'Biggr', 'bigm', 'Bigm', 'left', 'right', 'middle'])

const CMD_DELIM: Record<string, string> = {
  lbrace: '{', rbrace: '}', '{': '{', '}': '}', '|': '‖', Vert: '‖', vert: '|', lvert: '|', rvert: '|',
  lVert: '‖', rVert: '‖', langle: '⟨', rangle: '⟩', lbrack: '[', rbrack: ']', lparen: '(', rparen: ')',
  lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉',
}

class Analyseur {
  i = 0
  inconnues: string[] = []
  private j: Jeton[]
  constructor(j: Jeton[]) {
    this.j = j
  }

  /** Lit jusqu'à `}` / fin / `&` / `\\` / `\end` / `\right` selon `arret`. */
  suite(arret: 'fer' | 'fin' | 'cellule' | 'crochet'): Noeud[] {
    const out: Noeud[] = []
    while (this.i < this.j.length) {
      const t = this.j[this.i]
      if (arret === 'fer' && t.t === 'fer') { this.i++; return out }
      if (arret === 'cellule' && (t.t === 'amp' || t.t === 'nl' || (t.t === 'cmd' && t.v === 'end'))) return out
      if (arret === 'crochet' && t.t === 'car' && t.v === ']') { this.i++; return out }
      if (t.t === 'fer') { this.i++; continue } // accolade fermante orpheline
      const n = this.atome()
      if (n) out.push(...n)
    }
    return out
  }

  /** Argument d'une commande : `{…}` ou un seul jeton (un seul chiffre pour `x^23`, `\frac12`). */
  argument(): Noeud[] {
    const t = this.j[this.i]
    if (!t) return []
    if (t.t === 'ouv') { this.i++; return this.suite('fer') }
    if (t.t === 'num' && (t.ent.length > 1 || t.dec)) {
      const premier = t.ent[0]
      const reste = t.ent.slice(1)
      if (reste) this.j[this.i] = { t: 'num', ent: reste, dec: t.dec, point: t.point }
      else this.j[this.i] = { t: 'num', ent: '0', dec: t.dec, point: t.point } // cas « 1,5 » coupé : rare
      return [{ k: 'num', ent: premier, dec: '' }]
    }
    return this.atome() ?? []
  }

  /** Argument brut (nom de couleur, de classe, d'environnement) : texte sans lecture. */
  argumentBrut(): string {
    const t = this.j[this.i]
    if (!t) return ''
    if (t.t !== 'ouv') { this.i++; return t.t === 'car' || t.t === 'cmd' ? t.v : '' }
    this.i++
    let prof = 1
    let txt = ''
    while (this.i < this.j.length && prof > 0) {
      const u = this.j[this.i++]
      if (u.t === 'ouv') prof++
      else if (u.t === 'fer') { prof--; if (prof === 0) break }
      if (u.t === 'car' || u.t === 'cmd') txt += u.v
      else if (u.t === 'num') txt += u.ent + (u.dec ? ',' + u.dec : '')
    }
    return txt
  }

  /** Texte de `\text{…}` : on recompose les caractères, espaces compris. */
  texte(): string {
    // Les espaces ont été retirés par `jetons` : on les retrouve dans la source d'origine.
    return this.argumentTexte()
  }

  argumentTexte(): string {
    const t = this.j[this.i]
    if (!t) return ''
    if (t.t !== 'ouv') { this.i++; return t.t === 'car' ? t.v : t.t === 'num' ? t.ent : '' }
    this.i++
    let prof = 1
    let txt = ''
    while (this.i < this.j.length) {
      const u = this.j[this.i++]
      if (u.t === 'ouv') { prof++; continue }
      if (u.t === 'fer') { prof--; if (prof === 0) break; continue }
      if (u.t === 'car') txt += u.v === '~' ? ' ' : u.v
      else if (u.t === 'num') txt += u.ent + (u.dec ? ',' + u.dec : '')
      else if (u.t === 'cmd') {
        if (u.v === ' ' || u.v === ',' || u.v === ';' || u.v === 'quad' || u.v === 'qquad') txt += ' '
        else if (u.v === '%') txt += ' pour cent'
        else if (u.v === '&') txt += ' et '
        else if (u.v === '$' || u.v === '#' || u.v === '_' || u.v === '{' || u.v === '}') txt += u.v
        else if (GRECQUES[u.v]) txt += ' ' + GRECQUES[u.v] + ' '
        else if (u.v === 'textbf' || u.v === 'textit' || u.v === 'emph' || u.v === 'text') continue
        else if (u.v === 'ldots' || u.v === 'dots') txt += '…'
      } else if (u.t === 'prime') txt += "'"
      else if (u.t === 'sup') txt += '^'
      else if (u.t === 'sub') txt += '_'
    }
    return txt
  }

  atome(): Noeud[] | null {
    const t = this.j[this.i++]
    switch (t.t) {
      case 'num':
        return [{ k: 'num', ent: t.ent, dec: t.dec, point: t.point }]
      case 'ouv':
        return [{ k: 'grp', corps: this.suite('fer') }]
      case 'fer':
        return null
      case 'sup': {
        const a = this.argument()
        return [{ k: 'marque', sup: a }]
      }
      case 'sub': {
        const a = this.argument()
        return [{ k: 'marque', sub: a }]
      }
      case 'prime': {
        let n = 1
        while (this.j[this.i]?.t === 'prime') { n++; this.i++ }
        return [{ k: 'marque', primes: n }]
      }
      case 'amp':
      case 'nl':
        return [{ k: 'sym', v: ';', dit: ';', c: 'punct' }]
      case 'car':
        return [this.caractere(t.v)]
      case 'cmd':
        return this.commande(t.v)
      case 'txt': {
        const v = texteBrut(t.v)
        const nom = v.trim()
        if (FONCTIONS[nom]) return [{ k: 'fonc', nom, dit: FONCTIONS[nom][0], paren: FONCTIONS[nom][1] }]
        return [{ k: 'texte', v }]
      }
    }
  }

  caractere(c: string): Noeud {
    if (/[a-zA-Z]/.test(c)) return { k: 'id', v: c, dit: c === 'y' || c === 'Y' ? 'i grec' : c }
    if (/[À-ÿ]/.test(c)) return { k: 'texte', v: c }
    if (c in RELATIONS) return { k: 'sym', v: c, dit: RELATIONS[c], c: 'rel' }
    if (c in BINAIRES) return { k: 'sym', v: c, dit: BINAIRES[c], c: 'bin' }
    if ('()[]|'.includes(c)) return { k: 'delim', v: c }
    if (c === ',' || c === ';' || c === ':') return { k: 'sym', v: c, dit: c, c: 'punct' }
    if (c === '!') return { k: 'marque', fact: true }
    if (c === '°') return { k: 'post', dit: 'degrés' }
    if (c === '€') return { k: 'post', dit: 'euros' }
    if (c === '$') return { k: 'post', dit: 'dollars' }
    if (c === '.') return { k: 'sym', v: '.', dit: '', c: 'punct' }
    if (c === '?') return { k: 'sym', v: '?', dit: '?', c: 'punct' }
    if (c === '~') return { k: 'esp', quad: false }
    if (c === '"') return { k: 'texte', v: '' }
    return { k: 'texte', v: c }
  }

  commande(v: string): Noeud[] {
    if (v.endsWith('@bb')) return [{ k: 'id', v: v[0], dit: v[0], fonte: 'bb' }]
    if (v === 'ell') return [{ k: 'id', v: 'l', dit: 'l' }]
    if (GRECQUES[v]) return [{ k: 'id', v, dit: GRECQUES[v] }]
    if (v in RELATIONS) {
      if (v === 'xrightarrow') {
        const dessous = this.j[this.i]?.t === 'car' && (this.j[this.i] as { v: string }).v === '[' ? (this.i++, this.suite('crochet')) : []
        const dessus = this.argument()
        return [{ k: 'dessus', dessus: [...dessous, ...dessus], corps: [{ k: 'sym', v: 'to', dit: '→', c: 'rel' }] }]
      }
      return [{ k: 'sym', v, dit: RELATIONS[v], c: 'rel' }]
    }
    if (v in BINAIRES) return [{ k: 'sym', v, dit: BINAIRES[v], c: 'bin' }]
    if (v in SYMBOLES) {
      if (v === '%' || v === 'degree' || v === 'euro' || v === '$') return [{ k: 'post', dit: SYMBOLES[v] }]
      return [{ k: 'sym', v, dit: SYMBOLES[v], c: 'ord' }]
    }
    if (v in FONCTIONS) return [{ k: 'fonc', nom: v, dit: FONCTIONS[v][0], paren: FONCTIONS[v][1] }]
    if (v === 'lim' || v === 'sum' || v === 'prod' || v === 'int' || v === 'max' || v === 'min')
      return [{ k: 'grand', nom: v }]
    if (v === 'iint' || v === 'oint') return [{ k: 'grand', nom: 'int' }]
    if (v === 'limsup' || v === 'liminf') return [{ k: 'grand', nom: 'lim' }]
    if (v === 'bigcup') return [{ k: 'grand', nom: 'cup' }]
    if (v === 'bigcap') return [{ k: 'grand', nom: 'cap' }]
    if (v === 'ldots' || v === 'cdots' || v === 'dots' || v === 'dotsc' || v === 'dotsb' || v === 'vdots' || v === 'ddots')
      return [{ k: 'etc' }]
    if (ESPACEMENTS.has(v)) return [{ k: 'esp', quad: false }]
    if (v === 'quad' || v === 'qquad') return [{ k: 'esp', quad: true }]
    if (v === 'hspace' || v === 'kern' || v === 'mkern' || v === 'mskip' || v === 'hskip' || v === 'vspace' || v === 'rule') {
      this.argumentBrut()
      if (v === 'rule') this.argumentBrut()
      return [{ k: 'esp', quad: false }]
    }
    if (TRANSPARENTES.has(v)) return []
    if (TAILLES_DELIM.has(v)) {
      const cote = /^(left|bigl|Bigl|biggl|Biggl)$/.test(v) ? 'g' : /^(right|bigr|Bigr|biggr|Biggr)$/.test(v) ? 'd' : undefined
      const t = this.j[this.i]
      if (!t) return []
      this.i++
      let d = ''
      if (t.t === 'car') d = t.v
      else if (t.t === 'cmd') d = CMD_DELIM[t.v] ?? (t.v === 'langle' ? '⟨' : '')
      if (d === '.' || d === '') return v === 'middle' ? [] : [{ k: 'delim', v: '.', cote }]
      if (v === 'middle') return [{ k: 'sym', v: '|', dit: '|', c: 'rel' }]
      return [{ k: 'delim', v: d, cote }]
    }
    if (v in CMD_DELIM) return [{ k: 'delim', v: CMD_DELIM[v] }]
    if (v === 'mathopen' || v === 'mathclose') {
      const a = this.argument()
      const d = a[0]
      if (d && d.k === 'delim') return [{ ...d, cote: v === 'mathopen' ? 'g' : 'd' }]
      return a
    }
    if (v === 'frac' || v === 'dfrac' || v === 'tfrac' || v === 'cfrac') {
      const num = this.argument()
      const den = this.argument()
      return [{ k: 'frac', num, den }]
    }
    if (v === 'binom' || v === 'dbinom' || v === 'tbinom') {
      const num = this.argument()
      const den = this.argument()
      return [{ k: 'frac', num, den, binom: true }]
    }
    if (v === 'sqrt') {
      let idx: Noeud[] | null = null
      const t = this.j[this.i]
      if (t && t.t === 'car' && t.v === '[') {
        this.i++
        idx = this.suite('crochet')
      }
      return [{ k: 'racine', idx, corps: this.argument() }]
    }
    if (v in ACCENTS) return [{ k: 'acc', a: ACCENTS[v], corps: this.argument() }]
    if (v === 'text' || v === 'textrm' || v === 'textit' || v === 'textbf' || v === 'textup' || v === 'textsf' ||
      v === 'texttt' || v === 'mbox' || v === 'textnormal' || v === 'hbox' || v === 'emph') {
      return [{ k: 'texte', v: this.texte() }]
    }
    if (v === 'operatorname' || v === 'mathrm' || v === 'mathit' || v === 'mathsf' || v === 'mathtt' || v === 'mathbf' ||
      v === 'boldsymbol' || v === 'bm' || v === 'pmb' || v === 'mathbb' || v === 'mathcal' || v === 'mathscr' ||
      v === 'mathfrak' || v === 'Bbb' || v === 'bold' || v === 'mathnormal') {
      const etoile = this.j[this.i]?.t === 'car' && (this.j[this.i] as { v: string }).v === '*'
      if (etoile) this.i++
      const corps = this.argument()
      const lettres = corps.every((n) => n.k === 'id' && n.v.length === 1)
      if (v === 'operatorname' || ((v === 'mathrm' || v === 'mathit') && lettres && corps.length > 1)) {
        const nom = corps.map((n) => (n.k === 'id' ? n.v : n.k === 'num' ? n.ent : '')).join('')
        if (FONCTIONS[nom]) return [{ k: 'fonc', nom, dit: FONCTIONS[nom][0], paren: FONCTIONS[nom][1] }]
        if (nom === 'lim' || nom === 'max' || nom === 'min') return [{ k: 'grand', nom }]
        if (lettres && nom) return [{ k: 'texte', v: nom }]
        return corps
      }
      const fonte = v === 'mathbb' || v === 'Bbb' ? 'bb' : v === 'mathcal' || v === 'mathscr' ? 'cal' : undefined
      if (fonte && corps.length === 1 && corps[0].k === 'id') return [{ ...corps[0], fonte }]
      return corps
    }
    if (v === 'color') { this.argumentBrut(); return [] }
    if (v === 'textcolor' || v === 'colorbox') { this.argumentBrut(); return [{ k: 'grp', corps: this.argument() }] }
    if (v === 'fcolorbox') { this.argumentBrut(); this.argumentBrut(); return [{ k: 'grp', corps: this.argument() }] }
    if (v === 'htmlClass' || v === 'htmlId' || v === 'htmlStyle' || v === 'htmlData' || v === 'href') {
      this.argumentBrut()
      return [{ k: 'grp', corps: this.argument() }]
    }
    if (v === 'boxed' || v === 'smash' || v === 'mathrlap' || v === 'mathllap' || v === 'mathclap' || v === 'rlap' ||
      v === 'llap' || v === 'clap' || v === 'underline' || v === 'mathrel' || v === 'mathbin' || v === 'mathord' ||
      v === 'mathop' || v === 'mathinner' || v === 'mathpunct' || v === 'hphantom@' || v === 'utilde' || v === 'ensuremath' ||
      v === 'displaylimits' || v === 'lefteqn' || v === 'raisebox@') {
      const corps = this.argument()
      if (v === 'mathrel' && corps.length === 1 && corps[0].k === 'sym') return [{ ...corps[0], c: 'rel' }]
      if (v === 'mathbin' && corps.length === 1 && corps[0].k === 'sym') return [{ ...corps[0], c: 'bin' }]
      return [{ k: 'grp', corps }]
    }
    if (v === 'phantom' || v === 'hphantom' || v === 'vphantom') { this.argument(); return [] }
    if (v === 'cancel' || v === 'bcancel' || v === 'xcancel' || v === 'sout') return [{ k: 'barre', mot: 'barré', corps: this.argument() }]
    if (v === 'underbrace' || v === 'overbrace') {
      const corps = this.argument()
      // L'étiquette (`_{…}` / `^{…}`) suit : elle devient une marque attachée au groupe.
      return [{ k: 'barre', mot: '', corps }]
    }
    if (v === 'overset' || v === 'stackrel' || v === 'underset') {
      const dessus = this.argument()
      const corps = this.argument()
      return [{ k: 'dessus', dessus, corps }]
    }
    if (v === 'substack') {
      const corps = this.argument()
      return [{ k: 'grp', corps }]
    }
    if (v === 'pmod') return [{ k: 'mod', corps: this.argument() }]
    if (v === 'bmod' || v === 'mod') return [{ k: 'sym', v: 'mod', dit: 'modulo', c: 'bin' }]
    if (v === 'not') {
      const t = this.j[this.i]
      if (t && ((t.t === 'car' && t.v === '=') || (t.t === 'cmd' && (t.v === 'equiv' || t.v === 'in' || t.v === 'subset')))) {
        this.i++
        const nom = t.v
        const dit = nom === '=' ? 'différent de' : nom === 'in' ? "n'appartient pas à" : nom === 'subset' ? "n'est pas inclus dans" : "n'est pas équivalent à"
        return [{ k: 'sym', v: 'not' + nom, dit, c: 'rel' }]
      }
      return []
    }
    if (v === 'begin') return [this.environnement()]
    if (v === 'end') { this.argumentBrut(); return [] }
    if (v === 'tag' || v === 'label') { this.argumentBrut(); return [] }
    if (v === 'colon') return [{ k: 'sym', v: ':', dit: ':', c: 'punct' }]
    if (v === 'over') return [{ k: 'sym', v: '/', dit: 'sur', c: 'bin' }]
    // Commande inconnue : jamais lue. Ses arguments éventuels le seront comme des groupes.
    this.inconnues.push(v)
    return []
  }

  environnement(): Noeud {
    const nom = this.argumentBrut()
    if (nom === 'array' || nom === 'tabular' || nom === 'alignat' || nom === 'alignat*') this.argumentBrut()
    const lignes: Noeud[][][] = []
    let ligne: Noeud[][] = []
    while (this.i < this.j.length) {
      const cellule = this.suite('cellule')
      ligne.push(cellule)
      const t = this.j[this.i]
      if (!t) break
      if (t.t === 'amp') { this.i++; continue }
      if (t.t === 'nl') {
        this.i++
        // `\\[4pt]` : espacement vertical facultatif.
        const u = this.j[this.i]
        if (u && u.t === 'car' && u.v === '[') this.suite('crochet')
        lignes.push(ligne)
        ligne = []
        continue
      }
      if (t.t === 'cmd' && t.v === 'end') { this.i++; this.argumentBrut(); break }
    }
    if (ligne.length && ligne.some((c) => c.length)) lignes.push(ligne)
    // `\hline` et lignes vides ignorées.
    return { k: 'env', nom: nom.replace(/\*$/, ''), lignes: lignes.filter((l) => l.some((c) => c.length)) }
  }
}

// Appariement des délimiteurs puis rattachement des indices/exposants à leur base.

function estFinOperande(n: Noeud | undefined): boolean {
  if (!n) return false
  if (n.k === 'sym') return n.c === 'ord'
  if (n.k === 'delim' || n.k === 'esp' || n.k === 'grand' || n.k === 'fonc') return false
  return true
}

function sepHautNiveau(items: Noeud[]): boolean {
  return items.some((n) => n.k === 'sym' && (n.v === ';' || n.v === ','))
}

function apparier(items: Noeud[]): Noeud[] {
  const out: Noeud[] = []
  const pile: { d: string; idx: number }[] = []
  const fermer = (niveau: number, droit: string) => {
    const ouv = pile[niveau]
    pile.length = niveau
    const corps = out.splice(ouv.idx + 1)
    out.pop()
    out.push({ k: 'cloture', g: ouv.d, d: droit, corps: rattacher(corps) })
  }
  const ouvrir = (d: string) => {
    out.push({ k: 'delim', v: d, cote: 'g' })
    pile.push({ d, idx: out.length - 1 })
  }
  const chercher = (d: string) => {
    for (let n = pile.length - 1; n >= 0; n--) if (pile[n].d === d) return n
    return -1
  }
  for (let p = 0; p < items.length; p++) {
    const it = items[p]
    if (it.k !== 'delim') { out.push(it); continue }
    const d = it.v
    const haut = pile[pile.length - 1]
    if (it.cote === 'g') { ouvrir(d); continue }
    if (it.cote === 'd') {
      if (haut) fermer(pile.length - 1, d)
      else out.push({ k: 'delim', v: d })
      continue
    }
    if (d === '(' || d === '{' || d === '⟨' || d === '⌊' || d === '⌈') { ouvrir(d); continue }
    if (d === ')' || d === '}' || d === '⟩' || d === '⌋' || d === '⌉') {
      const o = { ')': '(', '}': '{', '⟩': '⟨', '⌋': '⌊', '⌉': '⌈' }[d]!
      const n = chercher(o)
      if (n >= 0) fermer(n, d)
      else out.push({ k: 'delim', v: d })
      continue
    }
    if (d === '[') {
      if (haut && (haut.d === '[' || haut.d === ']') && sepHautNiveau(out.slice(haut.idx + 1))) fermer(pile.length - 1, '[')
      else ouvrir('[')
      continue
    }
    if (d === ']') {
      if (haut && (haut.d === '[' || haut.d === ']') && out.length > haut.idx + 1) fermer(pile.length - 1, ']')
      else ouvrir(']')
      continue
    }
    if (d === '|' || d === '‖') {
      const prec = out[out.length - 1]
      const dansP = haut && haut.d === '(' && out[haut.idx - 1]?.k === 'id' && (out[haut.idx - 1] as { v: string }).v === 'P'
      if (haut && haut.d === d && estFinOperande(prec)) { fermer(pile.length - 1, d); continue }
      const encoreUne = items.slice(p + 1).some((x) => x.k === 'delim' && x.v === '|' && x.cote !== 'g')
      if (d === '|' && (dansP || (estFinOperande(prec) && chercher('|') < 0 && !encoreUne))) {
        out.push({ k: 'sym', v: '|', dit: '|', c: 'rel' })
        continue
      }
      ouvrir(d)
      continue
    }
    out.push(it)
  }
  return rattacher(out)
}

function rattacher(items: Noeud[]): Noeud[] {
  const out: Noeud[] = []
  for (const it of items) {
    if (it.k !== 'marque') { out.push(it); continue }
    let base = out.pop()
    if (it.fact) {
      out.push(base ? { k: 'fact', corps: base } : { k: 'post', dit: 'factorielle' })
      continue
    }
    if (!base) base = { k: 'grp', corps: [] }
    const scr: Noeud = base.k === 'scr' ? base : { k: 'scr', base, sub: null, sup: null, primes: 0 }
    if (scr.k !== 'scr') continue
    if (it.sub) scr.sub = it.sub
    if (it.sup) {
      // `x^{\prime}` : prime écrite en exposant.
      if (it.sup.length === 1 && it.sup[0].k === 'sym' && it.sup[0].v === 'prime') scr.primes++
      else scr.sup = it.sup
    }
    if (it.primes) scr.primes += it.primes
    out.push(scr)
  }
  return out
}

/** Structure (appariement + rattachement) à toutes les profondeurs. */
function structurer(n: Noeud[]): Noeud[] {
  const rec = (x: Noeud): Noeud => {
    switch (x.k) {
      case 'grp': return { ...x, corps: structurer(x.corps) }
      case 'frac': return { ...x, num: structurer(x.num), den: structurer(x.den) }
      case 'racine': return { ...x, idx: x.idx && structurer(x.idx), corps: structurer(x.corps) }
      case 'acc': return { ...x, corps: structurer(x.corps) }
      case 'env': return { ...x, lignes: x.lignes.map((l) => l.map((c) => structurer(c))) }
      case 'marque': return { ...x, sub: x.sub && structurer(x.sub), sup: x.sup && structurer(x.sup) }
      case 'barre': return { ...x, corps: structurer(x.corps) }
      case 'dessus': return { ...x, dessus: structurer(x.dessus), corps: structurer(x.corps) }
      case 'mod': return { ...x, corps: structurer(x.corps) }
      default: return x
    }
  }
  return apparier(n.map(rec))
}

// ---------------------------------------------------------------------------------------------
// 3. Lecture
// ---------------------------------------------------------------------------------------------

/** Ponctuation de lecture (pauses de la voix). */
type Ponct = ',' | ':' | ';'
type Mot = string

interface Unite {
  type: 'atome' | 'op' | 'rel' | 'punct' | 'prefixe' | 'etc'
  mots: Mot[]
  /** Commence par un mot-marqueur (« parenthèse », « fraction », « crochet ») : pause avant. */
  ouvre?: 'paren' | 'frac'
  /** Se termine par « fin de … » : pause après si quelque chose suit. */
  ferme?: boolean
  /** Indice ou exposant composé en fin d'unité : virgule si un opérateur ou un facteur suit. */
  queue?: 'virgule' | 'exposant'
  nombre?: boolean
  lettre?: boolean
  indice?: boolean
  exposant?: boolean
  appel?: boolean
  fraction?: boolean
  racine?: boolean
  vecteur?: boolean
  texte?: boolean
  fonction?: boolean
  composantes?: boolean
  postfixe?: boolean
  differentielle?: boolean
}

interface Contexte {
  lim?: boolean
  integrale?: boolean
  ensemble?: boolean
  proba?: boolean
}

const LETTRES_FONCTIONS = new Set(['f', 'g', 'h', 'u', 'v', 'w', 'p', 'q', 'F', 'G', 'H', 'P', 'Q', 'N', 'C', 'E', 'V', 'L', 'R', 'S', 'T', 'A', 'B', 'D', 'I', 'K', 'M'])

/** Mots écrits en italique mathématique (sans `\text`) : lus d'un seul tenant, pas lettre par lettre. */
const LEXIQUE = new Set(['max', 'min', 'malade', 'segment', 'avant', 'apres', 'classe', 'rad', 'deg', 'triangle',
  'dist', 'seg', 'trig', 'hauteur', 'lat', 'secteur', 'lentille', 'total', 'tot', 'spam', 'famille', 'balay',
  'nouveau', 'ancien', 'mot', 'message', 'dir', 'moy', 'med', 'sup', 'inf', 'init', 'fin', 'base', 'aire',
  'vol', 'prix', 'cout', 'recette', 'benefice', 'eff', 'freq', 'cum', 'obs', 'th', 'exp', 'reel', 'approx'])

const ESPERANCE: Record<string, string> = { E: 'espérance', V: 'variance' }

function nombreDit(n: { ent: string; dec: string; point?: boolean }): string {
  if (!n.dec) return n.ent
  const zeros = /^0*/.exec(n.dec)![0]
  const reste = n.dec.slice(zeros.length)
  const dec = [...zeros].join(' ') + (reste ? (zeros ? ' ' : '') + reste : '')
  return `${n.ent} ${n.point ? 'point' : 'virgule'} ${dec}`
}

function joindre(mots: Mot[]): string {
  const force: Record<string, number> = { ',': 1, ':': 2, ';': 3 }
  const out: string[] = []
  for (const m of mots) {
    if (!m) continue
    if (m in force) {
      if (!out.length) continue
      const der = out[out.length - 1]
      if (der in force) {
        if (force[m] > force[der]) out[out.length - 1] = m
        continue
      }
      out.push(m)
      continue
    }
    out.push(m)
  }
  while (out.length && out[out.length - 1] in force) out.pop()
  let s = ''
  for (const m of out) {
    if (m === ',') s += ','
    else if (m === ':' || m === ';') s += ' ' + m
    else s += (s ? ' ' : '') + m
  }
  return s.replace(/\s+/g, ' ').trim()
}

class Lecteur {
  /** Lit une suite structurée et renvoie la liste de mots (avec ponctuation). */
  suite(noeuds: Noeud[], ctx: Contexte = {}): Mot[] {
    return this.assembler(this.unites(noeuds, ctx))
  }

  unitesSimples(u: Unite[]): boolean {
    if (u.length === 1) return u[0].type === 'atome' && !u[0].ferme && !u[0].queue && !u[0].ouvre && !this.estProduitComplexe(u[0])
    if (u.length === 2) return u[0].type === 'op' && (u[0].mots[0] === 'moins' || u[0].mots[0] === 'plus') && u[1].type === 'atome' && !u[1].ferme && !u[1].queue && !u[1].ouvre
    return false
  }

  estProduitComplexe(u: Unite): boolean {
    return !!u.appel && u.mots.includes(',')
  }

  /** Atome « simple » pour une fraction : un seul mot-unité sans opération (nombre, lettre, x², u_n). */
  atomeSimple(u: Unite[]): boolean {
    if (u.length !== 1) return false
    const a = u[0]
    if (a.type === 'atome' && a.appel && !a.ferme && !a.queue && !a.ouvre && a.mots.length <= 5) return true
    return a.type === 'atome' && !a.ferme && !a.queue && !a.ouvre && !a.fraction && !a.appel && !a.composantes &&
      !!(a.nombre || a.lettre || a.indice || a.exposant || a.vecteur || (a.racine && a.mots.length <= 4)) &&
      !(a.indice && a.exposant)
  }

  /** Produit de facteurs simples sans signe (« 2 pi », « 3 x ») : admis au numérateur d'une fraction simple. */
  produitSimple(u: Unite[]): boolean {
    if (!u.length || u.length > 3) return false
    return u.every((a) => a.type === 'atome' && !a.ferme && !a.queue && !a.ouvre && !a.fraction && !a.appel && (a.nombre || a.lettre)) &&
      u.filter((a) => a.nombre).length <= 1 && (u.length === 1 || !!u[0].nombre || u.every((a) => a.lettre))
  }

  /** Mots d'un sous-arbre lu comme un tout. */
  lire(n: Noeud[], ctx: Contexte = {}): Mot[] {
    return this.suite(n, ctx)
  }

  /** Lecture d'une parenthèse dont le contenu est composé : « parenthèse, …, fin de parenthèse ». */
  entreParentheses(mots: Mot[], nom = 'parenthèse'): Mot[] {
    return [nom, ',', ...mots, ',', `fin de ${nom}`]
  }

  unites(noeuds: Noeud[], ctx: Contexte): Unite[] {
    const u: Unite[] = []
    let i = 0
    let suffixe: string | null = null
    const ajouter = (x: Unite) => {
      u.push(x)
      if (suffixe && x.type === 'atome') {
        x.mots.push(suffixe)
        suffixe = null
      }
    }
    while (i < noeuds.length) {
      const n = noeuds[i]
      // Nœud suivant, espaces fins sautés (« \Phi\!\left(…\right) », « f'\!(x) »).
      let saut = 1
      while (noeuds[i + saut]?.k === 'esp' && !(noeuds[i + saut] as { quad: boolean }).quad) saut++
      const suivant = noeuds[i + saut]
      // --- mot écrit en italique (« max », « malade ») : lu d'un seul tenant
      if (n.k === 'id' && /^[a-z]$/.test(n.v) && !n.fonte && !(noeuds[i - 1]?.k === 'id' && /^[a-z]$/.test((noeuds[i - 1] as { v: string }).v))) {
        let k = i
        let mot = ''
        while (noeuds[k]?.k === 'id' && /^[a-z]$/.test((noeuds[k] as { v: string }).v) && !(noeuds[k] as { fonte?: string }).fonte) mot += (noeuds[k++] as { v: string }).v
        if (mot.length >= 3 && LEXIQUE.has(mot)) {
          ajouter({ type: 'atome', mots: [mot], texte: true })
          i = k
          continue
        }
      }
      // --- fonctions écrites sous forme de lettre suivie d'une parenthèse : f(x), P(A), A(2 ; 3)
      if (suivant && suivant.k === 'cloture' && suivant.g === '(' && this.estBaseAppel(n, suivant)) {
        ajouter(this.appel(n, suivant, ctx))
        i += 1 + saut
        continue
      }
      // --- f(x)², f'(x)^n : l'exposant s'est rattaché à la parenthèse
      if (suivant && suivant.k === 'scr' && suivant.base.k === 'cloture' && suivant.base.g === '(' && !suivant.sub &&
        suivant.sup && this.estBaseAppel(n, suivant.base)) {
        const x = this.appel(n, suivant.base, ctx)
        const e = this.exposant(suivant, suivant.base, ctx)
        x.mots.push(',', ...e.mots)
        x.ferme = false
        x.queue = e.compose ? 'exposant' : undefined
        x.exposant = true
        ajouter(x)
        i += 1 + saut
        continue
      }
      // --- (g ∘ f)(x)
      if (n.k === 'cloture' && n.g === '(' && suivant && suivant.k === 'cloture' && suivant.g === '(' &&
        n.corps.some((x) => x.k === 'sym' && x.v === 'circ')) {
        const arg = this.lire(suivant.corps, ctx)
        ajouter({ type: 'atome', mots: [...this.lire(n.corps, ctx), 'de', ...(this.unitesSimples(this.unites(suivant.corps, ctx)) ? arg : this.entreParentheses(arg))], appel: true })
        i += 1 + saut
        continue
      }
      // --- vecteur suivi de ses composantes
      if (suivant && suivant.k === 'env' && suivant.nom.endsWith('matrix') && suivant.lignes.every((l) => l.length === 1) &&
        (n.k === 'acc' && n.a === 'vec' || (n.k === 'scr' && n.base.k === 'acc' && n.base.a === 'vec'))) {
        const v = this.unite(n, ctx, noeuds, i)
        if (v) {
          v.mots.push('de composantes', ...this.composantes(suivant, ctx))
          v.composantes = true
          ajouter(v)
        }
        i += 1 + saut
        continue
      }
      // --- différentielle « d x » dans une intégrale
      if (ctx.integrale && n.k === 'id' && n.v === 'd' && suivant && (suivant.k === 'id' || suivant.k === 'scr')) {
        ajouter({ type: 'atome', mots: ['d', ...this.lire([suivant], ctx)], differentielle: true })
        i += 1 + saut
        continue
      }
      // --- fonction nommée (sin, ln, dom…) : consomme son argument
      if (n.k === 'fonc' || (n.k === 'scr' && n.base.k === 'fonc')) {
        const [x, pris] = this.fonction(n, noeuds, i + 1, ctx)
        ajouter(x)
        i += 1 + pris
        continue
      }
      // --- grands opérateurs (lim, somme, intégrale)
      if (n.k === 'grand' || (n.k === 'scr' && n.base.k === 'grand')) {
        const pref = this.grand(n, ctx)
        if (pref.integrale) ctx = { ...ctx, integrale: true }
        ajouter(pref.unite)
        i++
        continue
      }
      // --- Σ employé comme somme (statistique)
      if (n.k === 'id' && n.v === 'Sigma' && suivant && suivant.k !== 'sym' && suivant.k !== 'esp') {
        ajouter({ type: 'prefixe', mots: ['somme de'] })
        i++
        continue
      }
      // --- relation flèche « tend vers » avec dessus ⟨>⟩ / ⟨<⟩
      if (n.k === 'dessus') {
        const corps = n.corps
        const dessus = n.dessus
        const fleche = corps.length === 1 && corps[0].k === 'sym' && corps[0].c === 'rel'
        if (fleche) {
          const d = dessus.length === 1 && dessus[0].k === 'sym' ? dessus[0].v : ''
          const s = corps[0] as { v: string; dit: string }
          if (s.dit === '→' && (d === '>' || d === '<')) {
            ajouter({ type: 'rel', mots: ['tend vers'] })
            suffixe = d === '>' ? 'par la droite' : 'par la gauche'
          } else if (s.dit === '→' && dessus.length) {
            // \xrightarrow[t\to+\infty]{} : « quand t tend vers plus l'infini, tend vers »
            ajouter({ type: 'rel', mots: [',', 'quand', ...this.lire(dessus, { ...ctx, lim: true }), ',', 'tend vers'] })
          } else if (d === '?' && s.dit === 'égale') {
            ajouter({ type: 'rel', mots: ['est-il égal à'] })
          } else {
            ajouter({ type: 'rel', mots: [this.motRelation(s.dit, noeuds, i, ctx, u)] })
          }
        } else {
          for (const x of this.unites(corps, ctx)) ajouter(x)
        }
        i++
        continue
      }
      const derniere = u[u.length - 1]
      const cible = derniere && derniere.type === 'rel' && derniere.mots[0] === 'tend vers'
      const x = this.unite(n, cible ? { ...ctx, lim: true } : ctx, noeuds, i, u)
      if (x) ajouter(x)
      i++
    }
    return u
  }

  estBaseAppel(n: Noeud, arg: Noeud & { k: 'cloture' }): boolean {
    const corps = arg.corps
    const coord = sepHautNiveau(corps) && corps.some((x) => x.k === 'sym' && x.v === ';')
    if (corps.length && (corps[0].k === 'post' || (corps[0].k === 'sym' && corps[0].c !== 'ord' && corps[0].v !== '-'))) return false
    if (n.k === 'scr' && n.base.k === 'cloture' && n.base.g === '(' && n.primes > 0 && !n.sup) return true
    let base = n
    let decore = false
    if (n.k === 'scr') {
      base = n.base
      decore = n.primes > 0 || !!n.sub || (!!n.sup && this.estMoinsUn(n.sup))
      if (n.sup && !this.estMoinsUn(n.sup) && n.primes === 0) return false
    }
    if (base.k === 'acc' && base.a === 'vec') return coord
    if (base.k !== 'id') return false
    if (base.fonte === 'bb') return false
    const v = base.v
    if (base.fonte === 'cal') return true
    if (GRECQUES[v] && coord && /^[A-Z]/.test(v)) return true
    if (GRECQUES[v]) return v === 'varphi' || v === 'phi' || v === 'Phi' || v === 'psi' || v === 'Gamma' || v === 'sigma' || v === 'gamma' || v === 'theta'
    if (decore) return true
    if (/^[A-Z]$/.test(v) && coord) return true
    if (LETTRES_FONCTIONS.has(v)) return true
    // n(A), n(L ∩ C) : cardinal d'un ensemble nommé par une majuscule
    if (corps[0] && ((corps[0].k === 'id' && /^[A-Z]$/.test(corps[0].v)) || corps[0].k === 'texte' || (corps[0].k === 'scr' && corps[0].base.k === 'id' && /^[A-Z]$/.test(corps[0].base.v)) ||
      (corps[0].k === 'acc' && corps[0].a === 'barre' && corps[0].corps[0]?.k === 'id' && /^[A-Z]$/.test(corps[0].corps[0].v)))) return true
    // « a(m) », « k(x) » : une seule lettre entre parenthèses → fonction ; « a(x + 1) » → produit.
    return corps.length === 1 && corps[0].k === 'id' && /^[a-z]$/.test(v) && !GRECQUES[corps[0].v] && /^[a-zA-Z]$/.test(corps[0].v)
  }

  estMoinsUn(sup: Noeud[]): boolean {
    return sup.length === 2 && sup[0].k === 'sym' && sup[0].v === '-' && sup[1].k === 'num' && sup[1].ent === '1' && !sup[1].dec
  }

  appel(n: Noeud, arg: Noeud & { k: 'cloture' }, ctx: Contexte): Unite {
    const corps = arg.corps
    const base = n.k === 'scr' ? n.base : n
    const v = base.k === 'id' ? base.v : ''
    const coord = corps.some((x) => x.k === 'sym' && x.v === ';')
    // Lois de probabilité 𝓑(n ; p), 𝒩(μ ; σ), 𝒫(λ)
    if (base.k === 'id' && base.fonte === 'cal' && (v === 'B' || v === 'N' || v === 'P' || v === 'G' || v === 'U' || v === 'E') && n.k === 'id') {
      const loi = { B: 'binomiale', N: 'normale', P: 'de Poisson', G: 'géométrique', U: 'uniforme', E: 'exponentielle' }[v]
      const params = this.separer(corps).map((p) => this.lire(p, ctx))
      const mots: Mot[] = ['la loi', loi]
      if (params.length === 1) mots.push('de paramètre', ...params[0])
      else if (params.length > 1) {
        mots.push('de paramètres')
        params.forEach((p, k) => { if (k > 0) mots.push(k === params.length - 1 ? 'et' : ','); mots.push(...p) })
      }
      return { type: 'atome', mots, appel: true, ferme: params.some((p) => p.length > 2) }
    }
    const baseMots = this.lireBaseAppel(n, ctx)
    if (coord && (/^[A-Z]/.test(v) || base.k === 'acc')) {
      const params = this.separer(corps).map((p) => this.lire(p, ctx))
      const mots: Mot[] = [...baseMots, base.k === 'acc' ? 'de composantes' : 'de coordonnées']
      params.forEach((p, k) => { if (k > 0) mots.push(';'); mots.push(...p) })
      return { type: 'atome', mots, appel: true, composantes: true, queue: 'virgule' }
    }
    // Probabilités : P(A), P(A | B), P(X = 3) ; P(x) (polynôme) reste « P de x ».
    if (v === 'P' && n.k === 'id' && !(corps.length === 1 && corps[0].k === 'id' && /^[a-z]$/.test(corps[0].v))) {
      const us = this.unites(corps, { ...ctx, proba: true })
      const mots = this.assembler(us)
      const que = us.some((x) => x.type === 'rel' && x.mots[0] !== 'sachant')
      return { type: 'atome', mots: [que ? 'probabilité que' : 'probabilité de', ...mots], appel: true, ferme: !this.unitesSimples(us) }
    }
    const premier = corps[0]
    if ((v === 'E' || v === 'V') && n.k === 'id' && premier &&
      ((premier.k === 'id' && /^[A-Z]$/.test(premier.v)) || premier.k === 'texte' || (premier.k === 'scr' && premier.base.k === 'id' && /^[A-Z]$/.test(premier.base.v)))) {
      const us = this.unites(corps, ctx)
      return { type: 'atome', mots: [ESPERANCE[v], 'de', ...this.assembler(us)], appel: true, ferme: !this.unitesSimples(us) }
    }
    const us = this.unites(corps, ctx)
    if (this.unitesSimples(us) || this.produitSimple(us)) return { type: 'atome', mots: [...baseMots, 'de', ...this.assembler(us)], appel: true }
    if (sepHautNiveau(corps)) {
      // f(x ; y), C(n, k)
      const params = this.separer(corps).map((p) => this.lire(p, ctx))
      const mots: Mot[] = [...baseMots, 'de']
      params.forEach((p, k) => { if (k > 0) mots.push(k === params.length - 1 ? 'et' : ','); mots.push(...p) })
      return { type: 'atome', mots, appel: true, queue: 'virgule' }
    }
    return { type: 'atome', mots: [...baseMots, 'de', ',', ...this.entreParentheses(this.assembler(us))], appel: true, ferme: true }
  }

  lireBaseAppel(n: Noeud, ctx: Contexte): Mot[] {
    if (n.k === 'scr' && n.sup && this.estMoinsUn(n.sup) && n.primes === 0 && !n.sub) {
      return [...this.lire([n.base], ctx), 'réciproque']
    }
    return this.unite(n, ctx, [n], 0)?.mots ?? []
  }

  separer(corps: Noeud[]): Noeud[][] {
    const parts: Noeud[][] = [[]]
    for (const x of corps) {
      if (x.k === 'sym' && (x.v === ';' || x.v === ',')) parts.push([])
      else parts[parts.length - 1].push(x)
    }
    return parts.filter((p) => p.length)
  }

  composantes(env: Noeud & { k: 'env' }, ctx: Contexte): Mot[] {
    const mots: Mot[] = []
    env.lignes.forEach((l, k) => { if (k > 0) mots.push(';'); mots.push(...this.lire(l[0], ctx)) })
    return mots
  }

  fonction(n: Noeud, noeuds: Noeud[], j: number, ctx: Contexte): [Unite, number] {
    let f = (n.k === 'scr' ? n.base : n) as Noeud & { k: 'fonc' }
    if (f.nom === 'Im') {
      let q = j
      while (noeuds[q]?.k === 'esp') q++
      const a0 = noeuds[q]
      const premier = a0?.k === 'cloture' ? a0.corps[0] : a0
      const complexe = premier && ((premier.k === 'id' && premier.v === 'z') || (premier.k === 'scr' && premier.base.k === 'id' && premier.base.v === 'z'))
      if (!complexe) f = { ...f, dit: 'ensemble image', paren: false }
    }
    let tete: Mot[] = [f.dit]
    if (n.k === 'scr') {
      if (n.primes) tete = [f.dit, n.primes === 1 ? 'prime' : n.primes === 2 ? 'seconde' : 'tierce']
      if (n.sup) {
        const e = this.lire(n.sup, ctx)
        tete = e.length === 1 && e[0] === '2' ? [f.dit, 'carré'] : e.length === 1 && e[0] === '3' ? [f.dit, 'cube'] : [f.dit, 'exposant', ...e]
      }
      if (n.sub) {
        const b = this.lire(n.sub, ctx)
        tete = f.nom === 'log' || f.nom === 'lg' ? ['log en base', ...b] : [...tete, 'indice', ...b]
      }
    }
    // Argument : parenthèse, ou suite de facteurs simples (« sin 2x », « cos \hat{A} »).
    let pris = 0
    while (noeuds[j + pris]?.k === 'esp') pris++
    const a = noeuds[j + pris]
    if (!a || (a.k === 'sym' && a.c !== 'ord') || a.k === 'etc') {
      return [{ type: 'atome', mots: [...tete], fonction: true }, pris]
    }
    if (a.k === 'cloture' && a.g === '(') {
      if (sepHautNiveau(a.corps)) {
        const params = this.separer(a.corps).map((p) => this.lire(p, ctx))
        const mots: Mot[] = [...tete, 'de']
        params.forEach((p, k) => { if (k > 0) mots.push(f.nom === 'dist' || f.nom === 'distance' ? 'à' : k === params.length - 1 ? 'et' : ','); mots.push(...p) })
        return [{ type: 'atome', mots, appel: true, queue: 'virgule' }, pris + 1]
      }
      const us = this.unites(a.corps, ctx)
      const mots = this.assembler(us)
      if (this.unitesSimples(us) || this.produitSimple(us) || !f.paren) return [{ type: 'atome', mots: [...tete, 'de', ...mots], appel: true, queue: this.unitesSimples(us) ? undefined : 'virgule' }, pris + 1]
      return [{ type: 'atome', mots: [...tete, 'de', ',', ...this.entreParentheses(mots)], appel: true, ferme: true }, pris + 1]
    }
    const apres = noeuds[j + pris + 1]
    if (apres && apres.k === 'cloture' && apres.g === '(' && this.estBaseAppel(a, apres) && a.k !== 'num') {
      const x = this.appel(a, apres, ctx)
      return [{ type: 'atome', mots: [...tete, 'de', ...x.mots], appel: true, ferme: x.ferme, queue: x.queue }, pris + 2]
    }
    // Facteurs juxtaposés simples : nombre, lettres, grecques, accents, fractions.
    const args: Noeud[] = []
    let k = j + pris
    while (k < noeuds.length) {
      const x = noeuds[k]
      if (x.k === 'esp' && args.length) break
      if (x.k === 'esp') { k++; continue }
      const ok = x.k === 'num' ? args.length === 0 : x.k === 'id' || x.k === 'acc' || x.k === 'frac' || (x.k === 'scr' && x.base.k !== 'fonc' && x.base.k !== 'grand') || x.k === 'post' || x.k === 'racine' || (x.k === 'sym' && x.c === 'ord' && x.v !== 'infty')
      if (!ok) break
      if (x.k === 'id' && noeuds[k + 1]?.k === 'cloture' && args.length) break
      args.push(x)
      k++
      if (x.k === 'frac' || x.k === 'racine') break
    }
    if (!args.length) return [{ type: 'prefixe', mots: [...tete, 'de'], fonction: true }, pris]
    const us = this.unites(args, ctx)
    return [{ type: 'atome', mots: [...tete, 'de', ...(us[0]?.ouvre ? [','] : []), ...this.assembler(us)], appel: true, queue: us.length > 1 && us.some((x) => x.ferme) ? 'virgule' : undefined }, k - j]
  }

  grand(n: Noeud, ctx: Contexte): { unite: Unite; integrale?: boolean } {
    const g = (n.k === 'scr' ? n.base : n) as Noeud & { k: 'grand' }
    const sub = n.k === 'scr' ? n.sub : null
    const sup = n.k === 'scr' ? n.sup : null
    switch (g.nom) {
      case 'lim': {
        if (!sub) return { unite: { type: 'prefixe', mots: ['limite de'] } }
        return { unite: { type: 'prefixe', mots: ['limite quand', ...this.lire(sub, { ...ctx, lim: true }), ',', 'de'] } }
      }
      case 'sum':
      case 'prod': {
        const nom = g.nom === 'sum' ? 'somme' : 'produit'
        if (!sub && !sup) return { unite: { type: 'prefixe', mots: [`${nom} de`] } }
        const s = sub ?? []
        const egal = s.findIndex((x) => x.k === 'sym' && x.v === '=')
        if (egal >= 0) {
          const mots = [nom, 'pour', ...this.lire(s.slice(0, egal), ctx), 'allant de', ...this.lire(s.slice(egal + 1), ctx)]
          if (sup) mots.push('à', ...this.lire(sup, ctx))
          return { unite: { type: 'prefixe', mots: [...mots, ',', 'de'] } }
        }
        const mots = [nom, ...(s.length ? ['sur', ...this.lire(s, ctx)] : [])]
        if (sup) mots.push('jusqu’à', ...this.lire(sup, ctx))
        return { unite: { type: 'prefixe', mots: [...mots, ',', 'de'] } }
      }
      case 'int': {
        if (!sub && !sup) return { unite: { type: 'prefixe', mots: ['intégrale de'] }, integrale: true }
        return {
          unite: { type: 'prefixe', mots: ['intégrale de', ...this.lire(sub ?? [], ctx), 'à', ...this.lire(sup ?? [], ctx), ',', 'de'] },
          integrale: true,
        }
      }
      case 'max':
      case 'min': {
        const nom = g.nom === 'max' ? 'maximum' : 'minimum'
        return { unite: { type: 'prefixe', mots: sub ? [nom, 'sur', ...this.lire(sub, ctx), ',', 'de'] : [`${nom} de`] } }
      }
      case 'cup':
      case 'cap': {
        const nom = g.nom === 'cup' ? 'union' : 'intersection'
        return { unite: { type: 'prefixe', mots: sub ? [nom, 'pour', ...this.lire(sub, ctx), ...(sup ? ['à', ...this.lire(sup, ctx)] : []), ',', 'de'] : [`${nom} de`] } }
      }
    }
  }

  motRelation(dit: string, noeuds: Noeud[], i: number, ctx: Contexte, avant: Unite[]): string {
    if (dit === '→') {
      if (ctx.lim) return 'tend vers'
      // Opérande de gauche depuis la dernière relation ou ponctuation.
      const gauche: Unite[] = []
      let aRel = false
      for (let k = avant.length - 1; k >= 0; k--) {
        const x = avant[k]
        if (x.type === 'punct') break
        if (x.type === 'rel') { aRel = true; break }
        gauche.unshift(x)
      }
      const precedent = noeuds[i - 1]
      if (gauche.every((x) => x.texte && x.mots.some((m) => m.startsWith('flèche')))) return 'flèche vers la droite'
      if (precedent && precedent.k === 'id' && precedent.fonte === 'bb') return 'dans'
      if (precedent && precedent.k === 'scr' && precedent.base.k === 'id' && precedent.base.fonte === 'bb') return 'dans'
      if (!aRel && gauche.length === 1 && gauche[0].type === 'atome' && (gauche[0].lettre || gauche[0].indice)) return 'tend vers'
      return 'donne'
    }
    if (dit === '≡') {
      const reste = noeuds.slice(i + 1)
      if (reste.some((x) => x.k === 'mod')) return 'est congru à'
      const gauche = avant.filter((x) => x.type !== 'punct')
      if (gauche.length >= 1 && gauche.every((x) => x.type === 'atome') && reste[0]?.k === 'env' && reste[0].nom === 'cases') return 'a pour équations'
      if (gauche.length >= 1 && gauche.every((x) => x.type === 'atome') && reste.some((x) => x.k === 'sym' && x.v === '=')) return 'a pour équation'
      return 'équivaut à'
    }
    if (dit === '∼') {
      const s = noeuds[i + 1]
      if (s && s.k === 'id' && s.fonte === 'cal') return 'suit'
      return 'est équivalent à'
    }
    if (dit === 'appartient à' && avant.some((x) => x.mots[0] === 'pour tout' || x.mots[0] === 'il existe' || x.mots[0] === "il n'existe pas")) {
      let k = avant.length - 1
      while (k >= 0 && avant[k].type === 'atome' && !['pour tout', 'il existe', "il n'existe pas"].includes(avant[k].mots[0])) k--
      if (k >= 0 && avant[k].type === 'atome') return 'appartenant à'
    }
    if (dit === '|') return ctx.proba ? 'sachant' : ctx.ensemble ? 'tels que' : 'tel que'
    return dit
  }

  /** Une unité de lecture pour un nœud isolé. */
  unite(n: Noeud, ctx: Contexte, noeuds: Noeud[], i: number, avant: Unite[] = []): Unite | null {
    switch (n.k) {
      case 'num':
        return { type: 'atome', mots: [nombreDit(n)], nombre: true }
      case 'id': {
        if (n.fonte === 'bb') return { type: 'atome', mots: [n.v], lettre: true }
        return { type: 'atome', mots: [n.dit], lettre: true }
      }
      case 'texte': {
        const t = n.v.replace(/\s+/g, ' ').trim()
        if (t === ',' || t === ';' || t === ':') return { type: 'punct', mots: [t] }
        if (!t || /^[.,;:!?]+$/.test(t)) return null
        if (t === 'PI') return { type: 'atome', mots: ["point d'inflexion"], texte: true }
        const f = FONCTIONS[t]
        if (f && (t === 'dom' || t === 'im' || t === 'Im' || t === 'Re')) return { type: 'prefixe', mots: [`${f[0]} de`], fonction: true }
        return { type: 'atome', mots: [t], texte: true }
      }
      case 'sym': {
        if (n.c === 'rel') {
          const mot = this.motRelation(n.dit, noeuds, i, ctx, avant)
          if (mot.startsWith('flèche')) return { type: 'atome', mots: [',', mot, ','], texte: true }
          return { type: 'rel', mots: [mot] }
        }
        if (n.c === 'bin') {
          if ((n.v === 'cdot' || n.v === 'times') && this.estVecteur(noeuds[i - 1]) && this.estVecteur(noeuds[i + 1]))
            return { type: 'op', mots: [n.v === 'cdot' ? 'scalaire' : 'vectoriel'] }
          return { type: 'op', mots: [n.dit] }
        }
        if (n.c === 'punct') {
          if (n.v === '.') return null
          if (n.v === '?') return { type: 'punct', mots: ['?'] }
          return { type: 'punct', mots: [n.v as Ponct] }
        }
        if (n.dit.startsWith('flèche') || n.v === 'nearrow' || n.v === 'searrow') return { type: 'atome', mots: [',', n.dit, ','], texte: true }
        return { type: 'atome', mots: [n.dit], lettre: n.v === 'infty' ? false : true }
      }
      case 'grp': {
        const us = this.unites(n.corps, ctx)
        if (us.length === 1) return us[0]
        const mots = this.assembler(us)
        if (!mots.length) return null
        return { type: 'atome', mots, ferme: us[us.length - 1]?.ferme, queue: us.length > 1 ? 'virgule' : undefined }
      }
      case 'frac':
        return this.fraction(n, ctx, noeuds[i - 1])
      case 'racine': {
        const us = this.unites(n.corps, ctx)
        const idx = n.idx ? this.assembler(this.unites(n.idx, ctx)) : null
        let nom = 'racine carrée de'
        if (idx) {
          const s = idx.join(' ')
          nom = s === '2' ? 'racine carrée de' : s === '3' ? 'racine cubique de' : s === '4' ? 'racine quatrième de' : s === '5' ? 'racine cinquième de' : s === 'n' ? 'racine n-ième de' : `racine d’indice ${s} de`
        }
        const mots = this.assembler(us)
        const avecFraction = us.some((x) => x.fraction)
        if (!avecFraction && (this.unitesSimples(us) || this.produitSimple(us))) return { type: 'atome', mots: [nom, ...mots], racine: true }
        return { type: 'atome', mots: [nom, ',', ...mots, ',', 'fin de racine'], racine: true, ferme: true }
      }
      case 'acc': {
        const mots = this.lire(n.corps, ctx)
        const lettres = n.corps.filter((x) => x.k === 'id' || x.k === 'scr').length
        switch (n.a) {
          case 'vec': return { type: 'atome', mots: ['vecteur', ...mots], vecteur: true }
          case 'barre': return { type: 'atome', mots: [...mots, 'barre'], lettre: true }
          case 'chapeau':
            if (lettres >= 2 && n.corps.every((x) => x.k === 'id' || x.k === 'scr')) return { type: 'atome', mots: ['angle', ...mots], lettre: true }
            return { type: 'atome', mots: [...mots, 'chapeau'], lettre: true }
          case 'tilde': return { type: 'atome', mots: [...mots, 'tilde'], lettre: true }
          case 'point': return { type: 'atome', mots: [...mots, 'point'], lettre: true }
        }
        return null
      }
      case 'scr':
        return this.script(n, ctx, noeuds, i)
      case 'fact': {
        const inner = this.unite(n.corps, ctx, [n.corps], 0)
        if (!inner) return null
        if (n.corps.k === 'cloture') {
          const us = this.unites(n.corps.corps, ctx)
          if (this.unitesSimples(us)) return { type: 'atome', mots: ['factorielle', ...this.assembler(us)], appel: true }
          return { type: 'atome', mots: ['factorielle de', ',', ...this.entreParentheses(this.assembler(us))], ferme: true, appel: true }
        }
        return { type: 'atome', mots: ['factorielle', ...inner.mots], ferme: inner.ferme, queue: inner.queue, appel: true }
      }
      case 'post':
        return { type: 'atome', mots: [this.postDit(n.dit, noeuds[i - 1])], postfixe: true }
      case 'etc':
        return { type: 'etc', mots: [',', 'et cetera', ','] }
      case 'esp':
        if (noeuds[i - 1]?.k === 'texte' || noeuds[i + 1]?.k === 'texte') return null
        return n.quad && i > 0 && i < noeuds.length - 1 ? { type: 'punct', mots: [';'] } : null
      case 'env':
        return this.environnement(n, ctx)
      case 'barre': {
        const mots = this.lire(n.corps, ctx)
        return { type: 'atome', mots: n.mot ? [...mots, n.mot] : mots, queue: n.corps.length > 1 ? 'virgule' : undefined }
      }
      case 'dessus':
        return { type: 'atome', mots: this.lire(n.corps, ctx) }
      case 'mod':
        return { type: 'atome', mots: ['modulo', ...this.lire(n.corps, ctx)], postfixe: true }
      case 'cloture':
        return this.cloture(n, ctx, noeuds, i)
      case 'delim': {
        const d = n.v
        const mot = d === '(' ? 'parenthèse' : d === ')' ? 'fin de parenthèse' : d === '[' ? (n.cote === 'd' ? 'fin de crochet' : 'crochet') : d === ']' ? (n.cote === 'g' ? 'crochet' : 'fin de crochet') : d === '{' ? 'accolade' : d === '}' ? "fin d'accolade" : d === '|' ? 'barre' : d === '‖' ? 'double barre' : ''
        if (!mot) return null
        return { type: 'atome', mots: [mot], texte: true }
      }
      case 'fonc': {
        const [x] = this.fonction(n, noeuds, i + 1, ctx)
        return x
      }
      case 'grand':
        return this.grand(n, ctx).unite
      case 'marque':
        return null
    }
  }

  postDit(dit: string, prec: Noeud | undefined): string {
    if (dit === 'degrés' && prec && prec.k === 'num' && !prec.dec && (prec.ent === '0' || prec.ent === '1')) return 'degré'
    return dit
  }

  estVecteur(n: Noeud | undefined): boolean {
    if (!n) return false
    if (n.k === 'acc') return n.a === 'vec'
    if (n.k === 'scr') return this.estVecteur(n.base)
    return false
  }

  fraction(n: Noeud & { k: 'frac' }, ctx: Contexte, _prec?: Noeud): Unite {
    const un = this.unites(n.num, ctx)
    const ud = this.unites(n.den, ctx)
    const num = this.assembler(un)
    const den = this.assembler(ud)
    if (n.binom) return { type: 'atome', mots: [...den, 'parmi', ...num], queue: un.length > 1 || ud.length > 1 ? 'virgule' : undefined }
    if ((this.atomeSimple(un) || this.produitSimple(un)) && this.atomeSimple(ud)) {
      // « racine carrée de 3, sur 2 » : la pause dit que « sur 2 » n'est pas sous la racine.
      const pause = un[un.length - 1]?.racine ? [','] : []
      return { type: 'atome', mots: [...num, ...pause, 'sur', ...den], fraction: true }
    }
    return { type: 'atome', mots: ['fraction', ',', ...num, ',', 'sur', ...den, ',', 'fin de fraction'], ouvre: 'frac', ferme: true, fraction: true }
  }

  script(n: Noeud & { k: 'scr' }, ctx: Contexte, noeuds: Noeud[], i: number): Unite | null {
    const b = n.base
    // Ensembles : ℝ₀, ℝ⁺, ℝ*, ℝ₀⁺
    if (b.k === 'id' && b.fonte === 'bb') {
      const mots: Mot[] = [b.v]
      if (n.sub) mots.push(...this.lire(n.sub, ctx).map((m) => (m === '0' ? 'zéro' : m)))
      if (n.sup) mots.push(...this.lire(n.sup, ctx).map((m) => (m === 'fois' ? 'étoile' : m)))
      return { type: 'atome', mots, lettre: true }
    }
    // Restriction f|_A
    if (b.k === 'sym' && b.v === '|' && n.sub) return { type: 'atome', mots: ['restreinte à', ...this.lire(n.sub, ctx)], postfixe: true, queue: 'virgule' }
    // Combinaisons et arrangements Cₙᵏ, Aₙᵏ
    if (b.k === 'id' && (b.v === 'C' || b.v === 'A' || b.v === 'Gamma') && n.sub && n.sup && !n.primes) {
      const s = this.unites(n.sub, ctx)
      const e = this.unites(n.sup, ctx)
      return { type: 'atome', mots: [b.v === 'Gamma' ? 'grand gamma' : b.v, ...this.assembler(s), ...(s.length > 1 ? [','] : []), ...this.assembler(e)], indice: true, queue: e.length > 1 ? 'virgule' : undefined }
    }
    // Crochet évalué entre deux bornes : [F(x)]ₐᵇ
    if (b.k === 'cloture' && (b.g === '[' || b.g === '.' ) && n.sub && n.sup) {
      const corps = this.lire(b.corps, ctx)
      return { type: 'atome', mots: ['crochet', ',', ...corps, ',', 'fin de crochet', ',', 'pris entre', ...this.lire(n.sub, ctx), 'et', ...this.lire(n.sup, ctx)], ouvre: 'paren', ferme: true }
    }
    if (b.k === 'cloture' && b.g === '.' && n.sub) {
      return { type: 'atome', mots: [...this.lire(b.corps, ctx), ',', 'évalué en', ...this.lire(n.sub, ctx)], queue: 'virgule' }
    }
    // Accolade sous un groupe (\underbrace{…}_{p'}) : « …, noté p prime »
    if (b.k === 'barre' && !b.mot && (n.sub || n.sup)) {
      return { type: 'atome', mots: [...this.lire(b.corps, ctx), ',', 'noté', ...this.lire((n.sub ?? n.sup)!, ctx)], queue: 'virgule' }
    }
    // Base
    let baseU: Unite | null
    if (b.k === 'cloture') baseU = this.cloture(b, ctx, noeuds, i, true)
    else baseU = this.unite(b, ctx, [b], 0)
    if (!baseU) baseU = { type: 'atome', mots: [] }
    const mots = [...baseU.mots]
    const u: Unite = { type: 'atome', mots, ouvre: baseU.ouvre, nombre: baseU.nombre, lettre: baseU.lettre, vecteur: baseU.vecteur, ferme: false }
    const motPrime = n.primes === 1 ? 'prime' : n.primes === 2 ? 'seconde' : n.primes === 3 ? 'tierce' : `${n.primes} primes`
    if (n.primes && !n.sub) {
      if (baseU.ferme) mots.push(',')
      mots.push(motPrime)
    }
    if (n.sub) {
      const us = this.unites(n.sub, { ...ctx })
      let s = this.assembler(us)
      // Indice-mot : A_{lat}, CF_{avant}, n_{classe} (lettres seules, 3 ou plus) → un seul mot.
      if (n.sub.length >= 3 && n.sub.every((x) => x.k === 'id' && /^[a-zA-Z]$/.test(x.v))) s = [n.sub.map((x) => (x as { v: string }).v).join('')]
      mots.push('indice', ...s)
      if (n.primes) mots.push(...(us.length > 1 ? [','] : []), motPrime)
      u.indice = true
      u.lettre = false
      u.nombre = false
      if (us.length > 1 || us.some((x) => x.ferme || x.queue)) u.queue = 'virgule'
    }
    if (n.sup) {
      const exp = this.exposant(n, b, ctx)
      if (exp.degres) {
        mots.push(exp.mots[0] === 'degré' && baseU.nombre ? 'degré' : 'degrés')
        u.postfixe = true
        return u
      }
      if ((u.queue && n.sub) || baseU.ferme) mots.push(',')
      mots.push(...exp.mots)
      u.exposant = true
      u.lettre = false
      u.nombre = false
      u.queue = exp.compose ? 'exposant' : undefined
      if (baseU.ferme) u.ferme = false
    } else if (baseU.ferme) {
      u.ferme = true
    }
    return u
  }

  exposant(n: Noeud & { k: 'scr' }, b: Noeud, ctx: Contexte): { mots: Mot[]; compose?: boolean; degres?: boolean } {
    const sup = n.sup!
    if (sup.length === 1 && sup[0].k === 'sym' && (sup[0].v === 'circ')) {
      const prec = b.k === 'num' && !b.dec && (b.ent === '0' || b.ent === '1')
      return { mots: [prec ? 'degré' : 'degrés'], degres: true }
    }
    if (sup.length === 1 && sup[0].k === 'post' && sup[0].dit === 'degrés') return { mots: ['degrés'], degres: true }
    const us = this.unites(sup, ctx)
    const e = this.assembler(us)
    const baseE = b.k === 'id' && b.v === 'e' && !b.fonte
    // Signe seul : ℝ⁺, a⁺ (limites à droite), ℝ*
    if (sup.length === 1 && sup[0].k === 'sym' && (sup[0].v === '+' || sup[0].v === '-' || sup[0].v === '*' || sup[0].v === 'ast')) {
      if (ctx.lim && (sup[0].v === '+' || sup[0].v === '-')) return { mots: [sup[0].v === '+' ? 'par la droite' : 'par la gauche'] }
      return { mots: [sup[0].v === '+' ? 'plus' : sup[0].v === '-' ? 'moins' : 'étoile'] }
    }
    if (sup.length === 1 && sup[0].k === 'sym' && (sup[0].v === '>' || sup[0].v === '<') && ctx.lim) {
      return { mots: [sup[0].v === '>' ? 'par la droite' : 'par la gauche'] }
    }
    if (sup.length === 1 && sup[0].k === 'id' && sup[0].v === 'T' && b.k !== 'num') return { mots: ['transposée'] }
    if (b.k === 'id' && /^[fgh]$/.test(b.v) && this.estMoinsUn(sup)) return { mots: ['réciproque'] }
    if (!baseE && sup.length === 1 && sup[0].k === 'num' && !sup[0].dec) {
      if (sup[0].ent === '2') return { mots: ['au carré'] }
      if (sup[0].ent === '3') return { mots: ['au cube'] }
      return { mots: ['puissance', sup[0].ent] }
    }
    if (!baseE && sup.length === 1 && (sup[0].k === 'id' || (sup[0].k === 'sym' && sup[0].c === 'ord'))) return { mots: ['puissance', ...e] }
    const simple = this.unitesSimples(us)
    return { mots: ['exposant', ...(us[0]?.ouvre ? [','] : []), ...e], compose: !simple }
  }

  cloture(n: Noeud & { k: 'cloture' }, ctx: Contexte, noeuds: Noeud[], i: number, base = false): Unite | null {
    const { g, d, corps } = n
    // Intervalles ]a ; b], [a ; b[, ]a ; b[…
    if ((g === '[' || g === ']') && (d === '[' || d === ']') && sepHautNiveau(corps)) {
      const parts = this.separer(corps)
      if (parts.length === 2) {
        const environ = (m: Mot[]) => (m[0] === 'vaut environ' ? ['environ', ...m.slice(1)] : m)
        const a = environ(this.lire(parts[0], ctx))
        const bb = environ(this.lire(parts[1], ctx))
        const ga = g === '[' ? 'fermé' : 'ouvert'
        const dr = d === ']' ? 'fermé' : 'ouvert'
        const mots = ga === dr ? ["l'intervalle", ga, 'de', ...a, 'à', ...bb] : ["l'intervalle", ga, 'en', ...a, ',', dr, 'en', ...bb]
        return { type: 'atome', mots, queue: 'virgule' }
      }
    }
    const us = this.unites(corps, { ...ctx, ensemble: g === '{' ? true : ctx.ensemble })
    const mots = this.assembler(us)
    const simple = this.unitesSimples(us)
    // |AB| : distance entre deux points
    if (g === '|' && d === '|' && corps.length === 2 && corps.every((x) => this.estPointNomme(x))) {
      return { type: 'atome', mots: ['distance', ...corps.flatMap((x) => this.lire([x], ctx))], lettre: true }
    }
    if (g === '|' && d === '|') {
      if (simple && !base) return { type: 'atome', mots: ['valeur absolue de', ...mots], appel: true }
      return { type: 'atome', mots: ['valeur absolue de', ',', ...mots, ',', 'fin de valeur absolue'], appel: true, ferme: true }
    }
    if (g === '‖') {
      const tete = mots[0] === 'vecteur' ? ['norme du'] : ['norme de']
      if (simple && !base) return { type: 'atome', mots: [...tete, ...mots], appel: true }
      return { type: 'atome', mots: [...tete, ',', ...mots, ',', 'fin de norme'], appel: true, ferme: true }
    }
    if (g === '{') return this.ensemble(n, ctx, noeuds, i)
    if (g === '⌊') return { type: 'atome', mots: ['partie entière de', ...mots], appel: true, queue: simple ? undefined : 'virgule' }
    if (g === '⟨') return { type: 'atome', mots: ['crochet', ...mots, 'fin de crochet'], ferme: true }
    // Droite (AB), segment [AB], plan (ABC)
    if ((corps.length === 2 || corps.length === 3) && corps.every((x) => this.estPointNomme(x)) && !base) {
      const points = corps.flatMap((x) => this.lire([x], ctx))
      if (g === '(' && d === ')') return { type: 'atome', mots: [corps.length === 2 ? 'droite' : 'plan', ...points], lettre: true }
      if (g === '[' && d === ']' && corps.length === 2) return { type: 'atome', mots: ['segment', ...points], lettre: true }
    }

    const nom = g === '[' || g === ']' ? 'crochet' : 'parenthèse'
    // Couple (x ; y)
    if (g === '(' && corps.some((x) => x.k === 'sym' && x.v === ';')) {
      const params = this.separer(corps).map((p) => this.lire(p, ctx))
      const m: Mot[] = ['le couple']
      params.forEach((p, k) => { if (k > 0) m.push(';'); m.push(...p) })
      return { type: 'atome', mots: m, queue: 'virgule' }
    }
    if (!mots.length) return null
    const seul = noeuds.length === 1 && !base
    const nu = us.length === 1 && (us[0].lettre || us[0].nombre) && !us[0].indice && !us[0].exposant
    if ((simple && !base) || (base && nu) || (seul && !base)) {
      const x = us.length === 1 ? { ...us[0] } : { type: 'atome' as const, mots, nombre: false }
      return x
    }
    return { type: 'atome', mots: this.entreParentheses(mots, nom), ouvre: 'paren', ferme: true }
  }

  estPointNomme(x: Noeud): boolean {
    if (x.k === 'id') return /^[A-Z]$/.test(x.v) && !x.fonte
    if (x.k === 'scr') return !x.sup && x.base.k === 'id' && /^[A-Z]$/.test(x.base.v) && !x.base.fonte
    return false
  }

  ensemble(n: Noeud & { k: 'cloture' }, ctx: Contexte, noeuds: Noeud[], i: number): Unite {
    const corps = n.corps
    if (!corps.length) return { type: 'atome', mots: ["l'ensemble vide"] }
    const sep = corps.findIndex((x) => x.k === 'sym' && (x.v === '|' || x.v === 'mid' || x.v === ':'))
    if (sep >= 0) {
      const gauche = this.lire(corps.slice(0, sep), { ...ctx, ensemble: true }).map((m) => (m === 'appartient à' ? 'appartenant à' : m))
      const droite = this.lire(corps.slice(sep + 1), { ...ctx, ensemble: true })
      return { type: 'atome', mots: ["l'ensemble des", ...gauche, 'tels que', ...droite, ',', "fin de l'ensemble"], ferme: true }
    }
    const params = this.separer(corps).map((p) => this.lire(p, ctx))
    if (corps.some((x) => x.k === 'sym' && x.c === 'rel')) {
      const m: Mot[] = ['système', ':']
      params.forEach((p, k) => { if (k > 0) m.push(';'); m.push(...p) })
      return { type: 'atome', mots: [...m, ';', 'fin du système'], ouvre: 'paren', ferme: true }
    }
    const prec = noeuds[i - 1]
    const prive = prec && prec.k === 'sym' && (prec.v === 'setminus' || prec.v === 'backslash' || prec.v === 'smallsetminus')
    const m: Mot[] = prive ? [] : ["l'ensemble formé de"]
    params.forEach((p, k) => { if (k > 0) m.push(k === params.length - 1 ? 'et' : ','); m.push(...p) })
    return { type: 'atome', mots: m, queue: 'virgule' }
  }

  environnement(n: Noeud & { k: 'env' }, ctx: Contexte): Unite {
    const { nom, lignes } = n
    if (nom.endsWith('matrix')) {
      if (lignes.every((l) => l.length === 1)) {
        return { type: 'atome', mots: ['le vecteur de composantes', ...this.composantes(n, ctx)], composantes: true, queue: 'virgule' }
      }
      const mots: Mot[] = [nom === 'vmatrix' ? 'déterminant' : 'matrice', ':']
      lignes.forEach((l, k) => {
        mots.push(...(k > 0 ? [';'] : []), 'ligne', String(k + 1), ':')
        l.forEach((c, m) => { if (m > 0) mots.push(','); mots.push(...this.lire(c, ctx)) })
      })
      mots.push(';', 'fin de la matrice')
      return { type: 'atome', mots, ferme: true }
    }
    if (nom === 'cases' || nom === 'dcases' || nom === 'rcases') {
      const parCas = lignes.some((l) => l.length > 1 && l.slice(1).some((c) => c.some((x) => x.k === 'texte' && /\b(si|sinon|pour)\b/.test(x.v))))
      const mots: Mot[] = [parCas ? 'selon les cas' : 'système', ':']
      lignes.forEach((l, k) => {
        if (k > 0) mots.push(';')
        l.forEach((c, m) => { if (m > 0) mots.push(parCas ? '' : ','); mots.push(...this.lire(c, ctx)) })
      })
      mots.push(';', parCas ? 'fin des cas' : 'fin du système')
      return { type: 'atome', mots, ouvre: 'paren', ferme: true }
    }
    if (nom === 'array' || nom === 'tabular') {
      const colonnes = Math.max(...lignes.map((l) => l.length))
      if (colonnes <= 1) {
        const mots: Mot[] = []
        lignes.forEach((l, k) => { if (k > 0) mots.push(';'); mots.push(...this.lire(l[0] ?? [], ctx)) })
        return { type: 'atome', mots, queue: 'virgule' }
      }
      // Tableau de signes / de variations : « x : moins l'infini, moins 4, plus l'infini ; signe de
      // moins 2 x moins 2 : plus, 0, moins ».
      const tete = lignes[0]?.[0]
      const concavite = (l: Noeud[][]) => l.some((c) => c.length === 1 && c[0].k === 'sym' && (c[0].v === 'cup' || c[0].v === 'cap'))
      const estSigne = (c: Noeud[]) => c.length === 0 || (c.length === 1 && ((c[0].k === 'sym' && (c[0].v === '+' || c[0].v === '-' || c[0].v === 'nearrow' || c[0].v === 'searrow' || c[0].v === 'cup' || c[0].v === 'cap')) || (c[0].k === 'num' && c[0].ent === '0' && !c[0].dec) || (c[0].k === 'texte' && /^(\|\||nd|∄)$/.test(c[0].v.trim()))))
      if (tete && tete.length === 1 && tete[0].k === 'id' && lignes.length >= 2 && lignes.slice(1).every((l) => l.slice(1).every(estSigne) || concavite(l) || l.some((c) => c.length === 1 && c[0].k === 'sym' && (c[0].v === 'nearrow' || c[0].v === 'searrow')))) {
        const variations = lignes.slice(1).some((l) => l.some((c) => c.length === 1 && c[0].k === 'sym' && (c[0].v === 'nearrow' || c[0].v === 'searrow')))
        const mots: Mot[] = [variations ? 'tableau de variations' : lignes.some(concavite) ? 'tableau de concavité' : 'tableau de signes', ':']
        lignes.forEach((l, k) => {
          const cellules = l.slice(1).filter((c) => c.length)
          if (k > 0) mots.push(';', ...(concavite(l) ? ['concavité de'] : l.slice(1).some((c) => c.length === 1 && c[0].k === 'sym' && (c[0].v === 'nearrow' || c[0].v === 'searrow')) ? ['variations de'] : ['signe de']))
          mots.push(...this.lire(l[0] ?? [], ctx), ':')
          const cellule = (c: Noeud[]) => c.length === 1 && c[0].k === 'sym' && (c[0].v === 'cup' || c[0].v === 'cap') ? [c[0].v === 'cup' ? 'tournée vers le haut' : 'tournée vers le bas'] : this.lire(c, ctx)
          cellules.forEach((c, m) => { if (m > 0) mots.push(','); mots.push(...cellule(c)) })
        })
        mots.push(';', 'fin du tableau')
        return { type: 'atome', mots, ferme: true }
      }
      const mots: Mot[] = ['tableau', ':']
      lignes.forEach((l, k) => {
        mots.push(...(k > 0 ? [';'] : []), 'ligne', String(k + 1), ':')
        l.forEach((c, m) => { if (m > 0) mots.push(','); mots.push(...this.lire(c, ctx)) })
      })
      mots.push(';', 'fin du tableau')
      return { type: 'atome', mots, ferme: true }
    }
    // aligned, gathered, align, split, gather… : lignes séparées par une pause, cellules jointes.
    const mots: Mot[] = []
    lignes.forEach((l, k) => {
      if (k > 0) mots.push(';')
      mots.push(...this.lire(l.flat(), ctx))
    })
    return { type: 'atome', mots, queue: 'virgule' }
  }

  /** Faut-il dire « fois » entre deux atomes juxtaposés ? */
  fois(g: Unite, d: Unite): boolean {
    if (d.postfixe || g.type !== 'atome') return false
    if (d.differentielle) return false
    if (d.composantes && g.vecteur) return false
    if (g.texte || d.texte) return false
    if (d.ouvre === 'paren') return true
    if (d.nombre) return true
    if (g.ferme || g.appel || g.fraction || g.racine || g.indice || g.exposant || g.composantes) return true
    if (g.queue) return true
    if (d.fraction) return true
    if (d.indice && g.nombre) return true
    if (d.ouvre === 'frac') return true
    return false
  }

  assembler(us: Unite[]): Mot[] {
    const out: Mot[] = []
    let prefixe = false
    for (let k = 0; k < us.length; k++) {
      const x = us[k]
      const g = us[k - 1]
      const d = us[k + 1]
      if (x.type === 'prefixe') prefixe = true
      else if (x.type === 'rel' || x.type === 'punct') {
        if (prefixe && x.type === 'rel') out.push(',')
        prefixe = false
      }
      if (g && g.type === 'atome' && x.type === 'atome' && this.fois(g, x)) out.push('fois')
      if ((x.ouvre || (x.type === 'atome' && (x.mots[0] === 'parenthèse' || x.mots[0] === 'crochet'))) && out.length) out.push(g && g.type === 'rel' && x.ouvre === 'frac' ? ':' : ',')
      out.push(...x.mots)
      if (d && d.type !== 'punct') {
        if (x.ferme) out.push(',')
        else if (x.queue === 'virgule' && d.type !== 'rel') out.push(',')
        // Indice / exposant simple suivi d'un opérateur : pause (« u indice n, plus 1 » ≠ « u indice n
        // plus 1 » = u₍ₙ₊₁₎ ; « x au carré, plus 1 ») — décision du professeur.
        else if ((x.indice || x.exposant) && !x.queue && d.type === 'op') out.push(',')
        else if (x.queue === 'exposant') out.push(...(d.type === 'rel' ? [','] : [',', "fin d'exposant", ',']))
      }
    }
    return out
  }
}

/** Contenu brut d'un `\text{…}` : commandes d'espacement et de style retirées, rien d'autre. */
function texteBrut(t: string): string {
  return t
    .replace(/\$([^$]*)\$/g, (_, m: string) => ' ' + lireFormule(m) + ' ')
    .replace(/\\(?:,|;|:|!| |quad|qquad|enspace|thinspace)/g, ' ')
    .replace(/\\%/g, ' pour cent')
    .replace(/\\&/g, ' et ')
    .replace(/\\(?:textbf|textit|emph|text|mathrm)\b/g, '')
    .replace(/\\([#$_{}])/g, '$1')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/~/g, ' ')
}

function texteDeRepli(tex: string): string {
  return tex
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[\\{}^_&$]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface AnalyseLecture {
  lecture: string
  /** Commandes LaTeX que le lecteur ne connaît pas (jamais lues). */
  inconnues: string[]
}

/** Lecture en mots et diagnostic (commandes inconnues) — utilisé par le contrôle exhaustif. */
export function analyserLecture(tex: string): AnalyseLecture {
  try {
    const a = new Analyseur(jetons(tex))
    const arbre = structurer(a.suite('fin'))
    const lecture = joindre(new Lecteur().suite(arbre))
    return { lecture, inconnues: a.inconnues }
  } catch {
    return { lecture: texteDeRepli(tex), inconnues: ['(erreur)'] }
  }
}

const CACHE = new Map<string, string>()

/** Lecture en mots, en français parlé, d'une formule LaTeX du site (« u indice n plus 1 égale… »). */
export function lireFormule(tex: string): string {
  const deja = CACHE.get(tex)
  if (deja !== undefined) return deja
  const lecture = analyserLecture(tex).lecture
  if (CACHE.size > 5000) CACHE.clear()
  CACHE.set(tex, lecture)
  return lecture
}

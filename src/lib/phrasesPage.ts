/**
 * Lecture à voix haute d'un MORCEAU DE PAGE (étape du cours, énoncé, aide, corrigé…) : le DOM affiché
 * devient une suite de phrases (`PhraseVoix`) que le moteur (`voixLecture.ts`) lit une à une.
 *
 * - Texte : les nœuds texte VISIBLES, dans l'ordre de lecture. Formules : leur lecture en mots
 *   (`aria-label` des formules `role="img"`, posé par `Math.tsx`, `KatexAccessible.tsx`,
 *   `katexAccessible.ts`) — jamais de LaTeX brut. Le texte caché (`display: none`, `visibility: hidden`,
 *   `aria-hidden`, `hidden`, `.sr-only`) n'est pas lu.
 * - Découpage : un bloc (paragraphe, titre, élément de liste, légende, ligne de tableau…) n'est jamais
 *   lu avec le suivant ; à l'intérieur, `decoupagePhrases.ts` coupe aux fins de phrase (abréviations,
 *   « 3,5 », « … » et formules respectés).
 * - Ce qu'on lit / saute (planche 08) : titres, légendes de figures, encadrés, tableaux (une ligne = une
 *   phrase ; tableau de signes : son résumé) : oui. Ateliers, vidéos, cartes « S'entraîner » : une phrase
 *   « Atelier : … », « Vidéo : … », « À toi : … ». Boutons, champs, figures, widgets : non.
 * - Chaque phrase garde sa place (`Range`, sans toucher au DOM : React n'est jamais dérangé) et celle de
 *   ses formules (`zones`), pour le surlignage et « touche une phrase pour lire à partir d'elle ».
 */

import { coupures } from './decoupagePhrases'
import type { PhraseVoix, ZoneFormule } from './voixLecture'

type Morceau =
  | { t: 'txt'; node: Text; src: number[]; a: number; b: number }
  | { t: 'f'; el: Element; a: number; b: number }
  | { t: 'ajout'; el: Element | null; a: number; b: number }

/* Texte brut du site qui contient des symboles (« uₙ », « (n−1) », « x² », « n° 1 », « × », « Ex. ») :
   dits en mots, comme les formules KaTeX (une voix lirait « u n », « n tiret 1 », « n degré 1 »…).
   Chaque morceau garde la position du caractère d'origine (surlignage exact). */
const INDICES_TXT: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ₙ': 'n', 'ₚ': 'p', 'ₖ': 'k', 'ᵢ': 'i', 'ₐ': 'a', 'ₑ': 'e', 'ₓ': 'x' }
const EXPOSANTS_TXT: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', 'ⁿ': 'n', '⁻': 'moins ' }
const SYMBOLES_TXT: Record<string, string> = {
  '−': ' moins ', '×': ' fois ', '÷': ' divisé par ', '≤': ' inférieur ou égal à ', '≥': ' supérieur ou égal à ', '≠': ' différent de ',
  '≈': ' environ ', '∞': ' l’infini ', '√': ' racine carrée de ', '∈': ' appartient à ', '+': ' plus ', '=': ' égale ', '·': ', ',
  '⟹': ', donc ', '⇒': ', donc ', '⇔': ' équivaut à ', '∀': ' pour tout ',
  // Notation clavier restée dans un texte (« log_a(x) », « x^2 ») : jamais « tiret bas » ni « accent circonflexe ».
  _: ' indice ', '^': ' exposant ', '✓': ' ', '✗': ' ', '✔': ' ', '✘': ' ',
}

function enMots(brut: string): [string, number][] {
  const out: [string, number][] = []
  let o = 0
  while (o < brut.length) {
    const reste = brut.slice(o)
    const ex = /^Ex\.(?=\s)/.exec(reste)
    if (ex && (o === 0 || /[\s(«]/.test(brut[o - 1]))) {
      out.push(['Exemple :', o])
      o += ex[0].length
      continue
    }
    // « f(x) », « |a| » écrits en texte brut : « f de x », « valeur absolue de a » (jamais « le(s) »).
    const apresLettre = o > 0 && /\p{L}/u.test(brut[o - 1])
    const fx = /^([a-zA-Z])\(([a-zA-Z])\)(?!\p{L})/u.exec(reste)
    if (fx && !apresLettre) {
      out.push([`${fx[1]} de ${fx[2]}`, o])
      o += fx[0].length
      continue
    }
    const va = /^\|([a-zA-Z])\|/.exec(reste)
    if (va) {
      out.push([`valeur absolue de ${va[1]}`, o])
      o += va[0].length
      continue
    }
    if (reste.startsWith('n°') && (o === 0 || !/\p{L}/u.test(brut[o - 1]))) {
      out.push(['numéro ', o])
      o += 2
      continue
    }
    const c = brut[o]
    if (c in INDICES_TXT) {
      let v = ''
      const debut = o
      while (o < brut.length && brut[o] in INDICES_TXT) v += INDICES_TXT[brut[o++]]
      out.push([` indice ${v} `, debut])
      continue
    }
    if (c in EXPOSANTS_TXT) {
      let v = ''
      const debut = o
      while (o < brut.length && brut[o] in EXPOSANTS_TXT) v += EXPOSANTS_TXT[brut[o++]]
      out.push([v === '2' ? ' au carré ' : v === '3' ? ' au cube ' : ` exposant ${v} `, debut])
      continue
    }
    if (c in SYMBOLES_TXT) {
      out.push([SYMBOLES_TXT[c], o])
      o++
      continue
    }
    out.push([c, o])
    o++
  }
  return out
}

class Unite {
  s = ''
  morceaux: Morceau[] = []
  bloc: Element
  constructor(bloc: Element) {
    this.bloc = bloc
  }

  /** Une espace avant un mot qui suit une formule (« $u_n$ est » ; pas avant « , »). */
  private espaceApresFormule(c: string) {
    const der = this.morceaux[this.morceaux.length - 1]
    if (der && der.t === 'f' && !this.s.endsWith(' ') && !/[\s,.;:!?)\]»…]/.test(c)) this.s += ' '
  }

  texte(node: Text) {
    const brut = node.data
    if (!brut) return
    const src: number[] = []
    const a0 = this.s.length
    let premier = true
    // Espace ajoutée par un mot (« u indice n ») : retirée devant une ponctuation (« u indice n, »).
    let espaceAjoutee = false
    for (const [morceau, o] of enMots(brut)) {
      for (const c of morceau) {
        if (/\s/.test(c)) {
          if (this.s === '' || this.s.endsWith(' ')) continue
          this.s += ' '
          src.push(o)
          espaceAjoutee = morceau.length > 1
        } else {
          if (espaceAjoutee && /[,.)\]…]/.test(c) && this.s.endsWith(' ') && src.length > 0) {
            this.s = this.s.slice(0, -1)
            src.pop()
          }
          espaceAjoutee = false
          if (premier) {
            this.espaceApresFormule(c)
            while (src.length < this.s.length - a0) src.push(o)
            premier = false
          }
          this.s += c
          src.push(o)
        }
      }
    }
    if (this.s.length > a0) this.morceaux.push({ t: 'txt', node, src, a: a0, b: this.s.length })
  }

  formule(el: Element, mots: string) {
    // Deux formules qui se suivent sans texte entre elles (« r = 9   u₁₂ = 91 », données côte à côte) :
    // une virgule, pour que la voix marque la pause que l'œil voit.
    const der = this.morceaux[this.morceaux.length - 1]
    const seulementEspaces = der && der.t === 'txt' && !this.s.slice(der.a, der.b).trim()
    const avant = seulementEspaces ? this.morceaux[this.morceaux.length - 2] : der
    if (avant && avant.t === 'f') {
      if (seulementEspaces) {
        this.s = this.s.slice(0, der.a)
        this.morceaux.pop()
      }
      this.s = this.s.replace(/ $/, '')
      const a = this.s.length
      this.s += ', '
      this.morceaux.push({ t: 'ajout', el: null, a, b: this.s.length })
    }
    if (this.s && !this.s.endsWith(' ')) this.s += ' '
    const a = this.s.length
    this.s += mots.replace(/\s+/g, ' ').trim()
    this.morceaux.push({ t: 'f', el, a, b: this.s.length })
  }

  ajout(texte: string, el: Element | null = null) {
    const t = enMots(texte)
      .map(([m]) => m)
      .join('')
      .replace(/\s+/g, ' ')
      .replace(/ ([,.)])/g, '$1')
    if (!t) return
    if (t.startsWith(' ') && (this.s === '' || this.s.endsWith(' '))) {
      this.ajout(t.slice(1), el)
      return
    }
    if (t !== ' ') this.espaceApresFormule(t[0])
    const a = this.s.length
    this.s += t
    this.morceaux.push({ t: 'ajout', el, a, b: this.s.length })
  }

  vide(): boolean {
    return !/[\p{L}\p{N}]/u.test(this.s)
  }
}

/** Ce qui n'est jamais lu (boutons, champs, figures, widgets, éléments cachés aux lecteurs d'écran…). */
const EXCLU = [
  'button', 'input', 'select', 'textarea', 'script', 'style', 'noscript', 'template', 'iframe', 'video', 'audio',
  'canvas', 'svg', 'math', 'dialog', 'img', '[aria-hidden="true"]', '[hidden]', '.sr-only', '.no-voix', '.etape-nav',
  '.pas-boutons', '.lt-panneau', '.lt-lancer', '.gen-tiroir', '.selecteur-variante-bloc', '.corrige-pas-boutons',
].join(', ')

function estBloc(d: string): boolean {
  return d !== 'inline' && d !== 'inline-block' && d !== 'inline-flex' && d !== 'inline-grid' && d !== 'contents' && d !== 'none' && !d.startsWith('ruby') && d !== 'table-cell'
}

interface Ctx {
  unites: Unite[]
  courante: Unite | null
  pile: Element[]
  exclure: string | null
}

function unite(c: Ctx): Unite {
  if (!c.courante) {
    c.courante = new Unite(c.pile[c.pile.length - 1])
    c.unites.push(c.courante)
  }
  return c.courante
}

function finir(c: Ctx) {
  if (c.courante && c.courante.vide()) c.unites.splice(c.unites.indexOf(c.courante), 1)
  c.courante = null
}

/** Nouvelle unité (bloc) le temps de `f`. */
function enBloc(c: Ctx, el: Element, f: () => void) {
  finir(c)
  c.pile.push(el)
  f()
  finir(c)
  c.pile.pop()
}

function texteDe(el: Element | null): string {
  return (el?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * Tableaux de signes enveloppés par `LectureTableau` : le composant inscrit ici, pour son enveloppe, une
 * fonction qui rend le résumé du tableau (même modèle que « Lire case par case »). Rien dans le DOM : la
 * page pré-rendue n'en garde aucune trace.
 */
export const resumesTableaux = new WeakMap<Element, () => string | null>()

function marcher(n: Node, c: Ctx) {
  if (n.nodeType === Node.TEXT_NODE) {
    unite(c).texte(n as Text)
    return
  }
  if (!(n instanceof Element)) return
  if (n.matches(EXCLU) || (c.exclure && n.matches(c.exclure)) || n.tagName.includes('-')) return
  const lu = n.getAttribute('role') === 'img' ? n.getAttribute('aria-label') : null
  if (lu) {
    unite(c).formule(n, lu)
    return
  }
  if (n.tagName === 'BR') {
    unite(c).ajout(' ')
    return
  }
  const cs = getComputedStyle(n)
  if (cs.display === 'none') return
  if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return

  // ---- cas particuliers du gabarit (ateliers, vidéos, tiroirs, cartes, tableaux) ----
  if (n.matches('.carte-manipuler')) {
    return enBloc(c, n, () => {
      unite(c).ajout('Atelier : ')
      const titre = n.querySelector('.carte-titre')
      if (titre) titre.childNodes.forEach((x) => marcher(x, c))
      unite(c).ajout('.')
    })
  }
  if (n.matches('.carte-video')) {
    return enBloc(c, n, () => unite(c).ajout(`Vidéo : ${texteDe(n.querySelector('.carte-video-bouton, .carte-video-attente'))}.`, n))
  }
  if (n.matches('.carte-atoi')) {
    return enBloc(c, n, () => {
      unite(c).ajout('À toi : ')
      const titre = n.querySelector('.carte-titre')
      if (titre) titre.childNodes.forEach((x) => marcher(x, c))
      unite(c).ajout('.')
    })
  }
  if (n.matches('.tiroir')) {
    const titre = n.querySelector('.tiroir-titre')
    enBloc(c, n, () => unite(c).ajout(`${texteDe(titre)}.`, titre))
    const corps = n.querySelector('.tiroir-corps')
    if (n.classList.contains('ouvert') && corps) enBloc(c, corps, () => corps.childNodes.forEach((x) => marcher(x, c)))
    return
  }
  if (n.matches('.lecture-tableau')) {
    const t = n.querySelector('table')
    let resume: string | null = null
    try {
      resume = resumesTableaux.get(n)?.() ?? null
    } catch {
      resume = null
    }
    if (t && resume) {
      if (t.caption) enBloc(c, t.caption, () => t.caption!.childNodes.forEach((x) => marcher(x, c)))
      enBloc(c, t, () => unite(c).ajout(`Tableau de signes : ${resume}`, t))
      return
    }
  }
  if (n.tagName === 'TR') {
    return enBloc(c, n, () => {
      const u = unite(c)
      let premier = true
      for (const td of Array.from((n as HTMLTableRowElement).cells)) {
        const avant = u.s.length
        if (!premier) u.ajout(', ')
        const apresSep = u.s.length
        td.childNodes.forEach((x) => marcher(x, c))
        if (u.s.length === apresSep) {
          // cellule vide : on retire le séparateur
          u.s = u.s.slice(0, avant)
          u.morceaux = u.morceaux.filter((m) => m.a < avant)
        } else premier = false
      }
      u.ajout('.')
    })
  }
  // Chaîne de calcul du corrigé (grille de cases) : une ligne = membre de gauche, membre de droite,
  // justification (même `data-ligne`), lue d'un trait.
  if (n.matches('.corrige-ecran-calcul')) {
    const groupes: Element[][] = []
    let cle: string | null = null
    for (const enfant of Array.from(n.children)) {
      const k = enfant.getAttribute('data-ligne')
      if (!groupes.length || k === null || k !== cle) groupes.push([])
      groupes[groupes.length - 1].push(enfant)
      cle = k
    }
    for (const g of groupes) {
      enBloc(c, g[0], () => {
        g.forEach((cellule) => {
          if (cellule.className.includes('cc-j')) unite(c).ajout(', ')
          if (getComputedStyle(cellule).visibility !== 'hidden') cellule.childNodes.forEach((x) => marcher(x, c))
        })
      })
    }
    return
  }

  if (estBloc(cs.display)) return enBloc(c, n, () => n.childNodes.forEach((x) => marcher(x, c)))
  n.childNodes.forEach((x) => marcher(x, c))
}

/** Une unité (bloc) → ses phrases, avec leur place dans la page. */
function phrasesDeUnite(u: Unite): PhraseVoix[] {
  const m = u.morceaux
  const dans = (i: number) => m.find((x) => x.a <= i && i < x.b)
  const bornes = [
    0,
    ...coupures(u.s, {
      admis: (i) => dans(i)?.t !== 'f',
      debutFormule: (i) => m.some((x) => x.t === 'f' && x.a === i),
    }),
    u.s.length,
  ]
  const out: PhraseVoix[] = []
  for (let k = 0; k < bornes.length - 1; k++) {
    let a = bornes[k]
    let b = bornes[k + 1]
    while (a < b && u.s[a] === ' ') a++
    while (b > a && u.s[b - 1] === ' ') b--
    const texte = u.s.slice(a, b)
    if (!/[\p{L}\p{N}]/u.test(texte)) continue
    let range: Range | undefined
    try {
      const r = document.createRange()
      // Début : premier morceau qui a une place dans la page.
      const debut = m.find((x) => x.b > a && (x.t !== 'ajout' || x.el))
      const fin = [...m].reverse().find((x) => x.a < b && (x.t !== 'ajout' || x.el))
      if (debut && fin) {
        if (debut.t === 'txt') r.setStart(debut.node, debut.src[Math.max(0, a - debut.a)] ?? 0)
        else r.setStartBefore((debut as { el: Element }).el)
        if (fin.t === 'txt') r.setEnd(fin.node, Math.min(fin.node.length, (fin.src[Math.min(fin.src.length - 1, b - 1 - fin.a)] ?? fin.node.length - 1) + 1))
        else r.setEndAfter((fin as { el: Element }).el)
        if (!r.collapsed) range = r
      }
    } catch {
      range = undefined
    }
    const zones: ZoneFormule[] = m.filter((x): x is Extract<Morceau, { t: 'f' }> => x.t === 'f' && x.b > a && x.a < b).map((x) => ({ el: x.el, a: Math.max(x.a, a) - a, b: Math.min(x.b, b) - a }))
    out.push({ texte, range, bloc: u.bloc, zones })
  }
  return out
}

export interface OptionsPhrases {
  /** Sélecteur de ce qu'il ne faut pas lire en plus (« .entete-exercice-label »…). */
  exclure?: string
  /** Phrase ajoutée en tête (« Étape 3 : … » est fait par l'appelant avec `prefixe`). */
  prefixe?: string
}

/** Phrases d'un ou plusieurs morceaux de page, dans l'ordre. */
export function phrasesDe(racines: Element | null | undefined | (Element | null | undefined)[], options: OptionsPhrases = {}): PhraseVoix[] {
  const liste = (Array.isArray(racines) ? racines : [racines]).filter((x): x is Element => !!x)
  const out: PhraseVoix[] = []
  if (options.prefixe) out.push({ texte: options.prefixe })
  for (const r of liste) {
    const c: Ctx = { unites: [], courante: null, pile: [r], exclure: options.exclure ?? null }
    if (r.matches(EXCLU)) continue
    // La racine elle-même peut être un cas particulier (tiroir, tableau…) : on la passe à `marcher`
    // via un parent fictif seulement si elle n'est pas un simple conteneur.
    marcher(r, c)
    finir(c)
    for (const u of c.unites) out.push(...phrasesDeUnite(u))
  }
  return out
}

/** Étape du cours (vue « une étape par écran ») : titre, sous-titre, « L'essentiel », le corps de
 * l'étape (annexes : ateliers, tiroirs, vidéos, « À toi »), puis la colonne de droite (≥ 1 200 px). */
export function phrasesEtape(section: Element): PhraseVoix[] {
  const num = texteDe(section.querySelector('.section-num'))
  const titre = section.querySelector('.section-title')
  const out: PhraseVoix[] = []
  if (titre) {
    const c: Ctx = { unites: [], courante: null, pile: [titre], exclure: null }
    unite(c).ajout(num ? `Point ${num} : ` : '')
    titre.childNodes.forEach((x) => marcher(x, c))
    finir(c)
    for (const u of c.unites) out.push(...phrasesDeUnite(u))
  }
  const droite = section.closest('.chapter-layout')?.querySelector('.parcours-droite') ?? null
  out.push(...phrasesDe([section.querySelector('.section-body'), droite && droite.getClientRects().length ? droite : null]))
  return out
}

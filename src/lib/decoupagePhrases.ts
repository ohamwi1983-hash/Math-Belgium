/**
 * Découpage d'un texte français en PHRASES pour la lecture à voix haute (planche 08) — module PUR, sans
 * DOM, testable seul. Une phrase = une `SpeechSynthesisUtterance` (Chrome coupe les textes longs ; une
 * phrase à la fois permet aussi « phrase précédente / suivante » et le surlignage).
 *
 * Règles (robustes aux textes du site) :
 * - fin de phrase après « . », « ! », « ? », « … » (éventuellement suivis de « » », « ) », « " »), suivie
 *   d'une espace PUIS d'une majuscule, d'un chiffre, de « « », « ( », « [ », « − » ou du début d'une
 *   formule (`debutFormule`) — jamais avant une minuscule (« … et ainsi de suite », « etc. puis ») ;
 * - jamais à l'intérieur d'un nombre (« 3,5 », « 3.5 » : pas d'espace) ni après une abréviation
 *   courante (« ex. », « cf. », « p. », « fig. », « c.-à-d. »…) ;
 * - jamais dans la lecture en mots d'une formule (`admis` : seulement les positions du texte) — « fin de
 *   parenthèse, fois r » garde ses virgules ;
 * - une phrase très longue (> `longueurMax` signes) est coupée à la virgule, au point-virgule ou au
 *   deux-points suivant (Chrome arrête parfois la voix après une quinzaine de secondes).
 */

const ABREVIATIONS = new Set([
  // Jamais une lettre seule (« de raison r. La suite… » finit bien une phrase), sauf « p. ex. ».
  'ex', 'cf', 'p. ex', 'fig', 'éq', 'env', 'resp', 'vol', 'chap', 'c.-à-d', 'i.e', 'e.g', 'cad', 'déf', 'prop',
  'rem', 'thm', 'méth', 'coef', 'approx', 'n°', 'mme', 'mlle',
])

const PONCTUATION_FIN = /[.!?…]/
const FERMANTS = /[»”"')\]  ]/
const DEBUT_PHRASE = /[\p{Lu}\p{N}«([−\-–"“]/u

export interface OptionsDecoupage {
  /** La position `i` appartient-elle au TEXTE (et pas à la lecture en mots d'une formule) ? */
  admis?: (i: number) => boolean
  /** Une formule commence-t-elle à la position `i` ? (vaut une majuscule de début de phrase) */
  debutFormule?: (i: number) => boolean
  /** Au-delà, la phrase est coupée à la ponctuation faible suivante (défaut : 180 signes). */
  longueurMax?: number
}

function motAvant(s: string, i: number): string {
  let j = i
  while (j > 0 && /[\p{L}.°-]/u.test(s[j - 1])) j--
  return s.slice(j, i).toLowerCase()
}

/** Positions où commence une nouvelle phrase (après l'espace qui sépare). */
export function coupures(s: string, opts: OptionsDecoupage = {}): number[] {
  const admis = opts.admis ?? (() => true)
  const debutFormule = opts.debutFormule ?? (() => false)
  const max = opts.longueurMax ?? 180
  const res: number[] = []
  let debut = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (!admis(i)) continue
    let j = -1
    if (PONCTUATION_FIN.test(c)) {
      // « ... » vaut « … » : on attend le dernier point.
      if (c === '.' && s[i + 1] === '.') continue
      if (c === '.') {
        const mot = motAvant(s, i)
        if (mot && ABREVIATIONS.has(mot)) continue
      }
      let k = i + 1
      // « ? » », « . ) » : fermants (et l'insécable de « ? » ») avant l'espace ordinaire.
      while (k < s.length && FERMANTS.test(s[k])) k++
      if (k >= s.length || !/\s/.test(s[k])) continue
      while (k < s.length && /\s/.test(s[k])) k++
      if (k >= s.length) continue
      if (!(DEBUT_PHRASE.test(s[k]) || debutFormule(k))) continue
      j = k
    } else if (i - debut > max && /[,;:]/.test(c) && /\s/.test(s[i + 1] ?? '')) {
      let k = i + 1
      while (k < s.length && /\s/.test(s[k])) k++
      if (k >= s.length) continue
      j = k
    }
    if (j > 0) {
      res.push(j)
      debut = j
      i = j - 1
    }
  }
  return res
}

/** Phrases d'un texte brut (espaces normalisées, phrases vides retirées). */
export function decouperTexte(texte: string, opts: OptionsDecoupage = {}): string[] {
  const s = texte.replace(/\s+/g, ' ').trim()
  if (!s) return []
  const bornes = [0, ...coupures(s, opts), s.length]
  const out: string[] = []
  for (let k = 0; k < bornes.length - 1; k++) {
    const p = s.slice(bornes[k], bornes[k + 1]).trim()
    if (/[\p{L}\p{N}]/u.test(p)) out.push(p)
  }
  return out
}

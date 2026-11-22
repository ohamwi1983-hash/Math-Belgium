import { LEVELS } from '../content/chaptersIndex'

/**
 * Recherche du site (champ de l'en-tête, `components/RechercheSite.tsx`) : index LÉGER des titres
 * seulement — chapitres, étapes (`title`, `titreCourt`, `kicker`) et sous-titres (`subheading`) —,
 * jamais le texte des blocs. Module chargé à la demande (`import()` au premier focus du champ) :
 * il n'entre pas dans le paquet de la page, et l'index n'est construit qu'une fois, à ce moment-là.
 *
 * Recherche insensible aux accents et à la casse (« derivee » trouve « Dérivées »), mots dans
 * n'importe quel ordre (chaque mot doit se trouver dans un des champs de l'entrée), résultats
 * groupés par chapitre, l'année choisie sur l'accueil d'abord.
 */

export interface EntreeRecherche {
  /** `chapitre` : le chapitre lui-même ; `etape` : une étape (section) du chapitre. */
  type: 'chapitre' | 'etape'
  levelSlug: string
  niveau: string
  ordreNiveau: number
  chapitreNumero: number
  chapitreTitre: string
  numero: number
  /** Titre principal (titre du chapitre ou de l'étape). */
  titre: string
  /** Autres champs cherchés : titre court, accroche, sous-titres de l'étape. */
  autres: string[]
  href: string
  /** Formes normalisées, dans l'ordre `[titre, ...autres]`. */
  normes: string[]
}

export interface Segment {
  texte: string
  surligne: boolean
}

export interface ResultatRecherche {
  entree: EntreeRecherche
  /** Contexte : « Calcul vectoriel · étape 6 · 4e » ou « Chapitre 6 · 4e ». */
  contexte: string
  titre: Segment[]
  /** Champ secondaire qui contient les mots absents du titre (accroche, sous-titre). */
  detail: Segment[] | null
}

/** Mini-syntaxe RichText → texte lisible (« $1^{\infty}$ » → « 1^∞ »), sans gras. */
function texteBrut(t: string): string {
  return t
    .replace(/\$([^$]+)\$/g, (_, f: string) =>
      f
        .replace(/\\infty/g, '∞')
        .replace(/\\(?:leq|le)\b/g, '≤')
        .replace(/\\(?:geq|ge)\b/g, '≥')
        .replace(/\\times/g, '×')
        .replace(/\\pi/g, 'π')
        .replace(/\\sqrt/g, '√')
        .replace(/\\(?:left|right|,|;|!|quad)/g, '')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}]/g, ''),
    )
    .replace(/\*\*/g, '')
    .trim()
}

const SPECIAUX: Record<string, string> = { œ: 'oe', æ: 'ae', '’': "'", 'ʼ': "'", '‘': "'" }

/** Forme normalisée d'un caractère (sans accent, minuscule, ligatures dépliées). */
function normaliserCar(c: string): string {
  const bas = c.toLowerCase()
  return SPECIAUX[bas] ?? bas.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Texte normalisé et, pour chaque caractère normalisé, l'indice du caractère d'origine. */
function normaliserAvecCarte(t: string): { norme: string; carte: number[] } {
  let norme = ''
  const carte: number[] = []
  for (let i = 0; i < t.length; i++) {
    const n = normaliserCar(t[i])
    norme += n
    for (let k = 0; k < n.length; k++) carte.push(i)
  }
  return { norme, carte }
}

export const normaliser = (t: string) => normaliserAvecCarte(t).norme

/** Mots de la requête (2 caractères au moins pour la requête entière, mots vides gardés : « de »
 * n'empêche rien puisqu'il se trouve presque partout). */
export function motsRequete(requete: string): string[] {
  return normaliser(requete)
    .split(/[^a-z0-9∞²³]+/)
    .filter(Boolean)
}

let index: EntreeRecherche[] | null = null

export function construireIndex(): EntreeRecherche[] {
  if (index) return index
  const res: EntreeRecherche[] = []
  LEVELS.forEach((level, ordreNiveau) => {
    for (const c of level.chapters) {
      const base = { levelSlug: level.slug, niveau: level.label, ordreNiveau, chapitreNumero: c.chapterNumber, chapitreTitre: c.title }
      const titreChapitre = texteBrut(c.title)
      res.push({ ...base, type: 'chapitre', numero: 0, titre: titreChapitre, autres: [], href: `/${level.slug}/${c.slug}`, normes: [normaliser(titreChapitre)] })
      for (const s of c.sections) {
        const titre = texteBrut(s.title)
        const autres = [s.titreCourt, s.kicker, ...s.blocks.map((b) => (b.kind === 'subheading' ? b.text : undefined))]
          .filter((x): x is string => !!x)
          .map(texteBrut)
          .filter((x, i, tous) => x && x !== titre && tous.indexOf(x) === i)
        res.push({
          ...base,
          type: 'etape',
          numero: s.number,
          titre,
          autres,
          href: `/${level.slug}/${c.slug}#${encodeURIComponent(s.id)}`,
          normes: [titre, ...autres].map(normaliser),
        })
      }
    }
  })
  index = res
  return res
}

/** Découpe `texte` en segments, les occurrences des mots surlignées. */
export function surligner(texte: string, mots: string[]): Segment[] {
  const { norme, carte } = normaliserAvecCarte(texte)
  const marque: boolean[] = Array.from({ length: texte.length }, () => false)
  for (const m of mots) {
    let i = norme.indexOf(m)
    while (i >= 0) {
      for (let k = i; k < i + m.length; k++) marque[carte[k]] = true
      i = norme.indexOf(m, i + m.length)
    }
  }
  const segments: Segment[] = []
  for (let i = 0; i < texte.length; i++) {
    const dernier = segments[segments.length - 1]
    if (dernier && dernier.surligne === marque[i]) dernier.texte += texte[i]
    else segments.push({ texte: texte[i], surligne: marque[i] })
  }
  return segments
}

/** Le mot commence-t-il un mot du texte (« vect » dans « … de vecteurs ») ? */
function debutDeMot(norme: string, mot: string): boolean {
  let i = norme.indexOf(mot)
  while (i >= 0) {
    if (i === 0 || !/[a-z0-9]/.test(norme[i - 1])) return true
    i = norme.indexOf(mot, i + 1)
  }
  return false
}

function score(e: EntreeRecherche, mots: string[], anneePreferee: string | null): number | null {
  let total = 0
  for (const m of mots) {
    const champ = e.normes.findIndex((n) => n.includes(m))
    if (champ < 0) return null
    // Titre > titre court / accroche > sous-titres ; début de mot > milieu de mot.
    total += (champ === 0 ? 10 : champ <= 2 ? 6 : 4) + (debutDeMot(e.normes[champ], m) ? 3 : 0)
  }
  if (e.type === 'chapitre') total += 4
  if (anneePreferee && e.levelSlug === anneePreferee) total += 5
  return total
}

export const LIMITE_RESULTATS = 8

/** Résultats groupés par chapitre (le meilleur chapitre d'abord ; dans un chapitre : le chapitre
 * lui-même, puis ses étapes par pertinence et numéro), au plus `LIMITE_RESULTATS`. */
export function chercher(requete: string, anneePreferee: string | null): { resultats: ResultatRecherche[]; total: number } {
  const mots = motsRequete(requete)
  if (!mots.length || normaliser(requete).trim().length < 2) return { resultats: [], total: 0 }
  const trouves: { e: EntreeRecherche; s: number }[] = []
  for (const e of construireIndex()) {
    const s = score(e, mots, anneePreferee)
    if (s !== null) trouves.push({ e, s })
  }
  const groupes = new Map<string, { meilleur: number; items: { e: EntreeRecherche; s: number }[] }>()
  for (const t of trouves) {
    const cle = t.e.href.split('#')[0]
    const g = groupes.get(cle) ?? { meilleur: 0, items: [] }
    g.meilleur = Math.max(g.meilleur, t.s)
    g.items.push(t)
    groupes.set(cle, g)
  }
  const ordonnes = [...groupes.values()]
    .sort((a, b) => b.meilleur - a.meilleur || a.items[0].e.ordreNiveau - b.items[0].e.ordreNiveau || a.items[0].e.chapitreNumero - b.items[0].e.chapitreNumero)
    .flatMap((g) => g.items.sort((a, b) => (a.e.type === 'chapitre' ? -1 : b.e.type === 'chapitre' ? 1 : b.s - a.s || a.e.numero - b.e.numero)))
  const resultats = ordonnes.slice(0, LIMITE_RESULTATS).map(({ e }) => {
    const absentsDuTitre = mots.filter((m) => !e.normes[0].includes(m))
    const champDetail = absentsDuTitre.length ? e.autres.find((_, i) => absentsDuTitre.some((m) => e.normes[i + 1].includes(m))) : undefined
    return {
      entree: e,
      contexte: e.type === 'chapitre' ? `Chapitre ${e.chapitreNumero} · ${e.niveau}` : `${e.chapitreTitre} · étape ${e.numero} · ${e.niveau}`,
      titre: surligner(e.titre, mots),
      detail: champDetail ? surligner(champDetail, mots) : null,
    }
  })
  return { resultats, total: ordonnes.length }
}

/**
 * « Projeter un exercice » (P1, maquette validée du 28/11/2026) : un exercice tiré du générateur de la diapo
 * « S'entraîner », projeté en grand par-dessus la diapo, corrigé révélé ligne par ligne.
 *
 * Une seule source : l'adaptateur papier du générateur (`lib/evaluationAdapterRegistry.ts`, le même que les
 * feuilles d'exercices et les évaluations) — énoncé papier (`enoncePapier`, sinon `construireEnonce`), corrigé
 * « comme au tableau » (`correctionDetaillee`, sinon `construireCorrection`) et réponse brève. Le registre est
 * CHARGÉ À LA DEMANDE (gros morceau : tous les adaptateurs) : jamais dans le paquet principal ni au lancement de
 * la projection — seulement quand une diapo « S'entraîner » d'un générateur de ce site est affichée.
 *
 * Reproductible : une page d'exercice ne garde que `gen` + `code` (graine + variante, `codeExercice.ts`, le même
 * code que le QR des feuilles) ; chaque fenêtre (deux écrans) et l'export retirent EXACTEMENT la même instance.
 * Rien n'est envoyé au serveur (comme les annotations).
 */
import type { AdaptateurFeuilleExercices, BlocCorrection, CatalogueVarianteEntree, EtapeCorrection, FragmentConsigne, SectionExercice } from '../../entrainement/export/genererFeuilleExercices'
import { decoderCode, encoderCode, genererAvecCode, tirerGraine } from '../../entrainement/export/codeExercice'

type Adaptateur = AdaptateurFeuilleExercices<never>

/** Une page d'exercice, rattachée à la clé de la diapo « S'entraîner » d'où on l'a tirée (`EtatProjection.exercices`). */
export interface PageExercice {
  id: string
  /** Identifiant du générateur (« 6gen9 »). */
  gen: string
  /** Code reproductible (6 caractères, `codeExercice.ts`) : graine + indice de variante. */
  code: string
  /** Numéro de l'exercice pour cette diapo (1, 2, 3…), affiché « Exercice 6gen9 n° 2 ». */
  n: number
  /** Lignes du corrigé déjà montrées (0 = recherche : l'énoncé seul, en grand). */
  pas: number
  /** Page affichée : 0 = l'énoncé (recherche), k ≥ 1 = la k-ième page du corrigé (celle de la ligne `pas`, posée par
   * l'écran qui la mesure : les deux fenêtres affichent la même page, même clé d'annotation). */
  page: number
  /** « Montrer la réponse » : la réponse brève est affichée. */
  reponse: boolean
  /** « Laisser chercher » : fin prévue du petit minuteur (horodatage), null = arrêté. */
  chercher: number | null
}

/** Clés d'annotation : `x:<id>` = la page de l'énoncé ; `x:<id>:<k>` = la k-ième page du corrigé (k ≥ 1). */
export const clePageExercice = (id: string, pageCorrige = 0) => (pageCorrige > 0 ? `x:${id}:${pageCorrige}` : `x:${id}`)

export function nouvellePageExercice(gen: string, code: string, n: number): PageExercice {
  return { id: `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, gen, code, n, pas: 0, page: 0, reponse: false, chercher: null }
}

/** Lecture tolérante d'une page gardée (conservation, message reçu). */
export function pageExerciceDepuis(p: unknown): PageExercice | null {
  if (!p || typeof p !== 'object') return null
  const x = p as Partial<PageExercice>
  if (typeof x.id !== 'string' || typeof x.gen !== 'string' || typeof x.code !== 'string' || !decoderCode(x.code)) return null
  const entier = (v: unknown, def: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : def)
  return { id: x.id, gen: x.gen, code: x.code, n: Math.max(1, entier(x.n, 1)), pas: entier(x.pas, 0), page: entier(x.page, 0), reponse: !!x.reponse, chercher: typeof x.chercher === 'number' ? x.chercher : null }
}

export function validerExercices(brut: unknown): Record<string, PageExercice[]> {
  const res: Record<string, PageExercice[]> = {}
  if (!brut || typeof brut !== 'object') return res
  for (const [cle, l] of Object.entries(brut as Record<string, unknown>)) {
    if (!Array.isArray(l)) continue
    const ok = l.map(pageExerciceDepuis).filter((p): p is PageExercice => p !== null)
    if (ok.length) res[cle] = ok
  }
  return res
}

// ---------- registre (chargé à la demande) ----------

let registre: Promise<Record<string, Adaptateur>> | null = null
let registreCharge: Record<string, Adaptateur> | null = null

export function chargerRegistre(): Promise<Record<string, Adaptateur>> {
  registre ??= import('../evaluationAdapterRegistry').then((m) => {
    registreCharge = m.EVALUATION_ADAPTER_REGISTRY
    return registreCharge
  })
  return registre
}

/** Registre déjà chargé (sinon null : appeler `chargerRegistre`). */
export const registreSiCharge = () => registreCharge

/** Variantes proposées dans le menu « Type » (les variantes retirées ne sont jamais proposées). */
export function variantesProposees(a: Adaptateur): CatalogueVarianteEntree[] {
  return a.catalogueVariantes && a.genererInstanceAvecVariante ? a.catalogueVariantes.filter((v) => !v.retiree) : []
}

/**
 * Tire un code : la variante demandée (id), sinon une variante au hasard du catalogue (pour que « Un autre du même
 * type » ait un sens), sinon un tirage libre.
 */
export function tirerCode(a: Adaptateur, varianteId?: string | null): string {
  const cat = a.catalogueVariantes
  const proposees = variantesProposees(a)
  let index: number | null = null
  if (cat && proposees.length) {
    const v = (varianteId && proposees.find((x) => x.id === varianteId)) || proposees[Math.floor(Math.random() * proposees.length)]
    index = cat.findIndex((x) => x.id === v.id)
  }
  return encoderCode(tirerGraine(), index !== null && index >= 0 ? index : null)
}

/** Variante d'un code (null : tirage libre). */
export function varianteDuCode(a: Adaptateur, code: string): CatalogueVarianteEntree | null {
  const d = decoderCode(code)
  if (!d || d.varianteIndex === null) return null
  return a.catalogueVariantes?.[d.varianteIndex] ?? null
}

/** Libellé court d'une variante pour la petite barre : « C — Changement de variable (carré déguisé) » → « C · changement de variable (carré déguisé) ». */
export function libelleType(v: CatalogueVarianteEntree | null): string {
  if (!v) return 'Tirage libre'
  return v.label.replace(/\s+[—–-]\s+/, ' · ')
}

/** Exercice prêt à projeter : énoncé, lignes du corrigé (une ligne = une étape révélée), réponse brève. */
export interface ExerciceProjete {
  gen: string
  titre: string
  enonce: SectionExercice
  lignes: EtapeCorrection[]
  reponse: FragmentConsigne[] | null
  variante: CatalogueVarianteEntree | null
}

/** Un ancien corrigé (sans `correctionDetaillee`) devient des lignes sans étiquette. */
function lignesDepuisBlocs(blocs: BlocCorrection[]): EtapeCorrection[] {
  const res: EtapeCorrection[] = []
  for (const b of blocs) {
    if (b.type === 'paragraphe') res.push({ label: '', fragments: b.fragments })
    else if (b.type === 'html') res.push({ label: '', fragments: [], figureHtml: b.html })
    else if (b.type === 'tableau') res.push({ label: '', fragments: [{ type: 'texte', valeur: b.libellesLignes.map((l, i) => `${l} : ${(b.valeursParLigne[i] ?? []).join(' ; ')}`).join(' — ') }] })
  }
  return res
}

/** Construit l'exercice d'un code. Lève une erreur si le générateur n'a pas d'adaptateur ou si le tirage échoue. */
export function construireExercice(reg: Record<string, Adaptateur>, gen: string, code: string): ExerciceProjete {
  const a = reg[gen]
  const d = decoderCode(code)
  if (!a || !d) throw new Error(`Pas d'exercice à projeter pour ${gen}`)
  const instance = genererAvecCode(d, a.catalogueVariantes, () => a.genererInstance(), a.genererInstanceAvecVariante ? (id) => a.genererInstanceAvecVariante!(id) : undefined)
  const papier = a.enoncePapier?.(instance)
  const enonce = papier?.section ?? a.construireEnonce(instance)
  const detail = a.correctionDetaillee?.(instance)
  const lignes = detail && detail.length ? detail : lignesDepuisBlocs(a.construireCorrection(instance))
  const reponse = papier?.reponseBreve ?? a.reponseBreve?.(instance) ?? null
  return { gen, titre: a.titreDocument.replace(/\s+[—–-]\s+Évaluation$/, ''), enonce, lignes, reponse: reponse && reponse.length ? reponse : null, variante: varianteDuCode(a, code) }
}

const cache = new Map<string, ExerciceProjete | Error>()

/** Même exercice, mis en cache (les deux fenêtres, l'export et la vue du professeur le redemandent souvent). */
export function exerciceEnCache(reg: Record<string, Adaptateur>, gen: string, code: string): ExerciceProjete {
  const cle = `${gen}|${code}`
  let e = cache.get(cle)
  if (!e) {
    try {
      e = construireExercice(reg, gen, code)
    } catch (err) {
      e = err instanceof Error ? err : new Error(String(err))
    }
    cache.set(cle, e)
  }
  if (e instanceof Error) throw e
  return e
}

/** Texte brut d'une suite de fragments (notes, infobulles, export). */
export function texteFragments(f: FragmentConsigne[]): string {
  return f.map((x) => x.valeur).join('')
}

/**
 * Pages du corrigé : les lignes sont réparties sans coupure sur autant de pages que nécessaire (hauteurs mesurées
 * à l'écran, en px logiques ; la première page porte aussi l'énoncé rappelé). Renvoie, pour chaque page, l'indice
 * de sa première ligne.
 */
export function decouperCorrige(hauteurs: number[], dispoPremiere: number, dispoSuivantes: number): number[] {
  const debuts = [0]
  let reste = dispoPremiere
  hauteurs.forEach((h, i) => {
    if (i > 0 && h > reste) {
      debuts.push(i)
      reste = dispoSuivantes
    }
    reste -= h
  })
  return debuts
}

/** Page du corrigé (1, 2…) qui montre la ligne `pas` (1-indexée) ; 0 = l'énoncé (recherche). */
export function pageDuPas(debuts: number[], pas: number): number {
  if (pas <= 0) return 0
  let k = 1
  for (let i = 1; i < debuts.length; i++) if (debuts[i] <= pas - 1) k = i + 1
  return k
}

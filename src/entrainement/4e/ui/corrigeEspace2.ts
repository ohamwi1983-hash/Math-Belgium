import { decouperLigneCalcul, ligne } from "../../export/corrigeTableau";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 8 de 4e (« Géométrie dans l'espace »),
 * moitié 2 (gen103–gen107) — règle `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé —
 * comme au tableau ». Sans `docx` (importées par les applis ET les adaptateurs).
 *
 * Une étape de raisonnement a pour « Calcul » la suite des propriétés appliquées, une par ligne,
 * chacune nommée à droite : appartenances (`I\in(ABC)`), inclusions (`(IJ)\subset(ABC)`),
 * parallélismes (`(IJ)\parallel(BC)`), intersections (`\{P\}=(MN)\cap(ABC)`), longueurs égales des
 * milieux (`DI=IA`). Notations du chapitre : droites (AB), plans (ABC), segments [AB], ∥, ∩ ; un point
 * « prime » s'écrit A′ dans le texte et `A'` en LaTeX, L₀ → `L_0`.
 */

export type Fragments = FragmentConsigne[];

const P = " ";
/** Renvois au cours (sections numérotées de `content/chapters/4e/geometrie-dans-espace.ts`). */
export const COURS_CAVALIERE = `(cours, §${P}1)`;
export const COURS_PLAN = `(cours, §${P}2)`;
export const COURS_DEUX_DROITES = `(cours, §${P}3)`;
export const COURS_DROITE_PLAN = `(cours, §${P}4)`;
export const COURS_DEUX_PLANS = `(cours, §${P}5)`;
export const COURS_PARALLELISME = `(cours, §${P}7)`;
export const COURS_PERCEE = `(cours, §${P}8)`;
export const COURS_SECTION = `(cours, §${P}9)`;
export const COURS_DURER = `(cours, §${P}10)`;
export const COURS_FUITE = `(cours, §${P}11)`;
export const COURS_OMBRE = `(cours, §${P}12)`;

/** Nom de point en LaTeX : « A′ » → `A'`, « L₀ » → `L_0`, « S′ » → `S'`. */
export function nomL(nom: string): string {
  return nom
    .replace(/′/g, "'")
    .replace(/₀/g, "_0")
    .replace(/₁/g, "_1")
    .replace(/₂/g, "_2");
}

/** Droite (AB) en LaTeX. */
export function droiteL(a: string, b: string): string {
  return `(${nomL(a)}${nomL(b)})`;
}

/** Droite donnée par un couple de noms. */
export function dL(d: readonly [string, string] | readonly string[]): string {
  return droiteL(d[0]!, d[1]!);
}

/** Plan (ABC) en LaTeX. */
export function planL(noms: readonly string[]): string {
  return `(${noms.map(nomL).join("")})`;
}

/** Segment [AB] en LaTeX. */
export function segL(a: string, b: string): string {
  return `[${nomL(a)}${nomL(b)}]`;
}

/** « (AB)\parallel(EF) ». */
export function paralleleL(d1: string, d2: string): string {
  return `${d1}\\parallel ${d2}`;
}

/** Ligne « X = milieu » écrite comme une égalité de longueurs : `DI=IA` (I milieu de [DA]). */
export function ligneMilieu(milieu: string, a: string, b: string, justification?: string | Fragments): LigneCalcul {
  return ligne(`${nomL(a)}${nomL(milieu)}=${nomL(milieu)}${nomL(b)}`, justification ?? `${milieu} milieu de [${a}${b}]`);
}

/** Ligne d'appartenance de deux points à un plan, puis l'inclusion de la droite (deux lignes). */
export function lignesDroiteDansPlan(a: string, b: string, plan: string, justificationPoints: string | Fragments): LigneCalcul[] {
  return [ligne(`${nomL(a)},\\,${nomL(b)}\\in ${plan}`, justificationPoints), ligne(`${droiteL(a, b)}\\subset ${plan}`, "deux points du plan : la droite est dans le plan")];
}

/** Formules des justifications et des textes groupées (`{…}`) : une formule courte ne se coupe pas
 * après son signe de relation dans la colonne étroite. */
function grouper(f: FragmentConsigne): FragmentConsigne {
  if (f.type !== "latex" || f.valeur.startsWith("{")) return f;
  if (!/=|\\neq|\\parallel|\\in|\\subset|\\cap/.test(f.valeur)) return f;
  const visible = f.valeur.replace(/\\[a-zA-Z]+/g, "").replace(/[{}\s]/g, "").length;
  if (visible > 40) return f;
  return { type: "latex", valeur: `{${f.valeur}}` };
}

/** Bloc de raisonnement homogène : `decouperLigneCalcul` n'aligne pas sur `\parallel`, `\subset`,
 * `\perp` (ligne pleine largeur) mais aligne sur `\in`, `=`… ; dans un bloc qui mêle les deux, chaque
 * ligne isolée (qui n'ouvre pas une chaîne « = … ») passe pleine largeur, entre accolades, pour que
 * les propriétés s'alignent toutes à gauche. */
function blocHomogene(lignes: LigneCalcul[]): LigneCalcul[] {
  if (!lignes.some((l) => decouperLigneCalcul(l.latex).droite === null)) return lignes;
  return lignes.map((l, i) => {
    const { gauche, droite } = decouperLigneCalcul(l.latex);
    const ouvreChaine = !!lignes[i + 1] && decouperLigneCalcul(lignes[i + 1]!.latex).gauche === "";
    if (droite === null || gauche === "" || ouvreChaine) return l;
    return { ...l, latex: `{${l.latex}}` };
  });
}

/** Dernière passe des corrigés de la moitié 2 du chapitre 8. */
export function finaliserEspace2(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return etapes.map((e) => ({
    ...e,
    fragments: e.fragments.map(grouper),
    ...(e.calcul ? { calcul: blocHomogene(e.calcul).map((l) => (Array.isArray(l.justification) ? { ...l, justification: l.justification.map(grouper) } : l)) } : {}),
  }));
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Fraction n/d réduite en LaTeX (`\dfrac{n}{d}`, ou l'entier). */
export function fracL(n: number, d: number): string {
  const g = pgcd(n, d) || 1;
  const [a, b] = [n / g, d / g];
  if (b === 1) return `${a}`;
  return `${a < 0 ? "-" : ""}\\dfrac{${Math.abs(a)}}{${b}}`;
}

/** Nombre décimal en LaTeX (virgule `{,}`, « − » LaTeX), arrondi à `chiffres` décimales. */
export function decL(x: number, chiffres = 2): string {
  const r = Math.round(x * 10 ** chiffres) / 10 ** chiffres;
  return String(r).replace(".", "{,}");
}

/** Première lettre en minuscule (phrase reprise au milieu d'une autre). */
export function minuscule(s: string): string {
  return /^[A-ZÉÈÀ][a-zéèàêç]/.test(s) ? s[0]!.toLowerCase() + s.slice(1) : s;
}

/** Retire le point final d'une phrase. */
export function sansPoint(s: string): string {
  return s.replace(/\.\s*$/, "");
}

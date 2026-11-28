import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 6 de 4e (« Calcul vectoriel »),
 * moitié 2 (gen82–gen91) — règle `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé —
 * comme au tableau ». Sans `docx` (importées par les applis ET les adaptateurs). Une transformation
 * par ligne, la règle à droite ; « − » typographique (LaTeX « - »), virgule décimale `{,}`, notations
 * du cours : `\vec{AB}`, composantes en colonne, `A(x\,;\,y)`, norme `\|\vec{u}\|`, critère de
 * colinéarité `x_u \cdot y_v - y_u \cdot x_v` (jamais « déterminant » en 4e), produit scalaire
 * `x_u \cdot x_v + y_u \cdot y_v`.
 */

export type Fragments = FragmentConsigne[];

export interface Vec {
  x: number;
  y: number;
}

/** Renvois au cours (sections numérotées de `content/chapters/4e/calcul-vectoriel.ts`). */
export const COURS_VECTEUR = "(cours, point 1)";
export const COURS_OPPOSES = "(cours, point 2)";
export const COURS_MULTIPLE = "(cours, point 3)";
export const COURS_SOMME = "(cours, point 4)";
export const COURS_DIFFERENCE = "(cours, point 5)";
export const COURS_CHASLES = "(cours, point 6)";
export const COURS_DECOMPOSER = "(cours, point 7)";
export const COURS_COMPOSANTES = "(cours, point 8)";
export const COURS_SOMME_REPERE = "(cours, point 9)";
export const COURS_MULTIPLE_REPERE = "(cours, point 10)";
export const COURS_NORME = "(cours, point 11)";
export const COURS_MILIEU = "(cours, point 12)";
export const COURS_COLINEARITE = "(cours, point 13)";
export const COURS_ORTHOGONALITE = "(cours, point 14)";
export const COURS_PHYSIQUE = "(cours, point 17)";

export const J_COMPOSANTES = "composantes : extrémité − origine";
export const J_COLINEARITE = "critère de colinéarité";
export const J_SCALAIRE = "produit scalaire";
export const J_NORME = "norme";

function net(v: number): number {
  const r = Math.round(v * 1e9) / 1e9;
  return r === 0 ? 0 : r;
}

/** Nombre décimal exact : entier, ou décimal à virgule (`{,}`), « − » LaTeX. */
export function nb(x: number): string {
  return String(net(x)).replace(".", "{,}");
}

/** Même nombre, entre parenthèses s'il est négatif (facteur, terme soustrait, base d'un carré). */
export function nbp(x: number): string {
  return net(x) < 0 ? `(${nb(x)})` : nb(x);
}

/** « + 3 » / « - 3 » après un premier terme (« + (−3) » jamais écrit). */
export function plusNb(x: number): string {
  return net(x) < 0 ? `-${nb(-x)}` : `+${nb(x)}`;
}

/** Colonne de composantes (chaînes déjà écrites, ou nombres). */
export function col(x: string | number, y: string | number): string {
  const s = (t: string | number) => (typeof t === "number" ? nb(t) : t);
  return `\\begin{pmatrix} ${s(x)} \\\\ ${s(y)} \\end{pmatrix}`;
}

export function colV(v: Vec): string {
  return col(v.x, v.y);
}

export function vec(nom: string): string {
  return `\\vec{${nom}}`;
}

export function norme(nom: string): string {
  return `\\|\\vec{${nom}}\\|`;
}

export function pointL(nom: string, p: Vec): string {
  return `${nom}(${nb(p.x)}\\,;\\,${nb(p.y)})`;
}

export function moins(a: Vec, b: Vec): Vec {
  return { x: net(a.x - b.x), y: net(a.y - b.y) };
}

export function plus(a: Vec, b: Vec): Vec {
  return { x: net(a.x + b.x), y: net(a.y + b.y) };
}

export function fois(k: number, v: Vec): Vec {
  return { x: net(k * v.x), y: net(k * v.y) };
}

/** Indice d'une composante : `x_{AB}` (vecteur nommé par deux points), `x_u`, `x_{v_R}`. */
export function indice(nom: string): string {
  return nom.length === 1 ? nom : `{${nom}}`;
}

/** Composantes d'un vecteur défini par deux points : formule, substitution, valeurs. */
export function lignesComposantes(nom: string, origine: Vec, extremite: Vec, justification: string | Fragments = J_COMPOSANTES): LigneCalcul[] {
  const v = moins(extremite, origine);
  return [
    ligne(`${vec(nom)}=${col(`${nb(extremite.x)}-${nbp(origine.x)}`, `${nb(extremite.y)}-${nbp(origine.y)}`)}`, justification),
    ligne(`=${colV(v)}`),
  ];
}

/** Produit k·v en colonne : « 2\vec{u}=\begin{pmatrix}2\cdot 3\\…\end{pmatrix}=… ». */
export function lignesMultiple(gauche: string, k: number, v: Vec, kLatex = nb(k), justification: string | Fragments = "on multiplie chaque composante"): LigneCalcul[] {
  const r = fois(k, v);
  return [ligne(`${gauche}=${col(`${kLatex}\\cdot ${nbp(v.x)}`, `${kLatex}\\cdot ${nbp(v.y)}`)}`, justification), ligne(`=${colV(r)}`)];
}

/** Somme de vecteurs en colonne : « \vec{u}+\vec{v}=\begin{pmatrix}3+(−1)\\…\end{pmatrix}=… ». */
export function lignesSomme(gauche: string, termes: Vec[], justification: string | Fragments = "on additionne composante par composante"): LigneCalcul[] {
  const s = termes.reduce((acc, t) => plus(acc, t), { x: 0, y: 0 });
  const ecrire = (axe: "x" | "y") => termes.map((t, i) => (i === 0 ? nb(t[axe]) : `+${nbp(t[axe])}`)).join("");
  if (termes.length === 1) return [ligne(`${gauche}=${colV(s)}`, justification)];
  return [ligne(`${gauche}=${col(ecrire("x"), ecrire("y"))}`, justification), ligne(`=${colV(s)}`)];
}

/** Racine simplifiée : n = k²·m, m sans facteur carré. */
export function racineSimplifiee(n: number): { k: number; m: number } {
  let k = 1;
  let m = Math.round(n);
  for (let f = 2; f * f <= m; f++) {
    while (m % (f * f) === 0) {
      m /= f * f;
      k *= f;
    }
  }
  return { k, m };
}

/** √n simplifiée en LaTeX (n entier ≥ 0) : « 5 », « 2\sqrt{5} », « \sqrt{13} ». */
export function racineLatex(n: number): string {
  const { k, m } = racineSimplifiee(n);
  if (m === 1) return String(k);
  return k === 1 ? `\\sqrt{${m}}` : `${k}\\sqrt{${m}}`;
}

/** Carré d'une composante : « 3^2 », « (−4)^2 ». */
function carre(x: number): string {
  return `${nbp(x)}^2`;
}

/**
 * Norme d'un vecteur à composantes ENTIÈRES, exacte : « \|\vec{AB}\|=\sqrt{3^2+(−4)^2} », « =\sqrt{9+16} »,
 * « =\sqrt{25} », « =5 » (ou « =\sqrt{4\cdot 5} », « =2\sqrt{5} »). `gauche` : « \|\vec{AB}\| », « AB »…
 */
export function lignesNorme(gauche: string, v: Vec, justification: string | Fragments = J_NORME): LigneCalcul[] {
  const a = net(v.x * v.x);
  const b = net(v.y * v.y);
  const n = net(a + b);
  const lignes: LigneCalcul[] = [ligne(`${gauche}=\\sqrt{${carre(v.x)}+${carre(v.y)}}`, justification), ligne(`=\\sqrt{${nb(a)}+${nb(b)}}`), ligne(`=\\sqrt{${nb(n)}}`)];
  if (Number.isInteger(n)) {
    const { k, m } = racineSimplifiee(n);
    if (m === 1) lignes.push(ligne(`=${k}`, `${nb(n)} = ${k}²`));
    else if (k > 1) {
      lignes.push(ligne(`=\\sqrt{${k * k}\\cdot ${m}}`, "on extrait le carré"));
      lignes.push(ligne(`=${k}\\sqrt{${m}}`));
    }
  }
  return lignes;
}

/** Produit en LaTeX « a\cdot b » (b négatif entre parenthèses). */
export function produit(a: number, b: number): string {
  return `${nbp(a)}\\cdot ${nbp(b)}`;
}

/**
 * Critère de colinéarité de u et v : « x_u\cdot y_v-y_u\cdot x_v=… », substitué, produits, valeur.
 * `nu`, `nv` : noms (« u », « AB »). La relation finale (« = 0 » ou « ≠ 0 ») est dans la dernière ligne.
 */
export function lignesCritereColinearite(nu: string, nv: string, u: Vec, v: Vec, justification: string | Fragments = J_COLINEARITE): LigneCalcul[] {
  const p1 = net(u.x * v.y);
  const p2 = net(u.y * v.x);
  return [
    ligne(`x_${indice(nu)}\\cdot y_${indice(nv)}-y_${indice(nu)}\\cdot x_${indice(nv)}=${produit(u.x, v.y)}-${produit(u.y, v.x)}`, justification),
    ligne(`=${nb(p1)}-${nbp(p2)}`, "on calcule les produits"),
    ligne(`=${nb(net(p1 - p2))}`),
  ];
}

export function critereColinearite(u: Vec, v: Vec): number {
  return net(u.x * v.y - u.y * v.x);
}

export function produitScalaire(u: Vec, v: Vec): number {
  return net(u.x * v.x + u.y * v.y);
}

/** Produit scalaire de u et v : « \vec{u}\cdot\vec{v}=x_u\cdot x_v+y_u\cdot y_v », substitué, produits, valeur. */
export function lignesProduitScalaire(nu: string, nv: string, u: Vec, v: Vec, justification: string | Fragments = J_SCALAIRE): LigneCalcul[] {
  const p1 = net(u.x * v.x);
  const p2 = net(u.y * v.y);
  return [
    ligne(`x_${indice(nu)}\\cdot x_${indice(nv)}+y_${indice(nu)}\\cdot y_${indice(nv)}=${produit(u.x, v.x)}+${produit(u.y, v.y)}`, justification),
    ligne(`=${nb(p1)}+${nbp(p2)}`, "on calcule les produits"),
    ligne(`=${nb(net(p1 + p2))}`),
  ];
}

/** « x_D = x_C − x_{AB} »-type : coordonnée d'un point par translation, une ligne par coordonnée. */
export function lignesTranslation(nomPoint: string, depart: Vec, nomDepart: string, v: Vec, nomVecteur: string, signe: 1 | -1 = 1, justification: string | Fragments = "translation"): LigneCalcul[] {
  const op = signe === 1 ? "+" : "-";
  const p = signe === 1 ? plus(depart, v) : moins(depart, v);
  const i = indice(nomVecteur);
  return [
    ligne(`x_${nomPoint}=x_${nomDepart}${op}x_${i}=${nb(depart.x)}${op}${nbp(v.x)}`, justification),
    ligne(`=${nb(p.x)}`),
    ligne(`y_${nomPoint}=y_${nomDepart}${op}y_${i}=${nb(depart.y)}${op}${nbp(v.y)}`),
    ligne(`=${nb(p.y)}`),
  ];
}

/** Phrase de lecture d'un déplacement sur un quadrillage : « 3 carreaux vers la droite et 2 vers le bas ». */
export function deplacementTexte(w: Vec, unite = "carreau"): string {
  const parts: string[] = [];
  const pluriel = unite === "carreau" ? "carreaux" : `${unite}s`;
  const n = (k: number) => `${String(net(Math.abs(k))).replace(".", ",")} ${Math.abs(k) > 1 ? pluriel : unite}`;
  if (w.x !== 0) parts.push(`${n(w.x)} vers la ${w.x > 0 ? "droite" : "gauche"}`);
  if (w.y !== 0) parts.push(`${parts.length ? String(net(Math.abs(w.y))).replace(".", ",") : n(w.y)} vers le ${w.y > 0 ? "haut" : "bas"}`);
  return parts.length ? parts.join(" et ") : "aucun déplacement";
}

/** Fragments « texte + formule » utiles dans les « Ce qu'on utilise ». */
export function phrase(...morceaux: (string | { l: string })[]): Fragments {
  return morceaux.map((m) => (typeof m === "string" ? texte(m) : latex(m.l)));
}

/** Formule courte qui contient une relation : groupée `{…}` pour que KaTeX ne la coupe pas après
 * « = » dans une colonne étroite (justification, texte d'un « Ce qu'on utilise » ou d'un résultat). */
function grouper(f: FragmentConsigne, toujours: boolean): FragmentConsigne {
  if (f.type !== "latex" || f.valeur.startsWith("{")) return f;
  const visible = f.valeur
    .replace(/\\begin\{pmatrix\}(.*?)\\\\(.*?)\\end\{pmatrix\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}\s]/g, "").length;
  if (!/=|\\neq|\\iff|<|>/.test(f.valeur) || (!toujours && visible > 40)) return f;
  return { type: "latex", valeur: `{${f.valeur}}` };
}

/** Dernière passe des corrigés de la moitié 2 : formules des justifications et des textes groupées. */
export function finaliserVecteurs(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return etapes.map((e) => ({
    ...e,
    fragments: e.fragments.length > 1 ? e.fragments.map((f) => grouper(f, false)) : e.fragments,
    ...(e.calcul ? { calcul: e.calcul.map((l) => (Array.isArray(l.justification) ? { ...l, justification: l.justification.map((f) => grouper(f, true)) } : l)) } : {}),
  }));
}

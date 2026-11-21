import { latex, texte } from "../../export/corrigeTableau";
import type {
  ComposantesLin,
  ExerciceOrthogonaliteParametre,
  ExerciceOrthogonaliteTest,
  ExerciceOrthogonaliteTriangle,
  ExerciceOrthogonaliteTriangleParametre,
  Sommet,
} from "../core/orthogonalite.types";
import { diagnostiquerComposanteLineaire, reductionSommet } from "../moteur/verificationOrthogonalite";
import { diagnostiquerFormeCanonique } from "../moteur/expressionAlgebrique";
import { moinsPoly, plusPoly, polyLatex, produitLin, q, qp, vec, type Poly, type V } from "./corrigeVecteurs1";
import { facteursParametre, formuleSubstitueeLatex, formuleSubstitueeParametreLatex, formuleSubstitueeSommetTriangleLatex, formuleSubstitueeSommetTriangleParametreLatex } from "./formatOrthogonalite";
import { MESSAGE_COMPOSANTES_INVERSEES, egal, type Fragments, type Niveaux } from "./retoursVecteurs";
import type { ExerciceDistance, ExerciceNatureTriangle, ExerciceNormeVecteur, ExerciceParametreNorme, ExercicePythagore, ExerciceTriangleCotes } from "../core/normeDistance.types";
import { estApprochee, lireExpressionNorme } from "../moteur/verificationNormeDistance";
import { cibleParametreNormeLatex } from "./formatNormeDistance";

/**
 * Aides à deux niveaux et messages ciblés de gen25 (orthogonalité) — audit 4e ch. 6, lot B ; voir
 * l'en-tête de `retoursVecteurs.ts`. Vocabulaire du cours : « produit scalaire » x·x′ + y·y′.
 */

const CRITERE_ORTHO: Fragments = [
  texte("Deux vecteurs "),
  latex("\\vec{u}"),
  texte(" et "),
  latex("\\vec{v}"),
  texte(" sont orthogonaux si et seulement si leur produit scalaire est nul : "),
  latex("x_{\\vec u}\\cdot x_{\\vec v}+y_{\\vec u}\\cdot y_{\\vec v}=0"),
  texte("."),
];

const MESSAGE_COLINEARITE: Fragments = [
  texte("Tu as calculé les produits en croix, qui testent la colinéarité : l'orthogonalité se teste avec le produit scalaire, première composante par première, seconde par seconde, "),
  latex("x_{\\vec u}\\cdot x_{\\vec v}+y_{\\vec u}\\cdot y_{\\vec v}"),
  texte("."),
];

// --- Écran « test » ---------------------------------------------------------------------------

export function aidesTestOrthogonalite(e: ExerciceOrthogonaliteTest): Niveaux {
  return [CRITERE_ORTHO, [texte("Ici : "), latex(formuleSubstitueeLatex(e.v1, e.v2)), texte(" ; calcule les deux produits (composantes négatives entre parenthèses), additionne-les, puis conclus.")]];
}

export function messageCritereOrthogonalite(u: V, v: V, valeur: number): Fragments | null {
  const c = u.x * v.x + u.y * v.y;
  if (egal(valeur, c)) return null;
  if (egal(valeur, u.x * v.y - u.y * v.x) || egal(valeur, u.y * v.x - u.x * v.y)) return MESSAGE_COLINEARITE;
  if (egal(valeur, u.x * v.x - u.y * v.y)) return [texte("Le produit scalaire est une somme : on additionne les deux produits.")];
  return null;
}

export function messageConclusionOrthogonalite(e: ExerciceOrthogonaliteTest): Fragments {
  return [texte(`La conclusion était fausse : les vecteurs ${e.orthogonaux ? "sont" : "ne sont pas"} orthogonaux (produit scalaire ${e.orthogonaux ? "nul" : "non nul"}). La bonne réponse est affichée ; il reste à calculer le produit scalaire.`)];
}

// --- Variante « paramètre » -------------------------------------------------------------------

function lin(t: number | null) {
  return t === null ? { coefX: 1, constante: 0 } : { coefX: 0, constante: t };
}

function equationVaut(texteSaisi: string, p: Poly): boolean {
  if (p.every((c) => c === 0)) return false;
  return diagnostiquerFormeCanonique(texteSaisi.replace(/[−–—]/g, "-"), { a: p[2], b: p[1], c: p[0] }) === "correct";
}

export function aidesReductionParametreOrthogonalite(e: ExerciceOrthogonaliteParametre): Niveaux {
  return [
    [...CRITERE_ORTHO.slice(0, -1), texte(" ; la composante inconnue reste écrite x.")],
    [texte("Ici : "), latex(`${formuleSubstitueeParametreLatex(e)}=0`), texte(" ; calcule le produit qui ne contient pas x, puis écris l'équation réduite.")],
  ];
}

export function messageReductionParametreOrthogonalite(e: ExerciceOrthogonaliteParametre, texteSaisi: string): Fragments | null {
  const { u, v } = facteursParametre(e);
  const croix = moinsPoly(produitLin(lin(u[0]), lin(v[1])), produitLin(lin(u[1]), lin(v[0])));
  const bon = plusPoly(produitLin(lin(u[0]), lin(v[0])), produitLin(lin(u[1]), lin(v[1])));
  if (polyLatex(croix) !== polyLatex(bon) && equationVaut(texteSaisi, croix)) return MESSAGE_COLINEARITE;
  return null;
}

export function aidesResolutionPremierDegre(coefX: number, coefConst: number): Niveaux {
  return [
    [texte("Équation du premier degré : on isole x — on retire le terme constant aux deux membres, puis on divise par le coefficient de x.")],
    [texte("Ici : "), latex(`${polyLatex([0, coefX, 0])}=${q(-coefConst)}`), texte(" ; il reste à diviser les deux membres par "), latex(q(coefX)), texte(".")],
  ];
}

export function messageResolutionPremierDegre(coefX: number, coefConst: number, solution: number, valeur: number): Fragments | null {
  if (egal(valeur, solution)) return null;
  if (egal(valeur, -solution)) return [texte("Erreur de signe : en passant dans l'autre membre, le terme constant change de signe.")];
  if (coefConst !== 0 && egal(valeur, -coefX / coefConst)) return [texte("On divise le terme constant par le coefficient de x, pas l'inverse.")];
  return null;
}

// --- Triangle : composantes, tests par sommet, conclusion -------------------------------------

export function aidesConstructionTriangle(e: ExerciceOrthogonaliteTriangle | ExerciceOrthogonaliteTriangleParametre): Niveaux {
  const { labelA: a, labelB: b } = e;
  const n2: Fragments =
    e.variante === "triangle"
      ? [texte("Par exemple "), latex(`x_{${a}${b}}=x_${b}-x_${a}=${q(e.pointB.x)}-${qp(e.pointA.x)}`), texte(". Même calcul pour les cinq autres composantes.")]
      : [texte("Par exemple "), latex(`x_{${a}${b}}=x_${b}-x_${a}`), texte(" : garde x dans l'expression. Même calcul pour les cinq autres composantes.")];
  return [[texte("Composantes d'un vecteur : extrémité − origine, "), latex(`\\vec{${a}${b}}=\\begin{pmatrix}x_${b}-x_${a}\\\\y_${b}-y_${a}\\end{pmatrix}`), texte(".")], n2];
}

export function messageConstructionTriangle(e: ExerciceOrthogonaliteTriangle, s: Record<"abX" | "abY" | "acX" | "acY" | "bcX" | "bcY", number>): Fragments | null {
  const paires: [number, number, V][] = [
    [s.abX, s.abY, e.vecteurAB],
    [s.acX, s.acY, e.vecteurAC],
    [s.bcX, s.bcY, e.vecteurBC],
  ];
  return paires.some(([x, y, v]) => (v.x !== 0 || v.y !== 0) && egal(x, -v.x) && egal(y, -v.y)) ? MESSAGE_COMPOSANTES_INVERSEES : null;
}

export function constructionTriangleXLisible(s: Record<string, string>): boolean {
  return Object.values(s).every((t) => diagnostiquerComposanteLineaire(t, { coefX: 0, constante: 0 }) !== "parse_error");
}

export function messageConstructionTriangleX(e: ExerciceOrthogonaliteTriangleParametre, s: Record<"abX" | "abY" | "acX" | "acY" | "bcX" | "bcY", string>): Fragments | null {
  const neg = (c: ComposantesLin["x"]) => ({ coefX: -c.coefX, constante: -c.constante });
  const paires: [string, string, ComposantesLin][] = [
    [s.abX, s.abY, e.vecteurAB],
    [s.acX, s.acY, e.vecteurAC],
    [s.bcX, s.bcY, e.vecteurBC],
  ];
  return paires.some(([x, y, v]) => diagnostiquerComposanteLineaire(x, neg(v.x)) === "correct" && diagnostiquerComposanteLineaire(y, neg(v.y)) === "correct" && (v.x.coefX !== 0 || v.x.constante !== 0 || v.y.coefX !== 0 || v.y.constante !== 0)) ? MESSAGE_COMPOSANTES_INVERSEES : null;
}

function nomSommet(e: { labelA: string; labelB: string; labelC: string }, s: Sommet): string {
  return s === "A" ? e.labelA : s === "B" ? e.labelB : e.labelC;
}

function cotes(e: { labelA: string; labelB: string; labelC: string }, s: Sommet): [string, string] {
  const { labelA: A, labelB: B, labelC: C } = e;
  return s === "A" ? [`${A}${B}`, `${A}${C}`] : s === "B" ? [`${B}${A}`, `${B}${C}`] : [`${C}${A}`, `${C}${B}`];
}

function utiliseSommet(e: { labelA: string; labelB: string; labelC: string }, s: Sommet): Fragments {
  const [c1, c2] = cotes(e, s);
  return [texte(`Le triangle est rectangle en ${nomSommet(e, s)} si et seulement si les deux côtés issus de ${nomSommet(e, s)}, `), latex(vec(c1)), texte(" et "), latex(vec(c2)), texte(", sont orthogonaux : leur produit scalaire est nul. Un vecteur retourné change de signe ("), latex("\\vec{BA}=-\\vec{AB}"), texte(").")];
}

export function aidesTestSommet(e: ExerciceOrthogonaliteTriangle, s: Sommet): Niveaux {
  return [utiliseSommet(e, s), [texte("Ici : "), latex(formuleSubstitueeSommetTriangleLatex(e, s)), texte(" ; calcule-le.")]];
}

function critereSommet(e: ExerciceOrthogonaliteTriangle, s: Sommet): number {
  return s === "A" ? e.critereA : s === "B" ? e.critereB : e.critereC;
}

export function messageTestSommet(e: ExerciceOrthogonaliteTriangle, s: Sommet, valeur: number): Fragments | null {
  if (egal(valeur, critereSommet(e, s))) return null;
  const autres = (["A", "B", "C"] as Sommet[]).filter((t) => t !== s);
  const [c1, c2] = cotes(e, s);
  if (autres.some((t) => egal(valeur, critereSommet(e, t)) && !egal(critereSommet(e, t), critereSommet(e, s)))) return [texte(`Ce sont les côtés d'un autre sommet : en ${nomSommet(e, s)}, on prend `), latex(vec(c1)), texte(" et "), latex(vec(c2)), texte(`, qui partent tous deux de ${nomSommet(e, s)}.`)];
  if (egal(valeur, -critereSommet(e, s))) return [texte("Un seul des deux vecteurs a été retourné : les deux côtés doivent partir du sommet ("), latex("\\vec{BA}=-\\vec{AB}"), texte(").")];
  return null;
}

export function aidesConclusionTriangle(e: ExerciceOrthogonaliteTriangle): Niveaux {
  return [
    [texte("Le triangle est rectangle en un sommet si et seulement si le produit scalaire des deux côtés issus de ce sommet est nul ; un triangle a au plus un angle droit.")],
    [texte(`Relis les trois produits calculés aux écrans précédents (en ${e.labelA}, ${e.labelB} et ${e.labelC}) : lequel est nul, s'il y en a un ?`)],
  ];
}

// --- Triangle avec x : réductions par sommet, identification ----------------------------------

export function aidesReductionSommet(e: ExerciceOrthogonaliteTriangleParametre, s: Sommet): Niveaux {
  return [
    [...utiliseSommet(e, s), texte(" Les composantes contiennent x : développe chaque produit comme un binôme.")],
    [texte("Ici : "), latex(`${formuleSubstitueeSommetTriangleParametreLatex(e, s)}=0`), texte(" ; développe, puis réduis.")],
  ];
}

/** Côtés issus du sommet, signes appliqués (BA = −AB…), en composantes affines. */
function paireLinSommet(e: ExerciceOrthogonaliteTriangleParametre, s: Sommet): [ComposantesLin, ComposantesLin] {
  const neg = (v: ComposantesLin): ComposantesLin => ({ x: { coefX: -v.x.coefX, constante: -v.x.constante }, y: { coefX: -v.y.coefX, constante: -v.y.constante } });
  if (s === "A") return [e.vecteurAB, e.vecteurAC];
  if (s === "B") return [neg(e.vecteurAB), e.vecteurBC];
  return [neg(e.vecteurAC), neg(e.vecteurBC)];
}

export function messageReductionSommet(e: ExerciceOrthogonaliteTriangleParametre, s: Sommet, texteSaisi: string): Fragments | null {
  const [u, v] = paireLinSommet(e, s);
  const bon = plusPoly(produitLin(u.x, v.x), produitLin(u.y, v.y));
  const croix = moinsPoly(produitLin(u.x, v.y), produitLin(u.y, v.x));
  if (equationVaut(texteSaisi, bon)) return null;
  if (polyLatex(croix) !== polyLatex(bon) && equationVaut(texteSaisi, croix)) return MESSAGE_COLINEARITE;
  // Un seul côté retourné (signe oublié sur BA ou CA) : le produit scalaire change de signe sur un terme.
  const [c1, c2] = cotes(e, s);
  if (s !== "A") {
    const u2 = s === "B" ? e.vecteurAB : e.vecteurAC;
    const faux = plusPoly(produitLin(u2.x, v.x), produitLin(u2.y, v.y));
    if (polyLatex(faux) !== polyLatex(bon) && equationVaut(texteSaisi, faux)) return [texte("Les deux côtés doivent partir du sommet : "), latex(vec(c1)), texte(" et "), latex(vec(c2)), texte(" ; un vecteur retourné change de signe ("), latex("\\vec{BA}=-\\vec{AB}"), texte(").")];
  }
  return null;
}

export function aidesIdentification(e: ExerciceOrthogonaliteTriangleParametre): Niveaux {
  return [
    [texte("Une seule des trois équations a une solution : celle du sommet de l'angle droit. Une équation du premier degré "), latex("ax+b=0"), texte(" a une solution si "), latex("a\\neq 0"), texte(" ; une équation du second degré, si "), latex("\\Delta\\geq 0"), texte(".")],
    [texte(`Pour chaque sommet (${e.labelA}, ${e.labelB}, ${e.labelC}), regarde si l'équation peut avoir une solution : coefficient de x nul ou discriminant négatif l'empêchent.`)],
  ];
}

export function messageIdentification(e: ExerciceOrthogonaliteTriangleParametre, valeur: number): Fragments | null {
  if (egal(valeur, e.solutionX)) return null;
  const r = reductionSommet(e, e.sommetResoluble);
  if (r.degre === 1 && egal(valeur, -e.solutionX)) return [texte("Erreur de signe : en passant dans l'autre membre, le terme constant change de signe.")];
  return null;
}

// =============================================================================================
// gen26 — norme et distance
// =============================================================================================

/** Lecture d'une valeur exacte : illisible (null) ou approchée (refusée sans tentative). */
export function lireValeurExacte(texte: string, cible: number): { valeur: number | null; approchee: boolean } {
  const valeur = lireExpressionNorme(texte);
  return { valeur, approchee: valeur !== null && estApprochee(texte, valeur, cible) };
}

const NORME: Fragments = [texte("La norme d'un vecteur est la racine carrée de la somme des carrés de ses composantes : "), latex("\\|\\vec{u}\\|=\\sqrt{x_{\\vec u}^2+y_{\\vec u}^2}"), texte(" ; on simplifie la racine si possible.")];

function carreL(t: number): string {
  return t < 0 ? `(${q(t)})^2` : `${q(t)}^2`;
}

export function aidesNormeVecteur(e: ExerciceNormeVecteur): Niveaux {
  return [NORME, [texte("Ici : "), latex(`\\|\\vec{${e.vNom}}\\|=\\sqrt{${carreL(e.v.x)}+${carreL(e.v.y)}}`), texte(" ; calcule la somme sous la racine, puis simplifie.")]];
}

/** Racine oubliée, carré d'un négatif compté négatif. */
export function messageNorme(v: V, valeur: number): Fragments | null {
  const n2 = v.x * v.x + v.y * v.y;
  if (egal(valeur, Math.sqrt(n2))) return null;
  if (egal(valeur, n2)) return [texte("C'est le carré de la norme : il reste à prendre la racine carrée.")];
  const faux = [v.x * v.x - v.y * v.y, v.y * v.y - v.x * v.x].filter((d) => d > 0);
  if (faux.some((d) => egal(valeur, Math.sqrt(d)))) return [texte("Le carré d'un nombre négatif est positif : "), latex("(-3)^2=9"), texte(", jamais −9 ; on additionne les deux carrés.")];
  if (egal(valeur, Math.abs(v.x) + Math.abs(v.y))) return [texte("La norme n'est pas la somme des composantes : on additionne leurs carrés, puis on prend la racine.")];
  return null;
}

export function aidesConstructionDistance(e: ExerciceDistance): Niveaux {
  const { labelA: a, labelB: b } = e;
  return [
    [texte("Composantes d'un vecteur : extrémité − origine, "), latex(`\\vec{${a}${b}}=\\begin{pmatrix}x_${b}-x_${a}\\\\y_${b}-y_${a}\\end{pmatrix}`), texte(".")],
    [texte("Première composante : "), latex(`${q(e.pointB.x)}-${qp(e.pointA.x)}`), texte(" ; fais de même pour la seconde.")],
  ];
}

export function messageConstructionDistance(e: ExerciceDistance, s: V): Fragments | null {
  const v = e.vecteurAB;
  return (v.x !== 0 || v.y !== 0) && egal(s.x, -v.x) && egal(s.y, -v.y) ? MESSAGE_COMPOSANTES_INVERSEES : null;
}

export function aidesCalculDistance(e: ExerciceDistance): Niveaux {
  const { labelA: a, labelB: b } = e;
  return [
    [texte(`La distance ${a}${b} est la norme du vecteur `), latex(`\\vec{${a}${b}}`), texte(" : "), latex(`${a}${b}=\\sqrt{x^2+y^2}`), texte(" avec ses composantes ; on simplifie la racine si possible.")],
    [texte("Ici : "), latex(`${a}${b}=\\sqrt{${carreL(e.vecteurAB.x)}+${carreL(e.vecteurAB.y)}}`), texte(" ; calcule, puis simplifie.")],
  ];
}

export function aidesConstructionTriangleCotes(e: ExerciceTriangleCotes | ExercicePythagore): Niveaux {
  const { labelA: a, labelB: b } = e;
  return [
    [texte("Composantes d'un vecteur : extrémité − origine, "), latex(`\\vec{${a}${b}}=\\begin{pmatrix}x_${b}-x_${a}\\\\y_${b}-y_${a}\\end{pmatrix}`), texte(".")],
    [texte("Par exemple "), latex(`x_{${a}${b}}=${q(e.pointB.x)}-${qp(e.pointA.x)}`), texte(". Même calcul pour les cinq autres composantes.")],
  ];
}

export function messageConstructionTriangleCotes(e: ExerciceTriangleCotes | ExercicePythagore, s: { abX: number; abY: number; acX: number; acY: number; bcX: number; bcY: number }): Fragments | null {
  const paires: [number, number, V][] = [
    [s.abX, s.abY, e.vecteurAB],
    [s.acX, s.acY, e.vecteurAC],
    [s.bcX, s.bcY, e.vecteurBC],
  ];
  return paires.some(([x, y, v]) => (v.x !== 0 || v.y !== 0) && egal(x, -v.x) && egal(y, -v.y)) ? MESSAGE_COMPOSANTES_INVERSEES : null;
}

export function aidesCalculTriangleCotes(e: ExerciceTriangleCotes | ExercicePythagore): Niveaux {
  const { labelA: a, labelB: b } = e;
  return [
    [texte("La longueur d'un côté est la norme du vecteur qui le porte : "), latex("\\|\\vec{u}\\|=\\sqrt{x_{\\vec u}^2+y_{\\vec u}^2}"), texte(" ; on simplifie chaque racine si possible.")],
    [texte("Par exemple "), latex(`\\|\\vec{${a}${b}}\\|=\\sqrt{${carreL(e.vecteurAB.x)}+${carreL(e.vecteurAB.y)}}`), texte(". Même calcul pour les deux autres côtés.")],
  ];
}

export function messageCalculTriangleCotes(e: ExerciceTriangleCotes | ExercicePythagore, valeurs: number[]): Fragments | null {
  const vecteurs = [e.vecteurAB, e.vecteurAC, e.vecteurBC];
  for (let i = 0; i < 3; i++) {
    const m = messageNorme(vecteurs[i], valeurs[i]);
    if (m) return m;
  }
  return null;
}

export function aidesConclusionIsocele(e: ExerciceTriangleCotes): Niveaux {
  return [
    [texte("Un triangle est isocèle quand deux de ses côtés ont la même longueur ; le sommet principal est le sommet commun à ces deux côtés. Sinon, il est scalène.")],
    [texte(`Compare les trois longueurs trouvées (récapitulatif) : [${e.labelA}${e.labelB}], [${e.labelA}${e.labelC}], [${e.labelB}${e.labelC}]. Deux sont-elles égales ?`)],
  ];
}

export function aidesConclusionNature(e: ExerciceNatureTriangle): Niveaux {
  return [
    [texte("Deux tests : isocèle si deux côtés ont la même longueur ; rectangle si le carré du plus grand côté est égal à la somme des carrés des deux autres (réciproque de Pythagore). Les deux : rectangle isocèle ; aucun : quelconque.")],
    [texte("Compare "), latex(`${e.carreAB},\\ ${e.carreAC},\\ ${e.carreBC}`), texte(" (carrés des longueurs) : deux sont-ils égaux ? Le plus grand est-il la somme des deux autres ?")],
  ];
}

export function aidesReductionParametreNorme(e: ExerciceParametreNorme): Niveaux {
  const bin = (p: number) => (p === 0 ? "x" : `(x${p > 0 ? "-" : "+"}${q(Math.abs(p))})`);
  return [
    [texte("Une norme est positive : "), latex(`\\|\\vec{v}\\|=${cibleParametreNormeLatex(e.cibleCarree)}`), texte(" équivaut à "), latex(`\\|\\vec{v}\\|^2=${q(e.cibleCarree)}`), texte(" ; développe chaque carré avec "), latex("(x-a)^2=x^2-2ax+a^2"), texte(".")],
    [texte("Ici : "), latex(`${bin(e.p)}^2+${bin(e.r)}^2=${q(e.cibleCarree)}`), texte(" ; développe, regroupe, puis ramène tout dans le membre de gauche.")],
  ];
}

export function messageReductionParametreNorme(e: ExerciceParametreNorme, texteSaisi: string): Fragments | null {
  const N = e.cibleCarree;
  const racine = Math.sqrt(N);
  // Cible non élevée au carré : 2x² − 2(p + r)x + p² + r² − √N = 0.
  const nonCarre: Poly = [e.p * e.p + e.r * e.r - racine, -2 * (e.p + e.r), 2];
  if (Number.isInteger(racine) && racine !== N && equationVaut(texteSaisi, nonCarre)) return [texte("La norme visée doit aussi être élevée au carré : "), latex(`\\left(${cibleParametreNormeLatex(N)}\\right)^2=${q(N)}`), texte(".")];
  // Double produit oublié : 2x² + p² + r² − N = 0.
  const sansDouble: Poly = [e.p * e.p + e.r * e.r - N, 0, 2];
  if (e.p + e.r !== 0 && equationVaut(texteSaisi, sansDouble)) return [texte("Le carré d'un binôme a trois termes : "), latex("(x-a)^2=x^2-2ax+a^2"), texte(" — n'oublie pas le double produit.")];
  return null;
}

export function aidesResolutionParametreNorme(e: ExerciceParametreNorme): Niveaux {
  const { a, b, c } = e;
  return [
    [texte("Équation du second degré "), latex("ax^2+bx+c=0"), texte(" : "), latex("\\Delta=b^2-4ac"), texte(". Si Δ > 0, deux solutions "), latex("\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(" ; si Δ = 0, une seule ; si Δ < 0, aucune.")],
    [texte("Ici "), latex(`a=${q(a)}`), texte(", "), latex(`b=${q(b)}`), texte(", "), latex(`c=${q(c)}`), texte(" : "), latex(`\\Delta=${qp(b)}^2-4\\cdot ${qp(a)}\\cdot ${qp(c)}`), texte(". Son signe dit combien de valeurs conviennent.")],
  ];
}

export function messageValeursParametreNorme(e: ExerciceParametreNorme, valeurs: number[]): Fragments | null {
  const sol = e.solutions;
  const toutesJustes = valeurs.every((v) => sol.some((s) => egal(v, s)));
  if (toutesJustes && sol.length === 2 && !sol.every((s) => valeurs.some((v) => egal(v, s)))) return [texte("Cette valeur est juste, mais il y en a une autre : Δ > 0 donne deux solutions.")];
  if (valeurs.length > 0 && !toutesJustes && valeurs.every((v) => sol.some((s) => egal(v, -s)))) return [texte("Erreur de signe : les solutions sont "), latex("\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(", avec −b.")];
  return null;
}

export function messageChoixParametreNorme(e: ExerciceParametreNorme): Fragments {
  return e.solutions.length === 0
    ? [texte("Il n'y a aucune solution : Δ < 0.")]
    : [texte(`Il y a ${e.solutions.length === 1 ? "une solution (Δ = 0)" : "deux solutions (Δ > 0)"} : la bonne réponse est affichée ; calcule-${e.solutions.length === 1 ? "la" : "les"}.`)];
}

export function aidesTestPythagore(e: ExercicePythagore): Niveaux {
  return [
    [texte("Réciproque du théorème de Pythagore : le triangle est rectangle si le carré du plus grand côté est égal à la somme des carrés des deux autres ; l'angle droit est au sommet opposé à ce plus grand côté.")],
    [texte("Compare les carrés des longueurs, "), latex(`${e.carreAB},\\ ${e.carreAC},\\ ${e.carreBC}`), texte(" : le plus grand est-il la somme des deux autres ?")],
  ];
}

export function messageChoixIdentification(e: ExerciceOrthogonaliteTriangleParametre): Fragments {
  return [texte(`Le choix était faux : le triangle est rectangle en ${nomSommet(e, e.sommetResoluble)}, la seule équation qui a une solution. La bonne réponse est affichée ; il reste à trouver x.`)];
}

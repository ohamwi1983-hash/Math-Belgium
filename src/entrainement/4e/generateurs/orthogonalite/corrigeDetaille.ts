import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ComposantesLin, ExerciceOrthogonalite, ExerciceOrthogonaliteTriangle, ExerciceOrthogonaliteTriangleParametre, Reduction, Sommet } from "../../core/orthogonalite.types";
import { facteursParametre, formuleSubstitueeParametreLatex, formuleSubstitueeSommetTriangleParametreLatex } from "../../ui/formatOrthogonalite";
import { lignesDelta, rac } from "../../ui/corrigeSecondDegre1";
import {
  COURS_ORTHOGONALITE,
  col,
  colonne,
  finaliserCorrigeVecteurs,
  lignesComposantes,
  lignesComposantesLin,
  lignesCritereLin,
  lignesCritereOrthogonalite,
  lignesPremierDegreNul,
  linLatex,
  milliers,
  mul,
  oppose,
  polyLatex,
  q,
  vec,
  type Fragments,
  type Lin,
  type V,
} from "../../ui/corrigeVecteurs1";

/**
 * Corrigé détaillé « comme au tableau » de gen25 « Orthogonalité et Pythagore généralisé » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`moteur/typesOrthogonalite.ts`,
 * `SEQUENCES`) : test (a) ; paramètre (a relation réduite, b résolution) ; triangle (a composantes,
 * b–d critère en A, B, C, e conclusion) ; triangle avec x (a composantes, b–d critère réduit en A,
 * B, C, e résolution et conclusion). Critère d'orthogonalité x_u·x_v + y_u·y_v (produit scalaire nul).
 */

const CRITERE: Fragments = [texte("Deux vecteurs sont orthogonaux si et seulement si leur critère d'orthogonalité (produit scalaire) est nul : "), latex("x_u\\cdot x_v+y_u\\cdot y_v=0"), texte(` ${COURS_ORTHOGONALITE}.`)];

const LETTRE_SOMMET: Record<Sommet, string> = { A: "b", B: "c", C: "d" };

function qpE(t: number): string {
  return t < 0 ? `(${q(t)})` : q(t);
}

function nom(e: { labelA: string; labelB: string; labelC: string }, s: Sommet): string {
  return s === "A" ? e.labelA : s === "B" ? e.labelB : e.labelC;
}

/** Les deux côtés issus du sommet : en A \vec{AB}, \vec{AC} ; en B \vec{BA}, \vec{BC} ; en C \vec{CA}, \vec{CB}. */
function cotesDuSommet(e: { labelA: string; labelB: string; labelC: string }, s: Sommet): { n1: string; n2: string; base1: string; base2: string; neg1: boolean; neg2: boolean } {
  const { labelA: A, labelB: B, labelC: C } = e;
  if (s === "A") return { n1: `${A}${B}`, n2: `${A}${C}`, base1: `${A}${B}`, base2: `${A}${C}`, neg1: false, neg2: false };
  if (s === "B") return { n1: `${B}${A}`, n2: `${B}${C}`, base1: `${A}${B}`, base2: `${B}${C}`, neg1: true, neg2: false };
  return { n1: `${C}${A}`, n2: `${C}${B}`, base1: `${A}${C}`, base2: `${B}${C}`, neg1: true, neg2: true };
}

function vecteurNum(e: ExerciceOrthogonaliteTriangle, cote: string): V {
  const { labelA: A, labelB: B } = e;
  return cote === `${A}${B}` ? e.vecteurAB : cote === `${A}${e.labelC}` ? e.vecteurAC : cote === `${B}${e.labelC}` ? e.vecteurBC : { x: 0, y: 0 };
}

function vecteurLin(e: ExerciceOrthogonaliteTriangleParametre, cote: string): ComposantesLin {
  const { labelA: A, labelB: B } = e;
  return cote === `${A}${B}` ? e.vecteurAB : cote === `${A}${e.labelC}` ? e.vecteurAC : e.vecteurBC;
}

function colLin(v: ComposantesLin): string {
  return colonne(linLatex(v.x), linLatex(v.y));
}

function oppLin(v: ComposantesLin): ComposantesLin {
  return { x: oppose(v.x), y: oppose(v.y) };
}

function enX(c: ComposantesLin, x: number): V {
  return { x: c.x.coefX * x + c.x.constante, y: c.y.coefX * x + c.y.constante };
}

function reductionLatex(r: Reduction): string {
  return r.degre === 1 ? polyLatex([r.coefConst, r.coefX, 0]) : polyLatex([r.coefConst, r.coefX, r.coefX2]);
}

function etapesTest(e: Extract<ExerciceOrthogonalite, { variante: "test" }>): EtapeCorrection[] {
  const c = e.v1.x * e.v2.x + e.v1.y * e.v2.y;
  const ecrit = `${qpE(e.v1.x)}\\cdot ${qpE(e.v2.x)}+${qpE(e.v1.y)}\\cdot ${qpE(e.v2.y)}`;
  return [
    utilise("a", CRITERE),
    calcul("a", lignesCritereOrthogonalite(e.v1, e.v2, [texte("critère d'orthogonalité de "), latex(vec(e.v1Nom)), texte(" et "), latex(vec(e.v2Nom))])),
    resultat("a", [latex(vec(e.v1Nom)), texte(" et "), latex(vec(e.v2Nom)), texte(c === 0 ? " sont orthogonaux car " : " ne sont pas orthogonaux car "), latex(`${ecrit}=${q(c)}${c === 0 ? "" : "\\neq 0"}`), texte(".")]),
    piege("a", [texte("On multiplie les composantes de même rang (première avec première, seconde avec seconde) et on additionne les deux produits — à ne pas confondre avec le critère de colinéarité.")]),
  ];
}

function etapesParametre(e: Extract<ExerciceOrthogonalite, { variante: "parametre" }>): EtapeCorrection[] {
  const zero: Lin = { coefX: 0, constante: 0 };
  const cst = (t: number): Lin => ({ ...zero, constante: t });
  // Facteurs dans l'ordre d'écriture de l'écran (u puis v ; x en première ou seconde composante).
  const { u, v } = facteursParametre(e);
  const lin = (t: number | null): Lin => (t === null ? { coefX: 1, constante: 0 } : cst(t));
  const { lignes, reduit } = lignesCritereLin(formuleSubstitueeParametreLatex(e), [lin(u[0]), lin(v[0])], [lin(u[1]), lin(v[1])], "+", [texte("critère d'orthogonalité de "), latex(vec("u")), texte(" et "), latex(vec("v"))]);
  const eq = `${polyLatex(reduit)}=0`;
  const v2 = e.xEnSeconde ? { x: e.v2Connu, y: e.solutionX } : { x: e.solutionX, y: e.v2Connu };
  return [
    utilise("a", CRITERE),
    calcul("a", [...lignes, ligne(eq, "le critère doit être nul")]),
    resultat("a", [latex(eq)]),
    piege("a", [texte(`Le produit des ${e.xEnSeconde ? "secondes" : "premières"} composantes contient x : il reste un terme en x, l'autre produit est un nombre.`)]),
    utilise("b", [texte("Équation du premier degré : on isole x (on retire le terme constant, puis on divise par le coefficient de x).")]),
    calcul("b", lignesPremierDegreNul(e.coefX, e.coefConst)),
    resultat("b", [latex(`x=${q(e.solutionX)}`)]),
    verification("b", [texte("Pour "), latex(`x=${q(e.solutionX)}`), texte(", "), latex(`${vec(e.v2Nom)}=${col(v2)}`), texte(" : ")], lignesCritereOrthogonalite(e.v1, v2, "le critère est bien nul")),
    piege("b", [texte("En isolant x, le terme constant change de signe en passant dans l'autre membre ; on divise ensuite par le coefficient de x, avec son signe.")]),
  ];
}

function utiliseSommet(e: { labelA: string; labelB: string; labelC: string }, s: Sommet): Fragments {
  const c = cotesDuSommet(e, s);
  return [
    texte(`Le triangle est rectangle en ${nom(e, s)} si et seulement si les deux côtés issus de ${nom(e, s)}, `),
    latex(vec(c.n1)),
    texte(" et "),
    latex(vec(c.n2)),
    texte(`, sont orthogonaux ${COURS_ORTHOGONALITE}`),
    ...(c.neg1 ? [texte(" ; un vecteur retourné change de signe : "), latex(`${vec(c.n1)}=-${vec(c.base1)}`)] : []),
    ...(c.neg2 ? [texte(", "), latex(`${vec(c.n2)}=-${vec(c.base2)}`)] : []),
    texte("."),
  ];
}

function etapesTriangle(e: ExerciceOrthogonaliteTriangle): EtapeCorrection[] {
  const { labelA: A, labelB: B, labelC: C } = e;
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("Les côtés du triangle sont portés par les vecteurs "), latex(vec(`${A}${B}`)), texte(", "), latex(vec(`${A}${C}`)), texte(", "), latex(vec(`${B}${C}`)), texte(" ; composantes : extrémité − origine.")]),
    calcul("a", [...lignesComposantes(`${A}${B}`, e.pointA, e.pointB), ...lignesComposantes(`${A}${C}`, e.pointA, e.pointC), ...lignesComposantes(`${B}${C}`, e.pointB, e.pointC)]),
    resultat("a", [latex(`${vec(`${A}${B}`)}=${col(e.vecteurAB)}`), texte(", "), latex(`${vec(`${A}${C}`)}=${col(e.vecteurAC)}`), texte(" et "), latex(`${vec(`${B}${C}`)}=${col(e.vecteurBC)}`)]),
    piege("a", [texte("Toujours « extrémité − origine », dans cet ordre, pour chaque coordonnée.")]),
  ];
  const criteres: Record<Sommet, number> = { A: e.critereA, B: e.critereB, C: e.critereC };
  for (const s of ["A", "B", "C"] as Sommet[]) {
    const l = LETTRE_SOMMET[s];
    const c = cotesDuSommet(e, s);
    const v1 = c.neg1 ? mul(-1, vecteurNum(e, c.base1)) : vecteurNum(e, c.base1);
    const v2 = c.neg2 ? mul(-1, vecteurNum(e, c.base2)) : vecteurNum(e, c.base2);
    const lignes: LigneCalcul[] = [];
    if (c.neg1) lignes.push(ligne(`${vec(c.n1)}=-${vec(c.base1)}=${col(v1)}`, "vecteur opposé : chaque composante change de signe"));
    if (c.neg2) lignes.push(ligne(`${vec(c.n2)}=-${vec(c.base2)}=${col(v2)}`, "vecteur opposé"));
    lignes.push(...lignesCritereOrthogonalite(v1, v2, [texte("critère en "), latex(nom(e, s))]));
    const val = criteres[s];
    etapes.push(
      utilise(l, utiliseSommet(e, s)),
      calcul(l, lignes),
      resultat(l, [texte(`Critère en ${nom(e, s)} : `), latex(`${q(val)}`), texte(val === 0 ? ` — nul : les côtés issus de ${nom(e, s)} sont perpendiculaires.` : ` — non nul : le triangle n'est pas rectangle en ${nom(e, s)}.`)]),
      piege(l, [texte(`En ${nom(e, s)}, les deux vecteurs doivent partir de ${nom(e, s)} ; avec un vecteur mal orienté, le signe d'un produit change.`)]),
    );
  }
  const sr = e.sommetRectangle;
  etapes.push(
    utilise("e", [texte("Un triangle est rectangle en un sommet exactement quand le critère en ce sommet est nul ; un triangle (non aplati) a au plus un angle droit.")]),
    calcul("e", [
      ligne(`${q(e.critereA)}${e.critereA === 0 ? "=" : "\\neq "}0`, `critère en ${A}`),
      ligne(`${q(e.critereB)}${e.critereB === 0 ? "=" : "\\neq "}0`, `critère en ${B}`),
      ligne(`${q(e.critereC)}${e.critereC === 0 ? "=" : "\\neq "}0`, `critère en ${C}`),
    ]),
    resultat("e", [texte(sr === null ? "Aucun des trois critères n'est nul : le triangle n'est pas rectangle." : `Le triangle est rectangle en ${nom(e, sr)} : le critère en ${nom(e, sr)} est nul.`)]),
    piege("e", [texte("Conclure « pas rectangle » seulement après avoir testé les trois sommets.")]),
  );
  return etapes;
}

function etapesTriangleParametre(e: ExerciceOrthogonaliteTriangleParametre): EtapeCorrection[] {
  const { labelA: A, labelB: B, labelC: C } = e;
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("Les côtés du triangle sont portés par les vecteurs "), latex(vec(`${A}${B}`)), texte(", "), latex(vec(`${A}${C}`)), texte(", "), latex(vec(`${B}${C}`)), texte(" ; composantes : extrémité − origine, en gardant x.")]),
    calcul("a", [...lignesComposantesLin(`${A}${B}`, e.pointA, e.pointB), ...lignesComposantesLin(`${A}${C}`, e.pointA, e.pointC), ...lignesComposantesLin(`${B}${C}`, e.pointB, e.pointC)]),
    resultat("a", [latex(`${vec(`${A}${B}`)}=${colLin(e.vecteurAB)}`), texte(", "), latex(`${vec(`${A}${C}`)}=${colLin(e.vecteurAC)}`), texte(" et "), latex(`${vec(`${B}${C}`)}=${colLin(e.vecteurBC)}`)]),
    piege("a", [texte("Une coordonnée qui contient x se soustrait comme un binôme : les parenthèses changent le signe de chacun de ses termes.")]),
  ];
  const reductions: Record<Sommet, Reduction> = { A: e.reductionA, B: e.reductionB, C: e.reductionC };
  for (const s of ["A", "B", "C"] as Sommet[]) {
    const l = LETTRE_SOMMET[s];
    const c = cotesDuSommet(e, s);
    const v1 = c.neg1 ? oppLin(vecteurLin(e, c.base1)) : vecteurLin(e, c.base1);
    const v2 = c.neg2 ? oppLin(vecteurLin(e, c.base2)) : vecteurLin(e, c.base2);
    const lignes: LigneCalcul[] = [];
    if (c.neg1) lignes.push(ligne(`${vec(c.n1)}=-${vec(c.base1)}`, "vecteur opposé"), ligne(`=${colLin(v1)}`, "chaque composante change de signe"));
    if (c.neg2) lignes.push(ligne(`${vec(c.n2)}=-${vec(c.base2)}`, "vecteur opposé"), ligne(`=${colLin(v2)}`, "chaque composante change de signe"));
    const r = lignesCritereLin(formuleSubstitueeSommetTriangleParametreLatex(e, s), [v1.x, v2.x], [v1.y, v2.y], "+", [texte("critère en "), latex(nom(e, s))]);
    const eq = `${reductionLatex(reductions[s])}=0`;
    lignes.push(...r.lignes, ligne(eq, "le critère doit être nul"));
    etapes.push(
      utilise(l, utiliseSommet(e, s)),
      calcul(l, lignes),
      resultat(l, [texte(`Rectangle en ${nom(e, s)} si et seulement si `), latex(eq)]),
      piege(l, [texte("Développer complètement chaque produit : deux composantes qui contiennent x donnent un terme en x².")]),
    );
  }
  // Étape e : les deux équations du second degré sans racine réelle, puis celle du premier degré.
  const s0 = e.sommetFixe;
  const r0 = reductions[s0];
  const autres = (["A", "B", "C"] as Sommet[]).filter((s) => s !== s0);
  const etapesE: EtapeCorrection[] = [
    utilise("e", [texte("Une équation du second degré "), latex("ax^2+bx+c=0"), texte(" n'a aucune solution réelle quand "), latex("\\Delta=b^2-4ac<0"), texte(" (voir « Équations et inéquations du second degré », point 1) ; celle du premier degré se résout en isolant x.")]),
  ];
  for (const s of autres) {
    const r = reductions[s];
    if (r.degre === 2) {
      const t = { a: r.coefX2, b: rac(r.coefX), c: r.coefConst };
      const lignes = lignesDelta(t).map((lg) => ({ ...lg, latex: milliers(lg.latex) }));
      const der = lignes[lignes.length - 1]!;
      lignes[lignes.length - 1] = { ...der, latex: `${der.latex}<0`, justification: "aucune solution réelle" };
      etapesE.push(calcul("e", [ligne(`${reductionLatex(r)}=0`, `critère en ${nom(e, s)}`), ...lignes], [], `En ${nom(e, s)}`));
    } else {
      etapesE.push(calcul("e", lignesPremierDegreNul(r.coefX, r.coefConst), [], `En ${nom(e, s)}`));
    }
  }
  etapesE.push(calcul("e", r0.degre === 1 ? lignesPremierDegreNul(r0.coefX, r0.coefConst) : [ligne(`${reductionLatex(r0)}=0`)], [], `En ${nom(e, s0)}`));
  const c0 = cotesDuSommet(e, s0);
  const w1 = c0.neg1 ? oppLin(vecteurLin(e, c0.base1)) : vecteurLin(e, c0.base1);
  const w2 = c0.neg2 ? oppLin(vecteurLin(e, c0.base2)) : vecteurLin(e, c0.base2);
  const x = e.solutionX;
  etapesE.push(
    resultat("e", [latex(`x=${q(x)}`), texte(` : pour cette valeur, le triangle est rectangle en ${nom(e, s0)}.`)]),
    verification("e", [texte("Pour "), latex(`x=${q(x)}`), texte(", "), latex(`${vec(c0.n1)}=${col(enX(w1, x))}`), texte(" et "), latex(`${vec(c0.n2)}=${col(enX(w2, x))}`), texte(" : ")], lignesCritereOrthogonalite(enX(w1, x), enX(w2, x), "le critère est bien nul")),
    piege("e", [texte("Une équation du second degré dont le discriminant est négatif n'a pas de solution : on ne la « résout » pas, on l'écarte.")]),
  );
  return [...etapes, ...etapesE];
}

export function correctionDetailleeOrthogonalite(e: ExerciceOrthogonalite): EtapeCorrection[] {
  if (e.variante === "test") return finaliserCorrigeVecteurs(etapesTest(e));
  if (e.variante === "parametre") return finaliserCorrigeVecteurs(etapesParametre(e));
  if (e.variante === "triangle") return finaliserCorrigeVecteurs(etapesTriangle(e));
  return finaliserCorrigeVecteurs(etapesTriangleParametre(e));
}

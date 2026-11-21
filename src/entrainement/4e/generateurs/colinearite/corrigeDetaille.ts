import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ComposantesLin, ExerciceColinearite, ExerciceColinearParametre, ExerciceColinearPoints, ExerciceColinearPointsParametre, ExerciceColinearVecteurs } from "../../core/colinearite.types";
import { formuleSubstitueeReductionLatex } from "../../ui/formatColinearite";
import {
  COURS_COLINEARITE,
  col,
  finaliserCorrigeVecteurs,
  lignesComposantes,
  lignesComposantesLin,
  lignesCritereColinearite,
  lignesCritereLin,
  lignesPremierDegreNul,
  linLatex,
  polyLatex,
  q,
  vec,
  type Fragments,
  type V,
} from "../../ui/corrigeVecteurs1";

/**
 * Corrigé détaillé « comme au tableau » de gen24 « Colinéarité et alignement de points » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`AppColinearite.tsx`,
 * `sequencePourExercice`) : vecteurs = test ; points = composantes, test ; paramètre = relation
 * réduite, résolution ; points avec x = composantes, relation réduite, résolution. Jamais
 * « déterminant » : « critère de colinéarité » x_u·y_v − y_u·x_v.
 */

const CRITERE: Fragments = [texte("Deux vecteurs "), latex("\\vec{u}"), texte(" et "), latex("\\vec{v}"), texte(" sont colinéaires si et seulement si leur critère de colinéarité est nul : "), latex("x_u\\cdot y_v-y_u\\cdot x_v=0"), texte(` ${COURS_COLINEARITE}.`)];

function enX(c: ComposantesLin, x: number): V {
  return { x: c.x.coefX * x + c.x.constante, y: c.y.coefX * x + c.y.constante };
}

function critereNum(u: V, v: V): number {
  return u.x * v.y - u.y * v.x;
}

/** Substitution du critère, en texte de résultat : « 3·(−4) − 6·(−2) = 0 ». */
function critereEcrit(u: V, v: V): string {
  const qp = (t: number) => (t < 0 ? `(${q(t)})` : q(t));
  return `${qp(u.x)}\\cdot ${qp(v.y)}-${qp(u.y)}\\cdot ${qp(v.x)}`;
}

/** Étape « test » : critère calculé, verdict. */
function etapesTest(l: string, u: V, v: V, nomU: string, nomV: string, alignement: { points: string } | null): EtapeCorrection[] {
  const c = critereNum(u, v);
  const col0 = c === 0;
  const res: Fragments = alignement
    ? [texte(`Les points ${alignement.points} ${col0 ? "sont" : "ne sont pas"} alignés car `), latex(`${critereEcrit(u, v)}=${q(c)}${col0 ? "" : "\\neq 0"}`), texte(col0 ? " : les vecteurs, de même origine, sont colinéaires." : " : les vecteurs ne sont pas colinéaires.")]
    : [latex(vec(nomU)), texte(" et "), latex(vec(nomV)), texte(col0 ? " sont colinéaires car " : " ne sont pas colinéaires car "), latex(`${critereEcrit(u, v)}=${q(c)}${col0 ? "" : "\\neq 0"}`), texte(".")];
  const etapes: EtapeCorrection[] = [
    utilise(l, alignement ? [texte(`Trois points sont alignés si et seulement si deux vecteurs de même origine qu'ils forment sont colinéaires ; critère de colinéarité `), latex("x_u\\cdot y_v-y_u\\cdot x_v=0"), texte(` ${COURS_COLINEARITE}.`)] : CRITERE),
    calcul(l, lignesCritereColinearite(u, v, [texte("critère de colinéarité de "), latex(vec(nomU)), texte(" et "), latex(vec(nomV))])),
    resultat(l, res),
  ];
  if (col0) {
    const base = u.x !== 0 || u.y !== 0 ? { a: u, b: v, na: nomU, nb: nomV } : null;
    if (base) {
      const k = base.a.x !== 0 ? base.b.x / base.a.x : base.b.y / base.a.y;
      etapes.push(verification(l, [texte("Le critère nul se voit aussi sur les composantes : "), latex(`${vec(base.nb)}=${q(k)}${vec(base.na)}`), texte(" ; ")], [ligne(`${q(k)}${col(base.a)}=${col({ x: k * base.a.x, y: k * base.a.y })}`, [texte("ce sont bien les composantes de "), latex(vec(base.nb))])]));
    }
  }
  etapes.push(piege(l, [texte("Respecter l'ordre des produits en croix et mettre chaque composante négative entre parenthèses : une seule erreur de signe change le verdict.")]));
  return etapes;
}

/** Étape « relation réduite » : critère avec x développé puis réduit. */
function etapesReduction(l: string, formule: string, u: ComposantesLin, v: ComposantesLin, nomU: string, nomV: string): EtapeCorrection[] {
  const { lignes, reduit } = lignesCritereLin(formule, [u.x, v.y], [u.y, v.x], "-", [texte("critère de colinéarité de "), latex(vec(nomU)), texte(" et "), latex(vec(nomV))]);
  const equation = `${polyLatex(reduit)}=0`;
  return [
    utilise(l, [...CRITERE.slice(0, -1), texte(` ; une composante qui contient x se multiplie comme un binôme ${COURS_COLINEARITE}.`)]),
    calcul(l, [...lignes, ligne(equation, "le critère doit être nul")]),
    resultat(l, [latex(equation)]),
    piege(l, [texte("Développer chaque produit avant de réduire, et distribuer le signe « − » sur tout le second produit.")]),
  ];
}

/** Étape « résolution » : premier degré, puis vérification par le critère en x trouvé. */
function etapesResolution(l: string, coefX: number, coefConst: number, solution: number, u: ComposantesLin, v: ComposantesLin, nomU: string, nomV: string): EtapeCorrection[] {
  const uX = enX(u, solution);
  const vX = enX(v, solution);
  return [
    utilise(l, [texte("Équation du premier degré : on isole x (on retire le terme constant, puis on divise par le coefficient de x).")]),
    calcul(l, lignesPremierDegreNul(coefX, coefConst)),
    resultat(l, [latex(`x=${q(solution)}`)]),
    verification(l, [texte("Pour "), latex(`x=${q(solution)}`), texte(", "), latex(`${vec(nomU)}=${col(uX)}`), texte(" et "), latex(`${vec(nomV)}=${col(vX)}`), texte(" : ")], lignesCritereColinearite(uX, vX, "le critère est bien nul")),
    piege(l, [texte("En isolant x, le terme constant change de signe en passant dans l'autre membre ; on divise ensuite par le coefficient de x, avec son signe.")]),
  ];
}

function etapesConstruction(l: string, e: ExerciceColinearPoints | ExerciceColinearPointsParametre): EtapeCorrection[] {
  const { labelA: a, labelB: b, labelC: c } = e;
  let lignes: LigneCalcul[];
  let res: Fragments;
  if (e.variante === "points") {
    lignes = [...lignesComposantes(`${a}${b}`, e.pointA, e.pointB), ...lignesComposantes(`${a}${c}`, e.pointA, e.pointC)];
    res = [latex(`${vec(`${a}${b}`)}=${col(e.vecteurAB)}`), texte(" et "), latex(`${vec(`${a}${c}`)}=${col(e.vecteurAC)}`)];
  } else {
    const ptA = { x: { coefX: 0, constante: e.pointA.x }, y: { coefX: 0, constante: e.pointA.y } };
    lignes = [...lignesComposantesLin(`${a}${b}`, ptA, e.pointB), ...lignesComposantesLin(`${a}${c}`, ptA, e.pointC)];
    const colL = (v: ComposantesLin) => `\\begin{pmatrix}${linLatex(v.x)}\\\\${linLatex(v.y)}\\end{pmatrix}`;
    res = [latex(`${vec(`${a}${b}`)}=${colL(e.vecteurAB)}`), texte(" et "), latex(`${vec(`${a}${c}`)}=${colL(e.vecteurAC)}`)];
  }
  return [
    utilise(l, [texte(`Pour étudier l'alignement de ${a}, ${b} et ${c}, on prend deux vecteurs de même origine ${a} ; composantes : extrémité − origine ${COURS_COLINEARITE}.`)]),
    calcul(l, lignes),
    resultat(l, res),
    piege(
      l,
      e.variante === "points"
        ? [texte("Les deux vecteurs doivent avoir la même origine : la colinéarité de deux vecteurs sans point commun ne prouve pas l'alignement (droites parallèles).")]
        : [texte("Une composante qui contient x se calcule comme les autres (extrémité − origine) : on garde x dans l'expression.")],
    ),
  ];
}

export function correctionDetailleeColinearite(e: ExerciceColinearite): EtapeCorrection[] {
  if (e.variante === "vecteurs") {
    const v = e as ExerciceColinearVecteurs;
    return finaliserCorrigeVecteurs(etapesTest("a", v.v1, v.v2, v.v1Nom, v.v2Nom, null));
  }
  if (e.variante === "points") {
    const { labelA: a, labelB: b, labelC: c } = e;
    return finaliserCorrigeVecteurs([...etapesConstruction("a", e), ...etapesTest("b", e.vecteurAB, e.vecteurAC, `${a}${b}`, `${a}${c}`, { points: `${a}, ${b} et ${c}` })]);
  }
  if (e.variante === "parametre") {
    const p = e as ExerciceColinearParametre;
    return finaliserCorrigeVecteurs([
      ...etapesReduction("a", formuleSubstitueeReductionLatex(p), p.v1, p.v2, p.v1Nom, p.v2Nom),
      ...etapesResolution("b", p.coefX, p.coefConst, p.solutionX as number, p.v1, p.v2, p.v1Nom, p.v2Nom),
    ]);
  }
  const { labelA: a, labelB: b, labelC: c } = e;
  return finaliserCorrigeVecteurs([
    ...etapesConstruction("a", e),
    ...etapesReduction("b", formuleSubstitueeReductionLatex(e), e.vecteurAB, e.vecteurAC, `${a}${b}`, `${a}${c}`),
    ...etapesResolution("c", e.coefX, e.coefConst, e.solutionX as number, e.vecteurAB, e.vecteurAC, `${a}${b}`, `${a}${c}`),
  ]);
}

import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceNatureTriangle, ExerciceNormeDistance, ExerciceParametreNorme, ExercicePythagore, ExerciceTriangleCotes } from "../../core/normeDistance.types";
import { cibleParametreNormeLatex, formatEquationReduiteParametreNormeLatex, libelleNatureCotes } from "../../ui/formatNormeDistance";
import {
  COURS_NORME,
  COURS_ORTHOGONALITE,
  carre,
  col,
  finaliserCorrigeVecteurs,
  lignesComposantes,
  lignesNorme,
  nT,
  polyLatex,
  q,
  qp,
  racineL,
  sansDoublons,
  vec,
  type Fragments,
  type Poly,
} from "../../ui/corrigeVecteurs1";

/**
 * Corrigé détaillé « comme au tableau » de gen26 « Norme d'un vecteur et distance entre 2 points » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`moteur/typesNormeDistance.ts`,
 * `SEQUENCES`) : vecteur (a) ; distance (a composantes, b norme) ; isocèle (a composantes, b trois
 * longueurs, c nature) ; paramètre (a équation réduite, b résolution) ; Pythagore (a composantes,
 * b trois longueurs, c réciproque de Pythagore). Partagé par l'adaptateur et l'appli.
 */

const NORME: Fragments = [texte("La norme d'un vecteur est la racine carrée de la somme des carrés de ses composantes : "), latex("\\|\\vec{u}\\|=\\sqrt{x_u^2+y_u^2}"), texte(` ${COURS_NORME}.`)];
const PIEGE_CARRE: Fragments = [texte("Le carré d'une composante négative est positif : on écrit "), latex("(-3)^2=9"), texte(", jamais "), latex("-3^2"), texte(".")];

const norme = (nom: string) => `\\|${vec(nom)}\\|`;

function etapesComposantesTriangle(e: ExerciceTriangleCotes | ExercicePythagore): EtapeCorrection[] {
  const { labelA: A, labelB: B, labelC: C } = e;
  return [
    utilise("a", [texte("Les côtés du triangle sont portés par "), latex(vec(`${A}${B}`)), texte(", "), latex(vec(`${A}${C}`)), texte(" et "), latex(vec(`${B}${C}`)), texte(" ; composantes : extrémité − origine.")]),
    calcul("a", [...lignesComposantes(`${A}${B}`, e.pointA, e.pointB), ...lignesComposantes(`${A}${C}`, e.pointA, e.pointC), ...lignesComposantes(`${B}${C}`, e.pointB, e.pointC)]),
    resultat("a", [latex(`${vec(`${A}${B}`)}=${col(e.vecteurAB)}`), texte(", "), latex(`${vec(`${A}${C}`)}=${col(e.vecteurAC)}`), texte(" et "), latex(`${vec(`${B}${C}`)}=${col(e.vecteurBC)}`)]),
    piege("a", [texte("Soustraire une coordonnée négative revient à ajouter sa valeur absolue : "), latex("2-(-3)=5")]),
  ];
}

function etapesLongueursTriangle(e: ExerciceTriangleCotes | ExercicePythagore): EtapeCorrection[] {
  const { labelA: A, labelB: B, labelC: C } = e;
  return [
    utilise("b", [texte("La longueur d'un côté est la norme du vecteur qui le porte : "), latex("\\|\\vec{u}\\|=\\sqrt{x_u^2+y_u^2}"), texte(` ${COURS_NORME}.`)]),
    calcul("b", lignesNorme(norme(`${A}${B}`), e.vecteurAB), [], `Côté [${A}${B}]`),
    calcul("b", lignesNorme(norme(`${A}${C}`), e.vecteurAC), [], `Côté [${A}${C}]`),
    calcul("b", lignesNorme(norme(`${B}${C}`), e.vecteurBC), [], `Côté [${B}${C}]`),
    resultat("b", [latex(`${norme(`${A}${B}`)}=${racineL(e.carreAB)}`), texte(", "), latex(`${norme(`${A}${C}`)}=${racineL(e.carreAC)}`), texte(" et "), latex(`${norme(`${B}${C}`)}=${racineL(e.carreBC)}`)]),
    piege("b", PIEGE_CARRE),
  ];
}

/** Variante « nature d'un triangle » (lot C) : mêmes écrans a, b que « isocèle », puis l'égalité de
 * longueurs ET la réciproque de Pythagore — rectangle isocèle quand les deux tests passent. */
function etapesNature(e: ExerciceNatureTriangle): EtapeCorrection[] {
  const { labelA: A, labelB: B, labelC: C, carreAB, carreAC, carreBC, nature, sommetDroit } = e;
  const cotes = [
    { n: `${A}${B}`, c: carreAB },
    { n: `${A}${C}`, c: carreAC },
    { n: `${B}${C}`, c: carreBC },
  ];
  const grand = cotes.reduce((m, x) => (x.c > m.c ? x : m));
  const autres = cotes.filter((x) => x !== grand);
  const somme = autres[0]!.c + autres[1]!.c;
  const isocele = nature === "isocele" || nature === "rectangleIsocele";
  const egaux = isocele ? (carreAB === carreAC ? [`${A}${B}`, `${A}${C}`] : carreAB === carreBC ? [`${A}${B}`, `${B}${C}`] : [`${A}${C}`, `${B}${C}`]) : null;
  const nomSommet = sommetDroit === "A" ? A : sommetDroit === "B" ? B : sommetDroit === "C" ? C : null;
  const conclusion = `Le triangle ${A}${B}${C} est ${libelleNatureCotes(nature).toLowerCase()}`;
  const precisions = [egaux ? `deux côtés de même longueur ([${egaux[0]}] et [${egaux[1]}])` : null, nomSommet ? `un angle droit en ${nomSommet}` : null].filter(Boolean);
  return [
    ...etapesComposantesTriangle(e),
    ...etapesLongueursTriangle(e),
    utilise("c", [
      texte("Isocèle : deux côtés de même longueur. Rectangle : réciproque du théorème de Pythagore — le carré du plus grand côté est égal à la somme des carrés des deux autres. Les deux à la fois : rectangle isocèle ; aucun des deux : quelconque "),
      texte(`${COURS_NORME}.`),
    ]),
    calcul("c", [
      ligne(`${norme(`${A}${B}`)}^2=${q(carreAB)},\\ ${norme(`${A}${C}`)}^2=${q(carreAC)},\\ ${norme(`${B}${C}`)}^2=${q(carreBC)}`, isocele ? "deux carrés égaux : deux côtés de même longueur" : "trois carrés différents"),
      ligne(`${norme(autres[0]!.n)}^2+${norme(autres[1]!.n)}^2=${q(autres[0]!.c)}+${q(autres[1]!.c)}=${q(somme)}`, "les deux plus petits côtés"),
      ligne(`${q(somme)}${somme === grand.c ? "=" : "\\neq "}${q(grand.c)}=${norme(grand.n)}^2`, somme === grand.c ? "égalité de Pythagore vérifiée" : "égalité de Pythagore non vérifiée"),
    ]),
    resultat("c", [texte(precisions.length ? `${conclusion} : ${precisions.join(" et ")}.` : `${conclusion} : trois longueurs différentes et pas d'angle droit.`)]),
    piege("c", [texte("Un triangle peut être à la fois isocèle et rectangle : on fait les deux tests, sans s'arrêter au premier qui réussit.")]),
  ];
}

function etapesIsocele(e: Extract<ExerciceTriangleCotes, { variante: "isocele" }>): EtapeCorrection[] {
  const { labelA: A, labelB: B, labelC: C, carreAB, carreAC, carreBC, classification } = e;
  const cmp = (n1: string, c1: number, n2_: string, c2: number) => ligne(`${norme(n1)}${c1 === c2 ? "=" : "\\neq "}${norme(n2_)}`, c1 === c2 ? "même longueur" : "longueurs différentes");
  const sommet = classification === "isoceleA" ? A : classification === "isoceleB" ? B : classification === "isoceleC" ? C : null;
  return [
    ...etapesComposantesTriangle(e),
    ...etapesLongueursTriangle(e),
    utilise("c", [texte("Un triangle est isocèle quand deux de ses côtés ont la même longueur ; le sommet principal est le sommet commun à ces deux côtés. Sinon, il est scalène.")]),
    calcul("c", [cmp(`${A}${B}`, carreAB, `${A}${C}`, carreAC), cmp(`${A}${B}`, carreAB, `${B}${C}`, carreBC), cmp(`${A}${C}`, carreAC, `${B}${C}`, carreBC)]),
    resultat(
      "c",
      sommet
        ? [texte(`Le triangle ${A}${B}${C} est isocèle en ${sommet} : les deux côtés issus de ${sommet} ont la même longueur.`)]
        : [texte(`Le triangle ${A}${B}${C} est scalène : ses trois côtés ont des longueurs deux à deux différentes.`)],
    ),
    piege("c", [texte("Le sommet principal d'un triangle isocèle est le sommet commun aux deux côtés égaux, pas le troisième sommet.")]),
  ];
}

/** (x − p)² développé : x² − 2px + p². */
function carreBinome(p: number): Poly {
  return [p * p, -2 * p, 1];
}

function binome(p: number): string {
  return p === 0 ? "x" : `(x${p > 0 ? "-" : "+"}${q(Math.abs(p))})`;
}

function etapesParametre(e: ExerciceParametreNorme): EtapeCorrection[] {
  const { p, r, cibleCarree: N, a, b, c, discriminant: D, solutions } = e;
  const somme: Poly = [p * p + r * r, -2 * (p + r), 2];
  const developpe = `${polyLatex(carreBinome(p))}+${polyLatex(carreBinome(r))}`;
  const equation = formatEquationReduiteParametreNormeLatex(e).replace(/\s+/g, "");
  const lignesA: LigneCalcul[] = sansDoublons([
    ligne(`\\|\\vec{v}\\|^2=${binome(p)}^2+${binome(r)}^2`, "norme au carré : somme des carrés des composantes"),
    ligne(`=${developpe}`, [latex("(x-a)^2=x^2-2ax+a^2")]),
    ligne(`=${polyLatex(somme)}`, "on réduit"),
    ligne(`${polyLatex(somme)}=${q(N)}`, [texte("car "), latex(`\\|\\vec{v}\\|^2=\\left(${cibleParametreNormeLatex(N)}\\right)^2=${q(N)}`)]),
    ligne(equation, `on soustrait ${nT(N)} aux deux membres`),
  ]);
  const qpB = qp(b);
  const lignesB: LigneCalcul[] = [ligne(`\\Delta=${qpB}^2-4\\cdot ${qp(a)}\\cdot ${qp(c)}=${q(b * b)}${-4 * a * c >= 0 ? "+" : "-"}${q(Math.abs(4 * a * c))}`, [texte("on remplace "), latex(`a=${q(a)}`), texte(", "), latex(`b=${q(b)}`), texte(", "), latex(`c=${q(c)}`)]), ligne(`=${q(D)}`, D > 0 ? "Δ > 0 : deux solutions" : D === 0 ? "Δ = 0 : une solution" : "Δ < 0 : aucune solution réelle")];
  let resB: Fragments;
  if (D > 0) {
    const s = Math.sqrt(D);
    lignesB.push(ligne(`\\sqrt{\\Delta}=${q(s)}`, `car ${nT(D)} = ${nT(s)}²`));
    const [x1, x2] = [(-b - s) / (2 * a), (-b + s) / (2 * a)];
    for (const [nomX, signe, x] of [["x_1", "-", x1], ["x_2", "+", x2]] as const) {
      lignesB.push(ligne(`${nomX}=\\dfrac{${q(-b)}${signe}${q(s)}}{2\\cdot ${qp(a)}}`, [texte("formule, signe "), latex(signe)]), ligne(`=\\dfrac{${q(-b + (signe === "-" ? -s : s))}}{${q(2 * a)}}`), ligne(`=${q(x)}`));
    }
    resB = [latex(`x=${q(solutions[0])}`), texte(" ou "), latex(`x=${q(solutions[1])}`)];
  } else if (D === 0) {
    lignesB.push(ligne(`x=\\dfrac{${q(-b)}}{2\\cdot ${qp(a)}}`, [texte("solution double "), latex("x=\\dfrac{-b}{2a}")]), ligne(`=${q(-b / (2 * a))}`));
    resB = [latex(`x=${q(solutions[0])}`), texte(" (une seule valeur)")];
  } else {
    resB = [texte("Aucune valeur de x ne convient : l'équation n'a pas de solution réelle.")];
  }
  const verif: EtapeCorrection[] = solutions.length
    ? [
        verification("b", [texte("Pour "), latex(`x=${q(solutions[0])}`), texte(", "), latex(`\\vec{v}=${col({ x: solutions[0] - p, y: solutions[0] - r })}`), texte(" : ")], [
          ligne(`${carre(solutions[0] - p)}+${carre(solutions[0] - r)}=${q(N)}`, [texte("somme des carrés des composantes : on retrouve "), latex(`\\left(${cibleParametreNormeLatex(N)}\\right)^2`)]),
        ]),
      ]
    : [];
  return [
    utilise("a", [texte("Une norme est positive : "), latex(`\\|\\vec{v}\\|=${cibleParametreNormeLatex(N)}`), texte(" équivaut à "), latex(`\\|\\vec{v}\\|^2=${q(N)}`), texte(` ; on développe chaque carré ${COURS_NORME}.`)]),
    calcul("a", lignesA),
    resultat("a", [latex(equation)]),
    piege("a", [texte("Le carré d'un binôme a trois termes : "), latex("(x-a)^2=x^2-2ax+a^2"), texte(" ; oublier le double produit fausse toute la suite.")]),
    utilise("b", [texte("Équation du second degré : discriminant "), latex("\\Delta=b^2-4ac"), texte(" ; si Δ > 0 deux solutions "), latex("\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(", si Δ = 0 une seule, si Δ < 0 aucune (voir « Équations et inéquations du second degré », étape 1).")]),
    calcul("b", lignesB),
    resultat("b", resB),
    ...verif,
    piege("b", [texte("Une norme ne peut valoir une longueur que si l'équation a des solutions : avec Δ < 0, aucune valeur de x ne convient.")]),
  ];
}

function etapesPythagore(e: ExercicePythagore): EtapeCorrection[] {
  const { labelA: A, labelB: B, labelC: C, carreAB, carreAC, carreBC, sommetRectangle } = e;
  const cotes = [
    { n: `${A}${B}`, c: carreAB, oppose: C },
    { n: `${A}${C}`, c: carreAC, oppose: B },
    { n: `${B}${C}`, c: carreBC, oppose: A },
  ];
  const grand = cotes.reduce((m, x) => (x.c > m.c ? x : m));
  const autres = cotes.filter((x) => x !== grand);
  const sommeAutres = autres[0]!.c + autres[1]!.c;
  const egal = sommeAutres === grand.c;
  return [
    ...etapesComposantesTriangle(e),
    ...etapesLongueursTriangle(e),
    utilise("c", [texte(`Réciproque du théorème de Pythagore : si le carré du plus grand côté est égal à la somme des carrés des deux autres, le triangle est rectangle au sommet opposé ; sinon il n'est pas rectangle ${COURS_ORTHOGONALITE}.`)]),
    calcul("c", [
      ligne(`${norme(autres[0]!.n)}^2+${norme(autres[1]!.n)}^2=${q(autres[0]!.c)}+${q(autres[1]!.c)}`, "les deux plus petits côtés"),
      ligne(`=${q(sommeAutres)}`),
      ligne(`${norme(grand.n)}^2=${q(grand.c)}`, `plus grand côté [${grand.n}]`),
      ligne(`${q(sommeAutres)}${egal ? "=" : "\\neq "}${q(grand.c)}`, egal ? "égalité de Pythagore vérifiée" : "égalité de Pythagore non vérifiée"),
    ]),
    resultat("c", [texte(sommetRectangle === null ? `Le triangle ${A}${B}${C} n'est pas rectangle.` : `Le triangle ${A}${B}${C} est rectangle en ${sommetRectangle === "A" ? A : sommetRectangle === "B" ? B : C}, sommet opposé au plus grand côté [${grand.n}].`)]),
    piege("c", [texte("On compare les carrés des longueurs (des entiers), pas les longueurs arrondies ; et seul le plus grand côté peut être l'hypoténuse.")]),
  ];
}

export function correctionDetailleeNormeDistance(e: ExerciceNormeDistance): EtapeCorrection[] {
  if (e.variante === "vecteur") {
    return finaliserCorrigeVecteurs([
      utilise("a", NORME),
      calcul("a", lignesNorme(norme(e.vNom), e.v)),
      resultat("a", [latex(`${norme(e.vNom)}=${racineL(e.normeCarree)}`)]),
      piege("a", PIEGE_CARRE),
    ]);
  }
  if (e.variante === "distance") {
    const { labelA: A, labelB: B } = e;
    return finaliserCorrigeVecteurs([
      utilise("a", [texte("Composantes d'un vecteur : extrémité − origine "), texte(`(cours, § 8).`)]),
      calcul("a", lignesComposantes(`${A}${B}`, e.pointA, e.pointB)),
      resultat("a", [latex(`${vec(`${A}${B}`)}=${col(e.vecteurAB)}`)]),
      piege("a", [texte("Soustraire une coordonnée négative revient à ajouter sa valeur absolue : "), latex("2-(-3)=5")]),
      utilise("b", [texte(`La distance ${A}${B} est la norme du vecteur `), latex(vec(`${A}${B}`)), texte(" : "), latex(`${A}${B}=\\|${vec(`${A}${B}`)}\\|=\\sqrt{x^2+y^2}`), texte(` ${COURS_NORME}.`)]),
      calcul("b", lignesNorme(norme(`${A}${B}`), e.vecteurAB)),
      resultat("b", [latex(`${A}${B}=${racineL(e.distanceCarree)}`)]),
      piege("b", PIEGE_CARRE),
    ]);
  }
  if (e.variante === "isocele") return finaliserCorrigeVecteurs(etapesIsocele(e));
  if (e.variante === "parametre") return finaliserCorrigeVecteurs(etapesParametre(e));
  if (e.variante === "natureTriangle") return finaliserCorrigeVecteurs(etapesNature(e));
  return finaliserCorrigeVecteurs(etapesPythagore(e));
}

import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExercicePointVectoriel } from "../../core/pointVectoriel.types";
import {
  COURS_MULTIPLICATION_REPERE,
  COURS_TRANSLATION_MILIEU,
  J_COMPOSANTES,
  add,
  coefVec,
  col,
  colonne,
  etapesMultiplePoint,
  etapesTranslationPoint,
  finaliserCorrigeVecteurs,
  fois,
  indice,
  lignesPointArrivee,
  moins,
  mul,
  plus,
  pointL,
  q,
  sub,
  termeVecSuite,
  vec,
} from "../../ui/corrigeVecteurs1";

/**
 * Corrigé détaillé « comme au tableau » de gen20 « Point à partir d'une relation vectorielle »
 * (un seul écran : lettre « a ») — règle `.claude/rules/feuilles-evaluations.md`. Partagé par
 * l'adaptateur papier et l'appli (`AppPointVectoriel.tsx`). Valeurs calculées depuis l'instance.
 */
export function correctionDetailleePointVectoriel(e: ExercicePointVectoriel): EtapeCorrection[] {
  const l = "a";
  const P = e.pointCherche;
  if (e.variante === "translation") return finaliserCorrigeVecteurs(etapesTranslationPoint(l, e));
  if (e.variante === "milieu") {
    const { pointA: A, pointB: B, labelA: a, labelB: b } = e;
    const M = e.reponse;
    return finaliserCorrigeVecteurs([
      utilise(l, [texte(`Les coordonnées du milieu de [${a}${b}] sont les moyennes des coordonnées des extrémités : `), latex(`x_${indice(P)}=\\dfrac{x_${a}+x_${b}}{2}`), texte(", "), latex(`y_${indice(P)}=\\dfrac{y_${a}+y_${b}}{2}`), texte(` ${COURS_TRANSLATION_MILIEU}.`)]),
      calcul(l, [
        ligne(`x_${indice(P)}=\\dfrac{${plus(A.x, B.x)}}{2}`, "moyenne des abscisses"),
        ligne(`=\\dfrac{${q(A.x + B.x)}}{2}`),
        ligne(`=${q(M.x)}`),
        ligne(`y_${indice(P)}=\\dfrac{${plus(A.y, B.y)}}{2}`, "moyenne des ordonnées"),
        ligne(`=\\dfrac{${q(A.y + B.y)}}{2}`),
        ligne(`=${q(M.y)}`),
      ]),
      resultat(l, [latex(pointL(P, M))]),
      verification(l, [texte("Le milieu vérifie "), latex(`${vec(`${a}${P}`)}=${vec(`${P}${b}`)}`), texte(" : ")], [
        ligne(`${vec(`${a}${P}`)}=${colonne(moins(M.x, A.x), moins(M.y, A.y))}=${col(sub(M, A))}`, J_COMPOSANTES),
        ligne(`${vec(`${P}${b}`)}=${colonne(moins(B.x, M.x), moins(B.y, M.y))}=${col(sub(B, M))}`, "mêmes composantes"),
      ]),
      piege(l, [texte("On divise la somme des coordonnées par 2, pas leur différence : la différence donnerait les composantes du vecteur, pas le milieu.")]),
    ]);
  }
  if (e.forme === "pointAPoint") return finaliserCorrigeVecteurs(etapesMultiplePoint(l, e));
  const { pointDepart: A, labelDepart: a, vecteurU: u, vecteurV: v, labelU, labelV, coefU, coefV } = e;
  const cu = mul(coefU, u);
  const cv = mul(coefV, v);
  const ae = add(cu, cv);
  const nomAE = `${a}${P}`;
  return finaliserCorrigeVecteurs([
    utilise(l, [
      texte("En repère, on multiplie chaque composante par le coefficient, puis on additionne composante par composante "),
      texte(`${COURS_MULTIPLICATION_REPERE}. Puis ${P} = ${a} + `),
      latex(vec(nomAE)),
      texte(` ${COURS_TRANSLATION_MILIEU}.`),
    ]),
    calcul(
      l,
      [
        ligne(`${vec(nomAE)}=${coefVec(coefU)}${vec(labelU)}${termeVecSuite(coefV, labelV)}`, "relation de l'énoncé"),
        ligne(`=${colonne(fois(coefU, u.x), fois(coefU, u.y))}+${colonne(fois(coefV, v.x), fois(coefV, v.y))}`, "chaque composante est multipliée par son coefficient"),
        ligne(`=${col(cu)}+${col(cv)}`),
        ligne(`=${colonne(plus(cu.x, cv.x), plus(cu.y, cv.y))}`, "on additionne composante par composante"),
        ligne(`=${col(ae)}`),
      ],
      [],
      `Vecteur ${nomAE}`,
    ),
    calcul(l, lignesPointArrivee(P, A, ae, vec(nomAE)), [], `Coordonnées de ${P}`),
    resultat(l, [latex(pointL(P, e.reponse))]),
    verification(l, [texte("Les composantes de "), latex(vec(nomAE)), texte(" recalculées depuis les points : ")], [
      ligne(`${vec(nomAE)}=${colonne(moins(e.reponse.x, A.x), moins(e.reponse.y, A.y))}=${col(ae)}`, "même vecteur"),
    ]),
    piege(l, [texte("Chaque coefficient multiplie les deux composantes de son vecteur ; un coefficient négatif change le signe de chaque composante.")]),
  ]);
}

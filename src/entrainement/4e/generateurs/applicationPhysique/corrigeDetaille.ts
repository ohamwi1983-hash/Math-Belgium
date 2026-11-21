import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceApplicationPhysique } from "../../core/applicationPhysique.types";
import { libelleGrandeurApplicationPhysique, notationVecteursApplicationPhysique } from "../../ui/formatApplicationPhysique";
import { resultantePencheEnArriere } from "../../moteur/verificationApplicationPhysique";
import { auPlus, nbFixe } from "../../ui/corrigeTriangles";
import { COURS_RESULTANTE, finaliserCorrigeVecteurs, q } from "../../ui/corrigeVecteurs1";

/**
 * Corrigé détaillé « comme au tableau » de gen29 « Applications physiques (résultante) » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : « a » configuration (angle θ lu),
 * « b » norme de la résultante (Pythagore ou formule de la résultante), « c » déviation (tangente ou
 * loi des sinus, puis sens : angle aigu ou obtus), « d » direction cardinale. Valeurs approchées
 * calculées depuis les valeurs NON arrondies (mémoire de la calculatrice) : toute substitution d'une
 * valeur arrondie est un « ≈ ». Angles en degrés (jamais de radian en 4e).
 */

const RAD = Math.PI / 180;
const d2 = (v: number) => nbFixe(v, 2);
const deg = (v: number) => `${q(v)}^\\circ`;
/** « = » si la valeur s'écrit exactement au centième, sinon « \approx ». */
const rel = (v: number) => (auPlus(v, 2) ? "=" : "\\approx");
const val = (v: number) => (auPlus(v, 2) ? q(Math.round(v * 100) / 100) : d2(v));
const DEV = "\\text{déviation}";

export function correctionDetailleeApplicationPhysique(e: ExerciceApplicationPhysique): EtapeCorrection[] {
  const { v1: V1, v2: V2, resultante: VR, normeResultante: NRV } = notationVecteursApplicationPhysique(e.contexte);
  // Normes notées comme au cours (§ 17) : R, F₁, F₂ (forces) ou v_R, v₁, v₂ (vitesses).
  const lettre = e.contexte === "forces" ? "F" : "v";
  const n1 = `${lettre}_1`;
  const n2 = `${lettre}_2`;
  const NR = e.contexte === "forces" ? "R" : "v_R";
  const theta = e.angleEntreVecteurs;
  const droit = e.variante === "angleDroit";
  const R = e.triangle.a;
  const D = e.triangle.C;
  const unite = `\\text{ ${e.unite}}`;
  const grandeur = libelleGrandeurApplicationPhysique(e.contexte);

  // ---- a : configuration
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte(`La résultante est la diagonale du parallélogramme construit sur les deux ${grandeur} issues de la même origine ; avec un angle droit, ce parallélogramme est un rectangle ${COURS_RESULTANTE}. Normes : `), latex(`${n1}=\\|${V1}\\|`), texte(", "), latex(`${n2}=\\|${V2}\\|`), texte(", "), latex(`${NR}=${NRV}`), texte(".")]),
    calcul("a", [ligne(`\\theta=${deg(theta)}${droit ? "" : "\\neq 90^\\circ"}`, droit ? "angle donné par l'énoncé : angle droit" : "angle donné par l'énoncé : ni droit, ni nul, ni plat")]),
    resultat("a", [texte(droit ? "Configuration « angle droit » : on utilisera le théorème de Pythagore et la tangente." : "Configuration « angle quelconque » : on utilisera la formule de la résultante et la loi des sinus.")]),
    piege("a", [texte("θ est l'angle entre les deux vecteurs placés à la même origine, pas un angle du triangle formé en les mettant bout à bout.")]),
  ];

  // ---- b : norme
  const s2 = e.v1 * e.v1 + e.v2 * e.v2;
  const lignesB: LigneCalcul[] = [];
  if (droit) {
    lignesB.push(
      ligne(`${NR}^2=${n1}^2+${n2}^2`, "Pythagore dans le rectangle"),
      ligne(`=${q(e.v1)}^2+${q(e.v2)}^2`, "on remplace"),
      ligne(`=${q(e.v1 * e.v1)}+${q(e.v2 * e.v2)}`),
      ligne(`=${q(s2)}`),
      ligne(`${NR}=\\sqrt{${q(s2)}}`, "une norme est positive"),
      ligne(`${rel(R)}${val(R)}`, "à la calculatrice"),
    );
  } else {
    const p = 2 * e.v1 * e.v2;
    const terme = p * Math.cos(theta * RAD);
    lignesB.push(
      ligne(`${NR}^2=${n1}^2+${n2}^2+2${n1}${n2}\\cos\\theta`, "formule de la résultante"),
      ligne(`=${q(e.v1)}^2+${q(e.v2)}^2+2\\cdot ${q(e.v1)}\\cdot ${q(e.v2)}\\cdot\\cos ${deg(theta)}`, "on remplace"),
      ligne(`=${q(e.v1 * e.v1)}+${q(e.v2 * e.v2)}+${q(p)}\\cdot\\cos ${deg(theta)}`),
      ligne(`${rel(terme)}${q(s2)}${terme < 0 ? "-" : "+"}${val(Math.abs(terme))}`, [texte("à la calculatrice : "), latex(`${q(p)}\\cdot\\cos ${deg(theta)}${rel(terme)}${val(terme)}`)]),
      ligne(`${rel(R * R)}${val(R * R)}`),
      ligne(`${NR}${rel(R)}${val(R)}`, "racine carrée (valeur non arrondie en mémoire)"),
    );
  }
  etapes.push(
    utilise("b", droit ? [texte("Théorème de Pythagore : "), latex(`${NR}^2=${n1}^2+${n2}^2`), texte(` ${COURS_RESULTANTE}.`)] : [texte("Formule de la résultante, θ étant l'angle entre les deux vecteurs : "), latex(`${NR}^2=${n1}^2+${n2}^2+2${n1}${n2}\\cos\\theta`), texte(` ${COURS_RESULTANTE}.`)]),
    calcul("b", lignesB),
    resultat("b", [latex(`${NRV}${rel(R)}${val(R)}${unite}`), texte(", soit environ "), latex(`${q(Math.round(R))}${unite}`), texte(" à l'unité.")]),
    piege(
      "b",
      droit
        ? [texte("On additionne les carrés des normes, puis on prend la racine : la norme de la résultante n'est pas la somme des deux normes.")]
        : [texte("Le terme vaut "), latex(`+2${n1}${n2}\\cos\\theta`), texte(" (signe +) avec θ entre les vecteurs : la loi des cosinus écrite avec l'angle du triangle a un signe −.")],
    ),
  );

  // ---- c : déviation
  const lignesC: LigneCalcul[] = [];
  let piegeC: string;
  if (droit) {
    lignesC.push(
      ligne(`\\tan(${DEV})=\\dfrac{${n2}}{${n1}}`, "côté opposé / côté adjacent, dans le triangle rectangle"),
      ligne(`=\\dfrac{${q(e.v2)}}{${q(e.v1)}}`, "on remplace"),
      ligne(`${DEV}=\\tan^{-1}\\left(\\dfrac{${q(e.v2)}}{${q(e.v1)}}\\right)`, [texte("touche "), latex("\\tan^{-1}"), texte(" (mode degrés)")]),
      ligne(`${rel(D)}${val(D)}^\\circ`),
    );
    piegeC = "Le second vecteur va au numérateur : tan = côté opposé / côté adjacent, vu depuis le premier vecteur.";
  } else {
    const sinD = (e.v2 * Math.sin(theta * RAD)) / R;
    const a0 = Math.asin(sinD) / RAD;
    const comp = e.v1 + e.v2 * Math.cos(theta * RAD);
    const obtus = resultantePencheEnArriere(e);
    lignesC.push(
      ligne(`\\dfrac{\\sin(${DEV})}{${n2}}=\\dfrac{\\sin\\theta}{${NR}}`, "loi des sinus dans le triangle des vecteurs mis bout à bout"),
      ligne(`\\sin(${DEV})=\\dfrac{${n2}\\cdot\\sin\\theta}{${NR}}`, [texte("on multiplie les deux membres par "), latex(n2)]),
      ligne(`\\approx\\dfrac{${q(e.v2)}\\cdot\\sin ${deg(theta)}}{${d2(R)}}`, "on remplace (norme en mémoire, écrite arrondie)"),
      ligne(`\\approx ${nbFixe(sinD, 4)}`),
      ligne(`\\alpha_0\\approx\\sin^{-1}(${nbFixe(sinD, 4)})\\approx ${d2(a0)}^\\circ`, [texte("touche "), latex("\\sin^{-1}"), texte(" : toujours un angle aigu")]),
      ligne(`${n1}+${n2}\\cos\\theta=${q(e.v1)}+${q(e.v2)}\\cdot\\cos ${deg(theta)}`, "sens : la résultante penche-t-elle vers l'arrière ?"),
      ligne(`${rel(comp)}${val(comp)}`),
      ligne(`${val(comp)}${obtus ? "<" : ">"}0`, obtus ? "la résultante penche vers l'arrière : déviation obtuse" : "la résultante ne penche pas vers l'arrière : déviation aiguë"),
      obtus ? ligne(`${DEV}=180^\\circ-\\alpha_0\\approx ${d2(D)}^\\circ`, "angle supplémentaire (même sinus)") : ligne(`${DEV}=\\alpha_0\\approx ${d2(D)}^\\circ`, "l'angle de la calculatrice convient"),
    );
    piegeC = "La touche sin⁻¹ donne toujours l'angle aigu : quand la résultante penche vers l'arrière, la déviation est l'angle supplémentaire 180° − α₀.";
  }
  etapes.push(
    utilise("c", droit ? [texte("Dans le triangle rectangle formé par "), latex(V1), texte(" et le côté parallèle à "), latex(V2), texte(" : "), latex(`\\tan(${DEV})=\\dfrac{\\text{côté opposé}}{\\text{côté adjacent}}`), texte(".")] : [texte("Loi des sinus, avec θ et la norme de la résultante déjà connus : "), latex(`\\dfrac{\\sin(${DEV})}{${n2}}=\\dfrac{\\sin\\theta}{${NR}}`), texte(` ; puis le sens, par le signe de `), latex(`${n1}+${n2}\\cos\\theta`), texte(` ${COURS_RESULTANTE}.`)]),
    calcul("c", lignesC),
    resultat("c", [texte("Angle de déviation entre "), latex(V1), texte(" et "), latex(VR), texte(" : "), latex(`${rel(D)}${val(D)}^\\circ`), texte(", soit environ "), latex(`${q(Math.round(D))}^\\circ`), texte(" au degré.")]),
    piege("c", [texte(piegeC)]),
  );

  // ---- d : direction
  const lateral = e.coteDeviation === "est" ? "Est" : "Ouest";
  const nord = D < 90;
  etapes.push(
    utilise("d", [texte(`Le premier vecteur pointe plein Nord ; la résultante dévie du côté du second vecteur (${lateral}) ; une déviation inférieure à 90° reste côté Nord, supérieure à 90° passe côté Sud.`)]),
    calcul("d", [ligne(`${DEV}${rel(D)}${val(D)}^\\circ${nord ? "<" : ">"}90^\\circ`, nord ? "la résultante reste du côté Nord" : "la résultante passe du côté Sud")]),
    resultat("d", [texte(`Direction de la résultante : ${e.directionCorrecte} (côté ${nord ? "Nord" : "Sud"}, déviée vers l'${lateral}).`)]),
    piege("d", [texte("Le côté Est / Ouest vient de l'énoncé (côté du second vecteur) ; seul le côté Nord / Sud dépend de l'angle trouvé.")]),
  );
  return finaliserCorrigeVecteurs(etapes);
}

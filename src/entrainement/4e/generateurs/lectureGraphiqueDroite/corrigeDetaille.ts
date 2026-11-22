import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLectureGraphiqueDroite } from "../../core/lectureGraphiqueDroite.types";
import { q } from "../../ui/corrigeChapitre3";
import { COURS_DROITE, COURS_LIRE_TRACER, lignesCartesienneParNormale, lignesParametriques, lignesPointSurCartesienne, lignesVecteurDeuxPoints, pt } from "../../ui/corrigeAnalytique1";
import { finaliserVecteurs } from "../../ui/corrigeVecteurs2";
import { formatReponseAttendueLatex } from "../../ui/formatLectureGraphiqueDroite";
import { pointsEntiersVisibles } from "../../ui/lectureGraphiqueDroiteGraph";
import { construireSvgLectureGraphiqueDroite } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen43 « Lecture graphique — équation d'une droite » — règle
 * `.claude/rules/feuilles-evaluations.md`. Un seul écran (lettre a) : deux points marqués lus sur le
 * quadrillage (figure : A, B et le point de contrôle C étiquetés), vecteur directeur, équation
 * cartésienne y_u(x − x_A) − x_u(y − y_A) = 0 développée ou équations paramétriques ; vérification par
 * le troisième point marqué C = A − u. Partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceLectureGraphiqueDroite;

export function correctionDetailleeLectureGraphiqueDroite(e: E): EtapeCorrection[] {
  const [c, a, b] = pointsEntiersVisibles(e);
  const u = e.vecteur;
  const cartesienne = e.variante === "cartesienne";
  const lecture = calcul(
    "a",
    [
      ligne(`x_A=${q(a.x)}`, "point marqué sur la droite : abscisse lue sur l'axe horizontal"),
      ligne(`y_A=${q(a.y)}`, "ordonnée lue sur l'axe vertical"),
      ligne(`x_B=${q(b.x)}`, "point marqué suivant"),
      ligne(`y_B=${q(b.y)}`),
    ],
    [],
    "Lecture",
  );
  const equation = cartesienne
    ? lignesCartesienneParNormale(u, a, [texte("vecteur normal "), latex("\\begin{pmatrix}y_{\\vec{u}}\\\\-x_{\\vec{u}}\\end{pmatrix}"), texte(", point A")]).lignes
    : lignesParametriques(a, u);
  const ref = e.referenceImplicite;
  return finaliserVecteurs([
    utilise("a", [
      texte("Deux points de la droite à coordonnées entières, lus sur le quadrillage, donnent un vecteur directeur (extrémité − origine) "),
      texte(`${COURS_LIRE_TRACER} ; `),
      ...(cartesienne
        ? [texte("une équation cartésienne s'écrit alors "), latex("y_{\\vec{u}}\\,(x-x_A)-x_{\\vec{u}}\\,(y-y_A)=0")]
        : [texte("les équations paramétriques s'écrivent "), latex("x=x_A+x_{\\vec{u}}\\,t"), texte(", "), latex("y=y_A+y_{\\vec{u}}\\,t")]),
      texte(` ${COURS_DROITE}.`),
    ]),
    { ...lecture, figureHtml: construireSvgLectureGraphiqueDroite(e, true) },
    calcul("a", lignesVecteurDeuxPoints("u", a, b), [], "Vecteur directeur"),
    calcul("a", equation, [], cartesienne ? "Équation cartésienne" : "Équations paramétriques"),
    resultat("a", [latex(`d\\equiv ${formatReponseAttendueLatex(e)}`)]),
    cartesienne
      ? verification("a", [texte("Le troisième point marqué, "), latex(pt("C", c)), texte(", vérifie l'équation : ")], lignesPointSurCartesienne(ref, c, "C"))
      : verification("a", [
          texte("Pour "),
          latex("t=-1"),
          texte(" : "),
          latex(u.x === 0 ? `x=${q(c.x)}` : `x=${q(a.x)}${u.x > 0 ? "-" : "+"}${q(Math.abs(u.x))}=${q(c.x)}`),
          texte(" et "),
          latex(u.y === 0 ? `y=${q(c.y)}` : `y=${q(a.y)}${u.y > 0 ? "-" : "+"}${q(Math.abs(u.y))}=${q(c.y)}`),
          texte(" : c'est le troisième point marqué, "),
          latex(pt("C", c)),
          texte("."),
        ]),
    piege(
      "a",
      u.x === 0
        ? [texte("Droite verticale : toutes ses abscisses sont égales, son équation est du type "), latex("x=k"), texte(" (pas de pente).")]
        : u.y === 0
          ? [texte("Droite horizontale : toutes ses ordonnées sont égales, son équation est du type "), latex("y=k"), texte(".")]
          : [texte("Un point se lit abscisse d'abord, ordonnée ensuite ; le vecteur se calcule « extrémité − origine », dans le même ordre pour les deux composantes.")],
    ),
  ]);
}

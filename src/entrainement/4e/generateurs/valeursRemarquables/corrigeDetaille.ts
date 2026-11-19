import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, latex, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceValeursRemarquables } from "../../core/valeursRemarquables.types";
import { formatAngleLatex, libelleQuadrant } from "../../ui/formatCercleTrigonometrique";
import { estSurAxe } from "../../moteur/verificationCercleTrigonometrique";
import { LATEX_COS, LATEX_SIN, LATEX_TAN } from "./tables";
import {
  COURS_CERCLE,
  COURS_REMARQUABLES,
  dfrac,
  finaliserCorrige,
  ligneQuadrant,
  ligneRetourDepuisReference,
  lignesAnglePremierQuadrant,
  lignesReduction,
  lignesValeurAssociee,
  lignesValeursAxe,
  utiliseAxe,
} from "../../ui/corrigeCercleTrigo";

/**
 * Corrigé détaillé « comme au tableau » de gen15 (valeurs remarquables) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : a) quadrant (angle ramené dans
 * [0° ; 360°[ s'il le faut), b) angle du premier quadrant, c) valeurs exactes — sur un axe : a) axe,
 * b) valeurs exactes. Partagé par l'adaptateur et l'appli (`AppValeursRemarquables`).
 * Écrans de pure lecture (niveau) : a quand l'angle est déjà dans [0° ; 360°[ (placer le point),
 * b sur un axe (coordonnées de M lues).
 */

type E = ExerciceValeursRemarquables;

export function lettresLectureValeursRemarquables(e: E): string[] {
  const l: string[] = [];
  if (e.angleDepart === e.angleReduit) l.push("a");
  if (estSurAxe(e)) l.push("b");
  return l;
}

export function lettreEcranValeursRemarquables(e: E, phase: string): string {
  if (phase === "quadrant") return "a";
  if (phase === "anglePremierQuadrant") return "b";
  return estSurAxe(e) ? "b" : "c";
}

/** Valeurs exactes, comme la réponse attendue de l'écran (tables `sinLatex`, `cosLatex`, `tanLatex`). */
function resultatValeurs(e: E): FragmentConsigne[] {
  return [
    latex(`\\sin\\theta=${dfrac(e.sinLatex)}`),
    texte(" ; "),
    latex(`\\cos\\theta=${dfrac(e.cosLatex)}`),
    texte(" ; "),
    ...(e.tanLatex === "n'existe pas" ? [latex("\\tan\\theta"), texte(" n'existe pas")] : [latex(`\\tan\\theta=${dfrac(e.tanLatex)}`)]),
  ];
}

export function correctionDetailleeValeursRemarquables(e: E): EtapeCorrection[] {
  const r = e.angleReduit;
  const etapes: EtapeCorrection[] = [];

  // a) Quadrant (après réduction éventuelle).
  const reduction = lignesReduction(e.angleDepart);
  etapes.push(
    utilise("a", [
      texte(
        `${reduction.length ? "On ramène d'abord l'angle dans [0° ; 360°[ (ajouter ou retirer des tours de 360° ne change pas le point), puis on repère son quadrant" : "On repère le quadrant de l'angle"} : I entre 0° et 90°, II entre 90° et 180°, III entre 180° et 270°, IV entre 270° et 360° ; 0°, 90°, 180° et 270° sont sur les axes ${COURS_CERCLE}.`,
      ),
    ]),
    calcul("a", [...reduction, ligneQuadrant(r)]),
    resultat("a", [texte(libelleQuadrant(e.quadrant))]),
  );
  if (reduction.length) etapes.push(piege("a", [texte("Le quadrant se lit sur l'angle ramené entre 0° et 360°, pas sur l'angle de départ.")]));

  if (estSurAxe(e)) {
    etapes.push(utilise("b", utiliseAxe()), calcul("b", lignesValeursAxe(r)), resultat("b", resultatValeurs(e)));
    etapes.push(piege("b", [texte(e.quadrant === "axeOy" ? "Sur l'axe Oy, cos θ = 0 : tan θ n'existe pas (elle ne vaut ni 0 ni 1)." : "Sur l'axe Ox, cos θ vaut 1 ou −1 selon le côté (180° donne −1).")]));
    return finaliserCorrige(etapes);
  }

  // b) Angle du premier quadrant.
  etapes.push(
    utilise("b", [texte(`Angle du premier quadrant : quadrant I, θ lui-même ; II, 180° − θ ; III, θ − 180° ; IV, 360° − θ ${COURS_CERCLE}.`)]),
    calcul("b", lignesAnglePremierQuadrant(r)),
    resultat("b", [texte("Angle du premier quadrant : "), latex(formatAngleLatex(e.anglePremierQuadrant))]),
  );
  const retour = ligneRetourDepuisReference(r);
  if (retour) etapes.push(verification("b", [texte("On retrouve l'angle à partir de l'angle du premier quadrant :")], [retour]));

  // c) Valeurs exactes : valeur absolue par la table, signe par le quadrant.
  const ref = e.anglePremierQuadrant;
  etapes.push(
    utilise("c", [
      texte(`Valeurs remarquables de ${ref}° ${COURS_REMARQUABLES} : `),
      latex(`\\sin ${ref}^\\circ=${dfrac(LATEX_SIN[ref])}`),
      texte(", "),
      latex(`\\cos ${ref}^\\circ=${dfrac(LATEX_COS[ref])}`),
      texte(", "),
      latex(`\\tan ${ref}^\\circ=${dfrac(LATEX_TAN[ref])}`),
      texte(` ; le signe vient du quadrant ${COURS_CERCLE}.`),
    ]),
    calcul("c", [...lignesValeurAssociee("sin", r), ...lignesValeurAssociee("cos", r), ...lignesValeurAssociee("tan", r)]),
    resultat("c", resultatValeurs(e)),
  );
  etapes.push(
    piege(
      "c",
      ref === 45
        ? [texte("À 45°, sinus et cosinus ont la même valeur absolue, mais pas forcément le même signe.")]
        : [texte("Ne pas échanger les valeurs de 30° et de 60° : "), latex("\\sin 30^\\circ=\\cos 60^\\circ=\\dfrac{1}{2}"), texte(" et "), latex("\\cos 30^\\circ=\\sin 60^\\circ=\\dfrac{\\sqrt{3}}{2}"), texte(".")],
    ),
  );
  return finaliserCorrige(etapes);
}

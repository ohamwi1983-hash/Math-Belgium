/**
 * Couche A — famille M "inclinaisonCable" (`anglePartage`, extension de la banque, spec section 4 —
 * `promptextensionbanquesgen57gen58.md`) : même mécanique EXACTE que `hauteurInaccessible.ts` (pont
 * O,F,M RECTANGLE en F, cible O,M,T avec hypothèse de verticalité F,M,T) — seule différence : la
 * grandeur demandée est l'ANGLE en T du triangle cible (`triangleCible.A`, angle entre le câble TO
 * et le mât TM de la grue), plutôt que la hauteur totale (`h_M+MT`). Combinaison pont-rectangle/
 * angle-demandé absente des 4 familles d'origine — voir `core/triangleLies.types.ts`.
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import type { Triangle } from "../../../core/triangle.types";
import { construireOptionsInterpretationTriangleLies } from "../interpretation";
import { randomInt } from "../aleatoire";

const HAUTEUR_M_MIN = 3;
const HAUTEUR_M_MAX = 10;
const ANGLE_M_MIN = 15;
const ANGLE_M_MAX = 35;
const ECART_ANGLE_MIN = 10;
const ECART_ANGLE_MAX = 30;

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

export function construireInclinaisonCable(): ExerciceTriangleLies {
  const hM = randomInt(HAUTEUR_M_MIN, HAUTEUR_M_MAX);
  const thetaM = randomInt(ANGLE_M_MIN, ANGLE_M_MAX);
  const thetaT = thetaM + randomInt(ECART_ANGLE_MIN, ECART_ANGLE_MAX);

  const OM = hM / Math.sin(versRadians(thetaM));
  const OF = hM / Math.tan(versRadians(thetaM));
  const trianglePont: Triangle = { a: OM, A: 90, b: OF, B: 90 - thetaM, c: hM, C: thetaM };

  const angleUtile = thetaT - thetaM;
  const angleHypothese = 90 + thetaM;
  const angleEnT = 180 - angleUtile - angleHypothese;
  const sinT = Math.sin(versRadians(angleEnT));
  const MT = (OM * Math.sin(versRadians(angleUtile))) / sinT;
  const OT = (OM * Math.sin(versRadians(angleHypothese))) / sinT;
  const triangleCible: Triangle = { a: OM, A: angleEnT, b: MT, B: angleUtile, c: OT, C: angleHypothese };

  const hauteurTotale = hM + MT;

  const O_pt = { x: 0, y: 0 };
  const F_pt = { x: OF, y: 0 };
  const M_pt = { x: OF, y: hM };
  const T_pt = { x: OF, y: hauteurTotale };

  return {
    famille: "inclinaisonCable",
    variante: "anglePartage",
    typeTrianglePont: "rectangle",
    grandeurDemandee: "angle",
    contexte:
      "Une grue de chantier est haubanée par un câble tendu depuis un point d'observation O au sol jusqu'au sommet T du mât. On vise depuis O un point de repère M situé à une hauteur connue sur le mât, puis le sommet T — inaccessible directement.",
    trianglePont,
    donneesPont: [
      { label: "hauteur de M", valeur: hM, unite: "m" },
      { label: "angle d'élévation vers M", valeur: thetaM, unite: "°" },
    ],
    labelCoteTransfere: "OM",
    questionPont: "Calcule la distance OM entre l'observateur et le point M.",
    anglesBrutsVisee: [
      { label: "angle d'élévation vers M", valeur: thetaM, unite: "°" },
      { label: "angle d'élévation vers T", valeur: thetaT, unite: "°" },
    ],
    hypotheseAnnexe: "Le pied F du mât, le point M et le sommet T sont alignés sur une même verticale.",
    distancesParcourues: null,
    triangleCible,
    donneesCibleEnonce: [],
    questionCible: "Calcule l'angle d'inclinaison du câble au sommet T, entre le câble [TO] et le mât [TM].",
    valeurCibleAttendue: angleEnT,
    uniteGrandeurCible: "°",
    points: [
      { nom: "O", x: O_pt.x, y: O_pt.y },
      { nom: "F", x: F_pt.x, y: F_pt.y },
      { nom: "M", x: M_pt.x, y: M_pt.y },
      { nom: "T", x: T_pt.x, y: T_pt.y },
    ],
    segmentsPont: [
      ["O", "F"],
      ["F", "M"],
      ["O", "M"],
    ],
    segmentsCible: [
      ["O", "M"],
      ["M", "T"],
      ["O", "T"],
    ],
    optionsInterpretation: construireOptionsInterpretationTriangleLies({
      labelGrandeur: "L'angle d'inclinaison du câble en T",
      valeurCorrecte: angleEnT,
      uniteCorrecte: "°",
      uniteFautive: "m",
      valeurTransferee: OM,
      valeurPontAlternative: hM,
    }),
  };
}

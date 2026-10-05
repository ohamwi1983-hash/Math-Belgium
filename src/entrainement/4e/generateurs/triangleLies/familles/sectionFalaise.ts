/**
 * Couche A — famille N "sectionFalaise" (`anglePartage`, extension de la banque, spec section 4 —
 * `promptextensionbanquesgen57gen58.md`) : aire de la section triangulaire visible O,M,T sur une
 * paroi/falaise, depuis un point d'observation O et un repère atteignable R (même mécanique de pont
 * QUELCONQUE via triangulation + hypothèse de verticalité que `hauteurArbre.ts`, voir son en-tête et
 * `resoudrePontBaselineVerticalite`, module frère partagé). Contrairement à `hauteurArbre.ts`,
 * `hM` n'a besoin d'être ni affiché ni même calculé : l'aire du triangle cible ne dépend que de
 * `triangleCible` lui-même (`aireTriangle`, déjà utilisée par `terrainRectangle.ts`/`terrainSportif.ts`).
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import { resoudrePontBaselineVerticalite } from "../pontBaselineVerticalite";
import { aireTriangle } from "../../triangle/resoudreTriangle";
import { construireOptionsInterpretationTriangleLies } from "../interpretation";
import { randomInt } from "../aleatoire";

const BASELINE_MIN = 15;
const BASELINE_MAX = 40;
const THETA_M_MIN = 20;
const THETA_M_MAX = 50;
const RHO_MIN = 40;
const RHO_MAX = 90;
const ECART_ANGLE_MIN = 10;
const ECART_ANGLE_MAX = 30;

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

export function construireSectionFalaise(): ExerciceTriangleLies {
  const d = randomInt(BASELINE_MIN, BASELINE_MAX);
  const thetaM = randomInt(THETA_M_MIN, THETA_M_MAX);
  const rho = randomInt(RHO_MIN, RHO_MAX);
  const thetaT = thetaM + randomInt(ECART_ANGLE_MIN, ECART_ANGLE_MAX);

  const { trianglePont, triangleCible, OM } = resoudrePontBaselineVerticalite(d, thetaM, rho, thetaT);
  const aire = aireTriangle(triangleCible.a, triangleCible.b, triangleCible.C);

  const O_pt = { x: 0, y: 0 };
  const R_pt = { x: d, y: 0 };
  const M_pt = { x: OM * Math.cos(versRadians(thetaM)), y: OM * Math.sin(versRadians(thetaM)) };
  const T_pt = { x: M_pt.x, y: M_pt.y + triangleCible.b };

  return {
    famille: "sectionFalaise",
    variante: "anglePartage",
    typeTrianglePont: "quelconque",
    grandeurDemandee: "aire",
    contexte:
      "Un grimpeur souhaite estimer l'aire de la section triangulaire visible d'une paroi rocheuse, entre un point de repère M et le sommet T de la voie. Depuis un point d'observation O et un point de repère atteignable R au pied de la paroi, on vise M puis T.",
    trianglePont,
    donneesPont: [
      { label: "distance OR", valeur: d, unite: "m" },
      { label: "angle ROM", valeur: thetaM, unite: "°" },
      { label: "angle ORM", valeur: rho, unite: "°" },
    ],
    labelCoteTransfere: "OM",
    questionPont: "Calcule la distance OM entre l'observateur et le point M.",
    anglesBrutsVisee: [
      { label: "angle d'élévation vers M", valeur: thetaM, unite: "°" },
      { label: "angle d'élévation vers T", valeur: thetaT, unite: "°" },
    ],
    hypotheseAnnexe: "Le point M et le sommet T sont alignés sur une même verticale (la paroi est ici verticale).",
    distancesParcourues: null,
    triangleCible,
    donneesCibleEnonce: [],
    questionCible: "Calcule l'aire de la section triangulaire OMT visible sur la paroi.",
    valeurCibleAttendue: aire,
    uniteGrandeurCible: "m²",
    points: [
      { nom: "O", x: O_pt.x, y: O_pt.y },
      { nom: "R", x: R_pt.x, y: R_pt.y },
      { nom: "M", x: M_pt.x, y: M_pt.y },
      { nom: "T", x: T_pt.x, y: T_pt.y },
    ],
    segmentsPont: [
      ["O", "R"],
      ["R", "M"],
      ["O", "M"],
    ],
    segmentsCible: [
      ["O", "M"],
      ["M", "T"],
      ["O", "T"],
    ],
    optionsInterpretation: construireOptionsInterpretationTriangleLies({
      labelGrandeur: "L'aire de la section OMT",
      valeurCorrecte: aire,
      uniteCorrecte: "m²",
      uniteFautive: "m",
      valeurTransferee: OM,
      valeurPontAlternative: d,
    }),
  };
}

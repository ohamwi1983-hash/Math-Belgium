/**
 * Couche A — famille D "distanceInaccessible" (`anglePartage`, spec section 4) : distance entre 2
 * points inaccessibles I1/I2, depuis un SEUL point d'observation O et un point de repère
 * ATTEIGNABLE R (baseline OR connue). Triangle "pont" = O,R,I1, QUELCONQUE (ASA : angle ROI1 en O,
 * angle ORI1 en R, côté OR compris — `resoudreAAS` réutilisé directement, sortie relabellée pour
 * que le côté transféré OI1 tombe toujours en slot `a`) → transfère OI1. Triangle "cible" =
 * O,I1,I2 : angle utile = angle ROI2 - angle ROI1 (2 visées depuis le MÊME point O, vers les 2
 * cibles I1/I2, référencées à la même baseline OR) ; hypothèse annexe = (I1I2) ⊥ (OI1) (ex. 2
 * points sur une rive opposée, alignés perpendiculairement à la visée) ⇒ angle en I1 = 90°.
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import type { Triangle } from "../../../core/triangle.types";
import { resoudreAAS } from "../../triangle/resoudreTriangle";
import { construireOptionsInterpretationTriangleLies } from "../interpretation";
import { randomInt } from "../aleatoire";

const BASELINE_MIN = 15;
const BASELINE_MAX = 40;
const PHI1_MIN = 20;
const PHI1_MAX = 50;
const RHO_MIN = 40;
const RHO_MAX = 90;
const ECART_ANGLE_MIN = 8;
const ECART_ANGLE_MAX = 25;

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

export function construireDistanceInaccessible(): ExerciceTriangleLies {
  const d = randomInt(BASELINE_MIN, BASELINE_MAX);
  const phi1 = randomInt(PHI1_MIN, PHI1_MAX);
  const rho = randomInt(RHO_MIN, RHO_MAX);
  const angleEnI1 = 180 - phi1 - rho;

  // resoudreAAS(A,B,a) : A=angleEnI1 (opposite le côté connu d=OR), B=phi1 → sort {a:d, A:angleEnI1,
  // b:RI1, B:phi1, c:OI1, C:rho}. Relabellé pour que trianglePont.a === OI1 (le côté transféré),
  // toujours en slot `a` par convention (voir core/triangleLies.types.ts).
  const brut = resoudreAAS(angleEnI1, phi1, d);
  const trianglePont: Triangle = { a: brut.c, A: brut.C, b: brut.a, B: brut.A, c: brut.b, C: brut.B };
  const OI1 = trianglePont.a;

  const phi2 = phi1 + randomInt(ECART_ANGLE_MIN, ECART_ANGLE_MAX);
  const angleUtile = phi2 - phi1;
  const angleHypothese = 90;
  const angleEnI2 = 180 - angleUtile - angleHypothese;
  const sinI2 = Math.sin(versRadians(angleEnI2));
  const I1I2 = (OI1 * Math.sin(versRadians(angleUtile))) / sinI2;
  const OI2 = (OI1 * Math.sin(versRadians(angleHypothese))) / sinI2;
  const triangleCible: Triangle = { a: OI1, A: angleEnI2, b: I1I2, B: angleUtile, c: OI2, C: angleHypothese };

  const O_pt = { x: 0, y: 0 };
  const R_pt = { x: d, y: 0 };
  const I1_pt = { x: OI1 * Math.cos(versRadians(phi1)), y: OI1 * Math.sin(versRadians(phi1)) };
  const I2_pt = { x: OI2 * Math.cos(versRadians(phi2)), y: OI2 * Math.sin(versRadians(phi2)) };

  return {
    famille: "distanceInaccessible",
    variante: "anglePartage",
    typeTrianglePont: "quelconque",
    grandeurDemandee: "cote",
    contexte:
      "Depuis un point d'observation O et un point de repère atteignable R, on vise 2 points inaccessibles I1 et I2 situés sur la rive opposée d'une rivière.",
    trianglePont,
    donneesPont: [
      { label: "distance OR", valeur: d, unite: "m" },
      { label: "angle ROI1", valeur: phi1, unite: "°" },
      { label: "angle ORI1", valeur: rho, unite: "°" },
    ],
    labelCoteTransfere: "OI1",
    questionPont: "Calcule la distance OI1 entre l'observateur et le point I1.",
    anglesBrutsVisee: [
      { label: "angle ROI1", valeur: phi1, unite: "°" },
      { label: "angle ROI2", valeur: phi2, unite: "°" },
    ],
    hypotheseAnnexe: "La droite (I1I2) est perpendiculaire à la visée (OI1).",
    distancesParcourues: null,
    triangleCible,
    donneesCibleEnonce: [],
    questionCible: "Calcule la distance I1I2 entre les deux points inaccessibles.",
    valeurCibleAttendue: I1I2,
    uniteGrandeurCible: "m",
    points: [
      { nom: "O", x: O_pt.x, y: O_pt.y },
      { nom: "R", x: R_pt.x, y: R_pt.y },
      { nom: "I1", x: I1_pt.x, y: I1_pt.y },
      { nom: "I2", x: I2_pt.x, y: I2_pt.y },
    ],
    segmentsPont: [
      ["O", "R"],
      ["R", "I1"],
      ["O", "I1"],
    ],
    segmentsCible: [
      ["O", "I1"],
      ["I1", "I2"],
      ["O", "I2"],
    ],
    optionsInterpretation: construireOptionsInterpretationTriangleLies({
      labelGrandeur: "La distance I1I2",
      valeurCorrecte: I1I2,
      uniteCorrecte: "m",
      uniteFautive: "°",
      valeurTransferee: OI1,
      valeurPontAlternative: d,
    }),
  };
}

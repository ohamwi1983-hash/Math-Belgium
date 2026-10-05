/**
 * Couche A — famille L "hauteurArbre" (`anglePartage`, extension de la banque, spec section 4 —
 * `promptextensionbanquesgen57gen58.md`) : hauteur d'un arbre inaccessible à mesurer directement
 * (terrain marécageux au pied de l'arbre) — triangule le côté transféré `OM` via un repère
 * atteignable `R` (baseline `OR` + 2 angles, ASA) plutôt que via un triangle rectangle direct comme
 * `hauteurInaccessible.ts`. Toute la géométrie (pont ET hypothèse de verticalité du triangle cible)
 * est déléguée à `resoudrePontBaselineVerticalite` (module frère, voir son en-tête pour le détail
 * complet du mécanisme, partagé avec `sectionFalaise.ts`).
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import { resoudrePontBaselineVerticalite } from "../pontBaselineVerticalite";
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

export function construireHauteurArbre(): ExerciceTriangleLies {
  const d = randomInt(BASELINE_MIN, BASELINE_MAX);
  const thetaM = randomInt(THETA_M_MIN, THETA_M_MAX);
  const rho = randomInt(RHO_MIN, RHO_MAX);
  const thetaT = thetaM + randomInt(ECART_ANGLE_MIN, ECART_ANGLE_MAX);

  const { trianglePont, triangleCible, OM } = resoudrePontBaselineVerticalite(d, thetaM, rho, thetaT);

  const O_pt = { x: 0, y: 0 };
  const R_pt = { x: d, y: 0 };
  const M_pt = { x: OM * Math.cos(versRadians(thetaM)), y: OM * Math.sin(versRadians(thetaM)) };
  const hauteurTotale = M_pt.y + triangleCible.b;
  const T_pt = { x: M_pt.x, y: hauteurTotale };

  return {
    famille: "hauteurArbre",
    variante: "anglePartage",
    typeTrianglePont: "quelconque",
    grandeurDemandee: "cote",
    contexte:
      "Un arbre remarquable pousse au bord d'une zone marécageuse, rendant son pied inaccessible. Depuis un point d'observation O et un point de repère atteignable R, on vise un point M du tronc puis le sommet T de l'arbre.",
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
    hypotheseAnnexe: "Le pied de l'arbre, le point M et le sommet T sont alignés sur une même verticale (le tronc).",
    distancesParcourues: null,
    triangleCible,
    donneesCibleEnonce: [],
    questionCible: "Calcule la hauteur totale de l'arbre (jusqu'au point T).",
    valeurCibleAttendue: hauteurTotale,
    uniteGrandeurCible: "m",
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
      labelGrandeur: "La hauteur totale de l'arbre",
      valeurCorrecte: hauteurTotale,
      uniteCorrecte: "m",
      uniteFautive: "°",
      valeurTransferee: OM,
      valeurPontAlternative: d,
    }),
  };
}

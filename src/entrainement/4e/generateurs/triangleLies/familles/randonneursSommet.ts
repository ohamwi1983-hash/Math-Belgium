/**
 * Couche A — famille Q "randonneursSommet" (`sommetPartage`) : même mécanique EXACTE que
 * `naviresConvergents.ts` (module frère, voir son en-tête pour le détail), narration inversée —
 * le sommet commun S est ici un SOMMET DE MONTAGNE (le point vers lequel convergent 2 sentiers,
 * plutôt qu'un point de départ) et A/B sont 2 camps de base connus (distants de `baseline`, donnée)
 * d'où partent les 2 sentiers. Mathématiquement identique : `distancesParcourues` reste la distance
 * déjà parcourue DEPUIS le camp, donc la distance restante au sommet diminue d'autant
 * (`SC = SA - d1`, exactement la même soustraction que pour `naviresConvergents`) — seule la
 * narration change de sens (on s'approche du sommet plutôt que de s'en éloigner).
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import { resoudreSAS } from "../../triangle/resoudreTriangle";
import { resoudrePontSommetPartageQuelconque } from "../pontSommetPartage";
import { construireOptionsInterpretationTriangleLies } from "../interpretation";
import { randomInt } from "../aleatoire";

const ANGLE_FINAL_MIN = 25;
const ANGLE_FINAL_MAX = 65;
const BASELINE_MIN = 6;
const BASELINE_MAX = 16;
const COTE_MIN_UTILE = 8;
const DISTANCE_MIN = 1;
const DISTANCE_MARGE = 2;
const TENTATIVES_MAX = 200;

export function construireRandonneursSommet(): ExerciceTriangleLies {
  let angleFinal1 = 0;
  let angleFinal2 = 0;
  let baseline = 0;
  let trianglePont = resoudrePontSommetPartageQuelconque(1, 1, 1);
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    angleFinal1 = randomInt(ANGLE_FINAL_MIN, ANGLE_FINAL_MAX);
    angleFinal2 = randomInt(ANGLE_FINAL_MIN, ANGLE_FINAL_MAX);
    baseline = randomInt(BASELINE_MIN, BASELINE_MAX);
    trianglePont = resoudrePontSommetPartageQuelconque(angleFinal1, angleFinal2, baseline);
    if (trianglePont.b >= COTE_MIN_UTILE && trianglePont.c >= COTE_MIN_UTILE) break;
  }

  const d1 = randomInt(DISTANCE_MIN, Math.floor(trianglePont.b) - DISTANCE_MARGE);
  const d2 = randomInt(DISTANCE_MIN, Math.floor(trianglePont.c) - DISTANCE_MARGE);

  const triangleCible = resoudreSAS(trianglePont.b - d1, trianglePont.c - d2, trianglePont.A);
  const distance = triangleCible.a;

  const S_pt = { x: 0, y: 0 };
  const angleRad = (trianglePont.A * Math.PI) / 180;
  const A_pt = { x: trianglePont.b, y: 0 };
  const B_pt = { x: trianglePont.c * Math.cos(angleRad), y: trianglePont.c * Math.sin(angleRad) };
  const C_pt = { x: trianglePont.b - d1, y: 0 };
  const D_pt = { x: (trianglePont.c - d2) * Math.cos(angleRad), y: (trianglePont.c - d2) * Math.sin(angleRad) };

  const sansSoustraction = resoudreSAS(trianglePont.b, trianglePont.c, trianglePont.A);
  const soustractionInversee = resoudreSAS(trianglePont.b - d2, trianglePont.c - d1, trianglePont.A);

  return {
    famille: "randonneursSommet",
    variante: "sommetPartage",
    typeTrianglePont: "quelconque",
    grandeurDemandee: "cote",
    contexte:
      "Deux randonneurs partent de 2 camps de base A et B, distants de " +
      `${baseline} km, en direction d'un même sommet S. Chacun suit un sentier rectiligne vers ce sommet.`,
    trianglePont,
    donneesPont: [
      { label: "distance AB", valeur: baseline, unite: "km" },
      { label: "angle SAB", valeur: angleFinal1, unite: "°" },
      { label: "angle SBA", valeur: angleFinal2, unite: "°" },
    ],
    labelCoteTransfere: "angle en S, SA, SB",
    questionPont: "Calcule l'angle en S ainsi que les distances SA et SB (longueur totale de chaque sentier).",
    anglesBrutsVisee: null,
    hypotheseAnnexe: null,
    distancesParcourues: [
      { label: "distance déjà parcourue par le randonneur 1", valeur: d1, unite: "km" },
      { label: "distance déjà parcourue par le randonneur 2", valeur: d2, unite: "km" },
    ],
    triangleCible,
    donneesCibleEnonce: [],
    questionCible: "Calcule la distance entre les 2 randonneurs à cet instant.",
    valeurCibleAttendue: distance,
    uniteGrandeurCible: "km",
    points: [
      { nom: "S", x: S_pt.x, y: S_pt.y },
      { nom: "A", x: A_pt.x, y: A_pt.y },
      { nom: "B", x: B_pt.x, y: B_pt.y },
      { nom: "C", x: C_pt.x, y: C_pt.y },
      { nom: "D", x: D_pt.x, y: D_pt.y },
    ],
    segmentsPont: [
      ["S", "A"],
      ["S", "B"],
      ["A", "B"],
    ],
    segmentsCible: [
      ["S", "C"],
      ["S", "D"],
      ["C", "D"],
    ],
    optionsInterpretation: construireOptionsInterpretationTriangleLies({
      labelGrandeur: "La distance entre les 2 randonneurs",
      valeurCorrecte: distance,
      uniteCorrecte: "km",
      uniteFautive: "°",
      valeurTransferee: sansSoustraction.a,
      valeurPontAlternative: soustractionInversee.a,
    }),
  };
}

/**
 * Couche A — famille P "naviresConvergents" (`sommetPartage`, nouvelle configuration — spec
 * `da725458-specgen58triangleslies.md`, confirmée par un sujet d'examen officiel FWB, Liège juillet
 * 2012). Deux navires quittent un même port O, en direction de 2 destinations A et B distantes de
 * `baseline` (donnée) l'une de l'autre — les angles aux destinations (angle OAB en A, angle OBA en
 * B) sont donnés directement. Résolu via `resoudrePontSommetPartageQuelconque`
 * (`pontSommetPartage.ts`, module frère partagé avec `randonneursSommet.ts`) : donne directement
 * `trianglePont.A` = angle au port O, `.b` = OA (route du navire 1), `.c` = OB (route du navire 2).
 *
 * Chaque navire a déjà parcouru une distance connue (`distancesParcourues`) le long de sa propre
 * route — les points C/D (positions actuelles) sont donc sur les segments [OA]/[OB], à distance
 * `OA-d1`/`OB-d2` de O. `triangleCible` = résolu par `resoudreSAS(OA-d1, OB-d2, angleO)` (angle au
 * sommet TRANSFÉRÉ tel quel, jamais recalculé) → `triangleCible.a` = distance entre les 2 navires,
 * la grandeur demandée.
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import { resoudreSAS } from "../../triangle/resoudreTriangle";
import { resoudrePontSommetPartageQuelconque } from "../pontSommetPartage";
import { construireOptionsInterpretationTriangleLies } from "../interpretation";
import { randomInt } from "../aleatoire";

const ANGLE_FINAL_MIN = 25;
const ANGLE_FINAL_MAX = 65;
const BASELINE_MIN = 25;
const BASELINE_MAX = 55;
const COTE_MIN_UTILE = 12;
const DISTANCE_MIN = 3;
const DISTANCE_MARGE = 3;
const TENTATIVES_MAX = 200;

export function construireNaviresConvergents(): ExerciceTriangleLies {
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

  const O_pt = { x: 0, y: 0 };
  const angleRad = (trianglePont.A * Math.PI) / 180;
  const A_pt = { x: trianglePont.b, y: 0 };
  const B_pt = { x: trianglePont.c * Math.cos(angleRad), y: trianglePont.c * Math.sin(angleRad) };
  const C_pt = { x: trianglePont.b - d1, y: 0 };
  const D_pt = { x: (trianglePont.c - d2) * Math.cos(angleRad), y: (trianglePont.c - d2) * Math.sin(angleRad) };

  const sansSoustraction = resoudreSAS(trianglePont.b, trianglePont.c, trianglePont.A);
  const soustractionInversee = resoudreSAS(trianglePont.b - d2, trianglePont.c - d1, trianglePont.A);

  return {
    famille: "naviresConvergents",
    variante: "sommetPartage",
    typeTrianglePont: "quelconque",
    grandeurDemandee: "cote",
    contexte:
      "Deux navires quittent le même port O, en direction de 2 destinations A et B distantes de " +
      `${baseline} km. Chaque navire suit une route rectiligne vers sa destination.`,
    trianglePont,
    donneesPont: [
      { label: "distance AB", valeur: baseline, unite: "km" },
      { label: "angle OAB", valeur: angleFinal1, unite: "°" },
      { label: "angle OBA", valeur: angleFinal2, unite: "°" },
    ],
    labelCoteTransfere: "angle en O, OA, OB",
    questionPont: "Calcule l'angle en O ainsi que les distances OA et OB.",
    anglesBrutsVisee: null,
    hypotheseAnnexe: null,
    distancesParcourues: [
      { label: "distance déjà parcourue par le navire 1", valeur: d1, unite: "km" },
      { label: "distance déjà parcourue par le navire 2", valeur: d2, unite: "km" },
    ],
    triangleCible,
    donneesCibleEnonce: [],
    questionCible: "Calcule la distance entre les 2 navires à cet instant.",
    valeurCibleAttendue: distance,
    uniteGrandeurCible: "km",
    points: [
      { nom: "O", x: O_pt.x, y: O_pt.y },
      { nom: "A", x: A_pt.x, y: A_pt.y },
      { nom: "B", x: B_pt.x, y: B_pt.y },
      { nom: "C", x: C_pt.x, y: C_pt.y },
      { nom: "D", x: D_pt.x, y: D_pt.y },
    ],
    segmentsPont: [
      ["O", "A"],
      ["O", "B"],
      ["A", "B"],
    ],
    segmentsCible: [
      ["O", "C"],
      ["O", "D"],
      ["C", "D"],
    ],
    optionsInterpretation: construireOptionsInterpretationTriangleLies({
      labelGrandeur: "La distance entre les 2 navires",
      valeurCorrecte: distance,
      uniteCorrecte: "km",
      uniteFautive: "°",
      valeurTransferee: sansSoustraction.a,
      valeurPontAlternative: soustractionInversee.a,
    }),
  };
}

/**
 * Couche A — famille R "avionsConvergents" (`sommetPartage`, seule famille RECTANGLE de cette
 * configuration) : 2 avions convergent vers un même aéroport S, en suivant 2 routes PERPENDICULAIRES
 * (angle droit AU SOMMET COMMUN S — le seul cas de tout le générateur où l'angle droit coïncide avec
 * le sommet partagé, imposé par la convention "le sommet partagé reste toujours `A`"). La route du
 * vol 1 (`b = SA`) est donnée directement, ainsi que la distance à vol d'oiseau entre les 2 villes
 * de départ A/B (`baseline = AB`, l'hypoténuse) — la route du vol 2 (`c = SB`) se déduit par
 * Pythagore (`c = sqrt(baseline²-b²)`, `baseline=b+extra` par construction pour garantir
 * `baseline>b`) : même niveau "léger, prérequis 3e" que les autres ponts rectangle du générateur
 * (toujours exactement UN inconnu calculé).
 *
 * Chaque avion a déjà parcouru une distance connue vers S (`distancesParcourues`) — mêmes principes
 * de soustraction que `naviresConvergents.ts`/`randonneursSommet.ts`. Grandeur demandée = l'AIRE du
 * triangle cible (seule famille `sommetPartage` sur l'aire, garantit le palier d'aide à 3 niveaux).
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import { resoudreSAS, aireTriangle } from "../../triangle/resoudreTriangle";
import { construireOptionsInterpretationTriangleLies } from "../interpretation";
import { randomInt } from "../aleatoire";

const LEG_B_MIN = 15;
const LEG_B_MAX = 30;
const EXTRA_MIN = 15;
const EXTRA_MAX = 30;
const DISTANCE_MIN = 3;
const DISTANCE_MARGE = 3;

export function construireAvionsConvergents(): ExerciceTriangleLies {
  const b = randomInt(LEG_B_MIN, LEG_B_MAX);
  const extra = randomInt(EXTRA_MIN, EXTRA_MAX);
  const baseline = b + extra;
  const c = Math.sqrt(baseline * baseline - b * b);

  const trianglePont = resoudreSAS(b, c, 90);

  const d1 = randomInt(DISTANCE_MIN, Math.floor(trianglePont.b) - DISTANCE_MARGE);
  const d2 = randomInt(DISTANCE_MIN, Math.floor(trianglePont.c) - DISTANCE_MARGE);

  const triangleCible = resoudreSAS(trianglePont.b - d1, trianglePont.c - d2, trianglePont.A);
  const aire = aireTriangle(triangleCible.b, triangleCible.c, triangleCible.A);

  const S_pt = { x: 0, y: 0 };
  const A_pt = { x: trianglePont.b, y: 0 };
  const B_pt = { x: 0, y: trianglePont.c };
  const C_pt = { x: trianglePont.b - d1, y: 0 };
  const D_pt = { x: 0, y: trianglePont.c - d2 };

  const sansSoustraction = resoudreSAS(trianglePont.b, trianglePont.c, trianglePont.A);
  const aireSansSoustraction = aireTriangle(sansSoustraction.b, sansSoustraction.c, sansSoustraction.A);
  const soustractionInversee = resoudreSAS(trianglePont.b - d2, trianglePont.c - d1, trianglePont.A);
  const aireSoustractionInversee = aireTriangle(soustractionInversee.b, soustractionInversee.c, soustractionInversee.A);

  return {
    famille: "avionsConvergents",
    variante: "sommetPartage",
    typeTrianglePont: "rectangle",
    grandeurDemandee: "aire",
    contexte:
      "Deux avions convergent vers le même aéroport S, en suivant 2 routes perpendiculaires depuis " +
      `leurs villes de départ A et B, distantes à vol d'oiseau de ${baseline} km.`,
    trianglePont,
    donneesPont: [
      { label: "distance SA", valeur: b, unite: "km" },
      { label: "distance AB", valeur: baseline, unite: "km" },
    ],
    labelCoteTransfere: "angle en S, SA, SB",
    questionPont: "Calcule la distance SB (les 2 routes sont perpendiculaires en S).",
    anglesBrutsVisee: null,
    hypotheseAnnexe: null,
    distancesParcourues: [
      { label: "distance déjà parcourue par le vol 1", valeur: d1, unite: "km" },
      { label: "distance déjà parcourue par le vol 2", valeur: d2, unite: "km" },
    ],
    triangleCible,
    donneesCibleEnonce: [],
    questionCible: "Calcule l'aire du triangle formé par les positions actuelles des 2 avions et l'aéroport S.",
    valeurCibleAttendue: aire,
    uniteGrandeurCible: "km²",
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
      labelGrandeur: "L'aire du triangle formé par les 2 avions et l'aéroport",
      valeurCorrecte: aire,
      uniteCorrecte: "km²",
      uniteFautive: "km",
      valeurTransferee: aireSansSoustraction,
      valeurPontAlternative: aireSoustractionInversee,
    }),
  };
}

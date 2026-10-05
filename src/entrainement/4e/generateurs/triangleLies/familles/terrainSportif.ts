/**
 * Couche A — famille J "terrainSportif" (`cotePartage`, extension de la banque, spec section 4 —
 * `promptextensionbanquesgen57gen58.md`) : même mécanique EXACTE que `terrainQuelconque.ts` (pont
 * ABC QUELCONQUE via SAS, `resoudreSAS` réutilisé directement) — seule différence : la grandeur
 * demandée pour le triangle cible ACD est son AIRE (`aireTriangle`, déjà utilisée par
 * `terrainRectangle.ts`) plutôt qu'un côté. Combinaison pont-quelconque/aire-demandée absente des 4
 * familles d'origine (A=rectangle+aire, B=quelconque+côté) — voir `core/triangleLies.types.ts`.
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import type { Triangle } from "../../../core/triangle.types";
import { resoudreSAS, aireTriangle } from "../../triangle/resoudreTriangle";
import { placerSommetOppose } from "../geometrieSketch";
import { construireOptionsInterpretationTriangleLies } from "../interpretation";
import { randomInt } from "../aleatoire";

const COTE_MIN = 8;
const COTE_MAX = 20;
const ANGLE_PONT_MIN = 40;
const ANGLE_PONT_MAX = 110;
const ANGLE_CIBLE_MIN = 25;
const ANGLE_CIBLE_MAX = 65;

const SKINS: string[] = [
  "Un terrain de sport a la forme du quadrilatère ABCD. La diagonale [AC] partage le terrain en 2 triangles : le triangle ABC et le triangle ACD.",
  "Un city-stade a la forme du quadrilatère ABCD. La diagonale [AC] partage le terrain en 2 triangles : le triangle ABC et le triangle ACD.",
];

export function construireTerrainSportif(): ExerciceTriangleLies {
  const AB = randomInt(COTE_MIN, COTE_MAX);
  const BC = randomInt(COTE_MIN, COTE_MAX);
  const angleABC = randomInt(ANGLE_PONT_MIN, ANGLE_PONT_MAX);
  const trianglePont = resoudreSAS(AB, BC, angleABC);
  const AC = trianglePont.a;

  const angleDAC = randomInt(ANGLE_CIBLE_MIN, ANGLE_CIBLE_MAX);
  const angleDCA = randomInt(ANGLE_CIBLE_MIN, ANGLE_CIBLE_MAX);
  const angleADC = 180 - angleDAC - angleDCA;
  const sinD = Math.sin((angleADC * Math.PI) / 180);
  const CD = (AC * Math.sin((angleDAC * Math.PI) / 180)) / sinD;
  const AD = (AC * Math.sin((angleDCA * Math.PI) / 180)) / sinD;

  const triangleCible: Triangle = { a: AC, A: angleADC, b: CD, B: angleDAC, c: AD, C: angleDCA };
  const aire = aireTriangle(triangleCible.a, triangleCible.b, triangleCible.C);

  const B_pt = { x: 0, y: 0 };
  const A_pt = { x: AB, y: 0 };
  const angleRad = (angleABC * Math.PI) / 180;
  const C_pt = { x: BC * Math.cos(angleRad), y: BC * Math.sin(angleRad) };
  const D_pt = placerSommetOppose(A_pt, C_pt, angleDAC, AD, B_pt);

  const contexte = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "terrainSportif",
    variante: "cotePartage",
    typeTrianglePont: "quelconque",
    grandeurDemandee: "aire",
    contexte,
    trianglePont,
    donneesPont: [
      { label: "AB", valeur: AB, unite: "m" },
      { label: "BC", valeur: BC, unite: "m" },
      { label: "angle ABC", valeur: angleABC, unite: "°" },
    ],
    labelCoteTransfere: "AC",
    questionPont: "Calcule la longueur de la diagonale [AC].",
    anglesBrutsVisee: null,
    hypotheseAnnexe: null,
    distancesParcourues: null,
    triangleCible,
    donneesCibleEnonce: [
      { label: "angle DAC", valeur: angleDAC, unite: "°" },
      { label: "angle DCA", valeur: angleDCA, unite: "°" },
    ],
    questionCible: "Calcule l'aire du terrain ACD.",
    valeurCibleAttendue: aire,
    uniteGrandeurCible: "m²",
    points: [
      { nom: "A", x: A_pt.x, y: A_pt.y },
      { nom: "B", x: B_pt.x, y: B_pt.y },
      { nom: "C", x: C_pt.x, y: C_pt.y },
      { nom: "D", x: D_pt.x, y: D_pt.y },
    ],
    segmentsPont: [
      ["A", "B"],
      ["B", "C"],
      ["A", "C"],
    ],
    segmentsCible: [
      ["A", "C"],
      ["C", "D"],
      ["A", "D"],
    ],
    optionsInterpretation: construireOptionsInterpretationTriangleLies({
      labelGrandeur: "L'aire du terrain",
      valeurCorrecte: aire,
      uniteCorrecte: "m²",
      uniteFautive: "m",
      valeurTransferee: AC,
      valeurPontAlternative: AB,
    }),
  };
}

/**
 * Couche A — famille B "terrainQuelconque" (`cotePartage`, spec section 4, variante de la famille A) :
 * même principe qu'un terrain quadrilatère ABCD scindé par la diagonale AC, mais le triangle "pont"
 * ABC est lui-même QUELCONQUE (SAS : côtés AB/BC + angle compris ABC, `resoudreSAS` réutilisé
 * directement) — transfère AC. Triangle "cible" ACD : mêmes principes que la famille A (2 angles
 * donnés dans l'énoncé), grandeur demandée = un CÔTÉ (CD) plutôt qu'une aire.
 *
 * **3 narrations (skin H ajoutée à la narration d'origine B, puis skin O "Quadrilatère de villes",
 * `da725458-specgen58triangleslies.md`, section 4)** — même principe que `terrainRectangle.ts`
 * (voir son en-tête) : même mécanique géométrique EXACTE, seule la phrase de contexte varie. Le
 * spec propose "aire ou côté manquant" pour O — tranché ici en faveur du "côté manquant", déjà la
 * grandeur de cette famille (aucune nouvelle famille de catalogue nécessaire).
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import type { Triangle } from "../../../core/triangle.types";
import { resoudreSAS } from "../../triangle/resoudreTriangle";
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
  "Un terrain a la forme du quadrilatère ABCD. La diagonale [AC] partage le terrain en 2 triangles : le triangle ABC et le triangle ACD.",
  "Un architecte dessine le plan d'étage d'une pièce de forme quadrilatère ABCD. La diagonale [AC] partage la pièce en 2 triangles : le triangle ABC et le triangle ACD.",
  "4 villes A, B, C et D forment un quadrilatère. La diagonale [AC] (reliant les villes A et C) partage ce quadrilatère en 2 triangles : le triangle ABC et le triangle ACD.",
];

export function construireTerrainQuelconque(): ExerciceTriangleLies {
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

  const B_pt = { x: 0, y: 0 };
  const A_pt = { x: AB, y: 0 };
  const angleRad = (angleABC * Math.PI) / 180;
  const C_pt = { x: BC * Math.cos(angleRad), y: BC * Math.sin(angleRad) };
  const D_pt = placerSommetOppose(A_pt, C_pt, angleDAC, AD, B_pt);

  const contexte = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "terrainQuelconque",
    variante: "cotePartage",
    typeTrianglePont: "quelconque",
    grandeurDemandee: "cote",
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
    questionCible: "Calcule la longueur du côté [CD].",
    valeurCibleAttendue: CD,
    uniteGrandeurCible: "m",
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
      labelGrandeur: "Le côté CD",
      valeurCorrecte: CD,
      uniteCorrecte: "m",
      uniteFautive: "°",
      valeurTransferee: AC,
      valeurPontAlternative: AB,
    }),
  };
}

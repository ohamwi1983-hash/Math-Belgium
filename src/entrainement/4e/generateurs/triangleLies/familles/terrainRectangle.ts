/**
 * Couche A — famille A "terrainRectangle" (`cotePartage`, spec section 4) : un terrain
 * quadrilatère ABCD, diagonale AC. Triangle "pont" = ABC, RECTANGLE en B (deux jambes AB/BC
 * données, prérequis SOH-CAH-TOA/Pythagore de 3e) → transfère AC. Triangle "cible" = ACD, dont les
 * 2 angles (DAC, DCA) sont déjà donnés dans l'énoncé (résolu par ASA/loi des sinus, `resoudreAAS`
 * réutilisé implicitement via un calcul direct équivalent) → grandeur demandée = aire d'ACD.
 *
 * Convention interne (voir `core/triangleLies.types.ts`) : côté transféré toujours `trianglePont.a`
 * (= AC ici), reçu dans `triangleCible.a`. `triangleCible.B`/`.C` = angleDAC/angleDCA (donnés).
 *
 * **3 narrations (skins G/I ajoutées à la narration d'origine A)** — `promptextensionbanquesgen57gen58.md` :
 * même mécanique géométrique EXACTE (aucun changement de plage numérique/labels A/B/C/D), seule la
 * phrase de contexte varie — même principe que les `SKINS` de gen55/gen57 (voir CLAUDE.md,
 * "Catalogue de variantes"), introduit ici pour la première fois dans gen58.
 */
import type { ExerciceTriangleLies } from "../../../core/triangleLies.types";
import type { Triangle } from "../../../core/triangle.types";
import { aireTriangle } from "../../triangle/resoudreTriangle";
import { placerSommetOppose } from "../geometrieSketch";
import { construireOptionsInterpretationTriangleLies } from "../interpretation";
import { randomInt } from "../aleatoire";

const LEG_MIN = 6;
const LEG_MAX = 18;
const ANGLE_MIN = 25;
const ANGLE_MAX = 65;

const SKINS: string[] = [
  "Un terrain a la forme du quadrilatère ABCD. La diagonale [AC] partage le terrain en 2 triangles : le triangle ABC, rectangle en B, et le triangle ACD.",
  "Un géomètre borne une parcelle cadastrale de forme quadrilatère ABCD. La diagonale [AC] relevée sur le plan partage la parcelle en 2 triangles : le triangle ABC, rectangle en B, et le triangle ACD.",
  "Une île de forme quadrilatère ABCD a été relevée par GPS. La diagonale [AC] partage l'île en 2 triangles : le triangle ABC, rectangle en B, et le triangle ACD.",
];

export function construireTerrainRectangle(): ExerciceTriangleLies {
  const AB = randomInt(LEG_MIN, LEG_MAX);
  const BC = randomInt(LEG_MIN, LEG_MAX);
  const AC = Math.hypot(AB, BC);
  const angleBAC = (Math.atan2(BC, AB) * 180) / Math.PI;
  const angleBCA = 90 - angleBAC;

  const trianglePont: Triangle = { a: AC, A: 90, b: AB, B: angleBCA, c: BC, C: angleBAC };

  const angleDAC = randomInt(ANGLE_MIN, ANGLE_MAX);
  const angleDCA = randomInt(ANGLE_MIN, ANGLE_MAX);
  const angleADC = 180 - angleDAC - angleDCA;
  const sinD = Math.sin((angleADC * Math.PI) / 180);
  const CD = (AC * Math.sin((angleDAC * Math.PI) / 180)) / sinD;
  const AD = (AC * Math.sin((angleDCA * Math.PI) / 180)) / sinD;

  const triangleCible: Triangle = { a: AC, A: angleADC, b: CD, B: angleDAC, c: AD, C: angleDCA };
  const aire = aireTriangle(triangleCible.a, triangleCible.b, triangleCible.C);

  const B_pt = { x: 0, y: 0 };
  const A_pt = { x: AB, y: 0 };
  const C_pt = { x: 0, y: BC };
  const D_pt = placerSommetOppose(A_pt, C_pt, angleDAC, AD, B_pt);

  const contexte = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "terrainRectangle",
    variante: "cotePartage",
    typeTrianglePont: "rectangle",
    grandeurDemandee: "aire",
    contexte,
    trianglePont,
    donneesPont: [
      { label: "AB", valeur: AB, unite: "m" },
      { label: "BC", valeur: BC, unite: "m" },
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

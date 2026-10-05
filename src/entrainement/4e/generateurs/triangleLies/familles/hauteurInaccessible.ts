/**
 * Couche A — famille C "hauteurInaccessible" (`anglePartage`, spec section 4) : hauteur d'un objet
 * vertical inaccessible (mât, arbre...), depuis un SEUL point d'observation O. Un point de repère M
 * à hauteur CONNUE `h_M` sur le même support vertical que le sommet visé T (T plus haut que M, pied
 * F au sol). Triangle "pont" = O,F,M, RECTANGLE en F (SOH-CAH-TOA : `OM = h_M / sin(θ_M)`) →
 * transfère OM. Triangle "cible" = O,M,T : angle utile = θ_T-θ_M (différence des 2 visées prises
 * depuis le MÊME point O) ; hypothèse annexe = verticalité de F,M,T (colinéaires) ⇒ angle OMT =
 * 180°-angleOMF = 90°+θ_M. Grandeur demandée = la hauteur TOTALE de l'objet = `h_M + MT` (MT =
 * `triangleCible.b`, un ajout simple d'une donnée déjà affichée à l'écran "pont" — jamais un champ
 * brut du triangle résolu, voir CLAUDE.md pour la justification de ce léger écart au patron
 * générique des 3 autres familles).
 *
 * **2 narrations (skin K "antenne/pylône" ajoutée à la narration d'origine C "mât")** — contrairement
 * à `terrainRectangle.ts`/`terrainQuelconque.ts` (une seule phrase de contexte par skin), ce
 * générateur a 3 points d'affichage narratifs (`contexte`, `hypotheseAnnexe`, `questionCible`) plus
 * le libellé de l'écran d'interprétation — tous les 4 doivent nommer le MÊME objet, d'où un objet
 * `SkinHauteurInaccessible` regroupant les 4 champs plutôt qu'un simple tableau de chaînes.
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

interface SkinHauteurInaccessible {
  contexte: string;
  hypotheseAnnexe: string;
  questionCible: (hM: number) => string;
  labelGrandeur: string;
}

const SKINS: SkinHauteurInaccessible[] = [
  {
    contexte:
      "Depuis un point d'observation O, on vise un point de repère M situé à une hauteur connue sur un mât vertical, puis le sommet T du même mât — inaccessible directement.",
    hypotheseAnnexe: "Le pied F du mât, le point M et le sommet T sont alignés sur une même verticale.",
    questionCible: (hM) => `Calcule la hauteur totale du mât (jusqu'au point T), sachant que M se trouve à ${hM} m de hauteur.`,
    labelGrandeur: "La hauteur totale du mât",
  },
  {
    contexte:
      "Depuis un point d'observation O, on vise un point de repère M situé à une hauteur connue sur un pylône télécom vertical, puis le sommet T de l'antenne fixée à son extrémité — inaccessible directement.",
    hypotheseAnnexe: "Le pied F du pylône, le point M et le sommet T (haut de l'antenne) sont alignés sur une même verticale.",
    questionCible: (hM) => `Calcule la hauteur totale du pylône et de son antenne (jusqu'au point T), sachant que M se trouve à ${hM} m de hauteur.`,
    labelGrandeur: "La hauteur totale du pylône et de son antenne",
  },
];

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

export function construireHauteurInaccessible(): ExerciceTriangleLies {
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

  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "hauteurInaccessible",
    variante: "anglePartage",
    typeTrianglePont: "rectangle",
    grandeurDemandee: "cote",
    contexte: skin.contexte,
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
    hypotheseAnnexe: skin.hypotheseAnnexe,
    distancesParcourues: null,
    triangleCible,
    donneesCibleEnonce: [],
    questionCible: skin.questionCible(hM),
    valeurCibleAttendue: hauteurTotale,
    uniteGrandeurCible: "m",
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
      labelGrandeur: skin.labelGrandeur,
      valeurCorrecte: hauteurTotale,
      uniteCorrecte: "m",
      uniteFautive: "°",
      valeurTransferee: OM,
      valeurPontAlternative: hM,
    }),
  };
}

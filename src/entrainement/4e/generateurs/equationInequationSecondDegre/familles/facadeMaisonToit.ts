/**
 * Famille "facadeMaisonToit" — architecture B ("construction géométrique", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) : AUCUNE formule n'est révélée dans
 * l'énoncé — seulement la somme S de la largeur et de la hauteur du mur (fixée), la hauteur du
 * toit h0 (fixée), et la largeur x comme inconnue. L'élève doit reconstruire lui-même la hauteur
 * du mur (S-x), puis l'aire TOTALE de la façade (mur rectangulaire + toit triangulaire, même
 * largeur x que base commune), AVANT de poser l'équation/l'inéquation.
 *
 * Mathématiquement, vue en façade (élévation, PAS en plan — mur et toit sont dans le MÊME plan
 * vertical, donc leurs aires s'additionnent sans incohérence dimensionnelle) :
 *   aire(x) = x·(S-x) [mur] + 0,5·x·h0 [toit] = -x² + (S+0,5·h0)·x
 * En posant `xS=(S+0,5·h0)/2` (donc `S=2·xS-0,5·h0`, "cible d'abord" — `xS` choisi EN PREMIER,
 * `h0` ensuite, `S` DÉRIVÉ), on retombe sur la forme sommet `aire(x) = -(x-xS)²+xS²` (`aAbs=1`,
 * `yS=xS²`) — EXACTE, jamais un facteur d'échelle artificiel. `h0` pair (2 ou 4 m) pour que `S`
 * reste entier. Marge `xS≥13` (au lieu de 12 pour les autres familles B) pour garantir que le
 * domaine ne dépasse jamais `x=S` (hauteur du mur négative sinon) même avec `h0=4`.
 */
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinFacadeMaisonToit {
  phraseEnonce: (sommeLargeurHauteurMur: number, hauteurToit: number) => string;
}

const SKINS: SkinFacadeMaisonToit[] = [
  {
    phraseEnonce: (sommeLargeurHauteurMur, hauteurToit) =>
      `Un architecte dessine la façade d'un chalet : un mur rectangulaire surmonté d'un toit triangulaire (pignon) de même largeur que le mur. La somme de la largeur et de la hauteur du mur vaut ${sommeLargeurHauteurMur} m, et la hauteur du toit (mesurée au faîte) vaut ${hauteurToit} m. La largeur de la façade mesure x m.`,
  },
  {
    phraseEnonce: (sommeLargeurHauteurMur, hauteurToit) =>
      `Un charpentier prépare les plans de la façade d'une grange : un mur rectangulaire surmonté d'un toit triangulaire (pignon) de même largeur que le mur. La somme de la largeur et de la hauteur du mur vaut ${sommeLargeurHauteurMur} m, et la hauteur du toit (mesurée au faîte) vaut ${hauteurToit} m. La largeur de la façade mesure x m.`,
  },
  {
    phraseEnonce: (sommeLargeurHauteurMur, hauteurToit) =>
      `Une agence immobilière illustre la façade d'une maison : un mur rectangulaire surmonté d'un toit triangulaire (pignon) de même largeur que le mur. La somme de la largeur et de la hauteur du mur vaut ${sommeLargeurHauteurMur} m, et la hauteur du toit (mesurée au faîte) vaut ${hauteurToit} m. La largeur de la façade mesure x m.`,
  },
];

const X_S_MIN = 13;
const X_S_MAX = 16;
const HAUTEURS_TOIT = [2, 4];

export const construireFacadeMaisonToit = construireAvecParametres(() => {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const hauteurToit = HAUTEURS_TOIT[randomInt(0, HAUTEURS_TOIT.length - 1)]!;
  const sommeLargeurHauteurMur = 2 * xS - hauteurToit / 2;
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "facadeMaisonToit",
    xS,
    aAbs: 1,
    signe: -1,
    yS: xS * xS,
    xMinPossible: 0,
    phraseEnonce: () => skin.phraseEnonce(sommeLargeurHauteurMur, hauteurToit),
    labelVariable: "x",
    nomVariable: "la largeur de la façade",
    nomGrandeur: "l'aire totale de la façade",
    genreGrandeur: "feminin",
    uniteVariable: "m",
    uniteGrandeur: "m²",
    uniteGrandeurFautive: "m",
    croquis: { type: "facadeMaisonToit" },
  };
});

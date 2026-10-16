/**
 * Famille "rendementEngrais" — rendement R(x) (kg/are) d'une culture en fonction de la quantité
 * d'engrais x (kg/are) épandue : trop peu d'engrais limite la croissance, trop en épandre
 * endommage la culture (sursaturation) — parabole concave (`signe: -1`), maximum atteint pour une
 * dose optimale `xS`. `yS` (rendement maximal, réaliste) choisi EN PREMIER, `aAbs` DÉRIVÉ par
 * `deriveAAbsSurDomaine` pour garantir un rendement jamais négatif sur tout le domaine.
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres, deriveAAbsSurDomaine } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinRendementEngrais {
  culture: string;
  phraseEnonce: (culture: string, a: number, b: number, c: number) => string;
}

const SKINS: SkinRendementEngrais[] = [
  {
    culture: "blé",
    phraseEnonce: (culture, a, b, c) =>
      `Un agriculteur étudie l'effet d'un engrais sur le rendement de son champ de ${culture} ; le rendement R (en kg/are) en fonction de la quantité d'engrais x (en kg/are) épandue vaut $R(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    culture: "maïs",
    phraseEnonce: (culture, a, b, c) =>
      `Une coopérative agricole teste un nouvel engrais sur une parcelle de ${culture} ; le rendement R (en kg/are) en fonction de la quantité d'engrais x (en kg/are) épandue vaut $R(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    culture: "pommes de terre",
    phraseEnonce: (culture, a, b, c) =>
      `Un maraîcher cherche la dose d'engrais idéale pour sa culture de ${culture} ; le rendement R (en kg/are) en fonction de la quantité d'engrais x (en kg/are) épandue vaut $R(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 12;
const X_S_MAX = 20;
const Y_S_MIN = 40;
const Y_S_MAX = 70;

export const construireRendementEngrais = construireAvecParametres(() => {
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;
  const yS = randomInt(Y_S_MIN, Y_S_MAX);

  return {
    famille: "rendementEngrais",
    xS: randomInt(X_S_MIN, X_S_MAX),
    aAbs: deriveAAbsSurDomaine(yS),
    signe: -1,
    yS,
    xMinPossible: 0,
    phraseEnonce: (a, b, c) => skin.phraseEnonce(skin.culture, a, b, c),
    labelVariable: "x",
    nomVariable: "la quantité d'engrais épandue",
    nomGrandeur: "le rendement",
    genreGrandeur: "masculin",
    uniteVariable: "kg/are",
    uniteGrandeur: "kg/are",
    uniteGrandeurFautive: "litres",
  };
});

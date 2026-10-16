/**
 * Famille "populationPoissons" — population P(x) (poissons) d'un étang piscicole en fonction de la
 * quantité de nourriture x (kg/semaine) distribuée : trop peu de nourriture limite la population,
 * trop en distribuer dégrade la qualité de l'eau (eutrophisation) et la fait chuter — parabole
 * concave (`signe: -1`), population maximale pour une quantité optimale `xS`.
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinPopulationPoissons {
  etang: string;
  phraseEnonce: (etang: string, a: number, b: number, c: number) => string;
}

const SKINS: SkinPopulationPoissons[] = [
  {
    etang: "un étang de pisciculture",
    phraseEnonce: (etang, a, b, c) =>
      `Un pisciculteur étudie l'effet de la nourriture distribuée sur la population de ${etang} ; la population P (en poissons) en fonction de la quantité de nourriture x (en kg/semaine) distribuée vaut $P(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    etang: "un bassin d'aquaculture",
    phraseEnonce: (etang, a, b, c) =>
      `Une exploitation aquacole étudie l'effet de la nourriture distribuée sur la population de ${etang} ; la population P (en poissons) en fonction de la quantité de nourriture x (en kg/semaine) distribuée vaut $P(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    etang: "un étang communal",
    phraseEnonce: (etang, a, b, c) =>
      `Une commune suit l'effet de la nourriture distribuée sur la population de ${etang} ; la population P (en poissons) en fonction de la quantité de nourriture x (en kg/semaine) distribuée vaut $P(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 15;
const X_S_MAX = 25;
const A_ABS_MIN = 3;
const A_ABS_MAX = 8;
const Y_S_MIN = 500;
const Y_S_MAX = 900;

export const construirePopulationPoissons = construireAvecParametres(() => {
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "populationPoissons",
    xS: randomInt(X_S_MIN, X_S_MAX),
    aAbs: randomInt(A_ABS_MIN, A_ABS_MAX),
    signe: -1,
    yS: randomInt(Y_S_MIN, Y_S_MAX),
    xMinPossible: 0,
    phraseEnonce: (a, b, c) => skin.phraseEnonce(skin.etang, a, b, c),
    labelVariable: "x",
    nomVariable: "la quantité de nourriture distribuée",
    nomGrandeur: "la population piscicole",
    genreGrandeur: "feminin",
    uniteVariable: "kg/semaine",
    uniteGrandeur: "poissons",
    uniteGrandeurFautive: "kg/semaine",
  };
});

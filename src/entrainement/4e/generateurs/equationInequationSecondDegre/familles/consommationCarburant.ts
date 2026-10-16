/**
 * Famille "consommationCarburant" — consommation C(x) (L/100km) d'un véhicule en fonction de sa
 * vitesse de croisière x (km/h) : rouler trop lentement ou trop vite consomme davantage, la
 * consommation est minimale à une vitesse économique `xS` — parabole convexe (`signe: +1`).
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinConsommationCarburant {
  phraseEnonce: (a: number, b: number, c: number) => string;
}

const SKINS: SkinConsommationCarburant[] = [
  {
    phraseEnonce: (a, b, c) =>
      `Un constructeur automobile mesure la consommation de carburant d'un de ses modèles en fonction de la vitesse de croisière ; la consommation C (en L/100km) en fonction de la vitesse x (en km/h) vaut $C(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Une société de transport routier étudie la consommation de ses camions selon leur vitesse de croisière sur autoroute ; la consommation C (en L/100km) en fonction de la vitesse x (en km/h) vaut $C(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Un motard souhaite connaître la vitesse la plus économique pour sa moto ; la consommation C (en L/100km) en fonction de la vitesse x (en km/h) vaut $C(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 70;
const X_S_MAX = 100;
const X_MIN_POSSIBLE = 20;
const A_ABS_MIN = 1;
const A_ABS_MAX = 2;
const Y_S_MIN = 4;
const Y_S_MAX = 7;

export const construireConsommationCarburant = construireAvecParametres(() => {
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "consommationCarburant",
    xS: randomInt(X_S_MIN, X_S_MAX),
    aAbs: randomInt(A_ABS_MIN, A_ABS_MAX),
    signe: 1,
    yS: randomInt(Y_S_MIN, Y_S_MAX),
    xMinPossible: X_MIN_POSSIBLE,
    phraseEnonce: skin.phraseEnonce,
    labelVariable: "x",
    nomVariable: "la vitesse de croisière",
    nomGrandeur: "la consommation de carburant",
    genreGrandeur: "feminin",
    uniteVariable: "km/h",
    uniteGrandeur: "L/100km",
    uniteGrandeurFautive: "km/h",
  };
});

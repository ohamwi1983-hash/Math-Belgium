/**
 * Famille "consommationCarburant" — consommation C(x) (L/100km) d'un véhicule en fonction de sa
 * vitesse de croisière x (km/h) : rouler trop lentement ou trop vite consomme davantage, la
 * consommation est minimale à une vitesse économique `xS` — parabole convexe (`signe: +1`). `yS`
 * (consommation minimale) et `plafond` (consommation maximale réaliste en bord de domaine) choisis
 * EN PREMIER, `aAbs` DÉRIVÉ par `deriveAAbsVersPlafond` pour qu'aucune valeur de l'exercice ne
 * dépasse `plafond` (bug signalé : une consommation jusqu'à 249 L/100km en bord de domaine avant ce
 * correctif).
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres, deriveAAbsVersPlafond } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinConsommationCarburant {
  phraseEnonce: (a: number, b: number, c: number) => string;
  /** Consommation minimale (sommet) et consommation au bord du domaine, en L/100 km : réalistes pour le véhicule. */
  ySMin: number;
  ySMax: number;
  plafondMin: number;
  plafondMax: number;
}

const SKINS: SkinConsommationCarburant[] = [
  {
    phraseEnonce: (a, b, c) =>
      `Un constructeur automobile mesure la consommation de carburant d'un de ses modèles en fonction de la vitesse de croisière ; la consommation C (en L/100km) en fonction de la vitesse x (en km/h) vaut $C(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
    ySMin: 4,
    ySMax: 7,
    plafondMin: 16,
    plafondMax: 22,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Une société de transport routier étudie la consommation de ses camions selon leur vitesse de croisière sur autoroute ; la consommation C (en L/100km) en fonction de la vitesse x (en km/h) vaut $C(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
    ySMin: 25,
    ySMax: 40,
    plafondMin: 45,
    plafondMax: 60,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Un motard souhaite connaître la vitesse la plus économique pour sa moto ; la consommation C (en L/100km) en fonction de la vitesse x (en km/h) vaut $C(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
    ySMin: 3,
    ySMax: 6,
    plafondMin: 12,
    plafondMax: 18,
  },
];

const X_S_MIN = 70;
const X_S_MAX = 100;
const X_MIN_POSSIBLE = 20;

export const construireConsommationCarburant = construireAvecParametres(() => {
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;
  const yS = randomInt(skin.ySMin, skin.ySMax);

  return {
    famille: "consommationCarburant",
    xS: randomInt(X_S_MIN, X_S_MAX),
    aAbs: deriveAAbsVersPlafond(yS, randomInt(skin.plafondMin, skin.plafondMax)),
    signe: 1,
    yS,
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

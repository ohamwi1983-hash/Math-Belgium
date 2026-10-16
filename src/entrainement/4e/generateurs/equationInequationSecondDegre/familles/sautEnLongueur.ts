/**
 * Famille "sautEnLongueur" — distance D(x) (m) d'un saut en longueur en fonction de la vitesse
 * d'élan x (m/s) : une vitesse d'élan trop faible ne donne pas assez d'impulsion, une vitesse trop
 * élevée fait perdre le contrôle de l'appel — parabole concave (`signe: -1`), distance maximale
 * pour une vitesse d'élan optimale `xS`.
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinSautEnLongueur {
  phraseEnonce: (a: number, b: number, c: number) => string;
}

const SKINS: SkinSautEnLongueur[] = [
  {
    phraseEnonce: (a, b, c) =>
      `Un entraîneur d'athlétisme étudie l'effet de la vitesse d'élan sur la performance d'une sauteuse en longueur ; la distance du saut D (en m) en fonction de la vitesse d'élan x (en m/s) vaut $D(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Un club d'athlétisme teste différentes vitesses d'élan pour un sauteur en longueur ; la distance du saut D (en m) en fonction de la vitesse d'élan x (en m/s) vaut $D(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Lors d'un stage sportif, on mesure l'effet de la vitesse d'élan sur la distance d'un saut en longueur ; la distance du saut D (en m) en fonction de la vitesse d'élan x (en m/s) vaut $D(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 15;
const X_S_MAX = 22;
const A_ABS_MIN = 1;
const A_ABS_MAX = 3;
const Y_S_MIN = 8;
const Y_S_MAX = 15;

export const construireSautEnLongueur = construireAvecParametres(() => {
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "sautEnLongueur",
    xS: randomInt(X_S_MIN, X_S_MAX),
    aAbs: randomInt(A_ABS_MIN, A_ABS_MAX),
    signe: -1,
    yS: randomInt(Y_S_MIN, Y_S_MAX),
    xMinPossible: 0,
    phraseEnonce: skin.phraseEnonce,
    labelVariable: "x",
    nomVariable: "la vitesse d'élan",
    nomGrandeur: "la distance du saut",
    genreGrandeur: "feminin",
    uniteVariable: "m/s",
    uniteGrandeur: "m",
    uniteGrandeurFautive: "m/s",
  };
});

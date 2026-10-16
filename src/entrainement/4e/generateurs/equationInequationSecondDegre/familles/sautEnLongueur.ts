/**
 * Famille "sautEnLongueur" — distance D(x) (m) d'un saut en longueur en fonction de la vitesse
 * d'élan x (km/h) : une vitesse d'élan trop faible ne donne pas assez d'impulsion, une vitesse trop
 * élevée fait perdre le contrôle de l'appel — parabole concave (`signe: -1`), distance maximale
 * pour une vitesse d'élan optimale `xS`. Vitesse exprimée en km/h (pas m/s) : une vitesse d'élan
 * réaliste en m/s (6 à 9) ne laisserait pas assez de marge par rapport à 0 pour le mécanisme de
 * domaine de `racines.ts` (qui a besoin d'au moins `ECART_MAX_DEPUIS_XS`=11 d'écart) — en km/h, la
 * même vitesse réaliste (25 à 35 km/h) satisfait cette contrainte naturellement. `yS` (distance
 * maximale, réaliste pour un saut en longueur) choisi EN PREMIER, `aAbs` DÉRIVÉ par
 * `deriveAAbsSurDomaine` pour garantir une distance jamais négative sur tout le domaine.
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres, deriveAAbsSurDomaine } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinSautEnLongueur {
  phraseEnonce: (a: number, b: number, c: number) => string;
}

const SKINS: SkinSautEnLongueur[] = [
  {
    phraseEnonce: (a, b, c) =>
      `Un entraîneur d'athlétisme étudie l'effet de la vitesse d'élan sur la performance d'une sauteuse en longueur ; la distance du saut D (en m) en fonction de la vitesse d'élan x (en km/h) vaut $D(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Un club d'athlétisme teste différentes vitesses d'élan pour un sauteur en longueur ; la distance du saut D (en m) en fonction de la vitesse d'élan x (en km/h) vaut $D(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Lors d'un stage sportif, on mesure l'effet de la vitesse d'élan sur la distance d'un saut en longueur ; la distance du saut D (en m) en fonction de la vitesse d'élan x (en km/h) vaut $D(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 25;
const X_S_MAX = 32;
const Y_S_MIN = 6;
const Y_S_MAX = 9;

export const construireSautEnLongueur = construireAvecParametres(() => {
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;
  const yS = randomInt(Y_S_MIN, Y_S_MAX);

  return {
    famille: "sautEnLongueur",
    xS: randomInt(X_S_MIN, X_S_MAX),
    aAbs: deriveAAbsSurDomaine(yS),
    signe: -1,
    yS,
    xMinPossible: 0,
    phraseEnonce: skin.phraseEnonce,
    labelVariable: "x",
    nomVariable: "la vitesse d'élan",
    nomGrandeur: "la distance du saut",
    genreGrandeur: "feminin",
    uniteVariable: "km/h",
    uniteGrandeur: "m",
    uniteGrandeurFautive: "km/h",
  };
});

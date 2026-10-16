/**
 * Famille "rectanglePerimetre" — architecture B ("construction géométrique", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) : AUCUNE formule n'est révélée dans
 * l'énoncé — seulement le périmètre P (fixé) et la largeur x comme inconnue. L'élève doit
 * reconstruire lui-même la longueur (P/2-x), puis l'aire x·(P/2-x), AVANT de poser l'équation/
 * l'inéquation (écran "poserEquationInequation", réutilisé tel quel — voir `vertexForm.ts`).
 *
 * Mathématiquement : aire(x) = x·(P/2-x), une parabole concave dont le sommet est exactement à
 * x=P/4 (le rectangle optimal est un carré, propriété classique) — en posant `xS=P/4`, `P=4·xS`,
 * `aAbs=1`, `yS=xS²` (dérivé), on retombe exactement sur la forme sommet déjà gérée par
 * `vertexForm.ts` (`aire(x)=-(x-xS)²+xS²=x(2xS-x)=x(P/2-x)` ✓) — `aAbs=1` est ici EXACT (pas
 * dérivé par `deriveAAbsSurDomaine`) car c'est la vraie formule de l'aire, jamais un facteur
 * d'échelle artificiel.
 */
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinRectanglePerimetre {
  terrain: string;
  phraseEnonce: (terrain: string, perimetre: number) => string;
}

const SKINS: SkinRectanglePerimetre[] = [
  {
    terrain: "un jardin",
    phraseEnonce: (terrain, perimetre) =>
      `Un jardinier dispose d'une clôture de ${perimetre} m pour entourer ${terrain} rectangulaire. La largeur du terrain mesure x m.`,
  },
  {
    terrain: "un enclos",
    phraseEnonce: (terrain, perimetre) =>
      `Un éleveur dispose d'une clôture de ${perimetre} m pour délimiter ${terrain} rectangulaire. La largeur de l'enclos mesure x m.`,
  },
  {
    terrain: "un terrain de jeu",
    phraseEnonce: (terrain, perimetre) =>
      `Une commune dispose d'une bordure de ${perimetre} m pour délimiter ${terrain} rectangulaire. La largeur du terrain mesure x m.`,
  },
];

const X_S_MIN = 12;
const X_S_MAX = 16;

export const construireRectanglePerimetre = construireAvecParametres(() => {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "rectanglePerimetre",
    xS,
    aAbs: 1,
    signe: -1,
    yS: xS * xS,
    xMinPossible: 0,
    phraseEnonce: () => skin.phraseEnonce(skin.terrain, 4 * xS),
    labelVariable: "x",
    nomVariable: "la largeur du terrain",
    nomGrandeur: "l'aire du terrain",
    genreGrandeur: "feminin",
    uniteVariable: "m",
    uniteGrandeur: "m²",
    uniteGrandeurFautive: "m",
    croquis: { type: "rectanglePerimetre" },
  };
});

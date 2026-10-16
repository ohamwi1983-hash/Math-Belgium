/**
 * Famille "triangleRectangleCathetes" — architecture B ("construction géométrique", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) : AUCUNE formule n'est révélée dans
 * l'énoncé — seulement la somme des 2 cathètes S (fixée) et l'une d'elles, x, comme inconnue.
 * L'élève doit reconstruire lui-même l'autre cathète (S-x), puis l'aire du triangle rectangle
 * x·(S-x)/2, AVANT de poser l'équation/l'inéquation.
 *
 * Mathématiquement : aire(x) = x·(S-x)/2, une parabole concave de sommet `xS=S/2` (`aAbs=0.5`,
 * `yS=xS²/2` dérivé) — même principe "cible d'abord" que `rectanglePerimetre.ts`, `aAbs=0.5` est
 * ici EXACT (vraie formule de l'aire d'un triangle rectangle, jamais un facteur d'échelle
 * artificiel).
 */
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinTriangleRectangleCathetes {
  phraseEnonce: (sommeCathetes: number) => string;
}

const SKINS: SkinTriangleRectangleCathetes[] = [
  {
    phraseEnonce: (sommeCathetes) =>
      `Un menuisier découpe une pièce triangulaire rectangle dans une planche : la somme des longueurs des 2 côtés de l'angle droit (les cathètes) mesure ${sommeCathetes} cm. L'une des cathètes mesure x cm.`,
  },
  {
    phraseEnonce: (sommeCathetes) =>
      `Un architecte dessine un triangle rectangle d'appui pour une charpente : la somme des longueurs des 2 côtés de l'angle droit (les cathètes) mesure ${sommeCathetes} cm. L'une des cathètes mesure x cm.`,
  },
  {
    phraseEnonce: (sommeCathetes) =>
      `Un professeur de dessin technique propose un triangle rectangle dont la somme des longueurs des 2 côtés de l'angle droit (les cathètes) mesure ${sommeCathetes} cm. L'une des cathètes mesure x cm.`,
  },
];

const X_S_MIN = 12;
const X_S_MAX = 16;

export const construireTriangleRectangleCathetes = construireAvecParametres(() => {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "triangleRectangleCathetes",
    xS,
    aAbs: 0.5,
    signe: -1,
    yS: (xS * xS) / 2,
    xMinPossible: 0,
    phraseEnonce: () => skin.phraseEnonce(2 * xS),
    labelVariable: "x",
    nomVariable: "l'une des cathètes",
    nomGrandeur: "l'aire du triangle",
    genreGrandeur: "feminin",
    uniteVariable: "cm",
    uniteGrandeur: "cm²",
    uniteGrandeurFautive: "cm",
    croquis: { type: "triangleRectangleCathetes" },
  };
});

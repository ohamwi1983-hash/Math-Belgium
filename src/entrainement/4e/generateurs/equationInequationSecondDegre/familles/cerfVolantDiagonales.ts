/**
 * Famille "cerfVolantDiagonales" — architecture B ("construction géométrique", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) : AUCUNE formule n'est révélée dans
 * l'énoncé — seulement la somme des 2 diagonales S (fixée) et l'une d'elles, x, comme inconnue.
 * L'élève doit reconstruire lui-même l'autre diagonale (S-x), puis l'aire du cerf-volant (un
 * quadrilatère à diagonales perpendiculaires, comme un losange) x·(S-x)/2, AVANT de poser
 * l'équation/l'inéquation.
 *
 * Mathématiquement : aire(x) = x·(S-x)/2, même forme que `triangleRectangleCathetes.ts` — mais un
 * RAISONNEMENT géométrique différent (diagonales d'un quadrilatère, pas cathètes d'un triangle,
 * voir demande explicite "encore d'autres formes" : triangles juxtaposés le long d'une diagonale,
 * pas seulement des rectangles) ; `aAbs=0.5` est ici EXACT (vraie formule de l'aire d'un
 * quadrilatère à diagonales perpendiculaires, jamais un facteur d'échelle artificiel).
 */
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinCerfVolantDiagonales {
  phraseEnonce: (sommeDiagonales: number) => string;
}

const SKINS: SkinCerfVolantDiagonales[] = [
  {
    phraseEnonce: (sommeDiagonales) =>
      `Un atelier confectionne des cerfs-volants en forme de losange : les deux diagonales, perpendiculaires, se coupent en leur milieu et leur somme vaut ${sommeDiagonales} cm. La diagonale horizontale mesure x cm.`,
  },
  {
    phraseEnonce: (sommeDiagonales) =>
      `Une couturière découpe un morceau de tissu en forme de losange pour un cerf-volant : la somme des longueurs des deux diagonales, perpendiculaires, vaut ${sommeDiagonales} cm. La diagonale horizontale mesure x cm.`,
  },
  {
    phraseEnonce: (sommeDiagonales) =>
      `Un club de loisirs créatifs dessine un cerf-volant en forme de losange dont la somme des deux diagonales (perpendiculaires) vaut ${sommeDiagonales} cm. La diagonale horizontale mesure x cm.`,
  },
];

const X_S_MIN = 12;
const X_S_MAX = 16;

export const construireCerfVolantDiagonales = construireAvecParametres(() => {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "cerfVolantDiagonales",
    xS,
    aAbs: 0.5,
    signe: -1,
    yS: (xS * xS) / 2,
    xMinPossible: 0,
    phraseEnonce: () => skin.phraseEnonce(2 * xS),
    labelVariable: "x",
    nomVariable: "la diagonale horizontale",
    nomGrandeur: "l'aire du cerf-volant",
    genreGrandeur: "feminin",
    uniteVariable: "cm",
    uniteGrandeur: "cm²",
    uniteGrandeurFautive: "cm",
    croquis: { type: "cerfVolantDiagonales" },
  };
});

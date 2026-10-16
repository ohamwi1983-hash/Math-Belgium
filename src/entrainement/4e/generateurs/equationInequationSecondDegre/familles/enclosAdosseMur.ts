/**
 * Famille "enclosAdosseMur" — architecture B ("construction géométrique", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête). Un enclos rectangulaire est adossé à un
 * mur existant (ou une haie) : un seul côté (la longueur) n'a pas besoin de clôture, les 2 largeurs
 * ET l'autre longueur sont clôturées avec une longueur de clôture F fixée. AUCUNE formule révélée —
 * l'élève doit reconstruire lui-même la longueur (F-2x), puis l'aire x·(F-2x).
 *
 * Mathématiquement : aire(x) = x·(F-2x) = -2x²+Fx, parabole concave de sommet `xS=F/4`
 * (`aAbs=2`, `yS=F²/8=2·xS²` dérivé) — même principe "cible d'abord" que `rectanglePerimetre.ts`,
 * `aAbs=2` est ici EXACT (vraie formule de l'aire, jamais un facteur d'échelle artificiel).
 */
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinEnclosAdosseMur {
  phraseEnonce: (longueurCloture: number) => string;
}

const SKINS: SkinEnclosAdosseMur[] = [
  {
    phraseEnonce: (longueurCloture) =>
      `Un agriculteur adosse un enclos rectangulaire au mur de sa grange : seuls les 2 autres côtés perpendiculaires au mur et le côté qui lui est parallèle doivent être clôturés, avec une clôture de ${longueurCloture} m au total. La largeur de l'enclos (perpendiculaire au mur) mesure x m.`,
  },
  {
    phraseEnonce: (longueurCloture) =>
      `Un éleveur adosse un enclos rectangulaire à une haie existante : seuls les 2 côtés perpendiculaires à la haie et le côté qui lui est parallèle doivent être clôturés, avec une clôture de ${longueurCloture} m au total. La largeur de l'enclos (perpendiculaire à la haie) mesure x m.`,
  },
  {
    phraseEnonce: (longueurCloture) =>
      `Un maraîcher adosse une parcelle rectangulaire au mur de son hangar : seuls les 2 côtés perpendiculaires au mur et le côté qui lui est parallèle doivent être clôturés, avec un grillage de ${longueurCloture} m au total. La largeur de la parcelle (perpendiculaire au mur) mesure x m.`,
  },
];

const X_S_MIN = 13;
const X_S_MAX = 17;

export const construireEnclosAdosseMur = construireAvecParametres(() => {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "enclosAdosseMur",
    xS,
    aAbs: 2,
    signe: -1,
    yS: 2 * xS * xS,
    xMinPossible: 0,
    phraseEnonce: () => skin.phraseEnonce(4 * xS),
    labelVariable: "x",
    nomVariable: "la largeur de l'enclos",
    nomGrandeur: "l'aire de l'enclos",
    genreGrandeur: "feminin",
    uniteVariable: "m",
    uniteGrandeur: "m²",
    uniteGrandeurFautive: "m",
    croquis: { type: "enclosAdosseMur" },
  };
});

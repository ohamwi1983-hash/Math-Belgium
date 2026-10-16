/**
 * Famille "jetEau" — hauteur h(x) (m) d'un jet d'eau (fontaine/lance d'arrosage) en fonction de la
 * distance horizontale x (m) parcourue, PAS du temps (contrairement à `chuteObjet`, générateur
 * précédent, retiré avec toute la refonte — voir `core/equationInequationSecondDegre.types.ts`,
 * en-tête) : profil SPATIAL de la trajectoire, jamais une évolution temporelle. Parabole concave
 * (`signe: -1`), hauteur nulle au départ (x=0) et à la retombée (x=T=2·xS) — DONC `yS` n'est PAS
 * un paramètre libre : il doit valoir exactement `aAbs·xS²` pour que `h(0)=h(2·xS)=0` (sinon la
 * phrase "retombe au sol à 2·xS m" contredirait la fonction réellement construite). "Cible
 * d'abord" : `delta` choisi en premier par `genererDeltaEtDomaine`, `k` en est DÉRIVÉ (voir
 * `vertexForm.ts`).
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinJetEau {
  phraseEnonce: (portee: number, a: number, b: number, c: number) => string;
}

const SKINS: SkinJetEau[] = [
  {
    phraseEnonce: (portee, a, b, c) =>
      `Une fontaine projette un jet d'eau qui retombe au sol exactement à ${portee} m du point de sortie ; sa hauteur h (en m) lorsqu'il a parcouru une distance horizontale x (en m) vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (portee, a, b, c) =>
      `Un système d'arrosage automatique envoie un jet d'eau qui retombe au sol à ${portee} m de l'asperseur ; sa hauteur h (en m) après une distance horizontale x (en m) vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (portee, a, b, c) =>
      `Le jet d'eau d'un canon à eau de parc aquatique retombe à la surface du bassin ${portee} m plus loin ; sa hauteur h (en m) après une distance horizontale x (en m) vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 12;
const X_S_MAX = 16;
const A_ABS_MIN = 1;
const A_ABS_MAX = 2;

export const construireJetEau = construireAvecParametres(() => {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const aAbs = randomInt(A_ABS_MIN, A_ABS_MAX);
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "jetEau",
    xS,
    aAbs,
    signe: -1,
    /** `h(0)=h(2·xS)=0` par construction — voir en-tête de fichier. */
    yS: aAbs * xS * xS,
    xMinPossible: 0,
    phraseEnonce: (a, b, c) => skin.phraseEnonce(2 * xS, a, b, c),
    labelVariable: "x",
    nomVariable: "la distance horizontale parcourue",
    nomGrandeur: "la hauteur",
    genreGrandeur: "feminin",
    uniteVariable: "m",
    uniteGrandeur: "m",
    uniteGrandeurFautive: "m/s",
  };
});

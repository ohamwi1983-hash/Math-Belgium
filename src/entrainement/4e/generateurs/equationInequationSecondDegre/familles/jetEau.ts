/**
 * Famille "jetEau" — hauteur h(x) (m) d'un jet d'eau (fontaine/lance d'arrosage) en fonction de la
 * distance horizontale x (m) parcourue, PAS du temps (contrairement à `chuteObjet`, générateur
 * précédent, retiré avec toute la refonte — voir `core/equationInequationSecondDegre.types.ts`,
 * en-tête) : profil SPATIAL de la trajectoire, jamais une évolution temporelle. Parabole concave
 * (`signe: -1`), hauteur maximale réaliste (quelques mètres) choisie EN PREMIER (`yS`), `aAbs` en
 * est DÉRIVÉ par `deriveAAbsSurDomaine` (`vertexForm.ts`) pour garantir `h(x)≥0` partout dans le
 * domaine — une hauteur négative n'a aucun sens physique (bug signalé et corrigé : un premier
 * tirage produisait une hauteur de -123 m).
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres, deriveAAbsSurDomaine } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinJetEau {
  phraseEnonce: (a: number, b: number, c: number) => string;
}

const SKINS: SkinJetEau[] = [
  {
    phraseEnonce: (a, b, c) =>
      `Une fontaine projette un jet d'eau ; sa hauteur h (en m) lorsqu'il a parcouru une distance horizontale x (en m) vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Un système d'arrosage automatique envoie un jet d'eau ; sa hauteur h (en m) après une distance horizontale x (en m) vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Le jet d'eau d'un canon à eau de parc aquatique décrit une trajectoire ; sa hauteur h (en m) après une distance horizontale x (en m) vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 12;
const X_S_MAX = 16;
const Y_S_MIN = 3;
const Y_S_MAX = 6;

export const construireJetEau = construireAvecParametres(() => {
  const yS = randomInt(Y_S_MIN, Y_S_MAX);
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "jetEau",
    xS: randomInt(X_S_MIN, X_S_MAX),
    aAbs: deriveAAbsSurDomaine(yS),
    signe: -1,
    yS,
    xMinPossible: 0,
    phraseEnonce: skin.phraseEnonce,
    labelVariable: "x",
    nomVariable: "la distance horizontale parcourue",
    nomGrandeur: "la hauteur",
    genreGrandeur: "feminin",
    uniteVariable: "m",
    uniteGrandeur: "m",
    uniteGrandeurFautive: "m/s",
    croquis: { type: "jetEau" },
  };
});

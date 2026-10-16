/**
 * Famille "publiciteAudience" — audience A(x) (spectateurs) d'une campagne publicitaire en
 * fonction du budget x (milliers €) investi : au-delà d'un certain budget, la saturation du marché
 * fait diminuer le gain marginal d'audience — parabole concave (`signe: -1`), maximum pour un
 * budget optimal `xS`. `yS` (audience maximale, réaliste) choisi EN PREMIER, `aAbs` DÉRIVÉ par
 * `deriveAAbsSurDomaine` pour garantir une audience jamais négative sur tout le domaine.
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres, deriveAAbsSurDomaine } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinPubliciteAudience {
  phraseEnonce: (a: number, b: number, c: number) => string;
}

const SKINS: SkinPubliciteAudience[] = [
  {
    phraseEnonce: (a, b, c) =>
      `Une entreprise étudie l'audience d'une campagne publicitaire en ligne selon le budget investi ; l'audience A (en spectateurs) en fonction du budget x (en milliers d'euros) investi vaut $A(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Un cinéma analyse l'audience de ses séances selon le budget publicitaire consacré à un film ; l'audience A (en spectateurs) en fonction du budget x (en milliers d'euros) investi vaut $A(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (a, b, c) =>
      `Un festival de musique étudie l'affluence attendue selon le budget publicitaire engagé ; l'audience A (en spectateurs) en fonction du budget x (en milliers d'euros) investi vaut $A(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 15;
const X_S_MAX = 25;
const Y_S_MIN = 300;
const Y_S_MAX = 600;

export const construirePubliciteAudience = construireAvecParametres(() => {
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;
  const yS = randomInt(Y_S_MIN, Y_S_MAX);

  return {
    famille: "publiciteAudience",
    xS: randomInt(X_S_MIN, X_S_MAX),
    aAbs: deriveAAbsSurDomaine(yS),
    signe: -1,
    yS,
    xMinPossible: 0,
    phraseEnonce: skin.phraseEnonce,
    labelVariable: "x",
    nomVariable: "le budget publicitaire investi",
    nomGrandeur: "l'audience",
    genreGrandeur: "feminin",
    uniteVariable: "milliers d'euros",
    uniteGrandeur: "spectateurs",
    uniteGrandeurFautive: "milliers d'euros",
  };
});

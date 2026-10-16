/**
 * Famille "coutEntretienMachine" — coût d'entretien annuel E(x) (€) d'une machine industrielle en
 * fonction de son âge x (années) : une machine neuve nécessite peu d'entretien, une machine âgée
 * aussi (après une période creuse où les pièces sont encore fiables) — parabole convexe
 * (`signe: +1`), coût minimal pour un âge `xS`.
 */
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { construireAvecParametres } from "../vertexForm";
import { randomInt } from "../aleatoire";

interface SkinCoutEntretienMachine {
  machine: string;
  phraseEnonce: (machine: string, a: number, b: number, c: number) => string;
}

const SKINS: SkinCoutEntretienMachine[] = [
  {
    machine: "une presse industrielle",
    phraseEnonce: (machine, a, b, c) =>
      `Un atelier suit le coût d'entretien annuel de ${machine} selon son âge ; le coût d'entretien E (en €) en fonction de l'âge x (en années) de la machine vaut $E(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    machine: "un tracteur agricole",
    phraseEnonce: (machine, a, b, c) =>
      `Une exploitation agricole suit le coût d'entretien annuel de ${machine} selon son âge ; le coût d'entretien E (en €) en fonction de l'âge x (en années) de la machine vaut $E(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    machine: "un ascenseur",
    phraseEnonce: (machine, a, b, c) =>
      `Un syndic d'immeuble suit le coût d'entretien annuel de ${machine} selon son âge ; le coût d'entretien E (en €) en fonction de l'âge x (en années) de la machine vaut $E(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 12;
const X_S_MAX = 20;
const A_ABS_MIN = 5;
const A_ABS_MAX = 15;
const Y_S_MIN = 200;
const Y_S_MAX = 500;

export const construireCoutEntretienMachine = construireAvecParametres(() => {
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "coutEntretienMachine",
    xS: randomInt(X_S_MIN, X_S_MAX),
    aAbs: randomInt(A_ABS_MIN, A_ABS_MAX),
    signe: 1,
    yS: randomInt(Y_S_MIN, Y_S_MAX),
    xMinPossible: 0,
    phraseEnonce: (a, b, c) => skin.phraseEnonce(skin.machine, a, b, c),
    labelVariable: "x",
    nomVariable: "l'âge de la machine",
    nomGrandeur: "le coût d'entretien annuel",
    genreGrandeur: "masculin",
    uniteVariable: "ans",
    uniteGrandeur: "€",
    uniteGrandeurFautive: "ans",
  };
});

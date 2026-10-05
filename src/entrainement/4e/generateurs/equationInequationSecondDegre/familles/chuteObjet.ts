/**
 * Couche A — famille "chuteObjet" (hauteur en fonction du temps de montée `x`), voie
 * `fonctionDonnee` (`promptrestructurationgenequationinequation.md` — REROUTÉE depuis
 * `modelisation`, où elle était mal implémentée : `coef`/`T` sont des données PHYSIQUES directement
 * communiquées, jamais issues d'une élimination à 2 variables — voir CLAUDE.md, "Restructuration —
 * bug actif, voie fonctionDonnee"). La mécanique mathématique (`h(x)=coef·x·(T-x)`, symétrique)
 * reste inchangée — seul son ROUTAGE change : fonction ET domaine sont désormais donnés DIRECTEMENT
 * dans l'énoncé (formule complète substituée en KaTeX, `formatFonctionNarrativeLatex`, même helper
 * déjà utilisé par `generateurs/optimisation/familles/trajectoire.ts` pour ce motif EXACT — jamais
 * de coefficient `±1` littéral, principe de traçabilité section 3bis respecté dès la conception).
 *
 * `labelVariable` DOIT rester `"x"` (jamais `"t"` malgré la nature temporelle de la variable) —
 * l'écran "poserEquationInequation" vérifie la saisie de l'élève via `evaluerExpressionGenerale`
 * (`moteur/expressionGenerale.ts`), dont le tokenizer ne reconnaît QUE le caractère littéral `x`
 * comme variable.
 *
 * **Propreté entière garantie par construction** : `xS` (=T/2, temps pour atteindre le sommet)
 * choisi EN PREMIER, entier, `T=2·xS` DÉRIVÉ (toujours pair) ; `coef` entier libre. Racines de
 * `h(x)=k` — "cible d'abord" : `delta` (entier, `racines.ts`) choisi EN PREMIER, `k=coef·(xS²-delta²)`
 * DÉRIVÉ, jamais l'inverse.
 */
import type {
  ExerciceEquationInequationSecondDegre,
  ExerciceEquationSecondDegre,
  ExerciceInequationSecondDegre,
  VarianteEquationInequationSecondDegre,
} from "../../../core/equationInequationSecondDegre.types";
import type { ExerciceOptimisationFonctionDonnee } from "../../../core/optimisation.types";
import { formatFonctionNarrativeLatex } from "../../optimisation/formatNarratif";
import { optimumSurDomaine, sommetDansIntervalle } from "../../optimisation/optimum";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "../interpretation";
import { genererDeltaEtDomaine, intervalleIntersecte, racinesDansDomaine } from "../racines";
import { randomInt } from "../aleatoire";

interface SkinChuteObjet {
  phraseEnonce: (T: number, a: number, b: number, c: number) => string;
}

const SKINS: SkinChuteObjet[] = [
  {
    phraseEnonce: (T, a, b, c) =>
      `Une fusée-jouet est lancée verticalement depuis le sol. Elle retombe au sol exactement ${T} secondes après son lancement ; sa hauteur h (en m) après x secondes vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (T, a, b, c) =>
      `Un feu d'artifice est tiré verticalement depuis le sol et retombe ${T} secondes après le tir ; sa hauteur h (en m) après x secondes vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
  {
    phraseEnonce: (T, a, b, c) =>
      `Une balle est lancée verticalement depuis le sol et retombe au sol après un vol de ${T} secondes ; sa hauteur h (en m) après x secondes vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$.`,
  },
];

const X_S_MIN = 20;
const X_S_MAX = 35;
const COEF_MIN = 1;
const COEF_MAX = 3;

export function construireChuteObjet(variante: "equation"): ExerciceEquationSecondDegre;
export function construireChuteObjet(variante: "inequation"): ExerciceInequationSecondDegre;
export function construireChuteObjet(variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const T = 2 * xS;
  const coef = randomInt(COEF_MIN, COEF_MAX);

  const fonction = { a: -coef, b: coef * T, c: 0 };
  const sommet = { x: xS, y: coef * xS * xS };

  const { delta, domaine } = genererDeltaEtDomaine(xS, 0);
  const sommetDansDomaine = sommetDansIntervalle(xS, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  const base: ExerciceOptimisationFonctionDonnee = {
    variante: "fonctionDonnee",
    famille: "chuteObjet",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phraseEnonce(T, fonction.a, fonction.b, fonction.c),
      labelVariable: "x",
      nomVariable: "le temps de montée",
      nomGrandeur: "la hauteur",
      uniteVariable: "s",
      uniteGrandeur: "m",
      questionFinale: null,
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    optionsInterpretation: [],
  };

  const k = coef * (xS * xS - delta * delta);

  if (variante === "equation") {
    const racinesCandidates: [number, number] = [xS - delta, xS + delta];
    const racinesValides = racinesDansDomaine(xS, delta, domaine);
    const racinesRejetees = racinesCandidates.filter((r) => !racinesValides.includes(r));
    return {
      variante: "equation",
      famille: "chuteObjet",
      base,
      k,
      voieSysteme: false,
      systeme: null,
      racinesCandidates,
      racinesValides,
      questionFinale: formatQuestionFinaleEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "la hauteur",
        genreGrandeur: "feminin",
        k,
        uniteGrandeur: "m",
      }),
      optionsInterpretation: construireOptionsInterpretationEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "la hauteur",
        genreGrandeur: "feminin",
        uniteVariable: "s",
        uniteGrandeur: "m",
        uniteGrandeurFautive: "m/s",
        k,
        racinesValides,
        racinesRejetees,
      }),
    };
  }

  const intervalleBrut = { inf: xS - delta, sup: xS + delta };
  const intervalleValide = intervalleIntersecte(xS, delta, domaine);
  return {
    variante: "inequation",
    famille: "chuteObjet",
    base,
    k,
    voieSysteme: false,
    systeme: null,
    sens: "gt",
    intervalleBrut,
    intervalleValide,
    questionFinale: formatQuestionFinaleEquationInequation({
      variante: "inequation",
      sens: "gt",
      labelVariable: "x",
      nomGrandeur: "la hauteur",
      genreGrandeur: "feminin",
      k,
      uniteGrandeur: "m",
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      labelVariable: "x",
      nomGrandeur: "la hauteur",
      genreGrandeur: "feminin",
      uniteVariable: "s",
      uniteGrandeur: "m",
      uniteGrandeurFautive: "m/s",
      k,
      intervalleValide,
      intervalleBrut,
    }),
  };
}

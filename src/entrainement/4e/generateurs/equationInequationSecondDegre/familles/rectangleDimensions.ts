/**
 * Couche A — famille E "rectangleDimensions" (spec `specgen56equationinequationseconddegre.md`,
 * section 4, famille E — trouvée par recherche externe, classique retrouvé identiquement sur
 * plusieurs sources francophones/anglophones indépendantes) : dimensions d'un rectangle connaissant
 * son périmètre, seuil posé sur son AIRE. Contrainte NON isolée `x+y=S` (demi-périmètre, isolé à
 * l'écran "isolement" — même mécanique que `chuteObjet`/`remplissageReservoir`, voir leurs en-têtes)
 * → `y=S-x` ; Aire(x) = x·(S-x) = -x²+Sx (écran "construction").
 *
 * Algébriquement IDENTIQUE à `generateurs/optimisation/familles/aireEnclos.ts` (gen55) — même forme
 * `-x²+Sx`, mais dérivée ici via la technique "cible d'abord" PARTAGÉE de ce générateur
 * (`racines.ts::genererDeltaEtDomaine`, réutilisée telle quelle par les 4 autres familles) plutôt
 * que le tirage direct de `aireEnclos` (`quart`/`L=4·quart`) — les deux dérivations produisent la
 * même famille de fonctions, seul le mécanisme de génération diffère, cohérent avec le fait que ce
 * générateur pose une question ÉQUATION/INÉQUATION (seuil `k` sur l'aire), jamais une question
 * d'optimisation (pas de notion de "domaine sommet-dans/hors" à 75/25 ici, juste le ratio clip/large
 * ~50/50 déjà standard de `racines.ts`).
 *
 * **Propreté entière garantie par construction** : `xS` (le côté au sommet, cas carré) choisi EN
 * PREMIER, entier ; `S=2·xS` DÉRIVÉ (demi-périmètre, toujours pair par construction) — la fonction
 * développée `Aire(x)=-x²+Sx` a alors des coefficients entiers, et `genererDeltaEtDomaine`
 * (`racines.ts`, réutilisée telle quelle) choisit `delta` puis le domaine, `k=xS²-delta²` DÉRIVÉ —
 * jamais l'inverse.
 */
import type {
  ExerciceEquationInequationSecondDegre,
  ExerciceEquationSecondDegre,
  ExerciceInequationSecondDegre,
  VarianteEquationInequationSecondDegre,
} from "../../../core/equationInequationSecondDegre.types";
import type { ExerciceOptimisationModelisation } from "../../../core/optimisation.types";
import { optimumSurDomaine, sommetDansIntervalle } from "../../optimisation/optimum";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "../interpretation";
import { genererDeltaEtDomaine, intervalleIntersecte, racinesDansDomaine } from "../racines";
import { randomInt } from "../aleatoire";

interface SkinRectangleDimensions {
  phraseEnonce: (S: number) => string;
}

const SKINS: SkinRectangleDimensions[] = [
  { phraseEnonce: (S) => `Un architecte doit concevoir une salle rectangulaire dont le périmètre mesure ${2 * S} m.` },
  { phraseEnonce: (S) => `Une entreprise dispose de ${2 * S} m de bordure pour aménager une aire de stockage rectangulaire.` },
  { phraseEnonce: (S) => `On souhaite peindre le marquage d'un terrain de sport rectangulaire dont le périmètre mesure ${2 * S} m.` },
];

const X_S_MIN = 15;
const X_S_MAX = 25;
const X_MIN_POSSIBLE = 1;

export function construireRectangleDimensions(variante: "equation"): ExerciceEquationSecondDegre;
export function construireRectangleDimensions(variante: "inequation"): ExerciceInequationSecondDegre;
export function construireRectangleDimensions(variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const S = 2 * xS;

  const fonction = { a: -1, b: S, c: 0 };
  const sommet = { x: xS, y: xS * xS };

  const { delta, domaine } = genererDeltaEtDomaine(xS, X_MIN_POSSIBLE);
  const sommetDansDomaine = sommetDansIntervalle(xS, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  const base: ExerciceOptimisationModelisation = {
    variante: "modelisation",
    famille: "rectangleDimensions",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phraseEnonce(S),
      labelVariable: "x",
      nomVariable: "la largeur",
      nomGrandeur: "l'aire",
      uniteVariable: "m",
      uniteGrandeur: "m²",
      questionFinale: null,
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    contrainte: {
      enonceLatex: `x + y = ${S}`,
      lettreCherchee: "y",
      pente: -1,
      ordonnee: S,
    },
    // Aire(x,y) = x·y, x ET y encore présents (écran "contrainteEtGrandeur", champ 2).
    formuleGrandeurXYTexte: "x*y",
    optionsInterpretation: [],
  };

  const k = xS * xS - delta * delta;

  if (variante === "equation") {
    const racinesCandidates: [number, number] = [xS - delta, xS + delta];
    const racinesValides = racinesDansDomaine(xS, delta, domaine);
    const racinesRejetees = racinesCandidates.filter((r) => !racinesValides.includes(r));
    return {
      variante: "equation",
      famille: "rectangleDimensions",
      base,
      k,
      voieSysteme: false,
      systeme: null,
      racinesCandidates,
      racinesValides,
      questionFinale: formatQuestionFinaleEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "l'aire",
        genreGrandeur: "feminin",
        k,
        uniteGrandeur: "m²",
      }),
      optionsInterpretation: construireOptionsInterpretationEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "l'aire",
        genreGrandeur: "feminin",
        uniteVariable: "m",
        uniteGrandeur: "m²",
        uniteGrandeurFautive: "m",
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
    famille: "rectangleDimensions",
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
      nomGrandeur: "l'aire",
      genreGrandeur: "feminin",
      k,
      uniteGrandeur: "m²",
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      labelVariable: "x",
      nomGrandeur: "l'aire",
      genreGrandeur: "feminin",
      uniteVariable: "m",
      uniteGrandeur: "m²",
      uniteGrandeurFautive: "m",
      k,
      intervalleValide,
      intervalleBrut,
    }),
  };
}

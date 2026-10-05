/**
 * Couche A — famille "remplissageReservoir" (niveau d'eau en fonction du temps `x`) : un réservoir
 * se remplit puis se vide entièrement sur une durée totale T (donnée) — son niveau suit
 * `niveau(x)=coef·x·(T-x)` (produit symétrique de 2 durées, MÊME technique que `chuteObjet` — voir
 * son en-tête pour le détail complet de la dérivation : `x`=temps de remplissage, `y`=T-x=temps de
 * vidange, contrainte NON isolée `x+y=T`).
 *
 * `labelVariable` reste `"x"` (même contrainte que `chuteObjet`).
 *
 * **Propreté entière garantie par construction** : identique à `chuteObjet` (`xS`/`coef`/`delta`
 * choisis en premier, tout le reste dérivé).
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

interface SkinRemplissageReservoir {
  phraseEnonce: (T: number, coef: number) => string;
}

// Traçabilité de `coef` (section 3bis, `promptrestructurationgenequationinequation.md`) — jamais
// visible avant ce correctif : le facteur de proportionnalité est désormais nommé explicitement
// dans l'énoncé (un chiffre narratif, pas une formule complète — cette famille reste `modelisation`,
// l'élève doit encore la construire lui-même, contrairement à `chuteObjet`/`distanceFreinage`
// reroutées en `fonctionDonnee`).
const SKINS: SkinRemplissageReservoir[] = [
  { phraseEnonce: (T, coef) => `Un réservoir vide se remplit puis se vide entièrement en ${T} minutes au total ; son niveau (en L) vaut ${coef} fois le produit du temps de remplissage par le temps de vidange restant.` },
  { phraseEnonce: (T, coef) => `Une piscine vide se remplit puis se vidange entièrement sur une durée totale de ${T} minutes ; son niveau (en L) vaut ${coef} fois le produit du temps de remplissage par le temps de vidange restant.` },
  { phraseEnonce: (T, coef) => `Un bassin vide se remplit puis se vide complètement en ${T} minutes ; son niveau (en L) vaut ${coef} fois le produit du temps de remplissage par le temps de vidange restant.` },
];

const X_S_MIN = 20;
const X_S_MAX = 35;
const COEF_MIN = 1;
const COEF_MAX = 3;

export function construireRemplissageReservoir(variante: "equation"): ExerciceEquationSecondDegre;
export function construireRemplissageReservoir(variante: "inequation"): ExerciceInequationSecondDegre;
export function construireRemplissageReservoir(variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const T = 2 * xS;
  const coef = randomInt(COEF_MIN, COEF_MAX);

  const fonction = { a: -coef, b: coef * T, c: 0 };
  const sommet = { x: xS, y: coef * xS * xS };

  const { delta, domaine } = genererDeltaEtDomaine(xS, 0);
  const sommetDansDomaine = sommetDansIntervalle(xS, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  const base: ExerciceOptimisationModelisation = {
    variante: "modelisation",
    famille: "remplissageReservoir",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phraseEnonce(T, coef),
      labelVariable: "x",
      nomVariable: "le temps de remplissage",
      nomGrandeur: "le niveau",
      uniteVariable: "min",
      uniteGrandeur: "L",
      questionFinale: null,
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    // Niveau = coef·x·y (produit à COEFFICIENT MULTIPLICATIF) — le gabarit générique de l'aide
    // partagée `texteAideConstructionNiveau2` (`ui/formatOptimisation.ts`) suppose "labelVariable ·
    // (isolé)", sans coefficient : fourni explicitement (bug trouvé,
    // `promptrestructurationgenequationinequation.md`, section 3bis).
    formuleSubstitueeTexte: `${coef}x · (${T}-x)`,
    contrainte: {
      enonceLatex: `x + y = ${T}`,
      lettreCherchee: "y",
      pente: -1,
      ordonnee: T,
    },
    // Niveau(x,y) = coef·x·y, x ET y encore présents (écran "contrainteEtGrandeur", champ 2).
    formuleGrandeurXYTexte: `${coef}*x*y`,
    optionsInterpretation: [],
  };

  const k = coef * (xS * xS - delta * delta);

  if (variante === "equation") {
    const racinesCandidates: [number, number] = [xS - delta, xS + delta];
    const racinesValides = racinesDansDomaine(xS, delta, domaine);
    const racinesRejetees = racinesCandidates.filter((r) => !racinesValides.includes(r));
    return {
      variante: "equation",
      famille: "remplissageReservoir",
      base,
      k,
      voieSysteme: false,
      systeme: null,
      racinesCandidates,
      racinesValides,
      questionFinale: formatQuestionFinaleEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "le niveau",
        genreGrandeur: "masculin",
        k,
        uniteGrandeur: "L",
      }),
      optionsInterpretation: construireOptionsInterpretationEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "le niveau",
        genreGrandeur: "masculin",
        uniteVariable: "min",
        uniteGrandeur: "L",
        uniteGrandeurFautive: "L/min",
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
    famille: "remplissageReservoir",
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
      nomGrandeur: "le niveau",
      genreGrandeur: "masculin",
      k,
      uniteGrandeur: "L",
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      labelVariable: "x",
      nomGrandeur: "le niveau",
      genreGrandeur: "masculin",
      uniteVariable: "min",
      uniteGrandeur: "L",
      uniteGrandeurFautive: "L/min",
      k,
      intervalleValide,
      intervalleBrut,
    }),
  };
}

/**
 * Couche A — construction pour l'architecture D ("système à 2 inconnues réduit par substitution",
 * voir `core/equationInequationSecondDegre.types.ts`, en-tête) — module FRÈRE de `vertexForm.ts`/
 * `problemeNombre.ts`. "Solutions d'abord" : `r1`/`r2` (les 2 grandeurs RÉELLES, toujours
 * strictement positives) choisies EN PREMIER, `S=r1+r2` (somme) et `P=r1·r2` (produit) EN
 * DÉCOULENT — jamais l'inverse. `f(x)=x·(S-x)` (aire-like, concave, sommet en `x=S/2`) : `r1,r2`
 * sont TOUJOURS tous les deux dans `[0,S]` (ils somment à S et sont positifs), donc TOUJOURS tous
 * les deux valides — contrairement aux architectures A/B/C, il n'y a jamais de racine à rejeter ici
 * (variante légitime : "2 solutions physiquement possibles", voir conversation).
 *
 * `cible1`/`cible2` (`SystemeEquationInequation`) utilisent toujours la forme CANONIQUE `x+y-S`/
 * `x·y-P` — `diagnostiquerEquivalenceQuadratiqueXY` (`verificationEquationCercle.ts`) accepte
 * n'importe quelle mise à l'échelle non nulle de la cible (ex. l'élève écrit "2x+2y=70" pour un
 * périmètre de 70 quand S=35 : ratio=2, toujours accepté), donc UNE SEULE forme canonique suffit
 * pour toutes les familles, quelle que soit la grandeur physique réellement nommée dans l'énoncé
 * (somme, périmètre...).
 */
import type {
  BaseEquationInequationSecondDegre,
  ExerciceEquationInequationSecondDegre,
  ExerciceEquationSecondDegre,
  ExerciceInequationSecondDegre,
  FamilleEquationInequationSecondDegre,
  SystemeEquationInequation,
  VarianteEquationInequationSecondDegre,
} from "../../core/equationInequationSecondDegre.types";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "./interpretation";

export interface ParametresSystemeSubstitution {
  famille: FamilleEquationInequationSecondDegre;
  /** Les 2 grandeurs réelles, positives et distinctes — choisies EN PREMIER (voir en-tête de
   * fichier). */
  r1: number;
  r2: number;
  /** Libellés affichés à l'écran "poserSysteme" pour chacun des 2 champs (ex. "la somme des deux
   * nombres" / "leur produit"). */
  label1: string;
  label2: string;
  phraseEnonce: string;
  labelVariable: string;
  nomVariable: string;
  nomGrandeur: string;
  genreGrandeur: "masculin" | "feminin";
  uniteVariable: string;
  uniteGrandeur: string;
  uniteGrandeurFautive: string;
}

type Constructeur = {
  (variante: "equation"): ExerciceEquationSecondDegre;
  (variante: "inequation"): ExerciceInequationSecondDegre;
};

export function construireDepuisSysteme(p: ParametresSystemeSubstitution, variante: "equation"): ExerciceEquationSecondDegre;
export function construireDepuisSysteme(p: ParametresSystemeSubstitution, variante: "inequation"): ExerciceInequationSecondDegre;
export function construireDepuisSysteme(p: ParametresSystemeSubstitution, variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  if (p.r1 <= 0 || p.r2 <= 0 || p.r1 === p.r2) {
    throw new Error(`construireDepuisSysteme (${p.famille}) : r1=${p.r1}, r2=${p.r2} doivent être strictement positifs et distincts.`);
  }

  const S = p.r1 + p.r2;
  const P = p.r1 * p.r2;
  const a = -1;
  const b = S;
  const c = 0;
  const k = P;
  const domaine = { inf: 0, sup: S };

  const systeme: SystemeEquationInequation = {
    label1: p.label1,
    label2: p.label2,
    x0: p.r1,
    y0: p.r2,
    cible1: (x, y) => x + y - S,
    cible2: (x, y) => x * y - P,
  };

  const base: BaseEquationInequationSecondDegre = {
    contexte: {
      phraseEnonce: p.phraseEnonce,
      labelVariable: p.labelVariable,
      nomVariable: p.nomVariable,
      nomGrandeur: p.nomGrandeur,
      genreGrandeur: p.genreGrandeur,
      uniteVariable: p.uniteVariable,
      uniteGrandeur: p.uniteGrandeur,
      uniteGrandeurFautive: p.uniteGrandeurFautive,
      questionFinale: null,
    },
    fonction: { a, b, c },
    domaine,
  };

  const racinesCandidates: [number, number] = p.r1 < p.r2 ? [p.r1, p.r2] : [p.r2, p.r1];

  if (variante === "equation") {
    const racinesValides = racinesCandidates.filter((r) => r >= domaine.inf && r <= domaine.sup);
    const racinesRejetees = racinesCandidates.filter((r) => !racinesValides.includes(r));
    return {
      variante: "equation",
      famille: p.famille,
      base,
      k,
      voieSysteme: true,
      systeme,
      racinesCandidates,
      racinesValides,
      questionFinale: formatQuestionFinaleEquationInequation({
        variante: "equation",
        labelVariable: p.labelVariable,
        nomGrandeur: p.nomGrandeur,
        genreGrandeur: p.genreGrandeur,
        k,
        uniteGrandeur: p.uniteGrandeur,
      }),
      optionsInterpretation: construireOptionsInterpretationEquationInequation({
        variante: "equation",
        labelVariable: p.labelVariable,
        nomGrandeur: p.nomGrandeur,
        genreGrandeur: p.genreGrandeur,
        uniteVariable: p.uniteVariable,
        uniteGrandeur: p.uniteGrandeur,
        uniteGrandeurFautive: p.uniteGrandeurFautive,
        k,
        racinesValides,
        racinesRejetees,
      }),
    };
  }

  /** `f(x)=x(S-x)` concave (`a=-1`) : `f(x)>k` entre les racines — toujours `"gt"`, voir en-tête de
   * fichier. */
  const sens = "gt" as const;
  const intervalleBrut = { inf: racinesCandidates[0], sup: racinesCandidates[1] };
  const intervalleValide = { inf: Math.max(intervalleBrut.inf, domaine.inf), sup: Math.min(intervalleBrut.sup, domaine.sup) };
  return {
    variante: "inequation",
    famille: p.famille,
    base,
    k,
    voieSysteme: true,
    systeme,
    sens,
    intervalleBrut,
    intervalleValide,
    questionFinale: formatQuestionFinaleEquationInequation({
      variante: "inequation",
      sens,
      labelVariable: p.labelVariable,
      nomGrandeur: p.nomGrandeur,
      genreGrandeur: p.genreGrandeur,
      k,
      uniteGrandeur: p.uniteGrandeur,
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      sens,
      labelVariable: p.labelVariable,
      nomGrandeur: p.nomGrandeur,
      genreGrandeur: p.genreGrandeur,
      uniteVariable: p.uniteVariable,
      uniteGrandeur: p.uniteGrandeur,
      uniteGrandeurFautive: p.uniteGrandeurFautive,
      k,
      intervalleValide,
      intervalleBrut,
    }),
  };
}

/** Même rôle que `vertexForm.ts::construireAvecParametres`. */
export function construireAvecParametresSysteme(tirerParametres: () => ParametresSystemeSubstitution): Constructeur {
  return ((variante: VarianteEquationInequationSecondDegre) => construireDepuisSysteme(tirerParametres(), variante as "equation")) as Constructeur;
}

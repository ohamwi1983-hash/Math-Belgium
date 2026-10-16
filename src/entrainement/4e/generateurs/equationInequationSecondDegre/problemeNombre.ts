/**
 * Couche A — construction pour l'architecture C ("problèmes de nombres classiques", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) — module FRÈRE de `vertexForm.ts`, JAMAIS
 * réutilisé par lui : ces familles n'ont pas de sommet positif confortable (le sommet de
 * `x²+bx` est toujours en `x=-b/2`, proche de 0 ou négatif), donc ni `genererDeltaEtDomaine` ni la
 * notion de "clip 50/50" de `racines.ts` ne s'appliquent. Construction "racine d'abord" plutôt que
 * "sommet d'abord" : `r1` (la racine entière naturelle positive, LA solution physiquement sensée)
 * est choisie EN PREMIER, `r2` (l'autre racine, TOUJOURS négative par construction — rejetée par le
 * domaine `x≥0`) est DÉRIVÉE par Viète (`r1+r2=-b`, `a=1` fixé), et `k` EN DÉCOULE
 * (`k=f(r1)=r1²+b·r1`). Contrairement aux architectures A/B, il n'y a donc JAMAIS "2 racines
 * valides" pour ces familles — toujours exactement 1 (l'autre est un entier négatif, absurde pour
 * un "nombre entier naturel").
 */
import type {
  BaseEquationInequationSecondDegre,
  ExerciceEquationInequationSecondDegre,
  ExerciceEquationSecondDegre,
  ExerciceInequationSecondDegre,
  FamilleEquationInequationSecondDegre,
  VarianteEquationInequationSecondDegre,
} from "../../core/equationInequationSecondDegre.types";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "./interpretation";

export interface ParametresProblemeNombre {
  famille: FamilleEquationInequationSecondDegre;
  /** `f(x) = x² + b·x` (`a=1`, `c=0` toujours — voir en-tête de fichier). */
  b: number;
  /** La racine entière naturelle positive — choisie EN PREMIER (voir en-tête de fichier). */
  r1: number;
  /** Borne supérieure du "domaine de recherche" ÉNONCÉE explicitement dans `phraseEnonce` (ex. "on
   * cherche un entier naturel inférieur à 100") — jamais une valeur arbitraire non justifiée. */
  domaineSup: number;
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

export function construireDepuisRacine(p: ParametresProblemeNombre, variante: "equation"): ExerciceEquationSecondDegre;
export function construireDepuisRacine(p: ParametresProblemeNombre, variante: "inequation"): ExerciceInequationSecondDegre;
export function construireDepuisRacine(p: ParametresProblemeNombre, variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const a = 1;
  const b = p.b;
  const c = 0;
  const r1 = p.r1;
  const r2 = -b - r1;

  if (r2 >= 0) {
    throw new Error(`construireDepuisRacine (${p.famille}) : r2=${r2} n'est pas négatif — l'invariant "1 seule racine valide" n'est plus garanti pour ce couple (b,r1).`);
  }

  const k = r1 * r1 + b * r1;
  const domaine = { inf: 0, sup: p.domaineSup };

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

  if (variante === "equation") {
    const racinesCandidates: [number, number] = r1 < r2 ? [r1, r2] : [r2, r1];
    const racinesValides = racinesCandidates.filter((r) => r >= domaine.inf && r <= domaine.sup);
    const racinesRejetees = racinesCandidates.filter((r) => !racinesValides.includes(r));
    return {
      variante: "equation",
      famille: p.famille,
      base,
      k,
      voieSysteme: false,
      systeme: null,
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

  /** Toujours `"lt"` : `f` est convexe (`a=1>0`), donc `f(x)<k` entre les 2 racines — intersecté
   * avec le domaine `x≥0` (`r2<0` toujours), ça donne exactement `[0,r1]`, un intervalle BORNÉ sans
   * avoir besoin d'inventer une borne supérieure artificielle pour la partie ">" (qui, elle,
   * n'aurait pas de borne supérieure naturelle — voir en-tête de fichier). */
  const sens = "lt" as const;
  const intervalleBrut = { inf: Math.min(r1, r2), sup: Math.max(r1, r2) };
  const intervalleValide = { inf: Math.max(intervalleBrut.inf, domaine.inf), sup: Math.min(intervalleBrut.sup, domaine.sup) };
  return {
    variante: "inequation",
    famille: p.famille,
    base,
    k,
    voieSysteme: false,
    systeme: null,
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
export function construireAvecParametresNombre(tirerParametres: () => ParametresProblemeNombre): Constructeur {
  return ((variante: VarianteEquationInequationSecondDegre) => construireDepuisRacine(tirerParametres(), variante as "equation")) as Constructeur;
}

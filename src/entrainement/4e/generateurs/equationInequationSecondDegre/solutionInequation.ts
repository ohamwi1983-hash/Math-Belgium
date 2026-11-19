import type {
  BaseEquationInequationSecondDegre,
  ExerciceInequationSecondDegre,
  FamilleEquationInequationSecondDegre,
  IntervalleBorne,
  SystemeEquationInequation,
} from "../../core/equationInequationSecondDegre.types";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "./interpretation";

/**
 * Ensemble des solutions d'une inéquation du second degré EN CONTEXTE (gen57), audit 4e ch. 2 G14 :
 * les deux sens (> et <) et les symboles larges (≥, ≤) dans chaque famille. Selon le signe de a et
 * le sens, la solution est ENTRE les racines ou À L'EXTÉRIEUR ; on la coupe par le domaine de
 * validité. Le générateur ne garde que les tirages où elle forme UN intervalle non vide (réponse à
 * deux bornes) : à l'extérieur des racines, une seule des deux parties doit tomber dans le domaine.
 * Bornes : une racine est comprise si le symbole est large ; une borne du domaine est comprise.
 */
export interface SolutionInequationContexte {
  entreRacines: boolean;
  intervalleValide: IntervalleBorne;
  inclusInf: boolean;
  inclusSup: boolean;
}

export function solutionDansDomaine(a: number, racines: [number, number], domaine: IntervalleBorne, sens: "gt" | "lt", large: boolean): SolutionInequationContexte | null {
  const [r1, r2] = [...racines].sort((x, y) => x - y) as [number, number];
  const entreRacines = (a > 0) === (sens === "lt");
  if (entreRacines) {
    const inf = Math.max(r1, domaine.inf);
    const sup = Math.min(r2, domaine.sup);
    if (inf >= sup) return null;
    return { entreRacines, intervalleValide: { inf, sup }, inclusInf: inf === r1 ? large : true, inclusSup: sup === r2 ? large : true };
  }
  const gauche = domaine.inf < r1;
  const droite = domaine.sup > r2;
  if (gauche === droite) return null;
  if (gauche) {
    const sup = Math.min(r1, domaine.sup);
    return { entreRacines, intervalleValide: { inf: domaine.inf, sup }, inclusInf: true, inclusSup: sup === r1 ? large : true };
  }
  const inf = Math.max(r2, domaine.inf);
  return { entreRacines, intervalleValide: { inf, sup: domaine.sup }, inclusInf: inf === r2 ? large : true, inclusSup: true };
}

/** Variable ENTIÈRE (décision 5) : plus petit et plus grand entier de l'intervalle-solution. */
export function entiersDe(s: SolutionInequationContexte): { min: number; max: number } {
  const { inf, sup } = s.intervalleValide;
  const min = Number.isInteger(inf) ? (s.inclusInf ? inf : inf + 1) : Math.ceil(inf);
  const max = Number.isInteger(sup) ? (s.inclusSup ? sup : sup - 1) : Math.floor(sup);
  return { min, max };
}

export interface ParametresInequationContexte {
  famille: FamilleEquationInequationSecondDegre;
  base: BaseEquationInequationSecondDegre;
  k: number;
  voieSysteme: boolean;
  systeme: SystemeEquationInequation | null;
  racines: [number, number];
  sens: "gt" | "lt";
  large: boolean;
  solution: SolutionInequationContexte;
  entiers: boolean;
}

export function construireInequationContexte(p: ParametresInequationContexte): ExerciceInequationSecondDegre {
  const [r1, r2] = [...p.racines].sort((x, y) => x - y) as [number, number];
  const ctx = p.base.contexte;
  const entiers = p.entiers ? entiersDe(p.solution) : undefined;
  return {
    variante: "inequation",
    famille: p.famille,
    base: p.base,
    k: p.k,
    voieSysteme: p.voieSysteme,
    systeme: p.systeme,
    sens: p.sens,
    large: p.large,
    entreRacines: p.solution.entreRacines,
    intervalleBrut: { inf: r1, sup: r2 },
    intervalleValide: p.solution.intervalleValide,
    inclusInf: p.solution.inclusInf,
    inclusSup: p.solution.inclusSup,
    entiers,
    questionFinale: formatQuestionFinaleEquationInequation({
      variante: "inequation",
      sens: p.sens,
      large: p.large,
      labelVariable: ctx.labelVariable,
      nomGrandeur: ctx.nomGrandeur,
      genreGrandeur: ctx.genreGrandeur,
      k: p.k,
      uniteGrandeur: ctx.uniteGrandeur,
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      sens: p.sens,
      large: p.large,
      labelVariable: ctx.labelVariable,
      nomGrandeur: ctx.nomGrandeur,
      genreGrandeur: ctx.genreGrandeur,
      uniteVariable: ctx.uniteVariable,
      uniteGrandeur: ctx.uniteGrandeur,
      uniteGrandeurFautive: ctx.uniteGrandeurFautive,
      k: p.k,
      intervalleValide: p.solution.intervalleValide,
      inclusInf: p.solution.inclusInf,
      inclusSup: p.solution.inclusSup,
      intervalleBrut: { inf: r1, sup: r2 },
      entiers,
    }),
  };
}

/** Sens et symbole tirés au hasard (moitié chacun). */
export function tirerSensEtSymbole(): { sens: "gt" | "lt"; large: boolean } {
  return { sens: Math.random() < 0.5 ? "gt" : "lt", large: Math.random() < 0.5 };
}

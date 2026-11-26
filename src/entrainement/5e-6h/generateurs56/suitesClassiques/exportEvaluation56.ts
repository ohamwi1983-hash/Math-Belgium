import { adaptateurMixte } from "../../commun56/adaptateurMixte";
import { adaptateurEvaluationSuitesClassiques } from "./exportEvaluation";
import { adaptateurFractales, estFractale } from "./fractales";

/** Adaptateur papier de 56gen8 : celui de la copie de 5gen17 pour ses scénarios (tirage libre, indices,
 * `?code=` inchangés), puis la famille « fractales » (von Koch, Sierpinski) en fin de catalogue. */
export const adaptateurEvaluation56gen8 = adaptateurMixte(adaptateurEvaluationSuitesClassiques, adaptateurFractales, estFractale);

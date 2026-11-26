import { adaptateurMixte } from "../../commun56/adaptateurMixte";
import { adaptateurEvaluationSuiteRecurrenteAffine } from "./exportEvaluation";
import { adaptateurInstable, estInstable } from "./instable";

/** Adaptateur papier de 56gen12 : celui de la copie de 5gen19 pour ses régimes (tirage libre, indices,
 * `?code=` inchangés), puis « point fixe et erreur d'arrondi » en fin de catalogue. */
export const adaptateurEvaluation56gen12 = adaptateurMixte(adaptateurEvaluationSuiteRecurrenteAffine, adaptateurInstable, estInstable);

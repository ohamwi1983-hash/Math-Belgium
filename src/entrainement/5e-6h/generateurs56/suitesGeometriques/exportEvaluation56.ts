import { adaptateurMixte } from "../../commun56/adaptateurMixte";
import { adaptateurEvaluationSuitesGeometriques } from "./exportEvaluation";
import { adaptateurInserer, estInserer } from "./inserer";

/** Adaptateur papier de 56gen2 : celui de la copie de 5gen15 pour ses variantes (tirage libre, indices,
 * `?code=` inchangés), puis la variante « insérer k termes » en fin de catalogue. */
export const adaptateurEvaluation56gen2 = adaptateurMixte(adaptateurEvaluationSuitesGeometriques, adaptateurInserer, estInserer);

import { adaptateurMixte } from "../../commun56/adaptateurMixte";
import { adaptateurEvaluationDefinirSuite } from "./exportEvaluation";
import { adaptateurArrondies, estArrondies } from "./arrondies";

/** Adaptateur papier de 56gen3 : celui de la copie de 5gen44 pour ses variantes (tirage libre, indices,
 * `?code=` inchangés), puis « données arrondies : raison environ » en fin de catalogue. */
export const adaptateurEvaluation56gen3 = adaptateurMixte(adaptateurEvaluationDefinirSuite, adaptateurArrondies, estArrondies);

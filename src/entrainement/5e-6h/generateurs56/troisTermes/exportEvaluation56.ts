import { adaptateurMixte } from "../../commun56/adaptateurMixte";
import { adaptateurEvaluationTroisTermes } from "./exportEvaluation";
import { adaptateurTermes56, estTermes56 } from "./nouvelles";

/** Adaptateur papier de 56gen5 : celui de la copie de 5gen46 pour ses variantes (tirage libre, indices,
 * `?code=` inchangés), puis « quatre termes » (somme, produit) et « triangle rectangle » en fin de
 * catalogue. */
export const adaptateurEvaluation56gen5 = adaptateurMixte(adaptateurEvaluationTroisTermes, adaptateurTermes56, estTermes56);

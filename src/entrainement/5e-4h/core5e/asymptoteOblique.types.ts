/**
 * Couche core (5e) — contrat pour `5gen21` ("Asymptote oblique", chapitre "Limites et asymptotes",
 * à la suite de 5gen20). UN SEUL modèle de génération sous-jacent — `variante` ne change QUE la
 * technique de résolution demandée à l'élève, jamais les nombres générés.
 *
 * f(x)=P(x)/D(x), D(x) MONIC de degré 1 (P2/P1) ou 2 (P3/P2) — quotient Q(x)=ax+b et reste
 * (constante c) TOUJOURS choisis EN PREMIER (construction "à l'envers"), P(x) TOUJOURS dérivé
 * ensuite par expansion algébrique exacte de Q(x)*D(x)+c — jamais de rejet/régénération, le
 * résultat est par construction toujours propre.
 */

export type VarianteAsymptoteOblique = "divisionEuclidienne" | "viaLimites";

export interface ExerciceAsymptoteOblique {
  variante: VarianteAsymptoteOblique;
  /** Coefficient dominant du quotient Q(x)=ax+b — jamais nul. */
  a: number;
  b: number;
  /** Reste de la division — jamais nul (sinon l'asymptote serait atteinte exactement, cas dégénéré
   * hors périmètre de cet exercice). TOUJOURS une constante, quel que soit le degré de D(x) (son
   * degré 0 reste strictement inférieur à celui de D(x), 1 ou 2 — condition suffisante pour que la
   * fraction c/D(x) tende vers 0 à l'infini). */
  c: number;
  /** D(x) MONIC (coefficient dominant toujours 1) — `coeffsD[i]` = coefficient de x^i. Longueur 2
   * (degré 1, D(x)=x-k, P2/P1) ou 3 (degré 2, D(x)=x²+px+q, P3/P2 — `q` TOUJOURS strictement
   * supérieur à `p²/4` par construction, discriminant négatif garanti, donc AUCUNE racine réelle à
   * exclure lors de l'échantillonnage de vérification, contrairement au degré 1 où x=k doit l'être). */
  coeffsD: number[];
  /** P(x)=Q(x)*D(x)+c développé, TOUJOURS dérivé de a/b/c/coeffsD — `coeffsP[i]` = coefficient de
   * x^i, longueur `coeffsD.length+1` (degré = degré de D(x) + 1, l'écart caractéristique de
   * l'asymptote oblique). */
  coeffsP: number[];
}

export type GenerateurExerciceAsymptoteOblique = () => ExerciceAsymptoteOblique;

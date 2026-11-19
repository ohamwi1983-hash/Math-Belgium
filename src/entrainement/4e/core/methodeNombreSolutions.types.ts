/**
 * Couche core — « Reconnaître la méthode et le nombre de solutions » (gen113, 4e, chapitre 2
 * « Équations et inéquations du second degré », section `resoudre`, processus 1 CONNAÎTRE). Série
 * rapide : une équation du second degré, trois écrans au plus —
 * 1. la méthode la plus rapide (6 choix fermés, une tentative) ;
 * 2. le nombre de solutions, justifié en une ligne (4 affirmations, une seule vraie, une tentative) ;
 * 3. les solutions, seulement quand elles sont évidentes (mise en évidence, différence de deux
 *    carrés, carré parfait, racine évidente) — 3 tentatives.
 *
 * Décision 1 de l'utilisateur (`decisions-4e-ch2.md`) : quand a + b + c = 0 ou a − b + c = 0, la
 * racine évidente est la méthode attendue, et le discriminant est AUSSI accepté (l'écran le dit).
 *
 * VARIANTE = allure de l'équation (incomplète : c = 0 ou b = 0 ; complète : b ≠ 0 et c ≠ 0). La
 * MÉTHODE est le verdict de l'écran 1 : tirée au hasard (équiprobable parmi les trois de la variante),
 * jamais fixée par `forme`.
 */

export type VarianteMethodeNombreSolutions = "incompletes" | "completes";

export type MethodeRapide = "miseEnEvidence" | "differenceCarres" | "aucuneSolution" | "carreParfait" | "racineEvidente" | "discriminant";

/** Affirmations de l'écran 2 (« N solutions, car … ») : chacune est cohérente (sa prémisse entraîne
 * son nombre) ; elle est VRAIE pour l'équation ssi sa prémisse l'est. */
export type IdAffirmation = "facteurX" | "moinsCaPositif" | "moinsCaNegatif" | "deltaNul" | "deltaPositif" | "deltaNegatif" | "racineEvidente1" | "racineEvidenteMoins1" | "produitNegatif";

export interface ExerciceMethodeNombreSolutions {
  variante: VarianteMethodeNombreSolutions;
  methode: MethodeRapide;
  /** Équation réduite ax² + bx + c = 0 (coefficients entiers). */
  a: number;
  b: number;
  c: number;
  /** Présentation : `reduite` (ax² + bx + c = 0) ou `deplacee` (un terme passé dans le membre de droite). */
  presentation: "reduite" | "deplacee";
  /** Terme déplacé à droite quand `presentation = deplacee` : 1 = bx, 0 = c. */
  termeDeplace: 0 | 1;
  /** Les 4 affirmations de l'écran 2, dans l'ordre d'affichage (tiré à la génération). */
  affirmations: IdAffirmation[];
}

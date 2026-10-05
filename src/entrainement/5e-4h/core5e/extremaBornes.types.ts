/**
 * Couche core (5e) — contrat pour 5gen34 ("Extrema en contexte borné"), générateur du chapitre
 * "Dérivées et applications". Contrairement aux générateurs précédents du chapitre (domaine NON
 * borné, extrema uniquement LOCAUX — ex. 5gen29), ici t∈[0;T] est un intervalle FERMÉ ET BORNÉ :
 * l'extremum ABSOLU n'est pas nécessairement un extremum LOCAL — il faut AUSSI comparer aux
 * valeurs de f aux BORNES du domaine (t=0 et t=T). Type pur, aucune logique (construction "à
 * l'envers" depuis les racines de f' + calcul des 4 cas croisés max/min local/borne vivent en
 * Couche A, `generateurs5e/extremaBornes/index.ts`).
 */

/** Contexte narratif temporel borné (banque dédiée, `generateurs5e/extremaBornes/contextes.ts`) —
 * habille f(t) d'une grandeur concrète, jamais un simple "f(x)" abstrait pour ce générateur. Sujet
 * grammatical SINGULIER (jamais pluriel) — même convention que
 * `core/bienaymeTchebychev.types.ts::ContexteBienaymeTchebychev`. */
export interface ContexteExtremaBornes {
  id: string;
  /** Ex. "la consommation électrique du site". */
  grandeur: string;
  /** Unité de la grandeur, ex. "kWh". */
  unite: string;
  /** Description de la variable temporelle, ex. "le nombre d'heures écoulées depuis minuit". */
  variableDef: string;
  /** Unité de la variable temporelle, ex. "heures". */
  uniteTemps: string;
}

/** Le piège central du générateur : un extremum ABSOLU peut être un extremum LOCAL de f, ou une
 * des 2 BORNES du domaine — les 2 cas (max/min) sont INDÉPENDANTS l'un de l'autre. */
export type CasBorneAbsolu = "local" | "borne";

/** Classification d'une racine de f'(t)=0 — TOUJOURS un vrai extremum ici (jamais
 * "ni_lun_ni_lautre", contrairement à 5gen29 : la construction "à l'envers" garantit toujours un
 * changement de signe réel de f' à chaque racine choisie — voir Couche A). */
export type ClassificationExtremumBorne = "max" | "min";

/** f(t) = a·t³+b·t²+c·t+d (degre=3, 2 racines de f') ou a·t⁴+b·t³+c·t²+d·t+e (degre=4, 3 racines
 * de f'), construit "à l'envers" depuis les racines CHOISIES de f'(t)=0 (même technique que
 * 5gen29/5gen28, jamais résolu puis vérifié). */
export interface ExerciceExtremaBornes {
  contexte: ContexteExtremaBornes;
  /** Borne supérieure du domaine [0;T], entier (≈6 à 24). */
  T: number;
  /** Coefficients de f(t), ASCENDANTS (coeffs[i] = coefficient de t^i) — longueur `degre+1`,
   * `coeffs[0]` = constante d (ou e), toujours un entier exact (comme tous les autres coefficients
   * et toutes les valeurs de f produites par ce générateur — jamais de décimal). */
  coeffs: number[];
  degre: 3 | 4;
  /** Racines de f'(t)=0, TOUTES strictement à l'intérieur de ]0;T[, triées croissant, longueur 2
   * (degre=3) ou 3 (degre=4). Toujours des entiers exacts. Vérité terrain, jamais recalculée en
   * résolvant f'(t)=0 une seconde fois côté vérification. */
  racinesFPrime: number[];
  /** Même longueur/ordre que `racinesFPrime`, alternée max/min (racines simples, jamais de racine
   * double dans ce générateur). */
  classificationFPrime: ClassificationExtremumBorne[];
}

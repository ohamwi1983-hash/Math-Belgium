/**
 * Couche A — contrat du générateur (section 1 de la spec).
 * Ce module ne doit jamais importer quoi que ce soit de src/moteur : le générateur ignore tout
 * des tentatives, pénalités, ou des réglages d'affichage de la session (Couche B — voir
 * ReglagesSession.affichageReponseApresEchec/affichageExplication). La forme d'affichage
 * ci-dessous est différente : c'est la présentation typographique de l'énoncé lui-même, une
 * propriété de l'exercice généré au même titre que la catégorie, pas un réglage de session.
 */

/**
 * "irreductible" (Δ<0, aucune racine réelle) est exclusive à "Analyse d'une fonction du second
 * degré" (chapitre 1, prompt-cas-non-factorisable.md) — jamais produite par aucune des 5 familles
 * de l'exercice 1 lui-même (toutes garantissent Δ≥0 par construction), ni par aucun des 6 autres
 * exercices qui réutilisent ce contrat (3, 4, 5, 6). Un `Exercice` de cette catégorie a
 * `solution.racines` non significatif (voir son commentaire) et n'a pas de forme factorisée —
 * son étape "reconnaissance" (module verification.ts) n'est jamais suivie de factorisation ni de
 * racines côté "Analyse d'une fonction", donc les fonctions génériques qui en dépendent
 * (verifierChampPrincipal, formatTemplateChampPrincipal...) ne sont jamais appelées avec cette
 * catégorie en pratique — leurs branches "irreductible" lèvent ou retournent une valeur neutre,
 * seulement pour rester exhaustives au sens de TypeScript.
 */
export type Categorie =
  | "mise_en_evidence"
  | "binome_conjugue"
  | "produit_remarquable"
  | "cas_general"
  | "mise_en_evidence_generalisee"
  | "irreductible";

/**
 * Présentation typographique de l'énoncé, indépendante de la catégorie :
 * - canonique : ax²+bx+c=0 (termes nuls omis)
 * - isolee_constante : ax²+bx=-c
 * - isolee_carre : ax²=-bx-c
 * - produit_egale_constante : x(x+b)=-c (uniquement quand a=1, pour rester lisible)
 * - carre_egale_expression : (x+p)²=mx+mp — uniquement pour mise_en_evidence_generalisee
 * - composee : (x+p)²+k(x+p)=0, k=-m — uniquement pour mise_en_evidence_generalisee
 * N'affecte que le rendu ; la vérification des réponses se base toujours sur enonce/solution.
 */
export type FormeAffichage =
  | "canonique"
  | "isolee_constante"
  | "isolee_carre"
  | "produit_egale_constante"
  | "carre_egale_expression"
  | "composee";

/** ax² + bx + c = 0 */
export interface Enonce {
  a: number;
  b: number;
  c: number;
}

export interface Solution {
  /** présent uniquement si categorie !== "cas_general" et categorie !== "irreductible" */
  formeFactorisee?: string;
  /** présent uniquement si categorie === "cas_general" */
  delta?: number;
  /**
   * toujours présent ; les deux valeurs sont égales si racine double. Pour categorie ===
   * "irreductible" (Δ<0, "Analyse d'une fonction" uniquement), il n'existe aucune racine réelle —
   * ce champ vaut alors `[NaN, NaN]` plutôt que d'être omis (le type l'exige toujours présent) ;
   * il n'est jamais lu dans ce cas, l'échec explicite (NaN) est délibéré si jamais mal utilisé.
   */
  racines: [number, number];
  /** false réservé à une itération future (racines irrationnelles arrondies à 2 décimales) */
  racinesExactes: boolean;
}

/**
 * Présent uniquement pour une variante irrationnelle (familles 1-4, ~50% de chance chacune) :
 * l'équation résulte de x = √k·y appliqué à une équation de base rationnelle (a=1, B, C).
 * Les racines et le terme demandé au champ 1 sont alors toujours un rationnel pur (0 ou un
 * nombre normal) ou un multiple rationnel pur de √k — jamais une somme mixte. Le champ 1 et
 * l'étape "zéros" restent des champs libres (prompt-generateurs123groupe.md, point 6 — remplace
 * l'ancien gabarit à emplacement(s) numérique(s) "□√k") acceptant l'expression complète sous
 * toutes ses formes équivalentes (`6sqrt(5)`, `6*sqrt(5)`...), vérifiés via le moteur de
 * vérification symbolique standard (`expressionGenerale.ts`) plutôt qu'un simple `Number()`.
 */
export interface VarianteIrrationnelle {
  /** k ∈ {2,3,5,6,7,10} */
  k: number;
  /** coefficient rationnel B de l'équation de base (a=1, y² + By + C = 0) — sert au rendu canonique b = B√k */
  B: number;
  /**
   * Présent ssi le champ 1 de cette catégorie a un gabarit irrationnel — discriminant utilisé par
   * `diagnostiquerChampPrincipal` pour router vers la vérification symbolique dédiée. Absent pour
   * "cas_general" : son champ 1 (Δ) reste le champ normal inchangé, Δ étant toujours rationnel
   * (Δ = k·Δ_base) même dans la variante irrationnelle. La valeur elle-même (B, D ou r selon la
   * catégorie) n'est plus comparée directement depuis prompt-generateurs123groupe.md, point 6 —
   * seule sa présence/absence importe désormais ; la vraie cible de comparaison est toujours
   * `exercice.enonce` (qui porte déjà la valeur irrationnelle réelle, ex. b = B√k).
   */
  champPrincipal?: number;
  /** racines = coefficient·√k ; toujours présent, les deux valeurs sont égales si racine double */
  racinesCoefficients: [number, number];
}

export interface Exercice {
  categorie: Categorie;
  enonce: Enonce;
  solution: Solution;
  formeAffichage: FormeAffichage;
  /**
   * Paramètres additionnels nécessaires au rendu de certaines formes d'affichage qui ne sont pas
   * de simples réarrangements de ax²+bx+c=0 (ex: p,m pour carre_egale_expression/composee) —
   * jamais utilisés par la vérification, uniquement par formatEnonceAffichage. Absent sinon.
   */
  parametresAffichage?: { p: number; m: number };
  /** présent uniquement pour une variante irrationnelle — voir VarianteIrrationnelle. Toujours
   * affichée en forme canonique (formeAffichage="canonique"), jamais isolée/produit=constante. */
  irrationnel?: VarianteIrrationnelle;
}

/**
 * Contrat que doit respecter toute implémentation de la Couche A.
 * Le moteur de session (Couche B) ne connaît que cette signature.
 */
export type GenerateurExercice = () => Exercice;

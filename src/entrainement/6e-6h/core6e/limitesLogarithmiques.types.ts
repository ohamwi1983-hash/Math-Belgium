/**
 * Couche core (6e) — contrat pour `6gen17` ("Calculer des limites, fonctions logarithmes",
 * chapitre 3). 3 familles A-C STRUCTURELLEMENT DISJOINTES (union discriminée), même principe que
 * `limitesExponentielles.types.ts` (6gen6, chapitre 2) : nombre d'écrans variable (2 ou 3) et forme
 * de réponse variable par écran, la plupart catégorielle (+∞/−∞/0/valeur) plutôt qu'un champ libre
 * systématique.
 *
 * **Réutilisation du statut catégoriel** (`CibleLimiteLog`) — MIROIR LOCAL de `CibleLimite`
 * (`limitesExponentielles.types.ts`, 6gen6), jamais importé : chaque générateur 6e garde son propre
 * contrat (voir CLAUDE.md, "pas de moteur de session unifié") ; seul le PATRON (mêmes 4 variantes
 * `plus_infini`/`moins_infini`/`zero`/`valeur`) est répliqué à la main.
 *
 * **Décision de conception — Famille A, `CategorieCroissance`** : la spec demande d'identifier "le
 * terme dominant" au numérateur et au dénominateur séparément, en appliquant la hiérarchie
 * log≪polynôme≪exponentielle(base>1). Modélisé comme un choix CATÉGORIEL à 3 valeurs
 * (`"log"`/`"polynome"`/`"exponentielle"`) plutôt qu'une description textuelle libre — cohérent
 * avec le principe "champ texte libre réservé aux calculs/expressions" déjà établi (6gen6, famille
 * G, note de conception sur l'écran "ordre1").
 *
 * **Décision de conception — Famille A, sous-type 3 ("quotient de logs")** : f(x) =
 * (p1·ln(x)+c1)/(p2·log_base(x)+c2). Le terme dominant de chaque côté est un LOGARITHME (il domine
 * la constante), d'où une forme ∞/∞ entre deux logarithmes de bases différentes : la réécriture
 * log_base(x) = ln(x)/ln(base) donne la limite p1·ln(base)/p2. (L'ancienne forme, un produit
 * x^d·ln(x) sur x^d·log_base(x), rendait la catégorie « logarithme / logarithme » incohérente :
 * c'est la puissance de x qui y décidait de la limite.)
 *
 * **Décision de conception — Famille B, sous-type "quotient de logs"** : la spec écrit littéralement
 * `log_(x^k)(g(x))` avec la condition "x0^k=1 au même point x0", mais avec `x0∈{1,2}` cette
 * condition n'est algébriquement cohérente que pour x0=1 (2^k≠1 pour k∈{1,2,3}). Réinterprété comme
 * `log_{(x/x0)^k}(g(x))` — la base `(x/x0)^k` tend vers 1^k=1 pour N'IMPORTE QUEL x0 quand x→x0,
 * rendant la condition cohérente pour x0∈{1,2} comme demandé, tout en préservant exactement les
 * paramètres de génération donnés (k, m, n, x0) et la substitution u=x/x0−1 déjà prescrite pour le
 * sous-type "produit" voisin (qui, lui, ne pose aucune ambiguïté : `log_(x/x0)(k)`).
 *
 * **Décision de conception — Famille C** : 3 sous-types calqués sur les 3 exemples de la spec —
 * `c1` (`log_x(x+cste)`, x→1±, dénominateur→0 signé par la direction), `c2` (`x·base^(c/x)`,
 * x→±∞, second facteur→constante non nulle), `c3` (`(base^x+q+sin(x))/ln(1+c·x²)`, x→0,
 * numérateur→1+q, valeur finie NON NULLE par construction (q≠−1), de signe variable pour que la
 * limite (+∞ ou −∞) ne se devine pas). L'écran 1 ("évaluer
 * séparément chaque partie") est modélisé par une réponse à 2 parties, chacune une cible
 * catégorielle `CibleLimiteLog` — même primitive que l'écran 2 (conclusion), réutilisée pour les
 * DEUX écrans de cette famille.
 *
 * **Familles D (forme 1^∞) et E (développements limités) retirées** (audit chapitre 3 de 6e,
 * décision K4) : ces deux techniques ne sont enseignées dans aucun cours du site. Le générateur
 * se limite aux trois familles couvertes par la section « Calculer des limites » du cours :
 * croissances comparées (A), limite de référence ln(1+u)/u → 1 (B), limites déterminées
 * déguisées (C).
 *
 * **Valeur exacte affichée** : toute cible `valeur` porte sa forme LaTeX EXACTE (`latex`, ex.
 * `\frac{\ln 5}{2}`), construite par le générateur — jamais un flottant brut affiché à l'élève.
 */

export type FamilleLimiteLogarithmique = "A" | "B" | "C";

/** Cible catégorielle ou valeur exacte — voir la note de conception ci-dessus. */
export type CibleLimiteLog = { type: "plus_infini" } | { type: "moins_infini" } | { type: "zero" } | { type: "valeur"; valeur: number; latex: string };

export type DirectionX = "plus_infini" | "moins_infini";

/** Catégorie de croissance d'un terme dominant (famille A). */
export type CategorieCroissance = "log" | "polynome" | "exponentielle";

// ============================================================================
// Famille A — Croissances comparées (2 écrans : dominance, conclure). 5 sous-types
// STRUCTURELLEMENT disjoints (union sur `sousType`), toujours x→+∞ (vers −∞, baseˣ→0 n'est pas
// une forme indéterminée : la dominance n'y aurait aucun sens).
// ============================================================================

/** Sous-type 1 — f(x) = k·ln(x) / (a·x^d + b), x→+∞. Toujours → 0 (log≪polynôme). */
export interface ExerciceLimiteLogA1 {
  famille: "A";
  sousType: "sous1";
  k: number;
  a: number;
  d: 1 | 2 | 3;
  b: number;
  dominanceNumerateur: CategorieCroissance;
  dominanceDenominateur: CategorieCroissance;
  limiteGlobale: CibleLimiteLog;
}

/** Sous-type 2 — f(x) = base^x / (q·x^d) (`expSurPoly`, → +∞) ou (q·x^d) / base^x
 * (`polySurExp`, → 0), base>1, q>0, x→+∞. */
export interface ExerciceLimiteLogA2 {
  famille: "A";
  sousType: "sous2";
  base: number;
  q: number;
  d: 1 | 2 | 3;
  orientation: "expSurPoly" | "polySurExp";
  dominanceNumerateur: CategorieCroissance;
  dominanceDenominateur: CategorieCroissance;
  limiteGlobale: CibleLimiteLog;
}

/** Sous-type 3 — f(x) = (p1·ln(x) + c1) / (p2·log_base(x) + c2), x→+∞. Le logarithme domine
 * la constante des deux côtés (forme ∞/∞) ; après réécriture log_base(x) = ln(x)/ln(base), la
 * limite vaut p1·ln(base)/p2. */
export interface ExerciceLimiteLogA3 {
  famille: "A";
  sousType: "sous3";
  p1: number;
  c1: number;
  p2: number;
  c2: number;
  base: number;
  dominanceNumerateur: CategorieCroissance;
  dominanceDenominateur: CategorieCroissance;
  limiteGlobale: CibleLimiteLog;
}

/** Sous-type 4 — f(x) = (a·x^d+c+log_base1(x)) / (a·x^d+c+log_base2(x)), MÊME polynôme des deux
 * côtés, x→+∞. Toujours → 1 (logs négligeables des deux côtés). */
export interface ExerciceLimiteLogA4 {
  famille: "A";
  sousType: "sous4";
  a: number;
  d: 1 | 2 | 3;
  c: number;
  base1: number;
  base2: number;
  dominanceNumerateur: CategorieCroissance;
  dominanceDenominateur: CategorieCroissance;
  limiteGlobale: CibleLimiteLog;
}

/** Sous-type 5 — f(x) = (a1·x^d1+c1·base1^x) / (a2·x^d2+c2·base2^x), base1<1 (négligeable),
 * base2>1 (dominant), x→+∞. Toujours → 0. */
export interface ExerciceLimiteLogA5 {
  famille: "A";
  sousType: "sous5";
  a1: number;
  d1: 1 | 2 | 3;
  c1: number;
  base1: number;
  a2: number;
  d2: 1 | 2 | 3;
  c2: number;
  base2: number;
  dominanceNumerateur: CategorieCroissance;
  dominanceDenominateur: CategorieCroissance;
  limiteGlobale: CibleLimiteLog;
}

export type ExerciceLimiteLogA = ExerciceLimiteLogA1 | ExerciceLimiteLogA2 | ExerciceLimiteLogA3 | ExerciceLimiteLogA4 | ExerciceLimiteLogA5;

// ============================================================================
// Famille B — 0/0 via ln(1+u)/u→1, base du log qui tend vers 1 (2 écrans : reformuler, conclure).
// 2 sous-types STRUCTURELLEMENT disjoints.
// ============================================================================

/** "Quotient de logs" — f(x) = log_{(x/x0)^k}(mx+n), x→x0, m·x0+n=1 (garantit g(x0)=1 en même
 * temps que la base (x/x0)^k→1). Limite = m·x0/k (voir A.ts... voir B.ts pour la dérivation). */
export interface ExerciceLimiteLogB1 {
  famille: "B";
  sousType: "quotient";
  k: 1 | 2 | 3;
  x0: 1 | 2;
  m: number;
  n: number;
  limiteFinale: number;
  /** Forme exacte de `limiteFinale` (fraction irréductible). */
  limiteLatex: string;
}

/** "Produit" — f(x) = (x−x0)·log_{x/x0}(k), x→x0. Forme 0×∞. Limite = x0·ln(k). */
export interface ExerciceLimiteLogB2 {
  famille: "B";
  sousType: "produit";
  k: number;
  x0: 1 | 2;
  limiteFinale: number;
  /** Forme exacte de `limiteFinale` (ex. `2\ln(3)`). */
  limiteLatex: string;
}

export type ExerciceLimiteLogB = ExerciceLimiteLogB1 | ExerciceLimiteLogB2;

// ============================================================================
// Famille C — Limites déterminées simples, parfois déguisées en FI (2 écrans : diagnostic,
// conclure). 3 sous-types calqués sur les 3 exemples de la spec.
// ============================================================================

/** c1 — f(x) = ln(x+c)/ln(x), x→1± (direction tirée). Dénominateur→0 (signé par la direction). */
export interface ExerciceLimiteLogC1 {
  famille: "C";
  sousType: "c1";
  c: number;
  direction: "droite" | "gauche";
  partieNumerateur: CibleLimiteLog;
  partieDenominateur: CibleLimiteLog;
  limiteFinale: CibleLimiteLog;
}

/** c2 — f(x) = x·base^(coefC/x), base>1, x→±∞ (direction tirée). Forme "∞ × constante non
 * nulle" (le second facteur tend TOUJOURS vers 1, jamais une autre constante — voir C.ts). */
export interface ExerciceLimiteLogC2 {
  famille: "C";
  sousType: "c2";
  base: number;
  coefC: number;
  direction: DirectionX;
  partieFacteur1: CibleLimiteLog;
  partieFacteur2: CibleLimiteLog;
  limiteFinale: CibleLimiteLog;
}

/** c3 — f(x) = (base^x + q + sin(x)) / ln(1+coefC·x²), base>1, x→0. Numérateur→1+q≠0 (piège
 * central : ressemble à 0/0 mais ne l'est pas) ; le signe de 1+q fixe celui de l'infini. */
export interface ExerciceLimiteLogC3 {
  famille: "C";
  sousType: "c3";
  base: number;
  q: number;
  coefC: number;
  partieNumerateur: CibleLimiteLog;
  partieDenominateur: CibleLimiteLog;
  limiteFinale: CibleLimiteLog;
}

export type ExerciceLimiteLogC = ExerciceLimiteLogC1 | ExerciceLimiteLogC2 | ExerciceLimiteLogC3;

export type ExerciceLimiteLogarithmique = ExerciceLimiteLogA | ExerciceLimiteLogB | ExerciceLimiteLogC;

export type GenerateurExerciceLimiteLogarithmique = () => ExerciceLimiteLogarithmique;

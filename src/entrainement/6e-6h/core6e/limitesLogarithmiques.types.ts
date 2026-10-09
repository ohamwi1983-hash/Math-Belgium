/**
 * Couche core (6e) — contrat pour `6gen17` ("Calculer des limites, fonctions logarithmes",
 * chapitre 3). 5 familles A-E STRUCTURELLEMENT DISJOINTES (union discriminée), même principe que
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
 * **Décision de conception — Famille A, sous-type 3 ("quotient de logs")** : la spec décrit
 * `P1(x)·ln(x)/(P2(x)·log_base(x))`, un ratio de PRODUITS (pas de sommes) — la notion de "terme
 * dominant" ne s'applique pas littéralement à un facteur unique de chaque côté. Modélisé en
 * considérant que la partie notable de chaque côté (celle qui nécessite la réécriture
 * log_base(x)=ln(x)/ln(base) pour être comparée) est catégorisée `"log"` des deux côtés — le calcul
 * final (écran 2) compare ensuite les degrés de P1/P2 (ratio de polynômes, technique déjà connue)
 * une fois ln(x) simplifié. P1/P2 sont ici des MONÔMES (p·x^d) pour garder l'écran 2 calculable
 * simplement par comparaison de degrés d1/d2.
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
 * x→±∞, second facteur→constante non nulle), `c3` (`(base^x−base+sin(x))/ln(1+c·x²)`, x→0,
 * numérateur→valeur finie non nulle par construction, calqué directement sur l'exemple
 * `(2^x−2+sinx)/ln(1+4x²)` de la spec, base>1 imposé pour garantir un numérateur toujours négatif
 * et donc une limite globale toujours déterminée sans ambiguïté de signe). L'écran 1 ("évaluer
 * séparément chaque partie") est modélisé par une réponse à 2 parties, chacune une cible
 * catégorielle `CibleLimiteLog` — même primitive que l'écran 2 (conclusion), réutilisée pour les
 * DEUX écrans de cette famille.
 *
 * **Décision de conception — Famille D** : `f(x)=(cos(kx))^(c/x²)`, x→0, forme 1^∞. Vérifié par
 * construction : limite finale = `e^(−ck²/2)` (dérivation : ln(f)=(c/x²)·ln(cos(kx)),
 * ln(cos(kx))≈−(kx)²/2 pour x→0 [équivalent à ln(1+u)~u appliqué à u=cos(kx)−1≈−(kx)²/2], donc
 * ln(f)→(c/x²)·(−k²x²/2)=−ck²/2).
 *
 * **Décision de conception — Famille E** : instance UNIQUE codée en dur (même patron que la famille
 * G de `limitesExponentielles.types.ts`, 6gen6) — `f(x)=(3^x·sin(x)−ln(1+x))/(x⁴+4x²)`, x→0,
 * limite=`(2ln3+1)/8` (spec explicite, propriété non généralisable à d'autres coefficients : les
 * développements à l'ordre 1 s'annulent EXACTEMENT, il faut pousser à l'ordre 2 — voir
 * `generateurs6e/limitesLogarithmiques/familles/E.ts` pour la dérivation complète). Tirée avec un
 * poids RÉDUIT par rapport aux familles A-D (voir `generateurs6e/limitesLogarithmiques/index.ts`).
 */

export type FamilleLimiteLogarithmique = "A" | "B" | "C" | "D" | "E";

/** Cible catégorielle ou valeur exacte — voir la note de conception ci-dessus. */
export type CibleLimiteLog = { type: "plus_infini" } | { type: "moins_infini" } | { type: "zero" } | { type: "valeur"; valeur: number };

export type DirectionX = "plus_infini" | "moins_infini";

/** Catégorie de croissance d'un terme dominant (famille A). */
export type CategorieCroissance = "log" | "polynome" | "exponentielle";

// ============================================================================
// Famille A — Croissances comparées (2 écrans : dominance, conclure). 5 sous-types
// STRUCTURELLEMENT disjoints (union sur `sousType`), toujours x→+∞ SAUF le sous-type 2 (x→±∞, seul
// sous-type dont la spec mentionne explicitement les deux directions).
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

/** Sous-type 2 — f(x) = base^x / (q·x^d), base>1, q>0 (simplification assumée, voir A.ts),
 * x→±∞ (direction tirée). */
export interface ExerciceLimiteLogA2 {
  famille: "A";
  sousType: "sous2";
  base: number;
  q: number;
  d: 1 | 2 | 3;
  direction: DirectionX;
  dominanceNumerateur: CategorieCroissance;
  dominanceDenominateur: CategorieCroissance;
  limiteGlobale: CibleLimiteLog;
}

/** Sous-type 3 — f(x) = (p1·x^d1·ln(x)) / (p2·x^d2·log_base(x)), x→+∞. */
export interface ExerciceLimiteLogA3 {
  famille: "A";
  sousType: "sous3";
  p1: number;
  d1: 1 | 2 | 3;
  p2: number;
  d2: 1 | 2 | 3;
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
}

/** "Produit" — f(x) = (x−x0)·log_{x/x0}(k), x→x0. Forme 0×∞. Limite = x0·ln(k). */
export interface ExerciceLimiteLogB2 {
  famille: "B";
  sousType: "produit";
  k: number;
  x0: 1 | 2;
  limiteFinale: number;
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

/** c3 — f(x) = (base^x−base+sin(x)) / ln(1+coefC·x²), base>1, x→0. Numérateur→1−base≠0 (piège
 * central : ressemble à 0/0 mais ne l'est pas). */
export interface ExerciceLimiteLogC3 {
  famille: "C";
  sousType: "c3";
  base: number;
  coefC: number;
  partieNumerateur: CibleLimiteLog;
  partieDenominateur: CibleLimiteLog;
  limiteFinale: CibleLimiteLog;
}

export type ExerciceLimiteLogC = ExerciceLimiteLogC1 | ExerciceLimiteLogC2 | ExerciceLimiteLogC3;

// ============================================================================
// Famille D — Forme 1^∞, technique f^g=e^(g·ln f) (3 écrans : exposant, limite de l'exposant,
// conclure). f(x) = (cos(kx))^(c/x²), x→0.
// ============================================================================

export interface ExerciceLimiteLogD {
  famille: "D";
  k: 1 | 2 | 3;
  c: 1 | 2 | 3 | 4;
  /** = −c·k²/2 (vérifié par construction). */
  limiteExposant: number;
  /** = e^limiteExposant. */
  limiteFinale: number;
}

// ============================================================================
// Famille E — Cas avancé, instance UNIQUE codée en dur (3 écrans : développer, simplifier,
// conclure). f(x) = (3^x·sin(x)−ln(1+x)) / (x⁴+4x²), x→0. Limite = (2ln3+1)/8.
// ============================================================================

export interface ExerciceLimiteLogE {
  famille: "E";
  limiteFinale: number;
}

export type ExerciceLimiteLogarithmique = ExerciceLimiteLogA | ExerciceLimiteLogB | ExerciceLimiteLogC | ExerciceLimiteLogD | ExerciceLimiteLogE;

export type GenerateurExerciceLimiteLogarithmique = () => ExerciceLimiteLogarithmique;

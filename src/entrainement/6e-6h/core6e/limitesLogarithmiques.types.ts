/**
 * Couche core (6e) — contrat pour `6gen17` ("Calculer des limites, fonctions logarithmes",
 * chapitre 3). 4 familles A-D STRUCTURELLEMENT DISJOINTES (union discriminée), même principe que
 * `limitesExponentielles.types.ts` (6gen6, chapitre 2) : nombre d'écrans variable (2 pour A-C, 3
 * pour D) et forme
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
 * **Famille D — puissances f(x)^{g(x)} : formes 1^∞, 0^0, ∞^0** (rétablie à la demande de
 * l'utilisateur, qui LÈVE la décision K4 de l'audit du chapitre 3 de 6e : l'ancienne famille D
 * « forme 1^∞ » avait été retirée parce que la technique n'était enseignée dans aucun cours du
 * site ; la section « Calculer des limites » du cours (§ 5) l'enseigne désormais — sous-titre
 * « Puissances : les formes 1^∞, 0^0 et ∞^0 », méthode, deux exemples résolus, piège, formulaire).
 * Méthode unique : pour f > 0, f^g = e^{g·ln f} ; on calcule L = lim g·ln f (forme 0·∞ levée avec
 * les outils du cours : ln(1+u)/u → 1, croissances comparées, ln(e^u) = u), puis on conclut par
 * continuité de l'exponentielle (e^L si L fini, +∞ si L = +∞, 0 si L = −∞).
 * 7 sous-types STRUCTURELLEMENT disjoints (union sur `sousType`) répartis sur les 3 types de forme.
 * **Équilibre** (décision permanente) : le TYPE de forme et l'ISSUE (valeur finie ≠ 1, 1, +∞, 0)
 * sont tirés indépendamment et uniformément AVANT de choisir un sous-type compatible — chaque type
 * admet les 4 issues, l'issue ne se devine donc jamais au type ; dans les sous-types « comparaison
 * d'exposants » (d1, d2, d3, d5, d7) une même structure couvre toutes les issues, seul le calcul de
 * L tranche. Une issue n'est jamais un « cas particulier » (profil d'évaluation : `forme` = type de
 * forme indéterminée, jamais l'issue).
 *
 * **Famille E (développements limités) toujours retirée** (audit chapitre 3 de 6e, décision K4) :
 * technique enseignée dans aucun cours du site.
 *
 * **Valeur exacte affichée** : toute cible `valeur` porte sa forme LaTeX EXACTE (`latex`, ex.
 * `\frac{\ln 5}{2}`), construite par le générateur — jamais un flottant brut affiché à l'élève.
 */

export type FamilleLimiteLogarithmique = "A" | "B" | "C" | "D";

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

// ============================================================================
// Famille D — Puissances f(x)^{g(x)} (3 écrans : reconnaître la forme, limite de l'exposant
// g·ln f, conclure). 7 sous-types STRUCTURELLEMENT disjoints. Toute cible porte sa forme LaTeX
// exacte ; `limiteFinale` d'une issue finie ≠ 1 vaut e^L écrit exactement (`e^{-6}`, `e^{\frac{3}{2}}`).
// ============================================================================

/** Type de forme indéterminée d'une puissance. */
export type FormePuissance = "un_infini" | "zero_zero" | "infini_zero";
/** Choix proposés à l'écran 1 : les trois formes + « pas indéterminée » (distracteur qui vise le
 * réflexe « 1^∞ = 1 », jamais la bonne réponse : toutes les instances sont indéterminées). */
export type ChoixFormePuissance = FormePuissance | "determinee";
/** Issue de la limite (tirée AVANT le sous-type). */
export type IssuePuissance = "fini" | "un" | "plus_infini" | "zero";

interface ExerciceLimiteLogDCommun {
  famille: "D";
  forme: FormePuissance;
  issue: IssuePuissance;
  /** Limite de la base f(x) : 1 (valeur), 0 ou +∞. */
  limiteBase: CibleLimiteLog;
  /** Limite de l'exposant g(x) : ±∞ ou 0. */
  limiteExposant: CibleLimiteLog;
  /** L = lim g(x)·ln f(x) : valeur exacte non nulle, 0, +∞ ou −∞. */
  limiteProduit: CibleLimiteLog;
  /** lim f(x)^{g(x)} : e^L (valeur, LaTeX exact), 1, +∞ ou 0. */
  limiteFinale: CibleLimiteLog;
}

/** d1 — (1 + a/x^p)^{(b/d)·x^q}, x → ±∞. q = p : e^{ab/d} ; q < p : 1 ; q > p : +∞ ou 0 (signe de
 * ab). x → −∞ seulement pour (p, q) ∈ {(1,1), (2,2), (2,1)} (x^{q−p} y garde le même signe). */
export interface ExerciceLimiteLogD1 extends ExerciceLimiteLogDCommun {
  sousType: "d1";
  a: number;
  p: 1 | 2;
  q: 0.5 | 1 | 2 | 3;
  b: number;
  d: 1 | 2 | 3;
  direction: DirectionX;
}

/** d2 — ((x+b)/(x+c))^{k·x^q}, x → ±∞ (−∞ seulement pour q = 1). q = 1 : e^{k(b−c)} ; q = 1/2 : 1 ;
 * q = 2 (x → +∞) : +∞ ou 0 (signe de k(b−c)). */
export interface ExerciceLimiteLogD2 extends ExerciceLimiteLogDCommun {
  sousType: "d2";
  b: number;
  c: number;
  k: number;
  q: 0.5 | 1 | 2;
  direction: DirectionX;
}

/** d3 — (1 + a·x)^{c/x^q}, x → 0⁺ (ou 0⁻ pour q = 1). q = 1 : e^{ac} ; q = 1/2 : 1 ; q = 2 : +∞ ou 0
 * (signe de ac). */
export interface ExerciceLimiteLogD3 extends ExerciceLimiteLogDCommun {
  sousType: "d3";
  a: number;
  c: number;
  q: 0.5 | 1 | 2;
  cote: "droite" | "gauche";
}

/** d4 — x^{g(x)}, x → 0⁺ (forme 0^0) : g = a·x^q → 1 (croissance comparée x·ln x → 0), ou
 * g = a/ln x → e^a. */
export interface ExerciceLimiteLogD4 extends ExerciceLimiteLogDCommun {
  sousType: "d4";
  a: number;
  exposant: "puissance" | "surLn";
  q: 1 | 2;
}

/** d5 — (e^{−1/x^p})^{a·x^q}, x → 0⁺ (forme 0^0) : g·ln f = −a·x^{q−p} ; q > p : 1 ; q = p : e^{−a} ;
 * q < p : 0 (a > 0) ou +∞ (a < 0). */
export interface ExerciceLimiteLogD5 extends ExerciceLimiteLogDCommun {
  sousType: "d5";
  p: 1 | 2 | 3;
  q: 1 | 2 | 3;
  a: number;
}

/** d6 — x^{g(x)}, x → +∞ (forme ∞^0) : g = a/x^q → 1 (ln x / x^q → 0), ou g = a/ln x → e^a. */
export interface ExerciceLimiteLogD6 extends ExerciceLimiteLogDCommun {
  sousType: "d6";
  a: number;
  exposant: "puissance" | "surLn";
  q: 1 | 2;
}

/** d7 — (e^{x^p})^{a/x^q}, x → +∞ (forme ∞^0) : g·ln f = a·x^{p−q} ; p < q : 1 ; p = q : e^a ;
 * p > q : +∞ (a > 0) ou 0 (a < 0). */
export interface ExerciceLimiteLogD7 extends ExerciceLimiteLogDCommun {
  sousType: "d7";
  p: 1 | 2 | 3;
  q: 1 | 2 | 3;
  a: number;
}

export type ExerciceLimiteLogD = ExerciceLimiteLogD1 | ExerciceLimiteLogD2 | ExerciceLimiteLogD3 | ExerciceLimiteLogD4 | ExerciceLimiteLogD5 | ExerciceLimiteLogD6 | ExerciceLimiteLogD7;

export type ExerciceLimiteLogarithmique = ExerciceLimiteLogA | ExerciceLimiteLogB | ExerciceLimiteLogC | ExerciceLimiteLogD;

export type GenerateurExerciceLimiteLogarithmique = () => ExerciceLimiteLogarithmique;

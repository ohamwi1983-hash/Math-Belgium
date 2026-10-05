/**
 * Couche core (6e) — contrat pour `6gen6` ("Calcul de limites, fonctions exponentielles",
 * chapitre 2). Familles STRUCTURELLEMENT DISJOINTES (union discriminée) — nombre d'écrans
 * variable (2 ou 3) et forme de réponse variable par écran, même principe que `6gen3`
 * (`equationsCyclometriques.types.ts`) mais poussé plus loin : ici la plupart des écrans
 * demandent une réponse CATÉGORIELLE (+∞ / −∞ / 0 / valeur), jamais seulement une valeur libre.
 *
 * **Refonte (familles D/E/F retirées, H/I/J/K/L/N ajoutées)** : les anciennes familles D, E, F
 * reposaient sur la "reconnaissance d'une limite de référence" (`sin(x)/x→1`, `(aˣ−1)/x→ln(a)`),
 * remplacées par des familles basées sur la règle de L'Hôpital (H/I/J/K) — H/I/J une application,
 * K deux applications (degré plafonné à 2, jamais de boucle, nombre d'écrans FIXE comme partout
 * ailleurs sur la plateforme). Familles L et N : formes indéterminées exponentielles avancées
 * (`1^∞`, `∞^0`/`0^0`).
 *
 * **Base généralisée (H/I/J/K)** : `6gen7` (même chapitre, "Domaine et dérivée de fonctions
 * exponentielles") enseigne déjà `d/dx[a^x]=\ln(a)\cdot a^x` comme un simple fait à appliquer,
 * `\ln(a)` y étant manipulé comme un facteur numérique — pas besoin d'attendre le chapitre
 * "Fonctions logarithmes" (chapitre 3) pour l'utiliser ainsi. H/I/J/K tirent donc une base `a`
 * quelconque (entier 2 à 7, `tirerBaseExponentielle`), `\ln(a)` apparaissant comme facteur dans
 * les dérivées — jamais manipulé algébriquement (pas de loi des logarithmes, pas de résolution
 * d'équation logarithmique, ça reste hors-programme à ce stade). H/I/J/K supportent aussi une
 * inversion numérateur/dénominateur (`expAuNumerateur`/équivalent par famille) — la FI et le
 * nombre d'écrans restent inchangés, seule la position de l'expression dérivée depuis
 * l'exponentielle varie. L résout `1^∞` par changement de variable vers le pivot `(1+1/u)^u→e`
 * (continuité de la puissance, aucune dérivée donc aucun `\ln` nécessaire — approche volontairement
 * conservée telle quelle) ; N résout `∞^0`/`0^0` en choisissant une base déjà exponentielle
 * (également généralisée), de sorte que la loi des puissances `(a^m)^n=a^(mn)` dissolve la FI sans
 * aucune dérivée, donc sans `\ln` non plus.
 *
 * **Diagnostic de forme partagé (H/I/J/K)** : chaque famille L'Hôpital a un premier écran où
 * l'élève classe la forme (`CategorieFI`) avant de dériver quoi que ce soit — piège classique
 * visé : appliquer la règle sans vérifier qu'on est bien face à 0/0 ou ∞/∞.
 *
 * **Décision de conception — statut de limite étendu (`CibleLimite`)** : la spec réutilise et
 * étend le mécanisme de statut "n'existe pas" déjà en place ailleurs sur la plateforme (5gen4,
 * `EtapeSommeInfinie`/`EtapeArgumentResoudre`, bascule catégorielle + champ conditionnel) plutôt
 * que d'inventer un système de statut parallèle. `CibleLimite` généralise ce principe à 4 valeurs
 * possibles (`plus_infini`/`moins_infini`/`zero`/`valeur`) — un seul type, réutilisé pour TOUTE
 * limite catégorielle du générateur (exposant, terme isolé, limite globale), plutôt qu'un type
 * dédié par écran. Chaque écran n'expose, côté présentation, que le SOUS-ENSEMBLE de boutons
 * pertinent pour sa question (voir `ui6e/formatLimitesExponentielles.ts::OPTIONS_ECRAN`) — mais
 * le contrat lui-même reste générique, un seul type pour les 7 familles.
 */

export type FamilleLimiteExponentielle = "A" | "B" | "C" | "G" | "H" | "I" | "J" | "K" | "L" | "N";

/** Classification partagée par H/I/J/K (écran de diagnostic AVANT toute dérivation) — jamais
 * "l'autre" ou une 4e valeur : les 3 cas couvrent exhaustivement ce qu'une limite de quotient peut
 * présenter à ce niveau. */
export type CategorieFI = "zero_sur_zero" | "infini_sur_infini" | "pas_une_fi";

/** Cible catégorielle ou valeur exacte — voir la note de conception ci-dessus. */
export type CibleLimite = { type: "plus_infini" } | { type: "moins_infini" } | { type: "zero" } | { type: "valeur"; valeur: number };

export type DirectionX = "plus_infini" | "moins_infini";
export type DirectionZero = "zero_plus" | "zero_moins";

// ============================================================================
// Famille A — Limite directe (2 écrans : exposant, globale). 2 sous-cas STRUCTURELLEMENT
// disjoints (union sur `sousCas`) : "puissance" (k^g(x), x→±∞) et "fraction" (e^(N(x)/x^s),
// x→0±, base toujours e — jamais un k tiré, contrairement au sous-cas "puissance").
// ============================================================================

/** Sous-cas 1 — f(x) = k^g(x), g(x) affine (m·x+n) ou carré signé (±x²). */
export interface ExerciceLimiteAPuissance {
  famille: "A";
  sousCas: "puissance";
  base: number;
  baseSuperieureA1: boolean;
  direction: DirectionX;
  /** Non-null ssi g(x) est affine (m·x+n) ; mutuellement exclusif avec `gCarreSigne`. */
  gAffine: { m: number; n: number } | null;
  /** Non-null ssi g(x) = signe·x² ; mutuellement exclusif avec `gAffine`. */
  gCarreSigne: 1 | -1 | null;
  limiteExposant: CibleLimite;
  limiteGlobale: CibleLimite;
}

/** Sous-cas 2 — f(x) = e^(N(x)/x^s), N(x)=a·x+b (b≠0), x→0±. */
export interface ExerciceLimiteAFraction {
  famille: "A";
  sousCas: "fraction";
  directionZero: DirectionZero;
  s: 1 | 2 | 3;
  a: number;
  b: number;
  limiteExposant: CibleLimite;
  limiteGlobale: CibleLimite;
}

export type ExerciceLimiteA = ExerciceLimiteAPuissance | ExerciceLimiteAFraction;

// ============================================================================
// Famille B — Somme, terme exponentiel dominant (3 écrans : exponentielle, polynomiale, globale).
// f(x) = k^(x²+p) + q·x^d + r, x→±∞.
// ============================================================================

export interface ExerciceLimiteB {
  famille: "B";
  base: number;
  baseSuperieureA1: boolean;
  direction: DirectionX;
  p: number;
  q: number;
  d: 1 | 3;
  r: number;
  limiteExponentielle: CibleLimite;
  limitePolynomiale: CibleLimite;
  limiteGlobale: CibleLimite;
}

// ============================================================================
// Famille C — Produit, FI ∞·0 (2 écrans : facteurs, globale). f(x) = x^r·e^(−x^s), x→+∞.
// La limite globale est TOUJOURS 0 (dominance de l'exponentielle) — champ NUMÉRIQUE simple sur
// l'écran "globale" (spec : "Champ : valeur (0)"), jamais catégoriel.
// ============================================================================

export interface ExerciceLimiteC {
  famille: "C";
  r: 1 | 2;
  s: 2 | 3;
  limiteFacteur1: CibleLimite;
  limiteFacteur2: CibleLimite;
  limiteGlobale: number;
}

// ============================================================================
// Famille G — ∞−∞ avancée, développement à l'ordre 2 (3 écrans : combiner, ordre1, conclure).
// INSTANCE UNIQUE codée en dur (voir en-tête du générateur, `generateurs6e/limitesExponentielles/
// familles/G.ts`, pour la justification — non généralisable sans un calcul de vérification
// explicite pour d'autres coefficients). f(x) = 1/cos(x) + 1/(1−e^(π/2−x)), x→π/2. Limite = 1/2.
//
// **Décision de conception — écran 2 ("ordre 1 insuffisant"), laissé ouvert par la spec** : QCM
// booléen "L'ordre 1 suffit-il à conclure ? Oui / Non", réponse TOUJOURS "Non" pour cette instance
// (les termes dominants s'annulent à l'ordre 1, cf. développement limité en u=π/2−x : cos(x)≈u,
// 1−e^u≈−u, la substitution directe donne une forme 0/0 non résolue). Choix retenu plutôt qu'un
// champ de texte libre : la question posée par la spec ("un développement à l'ordre 1 suffit-il ?")
// est un CONSTAT catégoriel, pas un calcul — un QCM à 2 boutons est la forme la plus honnête et la
// plus simple à vérifier, cohérent avec le principe "champ texte libre réservé aux calculs/
// expressions" déjà en place sur le reste du générateur.
// ============================================================================

export interface ExerciceLimiteG {
  famille: "G";
  limiteFinale: number;
}

// ============================================================================
// Famille H — L'Hôpital, 0/0 pur exponentiel, une application (4 écrans : forme, numérateur,
// dénominateur, conclure). Base `a` quelconque (voir en-tête). Point de limite `x0` quelconque
// (entier -3 à 3, y compris 0) — par substitution u=x-x0, la limite elle-même est INCHANGÉE par
// rapport au cas x0=0 (translation pure, aucune dérivée n'en dépend) ; seul l'énoncé affiché
// (x-x0 remplace x) et le point de substitution changent. `expAuNumerateur` choisit
// l'orientation :
//   - true  : f(x) = (a^(k(x-x0)) − 1) / (m(x-x0)) → limite = k·ln(a)/m.
//   - false : f(x) = (m(x-x0)) / (a^(k(x-x0)) − 1) → limite = m/(k·ln(a)).
// ============================================================================

export interface ExerciceLimiteH {
  famille: "H";
  base: number;
  k: number;
  m: number;
  x0: number;
  expAuNumerateur: boolean;
  limiteFinale: number;
}

// ============================================================================
// Famille I — L'Hôpital, 0/0 mixte trigonométrique (4 écrans : forme, numérateur, dénominateur,
// conclure). Base `a` quelconque, point de limite `x0` quelconque (entier -3 à 3, y compris 0 —
// translation pure, limite INCHANGÉE par rapport à x0=0). `sinAuNumerateur` choisit l'orientation :
//   - true  : f(x) = sin(k(x-x0)) / (a^(m(x-x0)) − 1) → limite = k/(m·ln(a)).
//   - false : f(x) = (a^(m(x-x0)) − 1) / sin(k(x-x0)) → limite = m·ln(a)/k.
// ============================================================================

export interface ExerciceLimiteI {
  famille: "I";
  base: number;
  k: number;
  m: number;
  x0: number;
  sinAuNumerateur: boolean;
  limiteFinale: number;
}

// ============================================================================
// Famille J — L'Hôpital, 0/0 mixte arcfonction (4 écrans : forme, numérateur, dénominateur,
// conclure). `arcFn` choisit arctan OU arcsin (jamais arccos : arccos(0)=π/2≠0, casserait la FI
// 0/0). `arcAuNumerateur` choisit l'orientation, base `a` quelconque, point de limite `x0`
// quelconque (entier -3 à 3, translation pure, limite INCHANGÉE par rapport à x0=0) :
//   - true  : f(x) = arcFn(k(x-x0)) / (a^(m(x-x0)) − 1) → limite = k/(m·ln(a)) (les deux
//     arcfonctions ont une dérivée en 0 valant k·1).
//   - false : f(x) = (a^(m(x-x0)) − 1) / arcFn(k(x-x0)) → limite = m·ln(a)/k.
// ============================================================================

export interface ExerciceLimiteJ {
  famille: "J";
  base: number;
  k: number;
  m: number;
  x0: number;
  arcFn: "arctan" | "arcsin";
  arcAuNumerateur: boolean;
  limiteFinale: number;
}

// ============================================================================
// Famille K — L'Hôpital, DEUX applications successives (6 écrans : forme, numérateur1,
// dénominateur1, numérateur2, dénominateur2, conclure). Base `a` quelconque, dénominateur TOUJOURS
// m·(x-x0)² (jamais ax²+bx+c : un terme en x briserait l'invariant "toujours 2 applications", voir
// discussion). Point de limite `x0` quelconque (entier -3 à 3, translation pure, limite INCHANGÉE
// par rapport à x0=0) :
// N(x)=a^(k(x-x0))−1−k(x-x0)·ln(a), D(x)=m·(x-x0)² ⟹ N(x0)=D(x0)=0 (FI 0/0).
// N'(x)=k·ln(a)·(a^(k(x-x0))−1), D'(x)=2m(x-x0) ⟹ les deux s'annulent encore en x0 (FI 0/0
// PERSISTE, d'où la 2e application).
// N''(x)=k²·ln(a)²·a^(k(x-x0)), D''(x)=2m ⟹ limite = N''(x0)/D''(x0) = k²·ln(a)²/(2m).
// `expAuNumerateur` choisit l'orientation (N(x) au numérateur ou au dénominateur) — limite
// inversée (2m/(k²·ln(a)²)) si `false`.
// ============================================================================

export interface ExerciceLimiteK {
  famille: "K";
  base: number;
  k: number;
  m: number;
  x0: number;
  expAuNumerateur: boolean;
  limiteFinale: number;
}

// ============================================================================
// Famille L — FI `1^∞` via changement de variable vers le pivot `(1+1/u)^u → e` (2 écrans :
// reformuler, conclure). 2 sous-types STRUCTURELLEMENT disjoints. Résolu uniquement par
// substitution + continuité de la puissance, jamais par passage au log (le résultat reste e^(km),
// jamais un logarithme à calculer).
// ============================================================================

/** L1 — f(x) = (1+k/x)^(mx), x→+∞. Substitution u=x/k (x=ku) : f = (1+1/u)^(kmu) =
 * [(1+1/u)^u]^(km) → e^(km). */
export interface ExerciceLimiteL1 {
  famille: "L";
  sousType: "L1";
  k: number;
  m: number;
  limiteFinale: number;
}

/** L2 — f(x) = (1+kx)^(m/x), x→0. Substitution t=kx (x→0 ⟹ t→0) : f = (1+t)^(km/t) =
 * [(1+t)^(1/t)]^(km) → e^(km). */
export interface ExerciceLimiteL2 {
  famille: "L";
  sousType: "L2";
  k: number;
  m: number;
  limiteFinale: number;
}

export type ExerciceLimiteL = ExerciceLimiteL1 | ExerciceLimiteL2;

// ============================================================================
// Famille N — FI `∞^0`/`0^0` via loi des puissances sur une base déjà exponentielle (2 écrans :
// combiner, conclure). f(x) = (base^(k/x))^(mx+x²), x→0, base quelconque (entier 2 à 7). PAS une
// vraie FI une fois réécrite : loi des puissances (a^p)^q=a^(pq) ⟹
// f(x) = base^((k/x)(mx+x²)) = base^(km+kx) → base^(km) (simple substitution — AUCUNE dérivée
// n'intervient dans cette famille, donc aucun logarithme n'est nécessaire, contrairement à
// H/I/J/K qui dérivent et font apparaître ln(base)). Le signe de k détermine si la base
// base^(k/x) diverge vers +∞ ou 0 en x→0⁺ (type ∞^0 ou 0^0 selon le tirage, sans avoir besoin de
// 2 familles séparées).
// ============================================================================

export interface ExerciceLimiteN {
  famille: "N";
  base: number;
  k: number;
  m: number;
  limiteFinale: number;
}

export type ExerciceLimiteExponentielle =
  | ExerciceLimiteA
  | ExerciceLimiteB
  | ExerciceLimiteC
  | ExerciceLimiteG
  | ExerciceLimiteH
  | ExerciceLimiteI
  | ExerciceLimiteJ
  | ExerciceLimiteK
  | ExerciceLimiteL
  | ExerciceLimiteN;

export type GenerateurExerciceLimiteExponentielle = () => ExerciceLimiteExponentielle;

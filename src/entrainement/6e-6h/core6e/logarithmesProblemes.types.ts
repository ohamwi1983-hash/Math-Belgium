/**
 * Couche core (6e) — contrat pour `6gen22` ("Logarithmes : problèmes", chapitre 3 "Fonctions
 * logarithmes"). 7 familles STRUCTURELLEMENT DISJOINTES (union discriminée par `famille`, jamais
 * un seul type à champs `| null` partagés) — même principe que `exponentiellesProblemes.types.ts`
 * (6gen12) —, chacune tirée de façon ÉQUIPROBABLE (voir `generateurs6e/logarithmesProblemes/index.ts`).
 *
 * **Convention arrondie** (héritée de 6gen12/6gen13-16, voir CLAUDE.md) : toute valeur GÉNÉRÉE
 * comme DONNÉE D'ÉNONCÉ (Q0, p, n, cible, x0...) est choisie DIRECTEMENT comme un nombre "propre"
 * et sert TELLE QUELLE de référence exacte (rien à arrondir, elle est déjà l'unique valeur montrée
 * à l'élève). Seule une valeur CALCULÉE en interne puis RÉ-AFFICHÉE à un écran ultérieur (ex.
 * `cible1Affiche` en famille A "fenêtre", `v2Affiche` en famille B) porte le suffixe `Affiche` — la
 * valeur exacte sous-jacente (non arrondie) reste la référence de correction, ET tout calcul EN
 * AVAL de cette valeur affichée est recalculé DEPUIS la valeur affichée (jamais depuis un flottant
 * interne invisible à l'élève) — voir `generateurs6e/logarithmesProblemes/familles/*.ts` pour le
 * détail par famille.
 *
 * **Chaque famille référence un `contexteId`** (sauf famille D, familles E/G ont un contexte fixe
 * par construction) — résolu côté `ui6e/formatLogarithmesProblemes.ts` via les bassins de
 * `generateurs6e/logarithmesProblemes/contextes.ts` (jamais stocké en dur ici).
 *
 * **Portée** (spec 6gen22) : l'exercice "régression linéaire sur données linéarisées" (38 du
 * document source) est explicitement exclu — infrastructure de régression différente (5gen36-38).
 */

// ============================================================================
// Famille A — Croissance/décroissance, résoudre pour t ou pour le taux (3 écrans, 3 sous-types).
// ============================================================================

/** Sous-type "résoudre pour t" — `Q0·r^t` compare à une cible ; `t` s'obtient par logarithme.
 * `variante` "fenêtre" ajoute un second seuil (2 réponses à l'écran 3, jamais add-as-needed — le
 * nombre de seuils est toujours exactement 2, voir en-tête du prompt/`docs/historique-6e.md`). */
export interface ExerciceLogProbA_ResoudreT {
  famille: "A";
  sousType: "resoudreT";
  variante: "simple" | "fenetre";
  contexteId: string;
  Q0: number;
  p: number;
  croissance: boolean;
  /** `1+p/100` si croissance, `1-p/100` sinon. */
  r: number;
  /** Sens de la comparaison, déterminé par `croissance` ("dépasser" pour une hausse, "tomber sous"
   * pour une baisse) — jamais tiré indépendamment. */
  sens: ">=" | "<=";
  /** Seuil AFFICHÉ (seule valeur montrée à l'élève) — construit en amont depuis un temps "propre"
   * puis arrondi, voir `familles/A.ts`. */
  cible1Affiche: number;
  /** Temps EXACT (continu) solution de `Q0·r^t=cible1Affiche`. */
  t1Exact: number;
  /** Réponse RÉELLEMENT attendue à l'écran 3 — nombre ENTIER de périodes, arrondi AU-DESSUS
   * (spec : "combien de temps faut-il pour dépasser/tomber sous" appelle un compte de périodes
   * entières, jamais une valeur continue). */
  t1Reponse: number;
  /** Second seuil — présent uniquement si `variante==="fenetre"` (toujours généré, même si non
   * utilisé côté "simple", pour éviter un champ optionnel `| undefined` côté type). */
  cible2Affiche: number;
  t2Exact: number;
  t2Reponse: number;
}

/** Sous-type "résoudre pour le taux" — l'inconnue est la BASE `(1+i)`, pas l'exposant : la
 * résolution passe par une racine n-ième, jamais un logarithme (contraste explicite dans les
 * aides). */
export interface ExerciceLogProbA_ResoudreTaux {
  famille: "A";
  sousType: "resoudreTaux";
  contexteId: string;
  Q0: number;
  n: number;
  cibleAffiche: number;
  /** `(cibleAffiche/Q0)^(1/n) - 1`, valeur EXACTE — réponse de l'écran 3. */
  i: number;
}

/** Sous-type "taux depuis un point de décroissance" — `Q0·e^(-kh)=fraction·Q0`, `k` isolé via
 * `ln`. */
export interface ExerciceLogProbA_TauxDecroissance {
  famille: "A";
  sousType: "tauxDecroissance";
  contexteId: string;
  Q0: number;
  /** Fraction restante après `h` (ex. 0,75 pour une baisse de 25 %) — donnée DIRECTEMENT. */
  fraction: number;
  h: number;
  /** `-ln(fraction)/h`, valeur EXACTE — réponse de l'écran 3. */
  k: number;
}

export type ExerciceLogProbA = ExerciceLogProbA_ResoudreT | ExerciceLogProbA_ResoudreTaux | ExerciceLogProbA_TauxDecroissance;

// ============================================================================
// Famille B — Modèle à 2 points, extrapolation à un multiple donné (4 écrans).
// ============================================================================

export interface ExerciceLogProbB {
  famille: "B";
  contexteId: string;
  t1: number;
  t2: number;
  v1: number;
  /** Taux EXACT choisi à la génération ("génération par construction") — réponse de l'écran 1. */
  r: number;
  /** v1·r^(t2-t1), valeur EXACTE. */
  v2: number;
  /** v2 arrondi — seule valeur d'AFFICHAGE dans l'énoncé. */
  v2Affiche: number;
  /** v1/r^t1, valeur EXACTE — réponse de l'écran 2. */
  Q0: number;
  /** Temps de référence pour l'évaluation de l'écran 3. */
  tRef: number;
  /** Q0·r^tRef, valeur EXACTE — réponse de l'écran 3. */
  valeurRef: number;
  /** Multiple demandé à l'écran 4 (ex. 4 pour "quadruplé"). */
  k: number;
  /** t tel que Q0·r^t=k·valeurRef, valeur EXACTE (=tRef+log_r(k)) — réponse de l'écran 4. */
  tCible: number;
}

// ============================================================================
// Famille C — Radioactivité, demi-vie (3 écrans).
// ============================================================================

export type SensDemiVieC = "versT" | "versLambda";

export interface ExerciceLogProbC {
  famille: "C";
  contexteId: string;
  sens: SensDemiVieC;
  /** Donné DIRECTEMENT si `sens==="versT"` (l'écran 1 déduit T), sinon DÉRIVÉ de `T` (voir
   * `familles/C.ts`) — dans les deux cas, valeur EXACTE utilisée par l'écran 2. */
  lambda: number;
  /** Donné DIRECTEMENT si `sens==="versLambda"`, sinon DÉRIVÉ de `lambda` — valeur EXACTE. */
  T: number;
  /** Fraction restante ciblée à l'écran 2 (ex. 0,05 pour 5 %). */
  fractionEcran2: number;
  /** t tel que N(t)/N0=fractionEcran2, valeur EXACTE (=-T·ln(fractionEcran2)/ln2) — réponse de
   * l'écran 2. */
  tEcran2: number;
  /** Écran 3 — variante "facteur correctif", INDÉPENDANTE de `T`/`lambda` ci-dessus. */
  T1: number;
  T2: number;
  /** T2/T1, valeur EXACTE — réponse de l'écran 3. */
  facteurCorrectif: number;
}

// ============================================================================
// Famille D — Asymptote non nulle, valeur donnée directement (2 écrans, allégé vs 6gen14).
// ============================================================================

/** `k` reste SYMBOLIQUE (jamais généré numériquement, pas assez de données pour le déterminer —
 * spec explicite) : ce type n'a donc AUCUN champ `k`. */
export interface ExerciceLogProbD {
  famille: "D";
  contexteId: string;
  /** Ta < T0 (cohérent avec un refroidissement). */
  Ta: number;
  T0: number;
}

// ============================================================================
// Famille E — Échelle logarithmique généralisée (pH, décibels, Richter) (4 écrans, la plus riche).
// ============================================================================

export type ContexteE = "pH" | "decibels" | "magnitude";
export type SensEcran2E = "versL" | "versX";
export type SensEcran3E = "versDeltaL" | "versFacteur";

export interface ExerciceLogProbE {
  famille: "E";
  contexteE: ContexteE;
  /** `L = a·log10(X) + b` — valeurs EXACTES, propres à `contexteE` (voir `familles/E.ts`). */
  a: number;
  b: number;
  /** Écran 1 présent UNIQUEMENT si `true` — sinon sauté pour cette instance (spec explicite,
   * "sauf si a,b déjà fournis dans l'énoncé"). `X1/L1/X2/L2` restent toujours renseignés (même si
   * non utilisés) pour ne jamais introduire de champ `| null` — cohérents avec `a`/`b` dans tous
   * les cas (voir `familles/E.ts`). */
  deduireAB: boolean;
  X1: number;
  L1: number;
  X2: number;
  L2: number;
  // Écran 2 — évaluer L depuis X, ou X depuis L (sens tiré).
  sensEcran2: SensEcran2E;
  /** Donné si `sensEcran2==="versL"` (sinon calculé, non montré). */
  X0: number;
  /** Donné si `sensEcran2==="versX"` (sinon calculé, non montré). */
  L0Affiche: number;
  /** Réponse EXACTE attendue à l'écran 2 (L si `versL`, X si `versX`). */
  reponseEcran2: number;
  // Écran 3 — propriété d'échelle (facteur multiplicatif k sur X ⟺ ΔL=a·log10(k)).
  sensEcran3: SensEcran3E;
  /** Donné si `sensEcran3==="versDeltaL"` (trouver ΔL depuis k). */
  kEcran3: number;
  /** Donné si `sensEcran3==="versFacteur"` (trouver k depuis ΔL). */
  deltaLDonnee: number;
  /** Réponse EXACTE attendue à l'écran 3 (ΔL ou k selon le sens). */
  reponseEcran3: number;
  // Écran 4 — piège de non-additivité : combiner L1e4, L2e4 (jamais additionner directement).
  L1e4: number;
  L2e4: number;
  /** X reconvertis depuis L1e4/L2e4 — valeurs EXACTES, utilisées par l'aide niveau 2. */
  X1e4: number;
  X2e4: number;
  /** a·log10(X1e4+X2e4)+b, valeur EXACTE — réponse de l'écran 4. */
  Ltotal: number;
}

// ============================================================================
// Famille F — Courbe logistique généralisée (3 écrans).
// ============================================================================

export interface ExerciceLogProbF {
  famille: "F";
  contexteId: string;
  k: number;
  r: number;
  /** y(0), donné DIRECTEMENT (déjà une valeur "propre" choisie à la génération). */
  y0: number;
  /** k/y0 - 1, valeur EXACTE — réponse de l'écran 1. */
  a: number;
  /** ln(a)/r, valeur EXACTE — réponse de l'écran 2 (temps de croissance maximale). */
  t: number;
}

// ============================================================================
// Famille G — Équilibre offre/demande, changement de variable (4 écrans).
// ============================================================================

export type SensEcran4G = "offre" | "demande";

export interface ExerciceLogProbG {
  famille: "G";
  A: number;
  B: number;
  m: number;
  x0: number;
  /** A·(e^(m·x0)-1), valeur EXACTE — 1ʳᵉ réponse de l'écran 1. */
  oX0: number;
  /** B/(e^(m·x0)+1), valeur EXACTE — 2ᵉ réponse de l'écran 1. */
  dX0: number;
  /** sqrt((A+B)/A), valeur EXACTE — racine positive de l'équation en u de l'écran 2. */
  uEquilibre: number;
  /** ln(uEquilibre)/m, valeur EXACTE — réponse de l'écran 3 (prix d'équilibre). */
  xEquilibre: number;
  sensEcran4: SensEcran4G;
  cibleEcran4: number;
  /** Solution EXACTE de o(x)=cibleEcran4 ou d(x)=cibleEcran4 selon `sensEcran4` — réponse de
   * l'écran 4. */
  xEcran4: number;
}

export type ExerciceLogarithmesProblemes = ExerciceLogProbA | ExerciceLogProbB | ExerciceLogProbC | ExerciceLogProbD | ExerciceLogProbE | ExerciceLogProbF | ExerciceLogProbG;

export type FamilleLogarithmesProblemes = ExerciceLogarithmesProblemes["famille"];

export type GenerateurExerciceLogarithmesProblemes = () => ExerciceLogarithmesProblemes;

// Contrat core — 5gen17 "Problèmes classiques sur les suites". 7 scénarios historiques ou
// géométriques, chacun reconnaissable (échiquier, papyrus de Rhind, Fibonacci…) mais dont les
// NOMBRES varient d'un tirage à l'autre (audit 5e ch. 3, décision B : une instance fixe se retenait
// par cœur). Chaque `construireXxx()` (Couche A) tire un petit noyau de données de départ puis DÉRIVE
// toutes les autres valeurs par formule, jamais recopiées — ce qui permet un recalcul indépendant
// en test.

export interface ExerciceEchiquier {
  scenario: "echiquier";
  u1: number; // 1 grain sur la 1re case (légende)
  q: number; // 2 — on double à chaque case
  /** Case dont on demande le nombre de grains (tirée entre 20 et 64). */
  caseDemandee: number;
  // `bigint`, pas `number` : 2⁶³ et 2⁶⁴−1 dépassent `Number.MAX_SAFE_INTEGER` — un `number` perdrait
  // les derniers chiffres. Affiché via `.toString()`, converti en `Number` UNIQUEMENT au point de
  // comparaison à tolérance relative (`moteur5e/verificationSuiteClassique.ts`).
  uCase: bigint;
  sommeTotale: bigint; // S₆₄ = 2⁶⁴ − 1
  poidsGrainGrammes: number; // 0,04 / 0,05 / 0,06 g
  poidsTotalTonnes: number;
  productionMondialeTonnes: number; // donnée de l'énoncé
  facteurComparaison: number;
}

export interface ExercicePapyrusRhind {
  scenario: "papyrusRhind";
  /** Nombre de pains à partager entre 5 personnes (100 dans le papyrus). */
  sommeTotale: number;
  /** Règle du partage : la somme des 3 plus grandes parts vaut `facteur` fois celle des 2 plus
   * petites (7 dans le papyrus : « le septième des 3 plus grandes = les 2 plus petites »). */
  facteur: number;
  a: number; // plus petite part
  delta: number; // raison
  termes: [number, number, number, number, number];
}

/** y, x, z avec x moyenne géométrique de y et z (x² = yz), et m, y, z suite arithmétique (y = m + r,
 * z = m + 2r) ; la donnée est le produit des TROIS nombres x·y·z = P. Comme x² = yz, x·y·z = x³ = P,
 * d'où x = ∛P. Les tirages prennent m = x (le premier terme de la suite arithmétique est égal à x —
 * c'est le cas historique 6, x = 6, P = 216) : (x + r)(x + 2r) = x² ⟺ 2r² + 3xr = 0 ⟺ r = 0 (suite
 * constante, rejetée) ou r = −3x/2. */
export interface ExerciceSuitesCombinees {
  scenario: "suitesCombinees";
  produitXYZ: number; // P = x³
  premierTerme: number; // m (= x)
  x: number;
  r: number; // −3x/2
  arithmetique: [number, number, number]; // m, y, z
  geometrique: [number, number, number]; // y, x, z
}

/** « À toute allure » : un mobile qui démarre parcourt, pendant chaque seconde, une distance en
 * progression arithmétique (u₁ mètres pendant la 1re seconde, puis r mètres de plus chaque
 * seconde). Les vitesses demandées sont des vitesses MOYENNES calculées avec les outils du chapitre
 * (terme et somme) — plus de vitesse instantanée par dérivée (audit, décision D : les dérivées
 * arrivent au chapitre 5). */
export interface ExerciceVitesse {
  scenario: "vitesse";
  u1: number;
  r: number;
  /** Durée totale (en secondes) — la question porte sur la n-ième seconde et les n premières. */
  n: number;
  distanceN: number; // uₙ (m)
  sommeTotaleN: number; // Sₙ (m)
  vitesseMoyenneTotaleKmH: number; // Sₙ / n × 3,6
  vitesseDerniereSecondeKmH: number; // uₙ × 3,6
}

/** La suite de Fibonacci (u₁ = u₂ = 1) ou une suite « de type Fibonacci » (mêmes règle, autres
 * premiers termes, ex. Lucas 2, 1) : dans tous les cas le rapport de deux termes consécutifs tend
 * vers le nombre d'or φ. */
export interface ExerciceFibonacci {
  scenario: "fibonacci";
  /** true : la vraie suite de Fibonacci (1, 1) ; false : une suite de type Fibonacci. */
  historique: boolean;
  dixPremiersTermes: number[];
  /** Rang k du rapport demandé vₖ = uₖ₊₁ / uₖ. */
  rangRapport: number;
  vk: number;
  phi: number; // racine positive de x² = x + 1
}

/** Zigzag dans un triangle équilatéral ABC de côté c (reconstruit, audit 5e ch. 3 décision C).
 * Depuis B, on trace la perpendiculaire à [CA] (pied H₁), puis depuis H₁ la perpendiculaire à [CB]
 * (pied H₂), puis depuis H₂ la perpendiculaire à [CA] (H₃)… Le chemin B → H₁ → H₂ → … est le
 * zigzag ; il se rapproche de C.
 *
 * Modèle (angle en C = 60°) : chaque segment Hₖ₋₁Hₖ (H₀ = B) est un côté de l'angle droit du
 * triangle rectangle Tₖ = C Hₖ₋₁ Hₖ, d'hypoténuse CHₖ₋₁ ; CHₖ = CHₖ₋₁·cos 60° = CHₖ₋₁/2. Donc
 * - longueurs : ℓₖ = CHₖ₋₁·sin 60°, ℓ₁ = c√3/2, raison 1/2 → longueur totale limite 2ℓ₁ = c√3 ;
 * - aires des triangles emboîtés Tₖ (T₁ ⊃ T₂ ⊃ …) : A₁ = c²√3/8, raison 1/4 (aire ∝ carré des
 *   longueurs) ;
 * - petits triangles du zigzag Uₖ = Hₖ₋₁HₖHₖ₊₁ = Tₖ privé de Tₖ₊₁ : aire 3Aₖ/4, raison 1/4 ; ils
 *   pavent exactement T₁, donc leur somme infinie vaut A₁ (vérification cohérente du modèle). */
export interface ExerciceTrianglesZigzag {
  scenario: "trianglesZigzag";
  cote: number; // c (cm)
  longueurs: [number, number, number, number]; // ℓ₁…ℓ₄
  longueurLimite: number; // c√3
  airesT: [number, number, number]; // A₁…A₃
  aireU1: number; // aire de U₁ = 3A₁/4
  sommeAiresU: number; // = A₁
}

export interface ExerciceCarresEmboites {
  scenario: "carresEmboites";
  // Partie a — un carré d'aire 1 partagé en `partsA` petits carrés égaux ; on en colorie
  // `coloreesA`, puis on recommence dans un petit carré non colorié, à l'infini. Fraction colorée :
  // u₁ = c/p, raison 1/p, somme infinie c/(p − 1).
  partsA: number; // 4 ou 9
  coloreesA: number;
  u1A: number;
  qA: number;
  sommeInfinieA: number;
  // Partie b — carrés emboîtés en joignant les milieux des côtés : côté a, aires a², a²/2, a²/4…
  // (raison 1/2), somme infinie 2a².
  qB: number;
  coteB: number;
  airesB: [number, number, number];
  sommeInfinieB: number;
}

export type ScenarioSuiteClassique = "echiquier" | "papyrusRhind" | "suitesCombinees" | "vitesse" | "fibonacci" | "trianglesZigzag" | "carresEmboites";

export type ExerciceSuiteClassique =
  | ExerciceEchiquier
  | ExercicePapyrusRhind
  | ExerciceSuitesCombinees
  | ExerciceVitesse
  | ExerciceFibonacci
  | ExerciceTrianglesZigzag
  | ExerciceCarresEmboites;

export type GenerateurExerciceSuiteClassique = () => ExerciceSuiteClassique;

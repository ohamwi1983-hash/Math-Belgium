/**
 * Couche core (6e) — contrat pour `6gen43` ("Dénombrement fondamental et arrangements"),
 * générateur D'OUVERTURE du chapitre "Analyse combinatoire" (aucun numéro de chapitre fixe encore
 * attribué — voir `docs/historique-6e.md`). 5 familles (A à E), tirage ÉQUIPROBABLE de la famille
 * PUIS d'un sous-type dans la famille — voir `generateurs6e/denombrementFondamental/index.ts`.
 *
 * **Convention transversale à ce contrat** : chaque variante porte déjà, PRÉ-CALCULÉES par la
 * Couche A (jamais recalculées côté Couche B — `moteur6e/` n'importe jamais `generateurs6e/`, voir
 * CLAUDE.md), toutes les valeurs numériques correctes attendues à chaque écran, dans l'ORDRE
 * d'affichage des champs (voir en-tête de chaque interface pour le détail écran par écran). La
 * Couche B (`moteur6e/verificationDenombrementFondamental.ts`) se contente de comparer,
 * position par position, la saisie élève à ces valeurs — jamais de logique de dénombrement dans
 * `moteur6e/`.
 */

// ============================================================================
// Famille A — Principe des cases juxtaposées (nombres à n chiffres tous différents, n∈{4,5},
// premier chiffre non nul). 6 sous-types, 2 ou 3 écrans selon le sous-type.
// ============================================================================

/** Sous-type "total" (2 écrans) : compter tous les nombres valides.
 * Écran 1 → `[choixPosition1]`. Écran 2 → `[...choixPositionsRestantes, total]`. */
export interface ExerciceDenombA_Total {
  famille: "A";
  sousType: "total";
  n: number;
  choixPosition1: number;
  choixPositionsRestantes: number[];
  total: number;
}

/** Sous-type "position(s) fixée(s)" (2 écrans) : `variante="dernier"` → le dernier chiffre est fixé
 * à une valeur NON NULLE donnée (le premier chiffre reste à déterminer séparément) ; `variante=
 * "premiers"` → les `k`∈{1,2} premiers chiffres sont fixés (premier chiffre inclus, donc déjà
 * automatiquement non nul par construction). Écran 1 → `[...choixPositionsFixees, ?choixPosition1]`
 * (le dernier terme n'existe que si `variante="dernier"`, càd `choixPosition1!==null`). Écran 2 →
 * `[...choixPositionsRestantes, total]`. */
export interface ExerciceDenombA_PositionFixee {
  famille: "A";
  sousType: "positionFixee";
  variante: "dernier" | "premiers";
  n: number;
  chiffresFixes: { position: number; valeur: number }[];
  choixPositionsFixees: number[];
  choixPosition1: number | null;
  choixPositionsRestantes: number[];
  total: number;
}

/** Sous-type "contient un chiffre donné" (3 écrans) — technique du complément : `total` (T, valeur
 * connue/affichée en données, PAS redemandée) moins le compte "ne contenant pas `chiffre`". Écran 1
 * → `[choixPosition1SansD]`. Écran 2 → `[...choixPositionsRestantesSansD, sansD]`. Écran 3 →
 * `[resultatFinal]` (= T − sansD). */
export interface ExerciceDenombA_ContientUnChiffre {
  famille: "A";
  sousType: "contientUnChiffre";
  n: number;
  chiffre: number;
  total: number;
  choixPosition1SansD: number;
  choixPositionsRestantesSansD: number[];
  sansD: number;
  resultatFinal: number;
}

/** Sous-type "contient deux chiffres donnés" (3 écrans) — le nombre doit contenir LES DEUX chiffres
 * `chiffre1` ET `chiffre2` (pas "au moins l'un des deux" — via De Morgan, `Ā∪B̄` est le complément de
 * "contient les deux", donc `T − Ā − B̄ + Ā∩B̄ = T − |Ā∪B̄| = |A∩B|` calcule bien "contient les deux",
 * voir preuve croisée par force brute dans `familleA.test.ts`). Inclusion-exclusion : `total` (T),
 * `sansChiffre1` (Ā), `sansChiffre2` (B̄) tous CONNUS/affichés en données (même technique que le
 * sous-type précédent, supposée acquise) ; seule quantité NOUVELLE à déterminer via écrans 1/2 :
 * `sansLesDeux` (Ā∩B̄, aucun des deux chiffres). Écran 1 → `[choixPosition1SansLesDeux]`. Écran 2 →
 * `[...choixPositionsRestantesSansLesDeux, sansLesDeux]`. Écran 3 → `[resultatFinal]` (= T − Ā − B̄
 * + Ā∩B̄). */
export interface ExerciceDenombA_ContientDeuxChiffres {
  famille: "A";
  sousType: "contientDeuxChiffres";
  n: number;
  chiffre1: number;
  chiffre2: number;
  total: number;
  sansChiffre1: number;
  sansChiffre2: number;
  choixPosition1SansLesDeux: number;
  choixPositionsRestantesSansLesDeux: number[];
  sansLesDeux: number;
  resultatFinal: number;
}

/** Sous-type "borne supérieure" (2 écrans) : premier chiffre restreint aux chiffres NON NULS
 * strictement inférieurs à `borne`. Écran 1 → `[choixPosition1]` (= `borne − 1`). Écran 2 →
 * `[...choixPositionsRestantes, total]`. */
export interface ExerciceDenombA_BorneSuperieure {
  famille: "A";
  sousType: "borneSuperieure";
  n: number;
  borne: number;
  choixPosition1: number;
  choixPositionsRestantes: number[];
  total: number;
}

/** Sous-type "parité ou multiple de m" (3 écrans) — PIÈGE CENTRAL de toute la famille : le dernier
 * chiffre est restreint à un ensemble `ensembleDernierChiffre` qui CONTIENT 0 (ex. pairs :
 * {0,2,4,6,8} ; multiples de 5 : {0,5}) — le nombre de choix pour le PREMIER chiffre diffère selon
 * que le dernier chiffre tiré vaut 0 (ne réduit pas le pool des chiffres non nuls) ou non (le
 * réduit de 1). Écran 1 → `[choixPremierSiDernierZero, choixPremierSiDernierNonZero]` (toujours
 * `[9,8]` — CONSTANTES, voir `generateurs6e/denombrementFondamental/familleA.ts`, le piège n'est PAS
 * dans le calcul de ces 2 valeurs mais dans le fait de bien utiliser LA BONNE dans chaque terme de
 * la somme à l'écran 3). Écran 2 → `choixPositionsMilieu` (séquence décroissante, IDENTIQUE dans les
 * 2 cas — voir en-tête du même fichier pour la preuve). Écran 3 → `[resultatFinal]`. */
export interface ExerciceDenombA_Parite {
  famille: "A";
  sousType: "parite";
  n: number;
  ensembleDernierChiffre: number[];
  labelEnsemble: string;
  choixPremierSiDernierZero: number;
  choixPremierSiDernierNonZero: number;
  choixPositionsMilieu: number[];
  resultatFinal: number;
}

export type ExerciceDenombrementA =
  | ExerciceDenombA_Total
  | ExerciceDenombA_PositionFixee
  | ExerciceDenombA_ContientUnChiffre
  | ExerciceDenombA_ContientDeuxChiffres
  | ExerciceDenombA_BorneSuperieure
  | ExerciceDenombA_Parite;

// ============================================================================
// Famille B — Diagonales d'un polygone. D(n) = n(n-3)/2.
// ============================================================================

/** Sous-type "direct" (1 écran) : `n` donné, calculer `D(n)`. Écran unique → `[diagonales]`. */
export interface ExerciceDenombB_Direct {
  famille: "B";
  sousType: "direct";
  n: number;
  diagonales: number;
}

/** Sous-type "inverse" (2 écrans) : `D(n)` donné, trouver `n`. Écran 1 → `[constanteEquation]`
 * (complète le gabarit affiché `n² − 3n − ⬚ = 0`, valeur = `2·diagonales`). Écran 2 → `[n]`. */
export interface ExerciceDenombB_Inverse {
  famille: "B";
  sousType: "inverse";
  diagonales: number;
  n: number;
  constanteEquation: number;
}

export type ExerciceDenombrementB = ExerciceDenombB_Direct | ExerciceDenombB_Inverse;

// ============================================================================
// Famille C — Arrangements et combinaisons classiques (2 écrans, 4 sous-types).
// ============================================================================

export type FormuleC = "permutation" | "combinaison" | "puissance";

/** Écran 1 → `[formule]` (choix parmi les 3 boutons de `FormuleC`, JAMAIS un champ texte — voir
 * `ui6e/formatDenombrementFondamental.ts`). Écran 2 → `[resultat]`.
 *
 * - "cartesContraintes" : jeu de `n=52` cartes, choisir `k` cartes dont `m` sont déjà fixées comme
 *   INCLUSES (`varianteCartes="inclues"`, reste à choisir = `C(n-m,k-m)`) ou EXCLUES
 *   (`varianteCartes="exclues"`, reste à choisir = `C(n-m,k)`) — `formule="combinaison"`.
 * - "motsLettresDistinctes" : `n` lettres toutes différentes, nombre de mots (permutations) = `n!`
 *   — `formule="permutation"`.
 * - "motsRepetition" : mots de `k` lettres choisies parmi un alphabet de `n` lettres, répétition
 *   autorisée = `n^k` — `formule="puissance"`.
 * - "motsPositionFixee" : mot de `n` lettres toutes différentes, `k` lettres fixées à des positions
 *   données, arrangements des `n-k` positions restantes = `(n-k)!` — `formule="permutation"`.
 */
export interface ExerciceDenombrementC {
  famille: "C";
  sousType: "cartesContraintes" | "motsLettresDistinctes" | "motsRepetition" | "motsPositionFixee";
  formule: FormuleC;
  resultat: number;
  n: number;
  k?: number;
  m?: number;
  varianteCartes?: "inclues" | "exclues";
  lettresFixees?: { position: number; lettre: string }[];
}

// ============================================================================
// Famille D — Arrangements par blocs ou groupes (3 écrans, 3 sous-types).
// ============================================================================

export interface GroupeDenombD {
  nom: string;
  taille: number;
}

/** Écran 1 → `[nombreUnites]` (blocs/groupes + éléments isolés, chaque bloc traité comme 1 seule
 * unité). Écran 2 → `[arrangementsBlocs]` (= `nombreUnites!`). Écran 3 → `[resultatFinal]` (combine
 * `arrangementsBlocs` avec les arrangements INTERNES à chaque bloc — `internesParGroupe`, 1 seul si
 * ordre imposé, `k!` si libre).
 *
 * - "grouper" : `groupes` (3-4 groupes de 2-4 objets chacun, ex. livres par discipline sur une
 *   étagère) doivent chacun rester rassemblés ; ordre interne toujours LIBRE (chaque groupe peut
 *   être arrangé en son sein dans n'importe quel ordre) — `internesParGroupe[i] = groupes[i].taille!`.
 * - "consecutivesOrdreFixe" : `mot` de 6-10 lettres, `lettresConsecutives` (2-3 lettres, ex. dans
 *   l'ordre alphabétique) doivent apparaître consécutivement DANS CET ORDRE PRÉCIS — 1 seul
 *   arrangement interne possible, `internesParGroupe = [1]`.
 * - "consecutivesOrdreLibre" : mêmes lettres consécutives mais dans N'IMPORTE QUEL ordre entre
 *   elles — `internesParGroupe = [k!]` où k = nombre de lettres consécutives.
 */
export interface ExerciceDenombrementD {
  famille: "D";
  sousType: "grouper" | "consecutivesOrdreFixe" | "consecutivesOrdreLibre";
  groupes?: GroupeDenombD[];
  mot?: string;
  lettresConsecutives?: string;
  nombreUnites: number;
  arrangementsBlocs: number;
  internesParGroupe: number[];
  resultatFinal: number;
}

// ============================================================================
// Famille E — Permutations circulaires (2 écrans, 2 sous-types).
// ============================================================================

/** `n`∈{5,6,7,8} objets/personnes distincts en cercle. Écran 1 → `[sousType]` (choix entre "table"
 * et "collier", JAMAIS un champ texte). Écran 2 → `[resultat]`.
 * - "table" (rotations seules équivalentes) : `resultat = (n-1)!`.
 * - "collier" (rotations ET réflexions équivalentes) : `resultat = (n-1)!/2`. */
export interface ExerciceDenombrementE {
  famille: "E";
  sousType: "table" | "collier";
  n: number;
  resultat: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceDenombrementFondamental = ExerciceDenombrementA | ExerciceDenombrementB | ExerciceDenombrementC | ExerciceDenombrementD | ExerciceDenombrementE;

export type FamilleDenombrementFondamental = ExerciceDenombrementFondamental["famille"];

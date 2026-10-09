import type { ContexteFamilleC, ExerciceFamilleC } from "../../core6e/probabilitesProblemes.types";

/**
 * Couche A (6e) — génération famille C ("Indépendants à probabilités différentes") pour `6gen33`. 3
 * éléments indépendants, probabilités de "succès" DISTINCTES p1,p2,p3 — jamais de loi binomiale
 * applicable directement (piège central de la spec).
 *
 * ============================================================================
 * **Garde-fou de dégénérescence du piège** (même classe de bug que `6gen26`/`6gen27` famille C —
 * "aire"/"volume" — trouvé en revue indépendante sur ce générateur) — voir `ECART_MINIMAL_PIEGE`
 * ci-dessous. La spec attend que la valeur binomiale NAÏVE (coefficient binomial appliqué à une
 * probabilité MOYENNÉE p̄=(p1+p2+p3)/3, piège central de cette famille) soit détectable comme
 * INCORRECTE par `diagnostiquerValeur` (tolérance chapitre 8, 0,01 — `TOLERANCE_PROBABILITE`,
 * `moteur6e/verificationProbabilites.ts`). Sans garde-fou, un balayage exhaustif de l'espace
 * `CANDIDATS_P` (210 triplets distincts × 2 valeurs de k = 420 combinaisons) montre que 144/420
 * (34%) ont un écart < 0,01 entre la vraie somme et la valeur du piège — pour plus d'un tirage sur
 * trois, la formule binomiale naïve (piège que cet écran est censé faire échouer) aurait été
 * ACCEPTÉE PAR ERREUR. Cas extrême : p=[0.7,0.8,0.6], k=1 → écart=0,001 (10× sous la tolérance).
 * Fix : retirage borné (200 tentatives, même patron que `ECART_MINIMAL_BAYES` de
 * `generateurs6e/independanceBayes/familleC.ts`, 6gen32) rejetant tout triplet dont l'écart
 * réel/piège tombe sous `ECART_MINIMAL_PIEGE=0,03` (3× la tolérance de vérification, jamais
 * resserré ni élargi sans revalider le balayage exhaustif ci-dessous) — à cette marge, ~31% des
 * triplets restent valides pour chaque k∈{1,2} (voir `familleC.test.ts`), convergence quasi
 * garantie bien avant 200 tentatives.
 * ============================================================================
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const CONTEXTES_C: readonly ContexteFamilleC[] = [
  { id: "machines", texte: "Une usine possède 3 machines fonctionnant de manière indépendante. Chaque machine a sa propre probabilité de tomber en panne au cours d'une journée.", labelElements: ["Machine 1", "Machine 2", "Machine 3"] },
  { id: "feux", texte: "Un automobiliste traverse 3 feux de signalisation, chacun étant au vert ou au rouge de manière indépendante (2 états simplifiés). Chaque feu a sa propre probabilité d'être au vert.", labelElements: ["Feu A", "Feu B", "Feu C"] },
];

/** Exportée : réutilisée par le balayage exhaustif de `familleC.test.ts` (garde-fou de
 * dégénérescence du piège, voir en-tête de fichier). */
export const CANDIDATS_P: readonly number[] = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];

function tirerTroisProbabilitesDistinctes(): [number, number, number] {
  const p1 = tirerParmi(CANDIDATS_P);
  let p2 = tirerParmi(CANDIDATS_P);
  while (p2 === p1) p2 = tirerParmi(CANDIDATS_P);
  let p3 = tirerParmi(CANDIDATS_P);
  while (p3 === p1 || p3 === p2) p3 = tirerParmi(CANDIDATS_P);
  return [p1, p2, p3];
}

function factorielle(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function coefficientBinomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorielle(n) / (factorielle(k) * factorielle(n - k));
}

/** Valeur du piège central — formule binomiale appliquée à la probabilité MOYENNÉE p̄, comme si les
 * 3 éléments étaient interchangeables (jamais le cas ici, p1≠p2≠p3 par construction). Exportée :
 * réutilisée par `familleC.test.ts` (garde-fou) ET par le balayage exhaustif de régression. */
export function binomialeNaivePiege(p: [number, number, number], k: number): number {
  const pMoyen = (p[0] + p[1] + p[2]) / 3;
  return coefficientBinomial(3, k) * pMoyen ** k * (1 - pMoyen) ** (3 - k);
}

/** Marge de sécurité — voir en-tête de fichier. 3× la tolérance de vérification (0,01), jamais
 * resserrée sans revalider le balayage exhaustif de `familleC.test.ts`. Exportée : réutilisée TELLE
 * QUELLE par le test (jamais une valeur dupliquée qui pourrait dériver du vrai seuil appliqué ici). */
export const ECART_MINIMAL_PIEGE = 0.03;
const TENTATIVES_MAX_GARDE_FOU = 200;

/** Construction déterministe (`k` fixé) — utilisée par `CATALOGUE_VARIANTES`/`construireAvecVarianteId`.
 * `k` toujours dans [1,2] : k=0 et k=3 n'ont qu'UNE configuration (le piège central — plusieurs
 * configurations distinctes à énumérer — n'existe que pour 0<k<3). Retirage borné si le piège
 * binomial naïf tombe trop près de la vraie réponse (voir en-tête de fichier). */
export function construireFamilleC(k: number): ExerciceFamilleC {
  const contexte = tirerParmi(CONTEXTES_C);
  for (let tentative = 0; tentative < TENTATIVES_MAX_GARDE_FOU; tentative++) {
    const p = tirerTroisProbabilitesDistinctes();
    const exercice: ExerciceFamilleC = { famille: "C", contexte, p, k };
    const ecart = Math.abs(probabiliteExactementK(exercice) - binomialeNaivePiege(p, k));
    if (ecart >= ECART_MINIMAL_PIEGE) return exercice;
  }
  throw new Error("construireFamilleC : aucun triplet valide trouvé après 200 tentatives (piège binomial toujours trop proche de la vraie réponse)");
}

export function genererFamilleC(): ExerciceFamilleC {
  return construireFamilleC(tirerParmi([1, 2] as const));
}

// ============================================================================
// Calculs purs — réutilisés par les TESTS de ce fichier (voir `familleA.ts`, même principe).
// ============================================================================

/** Toutes les configurations (sous-ensembles de {0,1,2}, indices dans `p`) de taille `k` — TRIÉES
 * (indices croissants) pour un ordre canonique reproductible. Génération explicite (3 éléments
 * seulement, jamais besoin d'un algorithme général de combinaisons). */
export function configurationsExactementK(k: number): number[][] {
  const toutes: number[][] = [[], [0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]];
  return toutes.filter((c) => c.length === k);
}

/** Probabilité d'UNE configuration donnée (indices qui réussissent) — produit des probabilités
 * individuelles, PAS un facteur binomial commun (piège central : les probabilités diffèrent). */
export function probabiliteConfiguration(p: [number, number, number], configuration: number[]): number {
  let resultat = 1;
  for (let i = 0; i < 3; i++) resultat *= configuration.includes(i) ? p[i] : 1 - p[i];
  return resultat;
}

/** Écran 3 — somme des probabilités de TOUTES les configurations correctes de taille k. */
export function probabiliteExactementK(exercice: ExerciceFamilleC): number {
  return configurationsExactementK(exercice.k).reduce((acc, config) => acc + probabiliteConfiguration(exercice.p, config), 0);
}

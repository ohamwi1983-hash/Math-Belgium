/**
 * Couche core (6e) — contrat pour `6gen46` ("Dénombrement combinatoire pur : problèmes"), 3ᵉ
 * générateur du chapitre "Analyse combinatoire" (après `6gen43`/`6gen44`, voir
 * `docs/historique-6e.md`). 4 familles (A à D), tirage ÉQUIPROBABLE de la famille — voir
 * `generateurs6e/denombrementCombinatoirePur/index.ts`.
 *
 * **Convention transversale à ce contrat** (identique à `denombrementFondamental.types.ts`/
 * `denombrementCombine.types.ts`) : chaque variante porte déjà, PRÉ-CALCULÉES par la Couche A
 * (jamais recalculées côté Couche B — `moteur6e/` n'importe jamais `generateurs6e/`, voir
 * CLAUDE.md), toutes les valeurs numériques correctes attendues à chaque écran. La Couche B
 * (`moteur6e/verificationDenombrementCombinatoirePur.ts`) se contente de les comparer, dans
 * l'ORDRE d'affichage, à la saisie élève.
 *
 * **Familles B et C réutilisent DIRECTEMENT des générateurs déjà écrits** (import Couche A ↔
 * Couche A, libre entre générateurs 6e — CLAUDE.md) : famille B reprend `construireFamilleA` de
 * `generateurs6e/denombrementCombine/familleA.ts` (6gen44, formule multinomiale) tel quel, famille
 * C reprend `construireMotsRepetition` de `generateurs6e/denombrementFondamental/familleC.ts`
 * (6gen43, n^k) tel quel — seul le CONTEXTE narratif change (voir en-tête de chaque
 * `familleX.ts` de ce dossier pour le détail). Familles A et D sont des nouveautés propres à ce
 * générateur.
 */

// ============================================================================
// Famille A — Dénombrement au poker (jeu de 32 cartes, main de 5), combinaisons multi-étapes.
// 4 sous-types, TOUJOURS 3 écrans. Aucun paramètre aléatoire (deck fixe : 8 hauteurs × 4 couleurs)
// — seul le sous-type varie.
// ============================================================================

export type SousTypeDenombCombPurA = "carre" | "brelan" | "paire" | "deuxPaires";

/** Écran 1 → `[etape1]` (façons de choisir la/les hauteur(s) + couleur(s) de la combinaison
 * spéciale). Écran 2 → `[etape2]` (façons pour les cartes restantes, hauteurs déjà utilisées
 * EXCLUES). Écran 3 → `[resultatFinal]` (= `etape1 × etape2`).
 *
 * - "carre" : hauteur du carré (8 choix) × les 4 couleurs toutes utilisées (1 façon) = `etape1=8`.
 *   Carte restante parmi les 7 hauteurs restantes × 4 couleurs = `etape2=28`. `resultatFinal=224`.
 * - "brelan" : hauteur du brelan (8) × 3 couleurs parmi 4 (`C(4,3)=4`) = `etape1=32`. 2 hauteurs
 *   différentes parmi les 7 restantes (`C(7,2)=21`) × 1 couleur chacune (4×4=16) = `etape2=336`.
 *   `resultatFinal=10752`.
 * - "paire" : hauteur de la paire (8) × 2 couleurs parmi 4 (`C(4,2)=6`) = `etape1=48`. 3 hauteurs
 *   différentes parmi les 7 restantes (`C(7,3)=35`) × 1 couleur chacune (4³=64) = `etape2=2240`.
 *   `resultatFinal=107520`.
 * - "deuxPaires" : 2 hauteurs parmi 8 pour les paires (`C(8,2)=28`) × 2 couleurs pour chaque paire
 *   (`C(4,2)²=36`) = `etape1=1008`. 1 hauteur restante parmi les 6 × 4 couleurs = `etape2=24`.
 *   `resultatFinal=24192`.
 */
export interface ExerciceDenombCombPurA {
  famille: "A";
  sousType: SousTypeDenombCombPurA;
  etape1: number;
  etape2: number;
  resultatFinal: number;
}

// ============================================================================
// Famille B — Répartition en groupes de tailles données. RÉUTILISE DIRECTEMENT `construireFamilleA`
// de `generateurs6e/denombrementCombine/familleA.ts` (6gen44) — même champs, nouveau contexte
// narratif (objets répartis entre destinataires plutôt que personnes en équipes). 2 écrans.
// ============================================================================

/** Écran 1 → `[resultat]` (formule multinomiale posée, NON calculée, texte libre évalué par
 * `moteur6e/expressionCombinatoire.ts`). Écran 2 → `[resultat]` (valeur calculée). `resultat` en
 * BigInt — voir en-tête `generateurs6e/denombrementCombine/familleA.ts` (n jusqu'à 52, dépasse
 * `Number.MAX_SAFE_INTEGER`). */
export interface ExerciceDenombCombPurB {
  famille: "B";
  n: number;
  k: number;
  noms: string[];
  tailles: number[];
  resultat: bigint;
}

// ============================================================================
// Famille C — Dénombrement avec répétition (n^k). RÉUTILISE DIRECTEMENT `construireMotsRepetition`
// de `generateurs6e/denombrementFondamental/familleC.ts` (6gen43) — nouveau contexte narratif
// (affichages d'un dispositif à plusieurs éléments indépendants). Écran UNIQUE.
// ============================================================================

/** Écran unique → `[resultat]` (= `n^k`, calculé directement). */
export interface ExerciceDenombCombPurC {
  famille: "C";
  n: number;
  k: number;
  resultat: number;
}

// ============================================================================
// Famille D — Comptage de triplets ordonnés pour une somme donnée (n=3 dés à f=6 faces,
// "paradoxe" 9 vs 10 du Chevalier de Méré, généralisé à d'autres paires de sommes proches).
// TOUJOURS 3 écrans.
// ============================================================================

/** Une décomposition (partition) d'une somme cible en 3 entiers de `[1,f]`, triée croissante, avec
 * le nombre d'arrangements ORDONNÉS distincts qu'elle admet (3 valeurs différentes → `3!=6` ;
 * exactement une paire → `3` ; les 3 identiques → `1`). */
export interface DecompositionSommeDes {
  valeurs: [number, number, number];
  arrangements: number;
}

/** Écran 1 → 2 LISTES (add-as-needed, `EtapeListeDecompositionsDenombrementCombinatoirePur.tsx`) :
 * l'ENSEMBLE des décompositions de `s1`, puis l'ENSEMBLE des décompositions de `s2` (ordre
 * indifférent au sein de chaque liste, mais aucune manquante/en trop/dupliquée). Écran 2 → un champ
 * texte par décomposition CONFIRMÉE à l'écran 1 (dans l'ordre `decompositionsS1` puis
 * `decompositionsS2`), demandant son nombre d'arrangements. Écran 3 → `[totalS1, totalS2,
 * comparaison]` (`comparaison` = choix parmi "s1"/"s2"/"egal", jamais du texte libre). */
export interface ExerciceDenombCombPurD {
  famille: "D";
  n: number;
  f: number;
  s1: number;
  s2: number;
  decompositionsS1: DecompositionSommeDes[];
  decompositionsS2: DecompositionSommeDes[];
  totalS1: number;
  totalS2: number;
  comparaison: "s1" | "s2" | "egal";
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceDenombrementCombinatoirePur = ExerciceDenombCombPurA | ExerciceDenombCombPurB | ExerciceDenombCombPurC | ExerciceDenombCombPurD;

export type FamilleDenombrementCombinatoirePur = ExerciceDenombrementCombinatoirePur["famille"];

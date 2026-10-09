import { coefficientBinomial } from "../combinatoire";
import type { ExerciceDenombCombPurA, SousTypeDenombCombPurA } from "../../core6e/denombrementCombinatoirePur.types";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Dénombrement au poker, combinaisons multi-étapes") de
 * `6gen46`. NOUVEAUTÉ (pas de réutilisation d'un générateur existant, contrairement aux familles
 * B/C). Jeu de `NB_HAUTEURS=8` hauteurs × `NB_COULEURS=4` couleurs = 32 cartes, main de 5 cartes.
 * Réutilise `coefficientBinomial` de `generateurs6e/combinatoire.ts` (fondation partagée du
 * chapitre, 6gen43).
 *
 * ============================================================================
 * **Aucun paramètre aléatoire** — le deck est fixe (8×4=32 cartes), donc `etape1`/`etape2`/
 * `resultatFinal` sont des CONSTANTES par sous-type (pas de plage `tirerEntier`, contrairement aux
 * autres familles de ce chapitre). Seul le SOUS-TYPE tiré varie (`construireFamilleA`,
 * équiprobable parmi les 4) — mirroir de `denombrementFondamental/familleE.ts` (6gen43, `n` fixé
 * dans une petite plage mais ici carrément 0 randomisation, le problème du poker classique n'a pas
 * de variante numérique naturelle sans changer les règles du jeu elles-mêmes).
 *
 * ============================================================================
 * **Calculs, vérifiés indépendamment dans `familleA.test.ts`**
 * ============================================================================
 * - "carre" (4 cartes de même hauteur + 1 autre) : hauteur du carré (8 choix), les 4 couleurs sont
 *   TOUTES utilisées automatiquement (`C(4,4)=1`) → `etape1=8`. Carte restante parmi les 7
 *   hauteurs NON utilisées × 4 couleurs → `etape2=28`. `resultatFinal=224`.
 * - "brelan" (3 même hauteur + 2 cartes d'hauteurs différentes entre elles et du brelan) : hauteur
 *   du brelan (8) × 3 couleurs parmi 4 (`C(4,3)=4`) → `etape1=32`. 2 hauteurs différentes parmi les
 *   7 restantes (`C(7,2)=21`) × 1 couleur choisie pour chacune (4 chacune, donc 4×4=16) →
 *   `etape2=336`. `resultatFinal=10752`.
 * - "paire" (2 même hauteur + 3 cartes d'hauteurs toutes différentes entre elles et de la paire) :
 *   hauteur de la paire (8) × 2 couleurs parmi 4 (`C(4,2)=6`) → `etape1=48`. 3 hauteurs différentes
 *   parmi les 7 restantes (`C(7,3)=35`) × 1 couleur pour chacune (4³=64) → `etape2=2240`.
 *   `resultatFinal=107520`.
 * - "deuxPaires" (2 paires d'hauteurs différentes + 1 carte d'une 3ᵉ hauteur) : 2 hauteurs parmi 8
 *   pour les paires (`C(8,2)=28`) × 2 couleurs pour CHAQUE paire (`C(4,2)=6` chacune, donc 6×6=36)
 *   → `etape1=1008`. 1 hauteur restante parmi les 6 (×4 couleurs) → `etape2=24`.
 *   `resultatFinal=24192`.
 *
 * **PIÈGE CENTRAL** (voir aussi en-tête `moteur6e/verificationDenombrementCombinatoirePur.ts`) : à
 * l'écran 2, les hauteurs déjà utilisées par la combinaison spéciale de l'écran 1 (1 hauteur pour
 * carré/brelan/paire, 2 pour deuxPaires) ne sont PLUS disponibles — le nombre de hauteurs
 * disponibles diminue de `NB_HAUTEURS` (8) à `NB_HAUTEURS - hauteursUtilisees` (7 ou 6).
 */

export const NB_HAUTEURS = 8;
export const NB_COULEURS = 4;
export const TAILLE_MAIN = 5;

/** Nombre de hauteurs consommées par la combinaison spéciale de l'écran 1 — 1 pour carré/brelan/
 * paire (une seule hauteur privilégiée), 2 pour deuxPaires (deux hauteurs privilégiées). Utilisé
 * par la Couche ui (aides écran 2) — jamais recalculé côté Couche B. */
export function hauteursUtiliseesEtape1(sousType: SousTypeDenombCombPurA): number {
  return sousType === "deuxPaires" ? 2 : 1;
}

export function construireCarre(): ExerciceDenombCombPurA {
  const etape1 = NB_HAUTEURS * coefficientBinomial(NB_COULEURS, NB_COULEURS); // 8×1
  const etape2 = (NB_HAUTEURS - 1) * NB_COULEURS; // 7×4
  return { famille: "A", sousType: "carre", etape1, etape2, resultatFinal: etape1 * etape2 };
}

export function construireBrelan(): ExerciceDenombCombPurA {
  const etape1 = NB_HAUTEURS * coefficientBinomial(NB_COULEURS, 3); // 8×C(4,3)
  const etape2 = coefficientBinomial(NB_HAUTEURS - 1, 2) * NB_COULEURS * NB_COULEURS; // C(7,2)×4×4
  return { famille: "A", sousType: "brelan", etape1, etape2, resultatFinal: etape1 * etape2 };
}

export function construirePaire(): ExerciceDenombCombPurA {
  const etape1 = NB_HAUTEURS * coefficientBinomial(NB_COULEURS, 2); // 8×C(4,2)
  const etape2 = coefficientBinomial(NB_HAUTEURS - 1, 3) * NB_COULEURS ** 3; // C(7,3)×4³
  return { famille: "A", sousType: "paire", etape1, etape2, resultatFinal: etape1 * etape2 };
}

export function construireDeuxPaires(): ExerciceDenombCombPurA {
  const etape1 = coefficientBinomial(NB_HAUTEURS, 2) * coefficientBinomial(NB_COULEURS, 2) ** 2; // C(8,2)×C(4,2)²
  const etape2 = (NB_HAUTEURS - 2) * NB_COULEURS; // 6×4
  return { famille: "A", sousType: "deuxPaires", etape1, etape2, resultatFinal: etape1 * etape2 };
}

const CONSTRUCTEURS_A: (() => ExerciceDenombCombPurA)[] = [construireCarre, construireBrelan, construirePaire, construireDeuxPaires];

export function construireFamilleA(): ExerciceDenombCombPurA {
  return tirerParmi(CONSTRUCTEURS_A)();
}

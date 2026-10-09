import { construireMotsRepetition } from "../denombrementFondamental/familleC";
import type { ExerciceDenombCombPurC } from "../../core6e/denombrementCombinatoirePur.types";

/**
 * Couche A (6e) — génération, famille C ("Dénombrement avec répétition") de `6gen46`. RÉUTILISE
 * DIRECTEMENT `construireMotsRepetition` de `generateurs6e/denombrementFondamental/familleC.ts`
 * (6gen43, sous-type "motsRepetition" de sa propre famille C — alphabet de `n∈[2,5]` lettres, mots
 * de `k∈[2,4]` lettres avec répétition autorisée, `resultat = n^k`) — import Couche A ↔ Couche A,
 * libre entre générateurs du même chantier (CLAUDE.md). AUCUNE logique combinatoire dupliquée :
 * simple re-mappage de contrat (`sousType`/`formule` de 6gen43 abandonnés, seuls `n`/`k`/`resultat`
 * survivent — ce générateur n'a qu'UN seul type de dénombrement par répétition, pas besoin de
 * distinguer un sous-type).
 *
 * **Nouveau contexte narratif** (mission : "affichages possibles d'un dispositif à plusieurs
 * éléments indépendants, chacun choisi parmi un même ensemble de possibilités") : la Couche ui
 * (`ui6e/formatDenombrementCombinatoirePur.ts`) reformule en "un dispositif à k éléments
 * indépendants (ex. voyants, roues de cadenas), chacun réglable sur n positions" plutôt qu'en "mots
 * de k lettres" (6gen43) — les VALEURS (n, k, resultat=n^k) restent exactement celles produites par
 * le générateur réutilisé.
 */
export function construireFamilleC(): ExerciceDenombCombPurC {
  const base = construireMotsRepetition();
  return { famille: "C", n: base.n, k: base.k as number, resultat: base.resultat };
}

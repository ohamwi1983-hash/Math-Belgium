import { construireFamilleA as construireFamilleAMultinomiale } from "../denombrementCombine/familleA";
import type { ExerciceDenombCombPurB } from "../../core6e/denombrementCombinatoirePur.types";

/**
 * Couche A (6e) — génération, famille B ("Répartition en groupes de tailles données") de `6gen46`.
 * RÉUTILISE DIRECTEMENT `construireFamilleA` de `generateurs6e/denombrementCombine/familleA.ts`
 * (6gen44, famille A — répartition multinomiale, `n∈[20,52]` personnes réparties en `k∈{2,3,4}`
 * groupes NOMMÉS de tailles DISTINCTES sommant à `n`, `resultat = n!/(n1!·...·nk!)` calculé en
 * BigInt) — import Couche A ↔ Couche A, libre entre générateurs du même chantier (CLAUDE.md).
 * AUCUNE logique combinatoire dupliquée ici : ce fichier se contente d'appeler la fonction
 * existante et de re-mapper son contrat (`famille:"A"` → `famille:"B"`, mêmes champs) — le calcul
 * multinomial lui-même, la construction BigInt-safe et le tirage de tailles distinctes restent
 * entièrement dans `denombrementCombine/familleA.ts`, jamais réécrits ici.
 *
 * **Nouveau contexte narratif** (mission : "répartir des objets entre plusieurs destinataires selon
 * des quantités fixées, potentiellement égales entre plusieurs destinataires — la formule
 * multinomiale s'applique sans changement, les destinataires restant distinguables") : la Couche ui
 * (`ui6e/formatDenombrementCombinatoirePur.ts`) reformule `noms`/`tailles` en "objets répartis dans
 * des boîtes numérotées" plutôt qu'en "personnes réparties en équipes" (6gen44) — mais les VALEURS
 * elles-mêmes (n, k, tailles, resultat) sont EXACTEMENT celles produites par le générateur réutilisé,
 * y compris sa convention de tailles toujours STRICTEMENT DISTINCTES (le "potentiellement égales" de
 * la mission décrit la formule multinomiale EN GÉNÉRAL, pas une exigence de régénérer des tailles
 * égales ici — voir `docs/historique-6e.md` pour la discussion complète de ce choix).
 */
export function construireFamilleB(): ExerciceDenombCombPurB {
  const base = construireFamilleAMultinomiale();
  return { famille: "B", n: base.n, k: base.k, noms: base.noms, tailles: base.tailles, resultat: base.resultat };
}

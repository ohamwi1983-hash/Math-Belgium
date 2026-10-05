/**
 * Logique pure de l'outil de traçage optionnel — "Réduction d'une somme de vecteurs (Chasles)",
 * `promptgen27modifications.md`, point 2. Aide graphique FACULTATIVE : l'élève trace des vecteurs
 * directement sur la figure fixe, sans AUCUN impact sur la vérification de la réponse (toujours le
 * champ de texte libre existant, `verificationReductionVectorielle.ts`, strictement inchangé).
 *
 * **Interaction tap-tap, pas glisser-déposer** : la première implémentation reposait sur un
 * glisser-déposer (`onPointerDown`/`Move`/`Up` + `setPointerCapture`), qui s'est révélé cassé sur
 * appareil tactile réel — signalé par l'utilisateur avec capture d'écran, confirmé ne PAS se
 * reproduire à la souris ni sous l'émulation mobile Playwright (toujours pilotée par des
 * événements souris même en viewport étroit) — malgré un premier correctif (`touch-action: none`
 * déplacé d'un style inline vers une classe CSS, alignée sur le patron déjà éprouvé de
 * `HistogrammeGraph.tsx`/`BoiteMoustachesGraph.tsx`), le problème a persisté. Plutôt que de
 * continuer à chercher une troisième variante de correctif pour un geste de glissement
 * intrinsèquement fragile sur mobile, remplacé entièrement par une interaction tap-tap (touche le
 * point de départ, puis le point d'arrivée) — même principe que l'outil "vecteur entre 2 points" de
 * GeoGebra : chaque tap est un `onClick` isolé, sans aucune dépendance de continuité de geste
 * (`pointermove`/capture/`touch-action`), donc structurellement immunisé contre ce type de risque
 * sur mobile, ET fonctionnant IDENTIQUEMENT à la souris (aucune branche de code spécifique à la
 * plateforme).
 */
export interface ResultatToucherPoint {
  /** Nouveau point de départ mémorisé — `null` si aucune sélection n'est en attente (vecteur créé
   * ou sélection annulée). */
  nouveauDepart: string | null;
  /** Vecteur à créer, `null` si ce tap n'en complète aucun (premier tap, ou annulation). */
  vecteurCree: { depart: string; arrivee: string } | null;
}

/** Transition d'état pure pour un tap sur un point nommé de la figure : premier tap → mémorise le
 * point de départ ; second tap sur un point DIFFÉRENT → crée le vecteur départ→arrivée et
 * réinitialise ; second tap sur le MÊME point que le départ → annule la sélection en cours (jamais
 * de vecteur nul départ=arrivée créé). */
export function toucherPoint(pointDepartActuel: string | null, pointTouche: string): ResultatToucherPoint {
  if (!pointDepartActuel) {
    return { nouveauDepart: pointTouche, vecteurCree: null };
  }
  if (pointTouche === pointDepartActuel) {
    return { nouveauDepart: null, vecteurCree: null };
  }
  return { nouveauDepart: null, vecteurCree: { depart: pointDepartActuel, arrivee: pointTouche } };
}

/**
 * Couche B — contrat des réglages du moteur de session (section 1 de la spec).
 * Ce module ne doit jamais importer quoi que ce soit de src/generateurs : le moteur
 * de session doit rester générique et fonctionner avec n'importe quel générateur
 * respectant GenerateurExercice.
 */

export interface ReglagesSession {
  nombreExercices: number;
  /** nombre d'essais autorisés, partagé par les 3 étapes (reconnaissance, champ 1, champ 2) */
  tentativesMax: number;
  /**
   * Si activé, chaque tentative ratée retire pointsDeBase/tentativesMax points au score de
   * l'étape en cours (voir src/moteur/etapeTentatives.ts). Si désactivé, aucune pénalité par
   * tentative, mais tentativesMax continue de limiter le nombre d'essais avant révélation.
   */
  penaliteActivee: boolean;
  affichageReponseApresEchec: boolean;
  affichageExplication: boolean;
}

/**
 * Points PRÉ-REMPLIS du panneau des évaluations et des examens (décision de l'utilisateur) — module
 * pur, testable seul :
 * - exercice généré : points par exercice = durée estimée de SA variante (la même que le repère
 *   « ≈ m min » de la rangée, `estimationVariante` / `dureeEstimeeVariante`, cache partagé) ÷ 2,
 *   arrondie au demi-point, bornée entre 1 et 8 ; générateur pas encore noté : même règle sur sa durée
 *   provisoire (constante `dureeMinutes`) ;
 * - vrai/faux : 1 pt par affirmation ; formule : 1 pt ;
 * - démonstration : selon la longueur de son corrigé, ≈ 1 pt pour 2 étapes, arrondi au demi-point,
 *   borné entre 2 et 6 (une démonstration de 4 étapes vaut 2 pts, de 9 étapes 4,5 pts) ; ligne sans
 *   choix explicite (tirée au hasard une fois pour toutes les séries) : moyenne des démonstrations
 *   que la section peut tirer, arrondie au demi-point ;
 * - compréhension : 2 pts (valeur d'avant, pas de règle automatique).
 * Les points modifiés à la main sont VERROUILLÉS (`LigneSelection.modePoints`) et jamais écrasés.
 */

export const POINTS_MIN_EXERCICE = 1;
export const POINTS_MAX_EXERCICE = 8;
export const POINTS_MIN_DEMONSTRATION = 2;
export const POINTS_MAX_DEMONSTRATION = 6;

export function arrondiDemiPoint(x: number): number {
  return Math.round(x * 2 + 1e-9) / 2;
}

/** Points d'un exercice d'après sa durée estimée (minutes) : la durée est d'abord arrondie à la
 * minute comme le repère « ≈ m min » de la rangée (`RepereNiveauDuree::texteDuree`), pour que le
 * professeur lise toujours points = m ÷ 2 (« ≈ 7 min » → 3,5 pts), bornés entre 1 et 8. */
export function pointsDepuisDuree(minutes: number): number {
  const m = Math.max(1, Math.round(minutes));
  return Math.min(POINTS_MAX_EXERCICE, Math.max(POINTS_MIN_EXERCICE, arrondiDemiPoint(m / 2)));
}

/** Points d'une démonstration d'après le nombre d'étapes de son corrigé. */
export function pointsDemonstration(etapes: number): number {
  return Math.min(POINTS_MAX_DEMONSTRATION, Math.max(POINTS_MIN_DEMONSTRATION, arrondiDemiPoint(etapes / 2)));
}

/** Moyenne (au demi-point) des points de démonstrations candidates ; `undefined` sans candidate. */
export function pointsDemonstrationMoyens(etapesCandidates: number[]): number | undefined {
  if (etapesCandidates.length === 0) return undefined;
  return arrondiDemiPoint(etapesCandidates.reduce((s, e) => s + pointsDemonstration(e), 0) / etapesCandidates.length);
}

/** Lecture tolérante d'une saisie de points (texte libre, jamais filtré pendant la frappe) :
 * « 2 », « 2,5 », « 2.5 », « 2 pts » ; demi-points ; `null` si illisible ou ≤ 0. */
export function lirePoints(texte: string): number | null {
  const t = texte.trim().toLowerCase().replace(/[−–—]/g, "-");
  const m = /^(\d+(?:[,.]\d+)?)\s*(?:pts?|points?)?$/.exec(t);
  if (!m) return null;
  const v = Number(m[1].replace(",", "."));
  if (!(v > 0) || Math.abs(v * 2 - Math.round(v * 2)) > 1e-9) return null;
  return v;
}

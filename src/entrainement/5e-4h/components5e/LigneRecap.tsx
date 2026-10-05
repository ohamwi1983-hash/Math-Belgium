import type { ReactNode } from "react";

export type StatutRecap = "verte" | "orange" | "rouge";

/**
 * Statut d'une ligne du récapitulatif final — vert (correcte sans jamais avoir utilisé l'aide),
 * orange (correcte mais aide utilisée en cours de route), rouge (fausse, révélée après épuisement
 * des tentatives). Introduit pour 5gen1 ("Écran récapitulatif final à plat, code couleur"),
 * généralisé ici comme la SEULE source de vérité pour tous les générateurs 5e — jamais dupliqué
 * localement dans chaque `ResultatPanelXxx.tsx`.
 */
export function statutRecap(revele: boolean, niveauAide: number | null): StatutRecap {
  if (revele) return "rouge";
  if (niveauAide !== null && niveauAide > 0) return "orange";
  return "verte";
}

interface LigneRecapProps {
  label: string;
  statut: StatutRecap;
  children: ReactNode;
}

/**
 * Une ligne du récapitulatif final — jamais d'encadrement/de hiérarchie visuelle (pas de carte, pas
 * de bordure), seule la couleur du texte porte l'information (`.recap-final-{verte,orange,rouge}`,
 * `App.css`). Jamais de score fractionnaire par écran (`X/100`) : le contenu affiché est la réponse
 * RÉELLEMENT attendue de l'écran, jamais recalculée depuis un score. `<div>`, jamais `<p>` : un
 * enfant peut être un `<table>` (ex. grille de signes) ou tout autre élément de flux, invalide à
 * l'intérieur d'un `<p>` (erreur de nesting DOM/hydratation déjà trouvée une fois par Playwright).
 */
export function LigneRecap({ label, statut, children }: LigneRecapProps) {
  return (
    <div className={`recap-final-ligne recap-final-${statut}`}>
      <strong>{label} : </strong>
      {children}
    </div>
  );
}

/**
 * Points d'un écran individuel pour le résumé chiffré du récapitulatif — 100 points de base si
 * correct sans jamais avoir utilisé l'aide, -20 points par niveau d'aide effectivement consommé
 * avant la validation correcte, 0 si la réponse a été révélée. Dérivé des MÊMES champs
 * (`revele`/`niveauAide`) que `statutRecap` ci-dessus — jamais une capture séparée.
 */
export function pointsEcran(revele: boolean, niveauAide: number | null): number {
  if (revele) return 0;
  return Math.max(0, 100 - 20 * (niveauAide ?? 0));
}

/**
 * Résumé chiffré total d'un récapitulatif — somme de `pointsEcran` sur tous les écrans RÉELLEMENT
 * traversés, comparée au maximum théorique (100 × nombre d'écrans). Affiché EN COMPLÉMENT de la
 * liste colorée (`LigneRecap`), jamais à sa place — la liste reste la source d'information
 * détaillée (réponse réellement attendue par écran), ce total n'en est qu'un résumé agrégé. Ne
 * contredit pas la règle "jamais de score fractionnaire PAR écran" ci-dessus : celle-ci porte sur
 * chaque ligne individuelle, pas sur ce total global affiché une seule fois en bas du récapitulatif.
 */
export function totalPointsRecap(ecrans: { revele: boolean; niveauAide: number | null }[]): { points: number; pointsMax: number } {
  return {
    points: ecrans.reduce((somme, e) => somme + pointsEcran(e.revele, e.niveauAide), 0),
    pointsMax: ecrans.length * 100,
  };
}

/**
 * Pied de récapitulatif — résumé chiffré total ("340/400"), affiché EN COMPLÉMENT de la liste
 * `LigneRecap` déjà présente au-dessus, jamais à sa place. `ecrans` doit contenir exactement les
 * MÊMES paires `{revele, niveauAide}` déjà passées à `statutRecap` pour chaque `LigneRecap`
 * affichée juste au-dessus (mêmes écrans, même ordre de filtrage) — jamais une capture séparée.
 */
export function RecapTotalPoints({ ecrans }: { ecrans: { revele: boolean; niveauAide: number | null }[] }) {
  const { points, pointsMax } = totalPointsRecap(ecrans);
  return (
    <div className="recap-final-total">
      Total : {points}/{pointsMax}
    </div>
  );
}

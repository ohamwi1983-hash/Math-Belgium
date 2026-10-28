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

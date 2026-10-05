import type { ReactNode } from "react";

export type StatutRecap = "verte" | "orange" | "rouge";

/**
 * Statut d'une ligne du récapitulatif final — vert (correcte sans jamais avoir utilisé l'aide),
 * orange (correcte mais aide utilisée en cours de route), rouge (fausse, révélée après épuisement
 * des tentatives). Réplique FIDÈLEMENT `components5e/LigneRecap.tsx` (5gen1 puis généralisé à tout
 * le chantier 5e, voir `promptalignementstyle4epour6e.md`, point 7) — même forme, jamais importée
 * (chaque chantier reste indépendant, voir CLAUDE.md), seule source de vérité pour tous les
 * générateurs 6e — jamais dupliqué localement dans chaque `ResultatPanelXxx.tsx`.
 *
 * ⚠️ **Piège explicite** : ne jamais déduire ce statut depuis le SCORE final d'un écran
 * (`score===100→verte`, sinon orange/rouge) — un score imparfait peut résulter d'une simple
 * tentative ratée SANS jamais avoir utilisé l'aide (pénalité par tentative, pas par aide) ; un tel
 * écran doit rester VERT, jamais orange. `revele`/`niveauAide` doivent être capturés au moment
 * précis où chaque écran se ferme, AVANT que la transition de phase suivante ne remette
 * `niveauAide` à zéro (voir le patron `terminerEtape`/`aideParPhase` à répliquer dans chaque
 * `App6genX.tsx`).
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
 * `App.css` — classes DÉJÀ PARTAGÉES avec le chantier 5e, aucune nouvelle règle CSS nécessaire côté
 * 6e). Jamais de score fractionnaire par écran (`X/100`) : le contenu affiché est la réponse
 * RÉELLEMENT attendue de l'écran, jamais recalculée depuis un score. `<div>`, jamais `<p>` : un
 * enfant peut être un élément de flux invalide à l'intérieur d'un `<p>` (ex. un `<table>`).
 */
export function LigneRecap({ label, statut, children }: LigneRecapProps) {
  return (
    <div className={`recap-final-ligne recap-final-${statut}`}>
      <strong>{label} : </strong>
      {children}
    </div>
  );
}

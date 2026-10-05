import type { ReactNode } from "react";

export type StatutRecap = "verte" | "orange" | "rouge";

/**
 * Statut d'une ligne du récapitulatif final — vert (correcte sans jamais avoir utilisé l'aide),
 * orange (correcte mais aide utilisée en cours de route), rouge (fausse, révélée après épuisement
 * des tentatives). Copié tel quel depuis `components5e/LigneRecap.tsx` (même contrat, même CSS
 * partagée `App.css`) — `promptuniformisationrecap4e.md` : uniformiser le récapitulatif final sur
 * les 58 générateurs 4e, encore à l'ancien format `score-list`/`X/100` (audit de traçabilité du
 * récapitulatif).
 */
export function statutRecap(revele: boolean, niveauAide: number | null): StatutRecap {
  if (revele) return "rouge";
  if (niveauAide !== null && niveauAide > 0) return "orange";
  return "verte";
}

/** Libellé humain par défaut d'un statut — utilisé comme contenu de `LigneRecap` sur le 4e, faute
 * d'un helper `formatXxxAttenduLatex` par écran pour les 58 générateurs (hors scope de ce chantier,
 * qui ne porte que sur le format d'affichage, pas sur l'ajout d'un rendu de réponse attendue par
 * écran — voir `promptuniformisationrecap4e.md`). */
export function libelleStatutRecap(statut: StatutRecap): string {
  if (statut === "rouge") return "Réponse révélée";
  if (statut === "orange") return "Correct (aide utilisée)";
  return "Correct";
}

interface LigneRecapProps {
  label: string;
  statut: StatutRecap;
  children: ReactNode;
}

/**
 * Une ligne du récapitulatif final — jamais d'encadrement/de hiérarchie visuelle (pas de carte, pas
 * de bordure), seule la couleur du texte porte l'information (`.recap-final-{verte,orange,rouge}`,
 * `App.css`, déjà partagée avec le 5e/6e). Jamais de score fractionnaire par écran (`X/100`).
 * `<div>`, jamais `<p>` : un enfant peut être un élément de flux invalide à l'intérieur d'un `<p>`.
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
 * Résumé chiffré EN COMPLÉMENT de la liste colorée, jamais à sa place (`promptuniformisationrecap4e.md`,
 * point 2) — total de points pondérés déjà calculé par le moteur (jamais recalculé ici), affiché
 * sous la forme `"points/maxPoints"`.
 */
export function TotalPointsRecap({ points, maxPoints }: { points: number; maxPoints: number }) {
  return (
    <p className="recap-final-total">
      Total : {Math.round(points)}/{maxPoints}
    </p>
  );
}

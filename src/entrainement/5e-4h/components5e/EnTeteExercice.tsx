import type { ReactNode } from "react";

interface Props {
  consigneGenerale: ReactNode;
  blocDonnees: ReactNode;
}

/**
 * En-tête d'écran partagé : consigne générale + bloc de données, toujours affichés en entier sur
 * CHAQUE écran de l'exercice (plus de repliement en bandeau compact — option 1A retenue, abandon
 * de l'option 1B "plein puis compact"). Composant dupliqué par chantier (convention CLAUDE.md),
 * identique en 4e/6e-6h.
 *
 * Rendu en bandeau teinté pleine largeur (`.entete-exercice`, `theme.css`) depuis la maquette
 * "A — Bandeau teinté" (4 propositions présentées, celle-ci retenue) — l'étiquette "Énoncé" porte
 * la mise en évidence, la consigne elle-même reste discrète à l'intérieur du bandeau.
 */
export function EnTeteExercice({ consigneGenerale, blocDonnees }: Props) {
  return (
    <div className="entete-exercice">
      <p className="entete-exercice-label">Énoncé</p>
      <p className="prompt-text">{consigneGenerale}</p>
      {blocDonnees}
    </div>
  );
}

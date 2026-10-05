import { Katex } from "../components/Katex";

interface Props {
  /** Expression LaTeX de l'état le plus à jour de la construction, ou null tant que rien n'a été confirmé. */
  latex: string | null;
  /** Remplace le libellé par défaut ("État actuel"). Absent par défaut. */
  label?: string;
}

/**
 * Bloc "état actuel" — `promptalignementstyle4epour6e.md`, point 6. Réplique fidèlement
 * `components/EtatActuelPanel.tsx` (4e) — même style visuel (`.equation-box`, déjà partagée
 * globalement), même comportement (rien rendu tant qu'aucune valeur n'a encore été confirmée pour
 * l'écran courant). Affiché juste sous le bloc de données, à partir du 2e écran d'une séquence,
 * dérivé UNIQUEMENT des scores/valeurs déjà confirmés de l'exercice — jamais de la saisie brute de
 * l'élève. Chaque générateur 6e fournit sa propre fonction pure `calculerEtatActuelXxx(exercice,
 * ...)` (jamais partagée entre générateurs, seul ce composant de rendu l'est).
 */
export function EtatActuelPanel({ latex, label }: Props) {
  if (latex === null) return null;

  return (
    <div className="etat-actuel-panel">
      <p className="field-label">{label ?? "État actuel"}</p>
      <div className="equation-box">
        <Katex expression={latex} block />
      </div>
    </div>
  );
}

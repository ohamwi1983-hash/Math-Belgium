import { Katex } from "./Katex";

interface Props {
  /** Expression LaTeX de l'état le plus à jour de la construction, ou null tant que rien n'a été confirmé. */
  latex: string | null;
  /**
   * Remplace le libellé par défaut ("État actuel") — ex: "Numérateur combiné" pour le bloc N(x)
   * (promptgenerateur6inequationRationnelle.md, point 3), toujours affiché dès le premier essai,
   * jamais un état "confirmé progressivement" comme l'usage historique de ce panneau. Absent par
   * défaut : comportement inchangé pour tous les autres appelants.
   */
  label?: string;
}

/**
 * Bloc "état actuel de l'expression" (prompt-corrections-moteur-partage.md, point 1) : même style
 * visuel que l'énoncé de départ (.equation-box), affiché juste en dessous. S'ajoute au
 * récapitulatif textuel existant, ne le remplace pas. Absent (rien rendu) tant qu'aucune
 * transformation n'a encore été confirmée pour l'exercice en cours — même principe que
 * RecapitulatifPanel (rien à montrer, rien de rendu).
 */
export function EtatActuelPanel({ latex, label }: Props) {
  if (latex === null) return null;

  return (
    <div>
      <p className="field-label">{label ?? "État actuel"}</p>
      <div className="equation-box">
        <Katex expression={latex} block />
      </div>
    </div>
  );
}

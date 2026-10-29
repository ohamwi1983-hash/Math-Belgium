import type { EtatPuceProgression } from "../../components/ProgressionPuces";

interface Props {
  /** Une puce par écran DÉJÀ clos de l'exercice en cours, dans l'ordre ("correcte"/"aide"/"revele"),
   * suivie de la puce "courante". */
  segments: EtatPuceProgression[];
  onSegmentClick: (index: number) => void;
}

/**
 * Puces de progression de "Section plane d'un solide" — même rendu et mêmes classes que
 * `ProgressionPuces` (puces cliquables ouvrant `FicheReponseEcran`), mais SANS pourcentage ni puces
 * "à venir" : le nombre d'écrans de cet exercice dépend du nombre de côtés de la section (3k − 7
 * écrans pour k côtés), l'afficher d'avance révélerait la forme de la section (audit chapitre 8,
 * point 24). Seuls les écrans déjà joués et l'écran courant apparaissent.
 */
export function HistoriqueEcransSectionPlaneSolide({ segments, onSegmentClick }: Props) {
  if (segments.length === 0) return null;
  const nbClos = segments.filter((etat) => etat !== "courante" && etat !== "a-venir").length;

  return (
    <div className="progression-puces">
      <div className="progression-puces-entete">
        <span className="progression-puces-label">Écrans terminés</span>
        <span className="progression-puces-pourcentage">{nbClos}</span>
      </div>
      <div className="progression-puces-rangee">
        {segments.map((etat, index) =>
          etat === "correcte" || etat === "aide" || etat === "revele" ? (
            <button
              key={index}
              type="button"
              className={`progression-puce progression-puce-${etat} progression-puce-cliquable`}
              onClick={() => onSegmentClick(index)}
              aria-label={`Revoir l'écran ${index + 1} (${etat === "revele" ? "incorrect" : etat === "aide" ? "correct avec aide" : "correct"})`}
            />
          ) : (
            <span key={index} className={`progression-puce progression-puce-${etat}`} />
          ),
        )}
      </div>
    </div>
  );
}

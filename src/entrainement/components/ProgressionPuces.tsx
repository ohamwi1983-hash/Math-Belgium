export type EtatPuceProgression = "correcte" | "revele" | "courante" | "a-venir";

interface Props {
  /** Une entrée par étape de l'exercice, DANS L'ORDRE où elles se déroulent — chaque appelant la
   * construit à partir de ses propres champs `xxxRevele`/`scoreXxxExercice` déjà trackés par le
   * moteur (jamais une valeur recalculée séparément) : "correcte" si `scoreXxx !== null &&
   * !xxxRevele`, "revele" si `scoreXxx !== null && xxxRevele`, "courante" pour la phase
   * actuellement affichée (`etat.phase === ...`), "a-venir" pour toute étape plus loin. */
  segments: EtatPuceProgression[];
  /** Consultation en lecture seule d'un écran déjà clos (voir `FicheReponseEcran.tsx`) — appelé
   * avec l'index du segment cliqué. Absent par défaut : les puces restent purement visuelles,
   * comportement historique inchangé partout où ce prop n'est pas câblé. Seuls les segments
   * "correcte"/"revele" deviennent cliquables (jamais "courante"/"a-venir", qui n'ont rien à
   * consulter). */
  onSegmentClick?: (index: number) => void;
}

/**
 * Barre de progression en puces colorées (remplace le texte "Étape X/Y" + le badge de phase de
 * `.card-progress`) — design "Ce qu'on sait déjà" validé avec l'utilisateur. Le pourcentage affiché
 * est une simple proportion d'étapes déjà closes (correctes OU révélées) sur le total, jamais une
 * moyenne pondérée des scores : le moteur note en interne sur 100 par étape (`POINTS_DE_BASE`),
 * sans équivalent évident en "points" entiers par étape (contrairement à ce qu'une maquette de
 * référence pouvait suggérer) — afficher une vraie fraction de progression plutôt que d'inventer un
 * barème parallèle.
 */
export function ProgressionPuces({ segments, onSegmentClick }: Props) {
  if (segments.length === 0) return null;
  const nbClotures = segments.filter((etat) => etat === "correcte" || etat === "revele").length;
  const pourcentage = Math.round((nbClotures / segments.length) * 100);

  return (
    <div className="progression-puces">
      <div className="progression-puces-entete">
        <span className="progression-puces-label">Progression</span>
        <span className="progression-puces-pourcentage">{pourcentage} %</span>
      </div>
      <div className="progression-puces-rangee">
        {segments.map((etat, index) => {
          const consultable = onSegmentClick && (etat === "correcte" || etat === "revele");
          return consultable ? (
            <button
              key={index}
              type="button"
              className={`progression-puce progression-puce-${etat} progression-puce-cliquable`}
              onClick={() => onSegmentClick(index)}
              aria-label={`Revoir l'écran ${index + 1} (${etat === "revele" ? "incorrect" : "correct"})`}
            />
          ) : (
            <span key={index} className={`progression-puce progression-puce-${etat}`} />
          );
        })}
      </div>
    </div>
  );
}

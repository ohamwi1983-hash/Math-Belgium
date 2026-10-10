import { useState } from "react";
import type { DirectionCandidate, ExerciceOmbreSoleilDirectionInconnue } from "../core/ombreSoleil.types";
import { NIVEAU_AIDE_MAX_DIRECTION_INCONNUE } from "../moteur/sessionOmbreSoleil";
import { apercuDirection, CONSIGNE_DIRECTION_INCONNUE, libelleCandidat, ordreAffichageCandidats, pointSommetPiquet, segmentPiquet, solidePourAffichage, TEXTE_AIDE_DIRECTION_INCONNUE_NIVEAU1, TEXTE_AIDE_DIRECTION_INCONNUE_NIVEAU2 } from "../ui/formatOmbreSoleil";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOmbreSoleilDirectionInconnue;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string) => void;
}

/**
 * Étape 0 (supplémentaire, avant la décomposition commune) — variante C, "sens inverse" (spec
 * section "Variante C") : DÉDUIRE la direction de lumière depuis la seule paire piquet connu/ombre
 * connue déjà affichée, jamais la deviner. Aucune aide ne trace la solution — texte seul, insistant
 * explicitement sur le piège propre à cette variante (deviner plutôt que déduire rigoureusement).
 */
export function EtapeDirectionInconnue({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [candidats] = useState<DirectionCandidate[]>(() => ordreAffichageCandidats(exercice.directionsCandidates));
  const [choix, setChoix] = useState<DirectionCandidate | null>(null);
  const max = NIVEAU_AIDE_MAX_DIRECTION_INCONNUE;
  const erronee = tentativesUtilisees > 0;

  const solide = solidePourAffichage(exercice);
  const apercu = apercuDirection(exercice.piquetConnu, choix);
  const sommetConnu = pointSommetPiquet(exercice.piquetConnu);

  const points = [sommetConnu, { position: exercice.ombreConnue, label: "Ombre connue", couleur: "#495057" }];
  const segments = [
    segmentPiquet(exercice.piquetConnu),
    { a: sommetConnu.position, b: exercice.ombreConnue, couleur: "#495057", pointille: true },
  ];
  if (apercu) segments.push(apercu);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_DIRECTION_INCONNUE}</p>

      <Solide3DSketch solide={solide} pointsExtra={points} segmentsExtra={segments} labelsSommets={false} />

      <div className="options-grid-compact">
        {candidats.map((candidat, index) => (
          <button
            key={candidat.id}
            type="button"
            className={`btn${choix?.id === candidat.id ? " toggle-active" : ""}${erronee && choix?.id === candidat.id ? " is-erronee" : ""}`}
            onClick={() => setChoix(candidat)}
          >
            {libelleCandidat(index)}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_DIRECTION_INCONNUE_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_DIRECTION_INCONNUE_NIVEAU2}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix.id)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}

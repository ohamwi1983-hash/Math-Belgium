import { useState } from "react";
import type { ConclusionPositionDroitePlan, ExercicePositionDroitePlan } from "../core/positionDroitePlan.types";
import { NIVEAU_AIDE_MAX_CLASSIFICATION } from "../moteur/sessionPositionDroitePlan";
import { LIBELLE_CLASSIFICATION, TEXTE_AIDE_CLASSIFICATION_NIVEAU1, libelleDroite, libellePlan, texteAideClassificationNiveau2 } from "../ui/formatPositionDroitePlan";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExercicePositionDroitePlan;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ConclusionPositionDroitePlan) => void;
}

const OPTIONS: ConclusionPositionDroitePlan[] = ["incluse", "parallele", "secante"];

/**
 * Écran 1 — Classification. La droite et le plan sont tous les deux mis en évidence sur le croquis
 * (jamais la seule couleur du plan) : c'est précisément la RELATION entre les deux que l'élève doit
 * reconnaître, masquer la droite reviendrait à cacher une donnée de l'énoncé, pas à éviter de
 * révéler la réponse (la couleur ne dit rien de incluse/parallèle/sécante en elle-même).
 */
export function EtapeClassificationPositionDroitePlan({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<ConclusionPositionDroitePlan | null>(null);
  const max = NIVEAU_AIDE_MAX_CLASSIFICATION;
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <p className="prompt-text">
        Étudie la position de la droite {libelleDroite(exercice)} par rapport au plan {libellePlan(exercice)}.
      </p>

      <Solide3DSketch solide={exercice.solide} plan={exercice.plan} droite={exercice.droite} />

      <p className="prompt-text">Que peux-tu dire de cette droite par rapport à ce plan ?</p>
      <div className="options-grid-compact">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`btn${choix === option ? " toggle-active" : ""}${erronee && choix === option ? " is-erronee" : ""}`}
            onClick={() => setChoix(option)}
          >
            {LIBELLE_CLASSIFICATION[option]}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_CLASSIFICATION_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideClassificationNiveau2(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
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

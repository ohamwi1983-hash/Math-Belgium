import { useState } from "react";
import type { ConclusionPositionDroitePlan, ExercicePositionDroitePlan } from "../core/positionDroitePlan.types";
import { NIVEAU_AIDE_MAX_CLASSIFICATION } from "../moteur/sessionPositionDroitePlan";
import { LIBELLE_CLASSIFICATION, TEXTE_AIDE_CLASSIFICATION_NIVEAU1, texteAideClassificationNiveau2 } from "../ui/formatPositionDroitePlan";
import { formatMessageErreur } from "../ui/messageErreur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExercicePositionDroitePlan;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ConclusionPositionDroitePlan) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const OPTIONS: ConclusionPositionDroitePlan[] = ["incluse", "parallele", "secante"];

/**
 * Écran 1 — Classification. La droite et le plan sont tous les deux mis en évidence sur le croquis
 * (jamais la seule couleur du plan) : c'est précisément la RELATION entre les deux que l'élève doit
 * reconnaître, masquer la droite reviendrait à cacher une donnée de l'énoncé, pas à éviter de
 * révéler la réponse (la couleur ne dit rien de incluse/parallèle/sécante en elle-même).
 *
 * Seul le choix SOUMIS et refusé passe en rouge (`soumis`) — jamais un nouveau choix pas encore
 * validé. Une seule tentative sur cet écran (`tentativesMaxEcran`, décision H2a).
 */
export function EtapeClassificationPositionDroitePlan({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [choix, setChoix] = useState<ConclusionPositionDroitePlan | null>(null);
  const [soumis, setSoumis] = useState<ConclusionPositionDroitePlan | null>(null);
  const max = NIVEAU_AIDE_MAX_CLASSIFICATION;
  const refuse = (tentativesUtilisees > 0 || validation?.revele === true) && soumis !== null;

  function valider() {
    if (choix === null) return;
    setSoumis(choix);
    onValider(choix);
  }

  return (
    <div>
      <p className="prompt-text">Que peux-tu dire de cette droite par rapport à ce plan ?</p>
      <div className="options-grid-compact">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`btn${choix === option ? " toggle-active" : ""}${refuse && soumis === option && choix === option ? " is-erronee" : ""}`}
            onClick={() => !validation && setChoix(option)}
            disabled={Boolean(validation) && choix !== option}
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
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

import { useState } from "react";
import type { ConclusionPositionDroitePlan, ExercicePositionDroitePlan } from "../core/positionDroitePlan.types";
import { NIVEAU_AIDE_MAX_CLASSIFICATION } from "../moteur/sessionPositionDroitePlan";
import { LIBELLE_CLASSIFICATION, TEXTE_AIDE_CLASSIFICATION_NIVEAU1, texteAideClassificationNiveau2 } from "../ui/formatPositionDroitePlan";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../ui/choixFige";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExercicePositionDroitePlan;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ConclusionPositionDroitePlan) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou choix faux jugé) — gèle le choix, remplace
   * "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md, "validation/invalidation avant de
   * passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const OPTIONS: ConclusionPositionDroitePlan[] = ["incluse", "parallele", "secante"];

/**
 * Écran 1 — Classification. La droite et le plan sont tous les deux mis en évidence sur le croquis
 * (jamais la seule couleur du plan) : c'est précisément la RELATION entre les deux que l'élève doit
 * reconnaître, masquer la droite reviendrait à cacher une donnée de l'énoncé, pas à éviter de
 * révéler la réponse (la couleur ne dit rien de incluse/parallèle/sécante en elle-même).
 *
 * Choix fermé à UNE tentative (`tentativesMaxEcran`, décision H2a), jugé puis figé (audit 4e ch. 8,
 * lot B, comme le 4e ch. 7 : `ui/choixFige.ts`) : l'option choisie fausse en rouge ✗, la bonne en
 * vert ✓ ; le message propre au choix (`messageRevele`, construit par l'appli) remplace « Tentatives
 * épuisées ».
 */
export function EtapeClassificationPositionDroitePlan({ exercice, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [choix, setChoix] = useState<ConclusionPositionDroitePlan | null>(null);
  const etatOptions = { selection: choix, choisie: validation ? choix : null, bonne: exercice.classification };

  return (
    <div>
      <p className="prompt-text">Que peux-tu dire de cette droite par rapport à ce plan ?</p>
      <div className="options-grid-compact" role="radiogroup">
        {OPTIONS.map((option) => {
          const aria = ariaOptionChoixFerme(option, etatOptions);
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={choix === option}
              className={classeOptionChoixFerme(option, etatOptions)}
              onClick={() => !validation && setChoix(option)}
              disabled={Boolean(validation)}
            >
              {LIBELLE_CLASSIFICATION[option]}
              {aria && <span className="sr-only"> — {aria}</span>}
            </button>
          );
        })}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_CLASSIFICATION_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideClassificationNiveau2(exercice)}</p>}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CLASSIFICATION} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

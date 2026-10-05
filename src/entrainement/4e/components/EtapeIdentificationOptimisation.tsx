import { useState } from "react";
import type { ExerciceOptimisationModelisation } from "../core/optimisation.types";
import type { ReponseIdentification } from "../moteur/verificationOptimisation";
import { diagnostiquerIdentification } from "../moteur/verificationOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceOptimisation } from "./EnonceOptimisation";

interface Props {
  exercice: ExerciceOptimisationModelisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseIdentification) => void;
}

/**
 * Écran 1 (`prompt-restructuration-architecture-modelisation.md`) — identifier ce que représentent x
 * et y dans le contexte, désormais un écran À PART ENTIÈRE (auparavant une sous-étape embarquée dans
 * l'écran "contrainte", qui n'existe plus tel quel). Toujours atteint uniquement quand
 * `exercice.identificationXY` est défini — `moteur/sessionOptimisation.ts::phaseInitiale` saute cet
 * écran entièrement sinon, jamais rendu vide. Pas d'aide sur cet écran (vérification par sélection,
 * même convention que "interpretation") — voir `NIVEAU_AIDE_MAX_IDENTIFICATION=0`.
 */
export function EtapeIdentificationOptimisation({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const identification = exercice.identificationXY;
  const [indexX, setIndexX] = useState<number | null>(null);
  const [indexY, setIndexY] = useState<number | null>(null);

  if (!identification) return null;

  const complet = indexX !== null && indexY !== null;
  const reponse: ReponseIdentification = { indexX, indexY };
  const statut = complet ? diagnostiquerIdentification(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;
  const statutGlobal = statut ? (statut.x && statut.y ? "correct" : "not_equivalent") : undefined;

  return (
    <div>
      <EnonceOptimisation exercice={exercice} />
      <p className="prompt-text">
        Identifie ce que représentent {exercice.contexte.labelVariable} et {exercice.contrainte.lettreCherchee} dans cette situation.
      </p>

      <div className="field">
        <label className="field-label" htmlFor="optimisation-identification-x">
          {exercice.contexte.labelVariable} représente…
        </label>
        <select
          id="optimisation-identification-x"
          className={`text-input${apresEchec && statut && !statut.x ? " is-erronee" : ""}`}
          value={indexX ?? ""}
          onChange={(e) => setIndexX(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="" disabled>
            Choisis…
          </option>
          {identification.candidatsX.map((candidat, index) => (
            <option key={candidat} value={index}>
              {candidat}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="optimisation-identification-y">
          {exercice.contrainte.lettreCherchee} représente…
        </label>
        <select
          id="optimisation-identification-y"
          className={`text-input${apresEchec && statut && !statut.y ? " is-erronee" : ""}`}
          value={indexY ?? ""}
          onChange={(e) => setIndexY(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="" disabled>
            Choisis…
          </option>
          {identification.candidatsY.map((candidat, index) => (
            <option key={candidat} value={index}>
              {candidat}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
        </p>
      )}
    </div>
  );
}

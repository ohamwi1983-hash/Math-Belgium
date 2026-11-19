import { useState } from "react";
import type { ReactNode } from "react";
import { BlocAides, type PropsAides } from "./EtapesDetectiveErreurs";
import { SaisieEnsembleSolutionTrinome, etatSaisieEnsembleInitial, lireSaisieEnsemble, type EtatSaisieEnsemble, type LectureSaisieEnsemble } from "./SaisieEnsembleSolutionTrinome";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Écran « ensemble-solution » partagé par gen121 (correction de la copie) et gen117 (S lu sur le
 * graphique) — 4e, chapitre 2. Saisie guidée `SaisieEnsembleSolutionTrinome` (champs jamais filtrés),
 * 3 tentatives ; une saisie illisible ne consomme aucune tentative (l'appelant ne la compte pas).
 * Aucun point affiché.
 */

interface Props extends PropsAides {
  consigne: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Faux à la dernière tentative comptée (allure soulignée). */
  erronee: boolean;
  /** Message propre à la dernière tentative fausse. */
  messageFaux: string | null;
  /** La dernière soumission n'a pas été comptée : saisie illisible. */
  illisible: boolean;
  onValider: (lecture: LectureSaisieEnsemble, etat: EtatSaisieEnsemble) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeEnsembleSolutionTrinome({ consigne, tentativesUtilisees, tentativesMax, erronee, messageFaux, illisible, onValider, validation, ...aides }: Props) {
  const [etat, setEtat] = useState<EtatSaisieEnsemble>(etatSaisieEnsembleInitial);
  const fige = !!validation;
  const lecture = lireSaisieEnsemble(etat);
  const complet = lecture.statut !== "incomplet";
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ margin: "12px 0" }}>
        <SaisieEnsembleSolutionTrinome etat={etat} onChange={setEtat} fige={fige} erronee={!fige && erronee} />
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Choisis l'allure de l'ensemble, puis complète-le : valeurs séparées par « ; », fractions acceptées (1/2), crochets à choisir.
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(lecture, etat)}>
            Valider
          </button>
          {illisible && (
            <p className="alert-error" role="alert">
              Écriture non reconnue : écris des nombres (virgule décimale, fraction comme 1/2). Aucune tentative n'est comptée.
            </p>
          )}
          {!illisible && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {messageFaux && <p style={{ margin: "6px 0 0" }}>{messageFaux}</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

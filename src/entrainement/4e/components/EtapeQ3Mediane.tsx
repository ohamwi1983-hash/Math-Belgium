import { useState } from "react";
import type { ExerciceMedianeDiscrete } from "../core/mediane.types";
import type { ReponseQ3 } from "../moteur/verificationMediane";
import { diagnostiquerQ3 } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_Q3 } from "../moteur/sessionMediane";
import { LABEL_Q3, PLACEHOLDER_Q3, PLACEHOLDER_SEUIL, consigneQ3, texteAideQ3Niveau1, texteAideQ3Niveau2 } from "../ui/formatMediane";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceMedianeDiscrete;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseQ3) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "q3" (variante "discrete" uniquement, `promptgen33modifications.md`) — même structure que
 * l'écran "q1" (2 champs séparés : seuil 3n/4, Q3), calculée DIRECTEMENT sur le tableau complet.
 * Le tableau lui-même (identique sur les écrans "mediane"/"q1"/"q3") est centralisé dans
 * `blocDonnees` (`EnTeteExercice`, voir `AppMediane`/`AppExerciceSynthese`) — plus rendu ici.
 */
export function EtapeQ3Mediane({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [seuil, setSeuil] = useState("");
  const [q3, setQ3] = useState("");

  const complet = seuil.trim() !== "" && q3.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerQ3(exercice, { seuil, q3 }) : null;
  const statut = evaluation && (evaluation.seuil === "parse_error" || evaluation.q3 === "parse_error") ? "parse_error" : undefined;

  return (
    <div>
      <p className="prompt-text">{consigneQ3(exercice)}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="q3-seuil">
          Seuil (3n/4) =
        </label>
        <input
          id="q3-seuil"
          className={`text-input${evaluation && evaluation.seuil !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_SEUIL}
          value={seuil}
          onChange={(e) => setSeuil(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="q3-valeur">
          <Katex expression={LABEL_Q3} /> =
        </label>
        <input
          id="q3-valeur"
          className={`text-input${evaluation && evaluation.q3 !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_Q3}
          value={q3}
          onChange={(e) => setQ3(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={texteAideQ3Niveau1()} />
          </p>
          {niveauAide >= 2 && <p>{texteAideQ3Niveau2(exercice)}</p>}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_Q3} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ seuil, q3 })}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

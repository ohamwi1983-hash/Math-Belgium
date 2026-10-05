import { useState } from "react";
import type { ExerciceMedianeDiscrete } from "../core/mediane.types";
import type { ReponseMinMaxMode } from "../moteur/verificationMediane";
import { diagnostiquerMinMaxMode } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_MIN_MAX_MODE } from "../moteur/sessionMediane";
import {
  LABEL_EFFECTIF_NI,
  LABEL_VALEUR_XI,
  PLACEHOLDER_MAX,
  PLACEHOLDER_MIN,
  consigneMinMaxMode,
  libelleBoutonAide,
  texteAideMinMaxModeNiveau1,
  texteAideMinMaxModeNiveau2,
} from "../ui/formatMediane";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceMediane } from "./EnonceMediane";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceMedianeDiscrete;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseMinMaxMode) => void;
}

/**
 * Écran "minMaxMode" (variante "discrete" uniquement, dernière étape de sa séquence —
 * `promptgen33modifications.md`) — min/max en lecture DIRECTE du tableau (aucune aide dédiée),
 * mode(s) en interface "add-as-needed" (pattern déjà en place, voir `EtapeModeMultiple.tsx`,
 * "Mode et classe modale") — comparés en multi-ensemble EXACT, ordre indifférent. Aide
 * UNIQUEMENT sur la partie mode : niveau 1 rappelle la règle (effectif MAXIMAL, pas une propriété
 * de xᵢ), niveau 2 révèle l'effectif maximal déjà calculé, jamais la ou les valeurs qui l'atteignent.
 */
export function EtapeMinMaxModeMediane({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [modes, setModes] = useState<string[]>([""]);

  function ajouterMode() {
    setModes([...modes, ""]);
  }

  function retirerMode(index: number) {
    if (modes.length <= 1) return;
    setModes(modes.filter((_, i) => i !== index));
  }

  function modifierMode(index: number, valeur: string) {
    setModes(modes.map((v, i) => (i === index ? filtrerSaisieNumerique(valeur) : v)));
  }

  const complet = min.trim() !== "" && max.trim() !== "" && modes.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerMinMaxMode(exercice, { min, max, modes }) : null;
  const statut = evaluation && (evaluation.min === "parse_error" || evaluation.max === "parse_error" || evaluation.modes === "parse_error") ? "parse_error" : undefined;

  return (
    <div>
      <EnonceMediane exercice={exercice} />
      <p className="prompt-text">{consigneMinMaxMode(exercice)}</p>

      <div className="tf-table-scroll">
        <table className="tf-table">
          <thead>
            <tr>
              <th>
                Valeur <Katex expression={LABEL_VALEUR_XI} />
              </th>
              <th>
                Effectif <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
            </tr>
          </thead>
          <tbody>
            {exercice.lignes.map((ligne, index) => (
              <tr key={index}>
                <td>{ligne.valeur}</td>
                <td>{ligne.effectif}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="min-max-mode-min">
            Valeur minimale =
          </label>
          <input
            id="min-max-mode-min"
            className={`text-input${evaluation && evaluation.min !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_MIN}
            value={min}
            onChange={(e) => setMin(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="min-max-mode-max">
            Valeur maximale =
          </label>
          <input
            id="min-max-mode-max"
            className={`text-input${evaluation && evaluation.max !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_MAX}
            value={max}
            onChange={(e) => setMax(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      <p className="field-label">Mode(s)</p>
      <div className="liste-morceaux">
        {modes.map((valeur, index) => (
          <div key={index} className="liste-morceaux-ligne">
            <input
              className={`text-input${evaluation && evaluation.modes !== "correct" ? " is-erronee" : ""}`}
              value={valeur}
              onChange={(e) => modifierMode(index, e.target.value)}
              onKeyDown={gererKeyDownNumerique}
              placeholder={`mode ${index + 1}`}
              aria-label={`Mode ${index + 1}`}
            />
            {modes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer le mode ${index + 1}`} onClick={() => retirerMode(index)}>
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterMode}>
          + Ajouter un mode
        </button>
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={texteAideMinMaxModeNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={texteAideMinMaxModeNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_MIN_MAX_MODE} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_MIN_MAX_MODE)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ min, max, modes })}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}

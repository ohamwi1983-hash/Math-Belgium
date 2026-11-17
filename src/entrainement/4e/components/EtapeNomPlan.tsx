import { useState } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BlocAides, type PropsAides } from "./EtapesDetectiveErreurs";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Écran « Nom du plan » de gen100 : une saisie libre de trois lettres (« (ABG) », « ABG », « a, b,
 * g »… — tout est lu par `verifierNomPlan`), 3 tentatives. Jamais de blocage de frappe (règle
 * CLAUDE.md) : aucun filtre, aucun `inputMode`. Une saisie illisible (pas trois lettres de points de
 * la figure) est signalée sans consommer de tentative. Aucun point affiché.
 */

interface Props extends PropsAides {
  consigne: FragmentConsigne[];
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message de la dernière soumission : illisible (non comptée) ou fausse (comptée). */
  retour: { compte: boolean; message: string } | null;
  onValider: (saisie: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeNomPlan({ consigne, tentativesUtilisees, tentativesMax, retour, onValider, validation, ...aides }: Props) {
  const [saisie, setSaisie] = useState("");
  const fige = !!validation;
  const complet = saisie.trim() !== "";
  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0", maxWidth: 320 }}>
        <span className="field-label" style={{ whiteSpace: "nowrap", margin: 0 }}>
          Plan
        </span>
        <input
          className={`text-input${!fige && retour?.compte ? " is-erronee" : ""}`}
          style={{ flex: 1, minWidth: 0 }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="(ABC)"
          value={saisie}
          disabled={fige}
          onChange={(ev) => setSaisie(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && complet && !fige) onValider(saisie);
          }}
        />
      </label>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Trois lettres de points de la figure, avec ou sans parenthèses ; l'ordre des lettres n'a pas d'importance.
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisie)}>
            Valider
          </button>
          {retour && !retour.compte && (
            <p className="alert-error" role="alert">
              {retour.message} Aucune tentative n'est comptée.
            </p>
          )}
          {retour && retour.compte && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                <p style={{ margin: "6px 0 0" }}>{retour.message}</p>
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

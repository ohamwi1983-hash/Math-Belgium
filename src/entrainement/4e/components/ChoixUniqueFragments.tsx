import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BlocAides, type PropsAides } from "./EtapesDetectiveErreurs";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Choix fermé à UNE tentative (convention du site), options en texte + KaTeX — écrans de gen113
 * (méthode, affirmation sur le nombre de solutions) et gen117 (position de la parabole), gen114
 * (verdict sur le signe des racines). Aucun point affiché. `note` : remarque affichée sous la
 * validation (ex. « juste, mais la racine évidente est plus rapide »).
 */

interface Props<T extends string> extends PropsAides {
  consigne: ReactNode;
  libelleGroupe: string;
  options: { id: T; fragments: FragmentConsigne[] }[];
  /** Réponses acceptées : servent seulement à marquer un mauvais choix une fois l'écran clos. */
  acceptees: T[];
  /** Disposition : `liste` (une option par ligne, texte long) ou `grille` (deux colonnes, libellés courts). */
  disposition?: "liste" | "grille";
  onValider: (id: T) => void;
  validation?: ValidationEtapeProps | null;
  note?: ReactNode;
}

export function ChoixUniqueFragments<T extends string>({ consigne, libelleGroupe, options, acceptees, disposition = "liste", onValider, validation, note, ...aides }: Props<T>) {
  const [choix, setChoix] = useState<T | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div
        style={disposition === "grille" ? { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, margin: "12px 0" } : { display: "grid", gap: 10, margin: "12px 0" }}
        role="group"
        aria-label={libelleGroupe}
      >
        {options.map(({ id, fragments }) => {
          const choisi = choix === id;
          const faux = fige && choisi && !acceptees.includes(id);
          return (
            <button
              key={id}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ textAlign: disposition === "grille" ? "center" : "left", justifyContent: disposition === "grille" ? "center" : "flex-start", whiteSpace: "normal", lineHeight: 1.4, padding: "10px 12px", minHeight: 44, height: "auto" }}
              onClick={() => setChoix(id)}
            >
              <span>
                <RenduFragments fragments={fragments} />
              </span>
            </button>
          );
        })}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
            Valider
          </button>
        </>
      )}
      {validation && note && (
        <p className="field-hint" style={{ margin: "8px 0" }}>
          {note}
        </p>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

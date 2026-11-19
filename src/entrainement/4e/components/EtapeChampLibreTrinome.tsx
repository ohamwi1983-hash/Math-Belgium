import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BlocAides, type PropsAides } from "./EtapesDetectiveErreurs";
import { RenduFragments } from "./RenduFragments";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran à UN champ libre (4e, chapitre 2 : gen113 solutions évidentes, gen114 P, Δ, S, gen117
 * abscisses lues). Jamais de filtre de frappe (règle CLAUDE.md : seule `normaliserSigneMoins`),
 * 3 tentatives ; une saisie illisible ne consomme aucune tentative (l'appelant ne la compte pas).
 */

interface Props extends PropsAides {
  consigne: ReactNode;
  idChamp: string;
  libelle: FragmentConsigne[];
  /** LaTeX avant le champ (« P = », « S = \{ ») ; `null` : aucun. */
  prefixe: string | null;
  suffixe?: string | null;
  aideSaisie: string;
  messageIllisible: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  erronee: boolean;
  messageFaux: string | null;
  illisible: boolean;
  /** Bouton secondaire (« Aucun point d'intersection ») : soumet ce texte. */
  boutonVide?: { libelle: string; texte: string };
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChampLibreTrinome({ consigne, idChamp, libelle, prefixe, suffixe, aideSaisie, messageIllisible, tentativesUtilisees, tentativesMax, erronee, messageFaux, illisible, boutonVide, onValider, validation, ...aides }: Props) {
  const [texte, setTexte] = useState("");
  const fige = !!validation;
  const complet = texte.trim() !== "";
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 6, margin: "12px 0", minWidth: 0 }}>
        <label htmlFor={idChamp} className="field-label field-label-minuscule">
          <RenduFragments fragments={libelle} />
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {prefixe && (
            <span style={{ whiteSpace: "nowrap" }}>
              <Katex expression={prefixe} />
            </span>
          )}
          <input
            id={idChamp}
            className={`text-input${!fige && erronee ? " is-erronee" : ""}`}
            style={{ flex: "1 1 8em", minWidth: 0 }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={texte}
            disabled={fige}
            onChange={(ev) => setTexte(normaliserSigneMoins(ev.target.value))}
          />
          {suffixe && (
            <span style={{ whiteSpace: "nowrap" }}>
              <Katex expression={suffixe} />
            </span>
          )}
        </div>
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {aideSaisie}
          </p>
          <BlocAides {...aides} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(texte)}>
              Valider
            </button>
            {boutonVide && (
              <button type="button" className="btn" onClick={() => onValider(boutonVide.texte)}>
                {boutonVide.libelle}
              </button>
            )}
          </div>
          {illisible && (
            <p className="alert-error" role="alert">
              {messageIllisible} Aucune tentative n'est comptée.
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

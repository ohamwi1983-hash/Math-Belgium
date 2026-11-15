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
 * Écran 3 de gen112 (« Détective d'erreurs : statistique ») : le résultat final corrigé. La copie,
 * l'écran 1 (ligne fausse) et l'écran 2 (description de l'erreur) sont ceux de gen81/gen91/5gen49
 * (`EtapesDetectiveErreurs.tsx`), réutilisés tels quels ; cet écran suit celui de 5gen49.
 *
 * Un seul champ libre (jamais filtré, règle CLAUDE.md : seule `normaliserSigneMoins` est appliquée),
 * 3 tentatives ; une saisie illisible ne consomme aucune tentative. Aucun point affiché.
 */

interface Props extends PropsAides {
  consigne: ReactNode;
  libelle: FragmentConsigne[];
  /** LaTeX avant le champ (« \bar{x} = », « \sigma \approx ») ; `null` : aucun. */
  prefixe: string | null;
  unite: string;
  aideSaisie: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Faux à la dernière tentative comptée (champ souligné). */
  erronee: boolean;
  /** Message propre à la dernière tentative fausse (« c'est le résultat de la copie »). */
  messageFaux: string | null;
  /** La dernière soumission n'a pas été comptée : saisie illisible. */
  illisible: boolean;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeCorrectionDetectiveStatistique({
  consigne,
  libelle,
  prefixe,
  unite,
  aideSaisie,
  tentativesUtilisees,
  tentativesMax,
  erronee,
  messageFaux,
  illisible,
  onValider,
  validation,
  ...aides
}: Props) {
  const [texte, setTexte] = useState("");
  const fige = !!validation;
  const complet = texte.trim() !== "";
  const souligne = !fige && erronee;

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 6, margin: "12px 0", minWidth: 0 }}>
        <label htmlFor="detective-statistique-champ" className="field-label field-label-minuscule">
          <RenduFragments fragments={libelle} />
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
          {prefixe && (
            <span style={{ whiteSpace: "nowrap" }}>
              <Katex expression={prefixe} />
            </span>
          )}
          <input
            id="detective-statistique-champ"
            className={`text-input${souligne ? " is-erronee" : ""}`}
            style={{ flex: "1 1 8em", minWidth: 0 }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={texte}
            disabled={fige}
            onChange={(ev) => setTexte(normaliserSigneMoins(ev.target.value))}
          />
          <span style={{ whiteSpace: "nowrap" }}>{unite}</span>
        </div>
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {aideSaisie}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(texte)}>
            Valider
          </button>
          {illisible && (
            <p className="alert-error" role="alert">
              Écriture non reconnue : écris un nombre (virgule décimale). Aucune tentative n'est comptée.
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

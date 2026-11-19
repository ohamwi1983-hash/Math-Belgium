import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BlocAides, type PropsAides } from "./EtapesDetectiveErreurs";
import { RenduFragments, espacesInsecables } from "./RenduFragments";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran de champs de gen122 « Lire sur le cercle trigonométrique » : un ou deux champs libres
 * précédés de leur nom en KaTeX (« cos θ = », « θ = » … « ° »), et un bouton de verdict facultatif
 * (« tan θ n'est pas définie »), soumis comme une réponse ordinaire (3 tentatives). Jamais de filtre
 * de frappe (seule `normaliserSigneMoins`, aucun `inputMode`) ; une saisie illisible, approchée ou
 * recopiée est signalée sans compter de tentative (l'appli ne la transmet pas au moteur). Le
 * message ciblé et « Incorrect — tentative n/3 » sont dans UN seul `<span>` (`.alert-error` est un
 * conteneur flex).
 */

export interface ChampLecture {
  id: string;
  /** LaTeX avant le champ (« \cos\theta= »). */
  prefixe: string;
  /** LaTeX après le champ (« ^\circ »), facultatif. */
  suffixe?: string;
  /** Nom accessible du champ. */
  nom: string;
}

/** Soumission : les saisies des champs, ou le verdict du bouton secondaire. */
export type SoumissionLecture = { type: "champs"; saisies: string[] } | { type: "verdict" };

interface Props extends PropsAides {
  consigne: ReactNode;
  champs: ChampLecture[];
  aideSaisie: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Champs en rouge après la dernière réponse fausse (null : aucun). */
  champsErrones: boolean[] | null;
  /** Message ciblé de la dernière réponse fausse (null : message générique seul). */
  messageFaux: FragmentConsigne[] | null;
  /** Dernière saisie non transmise (illisible, approchée, recopiée) : message, aucune tentative comptée. */
  messageSansTentative: string | null;
  boutonVerdict?: ReactNode;
  onValider: (s: SoumissionLecture) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeLectureCercle({ consigne, champs, aideSaisie, tentativesUtilisees, tentativesMax, champsErrones, messageFaux, messageSansTentative, boutonVerdict, onValider, validation, ...aides }: Props) {
  const [saisies, setSaisies] = useState<string[]>(() => champs.map(() => ""));
  const fige = !!validation;
  const complet = saisies.every((s) => s.trim() !== "");
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 10, margin: "12px 0", minWidth: 0 }}>
        {champs.map((c, i) => (
          <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ whiteSpace: "nowrap", minWidth: champs.length > 1 ? "4.2em" : undefined }}>
              <Katex expression={c.prefixe} />
            </span>
            <input
              id={c.id}
              aria-label={c.nom}
              className={`text-input${!fige && champsErrones?.[i] ? " is-erronee" : ""}`}
              style={{ flex: "1 1 8em", minWidth: 0 }}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={saisies[i]}
              disabled={fige}
              onChange={(ev) => {
                const v = normaliserSigneMoins(ev.target.value);
                setSaisies((t) => t.map((x, j) => (j === i ? v : x)));
              }}
            />
            {c.suffixe && (
              <span style={{ whiteSpace: "nowrap" }}>
                <Katex expression={c.suffixe} />
              </span>
            )}
          </label>
        ))}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {espacesInsecables(aideSaisie)}
          </p>
          <BlocAides {...aides} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider({ type: "champs", saisies })}>
              Valider
            </button>
            {boutonVerdict && (
              <button type="button" className="btn" style={{ minHeight: 44 }} onClick={() => onValider({ type: "verdict" })}>
                {boutonVerdict}
              </button>
            )}
          </div>
          {messageSansTentative && (
            <p className="alert-error" role="alert">
              {messageSansTentative}
            </p>
          )}
          {!messageSansTentative && tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              <span>
                {messageFaux && messageFaux.length > 0 && (
                  <>
                    <RenduFragments fragments={messageFaux} />{" "}
                  </>
                )}
                Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
                {champs.length > 1 && champsErrones?.some(Boolean) ? " Les champs en rouge sont à revoir." : ""}
              </span>
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

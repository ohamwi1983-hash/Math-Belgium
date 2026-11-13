import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { NatureQuadrilatere } from "../core/natureQuadrilatere.types";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { OPTIONS_NATURE } from "../ui/formatNatureQuadrilatere";

/**
 * Écrans de gen84 (« Nature d'un quadrilatère ») : écrans de champs libres (composantes,
 * coordonnées, normes, critère — 3 tentatives, saisie jamais bloquée : seule `normaliserSigneMoins`
 * est appliquée, règle CLAUDE.md) et écran de conclusion (choix fermé, UNE tentative). Aucun point.
 * Même disposition des champs que gen25 (`field-row-groupe` / `field-row`, étiquettes `x_{AB} =`).
 */

interface PropsAides {
  aides: FragmentConsigne[][];
  niveauAide: number;
  onActiverAide: () => void;
}

function BlocAides({ aides, niveauAide, onActiverAide }: PropsAides) {
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={aide} />
          </p>
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écrans 1 à 3 — champs libres
// ---------------------------------------------------------------------------------------------

export interface SpecChamp {
  id: string;
  /** Étiquette KaTeX (ex. `x_{AB} =`). */
  etiquette: string;
  placeholder: string;
}

interface PropsChamps extends PropsAides {
  consigne: ReactNode;
  /** Champs groupés par ligne (deux par ligne au plus : tient à 390 px). */
  lignes: SpecChamp[][];
  indication: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Champs faux à la dernière tentative (par id), `null` avant la première. */
  champsFaux: Set<string> | null;
  /** Erreurs reconnues à la dernière tentative (messages ciblés, jamais la réponse). */
  messages: FragmentConsigne[][];
  /** Une saisie illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  onValider: (valeurs: Record<string, string>) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChampsNatureQuadrilatere({ consigne, lignes, indication, tentativesUtilisees, tentativesMax, champsFaux, messages, erreurLecture, onValider, validation, ...aides }: PropsChamps) {
  const [valeurs, setValeurs] = useState<Record<string, string>>(() => Object.fromEntries(lignes.flat().map((c) => [c.id, ""])));
  const fige = !!validation;
  const complet = lignes.flat().every((c) => (valeurs[c.id] ?? "").trim() !== "");

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="field-row-groupe">
        {lignes.map((ligne, i) => (
          <div key={i} className="field-row">
            {ligne.map((c) => (
              <div className="field" key={c.id}>
                <label className="field-label field-label-minuscule" htmlFor={`nq-${c.id}`}>
                  <Katex expression={c.etiquette} />
                </label>
                <input
                  id={`nq-${c.id}`}
                  className={`text-input${!fige && champsFaux?.has(c.id) ? " is-erronee" : ""}`}
                  placeholder={c.placeholder}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={valeurs[c.id] ?? ""}
                  disabled={fige}
                  onChange={(ev) => {
                    const v = normaliserSigneMoins(ev.target.value);
                    setValeurs((s) => ({ ...s, [c.id]: v }));
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 8 }}>
            {indication}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(valeurs)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : écris un nombre entier, une fraction comme 5/2 ou une racine comme rac(13). Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {messages.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
                    {messages.map((m, i) => (
                      <li key={i}>
                        <RenduFragments fragments={m} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 4 — conclusion (choix fermé, une tentative)
// ---------------------------------------------------------------------------------------------

interface PropsConclusion extends PropsAides {
  consigne: ReactNode;
  /** Résultats des trois tests (valeurs seules, sans verdict), en KaTeX. */
  recapitulatif: string[];
  attendu: NatureQuadrilatere;
  onValider: (choix: NatureQuadrilatere) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeConclusionNatureQuadrilatere({ consigne, recapitulatif, attendu, onValider, validation, ...aides }: PropsConclusion) {
  const [choix, setChoix] = useState<NatureQuadrilatere | null>(null);
  const fige = !!validation;
  return (
    <div>
      <div className="triangle-quelconque-aide" style={{ marginTop: 0, marginBottom: 14 }}>
        <p style={{ margin: "0 0 4px" }}>Tes résultats :</p>
        <ul style={{ margin: 0, paddingLeft: "1.2em", display: "grid", gap: 4 }}>
          {recapitulatif.map((l, i) => (
            <li key={i}>
              <Katex expression={l} />
            </li>
          ))}
        </ul>
      </div>
      <p className="prompt-text">{consigne}</p>
      <div className="options-grid" style={{ margin: "12px 0" }}>
        {OPTIONS_NATURE.map((o) => {
          const choisi = choix === o.valeur;
          const faux = fige && choisi && o.valeur !== attendu;
          return (
            <button
              key={o.valeur}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              onClick={() => setChoix(o.valeur)}
            >
              {o.libelle}
            </button>
          );
        })}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix && onValider(choix)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

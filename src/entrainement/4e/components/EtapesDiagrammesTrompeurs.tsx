import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { StatutVerification } from "../moteur/statutVerification";
import type { EcranChamps } from "../ui/formatDiagrammesTrompeurs";
import { BlocAides, type PropsAides } from "./EtapesDetectiveErreurs";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran à champs de gen111 (« Diagrammes et graphiques trompeurs ») : un tableau (une ligne par
 * catégorie ou valeur, colonnes données puis saisie — même tableau `tf-table` que gen30) ou une
 * courte liste de champs. Champs libres jamais filtrés (règle CLAUDE.md), 3 tentatives ; une saisie
 * illisible ne consomme aucune tentative. L'écran « choix » (la manipulation) est
 * `EtapeChoixDiagrammes`, plus bas. Aucun point affiché.
 */

interface Props extends PropsAides {
  ecran: EcranChamps;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative, `null` avant la première. */
  statuts: StatutVerification[] | null;
  erreurLecture: boolean;
  onValider: (saisies: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

function Unite({ unite }: { unite: string }) {
  if (!unite) return null;
  return <span style={{ whiteSpace: "nowrap" }}>{unite}</span>;
}

interface PropsChoix<T extends string> extends PropsAides {
  consigne: ReactNode;
  options: { id: T; fragments: FragmentConsigne[] }[];
  attendue: T;
  /** Explication montrée une fois l'écran clos (juste ou révélé), AVANT le bouton « Écran suivant ». */
  explication: FragmentConsigne[];
  onValider: (id: T) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran « choix fermé » (la manipulation) : UNE tentative, puis l'explication. */
export function EtapeChoixDiagrammes<T extends string>({ consigne, options, attendue, explication, onValider, validation, ...aides }: PropsChoix<T>) {
  const [choix, setChoix] = useState<T | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 10, margin: "12px 0" }} role="group" aria-label="Manipulation">
        {options.map(({ id, fragments }) => {
          const choisi = choix === id;
          const faux = fige && choisi && attendue !== id;
          return (
            <button
              key={id}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.5, padding: "10px 14px", minHeight: 44, height: "auto" }}
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
      {validation && (
        <>
          <div className="triangle-quelconque-aide">
            <p>
              <RenduFragments fragments={explication} />
            </p>
          </div>
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}

export function EtapeChampsDiagrammes({ ecran, tentativesUtilisees, tentativesMax, statuts, erreurLecture, onValider, validation, ...aides }: Props) {
  const [saisies, setSaisies] = useState<string[]>(() => ecran.champs.map(() => ""));
  const fige = !!validation;
  const complet = saisies.every((s) => s.trim() !== "");
  const faux = statuts ? ecran.champs.map((c, i) => ({ c, i })).filter(({ i }) => statuts[i] !== "correct") : [];

  function modifier(i: number, v: string) {
    setSaisies((avant) => avant.map((x, j) => (j === i ? v : x)));
  }

  function champ(i: number, etiquette: string): ReactNode {
    const erronee = !fige && statuts !== null && statuts[i] !== "correct";
    return (
      <input
        className={`text-input${erronee ? " is-erronee" : ""}`}
        style={{ width: ecran.disposition === "tableau" ? "4.6em" : "6em", minWidth: 0, textAlign: "center" }}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label={etiquette}
        value={saisies[i]}
        disabled={fige}
        onChange={(ev) => modifier(i, normaliserSigneMoins(ev.target.value))}
      />
    );
  }

  const texteLibelle = (i: number) => ecran.champs[i]!.libelle.map((f) => f.valeur).join("");

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={ecran.consigne} />
      </p>
      {ecran.disposition === "tableau" ? (
        <div className="tf-table-scroll">
          <table className="tf-table">
            <thead>
              <tr>
                {ecran.entetes.map((entete, j) => (
                  <th key={j}>
                    <RenduFragments fragments={entete} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ecran.champs.map((c, i) => (
                <tr key={i}>
                  <td>
                    <RenduFragments fragments={c.libelle} />
                  </td>
                  {c.cellules.map((cellule, j) => (
                    <td key={j}>{cellule}</td>
                  ))}
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {champ(i, `${ecran.titre} — ${texteLibelle(i)}`)}
                      <Unite unite={c.unite === "%" || c.unite === "°" ? "" : c.unite} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, margin: "12px 0" }}>
          {ecran.champs.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>
                <RenduFragments fragments={c.libelle} />
              </span>
              {champ(i, texteLibelle(i))}
              <Unite unite={c.unite} />
            </div>
          ))}
        </div>
      )}
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {ecran.aideSaisie}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : écris un nombre. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {ecran.champs.length > 1 && faux.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
                    {faux.map(({ c, i }) => (
                      <li key={i}>{c.aRevoir}</li>
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

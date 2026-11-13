import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { IdDescription } from "../core/detectiveErreurs.types";
import type { LibelleChamp } from "../ui/formatDetectiveErreurs";
import type { StatutChamp } from "../moteur/verificationDetectiveErreurs";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écrans de gen81 (« Le détective d'erreurs ») : la copie fictive, le choix de la ligne fausse et
 * celui de la description (choix fermés, UNE tentative), puis la correction (champs libres — jamais
 * de blocage de frappe, règle CLAUDE.md —, 3 tentatives). Aucun point affiché.
 */

// ---------------------------------------------------------------------------------------------
// La copie
// ---------------------------------------------------------------------------------------------

interface PropsCopie {
  lignes: FragmentConsigne[][];
  /** Ligne à souligner (une fois l'écran 1 clos), sinon `null` : rien n'est marqué avant. */
  ligneSignalee: number | null;
}

/**
 * Copie de l'élève fictif : lignes numérotées, marge rouge et réglure discrète. Une formule longue
 * défile dans sa ligne (jamais la page, à 390 px).
 */
export function CopieEleve({ lignes, ligneSignalee }: PropsCopie) {
  return (
    <ol
      aria-label="Copie de l'élève"
      style={{
        listStyle: "none",
        margin: "10px 0 0",
        padding: 0,
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        overflow: "hidden",
      }}
    >
      {lignes.map((fragments, i) => {
        const signalee = ligneSignalee === i;
        return (
          <li
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "2.4em minmax(0, 1fr)",
              alignItems: "baseline",
              borderTop: i === 0 ? "none" : "1px dashed var(--color-border)",
              background: signalee ? "var(--color-error-bg)" : undefined,
            }}
          >
            <span
              style={{
                padding: "10px 6px 10px 0",
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                fontWeight: signalee ? 700 : 400,
                color: signalee ? "var(--color-error)" : "var(--color-text-muted)",
                borderRight: "2px solid var(--color-error)",
                alignSelf: "stretch",
              }}
            >
              {i + 1}
            </span>
            <div style={{ overflowX: "auto", overflowY: "hidden", padding: "10px 12px", lineHeight: 1.7 }}>
              <RenduFragments fragments={fragments} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

export interface PropsAides {
  aides: FragmentConsigne[][];
  niveauAide: number;
  onActiverAide: () => void;
}

/** Aides progressives (partagé avec gen91, « Le détective d'erreurs vectoriel »). */
export function BlocAides({ aides, niveauAide, onActiverAide }: PropsAides) {
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
// Écran 1 — la ligne fausse
// ---------------------------------------------------------------------------------------------

interface PropsLigne extends PropsAides {
  consigne: ReactNode;
  nombreLignes: number;
  /** Ligne fausse : sert seulement à marquer un mauvais choix une fois l'écran clos. */
  attendue: number;
  onValider: (indice: number) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeLigneFausse({ consigne, nombreLignes, attendue, onValider, validation, ...aides }: PropsLigne) {
  const [choix, setChoix] = useState<number | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 10, margin: "12px 0" }} role="group" aria-label="Numéro de la ligne fausse">
        {Array.from({ length: nombreLignes }, (_, i) => {
          const choisi = choix === i;
          const faux = fige && choisi && attendue !== i;
          return (
            <button
              key={i}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ minHeight: 44 }}
              onClick={() => setChoix(i)}
            >
              {`Ligne ${i + 1}`}
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
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 2 — l'erreur
// ---------------------------------------------------------------------------------------------

interface PropsDescription<T extends string> extends PropsAides {
  consigne: ReactNode;
  options: { id: T; fragments: FragmentConsigne[] }[];
  attendue: T;
  onValider: (id: T) => void;
  validation?: ValidationEtapeProps | null;
}

/** Générique sur l'identifiant de description : gen81 (`IdDescription`) et gen91 le partagent. */
export function EtapeDescriptionErreur<T extends string = IdDescription>({ consigne, options, attendue, onValider, validation, ...aides }: PropsDescription<T>) {
  const [choix, setChoix] = useState<T | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 10, margin: "12px 0" }} role="group" aria-label="Description de l'erreur">
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
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 3 — la correction
// ---------------------------------------------------------------------------------------------

interface PropsCorrection extends PropsAides {
  consigne: ReactNode;
  champs: LibelleChamp[];
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative, `null` avant la première. */
  statuts: StatutChamp[] | null;
  /** Une saisie illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  onValider: (saisies: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeCorrectionCopie({ consigne, champs, tentativesUtilisees, tentativesMax, statuts, erreurLecture, onValider, validation, ...aides }: PropsCorrection) {
  const [saisies, setSaisies] = useState<string[]>(() => champs.map(() => ""));
  const fige = !!validation;
  const complet = saisies.every((s) => s.trim() !== "");
  const faux = statuts ? statuts.map((s, i) => ({ s, i })).filter(({ s }) => s !== "correct") : [];
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 14, margin: "12px 0" }}>
        {champs.map((champ, i) => {
          const erronee = !fige && statuts !== null && statuts[i] !== "correct";
          return (
            <div key={i} style={{ display: "grid", gap: 6 }}>
              <label htmlFor={`detective-champ-${i}`} className="field-label field-label-minuscule">
                <RenduFragments fragments={champ.libelle} />
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <Katex expression={`${champ.quantite} \\approx`} />
                </span>
                <input
                  id={`detective-champ-${i}`}
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  style={{ flex: 1, minWidth: 0 }}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={saisies[i]}
                  disabled={fige}
                  onChange={(ev) => {
                    const v = normaliserSigneMoins(ev.target.value);
                    setSaisies((s) => s.map((x, j) => (j === i ? v : x)));
                  }}
                />
                {champ.unite && <span style={{ whiteSpace: "nowrap" }}>{champ.unite}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Écris un nombre décimal, avec une virgule (par exemple 12,35).
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : écris un nombre décimal. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {champs.length > 1 && faux.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
                    {faux.map(({ i }) => (
                      <li key={i}>
                        La valeur de <Katex expression={champs[i]!.quantite} /> est à revoir.
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

import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écrans de gen82 (« Décomposer un vecteur selon deux directions ») : choix fermé (point M,
 * système, verdict — UNE tentative) et champs libres (coefficients, composantes, k — jamais de
 * blocage de frappe, règle CLAUDE.md : seule `normaliserSigneMoins` transforme la saisie). Aucun
 * point affiché.
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
// Choix fermé
// ---------------------------------------------------------------------------------------------

export interface OptionChoix {
  id: string;
  rendu: ReactNode;
  /** Libellé accessible (le rendu peut être une formule KaTeX). */
  label: string;
}

interface PropsChoix extends PropsAides {
  consigne: ReactNode;
  options: OptionChoix[];
  /** Option correcte : sert seulement à marquer un choix faux une fois l'écran clos. */
  attendu: string;
  /** Options en colonne (formules longues) plutôt qu'en grille. */
  colonne?: boolean;
  onValider: (choix: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixDecomposition({ consigne, options, attendu, colonne, onValider, validation, ...aides }: PropsChoix) {
  const [choix, setChoix] = useState<string | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className={colonne ? undefined : "options-grid"} style={colonne ? { display: "grid", gap: 8, margin: "12px 0" } : { margin: "12px 0" }}>
        {options.map((o) => {
          const choisi = choix === o.id;
          const faux = fige && choisi && o.id !== attendu;
          return (
            <button
              key={o.id}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              aria-label={o.label}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={colonne ? { minHeight: 56, justifyContent: "center" } : undefined}
              onClick={() => setChoix(o.id)}
            >
              {o.rendu}
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

// ---------------------------------------------------------------------------------------------
// Champs libres
// ---------------------------------------------------------------------------------------------

export interface GroupeChamps {
  /** Libellé KaTeX/texte devant le groupe (« a = », « 3v = »). */
  label: FragmentConsigne[];
  /** 1 : un nombre ; 2 : deux composantes, écrites entre parenthèses et séparées par « ; ». */
  n: 1 | 2;
}

interface PropsChamps extends PropsAides {
  consigne: ReactNode;
  groupes: GroupeChamps[];
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Champs faux à la dernière tentative (un booléen par champ), `null` avant la première. */
  erronees: boolean[] | null;
  /** Message ciblé de la dernière tentative fausse, ou `null`. */
  message: FragmentConsigne[] | null;
  /** Saisie illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  onValider: (textes: string[]) => void;
  validation?: ValidationEtapeProps | null;
  /** Conclusion affichée une fois l'écran clos (juste ou révélé), ex. la combinaison complète. */
  conclusion?: FragmentConsigne[];
}

export function EtapeChampsDecomposition({ consigne, groupes, tentativesUtilisees, tentativesMax, erronees, message, erreurLecture, onValider, validation, conclusion, ...aides }: PropsChamps) {
  const total = groupes.reduce((s, g) => s + g.n, 0);
  const [textes, setTextes] = useState<string[]>(() => Array.from({ length: total }, () => ""));
  const fige = !!validation;
  const complet = textes.every((t) => t.trim() !== "");
  const valider = () => complet && !fige && onValider(textes);

  let index = 0;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 10, margin: "12px 0" }}>
        {groupes.map((g, gi) => {
          const indices = Array.from({ length: g.n }, () => index++);
          const champ = (k: number, pos: string) => (
            <input
              key={k}
              id={`decomposition-champ-${k}`}
              className={`text-input${!fige && erronees?.[k] ? " is-erronee" : ""}`}
              style={{ flex: 1, minWidth: 0, maxWidth: g.n === 1 ? 160 : 110, textAlign: "center" }}
              aria-label={g.n === 1 ? "Valeur" : `${pos} composante`}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={textes[k]}
              disabled={fige}
              onChange={(ev) => {
                const v = normaliserSigneMoins(ev.target.value);
                setTextes((t) => t.map((x, j) => (j === k ? v : x)));
              }}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") valider();
              }}
            />
          );
          return (
            <div key={gi} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
              <span className="field-label field-label-minuscule" style={{ margin: 0, whiteSpace: "nowrap" }}>
                <RenduFragments fragments={g.label} />
              </span>
              {g.n === 1 ? (
                champ(indices[0]!, "")
              ) : (
                <>
                  <span style={{ fontSize: "1.4em" }}>(</span>
                  {champ(indices[0]!, "1re")}
                  <span style={{ fontSize: "1.2em" }}>;</span>
                  {champ(indices[1]!, "2e")}
                  <span style={{ fontSize: "1.4em" }}>)</span>
                </>
              )}
            </div>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Un entier, un décimal (0,5) ou une fraction (3/2).
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Valeur illisible : écris un nombre, par exemple −2, 0,5 ou 3/2. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {message && (
                  <p style={{ margin: "6px 0 0" }}>
                    <RenduFragments fragments={message} />
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {validation && conclusion && (
        <div className="validation-reponse-attendue">
          <p className="validation-reponse-attendue-label">Conclusion :</p>
          <RenduFragments fragments={conclusion} />
        </div>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

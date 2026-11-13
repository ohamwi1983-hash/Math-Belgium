import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { RoleElement } from "../core/texteTriangle.types";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutChamp } from "../moteur/verificationTexteTriangle";
import { ROLES } from "../ui/formatTexteTriangle";

/**
 * Écrans de gen77 (« Du texte au triangle ») : appariement des éléments du triangle (choix fermé,
 * UNE tentative), choix fermé parmi des options (loi, phrase-réponse, configuration, position
 * retenue — UNE tentative), champs numériques (angles intérieurs, calcul, angles candidats,
 * distances — 3 tentatives, jamais de blocage de frappe). Aucun point affiché.
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
// Écran 1 (situations standard) — rôle de chaque élément du triangle
// ---------------------------------------------------------------------------------------------

interface PropsRoles extends PropsAides {
  consigne: ReactNode;
  elements: { latex: string; role: RoleElement }[];
  onValider: (choix: RoleElement[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeRolesTexteTriangle({ consigne, elements, onValider, validation, ...aides }: PropsRoles) {
  const [choix, setChoix] = useState<(RoleElement | null)[]>(() => elements.map(() => null));
  const fige = !!validation;
  const complet = choix.every((c) => c !== null);
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 10, margin: "12px 0" }}>
        {elements.map((el, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ minWidth: 64, fontSize: "1.1em" }}>
              <Katex expression={el.latex} />
            </span>
            <div style={{ display: "flex", gap: 6, flex: "1 1 220px" }}>
              {ROLES.map((r) => {
                const choisi = choix[i] === r.id;
                const faux = fige && choisi && el.role !== r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={fige}
                    aria-pressed={choisi}
                    className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
                    style={{ flex: 1, minHeight: 44, padding: "6px 4px", fontSize: "0.9em" }}
                    onClick={() => setChoix((c) => c.map((x, j) => (j === i ? r.id : x)))}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(choix as RoleElement[])}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Choix fermé parmi des options
// ---------------------------------------------------------------------------------------------

interface PropsChoix extends PropsAides {
  consigne: ReactNode;
  options: FragmentConsigne[][];
  /** Indice correct : sert seulement à marquer l'erreur une fois l'écran clos. */
  indexCorrect: number;
  onValider: (index: number) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixTexteTriangle({ consigne, options, indexCorrect, onValider, validation, ...aides }: PropsChoix) {
  const [choix, setChoix] = useState<number | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, margin: "12px 0" }}>
        {options.map((fragments, i) => {
          const choisi = choix === i;
          const faux = fige && choisi && i !== indexCorrect;
          return (
            <button
              key={i}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ textAlign: "left", justifyContent: "flex-start", minHeight: 44, whiteSpace: "normal", lineHeight: 1.4 }}
              onClick={() => setChoix(i)}
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
// Champs numériques
// ---------------------------------------------------------------------------------------------

export interface ChampNumerique {
  libelle: FragmentConsigne[];
  unite: string;
}

interface PropsChamps extends PropsAides {
  consigne: ReactNode;
  champs: ChampNumerique[];
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative, `null` avant la première. */
  statuts: StatutChamp[] | null;
  erreurLecture: boolean;
  onValider: (saisies: string[]) => void;
  validation?: ValidationEtapeProps | null;
  idBase: string;
}

export function EtapeChampsTexteTriangle({ consigne, champs, tentativesUtilisees, tentativesMax, statuts, erreurLecture, onValider, validation, idBase, ...aides }: PropsChamps) {
  const [saisies, setSaisies] = useState<string[]>(() => champs.map(() => ""));
  const fige = !!validation;
  const complet = saisies.every((s) => s.trim() !== "");
  const fausses = statuts ? statuts.map((s, i) => ({ s, i })).filter(({ s }) => s !== "correct") : [];
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 12, margin: "12px 0" }}>
        {champs.map((champ, i) => {
          const erronee = !fige && statuts !== null && statuts[i] !== "correct";
          return (
            <div key={i} className="field" style={{ marginBottom: 0 }}>
              <label className="field-label field-label-minuscule" htmlFor={`${idBase}-${i}`}>
                <RenduFragments fragments={champ.libelle} />
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  id={`${idBase}-${i}`}
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  style={{ flex: 1, minWidth: 0 }}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={saisies[i]}
                  disabled={fige}
                  onChange={(ev) => {
                    const valeur = normaliserSigneMoins(ev.target.value);
                    setSaisies((s) => s.map((x, j) => (j === i ? valeur : x)));
                  }}
                />
                <span style={{ minWidth: 28, color: "var(--color-text-muted)" }}>{champ.unite}</span>
              </div>
            </div>
          );
        })}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : écris un nombre, par exemple 23,5. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {champs.length > 1 && fausses.length > 0 && fausses.length < champs.length && (
                  <p style={{ margin: "6px 0 0" }}>{`${fausses.length === 1 ? "Valeur à revoir" : "Valeurs à revoir"} : ${fausses.map(({ i }) => `n° ${i + 1}`).join(", ")}.`}</p>
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

import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { LibelleChamp, OptionChoix } from "../ui/formatCasAmbigu";
import type { StatutChampCasAmbigu } from "../moteur/verificationCasAmbigu";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écrans de gen74 (« Cas ambigu : 0, 1 ou 2 triangles ? ») : choix fermé (UNE tentative) et champs
 * numériques (3 tentatives, jamais de blocage de frappe — règle CLAUDE.md : pas de filtre, pas
 * d'`inputMode` numérique, seule `normaliserSigneMoins` est appliquée). Aucun point affiché.
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

interface PropsChoix extends PropsAides {
  consigne: ReactNode;
  options: OptionChoix[];
  /** Option correcte : sert seulement à marquer l'erreur une fois l'écran clos. */
  attendu: string;
  onValider: (choix: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixCasAmbigu({ consigne, options, attendu, onValider, validation, ...aides }: PropsChoix) {
  const [choix, setChoix] = useState<string | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div role="radiogroup" style={{ display: "grid", gap: 10, margin: "12px 0" }}>
        {options.map((o) => {
          const choisi = choix === o.id;
          const faux = fige && choisi && o.id !== attendu;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={choisi}
              disabled={fige}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ textAlign: "left", justifyContent: "flex-start", minHeight: 44, whiteSpace: "normal", lineHeight: 1.4 }}
              onClick={() => setChoix(o.id)}
            >
              <span>
                <RenduFragments fragments={o.fragments} />
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

interface PropsChamps extends PropsAides {
  consigne: ReactNode;
  champs: LibelleChamp[];
  /** Préfixe des id des champs (unique par écran). */
  idBase: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative (un par champ), `null` avant la première. */
  statuts: StatutChampCasAmbigu[] | null;
  /** Une saisie illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  /** Champs groupés deux par deux (écran des candidats : B̂ puis Â + B̂). */
  parPaires?: boolean;
  onValider: (saisies: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChampsCasAmbigu({ consigne, champs, idBase, tentativesUtilisees, tentativesMax, statuts, erreurLecture, parPaires, onValider, validation, ...aides }: PropsChamps) {
  const [saisies, setSaisies] = useState<string[]>(() => champs.map(() => ""));
  const fige = !!validation;
  const complet = saisies.every((s) => s.trim() !== "");
  const groupes = parPaires ? champs.map((_, i) => i).filter((i) => i % 2 === 0).map((i) => [i, i + 1]) : champs.map((_, i) => [i]);
  const fauxRestants = statuts ? statuts.filter((s) => s !== "correct").length : 0;

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 14, margin: "12px 0" }}>
        {groupes.map((groupe, g) => (
          <div key={g} style={parPaires ? { display: "grid", gap: 8, padding: "10px 12px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" } : { display: "contents" }}>
            {groupe.map((i) => {
              const champ = champs[i]!;
              const erronee = !fige && statuts !== null && statuts[i] !== "correct";
              return (
                <div key={i} style={{ display: "grid", gap: 6 }}>
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
                    {champ.suffixe && <span style={{ minWidth: 24 }}>{champ.suffixe}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Écris un nombre décimal, avec une virgule (par exemple 0,731 ou 53,1).
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : écris un nombre décimal, par exemple 0,731. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}
              {champs.length > 1 && fauxRestants > 0 ? ` ${fauxRestants === 1 ? "Une valeur est" : `${fauxRestants} valeurs sont`} à revoir (encadrée${fauxRestants === 1 ? "" : "s"} en rouge).` : ""}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

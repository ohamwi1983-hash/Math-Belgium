import { useState } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Champ } from "../ui/formatChantierTerrains";
import type { StatutChamp } from "../moteur/verificationChantierTerrains";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écrans de gen88 (« Chantier et terrains ») : choix fermé (UNE tentative) et champs libres
 * (3 tentatives, jamais de blocage de frappe — règle CLAUDE.md —, seule `normaliserSigneMoins`).
 * Aucun point affiché.
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
  consigne: FragmentConsigne[];
  options: FragmentConsigne[][];
  onValider: (indice: number) => void;
  validation?: ValidationEtapeProps | null;
  /** Indice de la bonne option : sert seulement à marquer l'erreur une fois l'écran clos. */
  bonne: number;
}

export function EtapeChoixChantier({ consigne, options, onValider, validation, bonne, ...aides }: PropsChoix) {
  const [choix, setChoix] = useState<number | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <div style={{ display: "grid", gap: 8, margin: "12px 0" }}>
        {options.map((option, i) => {
          const choisi = choix === i;
          const faux = fige && choisi && i !== bonne;
          return (
            <button
              key={i}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.4, minHeight: 44 }}
              onClick={() => setChoix(i)}
            >
              <span>
                <RenduFragments fragments={option} />
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
// Champs libres
// ---------------------------------------------------------------------------------------------

interface PropsChamps extends PropsAides {
  consigne: FragmentConsigne[];
  champs: Champ[];
  indication: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative comptée (`null` avant la première). */
  statuts: StatutChamp[] | null;
  /** Une saisie illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  onValider: (saisies: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

function messageStatut(champ: Champ, statut: StatutChamp): string | null {
  if (statut === "signe") return "c'est l'opposé : respecte l'ordre des vecteurs dans la formule";
  if (statut === "faux") return champ.attendu.type === "equation" ? "cette équation ne traduit pas l'alignement" : "valeur à revoir";
  return null;
}

export function EtapeChampsChantier({ consigne, champs, indication, tentativesUtilisees, tentativesMax, statuts, erreurLecture, onValider, validation, ...aides }: PropsChamps) {
  const [saisies, setSaisies] = useState<string[]>(() => champs.map(() => ""));
  const fige = !!validation;
  const complet = saisies.every((s) => s.trim() !== "");
  const deuxColonnes = champs.length > 1 && champs.every((c) => c.attendu.type === "valeur");
  const fautes = statuts ? statuts.map((s, i) => ({ s, i })).filter(({ s }) => s !== "correct") : [];

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <div style={{ display: "grid", gridTemplateColumns: deuxColonnes ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)", gap: "10px 14px", margin: "12px 0" }}>
        {champs.map((champ, i) => {
          const erronee = !fige && statuts !== null && statuts[i] !== "correct";
          return (
            <label key={champ.id} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span className="field-label field-label-minuscule" style={{ whiteSpace: "nowrap", margin: 0 }}>
                <RenduFragments fragments={champ.libelle} />
              </span>
              <input
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
            </label>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {indication}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une saisie n'est pas lisible : écris un nombre, une fraction comme 7/2{champs.some((c) => c.attendu.type === "equation" || (c.attendu.type === "valeur" && c.attendu.lettre)) ? " ou une expression avec la lettre de l'inconnue" : ""}. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {fautes.some(({ s, i }) => messageStatut(champs[i]!, s) && (champs.length === 1 || s === "signe")) && (
                  <p style={{ margin: "6px 0 0" }}>
                    {fautes
                      .map(({ s, i }) => messageStatut(champs[i]!, s))
                      .filter((m): m is string => m !== null)
                      .slice(0, 1)
                      .map((m) => m.charAt(0).toUpperCase() + m.slice(1) + ".")}
                  </p>
                )}
                {champs.length > 1 && fautes.length > 0 && <p style={{ margin: "6px 0 0" }}>Les champs en rouge sont à revoir.</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

import { useState } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { messageFragments, type Champ } from "../ui/formatTransformationDonnees";
import type { StatutChamp } from "../moteur/verificationTransformationDonnees";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écrans de gen108 (« Effet d'une transformation des données ») : choix fermé (UNE tentative) et
 * champs numériques libres (3 tentatives, jamais de blocage de frappe — règle CLAUDE.md —, seule
 * `normaliserSigneMoins`, aucun `inputMode`). L'unité du contexte est affichée après chaque champ.
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

export function EtapeChoixTransformation({ consigne, options, onValider, validation, bonne, ...aides }: PropsChoix) {
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
// Champs numériques
// ---------------------------------------------------------------------------------------------

interface PropsChamps extends PropsAides {
  consigne: FragmentConsigne[];
  champs: Champ[];
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative comptée (`null` avant la première). */
  statuts: StatutChamp[] | null;
  /** Dernière soumission non comptée : saisie illisible ou valeur seulement arrondie. */
  nonComptee: "lecture" | "arrondi" | null;
  onValider: (saisies: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChampsTransformation({ consigne, champs, tentativesUtilisees, tentativesMax, statuts, nonComptee, onValider, validation, ...aides }: PropsChamps) {
  const [saisies, setSaisies] = useState<string[]>(() => champs.map(() => ""));
  const fige = !!validation;
  const complet = saisies.every((s) => s.trim() !== "");
  const message = statuts?.find((s) => s.etat !== "correct" && s.message)?.message;
  const fautes = statuts ? statuts.filter((s) => s.etat !== "correct").length : 0;

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <div style={{ display: "grid", gap: "10px", margin: "12px 0", maxWidth: 420 }}>
        {champs.map((champ, i) => {
          const erronee = !fige && statuts !== null && statuts[i]!.etat !== "correct";
          return (
            <label key={champ.id} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span className="field-label field-label-minuscule" style={{ whiteSpace: "nowrap", margin: 0, minWidth: champs.length > 2 ? 132 : 0 }}>
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
              {champ.unite && <span style={{ whiteSpace: "nowrap", minWidth: 44 }}>{champ.unite}</span>}
            </label>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {champs.some((c) => c.unite) ? "Un nombre exact, avec la virgule décimale (par exemple 1905,5) ; l'unité est déjà écrite." : "Un nombre exact, avec la virgule décimale (par exemple 1,05 ou −2)."}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {nonComptee === "lecture" && (
            <p className="alert-error" role="alert">
              Une saisie n'est pas lisible : écris seulement un nombre, comme 1905,5 ou −2. Aucune tentative n'est comptée.
            </p>
          )}
          {nonComptee === "arrondi" && (
            <p className="alert-error" role="alert">
              Une valeur est arrondie : donne la valeur exacte, avec toutes ses décimales (aucun arrondi n'est nécessaire). Aucune tentative n'est comptée.
            </p>
          )}
          {nonComptee === null && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {message && (
                  <p style={{ margin: "6px 0 0" }}>
                    <RenduFragments fragments={messageFragments(message)} />
                  </p>
                )}
                {champs.length > 1 && fautes > 0 && <p style={{ margin: "6px 0 0" }}>Les champs en rouge sont à revoir.</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

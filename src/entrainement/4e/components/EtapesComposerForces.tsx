import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { NomTriangle, UniteComposerForces } from "../core/composerForces.types";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { libelleTriangle, OPTIONS_UNITE } from "../ui/formatComposerForces";

/**
 * Écrans de gen80 (« Composer deux forces ou deux vitesses ») : choix du triangle à résoudre (choix
 * fermé, UNE tentative) et saisie d'une valeur (angle, ou intensité avec son unité — champ libre,
 * jamais de blocage de frappe, règle CLAUDE.md). Aucun point affiché.
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
// Écran 1 — le triangle à résoudre
// ---------------------------------------------------------------------------------------------

interface PropsTriangle extends PropsAides {
  consigne: ReactNode;
  options: NomTriangle[];
  /** Triangle correct : sert seulement à marquer un choix faux une fois l'écran clos. */
  attendu: NomTriangle;
  onValider: (choix: NomTriangle) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixTriangle({ consigne, options, attendu, onValider, validation, ...aides }: PropsTriangle) {
  const [choix, setChoix] = useState<NomTriangle | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="options-grid" style={{ margin: "12px 0" }}>
        {options.map((t) => {
          const choisi = choix === t;
          const faux = fige && choisi && t !== attendu;
          return (
            <button
              key={t}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              onClick={() => setChoix(t)}
            >
              {libelleTriangle(t)}
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
// Écrans de saisie — un angle, ou une intensité avec son unité
// ---------------------------------------------------------------------------------------------

interface PropsSaisie extends PropsAides {
  consigne: ReactNode;
  libelle: FragmentConsigne[];
  placeholder: string;
  /** Écran d'intensité : menu d'unité, sans valeur présélectionnée. */
  avecUnite: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message ciblé de la dernière tentative fausse (θ au lieu de 180° − θ, radians…), ou `null`. */
  messageErreur: string | null;
  /** Saisie illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  onValider: (texte: string, unite: UniteComposerForces | null) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeSaisieComposerForces({
  consigne,
  libelle,
  placeholder,
  avecUnite,
  tentativesUtilisees,
  tentativesMax,
  messageErreur,
  erreurLecture,
  onValider,
  validation,
  ...aides
}: PropsSaisie) {
  const [texte, setTexte] = useState("");
  const [unite, setUnite] = useState<UniteComposerForces | "">("");
  const fige = !!validation;
  const complet = texte.trim() !== "" && (!avecUnite || unite !== "");
  const erronee = !fige && tentativesUtilisees > 0;

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor="composer-forces-saisie">
          <RenduFragments fragments={libelle} />
        </label>
        <div className="champ-avec-unite">
          <input
            id="composer-forces-saisie"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={placeholder}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={texte}
            disabled={fige}
            onChange={(ev) => setTexte(normaliserSigneMoins(ev.target.value))}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" && complet && !fige) onValider(texte, avecUnite ? (unite as UniteComposerForces) : null);
            }}
          />
          {avecUnite && (
            <span className="select-souligne-wrap">
              <select className="champ-avec-unite-select" aria-label="Unité" value={unite} disabled={fige} onChange={(ev) => setUnite(ev.target.value as UniteComposerForces | "")}>
                <option value="">Unité…</option>
                {OPTIONS_UNITE.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </span>
          )}
          {!avecUnite && <span className="champ-avec-unite-suffixe">°</span>}
        </div>
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(texte, avecUnite ? (unite as UniteComposerForces) : null)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Valeur illisible : écris un nombre, par exemple 47,3. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {messageErreur && <p style={{ margin: "6px 0 0" }}>{messageErreur}</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

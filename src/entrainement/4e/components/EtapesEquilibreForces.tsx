import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { OptionCondition } from "../core/equilibreForces.types";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { OPTIONS_CONDITION_LATEX } from "../ui/formatEquilibreForces";

/**
 * Écrans de gen90 (« Équilibre de forces en composantes ») : condition d'équilibre (choix fermé,
 * UNE tentative), deux composantes (champs libres, marquage du seul champ faux), une valeur
 * (intensité ou angle). Jamais de blocage de frappe (règle CLAUDE.md) : seule transformation,
 * `normaliserSigneMoins`. Aucun point affiché.
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

interface PropsErreur {
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message ciblé de la dernière tentative fausse, ou `null`. */
  messageErreur: string | null;
  /** Saisie illisible (ou forme refusée sans pénalité) à la dernière soumission : message seul. */
  messageSansPenalite: string | null;
}

function BlocErreur({ tentativesUtilisees, tentativesMax, messageErreur, messageSansPenalite }: PropsErreur) {
  if (messageSansPenalite) {
    return (
      <p className="alert-error" role="alert">
        {messageSansPenalite}
      </p>
    );
  }
  if (tentativesUtilisees === 0) return null;
  return (
    <div className="alert-error" role="alert">
      <div>
        <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
        {messageErreur && <p style={{ margin: "6px 0 0" }}>{messageErreur}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — la condition d'équilibre
// ---------------------------------------------------------------------------------------------

interface PropsCondition extends PropsAides {
  consigne: ReactNode;
  options: OptionCondition[];
  onValider: (choix: OptionCondition) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixCondition({ consigne, options, onValider, validation, ...aides }: PropsCondition) {
  const [choix, setChoix] = useState<OptionCondition | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      {/* Une option par ligne : une égalité vectorielle coupée en deux dans un bouton étroit se lit mal. */}
      <div className="options-grid" style={{ margin: "12px 0", gridTemplateColumns: "1fr" }}>
        {options.map((o) => {
          const choisi = choix === o;
          const faux = fige && choisi && o !== "oppose";
          return (
            <button
              key={o}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              onClick={() => setChoix(o)}
            >
              <Katex expression={OPTIONS_CONDITION_LATEX[o]} />
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
// Écrans 2 et 3 — deux composantes
// ---------------------------------------------------------------------------------------------

interface PropsComposantes extends PropsAides, PropsErreur {
  consigne: ReactNode;
  /** Nom du vecteur (LaTeX), ex. « \vec{F_1} + \vec{F_2} ». */
  vecteurLatex: string;
  /** Champs faux à la dernière tentative (marquage en rouge), `null` avant. */
  champsFaux: { x: boolean; y: boolean } | null;
  onValider: (textes: [string, string]) => void;
  validation?: ValidationEtapeProps | null;
  idBase: string;
}

export function EtapeComposantesEquilibre({ consigne, vecteurLatex, champsFaux, onValider, validation, idBase, tentativesUtilisees, tentativesMax, messageErreur, messageSansPenalite, ...aides }: PropsComposantes) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const fige = !!validation;
  const complet = x.trim() !== "" && y.trim() !== "";
  const valider = () => complet && !fige && onValider([x, y]);
  const champ = (cote: "x" | "y", valeur: string, set: (v: string) => void) => (
    <div className="field field-inline" key={cote}>
      <label className="field-label field-label-minuscule" htmlFor={`${idBase}-${cote}`}>
        <Katex expression={`${cote} =`} />
      </label>
      <input
        id={`${idBase}-${cote}`}
        className={`text-input${!fige && champsFaux?.[cote] ? " is-erronee" : ""}`}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="en N"
        value={valeur}
        disabled={fige}
        onChange={(ev) => set(normaliserSigneMoins(ev.target.value))}
        onKeyDown={(ev) => {
          if (ev.key === "Enter") valider();
        }}
      />
    </div>
  );
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0", flexWrap: "wrap" }}>
        <Katex expression={`${vecteurLatex}\\;\\begin{pmatrix} x \\\\ y \\end{pmatrix}`} />
        <div className="field-row" style={{ flex: "1 1 220px", margin: 0 }}>
          {champ("x", x, setX)}
          {champ("y", y, setY)}
        </div>
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          <BlocErreur tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} messageErreur={messageErreur} messageSansPenalite={messageSansPenalite} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écrans 4 et 5 — une valeur (intensité en N, ou angle en degrés)
// ---------------------------------------------------------------------------------------------

interface PropsValeur extends PropsAides, PropsErreur {
  consigne: ReactNode;
  libelleLatex: string;
  suffixe: string;
  placeholder: string;
  indication?: string;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeValeurEquilibre({ consigne, libelleLatex, suffixe, placeholder, indication, onValider, validation, tentativesUtilisees, tentativesMax, messageErreur, messageSansPenalite, ...aides }: PropsValeur) {
  const [texte, setTexte] = useState("");
  const fige = !!validation;
  const complet = texte.trim() !== "";
  const valider = () => complet && !fige && onValider(texte);
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor="equilibre-forces-valeur">
          <Katex expression={libelleLatex} />
        </label>
        <div className="champ-avec-unite">
          <input
            id="equilibre-forces-valeur"
            className={`text-input${!fige && tentativesUtilisees > 0 ? " is-erronee" : ""}`}
            placeholder={placeholder}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={texte}
            disabled={fige}
            onChange={(ev) => setTexte(normaliserSigneMoins(ev.target.value))}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") valider();
            }}
          />
          <span className="champ-avec-unite-suffixe">{suffixe}</span>
        </div>
        {indication && !fige && (
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", margin: "6px 0 0" }}>
            {indication}
          </p>
        )}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          <BlocErreur tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} messageErreur={messageErreur} messageSansPenalite={messageSansPenalite} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

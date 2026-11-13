import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { ReponseTest } from "../moteur/verificationViserCible";

/**
 * Écrans de gen89 (« Viser une cible : trajectoires rectilignes ») : choix fermé (vecteur à
 * comparer, conclusion — UNE tentative), composantes de AC⃗, test de colinéarité (critère + oui/non
 * + k), saisie libre d'une équation ou d'un nombre. Champs libres : jamais de blocage de frappe
 * (règle CLAUDE.md), seule transformation `normaliserSigneMoins`. Aucun point affiché.
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

interface PropsMessages {
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message ciblé de la dernière tentative fausse, ou `null`. */
  messageErreur: FragmentConsigne[] | null;
  /** Saisie illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: string | null;
}

function Messages({ tentativesUtilisees, tentativesMax, messageErreur, erreurLecture }: PropsMessages) {
  if (erreurLecture) {
    return (
      <p className="alert-error" role="alert">
        {erreurLecture}
      </p>
    );
  }
  if (tentativesUtilisees === 0) return null;
  return (
    <div className="alert-error" role="alert">
      <div>
        <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
        {messageErreur && (
          <p style={{ margin: "6px 0 0" }}>
            <RenduFragments fragments={messageErreur} />
          </p>
        )}
      </div>
    </div>
  );
}

const ATTRIBUTS_CHAMP = { autoComplete: "off", autoCapitalize: "off", spellCheck: false } as const;

// ---------------------------------------------------------------------------------------------
// Choix fermé (vecteur à comparer, conclusion)
// ---------------------------------------------------------------------------------------------

interface PropsChoix<T extends string> extends PropsAides {
  consigne: ReactNode;
  options: { id: T; contenu: ReactNode }[];
  /** Option correcte : sert seulement à marquer un choix faux une fois l'écran clos. */
  attendu: T;
  /** Options longues (phrases) : une par ligne. */
  enColonne?: boolean;
  onValider: (choix: T) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixViserCible<T extends string>({ consigne, options, attendu, enColonne, onValider, validation, ...aides }: PropsChoix<T>) {
  const [choix, setChoix] = useState<T | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="options-grid" style={{ margin: "12px 0", ...(enColonne ? { gridTemplateColumns: "1fr" } : {}) }}>
        {options.map((o) => {
          const choisi = choix === o.id;
          const faux = fige && choisi && o.id !== attendu;
          return (
            <button
              key={o.id}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={enColonne ? { textAlign: "left", whiteSpace: "normal", lineHeight: 1.35 } : undefined}
              onClick={() => setChoix(o.id)}
            >
              {o.contenu}
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
// Composantes de AC⃗
// ---------------------------------------------------------------------------------------------

interface PropsComposantes extends PropsAides, PropsMessages {
  consigne: ReactNode;
  /** Champs marqués faux après la dernière tentative. */
  faux: { x: boolean; y: boolean };
  onValider: (x: string, y: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeComposantesViserCible({ consigne, faux, onValider, validation, tentativesUtilisees, tentativesMax, messageErreur, erreurLecture, ...aides }: PropsComposantes) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const fige = !!validation;
  const complet = x.trim() !== "" && y.trim() !== "";
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="field-row">
        {(
          [
            ["x", x, setX, "x_{AC} ="],
            ["y", y, setY, "y_{AC} ="],
          ] as const
        ).map(([cle, valeur, modifier, libelle]) => (
          <div key={cle} className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor={`viser-cible-${cle}`}>
              <Katex expression={libelle} />
            </label>
            <input
              id={`viser-cible-${cle}`}
              className={`text-input${!fige && faux[cle] ? " is-erronee" : ""}`}
              {...ATTRIBUTS_CHAMP}
              value={valeur}
              disabled={fige}
              onChange={(ev) => modifier(normaliserSigneMoins(ev.target.value))}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" && complet && !fige) onValider(x, y);
              }}
            />
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(x, y)}>
            Valider
          </button>
          <Messages tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} messageErreur={messageErreur} erreurLecture={erreurLecture} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Test de colinéarité (sens direct) : critère, colinéaires ?, k
// ---------------------------------------------------------------------------------------------

interface PropsTest extends PropsAides, PropsMessages {
  consigne: ReactNode;
  /** Champ marqué faux après la dernière tentative. */
  faux: { critere: boolean; k: boolean };
  onValider: (reponse: ReponseTest) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeTestViserCible({ consigne, faux, onValider, validation, tentativesUtilisees, tentativesMax, messageErreur, erreurLecture, ...aides }: PropsTest) {
  const [critere, setCritere] = useState("");
  const [colineaires, setColineaires] = useState<boolean | null>(null);
  const [k, setK] = useState("");
  const fige = !!validation;
  const complet = critere.trim() !== "" && colineaires !== null && (!colineaires || k.trim() !== "");
  const valider = () => complet && !fige && onValider({ critere, colineaires: colineaires as boolean, k });
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor="viser-cible-critere">
          Critère <Katex expression="x_u \cdot y_{AC} - y_u \cdot x_{AC} =" />
        </label>
        <input
          id="viser-cible-critere"
          className={`text-input${!fige && faux.critere ? " is-erronee" : ""}`}
          {...ATTRIBUTS_CHAMP}
          value={critere}
          disabled={fige}
          onChange={(ev) => setCritere(normaliserSigneMoins(ev.target.value))}
          onKeyDown={(ev) => ev.key === "Enter" && valider()}
        />
      </div>
      <p className="prompt-text" style={{ marginBottom: 6 }}>
        <Katex expression="\vec{u}" /> et <Katex expression="\vec{AC}" /> sont-ils colinéaires ?
      </p>
      <div className="options-grid-compact">
        {([true, false] as const).map((v) => (
          <button key={String(v)} type="button" disabled={fige} aria-pressed={colineaires === v} className={`btn${colineaires === v ? " toggle-active" : ""}`} onClick={() => setColineaires(v)}>
            {v ? "Oui" : "Non"}
          </button>
        ))}
      </div>
      {colineaires === true && (
        <div className="field field-inline" style={{ marginTop: 10 }}>
          <label className="field-label field-label-minuscule" htmlFor="viser-cible-k">
            <Katex expression="\vec{AC} = k \cdot \vec{u}" /> avec <Katex expression="k =" />
          </label>
          <input
            id="viser-cible-k"
            className={`text-input${!fige && faux.k ? " is-erronee" : ""}`}
            {...ATTRIBUTS_CHAMP}
            placeholder="ex : 5/2"
            value={k}
            disabled={fige}
            onChange={(ev) => setK(normaliserSigneMoins(ev.target.value))}
            onKeyDown={(ev) => ev.key === "Enter" && valider()}
          />
        </div>
      )}
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>
            Un nombre entier, décimal ou une fraction comme 5/2.
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          <Messages tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} messageErreur={messageErreur} erreurLecture={erreurLecture} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Saisie libre unique (sens inverse) : la condition (équation en m) ou la valeur de m
// ---------------------------------------------------------------------------------------------

interface PropsSaisie extends PropsAides, PropsMessages {
  consigne: ReactNode;
  libelle: ReactNode;
  placeholder: string;
  indication: string;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeSaisieViserCible({ consigne, libelle, placeholder, indication, onValider, validation, tentativesUtilisees, tentativesMax, messageErreur, erreurLecture, ...aides }: PropsSaisie) {
  const [valeur, setValeur] = useState("");
  const fige = !!validation;
  const complet = valeur.trim() !== "";
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="viser-cible-saisie">
          {libelle}
        </label>
        <input
          id="viser-cible-saisie"
          className={`text-input${!fige && tentativesUtilisees > 0 && !erreurLecture ? " is-erronee" : ""}`}
          {...ATTRIBUTS_CHAMP}
          placeholder={placeholder}
          value={valeur}
          disabled={fige}
          onChange={(ev) => setValeur(normaliserSigneMoins(ev.target.value))}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && complet && !fige) onValider(valeur);
          }}
        />
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>
            {indication}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(valeur)}>
            Valider
          </button>
          <Messages tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} messageErreur={messageErreur} erreurLecture={erreurLecture} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { SaisieVecteur } from "../moteur/verificationDemontrerVecteurs";

/**
 * Écrans de gen85 (« Démontrer avec des vecteurs ») : choix fermé (base adaptée, conclusion — UNE
 * tentative), saisie des coefficients des deux vecteurs utiles, saisie du coefficient k. Champs
 * libres : jamais de blocage de frappe (règle CLAUDE.md), seul le signe moins est normalisé.
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

function AlerteTentative({ tentativesUtilisees, tentativesMax, erreurLecture, messages }: { tentativesUtilisees: number; tentativesMax: number; erreurLecture: boolean; messages: FragmentConsigne[][] }) {
  if (erreurLecture) {
    return (
      <p className="alert-error" role="alert">
        Un coefficient n'est pas lisible : écris un entier, un décimal ou une fraction comme 2/3. Aucune tentative n'est comptée.
      </p>
    );
  }
  if (tentativesUtilisees === 0) return null;
  return (
    <div className="alert-error" role="alert">
      {/* Un seul enfant : l'alerte est en flex (icône + contenu), le texte et la liste s'empilent. */}
      <div>
        <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
        {messages.map((m, i) => (
          <p key={i} style={{ margin: "6px 0 0" }}>
            <RenduFragments fragments={m} />
          </p>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écrans 1 et 4 — choix fermé
// ---------------------------------------------------------------------------------------------

interface PropsChoix<T extends string> extends PropsAides {
  consigne: ReactNode;
  options: { id: T; contenu: FragmentConsigne[] }[];
  /** Option correcte : sert seulement à marquer un choix faux une fois l'écran clos. */
  attendu: T;
  /** Options longues (phrases de conclusion) : une par ligne, texte aligné à gauche. */
  longues?: boolean;
  onValider: (choix: T) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixDemontrerVecteurs<T extends string>({ consigne, options, attendu, longues, onValider, validation, ...aides }: PropsChoix<T>) {
  const [choix, setChoix] = useState<T | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className={longues ? undefined : "options-grid"} style={longues ? { display: "grid", gap: 8, margin: "12px 0" } : { margin: "12px 0" }}>
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
              style={longues ? { textAlign: "left", whiteSpace: "normal", lineHeight: 1.45, padding: "10px 12px", height: "auto" } : undefined}
              onClick={() => setChoix(o.id)}
            >
              {/* Un seul enfant : le bouton est en flex, la phrase doit couler comme un texte. */}
              <span style={{ display: "block", flex: 1 }}>
                <RenduFragments fragments={o.contenu} />
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
// Écran 2 — les deux vecteurs utiles dans la base
// ---------------------------------------------------------------------------------------------

interface PropsExpressions extends PropsAides {
  consigne: ReactNode;
  /** LaTeX des deux vecteurs utiles (`\vec{XE}`…) et des deux vecteurs de base. */
  vecteurs: [string, string];
  u: string;
  v: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Champs faux de la dernière tentative : [vecteur][0 = coefficient de u, 1 = de v]. */
  champsFaux: boolean[][] | null;
  messages: FragmentConsigne[][];
  erreurLecture: boolean;
  onValider: (saisies: [SaisieVecteur, SaisieVecteur]) => void;
  validation?: ValidationEtapeProps | null;
}

const STYLE_CHAMP = { width: 76, minWidth: 0, textAlign: "center" as const, padding: "8px 6px" };

export function EtapeExpressionsDemontrerVecteurs({ consigne, vecteurs, u, v, tentativesUtilisees, tentativesMax, champsFaux, messages, erreurLecture, onValider, validation, ...aides }: PropsExpressions) {
  const [saisies, setSaisies] = useState<[SaisieVecteur, SaisieVecteur]>([
    { x: "", y: "" },
    { x: "", y: "" },
  ]);
  const fige = !!validation;
  const complet = saisies.every((s) => s.x.trim() !== "" && s.y.trim() !== "");

  function modifier(i: number, champ: "x" | "y", valeur: string) {
    setSaisies((s) => s.map((x, j) => (j === i ? { ...x, [champ]: normaliserSigneMoins(valeur) } : x)) as [SaisieVecteur, SaisieVecteur]);
  }

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 14, margin: "12px 0" }}>
        {vecteurs.map((vec, i) => (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <span style={{ whiteSpace: "nowrap" }}>
              <Katex expression={`${vec} =`} />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <input
                className={`text-input${!fige && champsFaux?.[i]?.[0] ? " is-erronee" : ""}`}
                style={STYLE_CHAMP}
                aria-label={`Coefficient de ${u} dans le vecteur ${i + 1}`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={saisies[i]!.x}
                disabled={fige}
                onChange={(ev) => modifier(i, "x", ev.target.value)}
              />
              <Katex expression={`${u} \\;+`} />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <input
                className={`text-input${!fige && champsFaux?.[i]?.[1] ? " is-erronee" : ""}`}
                style={STYLE_CHAMP}
                aria-label={`Coefficient de ${v} dans le vecteur ${i + 1}`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={saisies[i]!.y}
                disabled={fige}
                onChange={(ev) => modifier(i, "y", ev.target.value)}
              />
              <Katex expression={v} />
            </span>
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Un coefficient : un entier, une fraction comme −1/2, ou 0 si le vecteur n'apparaît pas.
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          <AlerteTentative tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} erreurLecture={erreurLecture} messages={messages} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 3 — le coefficient k
// ---------------------------------------------------------------------------------------------

interface PropsCoefficient extends PropsAides {
  consigne: ReactNode;
  /** Rappel des deux expressions CORRECTES (obtenues à l'écran 2). */
  rappel: FragmentConsigne[];
  /** LaTeX « \vec{XF} = k\,\vec{XE} » sans k : ce qui précède et ce qui suit le champ. */
  avant: string;
  apres: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  messages: FragmentConsigne[][];
  erreurLecture: boolean;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeCoefficientDemontrerVecteurs({ consigne, rappel, avant, apres, tentativesUtilisees, tentativesMax, messages, erreurLecture, onValider, validation, ...aides }: PropsCoefficient) {
  const [texte, setTexte] = useState("");
  const fige = !!validation;
  const complet = texte.trim() !== "";
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <p style={{ margin: "8px 0" }}>
        <RenduFragments fragments={rappel} />
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        <Katex expression={`${avant} \\;=`} />
        <input
          className={`text-input${!fige && tentativesUtilisees > 0 ? " is-erronee" : ""}`}
          style={STYLE_CHAMP}
          aria-label="Coefficient k"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={texte}
          disabled={fige}
          onChange={(ev) => setTexte(normaliserSigneMoins(ev.target.value))}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && complet && !fige) onValider(texte);
          }}
        />
        <Katex expression={apres} />
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            k : un entier ou une fraction comme 3/2 (valeur exacte).
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(texte)}>
            Valider
          </button>
          <AlerteTentative tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} erreurLecture={erreurLecture} messages={messages} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

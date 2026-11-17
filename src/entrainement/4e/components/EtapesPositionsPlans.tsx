import { useState } from "react";
import type { ReactNode } from "react";
import type { CandidatPointCommun } from "../core/positionsPlans.types";
import { BoutonAide } from "./BoutonAide";
import { espacesInsecables } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Écrans de gen101 (« Positions de deux plans et de trois plans ») — deux choix fermés, UNE tentative
 * chacun (décision de l'utilisateur) :
 * - `EtapeChoixPlans` : une option parmi plusieurs (position, issue, justification) ;
 * - `EtapePointsCommuns` : DEUX candidats parmi les points nommés et les points construits.
 * Après validation, l'explication s'affiche avant le bouton « Écran suivant » ; un mauvais choix
 * reste marqué en rouge. Aucun point affiché.
 */

interface PropsAides {
  aides: string[];
  niveauAide: number;
  onActiverAide: () => void;
}

function BlocAidesTexte({ aides, niveauAide, onActiverAide }: PropsAides) {
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>{espacesInsecables(aide)}</p>
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
    </div>
  );
}

function Explication({ lignes }: { lignes: string[] }) {
  return (
    <div className="triangle-quelconque-aide">
      {lignes.map((l, i) => (
        <p key={i} style={{ margin: i === 0 ? 0 : "6px 0 0" }}>
          {espacesInsecables(l)}
        </p>
      ))}
    </div>
  );
}

const STYLE_OPTION = { textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.5, padding: "10px 14px", minHeight: 44, height: "auto" } as const;

interface PropsChoix extends PropsAides {
  consigne: string;
  etiquette: string;
  options: { id: string; texte: string }[];
  attendue: string;
  /** Explication (lignes) selon le choix fait, montrée une fois l'écran clos. */
  explication: (choix: string) => string[];
  onValider: (id: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixPlans({ consigne, etiquette, options, attendue, explication, onValider, validation, ...aides }: PropsChoix) {
  const [choix, setChoix] = useState<string | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{espacesInsecables(consigne)}</p>
      <div style={{ display: "grid", gap: 10, margin: "12px 0" }} role="group" aria-label={etiquette}>
        {options.map(({ id, texte }) => {
          const choisi = choix === id;
          const faux = fige && choisi && attendue !== id;
          return (
            <button
              key={id}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={STYLE_OPTION}
              onClick={() => setChoix(id)}
            >
              <span>{espacesInsecables(texte)}</span>
            </button>
          );
        })}
      </div>
      {!validation && (
        <>
          <BlocAidesTexte {...aides} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
            Valider
          </button>
        </>
      )}
      {validation && choix !== null && (
        <>
          <Explication lignes={explication(choix)} />
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}

interface PropsPoints extends PropsAides {
  consigne: string;
  candidats: CandidatPointCommun[];
  /** Le candidat est-il un point commun aux deux plans ? (marque un mauvais choix une fois clos) */
  estCommun: (index: number) => boolean;
  explication: (paire: [number, number]) => string[];
  onValider: (paire: [number, number]) => void;
  validation?: ValidationEtapeProps | null;
  /** Bloc affiché une fois l'écran clos (la figure avec la droite d'intersection). */
  apresValidation?: ReactNode;
}

export function EtapePointsCommuns({ consigne, candidats, estCommun, explication, onValider, validation, apresValidation, ...aides }: PropsPoints) {
  const [selection, setSelection] = useState<number[]>([]);
  const fige = !!validation;
  const nommes = candidats.map((c, i) => ({ c, i })).filter(({ c }) => !c.construction);
  const construits = candidats.map((c, i) => ({ c, i })).filter(({ c }) => c.construction);

  function basculer(i: number) {
    setSelection((s) => (s.includes(i) ? s.filter((x) => x !== i) : s.length >= 2 ? s : [...s, i]));
  }

  function groupe(titre: string, liste: { c: CandidatPointCommun; i: number }[]) {
    return (
      <div style={{ marginTop: "0.75rem" }}>
        <p className="field-label field-label-minuscule">{titre}</p>
        <div className="options-grid-compact" role="group" aria-label={titre}>
          {liste.map(({ c, i }) => {
            const actif = selection.includes(i);
            const faux = fige && actif && !estCommun(i);
            return (
              <button
                key={c.cle}
                type="button"
                disabled={fige}
                aria-pressed={actif}
                className={`btn${actif ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
                style={{ minHeight: 44, whiteSpace: "nowrap" }}
                onClick={() => basculer(i)}
              >
                {c.libelle}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="prompt-text">{espacesInsecables(consigne)}</p>
      {groupe("Points nommés", nommes)}
      {construits.length > 0 && groupe("Points de rencontre de deux droites", construits)}
      {!validation && (
        <div style={{ marginTop: 12 }}>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Sélectionne exactement deux points ({selection.length}/2).
          </p>
          <BlocAidesTexte {...aides} />
          <button type="button" className="btn btn-primary" disabled={selection.length !== 2} onClick={() => selection.length === 2 && onValider([selection[0]!, selection[1]!])}>
            Valider
          </button>
        </div>
      )}
      {validation && selection.length === 2 && (
        <>
          <Explication lignes={explication([selection[0]!, selection[1]!])} />
          {apresValidation}
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}

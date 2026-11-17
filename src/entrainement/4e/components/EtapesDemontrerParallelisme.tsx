import { useState } from "react";
import { BlocAidesTexte, Explication } from "./EtapesPositionsPlans";
import { espacesInsecables } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Écran « deux parallélismes » de gen103 (« Démontrer un parallélisme », variante deux plans) :
 * l'élève sélectionne exactement DEUX options parmi les parallélismes proposés — UNE tentative
 * (décision de l'utilisateur). Une fois l'écran clos, les options choisies qui ne conviennent pas sont
 * marquées en rouge et l'explication s'affiche avant « Écran suivant ». Les autres écrans de gen103
 * réutilisent `EtapeChoixPlans` (gen101). Aucun point affiché.
 */

const STYLE_OPTION = { textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.5, padding: "10px 14px", minHeight: 44, height: "auto" } as const;

interface Props {
  consigne: string;
  etiquette: string;
  options: string[];
  /** L'option est-elle valable à elle seule ? (marque un mauvais choix une fois l'écran clos) */
  estValable: (index: number) => boolean;
  explication: (paire: [number, number]) => string[];
  onValider: (paire: [number, number]) => void;
  validation?: ValidationEtapeProps | null;
  aides: string[];
  niveauAide: number;
  onActiverAide: () => void;
}

export function EtapeDeuxChoix({ consigne, etiquette, options, estValable, explication, onValider, validation, ...aides }: Props) {
  const [selection, setSelection] = useState<number[]>([]);
  const fige = !!validation;

  function basculer(i: number) {
    setSelection((s) => (s.includes(i) ? s.filter((x) => x !== i) : s.length >= 2 ? s : [...s, i]));
  }

  const paire = (): [number, number] => {
    const [a, b] = [...selection].sort((x, y) => x - y);
    return [a!, b!];
  };

  return (
    <div>
      <p className="prompt-text">{espacesInsecables(consigne)}</p>
      <div style={{ display: "grid", gap: 10, margin: "12px 0" }} role="group" aria-label={etiquette}>
        {options.map((texte, i) => {
          const actif = selection.includes(i);
          const faux = fige && actif && !estValable(i);
          return (
            <button
              key={i}
              type="button"
              disabled={fige}
              aria-pressed={actif}
              className={`btn${actif ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={STYLE_OPTION}
              onClick={() => basculer(i)}
            >
              <span>{espacesInsecables(texte)}</span>
            </button>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Sélectionne exactement deux parallélismes ({selection.length}/2).
          </p>
          <BlocAidesTexte {...aides} />
          <button type="button" className="btn btn-primary" disabled={selection.length !== 2} onClick={() => selection.length === 2 && onValider(paire())}>
            Valider
          </button>
        </>
      )}
      {validation && selection.length === 2 && (
        <>
          <Explication lignes={explication(paire())} />
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}

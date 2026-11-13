import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { lireNombre } from "../moteur/verificationPortraitRobot";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Écrans génériques de « Le portrait-robot d'une fonction » (gen71) : choix fermé (une tentative),
 * champs numériques, expression de f. Les aides arrivent toutes faites (`ui/formatPortraitRobot.ts`,
 * fragments texte + LaTeX), affichées jusqu'au niveau atteint. Aucun point, aucune pénalité.
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

function messageTentative(tentativesUtilisees: number, tentativesMax: number): string {
  return `Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`;
}

// ---------------------------------------------------------------------------------------------

export interface OptionChoix<T> {
  valeur: T;
  rendu: ReactNode;
}

interface PropsChoix<T> extends PropsAides {
  consigne: ReactNode;
  options: OptionChoix<T>[];
  onValider: (choix: T) => void;
  validation?: ValidationEtapeProps | null;
}

/** Choix fermé : UNE tentative — l'écran se clôt au premier « Valider ». */
export function EtapeChoixPortrait<T extends string | number>({ consigne, options, onValider, validation, ...aides }: PropsChoix<T>) {
  const [choix, setChoix] = useState<T | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="options-grid">
        {options.map((option) => (
          <button
            key={String(option.valeur)}
            type="button"
            disabled={fige}
            className={`btn${choix === option.valeur ? " toggle-active" : ""}${fige && validation?.revele && choix === option.valeur ? " is-erronee" : ""}`}
            onClick={() => setChoix(option.valeur)}
          >
            {option.rendu}
          </button>
        ))}
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

export interface ChampNombre {
  id: string;
  labelLatex: string;
}

interface PropsNombres extends PropsAides {
  consigne: ReactNode;
  champs: ChampNombre[];
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (valeurs: number[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeNombresPortrait({ consigne, champs, tentativesUtilisees, tentativesMax, onValider, validation, ...aides }: PropsNombres) {
  const [saisies, setSaisies] = useState<string[]>(() => champs.map(() => ""));
  const valeurs = saisies.map(lireNombre);
  const complet = valeurs.every((v) => v !== null);
  const erronee = tentativesUtilisees > 0 && !validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="field-row">
        {champs.map((champ, i) => (
          <div key={champ.id} className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor={champ.id}>
              <Katex expression={champ.labelLatex} />
            </label>
            <input
              id={champ.id}
              className={`text-input${erronee ? " is-erronee" : ""}`}
              inputMode="decimal"
              autoComplete="off"
              value={saisies[i]}
              disabled={!!validation}
              onChange={(e) => {
                const valeur = filtrerSaisieNumerique(e.target.value);
                setSaisies((s) => s.map((x, j) => (j === i ? valeur : x)));
              }}
              onKeyDown={gererKeyDownNumerique}
            />
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(valeurs as number[])}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {messageTentative(tentativesUtilisees, tentativesMax)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

interface PropsExpression extends PropsAides {
  consigne: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message « expression non reconnue » (aucune tentative consommée). */
  erreurSyntaxe: boolean;
  onValider: (saisie: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeExpressionPortrait({ consigne, tentativesUtilisees, tentativesMax, erreurSyntaxe, onValider, validation, ...aides }: PropsExpression) {
  const [saisie, setSaisie] = useState("");
  const complet = saisie.trim() !== "";
  const erronee = (tentativesUtilisees > 0 || erreurSyntaxe) && !validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <ApercuExpressionLatex texte={saisie} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="portrait-expression">
          <Katex expression="f(x) =" />
        </label>
        <input
          id="portrait-expression"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={saisie}
          disabled={!!validation}
          onChange={(e) => setSaisie(e.target.value)}
        />
      </div>
      <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>
        Saisie : racine carrée avec sqrt(…), racine cubique avec cbrt(…), valeur absolue avec abs(…), exposant avec ^, quotient avec /.
      </p>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisie)}>
            Valider
          </button>
          {erreurSyntaxe && (
            <p className="alert-error" role="alert">
              Expression non reconnue — vérifie la syntaxe (parenthèses, « * » entre un nombre et une parenthèse…). Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurSyntaxe && tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {messageTentative(tentativesUtilisees, tentativesMax)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

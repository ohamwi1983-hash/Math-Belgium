import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { AideAvecLatex, ChampPolygones, FragmentConsigne, OptionChoix } from "../ui6e/formatPolygonesReguliers";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { PlanPolygoneRegulier } from "./PlanPolygoneRegulier";
import type { FigurePolygone } from "./PlanPolygoneRegulier";
import { TexteInsistance } from "../../components/TexteInsistance";

export type ModeEcranPolygones = { type: "champs"; champs: ChampPolygones[] } | { type: "choix"; options: OptionChoix[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  consigneEcran: FragmentConsigne[];
  figure: FigurePolygone;
  mode: ModeEcranPolygones;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  /** Message d'une saisie qui NE consomme PAS de tentative ; `null` si elle peut être soumise. */
  messageSaisie: (valeurs: string[]) => string | null;
  /** Message ciblé (jamais la réponse) d'une réponse fausse. */
  diagnostic: (valeurs: string[]) => FragmentConsigne[] | null;
  onValider: (valeurs: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen97` — consigne générale → consigne de l'écran → figure (plan complexe à
 * fenêtre fixe) → champs libres (jamais filtrés : ni `inputMode`, ni `type="number"`) ou choix
 * fermé (une seule tentative ; l'explication de l'erreur reste affichée sous la correction) → aide →
 * « Valider ». `App6gen97.tsx` change la `key` à chaque écran ET à chaque nouvel exercice (saisie
 * remise à vide).
 */
export function EtapePolygonesReguliers({
  consigneGenerale,
  consigneEcran,
  figure,
  mode,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  messageSaisie,
  diagnostic,
  onValider,
  validation,
}: Props) {
  const nombre = mode.type === "champs" ? mode.champs.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombre }, () => ""));
  const [message, setMessage] = useState<string | null>(null);
  const [dernierDiagnostic, setDernierDiagnostic] = useState<FragmentConsigne[] | null>(null);
  const rempli = valeurs.every((v) => v.trim() !== "");
  const erronee = tentativesUtilisees > 0 && !validation;

  function changer(i: number, v: string) {
    setValeurs((anciennes) => anciennes.map((a, j) => (j === i ? v : a)));
    setMessage(null);
  }

  function valider() {
    if (!rempli || validation) return;
    const m = messageSaisie(valeurs);
    if (m !== null) {
      setMessage(m);
      return;
    }
    setMessage(null);
    setDernierDiagnostic(diagnostic(valeurs));
    onValider(valeurs);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale} />} blocDonnees={null} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <PlanPolygoneRegulier figure={figure} />
      {mode.type === "champs" &&
        mode.champs.map((champ, i) => (
          <div key={i}>
            {champ.groupe && (
              <p className="field-label" style={{ margin: "12px 0 2px", fontWeight: 600 }}>
                <RenduFragments fragments={champ.groupe} />
              </p>
            )}
            {/* « 2√5 » : l'aperçu attend une parenthèse après la racine — ajoutée pour l'aperçu
                seulement (l'évaluateur accepte les deux écritures). */}
            {/[^\d\s,.−-]/.test(valeurs[i]) && <ApercuExpressionLatex texte={valeurs[i].replace(/√\s*(\d+(?:[.,]\d+)?)/g, "√($1)")} />}
            <div className="field">
              <label className="field-label field-label-minuscule">
                <RenduFragments fragments={champ.label} />
              </label>
              <input
                type="text"
                className={`text-input ${erronee ? "is-erronee" : ""}`}
                value={valeurs[i]}
                placeholder={champ.placeholder}
                disabled={!!validation}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                onChange={(e) => changer(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") valider();
                }}
              />
            </div>
          </div>
        ))}
      {mode.type === "choix" && (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr", marginBottom: 12 }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={valeurs[0] === option.id}
              data-option={option.id}
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""}`}
              style={{ maxWidth: "100%", whiteSpace: "normal", textAlign: "left", justifyContent: "flex-start", overflowX: "auto" }}
              disabled={!!validation}
              onClick={() => changer(0, option.id)}
            >
              <span>
                <RenduFragments fragments={option.fragments} />
              </span>
            </button>
          ))}
        </div>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p><TexteInsistance texte={aideNiveau1.texte} /></p>
          {aideNiveau1.latex && (
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
              <Katex expression={aideNiveau1.latex} block />
            </div>
          )}
          {niveauAide >= 2 && aideNiveau2.texte && (
            <>
              <p><TexteInsistance texte={aideNiveau2.texte} /></p>
              {aideNiveau2.latex && (
                <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                  <Katex expression={aideNiveau2.latex} block />
                </div>
              )}
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!rempli} onClick={valider}>
            Valider
          </button>
          {message !== null && (
            <p className="alert-error" role="alert">
              {message}
            </p>
          )}
          {message === null && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {dernierDiagnostic && (
                  <p style={{ margin: "6px 0 0" }}>
                    <RenduFragments fragments={dernierDiagnostic} />
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {validation && (
        <>
          {validation.revele && mode.type === "choix" && dernierDiagnostic && (
            <div className="alert-error" style={{ marginBottom: 8 }}>
              {/* Un seul enfant : `.alert-error` est une boîte flex (icône + texte). */}
              <p style={{ margin: 0 }}>
                <RenduFragments fragments={dernierDiagnostic} />
              </p>
            </div>
          )}
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}

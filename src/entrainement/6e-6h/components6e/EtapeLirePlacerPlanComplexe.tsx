import { useState } from "react";
import type { PointEntier } from "../core6e/lirePlacerPlanComplexe.types";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { AideAvecLatex, ChampLirePlacer, FragmentConsigne, OptionTransformation } from "../ui6e/formatLirePlacerPlanComplexe";
import { INDICATION_PLACEMENT } from "../ui6e/formatLirePlacerPlanComplexe";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { PlanComplexeInteractif } from "./PlanComplexeInteractif";
import type { FlechePlan, PointFigurePlan } from "./PlanComplexeInteractif";
import { TexteInsistance } from "../../components/TexteInsistance";

export type ModeEcranLirePlacer =
  | { type: "champs"; champs: ChampLirePlacer[] }
  | { type: "placement"; etiquette: string; attendu: PointEntier }
  | { type: "associer"; groupes: FragmentConsigne[][]; options: OptionTransformation[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  consigneEcran: FragmentConsigne[];
  figure: { points: PointFigurePlan[]; fleches: FlechePlan[]; legende: string };
  mode: ModeEcranLirePlacer;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  /** Message d'une saisie qui NE consomme PAS de tentative ; `null` si elle peut être soumise. */
  messageSaisie: (valeurs: string[]) => string | null;
  /** Message ciblé (jamais la réponse) d'une saisie fausse. */
  diagnostic: (valeurs: string[]) => FragmentConsigne[] | null;
  onValider: (valeurs: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

function nombreValeurs(mode: ModeEcranLirePlacer): number {
  if (mode.type === "champs") return mode.champs.length;
  if (mode.type === "associer") return mode.groupes.length;
  return 1;
}

/**
 * Écran unique de `6gen95` — consigne générale → consigne de l'écran → plan complexe (figure de
 * l'énoncé, surface de placement sur les écrans « placer ») → bloc de travail → aide → « Valider ».
 * Trois formes : champs libres (jamais filtrés : ni `inputMode`, ni `type="number"`), placement
 * (une seule poignée, toucher ou glisser sur le quadrillage), choix fermé « associer » (une seule
 * tentative pour l'écran). `App6gen95.tsx` change la `key` à chaque écran ET à chaque nouvel
 * exercice (saisie remise à vide).
 */
export function EtapeLirePlacerPlanComplexe({
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
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombreValeurs(mode) }, () => ""));
  const [poignee, setPoignee] = useState<PointEntier | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dernierDiagnostic, setDernierDiagnostic] = useState<FragmentConsigne[] | null>(null);
  const valeursSoumises = mode.type === "placement" ? (poignee ? [`${poignee.x};${poignee.y}`] : [""]) : valeurs;
  const rempli = valeursSoumises.every((v) => v.trim() !== "");
  const erronee = tentativesUtilisees > 0 && !validation;

  function changer(i: number, v: string) {
    setValeurs((anciennes) => anciennes.map((a, j) => (j === i ? v : a)));
    setMessage(null);
  }

  function valider() {
    if (!rempli || validation) return;
    const m = messageSaisie(valeursSoumises);
    if (m !== null) {
      setMessage(m);
      return;
    }
    setMessage(null);
    setDernierDiagnostic(diagnostic(valeursSoumises));
    onValider(valeursSoumises);
  }

  const points: PointFigurePlan[] = [...figure.points];
  if (mode.type === "placement" && validation?.revele) points.push({ x: mode.attendu.x, y: mode.attendu.y, label: "", role: "attendu" });

  return (
    <div>
      <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale} />} blocDonnees={null} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <PlanComplexeInteractif
        points={points}
        fleches={figure.fleches}
        legende={figure.legende}
        poignee={mode.type === "placement" ? poignee : null}
        etiquettePoignee={mode.type === "placement" ? mode.etiquette : ""}
        onPlacer={
          mode.type === "placement" && !validation
            ? (p) => {
                setPoignee(p);
                setMessage(null);
              }
            : undefined
        }
      />
      {mode.type === "placement" && !validation && (
        <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", margin: "0 0 10px", textAlign: "center" }}>
          {INDICATION_PLACEMENT}
        </p>
      )}
      {mode.type === "placement" && validation?.revele && (
        <p style={{ fontSize: "0.9em", margin: "0 0 10px", textAlign: "center" }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>orange : ton point</span> · <span style={{ color: "var(--good)", fontWeight: 600 }}>cercle vert : le point attendu</span>
        </p>
      )}
      {mode.type === "champs" &&
        mode.champs.map((champ, i) => (
          <div key={i}>
            {/* « 2√5 » : l'aperçu attend une parenthèse après la racine — ajoutée ici pour l'aperçu
                seulement (l'évaluateur accepte les deux écritures). */}
            <ApercuExpressionLatex texte={valeurs[i].replace(/√\s*(\d+(?:[.,]\d+)?)/g, "√($1)")} />
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
      {mode.type === "associer" &&
        mode.groupes.map((titre, g) => (
          <fieldset key={g} style={{ border: "none", padding: 0, margin: "0 0 14px" }}>
            <legend className="field-label field-label-minuscule" style={{ marginBottom: 6 }}>
              <RenduFragments fragments={titre} />
            </legend>
            <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
              {mode.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={valeurs[g] === option.id}
                  data-transformation={option.id}
                  className={`btn ${valeurs[g] === option.id ? "toggle-active" : ""}`}
                  style={{ maxWidth: "100%", whiteSpace: "normal", textAlign: "left", justifyContent: "flex-start" }}
                  disabled={!!validation}
                  onClick={() => changer(g, option.id)}
                >
                  <span>
                    <RenduFragments fragments={option.fragments} />
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p><TexteInsistance texte={aideNiveau1.texte} /></p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && aideNiveau2.texte && (
            <>
              <p><TexteInsistance texte={aideNiveau2.texte} /></p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
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
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

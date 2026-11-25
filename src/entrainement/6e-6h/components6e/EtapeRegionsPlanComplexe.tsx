import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { AideAvecLatex, FragmentConsigne, GroupeChamps, OptionChoix } from "../ui6e/formatRegionsPlanComplexe";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteInsistance } from "../../components/TexteInsistance";

export type ModeEcranRegions =
  | { type: "champs"; groupes: GroupeChamps[] }
  | { type: "choix"; titres: (FragmentConsigne[] | null)[]; options: OptionChoix[] }
  | { type: "figures"; figures: { id: string; svg: string }[]; idCorrect: string };

interface Props {
  consigneGenerale: FragmentConsigne[];
  consigneEcran: FragmentConsigne[];
  /** Figure SVG au-dessus du bloc de travail (écran « bord »), `null` sinon. */
  figure: { svg: string; legende: string } | null;
  mode: ModeEcranRegions;
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

function nombreValeurs(mode: ModeEcranRegions): number {
  if (mode.type === "champs") return mode.groupes.reduce((s, g) => s + g.champs.length, 0);
  if (mode.type === "choix") return mode.titres.length;
  return 1;
}

/**
 * Écran unique de `6gen98` — consigne générale → consigne de l'écran → (figure) → bloc de travail
 * → aide → « Valider ». Trois formes : champs libres groupés par condition (jamais filtrés : ni
 * `inputMode`, ni `type="number"`), choix fermé par condition (une seule tentative pour l'écran),
 * choix d'une figure parmi quatre (une seule tentative). `App6gen98.tsx` change la `key` à chaque
 * écran ET à chaque nouvel exercice (saisie remise à vide).
 */
export function EtapeRegionsPlanComplexe({
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

  let indexChamp = 0;

  return (
    <div>
      <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale} />} blocDonnees={null} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {figure && (
        <figure style={{ margin: "6px auto 10px", maxWidth: 320 }}>
          <div role="img" aria-label={figure.legende} dangerouslySetInnerHTML={{ __html: figure.svg }} />
        </figure>
      )}
      {mode.type === "champs" &&
        mode.groupes.map((groupe, g) => (
          <fieldset key={g} style={{ border: "none", padding: 0, margin: "0 0 10px" }}>
            {groupe.titre && (
              <legend className="field-label field-label-minuscule" style={{ marginBottom: 6, fontWeight: 600 }}>
                <RenduFragments fragments={groupe.titre} />
              </legend>
            )}
            {groupe.champs.map((champ) => {
              const i = indexChamp++;
              return (
                <div key={i}>
                  {/* « 2√5 » : l'aperçu attend une parenthèse après la racine — ajoutée ici pour
                      l'aperçu seulement (l'évaluateur accepte les deux écritures). */}
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
              );
            })}
          </fieldset>
        ))}
      {mode.type === "choix" &&
        mode.titres.map((titre, g) => (
          <fieldset key={g} style={{ border: "none", padding: 0, margin: "0 0 14px" }}>
            {titre && (
              <legend className="field-label field-label-minuscule" style={{ marginBottom: 6, fontWeight: 600 }}>
                <RenduFragments fragments={titre} />
              </legend>
            )}
            <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
              {mode.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={valeurs[g] === option.id}
                  data-choix={option.id}
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
      {mode.type === "figures" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, margin: "4px 0 14px" }}>
          {mode.figures.map((f, i) => {
            const choisi = valeurs[0] === f.id;
            const bonne = validation?.revele && f.id === mode.idCorrect;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={choisi}
                data-figure={f.id}
                className={`btn ${choisi ? "toggle-active" : ""}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  padding: 4,
                  maxWidth: "100%",
                  minWidth: 0,
                  outline: bonne ? "3px solid var(--good, #2f7a4f)" : undefined,
                  outlineOffset: 1,
                }}
                disabled={!!validation}
                onClick={() => changer(0, f.id)}
              >
                <span style={{ fontWeight: 600, fontSize: "0.9em", marginBottom: 2 }}>{`Figure ${i + 1}`}</span>
                <span style={{ display: "block", background: "var(--surface, #fff)", borderRadius: 6 }} dangerouslySetInnerHTML={{ __html: f.svg }} />
              </button>
            );
          })}
        </div>
      )}
      {mode.type === "figures" && validation?.revele && (
        <p style={{ fontSize: "0.9em", margin: "0 0 10px", textAlign: "center" }}>
          <span style={{ color: "var(--good)", fontWeight: 600 }}>cadre vert : la bonne figure</span>
        </p>
      )}
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

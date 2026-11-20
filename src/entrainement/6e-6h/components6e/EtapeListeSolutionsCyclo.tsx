import { Fragment, useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { CONSIGNE_GENERALE } from "../ui6e/formatEquationsCyclometriques";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesCyclo, MESSAGES_ILLISIBLE_CYCLO, MessageRetourCyclo, lisibleValeurCyclo, useRetourCyclo } from "./RetourSaisieCyclo";
import type { AideCyclo } from "./RetourSaisieCyclo";

interface Props {
  consigneEcran: string;
  equationLatex: string;
  aideNiveau1: AideCyclo;
  aideNiveau2: AideCyclo;
  placeholder: string;
  labelAjout: string;
  labelAucune: string;
  /** Message ciblé sur la dernière liste fausse (null : générique). */
  cible?: (textes: string[]) => FragmentConsigne[] | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran « liste de solutions » de `6gen3` (une valeur par case, ou « Pas de solution »). Règles
 * communes du 6e ch. 1 (lot B) : une valeur illisible n'est jamais transmise (aucune tentative,
 * message) ; π, √, fractions, « − » et « x = » lus ; message ciblé ; aides KaTeX à deux niveaux.
 */
export function EtapeListeSolutionsCyclo({
  consigneEcran,
  equationLatex,
  aideNiveau1,
  aideNiveau2,
  placeholder,
  labelAjout,
  labelAucune,
  cible,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [aucune, setAucune] = useState(false);
  const [lignes, setLignes] = useState<string[]>([""]);
  const retour = useRetourCyclo<string[]>();
  const complet = aucune || (lignes.length > 0 && lignes.every((l) => l.trim() !== ""));
  const derniere = retour.soumise;
  const fausse = tentativesUtilisees > 0 && derniere !== null && derniere.join("|") === (aucune ? "" : lignes.join("|"));

  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    const textes = aucune ? [] : lignes;
    const lisible = textes.every((t) => lisibleValeurCyclo(t.replace(/^\s*x\s*=\s*/i, "")));
    retour.tenter(textes, lisible ? null : MESSAGES_ILLISIBLE_CYCLO.liste, onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={equationLatex} />
          </div>
        }
      />
      <p className="prompt-text">{consigneEcran}</p>
      <button type="button" className={`btn ${aucune ? "toggle-active" : ""}`} disabled={!!validation} onClick={() => setAucune((v) => !v)}>
        {labelAucune}
      </button>
      {!aucune && (
        <div className="contenu-conditionnel">
          {lignes.map((ligne, i) => (
            <Fragment key={i}>
              <ApercuExpressionLatex texte={ligne} />
              <div className="field-row">
                <input type="text" className={`text-input${fausse ? " is-erronee" : ""}`} value={ligne} placeholder={placeholder} disabled={!!validation} onChange={(e) => modifierLigne(i, e.target.value)} />
                {lignes.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la solution ${i + 1}`} disabled={!!validation} onClick={() => setLignes((arr) => arr.filter((_, j) => j !== i))}>
                    ×
                  </button>
                )}
              </div>
            </Fragment>
          ))}
          <button type="button" className="btn" disabled={!!validation} onClick={() => setLignes((arr) => [...arr, ""])}>
            {labelAjout}
          </button>
        </div>
      )}
      <AidesCyclo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          <MessageRetourCyclo blocage={retour.blocage} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={derniere !== null && cible ? cible(derniere) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

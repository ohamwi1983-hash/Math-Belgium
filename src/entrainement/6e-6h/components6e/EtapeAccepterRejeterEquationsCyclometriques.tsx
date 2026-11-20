import { useState } from "react";
import type { ExerciceEquationsCyclometriques } from "../core6e/equationsCyclometriques.types";
import { CONSIGNE_GENERALE, formatCandidatLatex, formatEquationOriginaleLatex } from "../ui6e/formatEquationsCyclometriques";
import { aideAcceptRejet1, aideAcceptRejet2 } from "../ui6e/aidesEquationsCyclometriques";
import { CONSIGNES_ECRANS } from "../generateurs6e/equationsCyclometriques/corrigeDetaille";
import { AidesCyclo, MessageRetourCyclo } from "./RetourSaisieCyclo";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "../components/Katex";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationsCyclometriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (decisions: boolean[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 4 — accepter ou rejeter CHAQUE candidat listé à l'écran précédent (`exercice.candidats`,
 * déjà trié par x croissant — exactement ce qui est affiché ici, dans le même ordre). 2 boutons par
 * ligne en grille 2 colonnes (`.options-grid-compact`), `null` tant qu'aucun choix n'a été fait pour
 * cette ligne — jamais présélectionné. */
export function EtapeAccepterRejeterEquationsCyclometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [decisions, setDecisions] = useState<(boolean | null)[]>(() => exercice.candidats.map(() => null));
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = decisions.every((d) => d !== null);

  function choisir(index: number, valeur: boolean) {
    setDecisions((arr) => arr.map((v, i) => (i === index ? valeur : v)));
  }

  function valider() {
    if (!complet) return;
    onValider(decisions as boolean[]);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationOriginaleLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNES_ECRANS.acceptRejet}</p>
      <div className="liste-morceaux">
        {exercice.candidats.map((cand, i) => (
          <div key={i} className="liste-morceaux-ligne">
            <p className="prompt-text prompt-text--question-multiple">
              <Katex expression={formatCandidatLatex(cand.x)} />
            </p>
            <div className="options-grid-compact">
              <button
                type="button"
                className={`btn${decisions[i] === true ? " toggle-active" : ""}${montrerErreurs && decisions[i] === true ? " is-erronee" : ""}`}
                disabled={!!validation} onClick={() => choisir(i, true)}
              >
                À accepter
              </button>
              <button
                type="button"
                className={`btn${decisions[i] === false ? " toggle-active" : ""}${montrerErreurs && decisions[i] === false ? " is-erronee" : ""}`}
                disabled={!!validation} onClick={() => choisir(i, false)}
              >
                À rejeter
              </button>
            </div>
          </div>
        ))}
      </div>
      <AidesCyclo aide1={aideAcceptRejet1(exercice)} aide2={aideAcceptRejet2(exercice)} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <MessageRetourCyclo blocage={null} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

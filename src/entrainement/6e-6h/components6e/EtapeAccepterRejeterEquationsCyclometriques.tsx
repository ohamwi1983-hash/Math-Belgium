import { useState } from "react";
import type { ExerciceEquationsCyclometriques } from "../core6e/equationsCyclometriques.types";
import {
  CONSIGNE_GENERALE,
  MAX_DEN,
  formatCandidatLatex,
  formatEquationNonCycloLatex,
  formatEquationOriginaleLatex,
  texteAideAcceptRejetNiveau1,
  texteAideAcceptRejetNiveau2,
} from "../ui6e/formatEquationsCyclometriques";
import { formatEnsembleReelLatex } from "../ui6e/formatEnsembleReel";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "../components/Katex";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationsCyclometriques;
  estPremierEcran: boolean;
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
export function EtapeAccepterRejeterEquationsCyclometriques({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
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
        estPremierEcran={estPremierEcran}
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationOriginaleLatex(exercice)} />
          </div>
        }
      />
      <EtatActuelPanel label="CE établie à l'étape 1" latex={formatEnsembleReelLatex(exercice.ce, MAX_DEN)} />
      {exercice.variante === "arcfonctionsDifferentes" && (
        <EtatActuelPanel label="Condition de compatibilité des codomaines (étape 2)" latex={formatEnsembleReelLatex(exercice.conditionParasite, MAX_DEN)} />
      )}
      <EtatActuelPanel label="Équation non cyclométrique (étape précédente)" latex={formatEquationNonCycloLatex(exercice)} />
      <p className="prompt-text">Pour chaque solution trouvée à l'étape précédente, accepte-la ou rejette-la.</p>
      <div className="liste-morceaux">
        {exercice.candidats.map((cand, i) => (
          <div key={i} className="liste-morceaux-ligne">
            <p className="prompt-text">
              <Katex expression={formatCandidatLatex(cand.x)} />
            </p>
            <div className="options-grid-compact">
              <button
                type="button"
                className={`btn${decisions[i] === true ? " toggle-active" : ""}${montrerErreurs && decisions[i] === true ? " is-erronee" : ""}`}
                onClick={() => choisir(i, true)}
              >
                À accepter
              </button>
              <button
                type="button"
                className={`btn${decisions[i] === false ? " toggle-active" : ""}${montrerErreurs && decisions[i] === false ? " is-erronee" : ""}`}
                onClick={() => choisir(i, false)}
              >
                À rejeter
              </button>
            </div>
          </div>
        ))}
      </div>
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideAcceptRejetNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <>
              <p>{texteAideAcceptRejetNiveau2(exercice).texte}</p>
              <Katex expression={texteAideAcceptRejetNiveau2(exercice).latex} block />
            </>
          )}
        </div>
      )}
    </div>
  );
}

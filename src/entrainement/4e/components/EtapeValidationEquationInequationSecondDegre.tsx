import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ReponseIntervalle } from "../moteur/verificationEquationInequationSecondDegre";
import { diagnostiquerValidationInequation, verifierValidationEquation } from "../moteur/verificationEquationInequationSecondDegre";
import { NIVEAU_AIDE_MAX_VALIDATION } from "../moteur/sessionEquationInequationSecondDegre";
import {
  consigneValidation,
  formatDonneesAvecResolutionLatex,
  libelleBoutonAide,
  texteAideValidationNiveau1,
  texteAideValidationNiveau2,
  texteAideValidationNiveau3,
} from "../ui/formatEquationInequationSecondDegre";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceOptimisation } from "./EnonceOptimisation";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceEquationInequationSecondDegre;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValiderEquation: (reponses: boolean[]) => void;
  onValiderInequation: (reponse: ReponseIntervalle) => void;
}

/** Écran 6 — écran-pivot, structure DIFFÉRENTE selon la variante : classification racine par
 * racine (`equation`) ou 2 bornes numériques (`inequation`, intersection avec le domaine). */
export function EtapeValidationEquationInequationSecondDegre({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  onActiverAide,
  onValiderEquation,
  onValiderInequation,
}: Props) {
  const apresEchec = tentativesUtilisees > 0;
  const aide = (
    <>
      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideValidationNiveau1()}</p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={texteAideValidationNiveau2(exercice)} block />
            </p>
          )}
          {niveauAide >= 3 && <p>{texteAideValidationNiveau3(exercice)}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_VALIDATION} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_VALIDATION)}
      </button>
    </>
  );

  if (exercice.variante === "equation") {
    const candidates = exercice.racinesCandidates;
    return (
      <EcranValidationEquation
        exercice={exercice}
        candidates={candidates}
        apresEchec={apresEchec}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        aide={aide}
        onValider={onValiderEquation}
      />
    );
  }

  return (
    <EcranValidationInequation
      exercice={exercice}
      apresEchec={apresEchec}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      aide={aide}
      onValider={onValiderInequation}
    />
  );
}

interface PropsEquation {
  exercice: Extract<ExerciceEquationInequationSecondDegre, { variante: "equation" }>;
  candidates: [number, number];
  apresEchec: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  aide: React.ReactNode;
  onValider: (reponses: boolean[]) => void;
}

function EcranValidationEquation({ exercice, candidates, apresEchec, tentativesUtilisees, tentativesMax, aide, onValider }: PropsEquation) {
  const [reponses, setReponses] = useState<(boolean | null)[]>(candidates.map(() => null));
  const complet = reponses.every((r) => r !== null);
  const erronee = apresEchec && complet && !verifierValidationEquation(exercice, reponses as boolean[]);
  /** Cible par racine (dans l'ordre de `candidates`, déjà trié croissant comme `racinesCandidates`)
   * — nécessaire pour ne mettre en rouge QUE le bouton effectivement sélectionné et effectivement
   * faux (audit checklist chapitre 1, point 8) : `erronee` seul est un statut global pour tout
   * l'exercice, jamais par racine, donc marquait à tort les 2 boutons de CHAQUE racine (y compris
   * les racines correctement classées et le bouton non cliqué). */
  const cibles = candidates.map((x) => exercice.racinesValides.includes(x));

  function choisir(index: number, valeur: boolean) {
    setReponses(reponses.map((r, i) => (i === index ? valeur : r)));
  }

  return (
    <div>
      <EnonceOptimisation exercice={exercice.base} />
      <EtatActuelPanel latex={formatDonneesAvecResolutionLatex(exercice)} />
      <p className="prompt-text">{consigneValidation(exercice)}</p>

      {candidates.map((x, index) => {
        const racineErronee = erronee && reponses[index] !== cibles[index];
        return (
          <div key={index} className="triangle-quelconque-aide">
            <p>
              <Katex expression={`${exercice.base.contexte.labelVariable} = ${x}`} />
            </p>
            <div className="options-grid-compact">
              <button
                type="button"
                className={`btn${reponses[index] === true ? " toggle-active" : ""}${racineErronee && reponses[index] === true ? " is-erronee" : ""}`}
                onClick={() => choisir(index, true)}
              >
                Valide
              </button>
              <button
                type="button"
                className={`btn${reponses[index] === false ? " toggle-active" : ""}${racineErronee && reponses[index] === false ? " is-erronee" : ""}`}
                onClick={() => choisir(index, false)}
              >
                Non valide
              </button>
            </div>
          </div>
        );
      })}

      {aide}

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(reponses as boolean[])}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}

interface PropsInequation {
  exercice: Extract<ExerciceEquationInequationSecondDegre, { variante: "inequation" }>;
  apresEchec: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  aide: React.ReactNode;
  onValider: (reponse: ReponseIntervalle) => void;
}

function EcranValidationInequation({ exercice, apresEchec, tentativesUtilisees, tentativesMax, aide, onValider }: PropsInequation) {
  const [inf, setInf] = useState("");
  const [sup, setSup] = useState("");
  const complet = inf.trim() !== "" && sup.trim() !== "";
  const reponse: ReponseIntervalle = { inf, sup };
  const statut = complet ? diagnostiquerValidationInequation(exercice, reponse) : undefined;
  const statutGlobal = statut
    ? statut.inf === "parse_error" || statut.sup === "parse_error"
      ? "parse_error"
      : statut.inf === "correct" && statut.sup === "correct"
        ? "correct"
        : "not_equivalent"
    : undefined;

  return (
    <div>
      <EnonceOptimisation exercice={exercice.base} />
      <EtatActuelPanel latex={formatDonneesAvecResolutionLatex(exercice)} />
      <p className="prompt-text">{consigneValidation(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-inequation-validation-inf">
            <Katex expression={`${exercice.base.contexte.labelVariable}_{min} =`} />
          </label>
          <input
            id="equation-inequation-validation-inf"
            className={`text-input${apresEchec && statut && statut.inf !== "correct" ? " is-erronee" : ""}`}
            value={inf}
            onChange={(e) => setInf(e.target.value)}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-inequation-validation-sup">
            <Katex expression={`${exercice.base.contexte.labelVariable}_{max} =`} />
          </label>
          <input
            id="equation-inequation-validation-sup"
            className={`text-input${apresEchec && statut && statut.sup !== "correct" ? " is-erronee" : ""}`}
            value={sup}
            onChange={(e) => setSup(e.target.value)}
          />
        </div>
      </div>

      {aide}

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
        </p>
      )}
    </div>
  );
}

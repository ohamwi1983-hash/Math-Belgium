import { useState } from "react";
import type { ExerciceEgaliteExpressions } from "../core5e/equationsTrigonometriques.types";
import { CONSIGNE_SOLUTIONS_EGALITE } from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG, TEXTE_AIDE_SOLUTIONS_NIVEAU1, TEXTE_AIDE_SOLUTIONS_NIVEAU2 } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceEgaliteExpressions;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (textes: string[]) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran final (famille "egalite") — solutions distinctes dans [0;2π[, add-as-needed. Régime
 * toujours "exact" pour cette famille (voir CLAUDE.md — b1/b2 toujours fraction de π). */
export function EtapeSolutionsEgalite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesErronee = montrerErreurs && !!diagnostiquer && diagnostiquer(lignes) !== "correct";
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");
  const pointsAffiches = niveauAide >= 2 && exercice.solutions.length > 0 ? [exercice.solutions[0]] : [];

  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(lignes));
    onValider(lignes);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <p className="prompt-text">{CONSIGNE_SOLUTIONS_EGALITE}</p>
      {niveauAide >= 2 && <CercleTrigEquationSketch points={pointsAffiches} regime="exact" />}
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${lignesErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => setLignes((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder="ex : pi/6"
            />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => setLignes((arr) => arr.filter((_, j) => j !== i))}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={() => setLignes((arr) => [...arr, ""])}>
        + Ajouter une solution
      </button>
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_SOLUTIONS_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_SOLUTIONS_NIVEAU2}</p>}
        </div>
      )}
    </div>
  );
}

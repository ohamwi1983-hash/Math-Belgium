import { useState } from "react";
import type { ExerciceEgaliteExpressions } from "../core5e/equationsTrigonometriques.types";
import {
  CONSIGNE_RESOUDRE_EGALITE,
  formatAideResoudreEgaliteNiveau2Latex,
  formatTermesEtatActuelEgalite,
  texteAideResoudreEgaliteNiveau1,
} from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
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
  onValider: (lignes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (lignes: string[]) => StatutVerification;
}

/** Bloc "état actuel" — rappelle la conversion déjà confirmée à l'écran précédent
 * ("conversionEgalite", l'équation entière une fois les 2 côtés alignés sur la même fonction). */
function EtatActuelEgalite({ exercice, phase }: { exercice: ExerciceEgaliteExpressions; phase: "resoudreEgalite" | "solutionsEgalite" }) {
  const termes = formatTermesEtatActuelEgalite(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Écran 2 (famille "egalite", fusionne "appliquer l'identité"/"isoler x" de la spec) — résoudre x
 * directement, add-as-needed pré-rempli au nombre de branches réelles (1 pour tanVersTan, 2
 * sinon). */
export function EtapeResoudreEgalite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [lignes, setLignes] = useState<string[]>(() => Array.from({ length: Math.max(1, exercice.branches.length) }, () => ""));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesErronee = montrerErreurs && !!diagnostiquer && diagnostiquer(lignes) !== "correct";
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");
  const aide2 = formatAideResoudreEgaliteNiveau2Latex(exercice);

  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(lignes));
    onValider(lignes);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <EtatActuelEgalite exercice={exercice} phase="resoudreEgalite" />
      <p className="prompt-text">{CONSIGNE_RESOUDRE_EGALITE}</p>
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${lignesErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => setLignes((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder="ex : pi/6 + k*2*pi"
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
        + Ajouter une série
      </button>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideResoudreEgaliteNiveau1(exercice)}</p>
          {niveauAide >= 2 && aide2.map((formule, i) => <Katex key={i} expression={formule} block />)}
        </div>
      )}
    </div>
  );
}

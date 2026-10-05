import { useState } from "react";
import type { ExerciceEquationTrig } from "../core5e/equationsTrigonometriques.types";
import { ANNONCE_PRECISION_DECIMAL, CONSIGNE_GENERALE_EQUATION_TRIG, formatEquationEnonceLatex } from "../ui5e/formatEquationTrig";
import { formatTermesEtatActuelDirecte } from "../ui5e/formatEquationTrigonometrique";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceEquationTrig;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (lignes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (lignes: string[]) => StatutVerification;
}

/** Bloc "état actuel" — rappelle l'argument déjà posé à l'écran précédent ("argument"), sous forme
 * symbolique (D.2 — l'argument réel substitué, jamais le bare "u"). */
function EtatActuelDirecte({ exercice, phase }: { exercice: ExerciceEquationTrig; phase: "isolerX" | "solutions" }) {
  const termes = formatTermesEtatActuelDirecte(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Écran 2 (absent si `exercice.aucuneSolution`) — isoler x=(u-b)/a. Add-as-needed, pré-rempli au
 * nombre de branches déjà confirmées à l'écran 1 (connu avec certitude à ce stade). D.2 : AUCUNE
 * aide sur cet écran (`niveauAideMaxEquationTrig` plafonne cette phase à 0, voir
 * `moteur5e/sessionEquationTrig.ts`) — le bouton et le bloc d'aide sont donc entièrement absents. */
export function EtapeIsolerXEquationTrig({ exercice, tentativesUtilisees, tentativesMax, onValider, diagnostiquer }: Props) {
  const [lignes, setLignes] = useState<string[]>(() => Array.from({ length: Math.max(1, exercice.branchesU.length) }, () => ""));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesErronee = montrerErreurs && !!diagnostiquer && diagnostiquer(lignes) !== "correct";
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

  function ajouterLigne() {
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(lignes));
    onValider(lignes);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <div className="equation-box">
        <Katex expression={formatEquationEnonceLatex(exercice)} block />
      </div>
      <EtatActuelDirecte exercice={exercice} phase="isolerX" />
      <p className="prompt-text">
        Résous ces équations ci-dessus et donne les valeurs de x.
        {exercice.regime === "decimal" && ANNONCE_PRECISION_DECIMAL}
      </p>
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${lignesErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => modifierLigne(i, e.target.value)}
              placeholder="ex : pi/6 + k*pi"
            />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerLigne(i)}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={ajouterLigne}>
        + Ajouter une série
      </button>
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
    </div>
  );
}

import { useState } from "react";
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import { consigneGenerale, consigneTermesSuccessifs, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteRecurrenteAffine";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteRecurrenteAffine } from "./EtatActuelSuiteRecurrenteAffine";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceSuiteRecurrenteAffine;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs — voir `EtapePoserRecurrence.tsx`, même motif (A.1). */
  diagnostiquer?: (textes: string[]) => StatutVerification;
}

/** Écran bonus (spec : "optionnel") — construit u2/u3/u4 pour observer empiriquement la
 * convergence (ou la divergence) vers/loin du régime permanent. Simplification assumée : 3 champs
 * FIXES plutôt que l'add-as-needed suggéré par la spec — même mécanique de compétence (appliquer
 * la récurrence pas à pas), format déjà établi ailleurs sur la plateforme (ex. 5gen17 `dixTermes`). */
export function EtapeTermesSuccessifs({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState(["", "", ""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const aide2 = texteAideNiveau2(exercice, "termesSuccessifs");
  const labels = [`${exercice.variableGrandeur}_2=`, `${exercice.variableGrandeur}_3=`, `${exercice.variableGrandeur}_4=`];

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(valeurs));
    onValider(valeurs);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <EtatActuelSuiteRecurrenteAffine exercice={exercice} phase="termesSuccessifs" />
      <p className="prompt-text">{consigneTermesSuccessifs(exercice)}</p>
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input type="text" className="text-input" value={valeurs[i]} onChange={(e) => modifier(i, e.target.value)} />
        </div>
      ))}
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
          <Katex expression={texteAideNiveau1(exercice, "termesSuccessifs")} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import { consigneGenerale, consignePoserRecurrence, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteRecurrenteAffine";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
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
  onValider: (texte: string) => void;
  /**
   * Statut à 3 valeurs — calculé côté PRÉSENTATION uniquement (motif A.1, déjà prouvé sur 5gen2),
   * jamais consommé par le score/les tentatives. Optionnel : un appelant qui ne le fournit pas
   * garde le message générique historique.
   */
  diagnostiquer?: (texte: string) => StatutVerification;
}

export function EtapePoserRecurrence({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const aide2 = texteAideNiveau2(exercice, "poserRecurrence");

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <EtatActuelSuiteRecurrenteAffine exercice={exercice} phase="poserRecurrence" />
      <p className="prompt-text">{consignePoserRecurrence(exercice)}</p>
      <ApercuExpressionLatex texte={texte} label={`${exercice.variableGrandeur}_n+1 =`} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={`${exercice.variableGrandeur}_{n+1}=`} />
        </label>
        <input type="text" className="text-input" value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 0.75*x+3" />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <Katex expression={texteAideNiveau1(exercice, "poserRecurrence")} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}

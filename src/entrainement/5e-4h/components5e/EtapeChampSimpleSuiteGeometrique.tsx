import { useState } from "react";
import type { ExerciceSuiteGeometrique } from "../core5e/suitesGeometriques.types";
import type { PhaseSuiteGeometrique } from "../moteur5e/typesSuiteGeometrique";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, labelPhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteGeometrique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteGeometrique } from "./EtatActuelSuiteGeometrique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceSuiteGeometrique;
  phase: PhaseSuiteGeometrique;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs (A.1) calculé côté PRÉSENTATION uniquement — jamais consommé par le score/
   * les tentatives. Optionnel : un appelant qui ne le fournit pas garde le message générique. */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran à UN SEUL champ texte libre — réutilisé par 13 des 26 phases de 5gen15 (trouverU1/B1/B2,
 * formuleGenerale/B1/B2, termeEloigne/B1/B2, sommeSn/B1/B2, resoudreXMoyenneSimple). `App5gen15.tsx`
 * le rend avec `key={indexExercice-phase}` (même leçon que le reste du chantier 5e). */
export function EtapeChampSimpleSuiteGeometrique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  const aide2 = texteAideNiveau2(exercice, phase);

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteGeometrique exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelPhase(exercice, phase)} />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="ex : 12, -3/2..."
        />
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
          <Katex expression={texteAideNiveau1(exercice, phase)} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}

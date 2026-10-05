import { useState } from "react";
import type { ExerciceSuiteClassique } from "../core5e/suitesClassiques.types";
import type { PhaseSuiteClassique } from "../moteur5e/typesSuiteClassique";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, labelPhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteClassique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteClassique } from "./EtatActuelSuiteClassique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceSuiteClassique;
  phase: PhaseSuiteClassique;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /**
   * Statut à 3 valeurs (correct/not_equivalent/parse_error) calculé côté PRÉSENTATION uniquement,
   * pour différencier le message affiché après une tentative échouée (convention CLAUDE.md,
   * "Statut de vérification à 3 valeurs" — motif A.1, déjà prouvé sur 5gen2) — jamais consommé par
   * `etapeTentatives.ts`/le score, qui reste piloté par le booléen historique que `onValider`
   * déclenche côté moteur. Optionnel : un appelant qui ne le fournit pas garde le message générique
   * historique.
   */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran à UN SEUL champ texte libre — réutilisé par 10 des 26 phases de 5gen17. */
export function EtapeChampSimpleClassique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const aide2 = texteAideNiveau2(exercice, phase);

  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice, phase).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteClassique exercice={exercice} phase={phase} />
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

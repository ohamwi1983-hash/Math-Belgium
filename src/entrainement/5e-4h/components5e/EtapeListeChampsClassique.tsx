import { useState } from "react";
import type { ExerciceSuiteClassique } from "../core5e/suitesClassiques.types";
import type { PhaseSuiteClassique } from "../moteur5e/typesSuiteClassique";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, labelsListe, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteClassique";
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
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs — voir `EtapeChampSimpleClassique.tsx`, même motif (A.1). */
  diagnostiquer?: (textes: string[]) => StatutVerification;
  /** Statut à 3 valeurs d'UN SEUL champ (A.2 — highlight rouge indépendant par champ). */
  diagnostiquerChamp?: (index: number, texte: string) => StatutVerification;
}

/** Écran à PLUSIEURS champs numériques FIXES (jamais add-as-needed) — réutilisé par 10 des 26
 * phases de 5gen17 (2 à 10 champs selon la phase, `labelsListe` détermine le nombre et la casse). */
export function EtapeListeChampsClassique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, diagnostiquerChamp }: Props) {
  const { labels, enLatex } = labelsListe(phase);
  const [valeurs, setValeurs] = useState<string[]>(() => labels.map(() => ""));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const aide2 = texteAideNiveau2(exercice, phase);

  const apresEchec = tentativesUtilisees > 0;
  function champErronee(i: number): boolean {
    return apresEchec && !!diagnostiquerChamp && diagnostiquerChamp(i, valeurs[i]) !== "correct";
  }

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
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice, phase).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteClassique exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">{enLatex ? <Katex expression={label} /> : label}</label>
          <input type="text" className={`text-input${champErronee(i) ? " is-erronee" : ""}`} value={valeurs[i]} onChange={(e) => modifier(i, e.target.value)} />
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
          <Katex expression={texteAideNiveau1(exercice, phase)} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}

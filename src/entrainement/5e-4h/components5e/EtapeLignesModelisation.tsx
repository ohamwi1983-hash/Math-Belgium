import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import { consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BlocDonneesModelisation } from "./BlocDonneesModelisation";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelModelisation } from "./EtatActuelModelisation";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

type PhaseLignes = "isolerTResoudre" | "solutionsResoudre" | "solutionsExtremum";

interface Props {
  exercice: ExerciceModelisationSinusoide;
  phase: PhaseLignes;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (lignes: string[]) => void;
  /** Statut à 3 valeurs (correct/not_equivalent/parse_error), même motif que 5gen2 (A.1) — voir
   * `EtapeChampSimpleModelisation.tsx` pour la documentation complète. */
  diagnostiquer?: (lignes: string[]) => StatutVerification;
}

/** Écran add-as-needed générique — réutilisé par les 3 phases dont la réponse est une simple liste
 * de lignes texte libre (branches en t, ou solutions numériques finales) : "isolerTResoudre",
 * "solutionsResoudre", "solutionsExtremum". `App5gen13.tsx` doit le rendre avec `key={phase}`. */
export function EtapeLignesModelisation({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  /** Les lignes forment UNE seule réponse (l'ensemble des branches/solutions), jamais des champs
   * indépendants — même flag partagé par toute la liste que "pointsErronee" dans
   * `EnsembleReelGuideBuilder.tsx` (A.2). */
  const lignesErronee = apresEchec && !!diagnostiquer && complet && diagnostiquer(lignes) !== "correct";

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

  const libelleAjout = phase === "isolerTResoudre" ? "+ Ajouter une série" : "+ Ajouter une solution";
  const placeholder = phase === "isolerTResoudre" ? "ex : (asin(0.5)-0.7)/0.3 + k*20.9" : "ex : 12.4";

  return (
    <div>
      <BlocDonneesModelisation exercice={exercice} />
      <EtatActuelModelisation exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${lignesErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => modifierLigne(i, e.target.value)}
              placeholder={placeholder}
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
        {libelleAjout}
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
          <p>{texteAideNiveau1(exercice, phase)}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, phase)} block />}
        </div>
      )}
    </div>
  );
}

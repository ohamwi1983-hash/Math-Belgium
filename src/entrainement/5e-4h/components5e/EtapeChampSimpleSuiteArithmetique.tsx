import { useState } from "react";
import type { ExerciceSuiteArithmetique } from "../core5e/suitesArithmetiques.types";
import type { PhaseSuiteArithmetique } from "../moteur5e/typesSuiteArithmetique";
import { PHASES_AIDE1_LATEX, consigneGenerale, consignePhase, formatTermesDonneesLatex, labelPhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteArithmetique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteArithmetique } from "./EtatActuelSuiteArithmetique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

type PhaseChampSimple = "trouverR" | "trouverU1" | "formuleGenerale" | "termeEloigne" | "sommeSn" | "calculerSn" | "resoudreXAlgebrique" | "resoudreRangN";

interface Props {
  exercice: ExerciceSuiteArithmetique;
  phase: PhaseChampSimple;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs (correct/not_equivalent/parse_error) calculé côté PRÉSENTATION uniquement,
   * pour différencier le message affiché après une tentative échouée — jamais consommé par
   * `etapeTentatives.ts`/le score, toujours piloté par le booléen historique via `onValider`.
   * Optionnel : un appelant qui ne le fournit pas garde le message générique historique. */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran à UN SEUL champ texte libre — réutilisé par 6 des 10 phases de 5gen14. `App5gen14.tsx`
 * doit le rendre avec `key={phase}` (leçon retenue de tout le chantier 5e — sans cette clé, React
 * réutilise la même instance entre deux écrans et le champ garde la réponse précédente). */
export function EtapeChampSimpleSuiteArithmetique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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

  const aide2 = texteAideNiveau2(exercice, phase as PhaseSuiteArithmetique);
  const aide1EnLatex = PHASES_AIDE1_LATEX.has(phase as PhaseSuiteArithmetique);
  // "formuleGenerale" est le SEUL écran de ce composant dont la réponse est une expression en n
  // (jamais une valeur numérique isolée) — placeholder dédié, jamais le générique "ex : 12, -3/2..."
  // qui suggérerait à tort un simple nombre (`prompt5gen14corrections.md`). "resoudreRangN" attend
  // TOUJOURS un entier positif (jamais de fraction/décimal, validation stricte côté
  // `diagnostiquerRangEntierPositif`) — placeholder dédié pour ne pas suggérer une forme fractionnaire
  // (`prompt5gen14remplacementvariante.md`).
  const placeholder = phase === "formuleGenerale" ? "ex : 5+(n-1)*3" : phase === "resoudreRangN" ? "ex : 12" : "ex : 12, -3/2...";

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteArithmetique exercice={exercice} phase={phase as PhaseSuiteArithmetique} />
      <p className="prompt-text">{consignePhase(exercice, phase as PhaseSuiteArithmetique)}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelPhase(exercice, phase as PhaseSuiteArithmetique)} />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={placeholder}
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
          {aide1EnLatex ? <Katex expression={texteAideNiveau1(exercice, phase as PhaseSuiteArithmetique)} block /> : <p>{texteAideNiveau1(exercice, phase as PhaseSuiteArithmetique)}</p>}
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}

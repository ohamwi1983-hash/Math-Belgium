import { useState } from "react";
import type { ExerciceSuiteGeometrique } from "../core5e/suitesGeometriques.types";
import type { PhaseSuiteGeometrique } from "../moteur5e/typesSuiteGeometrique";
import type { ReponseEquation } from "../moteur5e/sessionSuiteGeometrique";
import { consigneGenerale, consignePhase, consignePoserEquationAlgebriqueValeurLatex, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteGeometrique";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteGeometrique } from "./EtatActuelSuiteGeometrique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

type PhasePoserEquation = "poserEquationAlgebrique" | "poserEquationRangN";

interface Props {
  exercice: ExerciceSuiteGeometrique;
  phase: PhasePoserEquation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEquation) => void;
  /** Statut à 3 valeurs calculé côté PRÉSENTATION uniquement — optionnel, un appelant qui ne le
   * fournit pas garde le message générique historique. */
  diagnostiquer?: (reponse: ReponseEquation) => StatutVerification;
}

/** Écran "poserEquationAlgebrique" (familles "algebriqueTermeGeneral"/"algebriqueSommeSn") ou
 * "poserEquationRangN" (famille "algebriqueRangN") — REFONTE `prompt5gen15refontefamillesbonus.md`,
 * miroir direct de `EtapePoserEquation.tsx` (5gen14) : UN SEUL champ texte libre où l'élève tape
 * l'équation COMPLÈTE, "=" inclus (ex. `5x-47=-x+16-x+19` ou `12*2^(n-1)=768`). */
export function EtapePoserEquationGeometrique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = texte.trim() !== "";
  const aide2 = texteAideNiveau2(exercice, phase);
  const valeurLatexPoserEquation =
    phase === "poserEquationAlgebrique" && (exercice.famille === "algebriqueTermeGeneral" || exercice.famille === "algebriqueSommeSn")
      ? consignePoserEquationAlgebriqueValeurLatex(exercice)
      : null;
  const apresEchec = tentativesUtilisees > 0;
  const equationErronee = apresEchec && !!diagnostiquer && complet && diagnostiquer({ texte }) !== "correct";
  const placeholder = phase === "poserEquationRangN" ? "ex : 12*2^(n-1)=768" : "ex : 5x-47=-x+16-x+19";

  function valider() {
    if (!complet) return;
    const reponse: ReponseEquation = { texte };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteGeometrique exercice={exercice} phase={phase as PhaseSuiteGeometrique} />
      <p className="prompt-text">{consignePhase(exercice, phase as PhaseSuiteGeometrique)}</p>
      {valeurLatexPoserEquation !== null && <Katex expression={valeurLatexPoserEquation} block />}
      <ApercuExpressionLatex texte={texte} />
      <div className="field-row">
        <input
          type="text"
          className={`text-input${equationErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={placeholder}
        />
      </div>
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
          <Katex expression={texteAideNiveau1(exercice, phase as PhaseSuiteGeometrique)} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}

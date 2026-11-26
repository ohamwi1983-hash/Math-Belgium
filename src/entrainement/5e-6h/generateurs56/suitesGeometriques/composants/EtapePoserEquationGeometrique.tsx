// Copie 5e (6h) de `5e-4h/components5e/EtapePoserEquationGeometrique.tsx` (56gen2 ← 5gen15, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { normaliserSigneMoins } from "../../../../../lib/normaliserSaisie";
import { useState } from "react";
import type { ExerciceSuiteGeometrique } from "../../../../5e-4h/core5e/suitesGeometriques.types";
import type { PhaseSuiteGeometrique } from "../moteur/typesSuiteGeometrique";
import type { ReponseEquation } from "../moteur/sessionSuiteGeometrique";
import { consigneGenerale, consignePhase, consignePoserEquationAlgebriqueValeurLatex, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2, noteAideNiveau1 } from "../ui/formatSuiteGeometrique";
import { ApercuExpressionLatex } from "../../../../5e-4h/components/ApercuExpressionLatex";
import { Katex } from "../../../../5e-4h/components/Katex";
import { ValidationEcran } from "../../../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../../../components/ValidationEcran";
import { BoutonAide } from "../../../../5e-4h/components5e/BoutonAide";
import { EnTeteExercice } from "../../../../5e-4h/components5e/EnTeteExercice";
import { MESSAGE_SOLUTION_DIRECTE, estSolutionDirecte } from "../../../../5e-4h/moteur5e/saisieNombreSuites";
import { formatMessageErreur } from "../../../../5e-4h/ui/messageErreur";
import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { TexteInsistance } from "../../../../components/TexteInsistance";

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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "poserEquationAlgebrique" (familles "algebriqueTermeGeneral"/"algebriqueSommeSn") ou
 * "poserEquationRangN" (famille "algebriqueRangN") — REFONTE `prompt5gen15refontefamillesbonus.md`,
 * miroir direct de `EtapePoserEquation.tsx` (5gen14) : UN SEUL champ texte libre où l'élève tape
 * l'équation COMPLÈTE, "=" inclus (ex. `5x-47=-x+16-x+19` ou `12*2^(n-1)=768`). */
export function EtapePoserEquationGeometrique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
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
  // Exemples hors de l'espace des tirages (u₁ = 12 impossible avec q = 2 ; forme d'équation libre).
  const placeholder = phase === "poserEquationRangN" ? "ex : 12×2^(n−1)=768" : "ex : 5x−47=2(x+16)";
  const inconnue = phase === "poserEquationRangN" ? "n" : "x";
  const [solutionDirecte, setSolutionDirecte] = useState(false);

  function valider() {
    if (!complet) return;
    // « x = −3 » : c'est la solution, pas l'équation demandée — refusé sans consommer de tentative.
    if (estSolutionDirecte(texte, inconnue)) {
      setSolutionDirecte(true);
      return;
    }
    setSolutionDirecte(false);
    const reponse: ReponseEquation = { texte };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{consignePhase(exercice, phase as PhaseSuiteGeometrique)}</p>
      {valeurLatexPoserEquation !== null && <Katex expression={valeurLatexPoserEquation} block />}
      <ApercuExpressionLatex texte={texte} />
      <div className="field-row">
        <input
          type="text"
          className={`text-input${equationErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => {
            setTexte(normaliserSigneMoins(e.target.value));
            setSolutionDirecte(false);
          }}
          placeholder={placeholder}
        />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          {noteAideNiveau1(exercice, phase as PhaseSuiteGeometrique) && <p><TexteInsistance texte={noteAideNiveau1(exercice, phase as PhaseSuiteGeometrique)} /></p>}
          <Katex expression={texteAideNiveau1(exercice, phase as PhaseSuiteGeometrique)} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {solutionDirecte && (
          <p className="alert-error" role="alert">
            {MESSAGE_SOLUTION_DIRECTE}
          </p>
        )}
        {montrerErreurs && !solutionDirecte && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

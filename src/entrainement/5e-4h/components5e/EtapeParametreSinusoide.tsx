import { useState } from "react";
import type { ExerciceParametresSinusoide } from "../core5e/parametresSinusoide.types";
import type { PhaseParametresSinusoide } from "../moteur5e/typesParametresSinusoide";
import {
  consigneGenerale,
  consignePhase,
  formatFormuleLatex,
  formatTermesEtatActuelParametresSinusoideLatex,
  labelPhase,
  latexAideNiveau2,
  texteAideNiveau1,
} from "../ui5e/formatParametresSinusoide";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceParametresSinusoide;
  phase: PhaseParametresSinusoide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs calculé côté présentation (promptcorrectionsregroupees.md, A.1), jamais
   * consommé par le score — optionnel, comportement générique inchangé sans lui. */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Bloc "état actuel" — rappelle les paramètres déjà CONFIRMÉS avant l'écran courant (jamais la
 * saisie brute de l'élève, dérivé uniquement de `exercice`) ; absent sur le premier écran
 * (amplitude), rien à rappeler. Même patron que `EtatActuelCE` (5gen1). */
function EtatActuelParametresSinusoide({ exercice, phase }: { exercice: ExerciceParametresSinusoide; phase: PhaseParametresSinusoide }) {
  const termes = formatTermesEtatActuelParametresSinusoideLatex(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/**
 * Écran UNIQUE, paramétré par la phase courante — les 5 écrans du générateur (A, φ, T, f, b)
 * réutilisent tous ce composant. `App5gen8.tsx` doit le rendre avec `key={phase}` (leçon retenue de
 * 5gen6/5gen7 : sans cette clé, React réutilise la même instance entre deux phases et le champ
 * `texte` local garde la réponse de l'écran précédent). Consigne générale + bloc de données
 * (formule tirée) redondants sur les 5 écrans (convention transversale de la plateforme).
 */
export function EtapeParametreSinusoide({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatFormuleLatex(exercice)).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <EtatActuelParametresSinusoide exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(phase)}</p>
      <ApercuExpressionLatex texte={texte} label={labelPhase(phase)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">{labelPhase(phase)}</label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="ex : 3, pi/4, sqrt(2)..."
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
          <p>{texteAideNiveau1(phase)}</p>
          {niveauAide >= 2 && <Katex expression={latexAideNiveau2(exercice, phase)} block />}
        </div>
      )}
    </div>
  );
}

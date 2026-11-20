import { useState } from "react";
import type { ExerciceParametresSinusoide } from "../core5e/parametresSinusoide.types";
import type { PhaseParametresSinusoide } from "../moteur5e/typesParametresSinusoide";
import {
  aideNiveau1,
  consigneGenerale,
  consignePhase,
  formatFormuleLatex,
  labelPhase,
  latexAideNiveau2,
  placeholderPhase,
} from "../ui5e/formatParametresSinusoide";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { aidesParametreSinusoide, messageCibleParametreSinusoide } from "../ui5e/aidesTrigonometrie";
import { cibleAmplitude, cibleDecalage, cibleDecalageHorizontal, cibleDephasagePhase, ciblePeriode, ciblePulsation } from "../moteur5e/verificationParametresSinusoide";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran UNIQUE, paramétré par la phase courante — les 7 écrans du générateur (A, ω, T, f, φ, Φ, b)
 * réutilisent tous ce composant. `App5gen8.tsx` doit le rendre avec `key={phase}` (leçon retenue de
 * 5gen6/5gen7 : sans cette clé, React réutilise la même instance entre deux phases et le champ
 * `texte` local garde la réponse de l'écran précédent). Consigne générale + bloc de données
 * (formule tirée) redondants sur les 7 écrans (convention transversale de la plateforme). Les
 * paramètres déjà confirmés sont présentés par `RecapitulatifPanel` (`App5gen8.tsx`,
 * `ui5e/recapitulatifParametresSinusoide.ts`), plus l'ancien bloc "état actuel" local
 * (`EtatActuelParametresSinusoide`, retiré ici — doublon visuel).
 */
export function EtapeParametreSinusoide({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = saisie.illisible || (apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct");

  const valeurs = {
    A: exercice.A.signe * cibleAmplitude(exercice),
    omega: ciblePulsation(exercice),
    T: ciblePeriode(exercice),
    phi: cibleDephasagePhase(exercice),
    Phi: cibleDecalageHorizontal(exercice),
    b: cibleDecalage(exercice),
  };
  /** Écran de lecture dans la formule (accolade) plutôt que de calcul. */
  const lecture = phase === "amplitude" || phase === "pulsation" || phase === "decalage" || (phase === "dephasage" && exercice.forme === "developpee") || (phase === "phi" && exercice.forme === "prefactorisee");

  function valider() {
    if (texte.trim() === "") return;
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(texte, estLisible(diagnostiquer?.(texte)), onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale()}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {decouperEquationLongueLatex(formatFormuleLatex(exercice)).map((morceau, i) => (
              <Katex key={i} expression={morceau} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{consignePhase(phase)}</p>
      <ApercuExpressionLatex texte={texte} label={labelPhase(phase)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">{labelPhase(phase)}</label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={placeholderPhase(phase)}
        />
      </div>
      <AidesTrig niveauAide={niveauAide} aides={aidesParametreSinusoide(aideNiveau1(phase), latexAideNiveau2(exercice, phase), lecture)} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ="nombre"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? messageCibleParametreSinusoide(saisie.soumise, phase, valeurs) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

import { useState } from "react";
import type { ExerciceEquationTrig } from "../core5e/equationsTrigonometriques.types";
import { ANNONCE_PRECISION_DECIMAL, CONSIGNE_GENERALE_EQUATION_TRIG, formatBrancheLatex, formatEquationEnonceLatex, relationBranche } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { aidesSolutions, messageCibleSolutions } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationTrig;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (textes: string[]) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 3 (absent si `exercice.aucuneSolution`) — lister les solutions distinctes dans [0;2π[.
 * Add-as-needed, cercle trigonométrique VIDE tant que l'aide 2 n'est pas activée (jamais donner la
 * réponse en avance) — l'aide 2 y place alors le PREMIER point à titre d'exemple seulement. */
export function EtapeSolutionsEquationTrig({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const saisie = useTentativeLisible<string[]>();
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesErronee = (saisie.illisible || montrerErreurs) && !!diagnostiquer && diagnostiquer(lignes) !== "correct";
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

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
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(lignes, estLisible(diagnostiquer?.(lignes)), onValider);
  }

  const pointsAffiches = niveauAide >= 2 && exercice.solutions.length > 0 ? [exercice.solutions[0]] : [];

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_TRIG}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationEnonceLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">
        Donne toutes les solutions de l'équation dans [0 ; 2π[, chaque valeur une seule fois.
        {exercice.regime === "decimal" && ANNONCE_PRECISION_DECIMAL}
      </p>
      {niveauAide >= 2 && <CercleTrigEquationSketch points={pointsAffiches} regime={exercice.regime} />}
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input type="text" className={`text-input${lignesErronee ? " is-erronee" : ""}`} value={ligne} onChange={(e) => modifierLigne(i, e.target.value)} placeholder="ex : 2*pi/5" />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerLigne(i)}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={ajouterLigne}>
        + Ajouter une solution
      </button>
      <AidesTrig niveauAide={niveauAide} aides={aidesSolutions(exercice.branchesX.map((br) => `x ${relationBranche(br)} ${formatBrancheLatex(br)}`))} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ="solutions"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? messageCibleSolutions(saisie.soumise, exercice.solutions) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

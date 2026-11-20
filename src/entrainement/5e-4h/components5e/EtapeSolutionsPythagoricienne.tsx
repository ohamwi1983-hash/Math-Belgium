import { useState } from "react";
import type { ExercicePythagoricienne } from "../core5e/equationsTrigonometriques.types";
import { CONSIGNE_SOLUTIONS_PYTHAGORICIENNE, formatEnonceMixteLatex } from "../ui5e/formatEquationTrigonometrique";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE_EQUATION_TRIG, formatBrancheLatex, relationBranche } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { aidesSolutions, messageCibleSolutions } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExercicePythagoricienne;
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

/** Écran final (famille "pythagoricienne") — union des solutions des racines VALIDES, add-as-needed.
 * Régime toujours "exact" pour cette famille (voir CLAUDE.md — POOL_T ne contient que des valeurs
 * remarquables). */
export function EtapeSolutionsPythagoricienne({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const saisie = useTentativeLisible<string[]>();
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesErronee = (saisie.illisible || montrerErreurs) && !!diagnostiquer && diagnostiquer(lignes) !== "correct";
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");
  const pointsAffiches = niveauAide >= 2 && exercice.solutionsUnion.length > 0 ? [exercice.solutionsUnion[0]] : [];

  function valider() {
    if (!complet) return;
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(lignes, estLisible(diagnostiquer?.(lignes)), onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_TRIG}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceMixteLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_SOLUTIONS_PYTHAGORICIENNE}</p>
      {niveauAide >= 2 && <CercleTrigEquationSketch points={pointsAffiches} regime="exact" />}
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${lignesErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => setLignes((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder="ex : 2π/5"
            />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => setLignes((arr) => arr.filter((_, j) => j !== i))}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={() => setLignes((arr) => [...arr, ""])}>
        + Ajouter une solution
      </button>
      <AidesTrig niveauAide={niveauAide} aides={aidesSolutions([exercice.racine1, exercice.racine2].flatMap((r) => r.resolution?.branchesX ?? []).map((br) => `x ${relationBranche(br)} ${formatBrancheLatex(br)}`))} />
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
          cible={montrerErreurs && saisie.soumise ? messageCibleSolutions(saisie.soumise, exercice.solutionsUnion) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

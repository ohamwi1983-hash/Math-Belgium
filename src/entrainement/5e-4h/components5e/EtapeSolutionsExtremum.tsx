import { useState } from "react";
import type { ExerciceExtremumsSinusoide } from "../core5e/extremumsSinusoide.types";
import {
  consigneGeneraleExtremums,
  consigneSolutionsExtremums,
  formatFonctionSourceLatex,
  formatTermesEtatActuelExtremums,
} from "../ui5e/formatExtremumsSinusoide";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { aidesSolutionsExtremums, messageCibleSolutions } from "../ui5e/aidesTrigonometrie";
import { borneFenetreExtremums, fenetreExtremumsTexte } from "../generateurs5e/extremumsSinusoide";
import { valeurNumerique } from "../generateurs5e/parametresSinusoide/rationnelPi";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceExtremumsSinusoide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`
   * (5gen10). */
  diagnostiquer?: (textes: string[]) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 3 (bonus) — lister les positions d'extremum distinctes dans [0;2π[. Add-as-needed, cercle
 * trigonométrique (réutilise `CercleTrigEquationSketch`, 5gen10) ABSENT DU RENDU tant que l'aide 2
 * n'est pas activée (B.3 : gate sur le COMPOSANT entier, jamais seulement sur ses points — un
 * cercle vide restait visible avant ce correctif) — l'aide 2 le fait alors apparaître avec le
 * PREMIER point placé à titre d'exemple seulement. Régime toujours "exact" (5gen11 n'a jamais de
 * régime décimal). */
export function EtapeSolutionsExtremum({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const saisie = useTentativeLisible<string[]>();
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  // A.2 : un seul diagnostic pour l'ensemble des lignes (comparaison d'ENSEMBLE, ordre indifférent
  // — `diagnostiquerSolutionsExtremum` n'isole pas une ligne fautive en particulier), appliqué
  // uniformément à tous les champs de la liste tant que la réponse globale n'est pas correcte.
  const statutActuel = apresEchec && diagnostiquer ? diagnostiquer(lignes) : undefined;
  const ligneErronee = saisie.illisible || (statutActuel !== undefined && statutActuel !== "correct");

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

  /** Cercle trigonométrique seulement quand les positions sont des angles de [0 ; 2π[ (pas quand x
   * s'écrit sans π, fenêtre [0 ; 2T[ — audit 5e ch. 2, P11). */
  const cercle = borneFenetreExtremums(exercice).degrePi === 1;
  const pointsAffiches = niveauAide >= 2 && exercice.solutions.length > 0 ? [exercice.solutions[0]] : [];

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGeneraleExtremums(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {decouperEquationLongueLatex(formatFonctionSourceLatex(exercice)).map((morceau, i) => (
              <Katex key={i} expression={morceau} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{consigneSolutionsExtremums(exercice)}</p>
      {niveauAide >= 2 && cercle && <CercleTrigEquationSketch points={pointsAffiches} regime="exact" />}
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${ligneErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => modifierLigne(i, e.target.value)}
              placeholder="ex : 2π/5"
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
        + Ajouter une solution
      </button>
      <AidesTrig niveauAide={niveauAide} aides={aidesSolutionsExtremums(formatTermesEtatActuelExtremums(exercice, "solutions")[1], fenetreExtremumsTexte(exercice), cercle)} />
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
          cible={montrerErreurs && saisie.soumise ? messageCibleSolutions(saisie.soumise, exercice.solutions, [], valeurNumerique(borneFenetreExtremums(exercice)), fenetreExtremumsTexte(exercice)) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

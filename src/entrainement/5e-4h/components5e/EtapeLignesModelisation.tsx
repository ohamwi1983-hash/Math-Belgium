import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import { consignePhaseFragments, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { FragmentsConsigneSinusoide } from "./FragmentsConsigneSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { aidesModelisation,    messageCibleModelisationLignes } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran add-as-needed générique — réutilisé par les 3 phases dont la réponse est une simple liste
 * de lignes texte libre (branches en t, ou solutions numériques finales) : "isolerTResoudre",
 * "solutionsResoudre", "solutionsExtremum". `App5gen13.tsx` doit le rendre avec `key={phase}`. */
export function EtapeLignesModelisation({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const saisie = useTentativeLisible<string[]>();
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");
  /** Les lignes forment UNE seule réponse (l'ensemble des branches/solutions), jamais des champs
   * indépendants — même flag partagé par toute la liste que "pointsErronee" dans
   * `EnsembleReelGuideBuilder.tsx` (A.2). */
  const lignesErronee = (saisie.illisible || montrerErreurs) && !!diagnostiquer && complet && diagnostiquer(lignes) !== "correct";

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

  const libelleAjout = phase === "isolerTResoudre" ? "+ Ajouter une série" : "+ Ajouter une solution";
  const placeholder = phase === "isolerTResoudre" ? "ex : 4,7 + k*2,5" : "ex : 12,4";

  return (
    <div>
      <p className="prompt-text"><FragmentsConsigneSinusoide fragments={consignePhaseFragments(exercice, phase)} /></p>
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
      <AidesTrig niveauAide={niveauAide} aides={aidesModelisation(exercice, phase, texteAideNiveau2(exercice, phase))} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ={phase === "isolerTResoudre" ? "solutions" : "solutions"}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? messageCibleModelisationLignes(exercice, phase, saisie.soumise) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

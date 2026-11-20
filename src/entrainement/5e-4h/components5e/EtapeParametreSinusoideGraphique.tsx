import { useState } from "react";
import type { ExerciceParametresSinusoideGraphique } from "../core5e/parametresSinusoideGraphique.types";
import type { PhaseParametresSinusoideGraphique } from "../moteur5e/typesParametresSinusoideGraphique";
import { consigneGenerale, consignePhase, labelPhase, placeholderPhase } from "../ui5e/formatParametresSinusoideGraphique";
import { SinusoideGraph } from "./SinusoideGraph";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { aidesParametreGraphique, messageCibleParametreGraphique, valeursGraphique } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceParametresSinusoideGraphique;
  phase: PhaseParametresSinusoideGraphique;
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
 * Écran UNIQUE, paramétré par la phase courante — les 5 écrans (b, A, T, f, φ) réutilisent tous ce
 * composant. `App5gen9.tsx` le rend avec `key={phase}` DÈS LA CONCEPTION (leçon retenue de
 * 5gen6/5gen7 : sans cette clé, React réutilise la même instance entre deux phases et le champ
 * `texte` local garde la réponse de l'écran précédent). Le graphique reste affiché sur les 5 écrans
 * (traçabilité, convention transversale de la plateforme) ; `phase`/`niveauAide` transmis en plus au
 * graphique (`SinusoideGraph`) pour que l'aide y mette en évidence les points/segments qu'elle décrit
 * — jamais de persistance entre écrans (décision explicite de l'utilisateur, chaque écran suit
 * uniquement ce qui a été demandé pour LUI, voir `pointsAideActive`/`segmentsAideActive`,
 * `ui5e/sinusoideGraph.ts`). Les paramètres déjà confirmés sont présentés par `RecapitulatifPanel`
 * (`App5gen9.tsx`, `ui5e/recapitulatifParametresSinusoideGraphique.ts`), plus l'ancien bloc "état
 * actuel" local (`EtatActuelParametresSinusoideGraphique`, retiré ici — doublon visuel).
 */
export function EtapeParametreSinusoideGraphique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = saisie.illisible || (apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct");

  const valeurs = valeursGraphique(exercice);

  function valider() {
    if (texte.trim() === "") return;
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(texte, estLisible(diagnostiquer?.(texte)), onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale()}
        blocDonnees={<SinusoideGraph exercice={exercice} phase={phase} niveauAide={niveauAide} />}
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
      <AidesTrig niveauAide={niveauAide} aides={aidesParametreGraphique(phase, valeurs.latex)} />
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
          cible={montrerErreurs && saisie.soumise ? messageCibleParametreGraphique(saisie.soumise, phase, valeurs.nombres) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

import { useState } from "react";
import type { ExerciceParametresSinusoideGraphique } from "../core5e/parametresSinusoideGraphique.types";
import type { PhaseParametresSinusoideGraphique } from "../moteur5e/typesParametresSinusoideGraphique";
import {
  consigneGenerale,
  consignePhase,
  formatTermesEtatActuelParametresSinusoideGraphiqueLatex,
  labelPhase,
  texteAideNiveau1,
  texteAideNiveau2,
} from "../ui5e/formatParametresSinusoideGraphique";
import { SinusoideGraph } from "./SinusoideGraph";
import { BoutonAide } from "./BoutonAide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

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
}

/** Bloc "état actuel" — rappelle les paramètres déjà CONFIRMÉS avant l'écran courant (jamais la
 * saisie brute de l'élève, dérivé uniquement de `exercice`) ; absent sur le premier écran
 * (decalage), rien à rappeler. Même patron que `EtatActuelCE` (5gen1)/5gen8. */
function EtatActuelParametresSinusoideGraphique({ exercice, phase }: { exercice: ExerciceParametresSinusoideGraphique; phase: PhaseParametresSinusoideGraphique }) {
  const termes = formatTermesEtatActuelParametresSinusoideGraphiqueLatex(exercice, phase);
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
 * Écran UNIQUE, paramétré par la phase courante — les 5 écrans (b, A, T, f, φ) réutilisent tous ce
 * composant. `App5gen9.tsx` le rend avec `key={phase}` DÈS LA CONCEPTION (leçon retenue de
 * 5gen6/5gen7 : sans cette clé, React réutilise la même instance entre deux phases et le champ
 * `texte` local garde la réponse de l'écran précédent). Le graphique reste affiché sur les 5 écrans
 * (traçabilité, convention transversale de la plateforme) ; `phase`/`niveauAide` transmis en plus au
 * graphique (`SinusoideGraph`) pour que l'aide y mette en évidence les points/segments qu'elle décrit
 * — jamais de persistance entre écrans (décision explicite de l'utilisateur, chaque écran suit
 * uniquement ce qui a été demandé pour LUI, voir `pointsAideActive`/`segmentsAideActive`,
 * `ui5e/sinusoideGraph.ts`).
 */
export function EtapeParametreSinusoideGraphique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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
      <SinusoideGraph exercice={exercice} phase={phase} niveauAide={niveauAide} />
      <EtatActuelParametresSinusoideGraphique exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(phase)}</p>
      <ApercuExpressionLatex texte={texte} label={labelPhase(phase)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">{labelPhase(phase)}</label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="ex : 3, pi/4..."
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
          {niveauAide >= 2 && <p>{texteAideNiveau2(phase)}</p>}
        </div>
      )}
    </div>
  );
}

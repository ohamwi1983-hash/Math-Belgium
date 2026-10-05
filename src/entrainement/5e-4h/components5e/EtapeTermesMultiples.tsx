import { useState } from "react";
import type { ExerciceCoherenceSuiteArithmetique, ExercicePrincipalSuiteArithmetique, ExerciceSuiteArithmetique } from "../core5e/suitesArithmetiques.types";
import { PHASES_AIDE1_LATEX, consigneGenerale, consignePhase, formatTermesDonneesLatex, labelsCalculerTermesAlgebrique, labelsTermesProches, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteArithmetique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteArithmetique } from "./EtatActuelSuiteArithmetique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre } from "../moteur5e/verificationSuiteArithmetique";
import { ciblesCalculerTermesAlgebrique } from "../moteur5e/sessionSuiteArithmetique";

type PhaseTermesMultiples = "termesProches" | "calculerTermesAlgebrique";

interface Props {
  exercice: ExerciceSuiteArithmetique;
  phase: PhaseTermesMultiples;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs calculé côté PRÉSENTATION uniquement (voir `EtapeChampSimpleSuiteArithmetique.tsx`) —
   * optionnel, un appelant qui ne le fournit pas garde le message générique historique. */
  diagnostiquer?: (textes: string[]) => StatutVerification;
}

function labelsPourPhase(exercice: ExerciceSuiteArithmetique, phase: PhaseTermesMultiples): string[] {
  if (phase === "calculerTermesAlgebrique") return labelsCalculerTermesAlgebrique(exercice);
  return labelsTermesProches(exercice as ExercicePrincipalSuiteArithmetique | ExerciceCoherenceSuiteArithmetique);
}

/** Cibles numériques par INDICE (même logique que `diagnostiquerTermesMultiples` côté
 * `App5gen14.tsx` et `soumettreReponseTermesProches`/`soumettreReponseCalculerTermesAlgebrique`
 * côté moteur, répliquée ici pour permettre un diagnostic INDÉPENDANT par champ, positionnel —
 * `diagnostiquerTermes` compare déjà `textes[i]` à `cibles[i]`, jamais un ensemble non ordonné).
 * `calculerTermesAlgebrique` réutilise directement `ciblesCalculerTermesAlgebrique` (moteur),
 * famille/sous-cas-consciente (1 ou 2 champs selon le sous-cas de la famille B, 2 pour la famille A —
 * voir `moteur5e/sessionSuiteArithmetique.ts`). */
function ciblesPourPhase(exercice: ExerciceSuiteArithmetique, phase: PhaseTermesMultiples): number[] {
  if (phase === "calculerTermesAlgebrique") {
    if (exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn") return [];
    return ciblesCalculerTermesAlgebrique(exercice);
  }
  if (exercice.famille === "principal" || exercice.famille === "coherence") {
    if (!exercice.indicesTermesProches) return [];
    const { u1, r } = exercice.base;
    return exercice.indicesTermesProches.map((n) => u1 + (n - 1) * r);
  }
  return [];
}

/** Écran à PLUSIEURS champs numériques FIXES (jamais add-as-needed — le nombre de termes demandés
 * est toujours connu à l'avance) — réutilisé par "termesProches" (4 indices déjà donnés dans le
 * bloc de données) et "termesConsecutifsMoyenne" (3 termes, labels génériques "1er/2e/3e"). */
export function EtapeTermesMultiples({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const labels = labelsPourPhase(exercice, phase);
  const [valeurs, setValeurs] = useState<string[]>(() => labels.map(() => ""));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const cibles = ciblesPourPhase(exercice, phase);
  const erroneeParIndex = valeurs.map((v, i) => apresEchec && cibles[i] !== undefined && diagnostiquerNombre(v, cibles[i]) !== "correct");

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(valeurs));
    onValider(valeurs);
  }

  const enLatex = phase === "termesProches" || phase === "calculerTermesAlgebrique";
  const aide2 = texteAideNiveau2(exercice, phase);

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteArithmetique exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">{enLatex ? <Katex expression={label} /> : label}</label>
          <input
            type="text"
            className={`text-input${erroneeParIndex[i] ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
          />
        </div>
      ))}
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
          {PHASES_AIDE1_LATEX.has(phase) ? <Katex expression={texteAideNiveau1(exercice, phase)} block /> : <p>{texteAideNiveau1(exercice, phase)}</p>}
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}

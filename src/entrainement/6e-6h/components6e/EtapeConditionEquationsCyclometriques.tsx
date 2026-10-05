import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceArcfonctionsDifferentes } from "../core6e/equationsCyclometriques.types";
import { MAX_DEN, CONSIGNE_GENERALE, formatEquationOriginaleLatex, texteAideConditionNiveau1, texteAideConditionNiveau2 } from "../ui6e/formatEquationsCyclometriques";
import { formatEnsembleReelLatex } from "../ui6e/formatEnsembleReel";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceArcfonctionsDifferentes;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
}

/** Écran "condition" — NOUVEAU, intercalaire entre "ce" et "equation", variante 4 UNIQUEMENT
 * (`arcfonctionsDifferentes` — jamais rendu pour les 3 autres variantes, voir `phaseApres`).
 * Demande la condition de compatibilité des CODOMAINES des 2 arcfonctions (`exercice.
 * conditionParasite`) — DISTINCTE de la CE de domaine posée à l'écran précédent (`exercice.ce`,
 * rappelée en bloc "état actuel"), et c'est ELLE qui permettra de rejeter les racines parasites à
 * l'écran final. Réutilise `EnsembleReelGuideBuilder` TEL QUEL, exactement comme l'écran "ce". */
export function EtapeConditionEquationsCyclometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [condition, setCondition] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (condition === null) return;
    onValider(condition);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={formatEquationOriginaleLatex(exercice)} />
      </div>
      <EtatActuelPanel label="CE établie à l'étape précédente" latex={formatEnsembleReelLatex(exercice.ce, MAX_DEN)} />
      <p className="prompt-text">
        La méthode utilisée à l'étape suivante (application d'une fonction trigonométrique directe des deux côtés) n'est valable que si les CODOMAINES des deux arcfonctions restent compatibles.
        Établis cette condition supplémentaire sous forme de x∈[intervalle].
      </p>
      <EnsembleReelGuideBuilder onChange={setCondition} label="x\in" erronee={montrerErreurs} />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={condition === null} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideConditionNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <>
              <p>{texteAideConditionNiveau2(exercice).texte}</p>
              <Katex expression={texteAideConditionNiveau2(exercice).latex} block />
            </>
          )}
        </div>
      )}
    </div>
  );
}

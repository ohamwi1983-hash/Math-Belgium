import { useState } from "react";
import type { ExerciceIsocele } from "../core/normeDistance.types";
import { evaluerCalculIsocele } from "../moteur/verificationNormeDistance";
import type { ReponseCalculIsocele } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import { CONSIGNE_GENERALE_ISOCELE, PLACEHOLDER_LONGUEUR, formatAideNormeABNiveau1Latex, formatAideNormeABNiveau2Latex, formatEtatActuelVecteursTriangleLatex, formatLabelNormeLatex, formatTermesDonneesIsoceleLatex } from "../ui/formatNormeDistance";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceIsocele;
  estPremierEcran: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCalculIsocele) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "calcul" — variante 4, écran 2 : consigne générale + bloc de données redondant + bloc "état
 * actuel" (les 3 vecteurs confirmés à l'écran 1) + 3 champs de texte libre (fraction/irrationnel
 * irréductible acceptés), labels en notation norme ($\|\vec{AB}\|=$, remplace l'ancien "AB=").
 * Aide à 2 niveaux, limitée à $\vec{AB}$ — `promptgen26refontecomplete.md`, Partie D.
 */
export function EtapeCalculIsocele({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [ab, setAb] = useState("");
  const [ac, setAc] = useState("");
  const [bc, setBc] = useState("");
  const complet = ab.trim() !== "" && ac.trim() !== "" && bc.trim() !== "";
  const max = NIVEAU_AIDE_MAX.calculIsocele;

  function construireReponse(): ReponseCalculIsocele {
    return { ab, ac, bc };
  }

  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerCalculIsocele(exercice, construireReponse()) : null;

  const etatActuel = formatEtatActuelVecteursTriangleLatex(exercice.labelA, exercice.labelB, exercice.labelC, exercice.vecteurAB, exercice.vecteurAC, exercice.vecteurBC);

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={CONSIGNE_GENERALE_ISOCELE}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesIsoceleLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">Calcule la longueur des 3 côtés du triangle.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-isocele-ab">
          <Katex expression={formatLabelNormeLatex(exercice.labelA, exercice.labelB)} />
        </label>
        <input
          id="norme-distance-isocele-ab"
          className={`text-input${evaluation !== null && evaluation.ab !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_LONGUEUR}
          value={ab}
          onChange={(e) => setAb(e.target.value)}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-isocele-ac">
          <Katex expression={formatLabelNormeLatex(exercice.labelA, exercice.labelC)} />
        </label>
        <input
          id="norme-distance-isocele-ac"
          className={`text-input${evaluation !== null && evaluation.ac !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_LONGUEUR}
          value={ac}
          onChange={(e) => setAc(e.target.value)}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-isocele-bc">
          <Katex expression={formatLabelNormeLatex(exercice.labelB, exercice.labelC)} />
        </label>
        <input
          id="norme-distance-isocele-bc"
          className={`text-input${evaluation !== null && evaluation.bc !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_LONGUEUR}
          value={bc}
          onChange={(e) => setBc(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Rappel (uniquement pour <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} />) :{" "}
            <Katex expression={formatAideNormeABNiveau1Latex(exercice.labelA, exercice.labelB)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formatAideNormeABNiveau2Latex(exercice.labelA, exercice.labelB, exercice.vecteurAB)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
          {max > 0 && (
            <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />
          )}

          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

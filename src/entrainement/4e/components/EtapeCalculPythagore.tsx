import { useState } from "react";
import type { ExercicePythagore } from "../core/normeDistance.types";
import { evaluerCalculPythagore } from "../moteur/verificationNormeDistance";
import type { ReponseCalculPythagore } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import {
  CONSIGNE_GENERALE_PYTHAGORE,
  PLACEHOLDER_LONGUEUR,
  formatAideNormeABNiveau1Latex,
  formatAideNormeABNiveau2Latex,
  formatEtatActuelVecteursPythagoreLatex,
  formatLabelNormeLatex,
  formatTermesDonneesPythagoreLatex,
  libelleBoutonAide,
} from "../ui/formatNormeDistance";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExercicePythagore;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCalculPythagore) => void;
}

/**
 * Écran "calcul" — variante 6, écran 2 : identique à l'écran 2 d'"isocèle"
 * (`promptgen26refontecomplete.md`, Partie E) — labels en notation norme, format de réponse élargi
 * (fraction/irrationnel irréductible : contrairement à "isocèle", ce triangle n'est pas construit
 * pour garantir des côtés entiers, voir `moteur/verificationNormeDistance.ts::longueursPythagore`),
 * aide à 2 niveaux limitée à $\vec{AB}$. Remplace l'ancien écran qui demandait les longueurs AU
 * CARRÉ (toujours entières) — c'est désormais la norme elle-même qui est demandée.
 */
export function EtapeCalculPythagore({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [ab, setAb] = useState("");
  const [ac, setAc] = useState("");
  const [bc, setBc] = useState("");
  const complet = ab.trim() !== "" && ac.trim() !== "" && bc.trim() !== "";
  const max = NIVEAU_AIDE_MAX.calculPythagore;

  function construireReponse(): ReponseCalculPythagore {
    return { ab, ac, bc };
  }

  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerCalculPythagore(exercice, construireReponse()) : null;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_PYTHAGORE}</p>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesPythagoreLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <EtatActuelPanel latex={formatEtatActuelVecteursPythagoreLatex(exercice)} />
      <p className="prompt-text">Calcule la longueur des 3 côtés du triangle (forme exacte ou décimale arrondie au centième).</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-pythagore-calc-ab">
          <Katex expression={formatLabelNormeLatex(exercice.labelA, exercice.labelB)} />
        </label>
        <input
          id="norme-distance-pythagore-calc-ab"
          className={`text-input${evaluation !== null && evaluation.ab !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_LONGUEUR}
          value={ab}
          onChange={(e) => setAb(e.target.value)}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-pythagore-calc-ac">
          <Katex expression={formatLabelNormeLatex(exercice.labelA, exercice.labelC)} />
        </label>
        <input
          id="norme-distance-pythagore-calc-ac"
          className={`text-input${evaluation !== null && evaluation.ac !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_LONGUEUR}
          value={ac}
          onChange={(e) => setAc(e.target.value)}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-pythagore-calc-bc">
          <Katex expression={formatLabelNormeLatex(exercice.labelB, exercice.labelC)} />
        </label>
        <input
          id="norme-distance-pythagore-calc-bc"
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
      {max > 0 && (
        <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
          {libelleBoutonAide(niveauAide, max)}
        </button>
      )}

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}

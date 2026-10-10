import { useState } from "react";
import type { ExerciceDistance } from "../core/normeDistance.types";
import { evaluerConstructionDistance } from "../moteur/verificationNormeDistance";
import type { ReponseConstructionDistance } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import { CONSIGNE_GENERALE_DISTANCE, PLACEHOLDER_COMPOSANTE, formatAideVecteurABNiveau1Latex, formatAideVecteurABNiveau2Latex, formatTermesDonneesDistanceLatex } from "../ui/formatNormeDistance";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceDistance;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionDistance) => void;
}

/**
 * Écran "construction" — variante 2, écran 1 : consigne générale + bloc de données redondant (sans
 * débordement mobile, `.equation-box-termes`) + 2 champs numériques (composantes de AB⃗), soumis en
 * une seule tentative. Aide à 2 niveaux (formule générale non substituée, puis substituée) —
 * `promptgen26refontecomplete.md`, Partie F : graphe supprimé (chevauchement de labels).
 */
export function EtapeConstructionDistance({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");
  const max = NIVEAU_AIDE_MAX.constructionDistance;
  const complet = texteX.trim() !== "" && texteY.trim() !== "";

  function construireReponse(): ReponseConstructionDistance {
    return { x: Number(texteX.replace(",", ".")), y: Number(texteY.replace(",", ".")) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerConstructionDistance(exercice, construireReponse()) : null;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_DISTANCE}</p>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesDistanceLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <p className="prompt-text">
        Calcule les composantes de <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} />.
      </p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="norme-distance-construction-x">
            <Katex expression={`x_{${exercice.labelA}${exercice.labelB}} =`} />
          </label>
          <input
            id="norme-distance-construction-x"
            className={`text-input${evaluation !== null && evaluation.x !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={texteX}
            onChange={(e) => setTexteX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="norme-distance-construction-y">
            <Katex expression={`y_{${exercice.labelA}${exercice.labelB}} =`} />
          </label>
          <input
            id="norme-distance-construction-y"
            className={`text-input${evaluation !== null && evaluation.y !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={texteY}
            onChange={(e) => setTexteY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Rappel : <Katex expression={formatAideVecteurABNiveau1Latex(exercice.labelA, exercice.labelB)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formatAideVecteurABNiveau2Latex(exercice.labelA, exercice.pointA, exercice.labelB, exercice.pointB)} />
            </p>
          )}
        </div>
      )}
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
    </div>
  );
}

import { useState } from "react";
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import { NIVEAU_AIDE_MAX_CENTRE } from "../moteur/sessionEquationCercle";
import { diagnostiquerCentre } from "../moteur/verificationEquationCercle";
import type { ReponseCentre } from "../moteur/verificationEquationCercle";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  CONSIGNE_CENTRE,
  CONSIGNE_GENERALE_EQUATION_CERCLE,
  PLACEHOLDER_COORDONNEE,
  TEXTE_AIDE_CENTRE_NIVEAU1,
  TEXTE_AIDE_CENTRE_NIVEAU2,
  libelleBoutonAide,
} from "../ui/formatEquationCercle";
import { formatMessageErreur } from "../ui/messageErreur";
import { EquationCercleGraph } from "./EquationCercleGraph";

interface Props {
  exercice: ExerciceEquationCercle;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCentre) => void;
}

/**
 * Écran 1 (première étape, toujours sans état actuel — rien à rappeler avant elle) — graphe
 * D'ABORD (jamais de bloc `equation-box` révélant le centre/rayon en texte, même principe que
 * "Lecture graphique — équation d'une droite") : l'élève lit directement le centre sur le cercle
 * tracé. L'aide de niveau 2 marque le centre EN COULEUR sur le graphe lui-même
 * (`afficherCentre`), jamais un texte donnant les coordonnées.
 */
export function EtapeCentreEquationCercle({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const complet = [x, y].every((v) => v.trim() !== "");

  function construireReponse(): ReponseCentre {
    return { x: Number(x.replace(",", ".")), y: Number(y.replace(",", ".")) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCentre(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_CERCLE}</p>
      <EquationCercleGraph exercice={exercice} afficherCentre={niveauAide >= 2} />
      <p className="prompt-text">{CONSIGNE_CENTRE}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-cercle-centre-x">
            x₀ =
          </label>
          <input
            id="equation-cercle-centre-x"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={x}
            onChange={(e) => setX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-cercle-centre-y">
            y₀ =
          </label>
          <input
            id="equation-cercle-centre-y"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={y}
            onChange={(e) => setY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_CENTRE_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_CENTRE_NIVEAU2}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_CENTRE} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_CENTRE)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}

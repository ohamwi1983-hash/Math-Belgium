import { useState } from "react";
import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import { NIVEAU_AIDE_MAX_SOMMET_FOYER } from "../moteur/sessionEquationParabole";
import { diagnostiquerSommetFoyer } from "../moteur/verificationEquationParabole";
import type { ReponseSommetFoyer } from "../moteur/verificationEquationParabole";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  CONSIGNE_GENERALE_EQUATION_PARABOLE,
  CONSIGNE_SOMMET_FOYER,
  PLACEHOLDER_COORDONNEE,
  TEXTE_AIDE_SOMMET_FOYER_NIVEAU1,
  TEXTE_AIDE_SOMMET_FOYER_NIVEAU2,
  libelleBoutonAide,
} from "../ui/formatEquationParabole";
import { formatMessageErreur } from "../ui/messageErreur";
import { EquationParaboleGraph } from "./EquationParaboleGraph";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceEquationParabole;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSommetFoyer) => void;
}

/** Écran 1 (première étape, sans état actuel — rien à rappeler avant elle) — 4 champs numériques,
 * lecture directe sur le graphe, statut à 3 valeurs classique. */
export function EtapeSommetFoyerEquationParabole({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [sx, setSx] = useState("");
  const [sy, setSy] = useState("");
  const [fx, setFx] = useState("");
  const [fy, setFy] = useState("");

  const complet = [sx, sy, fx, fy].every((v) => v.trim() !== "");

  function construireReponse(): ReponseSommetFoyer {
    return { sx: Number(sx.replace(",", ".")), sy: Number(sy.replace(",", ".")), fx: Number(fx.replace(",", ".")), fy: Number(fy.replace(",", ".")) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerSommetFoyer(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_PARABOLE}</p>
      <EquationParaboleGraph exercice={exercice} afficherSommet={niveauAide >= 2} />
      <p className="prompt-text">{CONSIGNE_SOMMET_FOYER}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-sx">
            <Katex expression="x_S=" />
          </label>
          <input
            id="equation-parabole-sx"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={sx}
            onChange={(e) => setSx(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-sy">
            <Katex expression="y_S=" />
          </label>
          <input
            id="equation-parabole-sy"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={sy}
            onChange={(e) => setSy(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-fx">
            <Katex expression="x_F=" />
          </label>
          <input
            id="equation-parabole-fx"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={fx}
            onChange={(e) => setFx(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-fy">
            <Katex expression="y_F=" />
          </label>
          <input
            id="equation-parabole-fy"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={fy}
            onChange={(e) => setFy(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_SOMMET_FOYER_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_SOMMET_FOYER_NIVEAU2}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_SOMMET_FOYER} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_SOMMET_FOYER)}
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

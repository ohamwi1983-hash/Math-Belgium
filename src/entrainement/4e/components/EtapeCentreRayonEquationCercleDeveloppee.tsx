import { useState } from "react";
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import { NIVEAU_AIDE_MAX_CENTRE_RAYON } from "../moteur/sessionEquationCercleDeveloppee";
import { diagnostiquerCentreRayon } from "../moteur/verificationEquationCercleDeveloppee";
import type { ReponseEcranCentreRayon } from "../moteur/typesEquationCercleDeveloppee";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  CONSIGNE_GENERALE_CENTRE_RAYON,
  PLACEHOLDER_COORDONNEE,
  PLACEHOLDER_RAYON,
  TEXTE_AIDE_CENTRE_RAYON_NIVEAU1,
  formatEquationDeveloppeeLatex,
  formatEquationReduiteLatex,
  formatEtatActuelCompletionLatex,
  libelleBoutonAide,
  segmentsConsigneCentreRayon,
} from "../ui/formatEquationCercleDeveloppee";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceEquationCercleDeveloppee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEcranCentreRayon) => void;
}

/**
 * Écran 3 (dernier, toujours terminal) — "état actuel" rappelle la forme complétée CONFIRMÉE à
 * l'écran 2. Centre : 2 champs numériques, statut à 3 valeurs classique. Rayon : champ de texte
 * libre, parsé symboliquement (couvre les deux variantes de façon uniforme, jamais confondu avec
 * r² — le piège central de l'exercice).
 */
export function EtapeCentreRayonEquationCercleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [rayon, setRayon] = useState("");

  const complet = [x, y, rayon].every((v) => v.trim() !== "");

  function construireReponse(): ReponseEcranCentreRayon {
    return { x: Number(x.replace(",", ".")), y: Number(y.replace(",", ".")), rayon };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCentreRayon(exercice, { x: Number(x.replace(",", ".")), y: Number(y.replace(",", ".")) }, rayon) : undefined;
  const centreErronee = apresEchec && statut!.centre !== "correct";
  const rayonErronee = apresEchec && statut!.rayon !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_CENTRE_RAYON}</p>
      <div className="equation-box">
        <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={formatEtatActuelCompletionLatex(exercice)} />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneCentreRayon(exercice)} />
      </p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-cercle-developpee-centre-x">
            x₀ =
          </label>
          <input
            id="equation-cercle-developpee-centre-x"
            className={`text-input${centreErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={x}
            onChange={(e) => setX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-cercle-developpee-centre-y">
            y₀ =
          </label>
          <input
            id="equation-cercle-developpee-centre-y"
            className={`text-input${centreErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={y}
            onChange={(e) => setY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="equation-cercle-developpee-rayon">
          R =
        </label>
        <input
          id="equation-cercle-developpee-rayon"
          className={`text-input${rayonErronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_RAYON}
          value={rayon}
          onChange={(e) => setRayon(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_CENTRE_RAYON_NIVEAU1}</p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatEquationReduiteLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_CENTRE_RAYON} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_CENTRE_RAYON)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut?.centre !== "correct" ? statut?.centre : statut?.rayon)}
        </p>
      )}
    </div>
  );
}

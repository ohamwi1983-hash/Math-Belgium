import { useState } from "react";
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import { NIVEAU_AIDE_MAX_RAYON } from "../moteur/sessionEquationCercle";
import { diagnostiquerRayon } from "../moteur/verificationEquationCercle";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { CONSIGNE_GENERALE_EQUATION_CERCLE, CONSIGNE_RAYON, PLACEHOLDER_RAYON, formatAideRayonNiveau2Latex, formatEtatActuelCentreLatex, texteAideRayonNiveau1, texteAideRayonNiveau2 } from "../ui/formatEquationCercle";
import { formatMessageErreur } from "../ui/messageErreur";
import { EquationCercleGraph } from "./EquationCercleGraph";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationCercle;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: number) => void;
}

/**
 * Écran 2 — le centre étant déjà confirmé (donc plus un secret), le graphe le garde marqué en
 * permanence ; l'aide de niveau 2 ajoute EN PLUS le segment pointillé centre→point marqué
 * (`afficherRayon`), avec — pour `rayon_indirect` seulement — la formule de Pythagore substituée
 * mais jamais résolue.
 */
export function EtapeRayonEquationCercle({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [rayon, setRayon] = useState("");

  const complet = rayon.trim() !== "";

  function construireReponse(): number {
    return Number(rayon.replace(",", "."));
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerRayon(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const latexAide2 = formatAideRayonNiveau2Latex(exercice);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_CERCLE}</p>
      <EquationCercleGraph exercice={exercice} afficherCentre afficherRayon={niveauAide >= 2} />
      <EtatActuelPanel latex={formatEtatActuelCentreLatex(exercice)} />
      <p className="prompt-text">{CONSIGNE_RAYON}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="equation-cercle-rayon">
          R =
        </label>
        <input
          id="equation-cercle-rayon"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_RAYON}
          value={rayon}
          onChange={(e) => setRayon(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideRayonNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <>
              <p>{texteAideRayonNiveau2(exercice)}</p>
              {latexAide2 && (
                <p>
                  <Katex expression={latexAide2} />
                </p>
              )}
            </>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_RAYON} onActiverAide={onActiverAide} />

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

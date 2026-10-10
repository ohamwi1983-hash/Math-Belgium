import { useState } from "react";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import { NIVEAU_AIDE_MAX_EXTRACTION } from "../moteur/sessionEquationDroite";
import { diagnostiquerExtraction } from "../moteur/verificationEquationDroite";
import type { ReponseExtraction } from "../moteur/verificationEquationDroite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { PLACEHOLDER_COMPOSANTE, PLACEHOLDER_COORDONNEE, consigneExtraction, formatAideExtractionNiveau2Latex, formatEnonceLatex, segmentsAideExtractionNiveau1 } from "../ui/formatEquationDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleEquationDroite } from "./ConsigneGeneraleEquationDroite";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseExtraction) => void;
}

/**
 * Écran 1 — extraction commune : point + vecteur directeur, 4 champs numériques. Vérifiée par
 * "point sur la droite + vecteur colinéaire au vecteur de référence" (`diagnostiquerExtraction`),
 * jamais par un couple exact imposé — plusieurs réponses différentes peuvent être correctes.
 */
export function EtapeExtractionEquationDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [x0, setX0] = useState("");
  const [y0, setY0] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const complet = [x0, y0, a, b].every((v) => v.trim() !== "");

  function construireReponse(): ReponseExtraction {
    return {
      x0: Number(x0.replace(",", ".")),
      y0: Number(y0.replace(",", ".")),
      a: Number(a.replace(",", ".")),
      b: Number(b.replace(",", ".")),
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerExtraction(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <ConsigneGeneraleEquationDroite exercice={exercice} />
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>
      <p className="prompt-text">{consigneExtraction(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-droite-extraction-x0">
            x₀ =
          </label>
          <input
            id="equation-droite-extraction-x0"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={x0}
            onChange={(e) => setX0(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-droite-extraction-y0">
            y₀ =
          </label>
          <input
            id="equation-droite-extraction-y0"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={y0}
            onChange={(e) => setY0(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-droite-extraction-a">
            <Katex expression="x_{\vec{u}}=" />
          </label>
          <input
            id="equation-droite-extraction-a"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={a}
            onChange={(e) => setA(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-droite-extraction-b">
            <Katex expression="y_{\vec{u}}=" />
          </label>
          <input
            id="equation-droite-extraction-b"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={b}
            onChange={(e) => setB(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideExtractionNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideExtractionNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_EXTRACTION} onActiverAide={onActiverAide} />

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

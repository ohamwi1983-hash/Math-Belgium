import { useState } from "react";
import type { ExerciceColinearPoints } from "../core/colinearite.types";
import { evaluerConstructionVecteurs } from "../moteur/verificationColinearite";
import type { ReponseConstructionVecteurs } from "../moteur/verificationColinearite";
import { NIVEAU_AIDE_MAX_CONSTRUCTION_VECTEURS } from "../moteur/sessionColinearite";
import { PLACEHOLDER_COMPOSANTE, consigneGlobaleColinearite, formatFormuleComposantesLatex, formatTermesEnoncePointsLatex } from "../ui/formatColinearite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceColinearPoints;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionVecteurs) => void;
}

/**
 * Écran "constructionVecteurs" — V3-écran1 (variante "points") : 4 champs numériques (composantes
 * de AB puis AC), soumis en une seule tentative — chevauchement volontaire avec la compétence du
 * générateur "Point à partir d'une relation vectorielle" (étape intermédiaire ici, pas la
 * compétence finale visée par cet écran).
 *
 * `promptcorrectionsgenerateur24complet.md`, points 11-13 : consigne globale (persistante avec le
 * bloc des points sur l'écran "test" qui suit) + aide simplifiée.
 * `promptcorrectionsgenerateur24lot2.md` : point 1, le graphique montrant A/B/C placés est retiré
 * de l'aide — il révélait visuellement l'alignement, donc la réponse finale, avant même le calcul ;
 * point 2, l'aide ne montre plus que la formule de AB⃗ (jamais AC⃗, l'élève doit déduire seul la
 * même logique) ; point 5, marquage rouge en direct de chaque champ fautif après un échec.
 *
 * `promptgen24modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnoncePointsLatex`, un fragment KaTeX par point) — jamais un unique `\quad`-joined,
 * qui ne retourne jamais à la ligne sur mobile étroit.
 */
export function EtapeConstructionVecteursColinearite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");

  const complet = [abX, abY, acX, acY].every((v) => v.trim() !== "");

  function construireReponse(): ReponseConstructionVecteurs {
    return {
      abX: Number(abX.replace(",", ".")),
      abY: Number(abY.replace(",", ".")),
      acX: Number(acX.replace(",", ".")),
      acY: Number(acY.replace(",", ".")),
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerConstructionVecteurs(exercice, construireReponse()) : null;
  const abXErronee = evaluation !== null && evaluation.abX !== "correct";
  const abYErronee = evaluation !== null && evaluation.abY !== "correct";
  const acXErronee = evaluation !== null && evaluation.acX !== "correct";
  const acYErronee = evaluation !== null && evaluation.acY !== "correct";

  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box equation-box-termes">
        {formatTermesEnoncePointsLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <p className="prompt-text">
        Calcule les composantes de <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} /> et de{" "}
        <Katex expression={`\\vec{${exercice.labelA}${exercice.labelC}}`} />.
      </p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="colinearite-construction-abx">
            <Katex expression={`x_{${exercice.labelA}${exercice.labelB}} =`} />
          </label>
          <input
            id="colinearite-construction-abx"
            className={`text-input${abXErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={abX}
            onChange={(e) => setAbX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="colinearite-construction-aby">
            <Katex expression={`y_{${exercice.labelA}${exercice.labelB}} =`} />
          </label>
          <input
            id="colinearite-construction-aby"
            className={`text-input${abYErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={abY}
            onChange={(e) => setAbY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="colinearite-construction-acx">
            <Katex expression={`x_{${exercice.labelA}${exercice.labelC}} =`} />
          </label>
          <input
            id="colinearite-construction-acx"
            className={`text-input${acXErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={acX}
            onChange={(e) => setAcX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="colinearite-construction-acy">
            <Katex expression={`y_{${exercice.labelA}${exercice.labelC}} =`} />
          </label>
          <input
            id="colinearite-construction-acy"
            className={`text-input${acYErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={acY}
            onChange={(e) => setAcY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <Katex expression={formatFormuleComposantesLatex(exercice.labelA, exercice.labelB)} block />
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CONSTRUCTION_VECTEURS} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(
            tentativesUtilisees,
            tentativesMax,
            evaluation && Object.values(evaluation).includes("parse_error") ? "parse_error" : undefined,
          )}
        </p>
      )}
    </div>
  );
}

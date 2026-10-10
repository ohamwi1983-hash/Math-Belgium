import { useState } from "react";
import type { ExerciceOrthogonaliteTriangle } from "../core/orthogonalite.types";
import { evaluerConstructionTriangle } from "../moteur/verificationOrthogonalite";
import type { ReponseConstructionTriangle } from "../moteur/verificationOrthogonalite";
import { NIVEAU_AIDE_MAX } from "../moteur/typesOrthogonalite";
import { PLACEHOLDER_COMPOSANTE, consigneGlobaleOrthogonalite, formatFormuleComposantesLatex, formatTermesEnonceTriangleLatex } from "../ui/formatOrthogonalite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOrthogonaliteTriangle;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionTriangle) => void;
}

/**
 * Écran "construction" — variante 3, écran 1 : 6 champs numériques (composantes de AB, AC, BC),
 * soumis en une seule tentative — construits une seule fois, chaque test de sommet suivant les
 * réutilise avec changement de signe (voir `verificationOrthogonalite.ts`).
 *
 * `promptcorrectionsgenerateur25complet.md`, points 10-12 : consigne globale (persistante avec le
 * bloc des points sur les écrans "test du sommet" qui suivent) + aide simplifiée.
 * `promptgen25modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnonceTriangleLatex`, un fragment KaTeX par point) pour ne jamais couper/déborder
 * un point sur mobile.
 * `promptcorrectionsgenerateur25lot2.md` : point 1, le graphique montrant A/B/C placés est retiré
 * de l'aide — il révélait visuellement des informations sur la configuration du triangle ; point 2,
 * l'aide ne montre plus que la formule de AB⃗ (jamais AC⃗/BC⃗) ; point 5, marquage rouge en direct de
 * chaque champ fautif après un échec.
 */
export function EtapeConstructionTriangleOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");
  const [bcX, setBcX] = useState("");
  const [bcY, setBcY] = useState("");
  const max = NIVEAU_AIDE_MAX.constructionTriangle;

  const complet = [abX, abY, acX, acY, bcX, bcY].every((v) => v.trim() !== "");

  function construireReponse(): ReponseConstructionTriangle {
    return {
      abX: Number(abX.replace(",", ".")),
      abY: Number(abY.replace(",", ".")),
      acX: Number(acX.replace(",", ".")),
      acY: Number(acY.replace(",", ".")),
      bcX: Number(bcX.replace(",", ".")),
      bcY: Number(bcY.replace(",", ".")),
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerConstructionTriangle(exercice, construireReponse()) : null;

  function champ(id: string, label: string, valeur: string, onChange: (v: string) => void, erronee: boolean) {
    return (
      <div className="field" key={id}>
        <label className="field-label field-label-minuscule" htmlFor={id}>
          <Katex expression={label} />
        </label>
        <input
          id={id}
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_COMPOSANTE}
          value={valeur}
          onChange={(e) => onChange(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>
    );
  }

  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceTriangleLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <p className="prompt-text">
        Calcule les composantes de <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} />,{" "}
        <Katex expression={`\\vec{${exercice.labelA}${exercice.labelC}}`} /> et <Katex expression={`\\vec{${exercice.labelB}${exercice.labelC}}`} />.
      </p>

      <div className="field-row">
        {champ("orthogonalite-construction-abx", `x_{${exercice.labelA}${exercice.labelB}} =`, abX, setAbX, evaluation !== null && evaluation.abX !== "correct")}
        {champ("orthogonalite-construction-aby", `y_{${exercice.labelA}${exercice.labelB}} =`, abY, setAbY, evaluation !== null && evaluation.abY !== "correct")}
      </div>
      <div className="field-row">
        {champ("orthogonalite-construction-acx", `x_{${exercice.labelA}${exercice.labelC}} =`, acX, setAcX, evaluation !== null && evaluation.acX !== "correct")}
        {champ("orthogonalite-construction-acy", `y_{${exercice.labelA}${exercice.labelC}} =`, acY, setAcY, evaluation !== null && evaluation.acY !== "correct")}
      </div>
      <div className="field-row">
        {champ("orthogonalite-construction-bcx", `x_{${exercice.labelB}${exercice.labelC}} =`, bcX, setBcX, evaluation !== null && evaluation.bcX !== "correct")}
        {champ("orthogonalite-construction-bcy", `y_{${exercice.labelB}${exercice.labelC}} =`, bcY, setBcY, evaluation !== null && evaluation.bcY !== "correct")}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <Katex expression={formatFormuleComposantesLatex(exercice.labelA, exercice.labelB)} block />
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

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

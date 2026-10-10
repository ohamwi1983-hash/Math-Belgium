import { useState } from "react";
import type { ExerciceIsocele } from "../core/normeDistance.types";
import { evaluerConstructionIsocele } from "../moteur/verificationNormeDistance";
import type { ReponseConstructionIsocele } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import { CONSIGNE_GENERALE_ISOCELE, PLACEHOLDER_COMPOSANTE, formatAideVecteurABNiveau1Latex, formatAideVecteurABNiveau2Latex, formatTermesDonneesIsoceleLatex } from "../ui/formatNormeDistance";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceIsocele;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionIsocele) => void;
}

/**
 * Écran "construction" — variante 4, écran 1 : consigne générale + bloc de données redondant (sans
 * débordement mobile) + 6 champs numériques (composantes de AB⃗, AC⃗, BC⃗), soumis en une seule
 * tentative. Aide à 2 niveaux, limitée à $\vec{AB}$ (formule générale non substituée, puis
 * substituée) — `promptgen26refontecomplete.md`, Partie D : graphe supprimé (chevauchement de
 * labels non résolvable simplement, n'apporte pas d'information essentielle).
 */
export function EtapeConstructionIsocele({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");
  const [bcX, setBcX] = useState("");
  const [bcY, setBcY] = useState("");
  const max = NIVEAU_AIDE_MAX.constructionIsocele;

  const complet = [abX, abY, acX, acY, bcX, bcY].every((v) => v.trim() !== "");

  function construireReponse(): ReponseConstructionIsocele {
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
  const evaluation = apresEchec ? evaluerConstructionIsocele(exercice, construireReponse()) : null;

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

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ISOCELE}</p>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesIsoceleLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <p className="prompt-text">
        Calcule les composantes des vecteurs <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} />,{" "}
        <Katex expression={`\\vec{${exercice.labelA}${exercice.labelC}}`} /> et <Katex expression={`\\vec{${exercice.labelB}${exercice.labelC}}`} />.
      </p>

      <div className="field-row">
        {champ("norme-distance-isocele-abx", `x_{${exercice.labelA}${exercice.labelB}} =`, abX, setAbX, evaluation !== null && evaluation.abX !== "correct")}
        {champ("norme-distance-isocele-aby", `y_{${exercice.labelA}${exercice.labelB}} =`, abY, setAbY, evaluation !== null && evaluation.abY !== "correct")}
      </div>
      <div className="field-row">
        {champ("norme-distance-isocele-acx", `x_{${exercice.labelA}${exercice.labelC}} =`, acX, setAcX, evaluation !== null && evaluation.acX !== "correct")}
        {champ("norme-distance-isocele-acy", `y_{${exercice.labelA}${exercice.labelC}} =`, acY, setAcY, evaluation !== null && evaluation.acY !== "correct")}
      </div>
      <div className="field-row">
        {champ("norme-distance-isocele-bcx", `x_{${exercice.labelB}${exercice.labelC}} =`, bcX, setBcX, evaluation !== null && evaluation.bcX !== "correct")}
        {champ("norme-distance-isocele-bcy", `y_{${exercice.labelB}${exercice.labelC}} =`, bcY, setBcY, evaluation !== null && evaluation.bcY !== "correct")}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Rappel (uniquement pour <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} />) :{" "}
            <Katex expression={formatAideVecteurABNiveau1Latex(exercice.labelA, exercice.labelB)} />
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

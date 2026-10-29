import { useState } from "react";
import type { ExercicePointVectoriel } from "../core/pointVectoriel.types";
import { Katex } from "./Katex";
import { VecteurGraph } from "./VecteurGraph";
import {
  consignePointVectoriel,
  formatLabelXLatex,
  formatLabelYLatex,
  formatTermesDonneesConnuesLatex,
  valeursGraphePointVectoriel,
} from "../ui/formatPointVectoriel";
import { diagnostiquerCoordonnees, diagnostiquerX, diagnostiquerY } from "../moteur/verificationPointVectoriel";
import { filtrerSaisieNumeriqueFraction, gererKeyDownNumeriqueFraction } from "../ui/bloquerSaisieNonNumerique";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { formatMessageErreur } from "../ui/messageErreur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExercicePointVectoriel;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: { x: number; y: number }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Unique écran de l'exercice : bloc énoncé fixe (points/vecteurs connus, en texte et sur le
 * graphe — jamais le point cherché, voir `valeursGraphePointVectoriel`), consigne, puis les 2
 * champs numériques (x,y) soumis ensemble en un seul essai.
 */
export function EtapePointVectoriel({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");

  // Entier, décimal (point ou virgule) ou fraction p/q (« 1/2 ») ; NaN si illisible → parse_error.
  const x = parserNombreOuFraction(texteX) ?? Number.NaN;
  const y = parserNombreOuFraction(texteY) ?? Number.NaN;
  const complet = texteX.trim() !== "" && texteY.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerCoordonnees(exercice, x, y) : undefined;
  const { points, vecteurs } = valeursGraphePointVectoriel(exercice);
  const consigne = consignePointVectoriel(exercice);

  const apresEchec = tentativesUtilisees > 0;
  const xErronee = apresEchec && diagnostiquerX(exercice, x) !== "correct";
  const yErronee = apresEchec && diagnostiquerY(exercice, y) !== "correct";

  return (
    <div>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesConnuesLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>
      <VecteurGraph points={points} vecteurs={vecteurs} />
      <p className="prompt-text">
        {consigne.avant}
        {consigne.latex && <Katex expression={consigne.latex} />}
        {consigne.apres}
      </p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="point-vectoriel-x">
            <Katex expression={formatLabelXLatex(exercice)} />
          </label>
          <input
            id="point-vectoriel-x"
            className={`text-input${xErronee ? " is-erronee" : ""}`}
            value={texteX}
            onChange={(e) => setTexteX(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="point-vectoriel-y">
            <Katex expression={formatLabelYLatex(exercice)} />
          </label>
          <input
            id="point-vectoriel-y"
            className={`text-input${yErronee ? " is-erronee" : ""}`}
            value={texteY}
            onChange={(e) => setTexteY(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
      </div>
      {statut === "parse_error" && <p className="alert-error">{formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")}</p>}

      {!validation && (
        <>
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ x, y })}>
          Valider
        </button>
        {tentativesUtilisees > 0 && statut !== "parse_error" && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

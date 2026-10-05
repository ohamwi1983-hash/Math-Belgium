import { useState } from "react";
import type { ExerciceFormeCanoniqueTransformation, ReponseCanonique } from "../core/formeCanoniqueTransformations.types";
import { diagnostiquerCanonique } from "../moteur/verificationFormeCanoniqueTransformations";
import { formatFormeGeneraleLatex } from "../ui/formatFormeCanoniqueTransformations";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueTransformation;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseCanonique) => void;
}

/**
 * Étape 1 — Forme canonique (section 2 de la spec) : ax²+bx+c affiché (a jamais redemandé,
 * coefficients distribués et réduits indépendamment — point 1a de la refonte), l'élève trouve xS et
 * yS puis écrit la forme canonique complète (ex. "-4/3(x-2)^2+1" — point 1b), vérifiée
 * structurellement (refuse une forme développée même algébriquement équivalente) ET
 * algébriquement. Pas de graphe ici (le graphe n'apparaît qu'à partir de l'étape 2, une fois xS/yS
 * connus) ; xS/yS entiers par construction, vérification exacte — pas de fraction à gérer pour ces
 * deux champs, contrairement à "Analyse d'une fonction".
 */
export function EtapeCanonique({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [xS, setXS] = useState("");
  const [yS, setYS] = useState("");
  const [formeCanonique, setFormeCanonique] = useState("");

  const complet = xS.trim() !== "" && yS.trim() !== "" && formeCanonique.trim() !== "";
  const reponse = { xS: Number(xS.replace(",", ".")), yS: Number(yS.replace(",", ".")), formeCanonique };
  const statut = tentativesUtilisees > 0 ? diagnostiquerCanonique(exercice, reponse) : undefined;
  const erronee = statut !== undefined && statut !== "correct";

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatFormeGeneraleLatex(exercice)} block />
      </div>
      <p className="prompt-text">Retrouve les coordonnées du sommet de la parabole.</p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="canonique-xs">
            <Katex expression="x_S =" />
          </label>
          <input
            id="canonique-xs"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={xS}
            onChange={(e) => setXS(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="canonique-ys">
            <Katex expression="y_S =" />
          </label>
          <input
            id="canonique-ys"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={yS}
            onChange={(e) => setYS(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      <p className="prompt-text">Écris la forme canonique complète de f(x).</p>
      <ApercuExpressionLatex texte={formeCanonique} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="canonique-forme-complete">
          f(x) =
        </label>
        <input
          id="canonique-forme-complete"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder="ex : -4/3(x-2)^2+1"
          value={formeCanonique}
          onChange={(e) => setFormeCanonique(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => onValider(reponse)}
      >
        Valider
      </button>
      {statut !== undefined && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}

import { useState } from "react";
import type { ExerciceOrthogonaliteTriangleParametre } from "../core/orthogonalite.types";
import { evaluerConstructionAvecXTriangle } from "../moteur/verificationOrthogonalite";
import type { ReponseConstructionAvecXTriangle } from "../moteur/verificationOrthogonalite";
import { NIVEAU_AIDE_MAX } from "../moteur/typesOrthogonalite";
import {
  PLACEHOLDER_COMPOSANTE_SYMBOLIQUE,
  consigneGlobaleOrthogonalite,
  formatFormuleComposantesLatex,
  formatTermesEnonceTriangleParametreLatex,
  libelleBoutonAide,
} from "../ui/formatOrthogonalite";
import { Katex } from "./Katex";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExerciceOrthogonaliteTriangleParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionAvecXTriangle) => void;
}

/** Un seul champ de saisie LIBRE par composante — accepte une expression algébrique de x (ex.
 * `"2x-1"`) ou un nombre pur, vérifiée symboliquement (`diagnostiquerComposanteLineaire`) —
 * `promptcorrectionsgenerateur25complet.md`, point 1 : remplace les 2 champs séparés
 * (coefficient/constante) par une seule expression, jamais de bloquage numérique ici (le champ doit
 * accepter la lettre "x"). Marquage rouge en direct (`erronee`) après un échec —
 * `promptcorrectionsgenerateur25lot2.md`, point 5. */
function ChampSymbolique({
  id,
  label,
  valeur,
  onChange,
  erronee,
}: {
  id: string;
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  erronee: boolean;
}) {
  return (
    <div className="field field-inline">
      <label className="field-label field-label-minuscule" htmlFor={id}>
        <Katex expression={label} />
      </label>
      <input
        id={id}
        className={`text-input${erronee ? " is-erronee" : ""}`}
        placeholder={PLACEHOLDER_COMPOSANTE_SYMBOLIQUE}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * Écran "construction symbolique" — variante 4, écran 1 : composantes de AB, AC, BC — un champ de
 * saisie LIBRE par composante (`promptcorrectionsgenerateur25complet.md`, point 1), acceptant aussi
 * bien une expression algébrique de x qu'un nombre pur, vérification symbolique.
 *
 * Consigne globale (point 4, persistante avec le bloc des points sur les écrans "réduction du
 * sommet" et "identification et résolution" qui suivent) + aide simplifiée à 1 niveau, formule
 * seule (point 2), texte SEUL — pas de graphique (les positions ne sont pas toutes numériques tant
 * que x n'est pas résolu, un graphique donnerait une fausse précision).
 *
 * `promptcorrectionsgenerateur25lot2.md` : point 2, l'aide ne montre plus que la formule de AB⃗ ;
 * point 4, le statut `parse_error` (déjà calculé par `evaluerConstructionAvecXTriangle`, jamais
 * recalculé différemment) était calculé mais jamais lu par cet écran — corrigé, câblé au marquage
 * rouge par champ et au message d'erreur ; point 5, marquage rouge du seul champ fautif.
 *
 * `promptgen25modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnonceTriangleParametreLatex`) pour ne jamais couper/déborder un point symbolique
 * potentiellement long (ex. "C(3x-15;x-6)") sur mobile.
 */
export function EtapeConstructionAvecXOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");
  const [bcX, setBcX] = useState("");
  const [bcY, setBcY] = useState("");
  const max = NIVEAU_AIDE_MAX.constructionAvecX;

  const complet = [abX, abY, acX, acY, bcX, bcY].every((v) => v.trim() !== "");

  function construireReponse(): ReponseConstructionAvecXTriangle {
    return { abX, abY, acX, acY, bcX, bcY };
  }

  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerConstructionAvecXTriangle(exercice, construireReponse()) : null;

  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceTriangleParametreLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <p className="prompt-text">
        Calcule les composantes de <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} />,{" "}
        <Katex expression={`\\vec{${exercice.labelA}${exercice.labelC}}`} /> et <Katex expression={`\\vec{${exercice.labelB}${exercice.labelC}}`} />.
      </p>

      <div className="field-row">
        <ChampSymbolique
          id="orthogonalite-avecx-abx"
          label={`x_{${exercice.labelA}${exercice.labelB}} =`}
          valeur={abX}
          onChange={setAbX}
          erronee={evaluation !== null && evaluation.abX !== "correct"}
        />
        <ChampSymbolique
          id="orthogonalite-avecx-aby"
          label={`y_{${exercice.labelA}${exercice.labelB}} =`}
          valeur={abY}
          onChange={setAbY}
          erronee={evaluation !== null && evaluation.abY !== "correct"}
        />
      </div>
      <div className="field-row">
        <ChampSymbolique
          id="orthogonalite-avecx-acx"
          label={`x_{${exercice.labelA}${exercice.labelC}} =`}
          valeur={acX}
          onChange={setAcX}
          erronee={evaluation !== null && evaluation.acX !== "correct"}
        />
        <ChampSymbolique
          id="orthogonalite-avecx-acy"
          label={`y_{${exercice.labelA}${exercice.labelC}} =`}
          valeur={acY}
          onChange={setAcY}
          erronee={evaluation !== null && evaluation.acY !== "correct"}
        />
      </div>
      <div className="field-row">
        <ChampSymbolique
          id="orthogonalite-avecx-bcx"
          label={`x_{${exercice.labelB}${exercice.labelC}} =`}
          valeur={bcX}
          onChange={setBcX}
          erronee={evaluation !== null && evaluation.bcX !== "correct"}
        />
        <ChampSymbolique
          id="orthogonalite-avecx-bcy"
          label={`y_{${exercice.labelB}${exercice.labelC}} =`}
          valeur={bcY}
          onChange={setBcY}
          erronee={evaluation !== null && evaluation.bcY !== "correct"}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <Katex expression={formatFormuleComposantesLatex(exercice.labelA, exercice.labelB)} block />
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, max)}
      </button>

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

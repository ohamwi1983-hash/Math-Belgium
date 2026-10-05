import { useState } from "react";
import type { ExerciceColinearPointsParametre } from "../core/colinearite.types";
import { evaluerConstructionAvecX } from "../moteur/verificationColinearite";
import type { ReponseConstructionAvecX } from "../moteur/verificationColinearite";
import { NIVEAU_AIDE_MAX_CONSTRUCTION_AVEC_X } from "../moteur/sessionColinearite";
import {
  PLACEHOLDER_COMPOSANTE_SYMBOLIQUE,
  consigneGlobaleColinearite,
  formatFormuleComposantesLatex,
  formatTermesEnoncePointsParametreLatex,
  libelleBoutonAide,
} from "../ui/formatColinearite";
import { Katex } from "./Katex";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExerciceColinearPointsParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionAvecX) => void;
}

/** Un seul champ de saisie LIBRE par composante — accepte une expression algébrique de x (ex.
 * `"2x-1"`) ou un nombre pur (ex. `"5"`), vérifiée symboliquement (`diagnostiquerComposanteLineaire`)
 * — `promptcorrectionsgenerateur24complet.md`, point 1 : remplace les 2 champs séparés
 * (coefficient/constante) par une seule expression, jamais de bloquage numérique ici (le champ doit
 * accepter la lettre "x"). Marquage rouge en direct (`erronee`) après un échec —
 * `promptcorrectionsgenerateur24lot2.md`, point 5. */
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
 * Écran "constructionAvecX" — V4-écran1 (variante "pointsParametre") : composantes de AB/AC, un
 * champ de saisie LIBRE par composante (`promptcorrectionsgenerateur24complet.md`, point 1) —
 * accepte aussi bien une expression algébrique de x qu'un nombre pur, vérification symbolique.
 *
 * Consigne globale (point 4, persistante avec le bloc des points sur les écrans "réduction"/
 * "résolution" qui suivent) + aide simplifiée à 1 niveau, formule seule (point 2), texte SEUL — pas
 * de graphique (les positions ne sont pas toutes numériques tant que x n'est pas résolu, un
 * graphique donnerait une fausse précision).
 *
 * `promptcorrectionsgenerateur24lot2.md` : point 2, l'aide ne montre plus que la formule de AB⃗ ;
 * point 4, le statut `parse_error` (déjà calculé par `evaluerConstructionAvecX`, jamais recalculé
 * différemment) était calculé mais jamais lu par cet écran — corrigé, câblé au marquage rouge par
 * champ et au message d'erreur ; point 5, marquage rouge du seul champ fautif après un échec.
 *
 * `promptgen24modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnoncePointsParametreLatex`, un fragment KaTeX par point).
 */
export function EtapeConstructionAvecXColinearite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");

  const complet = [abX, abY, acX, acY].every((v) => v.trim() !== "");

  function construireReponse(): ReponseConstructionAvecX {
    return { abX, abY, acX, acY };
  }

  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerConstructionAvecX(exercice, construireReponse()) : null;

  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box equation-box-termes">
        {formatTermesEnoncePointsParametreLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <p className="prompt-text">
        Calcule les composantes de <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} /> et de{" "}
        <Katex expression={`\\vec{${exercice.labelA}${exercice.labelC}}`} />.
      </p>

      <div className="field-row">
        <ChampSymbolique
          id="colinearite-avecx-abx"
          label={`x_{${exercice.labelA}${exercice.labelB}} =`}
          valeur={abX}
          onChange={setAbX}
          erronee={evaluation !== null && evaluation.abX !== "correct"}
        />
        <ChampSymbolique
          id="colinearite-avecx-aby"
          label={`y_{${exercice.labelA}${exercice.labelB}} =`}
          valeur={abY}
          onChange={setAbY}
          erronee={evaluation !== null && evaluation.abY !== "correct"}
        />
      </div>
      <div className="field-row">
        <ChampSymbolique
          id="colinearite-avecx-acx"
          label={`x_{${exercice.labelA}${exercice.labelC}} =`}
          valeur={acX}
          onChange={setAcX}
          erronee={evaluation !== null && evaluation.acX !== "correct"}
        />
        <ChampSymbolique
          id="colinearite-avecx-acy"
          label={`y_{${exercice.labelA}${exercice.labelC}} =`}
          valeur={acY}
          onChange={setAcY}
          erronee={evaluation !== null && evaluation.acY !== "correct"}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <Katex expression={formatFormuleComposantesLatex(exercice.labelA, exercice.labelB)} block />
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_CONSTRUCTION_AVEC_X} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_CONSTRUCTION_AVEC_X)}
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

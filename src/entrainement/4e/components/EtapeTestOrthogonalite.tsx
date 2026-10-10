import { useState } from "react";
import type { ExerciceOrthogonaliteTest } from "../core/orthogonalite.types";
import type { ReponseTest } from "../moteur/verificationOrthogonalite";
import { diagnostiquerCritereTest } from "../moteur/verificationOrthogonalite";
import { NIVEAU_AIDE_MAX } from "../moteur/typesOrthogonalite";
import { LATEX_FORMULE_ORTHOGONALITE_VECTORIELLE, LATEX_VEC_U, LATEX_VEC_V, LIBELLES_OUI_NON, PLACEHOLDER_CRITERE, QUESTION_ORTHOGONALITE_VECTEURS_APRES, QUESTION_ORTHOGONALITE_VECTEURS_AVANT, QUESTION_ORTHOGONALITE_VECTEURS_ENTRE, RAPPEL_VECTORIEL_ORTHOGONALITE_APRES, RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT, RAPPEL_VECTORIEL_ORTHOGONALITE_ENTRE, RAPPEL_VECTORIEL_ORTHOGONALITE_FIN, consigneGlobaleOrthogonalite, formatEnonceLatex, formuleSubstitueeTestLatex } from "../ui/formatOrthogonalite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOrthogonaliteTest;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTest) => void;
}

/**
 * Écran unique de la variante "test" : un champ numérique (le critère d'orthogonalité) ET un champ
 * catégoriel (conclusion), soumis ensemble en une seule tentative — le champ numérique est exigé
 * en plus de la conclusion pour empêcher de deviner sans calculer.
 *
 * Consigne globale + aide progressive à 2 niveaux, texte seul (les vecteurs sont libres, sans
 * position) : rappel vectoriel générique (u/v, jamais lié aux vrais noms de l'exercice — la même
 * version que l'écran "test du sommet" de la variante 3, `promptcorrectionsgenerateur25lot2.md`,
 * points 6-7), puis la formule substituée avec les valeurs réelles (non calculée). Marquage rouge
 * en direct du champ critère après un échec (point 5).
 */
export function EtapeTestOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texteCritere, setTexteCritere] = useState("");
  const [conclusion, setConclusion] = useState<boolean | null>(null);
  const max = NIVEAU_AIDE_MAX.test;

  const critere = Number(texteCritere.replace(",", "."));
  const complet = texteCritere.trim() !== "" && conclusion !== null;
  const statut = texteCritere.trim() !== "" && tentativesUtilisees > 0 ? diagnostiquerCritereTest(exercice, critere) : undefined;
  const critereErronee = tentativesUtilisees > 0 && statut !== undefined && statut !== "correct";
  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>
      <p className="prompt-text">Calcule le critère d'orthogonalité, puis conclus.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="orthogonalite-test-critere">
          Critère =
        </label>
        <input
          id="orthogonalite-test-critere"
          className={`text-input${critereErronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_CRITERE}
          value={texteCritere}
          onChange={(e) => setTexteCritere(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      <p className="prompt-text">
        {QUESTION_ORTHOGONALITE_VECTEURS_AVANT} <Katex expression={LATEX_VEC_U} /> {QUESTION_ORTHOGONALITE_VECTEURS_ENTRE} <Katex expression={LATEX_VEC_V} />{" "}
        {QUESTION_ORTHOGONALITE_VECTEURS_APRES}
      </p>
      <div className="options-grid-compact">
        <button type="button" className={conclusion === true ? "btn toggle-active" : "btn"} onClick={() => setConclusion(true)}>
          {LIBELLES_OUI_NON.positif}
        </button>
        <button type="button" className={conclusion === false ? "btn toggle-active" : "btn"} onClick={() => setConclusion(false)}>
          {LIBELLES_OUI_NON.negatif}
        </button>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            {RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT} <Katex expression={LATEX_VEC_U} /> {RAPPEL_VECTORIEL_ORTHOGONALITE_ENTRE} <Katex expression={LATEX_VEC_V} />{" "}
            {RAPPEL_VECTORIEL_ORTHOGONALITE_APRES} <Katex expression={LATEX_FORMULE_ORTHOGONALITE_VECTORIELLE} /> {RAPPEL_VECTORIEL_ORTHOGONALITE_FIN}
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formuleSubstitueeTestLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => complet && onValider({ critere, conclusion: conclusion as boolean })}
      >
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

import { useState } from "react";
import type { ExerciceColinearPoints, ExerciceColinearVecteurs } from "../core/colinearite.types";
import { diagnostiquerCritereTest } from "../moteur/verificationColinearite";
import type { ReponseTest } from "../moteur/verificationColinearite";
import { NIVEAU_AIDE_MAX_TEST } from "../moteur/sessionColinearite";
import {
  LATEX_FORMULE_COLINEARITE_VECTORIELLE,
  LATEX_VEC_U,
  LATEX_VEC_V,
  LIBELLES_OUI_NON,
  PLACEHOLDER_CRITERE,
  QUESTION_ALIGNEMENT_POINTS,
  QUESTION_COLINEARITE_VECTEURS_APRES,
  QUESTION_COLINEARITE_VECTEURS_AVANT,
  QUESTION_COLINEARITE_VECTEURS_ENTRE,
  RAPPEL_VECTORIEL_COLINEARITE_APRES,
  RAPPEL_VECTORIEL_COLINEARITE_AVANT,
  RAPPEL_VECTORIEL_COLINEARITE_ENTRE,
  RAPPEL_VECTORIEL_COLINEARITE_FIN,
  consigneGlobaleColinearite,
  etatActuelTestPoints,
  formatEnonceLatex,
  formatTermesEnoncePointsLatex,
  formuleSubstitueeTestLatex,
  libelleBoutonAide,
} from "../ui/formatColinearite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceColinearVecteurs | ExerciceColinearPoints;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTest) => void;
}

/**
 * Écran "test" — V1 (seul écran, variante "vecteurs") et V3-écran2 (variante "points", après
 * construction des vecteurs AB/AC — `promptcorrectionsgenerateur24complet.md`, points 14-17) : un
 * champ numérique (le critère de colinéarité) ET un ou deux champ(s) catégoriel(s), soumis ensemble
 * en une seule tentative — le champ numérique est exigé en plus de la conclusion pour empêcher de
 * deviner sans calculer.
 *
 * "points" : consigne globale + bloc "État actuel" (AB/AC, notation matricielle) + SECOND champ
 * catégoriel ("colinéaires ?" en plus de "alignés ?"). Les deux variantes partagent désormais la
 * MÊME aide vectorielle générique (u/v, jamais liée aux vrais noms de l'exercice) —
 * `promptcorrectionsgenerateur24lot2.md`, point 6 (consigne globale manquante sur V1) et point 7
 * (retrait de l'ancienne aide générique (a;b)/(c;d) de V1, qui coexistait à tort avec la version u/v
 * déjà utilisée par V3). Marquage rouge en direct du champ critère après un échec (point 5).
 *
 * `promptgen24modificationscompletes.md` : bloc de données de "points" passé en "bloc fitter"
 * (`formatTermesEnoncePointsLatex`, un fragment par point A/B/C) — "vecteurs" garde
 * `formatEnonceLatex` (2 vecteurs seulement, aucun risque de coupure). État actuel de "points"
 * (`etatActuelTestPoints`) déjà empilé verticalement, inchangé par ce prompt.
 */
export function EtapeTestColinearite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texteCritere, setTexteCritere] = useState("");
  const [conclusionAlignement, setConclusionAlignement] = useState<boolean | null>(null);
  const [conclusionColinearite, setConclusionColinearite] = useState<boolean | null>(null);

  const estPoints = exercice.variante === "points";
  const critere = Number(texteCritere.replace(",", "."));
  const complet = texteCritere.trim() !== "" && conclusionAlignement !== null && (!estPoints || conclusionColinearite !== null);
  const statut = texteCritere.trim() !== "" && tentativesUtilisees > 0 ? diagnostiquerCritereTest(exercice, critere) : undefined;
  const critereErronee = tentativesUtilisees > 0 && statut !== undefined && statut !== "correct";
  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      {estPoints && exercice.variante === "points" ? (
        <div className="equation-box equation-box-termes">
          {formatTermesEnoncePointsLatex(exercice).map((t, i) => (
            <Katex key={i} expression={t} />
          ))}
        </div>
      ) : (
        <div className="equation-box">
          <Katex expression={formatEnonceLatex(exercice)} />
        </div>
      )}
      {estPoints && exercice.variante === "points" && <EtatActuelPanel latex={etatActuelTestPoints(exercice)} />}
      <p className="prompt-text">Calcule le critère de colinéarité, puis conclus.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="colinearite-test-critere">
          Critère =
        </label>
        <input
          id="colinearite-test-critere"
          className={`text-input${critereErronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_CRITERE}
          value={texteCritere}
          onChange={(e) => setTexteCritere(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {estPoints && (
        <>
          <p className="prompt-text">
            {QUESTION_COLINEARITE_VECTEURS_AVANT} <Katex expression={LATEX_VEC_U} /> {QUESTION_COLINEARITE_VECTEURS_ENTRE} <Katex expression={LATEX_VEC_V} />{" "}
            {QUESTION_COLINEARITE_VECTEURS_APRES}
          </p>
          <div className="options-grid-compact">
            <button type="button" className={conclusionColinearite === true ? "btn toggle-active" : "btn"} onClick={() => setConclusionColinearite(true)}>
              {LIBELLES_OUI_NON.positif}
            </button>
            <button type="button" className={conclusionColinearite === false ? "btn toggle-active" : "btn"} onClick={() => setConclusionColinearite(false)}>
              {LIBELLES_OUI_NON.negatif}
            </button>
          </div>
        </>
      )}

      {estPoints ? (
        <p className="prompt-text">{QUESTION_ALIGNEMENT_POINTS}</p>
      ) : (
        <p className="prompt-text">
          {QUESTION_COLINEARITE_VECTEURS_AVANT} <Katex expression={LATEX_VEC_U} /> {QUESTION_COLINEARITE_VECTEURS_ENTRE} <Katex expression={LATEX_VEC_V} />{" "}
          {QUESTION_COLINEARITE_VECTEURS_APRES}
        </p>
      )}
      <div className="options-grid-compact">
        <button type="button" className={conclusionAlignement === true ? "btn toggle-active" : "btn"} onClick={() => setConclusionAlignement(true)}>
          {LIBELLES_OUI_NON.positif}
        </button>
        <button type="button" className={conclusionAlignement === false ? "btn toggle-active" : "btn"} onClick={() => setConclusionAlignement(false)}>
          {LIBELLES_OUI_NON.negatif}
        </button>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            {RAPPEL_VECTORIEL_COLINEARITE_AVANT} <Katex expression={LATEX_VEC_U} /> {RAPPEL_VECTORIEL_COLINEARITE_ENTRE} <Katex expression={LATEX_VEC_V} />{" "}
            {RAPPEL_VECTORIEL_COLINEARITE_APRES} <Katex expression={LATEX_FORMULE_COLINEARITE_VECTORIELLE} /> {RAPPEL_VECTORIEL_COLINEARITE_FIN}
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formuleSubstitueeTestLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_TEST} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_TEST)}
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() =>
          complet &&
          onValider({
            critere,
            conclusionColinearite: estPoints ? (conclusionColinearite as boolean) : (conclusionAlignement as boolean),
            conclusionAlignement: estPoints ? conclusionAlignement : null,
          })
        }
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

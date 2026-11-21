import { useState } from "react";
import type { ExerciceColinearPoints, ExerciceColinearVecteurs } from "../core/colinearite.types";
import { conclusionAttendue, diagnostiquerCritereTest } from "../moteur/verificationColinearite";
import type { ReponseTest } from "../moteur/verificationColinearite";
import type { ChoixFige } from "../moteur/typesColinearite";
import { LATEX_VEC_U, LATEX_VEC_V, LIBELLES_OUI_NON, PLACEHOLDER_CRITERE, QUESTION_COLINEARITE_VECTEURS_APRES, QUESTION_COLINEARITE_VECTEURS_AVANT, QUESTION_COLINEARITE_VECTEURS_ENTRE, consigneGlobaleColinearite, formatEnonceLatex, formatTermesEnoncePointsLatex, questionAlignementPoints } from "../ui/formatColinearite";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesTestColinearite, messageConclusionColinearite, messageCritereColinearite } from "../ui/retoursVecteurs2";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceColinearVecteurs | ExerciceColinearPoints;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Conclusion(s) jugée(s) à la première validation, puis figée(s) (`sessionColinearite`). */
  conclusionFigee: ChoixFige<{ colinearite: boolean; alignement: boolean | null }> | null;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTest) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran « test » (variante « vecteurs », seul écran ; variante « points », écran 2) : le critère de
 * colinéarité (champ) puis la conclusion (choix fermé). Audit 4e ch. 6, lot B (G3) : la conclusion
 * est jugée UNE fois, à la première validation, puis figée — révélée si elle était fausse ; le
 * critère garde ses tentatives. Saisie illisible sans tentative, message ciblé (produit scalaire
 * calculé, somme au lieu de différence), aides à deux niveaux.
 */
export function EtapeTestColinearite({ exercice, tentativesUtilisees, tentativesMax, conclusionFigee, onActiverAide, onValider, validation }: Props) {
  const [texteCritere, setTexteCritere] = useState("");
  const [conclusionAlignement, setConclusionAlignement] = useState<boolean | null>(null);
  const [conclusionColinearite, setConclusionColinearite] = useState<boolean | null>(null);
  const saisie = useTentativeLisible<ReponseTest>();

  const estPoints = exercice.variante === "points";
  const critereLu = lireNombreSaisi(texteCritere);
  const attendue = conclusionAttendue(exercice);
  // Conclusions affichées : la bonne réponse une fois figée et fausse, sinon le choix de l'élève.
  const figee = conclusionFigee !== null;
  const affColin = figee ? (conclusionFigee.correct ? conclusionFigee.choisi.colinearite : attendue) : conclusionColinearite;
  const affAlign = figee ? (conclusionFigee.correct ? (estPoints ? conclusionFigee.choisi.alignement : conclusionFigee.choisi.colinearite) : attendue) : conclusionAlignement;
  const complet = texteCritere.trim() !== "" && affAlign !== null && (!estPoints || affColin !== null);
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const critereErronee = jugee !== null && diagnostiquerCritereTest(exercice, jugee.critere) !== "correct";
  const consigneGlobale = consigneGlobaleColinearite(exercice);
  const choixBloque = !!validation || figee;

  function boutons(valeur: boolean | null, choisir: (v: boolean) => void) {
    return (
      <div className="options-grid-compact">
        <button disabled={choixBloque} type="button" className={valeur === true ? "btn toggle-active" : "btn"} onClick={() => choisir(true)}>
          {LIBELLES_OUI_NON.positif}
        </button>
        <button disabled={choixBloque} type="button" className={valeur === false ? "btn toggle-active" : "btn"} onClick={() => choisir(false)}>
          {LIBELLES_OUI_NON.negatif}
        </button>
      </div>
    );
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobale}
        blocDonnees={
          estPoints && exercice.variante === "points" ? (
            <div className="equation-box equation-box-termes">
              {formatTermesEnoncePointsLatex(exercice).map((t, i) => (
                <Katex key={i} expression={t} />
              ))}
            </div>
          ) : (
            <div className="equation-box">
              <Katex expression={formatEnonceLatex(exercice)} />
            </div>
          )
        }
      />
      <p className="prompt-text">Calcule le critère de colinéarité, puis conclus.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="colinearite-test-critere">
          Critère =
        </label>
        <input
          disabled={!!validation}
          id="colinearite-test-critere"
          className={`text-input${critereErronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_CRITERE}
          value={texteCritere}
          onChange={(e) => setTexteCritere(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {estPoints && exercice.variante === "points" && (
        <>
          {/* Variante "points" : les vecteurs réellement construits, AB⃗ et AC⃗ — jamais u⃗/v⃗, absents de l'énoncé. */}
          <p className="prompt-text prompt-text--question-multiple">
            {QUESTION_COLINEARITE_VECTEURS_AVANT} <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} /> {QUESTION_COLINEARITE_VECTEURS_ENTRE}{" "}
            <Katex expression={`\\vec{${exercice.labelA}${exercice.labelC}}`} /> {QUESTION_COLINEARITE_VECTEURS_APRES}
          </p>
          {boutons(affColin, setConclusionColinearite)}
        </>
      )}

      {estPoints && exercice.variante === "points" ? (
        <p className="prompt-text prompt-text--question-multiple">{questionAlignementPoints(exercice)}</p>
      ) : (
        <p className="prompt-text">
          {QUESTION_COLINEARITE_VECTEURS_AVANT} <Katex expression={LATEX_VEC_U} /> {QUESTION_COLINEARITE_VECTEURS_ENTRE} <Katex expression={LATEX_VEC_V} /> {QUESTION_COLINEARITE_VECTEURS_APRES}
        </p>
      )}
      {boutons(affAlign, setConclusionAlignement)}
      {figee && !conclusionFigee.correct && !validation && (
        <p className="alert-error" role="status">
          <span>
            <RenduFragments fragments={messageConclusionColinearite(exercice)} />
          </span>
        </p>
      )}

      {!validation && (
        <PiedVecteurs
          aides={aidesTestColinearite(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={() => ({
            critere: critereLu ?? Number.NaN,
            conclusionColinearite: estPoints ? (affColin as boolean) : (affAlign as boolean),
            conclusionAlignement: estPoints ? affAlign : null,
          })}
          lisible={() => critereLu !== null}
          onValider={onValider}
          texteIllisible={ILLISIBLE_VECTEURS.critere}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => messageCritereColinearite(exercice, r.critere)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

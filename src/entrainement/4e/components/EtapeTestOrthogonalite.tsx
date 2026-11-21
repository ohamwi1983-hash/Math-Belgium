import { useState } from "react";
import type { ExerciceOrthogonaliteTest } from "../core/orthogonalite.types";
import type { ReponseTest } from "../moteur/verificationOrthogonalite";
import { diagnostiquerCritereTest } from "../moteur/verificationOrthogonalite";
import type { ChoixFigeOrthogonalite } from "../moteur/typesOrthogonalite";
import { LATEX_VEC_U, LATEX_VEC_V, LIBELLES_OUI_NON, PLACEHOLDER_CRITERE, QUESTION_ORTHOGONALITE_VECTEURS_APRES, QUESTION_ORTHOGONALITE_VECTEURS_AVANT, QUESTION_ORTHOGONALITE_VECTEURS_ENTRE, consigneGlobaleOrthogonalite, formatEnonceLatex } from "../ui/formatOrthogonalite";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesTestOrthogonalite, messageConclusionOrthogonalite, messageCritereOrthogonalite } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceOrthogonaliteTest;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Conclusion jugée à la première validation, puis figée (`sessionOrthogonalite`). */
  choixFige: ChoixFigeOrthogonalite | null;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTest) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de la variante « test » : le produit scalaire (champ) puis la conclusion (choix
 * fermé). Audit 4e ch. 6, lot B (G3) : la conclusion est jugée UNE fois puis figée — révélée si elle
 * était fausse ; le champ garde ses tentatives. Saisie illisible sans tentative, message ciblé
 * (produits en croix de la colinéarité), aides à deux niveaux.
 */
export function EtapeTestOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, choixFige, onActiverAide, onValider, validation }: Props) {
  const [texteCritere, setTexteCritere] = useState("");
  const [conclusionChoisie, setConclusion] = useState<boolean | null>(null);
  const [premiere, setPremiere] = useState<boolean | null>(null);
  const saisie = useTentativeLisible<ReponseTest>();

  const lu = lireNombreSaisi(texteCritere);
  // Conclusion figée : celle de la première validation si elle était juste, sinon la bonne.
  const conclusion = choixFige ? (choixFige.correct ? premiere : exercice.orthogonaux) : conclusionChoisie;
  const complet = texteCritere.trim() !== "" && conclusion !== null;
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const critereErronee = jugee !== null && diagnostiquerCritereTest(exercice, jugee.critere) !== "correct";
  const bloque = !!validation || choixFige !== null;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobaleOrthogonalite(exercice)}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text prompt-text--question-multiple">Calcule le produit scalaire, puis conclus.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="orthogonalite-test-critere">
          Produit scalaire =
        </label>
        <input
          disabled={!!validation}
          id="orthogonalite-test-critere"
          className={`text-input${critereErronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_CRITERE}
          value={texteCritere}
          onChange={(e) => setTexteCritere(normaliserSigneMoins(e.target.value))}
        />
      </div>

      <p className="prompt-text prompt-text--question-multiple">
        {QUESTION_ORTHOGONALITE_VECTEURS_AVANT} <Katex expression={LATEX_VEC_U} /> {QUESTION_ORTHOGONALITE_VECTEURS_ENTRE} <Katex expression={LATEX_VEC_V} /> {QUESTION_ORTHOGONALITE_VECTEURS_APRES}
      </p>
      <div className="options-grid-compact">
        <button disabled={bloque} type="button" className={conclusion === true ? "btn toggle-active" : "btn"} onClick={() => setConclusion(true)}>
          {LIBELLES_OUI_NON.positif}
        </button>
        <button disabled={bloque} type="button" className={conclusion === false ? "btn toggle-active" : "btn"} onClick={() => setConclusion(false)}>
          {LIBELLES_OUI_NON.negatif}
        </button>
      </div>
      {choixFige !== null && !choixFige.correct && !validation && (
        <p className="alert-error" role="status">
          <span>
            <RenduFragments fragments={messageConclusionOrthogonalite(exercice)} />
          </span>
        </p>
      )}

      {!validation && (
        <PiedVecteurs
          aides={aidesTestOrthogonalite(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={() => ({ critere: lu ?? Number.NaN, conclusion: conclusion as boolean })}
          lisible={() => lu !== null}
          onValider={(r) => {
            if (choixFige === null) setPremiere(r.conclusion);
            onValider(r);
          }}
          texteIllisible={ILLISIBLE_VECTEURS.produitScalaire}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => messageCritereOrthogonalite(exercice.v1, exercice.v2, r.critere)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

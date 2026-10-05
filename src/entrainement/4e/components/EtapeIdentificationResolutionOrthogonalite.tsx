import { useState } from "react";
import type { ExerciceOrthogonaliteTriangleParametre, Sommet } from "../core/orthogonalite.types";
import type { ReponseIdentificationResolution } from "../moteur/verificationOrthogonalite";
import { diagnostiquerResolutionTriangleParametre } from "../moteur/verificationOrthogonalite";
import {
  LIBELLES_OUI_NON,
  PLACEHOLDER_SOLUTION_X,
  QUESTION_SOMMET_RECTANGLE,
  QUESTION_TRIANGLE_RECTANGLE,
  consigneGlobaleOrthogonalite,
  formatReductionLatex,
  formatTermesEnonceTriangleParametreLatex,
} from "../ui/formatOrthogonalite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceOrthogonaliteTriangleParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseIdentificationResolution) => void;
}

const SOMMETS: Sommet[] = ["A", "B", "C"];

function labelSommet(exercice: ExerciceOrthogonaliteTriangleParametre, sommet: Sommet): string {
  return sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
}

/**
 * Écran "identification et résolution" — variante 4, écran 5 (dernier). Restructuré par
 * `promptcorrectionsgenerateur25lot3.md`, point 3, puis par `promptcorrectionsgenerateur25lot4.md`,
 * section 2 :
 * - consigne globale + bloc des points (point f, tous deux manquaient jusque-là) ;
 * - les 3 équations réduites sont désormais affichées avec leur label AU-DESSUS de l'équation
 *   (point a), jamais sur la même ligne ;
 * - consigne de résolution reformulée en "Résous la seule équation résolvable." (point b) — un seul
 *   champ numérique `x =` (point c), sans qu'aucune sélection catégorielle ne soit exigée au
 *   préalable pour identifier l'équation ;
 * - une fois x résolu, la conclusion se pose désormais en 2 questions liées, EXACTEMENT comme
 *   `EtapeConclusionTriangleOrthogonalite` (V3) : "Ce triangle est-il rectangle ?" (Oui/Non), puis
 *   — uniquement si "Oui" — "Il est rectangle en :" (A/B/C). Cette variante garantit toujours
 *   exactement un sommet résoluble (la réponse attendue à la question 1 est donc toujours "Oui"),
 *   mais l'interface pose la question NORMALEMENT — jamais pré-remplie ni masquée, pour ne donner
 *   aucun indice supplémentaire à l'élève ;
 * - **aucune aide sur cet écran** (point e, aide entièrement retirée — `NIVEAU_AIDE_MAX.identificationResolution
 *   = 0`, même convention "max=0 → pas de bouton" que "resolutionParametre").
 *
 * La réponse soumise devient `{estRectangle, sommet, x}` (`ReponseIdentificationResolution`) — voir
 * `verificationOrthogonalite.ts` pour la vérification des 2 champs liés.
 *
 * `promptgen25modificationscompletes.md` : bloc des points passé en "bloc fitter"
 * (`formatTermesEnonceTriangleParametreLatex`) — le bloc des 3 équations réduites reste inchangé
 * (déjà un `<div>` par sommet, aucun risque de coupure).
 */
export function EtapeIdentificationResolutionOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [estRectangle, setEstRectangle] = useState<boolean | null>(null);
  const [sommet, setSommet] = useState<Sommet | null>(null);
  const [texteX, setTexteX] = useState("");
  const valeurX = Number(texteX.replace(",", "."));
  const complet = texteX.trim() !== "" && (estRectangle === false || (estRectangle === true && sommet !== null));
  const statut = texteX.trim() !== "" && tentativesUtilisees > 0 ? diagnostiquerResolutionTriangleParametre(exercice, valeurX) : undefined;
  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  const reductions: Record<Sommet, ReturnType<typeof formatReductionLatex>> = {
    A: formatReductionLatex(exercice.reductionA),
    B: formatReductionLatex(exercice.reductionB),
    C: formatReductionLatex(exercice.reductionC),
  };

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceTriangleParametreLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <div className="equation-box">
        {SOMMETS.map((s) => (
          <div key={s}>
            <p>Sommet {s} :</p>
            <Katex expression={reductions[s]} />
          </div>
        ))}
      </div>
      <p className="prompt-text">Résous la seule équation résolvable.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="orthogonalite-identification-x">
          x =
        </label>
        <input
          id="orthogonalite-identification-x"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_SOLUTION_X}
          value={texteX}
          onChange={(e) => setTexteX(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      <p className="prompt-text">{QUESTION_TRIANGLE_RECTANGLE}</p>
      <div className="options-grid-compact">
        <button
          type="button"
          className={estRectangle === true ? "btn toggle-active" : "btn"}
          onClick={() => setEstRectangle(true)}
        >
          {LIBELLES_OUI_NON.positif}
        </button>
        <button
          type="button"
          className={estRectangle === false ? "btn toggle-active" : "btn"}
          onClick={() => {
            setEstRectangle(false);
            setSommet(null);
          }}
        >
          {LIBELLES_OUI_NON.negatif}
        </button>
      </div>

      {estRectangle === true && (
        <>
          <p className="prompt-text contenu-conditionnel">{QUESTION_SOMMET_RECTANGLE}</p>
          <div className="options-grid-compact">
            {SOMMETS.map((s) => (
              <button key={s} type="button" className={sommet === s ? "btn toggle-active" : "btn"} onClick={() => setSommet(s)}>
                {labelSommet(exercice, s)}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => complet && onValider({ estRectangle: estRectangle as boolean, sommet, x: valeurX })}
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

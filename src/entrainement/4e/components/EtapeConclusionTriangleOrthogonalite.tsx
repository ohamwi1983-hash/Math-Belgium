import { useState } from "react";
import type { ExerciceOrthogonaliteTriangle, Sommet } from "../core/orthogonalite.types";
import type { ReponseConclusionTriangle } from "../moteur/verificationOrthogonalite";
import { NIVEAU_AIDE_MAX } from "../moteur/typesOrthogonalite";
import {
  LIBELLES_OUI_NON,
  QUESTION_SOMMET_RECTANGLE,
  QUESTION_TRIANGLE_RECTANGLE,
  TEXTE_AIDE_CONCLUSION_TRIANGLE,
  consigneGlobaleOrthogonalite,
  etatActuelConclusionTriangle,
  formatTermesEnonceTriangleLatex,
  libelleBoutonAide,
} from "../ui/formatOrthogonalite";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceOrthogonaliteTriangle;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConclusionTriangle) => void;
}

const SOMMETS: Sommet[] = ["A", "B", "C"];

function labelSommet(exercice: ExerciceOrthogonaliteTriangle, sommet: Sommet): string {
  return sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
}

/**
 * Écran "conclusion" — variante 3, écran 5 (dernier). `promptcorrectionsgenerateur25lot4.md`,
 * section 2 : remplace le choix unique à 4 options ("Rectangle en A/B/C" / "Pas rectangle") par
 * une séquence en 2 questions liées — question 1 ("Ce triangle est-il rectangle ?", Oui/Non), puis
 * — uniquement si "Oui" — question 2 ("Il est rectangle en :", A/B/C). **Contrairement à
 * `EtapeIdentificationResolutionOrthogonalite` (V4)**, cet écran conserve la possibilité de
 * répondre "Non" : la variante 3 n'a aucune garantie qu'un sommet soit résoluble, contrairement à
 * la variante 4.
 *
 * Aide à 1 niveau : rappel qu'un seul des 3 tests peut donner 0 pour un triangle non dégénéré.
 *
 * `promptgen25modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnonceTriangleLatex`) + NOUVEAU bloc "état actuel" (`etatActuelConclusionTriangle`,
 * les 3 critères d'orthogonalité déjà validés aux 3 écrans précédents) — jusque-là manquant : le
 * seul bloc violet visible sur cet écran n'affichait que les coordonnées de départ (le bloc de
 * données), jamais un récapitulatif des critères déjà calculés.
 */
export function EtapeConclusionTriangleOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [estRectangle, setEstRectangle] = useState<boolean | null>(null);
  const [sommet, setSommet] = useState<Sommet | null>(null);
  const max = NIVEAU_AIDE_MAX.conclusionTriangle;
  const complet = estRectangle === false || (estRectangle === true && sommet !== null);
  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceTriangleLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <EtatActuelPanel latex={etatActuelConclusionTriangle(exercice)} />
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

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_CONCLUSION_TRIANGLE}</p>
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, max)}
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => complet && onValider({ estRectangle: estRectangle as boolean, sommet })}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}

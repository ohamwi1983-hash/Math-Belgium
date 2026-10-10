import { useState } from "react";
import type { ExerciceOrthogonaliteTriangle, Sommet } from "../core/orthogonalite.types";
import { diagnostiquerTestSommetTriangle } from "../moteur/verificationOrthogonalite";
import { NIVEAU_AIDE_MAX } from "../moteur/typesOrthogonalite";
import { LATEX_FORMULE_ORTHOGONALITE_VECTORIELLE, LATEX_PIEGE_B_EQUATION, LATEX_PIEGE_B_SEUL, LATEX_PIEGE_C_EQUATION_1, LATEX_PIEGE_C_EQUATION_2, LATEX_VEC_U, LATEX_VEC_V, PLACEHOLDER_CRITERE, RAPPEL_VECTORIEL_ORTHOGONALITE_APRES, RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT, RAPPEL_VECTORIEL_ORTHOGONALITE_ENTRE, RAPPEL_VECTORIEL_ORTHOGONALITE_FIN, TEXTE_AIDE_PIEGE_B_APRES, TEXTE_AIDE_PIEGE_B_AVANT, TEXTE_AIDE_PIEGE_B_ENTRE, TEXTE_AIDE_PIEGE_C_APRES, TEXTE_AIDE_PIEGE_C_AVANT, TEXTE_AIDE_PIEGE_C_ENTRE, consigneGlobaleOrthogonalite, etatActuelTestSommet, formatTermesEnonceTriangleLatex, formuleSubstitueeSommetTriangleLatex } from "../ui/formatOrthogonalite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOrthogonaliteTriangle;
  sommet: Sommet;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
}

const PHASE_PAR_SOMMET = { A: "testSommetA", B: "testSommetB", C: "testSommetC" } as const;

function labelSommet(exercice: ExerciceOrthogonaliteTriangle, sommet: Sommet): string {
  return sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
}

/** `promptcorrectionsgenerateur25lot3.md`, point 2 — rendu correct du piège de conversion de signe
 * (prose + fragments Katex courts, jamais un bloc de texte brut embarquant du LaTeX littéral). */
function Piege({ sommet }: { sommet: Sommet }) {
  if (sommet === "B") {
    return (
      <p>
        {TEXTE_AIDE_PIEGE_B_AVANT} <Katex expression={LATEX_PIEGE_B_EQUATION} />
        {TEXTE_AIDE_PIEGE_B_ENTRE} <Katex expression={LATEX_PIEGE_B_SEUL} /> {TEXTE_AIDE_PIEGE_B_APRES}
      </p>
    );
  }
  if (sommet === "C") {
    return (
      <p>
        {TEXTE_AIDE_PIEGE_C_AVANT} <Katex expression={LATEX_PIEGE_C_EQUATION_1} /> {TEXTE_AIDE_PIEGE_C_ENTRE} <Katex expression={LATEX_PIEGE_C_EQUATION_2} />{" "}
        {TEXTE_AIDE_PIEGE_C_APRES}
      </p>
    );
  }
  return null;
}

/**
 * Écran "test du sommet [X]" — variante 3, écrans 2 à 4 : un champ numérique (le critère
 * d'orthogonalité pour ce sommet précis). Générique sur `sommet` — même composant pour A, B, C,
 * seul le texte d'aide 1 change (rappel du piège BA⃗=-AB⃗/CA⃗=-AC⃗ et CB⃗=-BC⃗ pour B/C, aucun piège
 * pour A).
 *
 * `promptcorrectionsgenerateur25complet.md`, points 13-14 : bloc "État actuel" (vecteurs concernés
 * par ce test, notation matricielle) + aide progressive à 2 niveaux reformulée en notation
 * vectorielle générique (u/v, jamais liée aux vrais noms AB/AC/BC de l'exercice) — puis la formule
 * substituée avec les valeurs réelles (non calculée).
 *
 * `promptgen25modificationscompletes.md` : consigne globale (jusque-là absente de cet écran, seul
 * écran de la variante à ne pas l'avoir) ajoutée + bloc de données redondant (points A/B/C, "bloc
 * fitter" via `formatTermesEnonceTriangleLatex`) — le bloc "état actuel" reste distinct, inchangé
 * dans son contenu (seulement son rendu interne passé de `\qquad` à `\begin{gathered}`, voir
 * `ui/formatOrthogonalite.ts`).
 */
export function EtapeTestSommetOrthogonalite({ exercice, sommet, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const max = NIVEAU_AIDE_MAX[PHASE_PAR_SOMMET[sommet]];
  const valeur = Number(texte.replace(",", "."));
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerTestSommetTriangle(exercice, sommet, valeur) : undefined;
  const erronee = statut !== undefined && statut !== "correct";
  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceTriangleLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <EtatActuelPanel latex={etatActuelTestSommet(exercice, sommet)} />
      <p className="prompt-text">
        Ce triangle est-il rectangle en {labelSommet(exercice, sommet)} ? Calcule le critère d'orthogonalité correspondant.
      </p>

      <div className="field field-inline">
        <label className="field-label" htmlFor={`orthogonalite-testsommet-${sommet}`}>
          Critère =
        </label>
        <input
          id={`orthogonalite-testsommet-${sommet}`}
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_CRITERE}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <Piege sommet={sommet} />
          <p>
            {RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT} <Katex expression={LATEX_VEC_U} /> {RAPPEL_VECTORIEL_ORTHOGONALITE_ENTRE} <Katex expression={LATEX_VEC_V} />{" "}
            {RAPPEL_VECTORIEL_ORTHOGONALITE_APRES} <Katex expression={LATEX_FORMULE_ORTHOGONALITE_VECTORIELLE} /> {RAPPEL_VECTORIEL_ORTHOGONALITE_FIN}
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formuleSubstitueeSommetTriangleLatex(exercice, sommet)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur)}>
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

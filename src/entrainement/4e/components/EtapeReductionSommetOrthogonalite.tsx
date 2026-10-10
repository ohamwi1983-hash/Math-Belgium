import { useState } from "react";
import type { ExerciceOrthogonaliteTriangleParametre, Sommet } from "../core/orthogonalite.types";
import { diagnostiquerReductionSommet } from "../moteur/verificationOrthogonalite";
import { NIVEAU_AIDE_MAX } from "../moteur/typesOrthogonalite";
import { LATEX_FORMULE_ORTHOGONALITE_VECTORIELLE, LATEX_PIEGE_B_EQUATION, LATEX_PIEGE_B_SEUL, LATEX_PIEGE_C_EQUATION_1, LATEX_PIEGE_C_EQUATION_2, LATEX_VEC_U, LATEX_VEC_V, PLACEHOLDER_EQUATION_REDUITE, RAPPEL_VECTORIEL_ORTHOGONALITE_APRES, RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT, RAPPEL_VECTORIEL_ORTHOGONALITE_ENTRE, RAPPEL_VECTORIEL_ORTHOGONALITE_FIN, TEXTE_AIDE_PIEGE_B_APRES, TEXTE_AIDE_PIEGE_B_AVANT, TEXTE_AIDE_PIEGE_B_ENTRE, TEXTE_AIDE_PIEGE_C_APRES, TEXTE_AIDE_PIEGE_C_AVANT, TEXTE_AIDE_PIEGE_C_ENTRE, consigneGlobaleOrthogonalite, etatActuelReductionSommet, formatTermesEnonceTriangleParametreLatex, formuleSubstitueeSommetTriangleParametreLatex } from "../ui/formatOrthogonalite";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOrthogonaliteTriangleParametre;
  sommet: Sommet;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

const PHASE_PAR_SOMMET = { A: "reductionSommetA", B: "reductionSommetB", C: "reductionSommetC" } as const;

function labelSommet(exercice: ExerciceOrthogonaliteTriangleParametre, sommet: Sommet): string {
  return sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
}

/** `promptcorrectionsgenerateur25lot3.md`, point 2 — même correctif que `EtapeTestSommetOrthogonalite.tsx`
 * (rendu correct du piège de conversion de signe, prose + fragments Katex courts). */
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
 * Écran "réduction du sommet [X]" — variante 4, écrans 2 à 4 : UN SEUL champ de saisie libre
 * attendant l'équation réduite complète (`... = 0`), quel que soit son degré réel (linéaire pour le
 * sommet fixe, quadratique pour les 2 sommets mobiles — voir `core/orthogonalite.types.ts` pour la
 * justification géométrique complète) — `promptcorrectionsgenerateur25complet.md`, points 5-6.
 *
 * Bloc "État actuel" (vecteurs concernés par ce test, notation matricielle, point 5) + aide
 * progressive à 2 niveaux reformulée en notation vectorielle générique (point 7, même formulation
 * que l'écran "test du sommet" de la variante 3) — conserve le rappel du piège BA⃗=-AB⃗/CA⃗=-AC⃗ et
 * CB⃗=-BC⃗ pour B/C, déjà prévu à la création.
 *
 * `promptgen25modificationscompletes.md` : consigne globale ET bloc de données redondant (points
 * A/B/C, "bloc fitter" via `formatTermesEnonceTriangleParametreLatex`) ajoutés — jusque-là tous
 * deux absents de cet écran (seul le bloc "état actuel" y était affiché).
 */
export function EtapeReductionSommetOrthogonalite({ exercice, sommet, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const max = NIVEAU_AIDE_MAX[PHASE_PAR_SOMMET[sommet]];
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerReductionSommet(exercice, sommet, texte) : undefined;
  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceTriangleParametreLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <EtatActuelPanel latex={etatActuelReductionSommet(exercice, sommet)} />
      <p className="prompt-text">Réduis le critère d'orthogonalité du sommet {labelSommet(exercice, sommet)} à une équation.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor={`orthogonalite-reductionsommet-${sommet}-equation`}>
          Équation =
        </label>
        <input
          id={`orthogonalite-reductionsommet-${sommet}-equation`}
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION_REDUITE}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
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
              Formule substituée : <Katex expression={formuleSubstitueeSommetTriangleParametreLatex(exercice, sommet)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
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

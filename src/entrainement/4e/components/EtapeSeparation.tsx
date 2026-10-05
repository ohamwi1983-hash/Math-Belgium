import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques, ReponseSeparation } from "../core/caracteristiquesAlgebriques.types";
import { diagnostiquerSeparationNiveau1 } from "../moteur/verificationCaracteristiquesAlgebriques";
import { formatEquationRechercheZerosLatex } from "../ui/formatCaracteristiquesAlgebriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  etatActuel: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseSeparation) => void;
}

/**
 * Étape "séparation" (spec section 4, point 5) — `valeur_absolue`/`carre` uniquement (jamais
 * atteinte pour les 4 autres familles, voir `necessiteSeparation`). Deux champs ENTIÈREMENT LIBRES
 * (`prompt-corrections-ecrans-zeros.md`, point 4 — retire les anciens labels pré-remplis `P1 = -4`/
 * `-P1 = -4`, qui révélaient la réponse attendue) : l'élève écrit chaque équation complète
 * lui-même, sur trois lignes — champ / "ou" / champ — plutôt que deux champs juxtaposés avec un
 * label spoiler. Soumis ENSEMBLE, en une seule tentative (même principe "tout ou rien" que le reste
 * du projet pour un écran à plusieurs champs, ex. la grille de l'exercice 5). `etatActuel` (point 2)
 * rappelle l'équation isolée confirmée à l'étape précédente — voir
 * `calculerEtatActuelCaracteristiquesAlgebriques`.
 */
export function EtapeSeparation({ exercice, etatActuel, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [equation1, setEquation1] = useState("");
  const [equation2, setEquation2] = useState("");
  const complet = equation1.trim() !== "" && equation2.trim() !== "";
  const statut =
    tentativesUtilisees > 0 && exercice.niveau === "niveau1"
      ? diagnostiquerSeparationNiveau1(exercice, { equation1, equation2 })
      : undefined;
  const erronee = tentativesUtilisees > 0 && statut !== "correct";

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationRechercheZerosLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">Sépare l'équation isolée en deux équations.</p>
      <div className="field field-inline">
        <input
          className={`text-input${erronee ? " is-erronee" : ""}`}
          value={equation1}
          onChange={(e) => setEquation1(e.target.value)}
          aria-label="Première équation"
        />
      </div>
      <p className="prompt-text">ou</p>
      <div className="field field-inline">
        <input
          className={`text-input${erronee ? " is-erronee" : ""}`}
          value={equation2}
          onChange={(e) => setEquation2(e.target.value)}
          aria-label="Seconde équation"
        />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => onValider({ equation1, equation2 })}
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

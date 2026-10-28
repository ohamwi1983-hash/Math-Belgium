import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriquesNiveau1, ReponseParite } from "../core/caracteristiquesAlgebriques.types";
import { formatEquationNiveau1Latex } from "../ui/formatCaracteristiquesAlgebriques";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriquesNiveau1;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseParite) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const OPTIONS: { id: ReponseParite; label: string }[] = [
  { id: "paire", label: "Paire" },
  { id: "impaire", label: "Impaire" },
  { id: "ni", label: "Ni paire ni impaire" },
];

/** Étape "parité" (niveau 1 UNIQUEMENT, audit du chapitre 3) : un choix à 3 options parmi
 * paire/impaire/ni l'un ni l'autre — jamais de champ libre, la réponse est une catégorie, pas une
 * valeur numérique. Le domaine (déjà établi à l'écran précédent) conditionne la réponse pour
 * `racine_carree` (demi-droite — jamais symétrique, donc toujours "ni") et `inverse` (symétrique
 * seulement si son pôle est en 0) — voir `pariteAttendue`,
 * `moteur/verificationCaracteristiquesAlgebriques.ts`, pour le détail algébrique complet. */
export function EtapeParite({ exercice, tentativesUtilisees, tentativesMax, onValider, validation }: Props) {
  const [choix, setChoix] = useState<ReponseParite | null>(null);
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationNiveau1Latex(exercice)} block />
      </div>
      <p className="prompt-text">Cette fonction est-elle paire, impaire, ou ni l'une ni l'autre ?</p>
      <div className="options-grid">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`btn${choix === option.id ? " toggle-active" : ""}${erronee && choix === option.id ? " is-erronee" : ""}`}
            onClick={() => setChoix(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {!validation && (
        <>
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

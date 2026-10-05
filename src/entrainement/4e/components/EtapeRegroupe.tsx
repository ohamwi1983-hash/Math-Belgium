import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques } from "../core/caracteristiquesAlgebriques.types";
import { diagnostiquerRegroupe } from "../moteur/verificationCaracteristiquesAlgebriques";
import { formatEquationRechercheZerosLatex, instructionRegroupe, placeholderRegroupe } from "../ui/formatCaracteristiquesAlgebriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  etatActuel: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: string) => void;
}

/**
 * Étape "regroupe" (niveau 2, `inverse`/`racine_carree`/`racine_cubique` uniquement —
 * `prompt-corrections-niveau2-vague2.md`, point 2 — voir `necessiteRegroupe`,
 * `verificationCaracteristiquesAlgebriques.ts`, pour le garde-fou d'appel) — un champ libre où
 * l'élève écrit l'équation obtenue après avoir éliminé la fonction de référence (multiplier par le
 * dénominateur, élever au carré, élever au cube), vérifiée via `verifierRegroupe`
 * (`soumettreReponseRegroupe`, `sessionCaracteristiquesAlgebriques.ts`) contre le polynôme réel
 * correspondant. `exercice` reste typé au sens large (`ExerciceCaracteristiquesAlgebriques`, même
 * patron que `EtapeZerosAlgebrique.tsx`/`EtapeIsolementNiveau1.tsx`) — `instructionRegroupe`/
 * `placeholderRegroupe` n'acceptent que les 3 familles concernées, castées ici comme
 * `EtapeIsolementNiveau1.tsx` le fait déjà pour `carre`/`cube`, jamais un type plus étroit sur toute
 * la surface du composant (l'appelant, `AppCaracteristiquesAlgebriques.tsx`, garantit déjà la bonne
 * famille via `necessiteRegroupe` avant de monter ce composant). Miroir structurel
 * d'`EtapeDebarrasser.tsx` (niveau 1) — même patron "un champ libre + instruction adaptée à la
 * famille" — mais niveau 2 uniquement, insérée entre `isolement` (`inverse`/`racine_cubique`) ou
 * `validite` (`racine_carree`) et la suite. L'encadré du haut montre l'équation posée pour la
 * recherche des zéros, SANS le préfixe `f(x) =` (`formatEquationRechercheZerosLatex`, point 1 du
 * même prompt). `etatActuel` rappelle l'équation isolée confirmée à l'étape précédente (voir
 * `calculerEtatActuelCaracteristiquesAlgebriques`).
 */
export function EtapeRegroupe({ exercice, etatActuel, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const famille = exercice.famille as "inverse" | "racine_carree" | "racine_cubique";
  const statut = tentativesUtilisees > 0 ? diagnostiquerRegroupe(exercice, texte) : undefined;
  const erronee = statut !== undefined && statut !== "correct";

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationRechercheZerosLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">{instructionRegroupe(famille)}</p>
      <div className="field field-inline">
        <input
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={placeholderRegroupe(famille)}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          aria-label="Équation regroupée"
        />
      </div>
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

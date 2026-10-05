import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { PhaseModelisationSinusoide } from "../moteur5e/typesModelisationSinusoide";
import { formatTermesEtatActuelModelisationSinusoide } from "../ui5e/formatModelisationSinusoide";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceModelisationSinusoide;
  phase: PhaseModelisationSinusoide;
}

/**
 * Bloc "État actuel" (convention transversale, voir CLAUDE.md "Motifs partagés entre plusieurs
 * exercices — Bloc 'État actuel'") — rappelle, sur chaque écran APRÈS le premier de la séquence
 * RÉELLE de l'instance (`ordreComplet`, jusqu'à 17 phases possibles selon la technique/le type
 * tirés), les valeurs déjà CONFIRMÉES aux écrans précédents — jamais la saisie brute de l'élève,
 * toujours dérivé purement de `exercice` (un écran n'est atteint qu'une fois l'écran précédent
 * réellement résolu, correctement ou par révélation). Partagé par les 8 composants d'écran de
 * 5gen13 (contrairement au `EtatActuelCE` local à 5gen1, ici un seul composant réutilisé partout
 * plutôt que 8 copies quasi identiques). Ne rend rien si aucune valeur n'est encore accumulable
 * (premier écran de la séquence, quelle que soit la technique/le type).
 */
export function EtatActuelModelisation({ exercice, phase }: Props) {
  const termes = formatTermesEtatActuelModelisationSinusoide(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

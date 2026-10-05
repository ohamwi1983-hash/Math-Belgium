import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { QuestionFinale } from "./QuestionFinale";
import { TriangleLiesSketch } from "./TriangleLiesSketch";

interface Props {
  exercice: ExerciceTriangleLies;
}

/** Bloc "énoncé" persistant — contexte narratif + croquis SVG, affichés en tête de chaque écran
 * (même principe que `EnonceOptimisation.tsx`). `contexte` est de la prose pure (jamais de fragment
 * `$...$` pour ce générateur, contrairement à gen55/56/57 — les seules valeurs numériques affichées
 * le sont via les blocs de données dédiés de chaque écran, pas dans la phrase narrative elle-même).
 *
 * `QuestionFinale` (voir CLAUDE.md, "Question finale persistante") rappelle `exercice.questionCible`
 * — jusqu'ici affichée SEULEMENT comme consigne de l'écran "cible" lui-même (dernier écran avant
 * "interpretation") — sur TOUS les écrans, dont "pont"/"angles" où elle n'apparaissait jamais avant.
 * Toujours une chaîne réelle pour ce générateur (jamais `null`, contrairement à
 * `ContexteOptimisationCommun.questionFinale`). */
export function EnonceTriangleLies({ exercice }: Props) {
  return (
    <div>
      <div className="equation-box">
        <p className="prompt-text">{exercice.contexte}</p>
      </div>
      <QuestionFinale question={exercice.questionCible} />
      <TriangleLiesSketch exercice={exercice} />
    </div>
  );
}

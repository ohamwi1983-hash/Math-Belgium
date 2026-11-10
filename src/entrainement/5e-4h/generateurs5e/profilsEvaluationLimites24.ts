/**
 * Profil d'instance de 5gen24 (« Étude complète », chapitre 4 de 5e) pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = STRUCTURE de l'exercice : types d'exclusions (AV simple, AV double, point vide), triés ;
 *   comportement à l'infini (AH, AO ou aucune) ; recoupement de l'asymptote ou non. En tirage libre,
 *   on obtient 42 structures différentes (de 6 à 12 écrans) : la série A fixe la structure de chaque
 *   question, les autres séries la reproduisent avec d'autres nombres (mêmes étapes, même longueur).
 *   Variante bonus : « construction inverse » avec AH ou AO.
 * - Aucun cas particulier : mesuré sur 5 000 tirages par famille, rien ne RACCOURCIT la résolution
 *   dans une même structure — b = 0 pour une AO (≈ 10 %) ou |a| = 1 (≈ 35 %) se calculent pareil,
 *   AH y = 0 est une famille à part entière, et le recoupement est une étape de PLUS. Pas de case.
 * - `calcul` sans objet : toutes les valeurs sont exactes (entiers, fractions).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceEtudeComplete } from "../core5e/etudeComplete.types";

const ORDRE_EXCLUSIONS = { vaSimple: 0, vaDouble: 1, pointVide: 2 } as const;

export function formeEtudeComplete(e: ExerciceEtudeComplete): string {
  if (e.mode === "constructionInverse") return `construction-inverse|${e.proprietes.asymptote.type}`;
  const exclusions = e.exclusions
    .map((x) => x.type)
    .sort((a, b) => ORDRE_EXCLUSIONS[a] - ORDRE_EXCLUSIONS[b])
    .join("+");
  return `${exclusions}|${e.infini.type}${e.casSpecial ? "|recoupement" : ""}`;
}

export function profilEtudeComplete(e: ExerciceEtudeComplete): ProfilInstance {
  return { casParticulier: null, forme: formeEtudeComplete(e) };
}

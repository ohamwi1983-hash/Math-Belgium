import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDecompositionVecteur } from "../../core/decompositionVecteur.types";
import { coefficients, estDemiEntier } from "../../moteur/modeleDecompositionVecteur";
import { motifDe } from "./index";

/**
 * Profil d'instance de gen82 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe déjà la famille et la figure (réseau, parallélogramme, hexagone, quadrillage,
 *   composantes, « possible »).
 * - `forme` = figure + motif de signes des coefficients (++, +−, −−) + présence d'un demi-entier,
 *   ex. « hexagone:+-:entiers ». Le motif de signes porte le piège principal (aller « à contresens »
 *   donne un coefficient négatif) : l'imposer d'une série à l'autre garde la même difficulté, seuls
 *   la position, les vecteurs et les valeurs changent.
 * - Variante « possible » : la question est un VERDICT (décomposition possible ou non) — jamais figé
 *   d'une série à l'autre ni filtré comme cas particulier : `forme` constante « possible:verdict »,
 *   le verdict reste tiré à pile ou face dans chaque série.
 * - Cas particulier = un coefficient NUL (le vecteur est porté par une seule direction) : la moitié
 *   du travail disparaît. Par défaut une évaluation n'en tire pas ; la case du panneau en met un, le
 *   même pour toutes les séries. Jamais dans la variante « possible ».
 * - `calcul` absent : coefficients entiers ou demi-entiers, toujours sans calculatrice.
 */
export const LIBELLE_CAS_DECOMPOSITION_VECTEUR = "Inclure un cas particulier (un coefficient nul : le vecteur est porté par une seule des deux directions)";

export function formeDecompositionVecteur(e: ExerciceDecompositionVecteur): string {
  if (e.type === "composantes" && e.famille === "possible") return "possible:verdict";
  const c = coefficients(e)!;
  return `${e.famille}:${motifDe(c.a, c.b)}:${estDemiEntier(c.a) || estDemiEntier(c.b) ? "demi" : "entiers"}`;
}

export function profilDecompositionVecteur(e: ExerciceDecompositionVecteur): ProfilInstance {
  if (e.type === "composantes" && e.famille === "possible") return { casParticulier: null, forme: formeDecompositionVecteur(e) };
  const c = coefficients(e)!;
  return { casParticulier: c.a === 0 || c.b === 0 ? "coefficient-nul" : null, forme: formeDecompositionVecteur(e) };
}

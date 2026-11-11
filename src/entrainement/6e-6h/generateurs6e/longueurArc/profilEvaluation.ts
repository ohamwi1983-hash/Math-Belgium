/**
 * Profil d'instance de `6gen28` (« Longueur d'un arc de courbe ») pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * Cas particuliers (ce qui RACCOURCIT la résolution). Mesures sur 5 000 tirages par variante (rapport
 * de la refonte papier) :
 * - A, forme « puissances » : exposant n = 2 (le plus petit développement) ; forme « logarithme » :
 *   c = 2 (coefficient 1 devant ln x, f′(x) = x/4 − 1/x) ;
 * - B : k = 1 (t = √(x² + 1), éléments simples les plus courts) ou borne entière (a sans racine) ;
 * - C : 1 + x sous la racine (k = 1 : primitive sans facteur 1/k — l'exemple du cours).
 *
 * Calculatrice : jamais indispensable — toutes les longueurs ont une valeur EXACTE (rationnelle, ou
 * rationnel + c·ln q). `calcul` absent.
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceLongueurArc } from "../../core6e/longueurArc.types";

export const LIBELLE_CAS_LONGUEUR_ARC =
  "Inclure un cas particulier (exposant 2 ou coefficient 1 devant ln x, k = 1, borne entière, 1 + x sous la racine)";

const estEntier = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

export function profilLongueurArc(e: ExerciceLongueurArc): ProfilInstance {
  switch (e.famille) {
    case "A":
      if (e.forme === "puissances") return { casParticulier: e.n === 2 ? "exposant-2" : null };
      return { casParticulier: e.c === 2 ? "ln-coefficient-1" : null };
    case "B":
      if (e.k === 1) return { casParticulier: "k-1" };
      return { casParticulier: estEntier(e.a) ? "borne-entiere" : null };
    case "C":
      return { casParticulier: e.kNum === e.kDen ? "k-1" : null };
  }
}

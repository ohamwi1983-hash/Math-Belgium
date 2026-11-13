import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceValeurExacte } from "../../core/valeurExacte.types";
import { estPremierQuadrant, necessiteReduction } from "../../moteur/modeleValeurExacte";

/**
 * Profil d'instance de gen76 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - pas de `calcul` : toutes les instances sont exactes par construction (c'est LE générateur des
 *   évaluations sans calculatrice). Marquer `calcul: 'exacte'` ferait exclure gen76 quand la
 *   calculatrice est AUTORISÉE (le pipeline n'y garde que les instances qui l'exigent) : recherche
 *   plus lente et case « cas particulier » sans effet. Même choix que gen14–gen18
 *   (`profilsEvaluation4eCh5.ts`).
 * - `forme` fixe ce qui allonge la résolution, identique d'une série à l'autre, question par
 *   question : nombre de termes (n), d'angles à ramener dans [0° ; 360°[ (r), de tangentes (t), de
 *   produits (p) et de carrés (c). Exemple : « n3-r1-t1-p1-c0 ». Seuls les angles, les fonctions
 *   non tangentes et l'ordre changent entre les séries.
 * - Cas particulier = un terme sur un angle du PREMIER QUADRANT (après réduction éventuelle) :
 *   aucune symétrie, signe positif, la valeur remarquable se lit directement — le terme se règle en
 *   une ligne. Environ un tirage sur cinq ; par défaut une évaluation n'en tire pas, la case du
 *   panneau en met un, le même pour toutes les séries.
 *
 * Mesures (10 000 tirages par variante) : cas particulier ≈ 20 % partout ; formes complètes —
 * 2 termes : 4 formes, 3 termes : 6, avec un carré : 8, grands angles : 26 (la plus rare,
 * n3-r3-t2-p1-c0, ≈ 0,4 %, soit ≈ 84 correspondances attendues en 20 000 essais au 1er centile).
 * Aucun bridage supplémentaire nécessaire.
 */
export const LIBELLE_CAS_VALEUR_EXACTE = "Inclure un cas particulier (un terme sur un angle du premier quadrant : ni symétrie ni signe à chercher)";

export function formeValeurExacte(e: ExerciceValeurExacte): string {
  const r = e.termes.filter(necessiteReduction).length;
  const t = e.termes.filter((x) => x.fonction === "tan").length;
  const p = e.operateurs.filter((o) => o === "*").length;
  const c = e.termes.filter((x) => x.carre).length;
  return `n${e.termes.length}-r${r}-t${t}-p${p}-c${c}`;
}

export function profilValeurExacte(e: ExerciceValeurExacte): ProfilInstance {
  return {
    casParticulier: e.termes.some(estPremierQuadrant) ? "terme-premier-quadrant" : null,
    forme: formeValeurExacte(e),
  };
}

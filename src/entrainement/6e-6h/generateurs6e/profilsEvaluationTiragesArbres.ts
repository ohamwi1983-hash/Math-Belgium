/**
 * Profil d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 6gen31 (tirages et arbres) — méthode `.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ».
 *
 * - `forme` : famille + ce qui change la STRUCTURE de la résolution (avec ou sans remise, nombre de
 *   tirages et question finale en A ; nombre d'objets en B ; sous-type et question en C ; mode de
 *   tirage en D) — imposée identique d'une série à l'autre, question par question. « Avec remise »
 *   et « sans remise » sont donc deux formes équilibrées, jamais un cas particulier (chacune est un
 *   exercice complet).
 * - Cas particuliers (ce qui RACCOURCIT la résolution), hors évaluation par défaut, offerts par la
 *   case : « urne-equilibree » (A ou D avec remise et autant de boules de chaque couleur : toutes les
 *   branches valent 1/2) ; « trois-objets » (B avec 3 objets : 6 arrangements, tout s'énumère).
 * - `calcul` sans objet : toutes les réponses sont des fractions de petits entiers, acceptées sous
 *   forme exacte (la valeur décimale est facultative).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceTiragesArbres } from "../core6e/tiragesArbres.types";

export const LIBELLE_CAS_TIRAGES_ARBRES = "Inclure un cas particulier (urne équilibrée avec remise : toutes les branches valent 1/2 ; ou 3 objets seulement)";

export function profilTiragesArbres(e: ExerciceTiragesArbres): ProfilInstance {
  switch (e.famille) {
    case "A":
      return {
        casParticulier: e.avecRemise && e.n1 === e.n2 ? "urne-equilibree" : null,
        forme: `A-${e.avecRemise ? "avec" : "sans"}-k${e.k}-${e.questionEcran3 ?? "exactement"}`,
      };
    case "B":
      return { casParticulier: e.n === 3 ? "trois-objets" : null, forme: `B-n${e.n}` };
    case "C":
      return { casParticulier: null, forme: `C-${e.sousType}-${e.sousType === "special" ? (e.ecran3Cible ?? "deuxFaces") : e.ecran3Cible}` };
    case "D":
      return { casParticulier: e.avecRemise && e.n1 === e.n2 ? "urne-equilibree" : null, forme: `D-${e.avecRemise ? "avec" : "sans"}` };
  }
}

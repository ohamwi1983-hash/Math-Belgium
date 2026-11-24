/**
 * Profil d'instance de `6gen27` (« Volumes de révolution ») pour le TIRAGE ÉQUILIBRÉ des évaluations
 * (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * Cas particuliers (ce qui RACCOURCIT la résolution ; l'ordre des courbes de la famille C est un
 * verdict, jamais filtré). Mesures sur 5 000 tirages par variante (rapport de la refonte papier) :
 * - A : une borne nulle (la primitive s'annule en 0) ;
 * - B : racines opposées (−r et r : intégrande pair, calcul divisé par deux) ;
 * - C : droite g horizontale (g constante : son carré est une constante) ;
 * - D : coefficient k = 1 (f(x) = √x, aucun facteur k² à porter).
 *
 * Calculatrice : jamais indispensable — tous les volumes ont une valeur EXACTE (multiples rationnels
 * de π ; formes closes avec e ou sin 2 en A_exponentielle / A_trigonométrique). `calcul` absent.
 * Revue des profils (décision de l'utilisateur, 24/11/2026 — la Graph Math+ calcule π∫ directement) :
 * aucun volume n'est entier ni fractionnaire (tous contiennent π), donc aucun `'exacte'` ; la consigne
 * EXIGE la forme exacte (écran et papier, l'écran refuse l'arrondi sans tentative) et l'exercice reste
 * tiré « calculatrice interdite » comme « autorisée ».
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceVolumesRevolution } from "../../core6e/volumesRevolution.types";

export const LIBELLE_CAS_VOLUMES_REVOLUTION =
  "Inclure un cas particulier (borne nulle, racines opposées, droite horizontale, f(x) = √x)";

export function profilVolumesRevolution(e: ExerciceVolumesRevolution): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: e.a === 0 || e.b === 0 ? "borne-nulle" : null };
    case "B":
      return { casParticulier: e.r1 === -e.r2 ? "racines-opposees" : null };
    case "C":
      return { casParticulier: e.termesG.every((t) => t.type === "constante") ? "g-constante" : null };
    case "D":
      return { casParticulier: e.kNum === e.kDen ? "k-1" : null };
  }
}

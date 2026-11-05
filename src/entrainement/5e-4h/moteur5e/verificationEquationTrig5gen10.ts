/**
 * Couche B (5e) — vérification des écrans « séries de solutions » de 5gen10, par comparaison de
 * RÉUNIONS DE RÉSEAUX (`reseauxSolutionsTrig.ts`, audit 5e ch. 2 point 33) au lieu de l'appariement
 * ligne à ligne de `diagnostiquerBranches`.
 *
 * `verificationEquationTrig.ts` est partagé avec 5gen11, 5gen13 et la suite géométrique : ses
 * primitives n'y sont pas modifiées. Ce module redéfinit uniquement les diagnostics de 5gen10 qui
 * comparent des séries (argument, isoler x, produit, racines pythagoriciennes, égalité) et
 * réexporte tels quels les autres (reconnaissance, conversions, ensembles numériques finaux).
 */
import type { StatutVerification } from "../moteur/statutVerification";
import type {
  BrancheAngle,
  BrancheX,
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
  RacinePythagoricienne,
} from "../core5e/equationsTrigonometriques.types";
import { diagnostiquerReunionReseaux } from "./reseauxSolutionsTrig";
import type { Reseau } from "./reseauxSolutionsTrig";
import type { ReponseArgument, ReponseDeuxFacteursArgument, ReponseDeuxFacteursLignes, ReponseRacine, ReponseRacinesPythagoricienne } from "./verificationEquationTrig";

export {
  diagnostiquerConversionEgalite,
  diagnostiquerConversionPythagoricienne,
  diagnostiquerFactorisationProduit,
  diagnostiquerRacinesPythagoricienne,
  diagnostiquerReconnaissance,
  diagnostiquerSeparerFacteurs,
  diagnostiquerSolutions,
  diagnostiquerSolutionsEgalite,
  diagnostiquerSolutionsProduit,
  diagnostiquerSolutionsPythagoricienne,
} from "./verificationEquationTrig";
export type { ReponseArgument, ReponseDeuxFacteursArgument, ReponseDeuxFacteursLignes, ReponseRacine, ReponseRacinesPythagoricienne } from "./verificationEquationTrig";

function versReseaux(branches: (BrancheAngle | BrancheX)[]): Reseau[] {
  return branches.map((b) => ({ constante: b.constante.decimal, periode: b.periode.decimal }));
}

function combiner2(a: StatutVerification, b: StatutVerification): StatutVerification {
  if (a === "parse_error" || b === "parse_error") return "parse_error";
  return a === "correct" && b === "correct" ? "correct" : "not_equivalent";
}

/** Écran « argument » (famille directe) — séries pour u = ax + b. */
export function diagnostiquerArgument(exercice: ExerciceEquationTrig, reponse: ReponseArgument): StatutVerification {
  if (reponse.aucuneSolution) return exercice.aucuneSolution ? "correct" : "not_equivalent";
  if (exercice.aucuneSolution) return "not_equivalent";
  return diagnostiquerReunionReseaux(reponse.lignes, versReseaux(exercice.branchesU));
}

/** Écran « isoler x » (famille directe). */
export function diagnostiquerIsolerX(exercice: ExerciceEquationTrig, lignes: string[]): StatutVerification {
  return diagnostiquerReunionReseaux(lignes, versReseaux(exercice.branchesX));
}

export function diagnostiquerArgumentProduit(exercice: ExerciceProduitFacteurs, reponse: ReponseDeuxFacteursArgument): StatutVerification {
  return combiner2(diagnostiquerArgument(exercice.facteur1, reponse.facteur1), diagnostiquerArgument(exercice.facteur2, reponse.facteur2));
}

export function diagnostiquerIsolerXProduit(exercice: ExerciceProduitFacteurs, reponse: ReponseDeuxFacteursLignes): StatutVerification {
  return combiner2(diagnostiquerIsolerX(exercice.facteur1, reponse.facteur1), diagnostiquerIsolerX(exercice.facteur2, reponse.facteur2));
}

/** Une racine t de la substitution pythagoricienne : rejet (|t| > 1) ou séries de trig(x) = t. */
export function diagnostiquerUneRacine(racine: RacinePythagoricienne, reponse: ReponseRacine): StatutVerification {
  if (reponse.rejeter) return racine.invalide ? "correct" : "not_equivalent";
  if (racine.invalide || racine.resolution === null) return "not_equivalent";
  return diagnostiquerReunionReseaux(reponse.lignes, versReseaux(racine.resolution.branchesU));
}

export function diagnostiquerRacinesResolution(exercice: ExercicePythagoricienne, reponse: ReponseRacinesPythagoricienne): StatutVerification {
  return combiner2(diagnostiquerUneRacine(exercice.racine1, reponse.racine1), diagnostiquerUneRacine(exercice.racine2, reponse.racine2));
}

/** Écran « résoudre » (famille égalité) — séries finales en x. */
export function diagnostiquerResoudreEgalite(exercice: ExerciceEgaliteExpressions, lignes: string[]): StatutVerification {
  return diagnostiquerReunionReseaux(lignes, versReseaux(exercice.branches));
}

/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`,
 * méthode : `.claude/rules/feuilles-evaluations.md`) de 5gen25 (association f ↔ f'), 5gen26 (f'(a)
 * par la définition) et 5gen27 (fonction dérivée), chapitre 5 de 5e. Mesures : 5 000 tirages par
 * variante (scratchpad 5c5-R1/mesure.txt). Aucune valeur n'exige la calculatrice : `calcul: 'exacte'`.
 *
 * 5gen25 — une association est un VERDICT (aucun cas particulier). `forme` = famille et nombre
 * d'éléments (3 à 5 en tirage libre) : même type de question d'une série à l'autre.
 *
 * 5gen26 — `forme` = famille (exposant pour k/x ou k/x²). Cas particulier (il RACCOURCIT le calcul) :
 * terme constant nul p = 0 pour f(x) = mx + p ou mx² + p (≈ 9 % de ces deux familles) — f(a) et
 * f(a + h) se calculent sans terme constant. a = 0 est exclu par le générateur.
 *
 * 5gen27 — `forme` = famille × présence de sin/cos (le quotient ambigu 1/trig(ax+b)² à part). Aucun
 * cas particulier : l'intérieure d'une composée a toujours une pente ±2 ou ±3 (jamais x + b), et une
 * dérivée se calcule toujours en entier.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceAssociation } from "../core5e/association.types";
import { nombreElementsAssociation } from "../core5e/association.types";
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { AtomeDerivable, ExerciceFonctionDerivee } from "../core5e/fonctionDerivee.types";

export function profilAssociation(e: ExerciceAssociation): ProfilInstance {
  return { casParticulier: null, calcul: "exacte", forme: `${e.famille}-${nombreElementsAssociation(e)}` };
}

export const LIBELLE_CAS_DEFINITION_DERIVEE = "Inclure un cas particulier (terme constant nul : f(x) = mx ou f(x) = mx²)";

export function profilDefinitionDerivee(e: ExerciceDefinitionDerivee): ProfilInstance {
  switch (e.famille) {
    case "affine":
    case "quadratique":
      return { casParticulier: e.p === 0 ? "terme-constant-nul" : null, calcul: "exacte", forme: e.famille };
    case "rationnelleSimple":
      return { casParticulier: null, calcul: "exacte", forme: `rationnelleSimple-x${e.expo}` };
    case "rationnelleLineaire":
      return { casParticulier: null, calcul: "exacte", forme: "rationnelleLineaire" };
  }
}

const estTrig = (atome: AtomeDerivable) => atome.noyau.type === "trig";

/** sin/cos présent dans f — même critère que les entrées « avec trig » du catalogue. */
export function contientTrigFonctionDerivee(e: ExerciceFonctionDerivee): boolean {
  switch (e.famille) {
    case "reglebase":
      return e.atomes.some(estTrig);
    case "produit":
      return estTrig(e.atome1) || estTrig(e.atome2);
    case "quotient":
      return e.ambigu ? true : estTrig(e.atome1) || estTrig(e.atome2);
    case "composee":
      return estTrig(e.atome);
  }
}

export function profilFonctionDerivee(e: ExerciceFonctionDerivee): ProfilInstance {
  const forme = e.famille === "quotient" && e.ambigu ? "quotient-ambigu" : `${e.famille}-${contientTrigFonctionDerivee(e) ? "trig" : "sans-trig"}`;
  return { casParticulier: null, calcul: "exacte", forme };
}

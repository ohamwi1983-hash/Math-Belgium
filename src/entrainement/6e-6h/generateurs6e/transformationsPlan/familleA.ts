import type { AffixeEntiere, ExerciceTransfoA, ParametresTransfoA, SousTypeTransfoA } from "../../core6e/transformationsPlan.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { ajouterAffixe, appliquerRotationAxe, multiplierAffixeParEntier, tirerAffixeEntiereArbitraire, tirerAmplitudeHomothetie, tirerAngleAxeNonNul } from "./partage";

/**
 * Couche A (6e) — génération, famille A ("Image d'un point par une transformation classique ou
 * composée") de `6gen40`, chapitre 7 "Nombres complexes".
 *
 * 5 sous-types ÉQUIPROBABLES : translation (image=z_P+z_v), homothétie de centre O et rapport k
 * (image=k·z_P), rotation de centre O et angle θ (image=z_P·e^{iθ}), similitude composée
 * rotation+homothétie de MÊME centre O (image=k·z_P·e^{iθ}, commutatif — l'ordre rotation/homothétie
 * n'a pas d'importance ici, contrairement au 5e sous-type), et rotation D'ABORD suivie d'une
 * translation (image=z_P·e^{iθ}+z_v — PAS commutatif, piège central de cette famille, voir
 * `core6e/transformationsPlan.types.ts` et `ui6e/formatTransformationsPlan.ts`,
 * `optionsFormuleA`).
 */

const PORTEE_ZP = 5;
const PORTEE_ZV = 5;

const SOUS_TYPES: SousTypeTransfoA[] = ["translation", "homothetie", "rotation", "similitude", "rotationTranslation"];

function construireParametres(sousType: SousTypeTransfoA): ParametresTransfoA {
  switch (sousType) {
    case "translation":
      return { sousType, zV: tirerAffixeEntiereArbitraire(PORTEE_ZV) };
    case "homothetie":
      return { sousType, k: tirerAmplitudeHomothetie() };
    case "rotation":
      return { sousType, angle: tirerAngleAxeNonNul() };
    case "similitude":
      return { sousType, k: tirerAmplitudeHomothetie(), angle: tirerAngleAxeNonNul() };
    case "rotationTranslation":
      return { sousType, angle: tirerAngleAxeNonNul(), zV: tirerAffixeEntiereArbitraire(PORTEE_ZV) };
  }
}

/** Vérité de référence de l'image — voir en-tête de fichier pour la formule de chaque sous-type.
 * `rotationTranslation` applique STRICTEMENT la rotation avant la translation (jamais l'inverse). */
function calculerImage(zP: AffixeEntiere, parametres: ParametresTransfoA): AffixeEntiere {
  switch (parametres.sousType) {
    case "translation":
      return ajouterAffixe(zP, parametres.zV);
    case "homothetie":
      return multiplierAffixeParEntier(zP, parametres.k);
    case "rotation":
      return appliquerRotationAxe(zP, parametres.angle);
    case "similitude":
      return multiplierAffixeParEntier(appliquerRotationAxe(zP, parametres.angle), parametres.k);
    case "rotationTranslation":
      return ajouterAffixe(appliquerRotationAxe(zP, parametres.angle), parametres.zV);
  }
}

/** `sousTypeForce` (optionnel) — utilisé par `construireAvecVarianteId`/le panneau dev pour forcer
 * un sous-type précis, jamais par le tirage normal (`genererExerciceTransformationsPlan`). */
export function construireFamilleA(sousTypeForce?: SousTypeTransfoA): ExerciceTransfoA {
  const sousType = sousTypeForce ?? tirerParmi(SOUS_TYPES);
  const zP = tirerAffixeEntiereArbitraire(PORTEE_ZP);
  const parametres = construireParametres(sousType);
  const image = calculerImage(zP, parametres);
  return { famille: "A", zP, parametres, image };
}

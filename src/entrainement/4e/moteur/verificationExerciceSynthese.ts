/**
 * Couche B — vérification pour "Exercice de synthèse" (chapitre 5, remplace "Étendue et écart
 * interquartile", gen35 — `promptgen35synthese.md`).
 *
 * **Aucune logique de vérification RÉÉCRITE ici pour les 15 écrans repris des 5 générateurs
 * sources** (gen32/33/34/36) — ce module se contente de "mapper" `ExerciceSynthese` vers le contrat
 * EXACT de chaque générateur source (`ExerciceMoyennePonderee`/`ExerciceMediane`/`ExerciceDispersion`/
 * `ExerciceBoiteMoustachesConstruction`), pour que la Couche B (`sessionExerciceSynthese.ts`) puisse
 * appeler directement les fonctions `verifierXxx`/`diagnostiquerXxx` déjà écrites et testées dans
 * `verificationMoyennePonderee.ts`/`verificationMediane.ts`/`verificationDispersion.ts`/
 * `verificationBoiteMoustaches.ts` (import moteur→moteur, explicitement autorisé par l'architecture
 * du projet — voir CLAUDE.md) — jamais une seconde implémentation dupliquée de ces vérifications.
 *
 * **Les mappers passent `lignes`/`classes` TELS QUELS, jamais par un `.map()` champ-par-champ** — le
 * contrat (`core/exerciceSynthese.types.ts`) définit délibérément `LigneSynthese`/`ClasseSynthese`
 * comme des SUPERSETS structurels des types `LigneMoyennePondereeDiscrete`/`LigneMedianeDiscrete`/
 * `LigneDispersion` et `ClasseMoyennePonderee`/`ClasseMediane` : TypeScript autorise une valeur
 * portée par une VARIABLE (jamais un littéral d'objet frais) à satisfaire un type qui en demande
 * MOINS de champs, sans aucune vérification d'excès de propriétés.
 *
 * **Seules 2 exceptions nécessitent un vrai calcul dans le mapper** : `versDispersion` (variante
 * "classes" uniquement — `ClasseSynthese` n'a pas de champ `produitAttendu`, recalculé à la volée
 * depuis `centre`/`xBar`, exactement la même formule que la Couche A) et `versBoiteMoustaches`
 * (sélectionne `min`/`max` ou `xMin`/`xMax` selon la variante).
 *
 * **Étape "gen37" (Bienaymé-Tchebychev) — écrite spécifiquement pour cet exercice**, jamais une
 * réutilisation d'un composant de gen37 (ses 8 variantes sont chacune typées trop étroitement) :
 * réutilise directement `diagnostiquerIntervalleAttendu`/`verifierIntervalleAttendu`/
 * `diagnostiquerPourcent`/`verifierPourcent` (`verificationBienaymeTchebychev.ts`), déjà typées
 * STRUCTURELLEMENT (`{borneInfAttendue,borneSupAttendue}`/`{pourcentAttendu}`) — un simple objet
 * littéral suffit, aucun mapper à part entière nécessaire.
 */
import type { LigneDispersion, ExerciceDispersion } from "../core/dispersion.types";
import type { ExerciceMoyennePonderee, ExerciceMoyennePondereeClasses, ExerciceMoyennePondereeDiscrete } from "../core/moyennePonderee.types";
import type { ExerciceMediane, ExerciceMedianeClasses, ExerciceMedianeDiscrete } from "../core/mediane.types";
import type { ExerciceBoiteMoustachesConstruction } from "../core/boiteMoustaches.types";
import type { ExerciceSynthese, ExerciceSyntheseClasses, ExerciceSyntheseDiscrete } from "../core/exerciceSynthese.types";
import type { StatutVerification } from "./statutVerification";
import { diagnostiquerIntervalleAttendu, diagnostiquerPourcent, verifierIntervalleAttendu, verifierPourcent } from "./verificationBienaymeTchebychev";
import type { ReponseIntervalle, StatutIntervalle } from "./verificationBienaymeTchebychev";

// ============================================================================
// Mappers vers "Moyenne pondérée" (gen32) — écrans "centres"/"sommes"/"quotient".
// ============================================================================

export function versMoyennePondereeDiscrete(exercice: ExerciceSyntheseDiscrete): ExerciceMoyennePondereeDiscrete {
  return { contexte: exercice.contexte, variante: "discrete", n: exercice.n, sommeXN: exercice.sommeXN, moyenne: exercice.xBar, lignes: exercice.lignes };
}

export function versMoyennePondereeClasses(exercice: ExerciceSyntheseClasses): ExerciceMoyennePondereeClasses {
  return { contexte: exercice.contexte, variante: "classes", n: exercice.n, sommeXN: exercice.sommeXN, moyenne: exercice.xBar, classes: exercice.classes };
}

/** Forme UNION — pour "sommes"/"quotient", communs aux 2 variantes (`verifierSommes`/
 * `verifierQuotient` acceptent directement `ExerciceMoyennePonderee`, jamais besoin de narrowing). */
export function versMoyennePonderee(exercice: ExerciceSynthese): ExerciceMoyennePonderee {
  return exercice.variante === "discrete" ? versMoyennePondereeDiscrete(exercice) : versMoyennePondereeClasses(exercice);
}

// ============================================================================
// Mappers vers "Paramètres de position" (gen33) — écrans "mediane"/"q1"/"q3"/"minMaxMode"
// (discrete) ou "polygone"/"lectureQ1"/"lectureMediane"/"lectureQ3"/"synthese" (classes).
// ============================================================================

export function versMedianeDiscrete(exercice: ExerciceSyntheseDiscrete): ExerciceMedianeDiscrete {
  return {
    contexte: exercice.contexte,
    variante: "discrete",
    n: exercice.n,
    seuil: exercice.seuil,
    lignes: exercice.lignes,
    indexMediane: exercice.indexMediane,
    mediane: exercice.mediane,
    seuilQ1: exercice.seuilQ1,
    indexQ1: exercice.indexQ1,
    q1: exercice.q1,
    seuilQ3: exercice.seuilQ3,
    indexQ3: exercice.indexQ3,
    q3: exercice.q3,
    min: exercice.min,
    max: exercice.max,
    modes: exercice.modes,
  };
}

export function versMedianeClasses(exercice: ExerciceSyntheseClasses): ExerciceMedianeClasses {
  return {
    contexte: exercice.contexte,
    variante: "classes",
    n: exercice.n,
    seuil: exercice.seuil,
    classes: exercice.classes,
    xMin: exercice.xMin,
    xMax: exercice.xMax,
    etendue: exercice.etendue,
    mediane: exercice.mediane,
    seuilQ1: exercice.seuilQ1,
    q1: exercice.q1,
    seuilQ3: exercice.seuilQ3,
    q3: exercice.q3,
    indexClasseModale: exercice.indexClasseModale,
    modeCentreClasseModale: exercice.modeCentreClasseModale,
  };
}

/** Forme UNION — consommée par `verifierMediane` (le seul écran de "Paramètres de position" dont
 * la vérification accepte directement `ExerciceMediane` plutôt qu'une variante narrowée). */
export function versMediane(exercice: ExerciceSynthese): ExerciceMediane {
  return exercice.variante === "discrete" ? versMedianeDiscrete(exercice) : versMedianeClasses(exercice);
}

// ============================================================================
// Mapper vers "Paramètres de dispersion" (gen34) — écrans "tableau"/"varianceEcartType".
// ============================================================================

export function versDispersion(exercice: ExerciceSynthese): ExerciceDispersion {
  const lignes: LigneDispersion[] =
    exercice.variante === "discrete"
      ? exercice.lignes
      : exercice.classes.map((classe) => ({ valeur: classe.centre, effectif: classe.effectif, produitAttendu: (classe.centre - exercice.xBar) ** 2 * classe.effectif }));
  return {
    contexte: exercice.contexte,
    n: exercice.n,
    xBar: exercice.xBar,
    lignes,
    sommeProduits: exercice.sommeProduits,
    varianceAttendue: exercice.varianceAttendue,
    ecartTypeAttendu: exercice.ecartTypeAttendu,
  };
}

// ============================================================================
// Mapper vers "Boîte à moustaches" (gen36) — écran "boxplot", toujours la variante "construction"
// (5 marqueurs déplacés par glissement cranté — jamais "lecture"/"comparaison" pour cet exercice).
// ============================================================================

export function versBoiteMoustaches(exercice: ExerciceSynthese): ExerciceBoiteMoustachesConstruction {
  const min = exercice.variante === "discrete" ? exercice.min : exercice.xMin;
  const max = exercice.variante === "discrete" ? exercice.max : exercice.xMax;
  return {
    variante: "construction",
    contexte: exercice.contexte,
    valeurs: { min, q1: exercice.q1, mediane: exercice.mediane, q3: exercice.q3, max },
    bornePlage: exercice.bornePlage,
  };
}

// ============================================================================
// Étape "gen37" (Bienaymé-Tchebychev) — écrans "btIntervalle"/"btPourcent", propres à cet
// exercice — voir l'en-tête du fichier.
// ============================================================================

export function diagnostiquerBtIntervalle(exercice: ExerciceSynthese, reponse: ReponseIntervalle): StatutIntervalle {
  return diagnostiquerIntervalleAttendu({ borneInfAttendue: exercice.borneInfBT, borneSupAttendue: exercice.borneSupBT }, reponse);
}

export function verifierBtIntervalle(exercice: ExerciceSynthese, reponse: ReponseIntervalle): boolean {
  return verifierIntervalleAttendu({ borneInfAttendue: exercice.borneInfBT, borneSupAttendue: exercice.borneSupBT }, reponse);
}

export function diagnostiquerBtPourcent(exercice: ExerciceSynthese, texte: string): StatutVerification {
  return diagnostiquerPourcent({ pourcentAttendu: exercice.pourcentAttenduBT }, texte);
}

export function verifierBtPourcent(exercice: ExerciceSynthese, texte: string): boolean {
  return verifierPourcent({ pourcentAttendu: exercice.pourcentAttenduBT }, texte);
}

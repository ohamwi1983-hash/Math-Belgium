import type { EtatSessionTriangleLies, PhaseTriangleLies } from "../moteur/typesTriangleLies";
import { sequencePourVariante } from "../moteur/sessionTriangleLies";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatAnglesConfirmes, formatCibleConfirmee, formatPontConfirme, formatSoustractionConfirmee } from "./formatTriangleLies";

/** Titre de chaque écran — partagé par le récap « Ce qu'on sait déjà » et la fiche de consultation. */
export const LIBELLE_PHASE_TRIANGLE_LIES: Record<PhaseTriangleLies, string> = {
  pont: "Triangle pont",
  angles: "Angles du triangle cible",
  soustraction: "Côtés du triangle cible",
  cible: "Grandeur demandée",
  interpretation: "Interprétation",
};

/**
 * Entrée du récap pour UN écran clos — `null` tant que l'écran n'est pas clos (score encore
 * `null`). "interpretation" (dernier écran, clôture l'exercice) n'en a jamais, comme ailleurs sur ce
 * chantier. Valeur = vérité terrain confirmée, jamais la saisie de l'élève.
 */
export function entreeRecapPourPhase(etat: EtatSessionTriangleLies, phase: PhaseTriangleLies): EntreeRecapitulatif | null {
  const exercice = etat.exerciceCourant;
  const entree = (valeur: string, revele: boolean): EntreeRecapitulatif => ({ libelle: LIBELLE_PHASE_TRIANGLE_LIES[phase], estLatex: false, valeur, revele });
  switch (phase) {
    case "pont":
      return etat.scorePontExercice === null ? null : entree(formatPontConfirme(exercice), etat.pontRevele);
    case "angles":
      return etat.scoreAnglesExercice === null ? null : entree(formatAnglesConfirmes(exercice), etat.anglesRevele);
    case "soustraction":
      return etat.scoreSoustractionExercice === null ? null : entree(formatSoustractionConfirmee(exercice), etat.soustractionRevele);
    case "cible":
      return etat.scoreCibleExercice === null ? null : entree(formatCibleConfirmee(exercice), etat.cibleRevele);
    case "interpretation":
      return null;
  }
}

/** Récap « Ce qu'on sait déjà » — un écran clos par ligne, dans l'ordre réel des écrans
 * (`sequencePourVariante`). Remplace l'ancien bloc « État actuel » propre à ce générateur. */
export function calculerRecapitulatifTriangleLies(etat: EtatSessionTriangleLies): EntreeRecapitulatif[] {
  return sequencePourVariante(etat.exerciceCourant)
    .map((phase) => entreeRecapPourPhase(etat, phase))
    .filter((e): e is EntreeRecapitulatif => e !== null);
}

import type { EtatSessionEtudeFonctionLogarithme } from "../moteur6e/typesEtudeFonctionLogarithme";
import { LIBELLE_PHASE_ETUDE_LOG, contenuRecapPhase, phasesVisitees } from "./formatEtudeFonctionLogarithme";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * `formatEtudeFonctionLogarithme.ts` n'exporte PAS `formatReponseAttenduePhaseLatex` : la fonction
 * "réponse attendue" déjà utilisée par `App6gen21.tsx` pour `validation.reponseAttendue` est
 * `contenuRecapPhase` (`{texte, latex}` pour UNE SEULE phase) — jamais `etatActuel`, qui accumule
 * PLUSIEURS écrans déjà confirmés en un seul bloc LaTeX (incompatible avec la structure
 * `{libelle, valeur}` d'`EntreeRecapitulatif`). Libellé via `LIBELLE_PHASE_ETUDE_LOG` (déjà exporté
 * sous ce nom exact). Séquence par famille via `phasesVisitees` (déjà exporté — équivalent
 * `PHASES_PAR_FAMILLE`, jamais recalculée via `phaseInitiale`/`phaseApres` ici puisque la fonction
 * existe déjà toute faite). `revele` lu directement sur `etat.detailsPartiels[phase]?.revele`
 * (capturé par le moteur AU MOMENT de la clôture de l'écran, voir
 * `typesEtudeFonctionLogarithme.ts`) — plus précis que l'heuristique `scoresPartiels[phase]===0`
 * utilisée par les autres générateurs du lot, et disponible ici tel quel.
 *
 * PARTICULARITÉ (signalée dans le rapport) : la phase "graphique" calcule son "état actuel" à
 * l'INTÉRIEUR du composant enfant `components6e/EtapeSelectionGraphiqueEtudeFonctionLog.tsx` (hors
 * périmètre, non modifié) — ce composant affiche donc son propre rappel en plus de ce
 * `RecapitulatifPanel`, doublon visuel résiduel assumé pour cet écran précis.
 */
export function calculerRecapitulatifEtudeFonctionLogarithme(etat: EtatSessionEtudeFonctionLogarithme): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesVisitees(exercice.famille);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const contenu = contenuRecapPhase(exercice, phase);
    const estLatex = contenu.latex !== null;
    const valeur = estLatex ? (contenu.latex as string) : contenu.texte ?? "";
    const revele = etat.detailsPartiels[phase]?.revele ?? false;
    return { libelle: LIBELLE_PHASE_ETUDE_LOG[phase], estLatex, valeur, revele };
  });
}

export function calculerSegmentsProgressionEtudeFonctionLogarithme(etat: EtatSessionEtudeFonctionLogarithme) {
  const sequence = phasesVisitees(etat.exerciceCourant.famille);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.detailsPartiels[phase]?.revele ? ("revele" as const) : ("correcte" as const);
  });
}

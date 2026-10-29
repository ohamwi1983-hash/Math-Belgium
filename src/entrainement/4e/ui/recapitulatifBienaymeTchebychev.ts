import type { EtatSessionBienaymeTchebychev, PhaseBienaymeTchebychev } from "../moteur/typesBienaymeTchebychev";
import { SEQUENCES } from "../moteur/typesBienaymeTchebychev";
import type { ExerciceBienaymeTchebychev } from "../core/bienaymeTchebychev.types";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { demandeK, formatEtatActuelKLatex, formatEtatActuelPourcentLatex, kEtatActuel, pourcentAttendu0EtatActuel, pourcentAttenduEtatActuel } from "./formatBienaymeTchebychev";

/**
 * Valeur d'une entrée du récapitulatif pour une phase donnée — réutilise TELLES QUELLES les
 * fonctions déjà écrites pour l'ancien bloc "état actuel" combiné : seules les phases qui
 * PRÉCÈDENT au moins un écran suivant au sein de leur variante (voir `SEQUENCES`) ont besoin
 * d'une entrée ici.
 */
function valeurPourPhase(exercice: ExerciceBienaymeTchebychev, phase: PhaseBienaymeTchebychev): Pick<EntreeRecapitulatif, "libelle" | "valeur" | "estLatex"> {
  switch (phase) {
    case "v1K":
    case "v2K":
    case "v3K":
    case "v4K":
    case "v5K":
    case "v7K":
      if (!demandeK(exercice)) throw new Error(`recapitulatifBienaymeTchebychev : exercice sans k (${phase})`);
      return { libelle: "k", estLatex: true, valeur: formatEtatActuelKLatex(kEtatActuel(exercice)) };
    case "v4Pourcent0":
    case "v7Pourcent0":
    case "v8Pourcent0": {
      if (exercice.variante !== "nombreVersIntervalle" && exercice.variante !== "nombreVersSigma" && exercice.variante !== "nombreVersXBar") {
        throw new Error(`recapitulatifBienaymeTchebychev : exercice inattendu (${phase})`);
      }
      return { libelle: "% minimal", estLatex: true, valeur: formatEtatActuelPourcentLatex(pourcentAttendu0EtatActuel(exercice)) };
    }
    case "v3Pourcent": {
      if (exercice.variante !== "intervalleVersNombre") throw new Error(`recapitulatifBienaymeTchebychev : exercice inattendu (${phase})`);
      return { libelle: "% minimal", estLatex: true, valeur: formatEtatActuelPourcentLatex(pourcentAttenduEtatActuel(exercice)) };
    }
    // v1Pourcent/v2Intervalle/v3Nombre/v4Intervalle/v5Sigma/v6XBar/v7Sigma/v8XBar sont toujours la
    // DERNIÈRE phase de leur variante (voir SEQUENCES) — jamais appelées ici.
    default:
      throw new Error(`recapitulatifBienaymeTchebychev : phase sans entrée récap (${phase})`);
  }
}

/**
 * Récapitulatif "Ce qu'on sait déjà" — chaque variante traverse une séquence FIXE et DISJOINTE des
 * 7 autres (voir `SEQUENCES`, `moteur/typesBienaymeTchebychev.ts`) : les entrées accumulées sont
 * donc toujours les phases déjà closes de CETTE séquence, jamais une autre variante.
 */
export function calculerRecapitulatifBienaymeTchebychev(etat: EtatSessionBienaymeTchebychev): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = SEQUENCES[exercice.variante];
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const score = etat.scoresAccumules[phase]!;
    return { ...valeurPourPhase(exercice, phase), revele: score.revele };
  });
}

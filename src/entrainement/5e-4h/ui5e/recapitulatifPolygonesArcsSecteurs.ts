import type { ExercicePolygonesArcsSecteurs } from "../core5e/polygonesArcsSecteurs.types";
import type { EtatSessionPolygonesArcsSecteurs, PhasePolygonesArcsSecteurs } from "../moteur5e/typesPolygonesArcsSecteurs";
import type { EntreeRecapitulatif } from "./recapitulatif";
import {
  formatAireTotaleAttendueLatex,
  formatArcElementaireAttendueLatex,
  formatArcMultiPasAttendueLatex,
  formatCirconferenceAttendueLatex,
  formatSecteurElementaireAttendueLatex,
  formatSecteurMultiPasAttendueLatex,
} from "./formatPolygonesArcsSecteurs";

/** Même séquence RÉELLE (3 à 5 écrans selon la présence des 2 écrans optionnels) que la fonction
 * privée `sequenceComplete` (`ui5e/formatPolygonesArcsSecteurs.ts`, non exportée) — dupliquée ici
 * pour la même raison que dans les autres cibles de cette tâche. */
function sequenceComplete(exercice: ExercicePolygonesArcsSecteurs): PhasePolygonesArcsSecteurs[] {
  const sequence: PhasePolygonesArcsSecteurs[] = ["cercleEntier", "arcElementaire"];
  if (exercice.arcMultiPas !== null) sequence.push("arcMultiPas");
  sequence.push("secteurElementaire");
  if (exercice.secteurMultiPas !== null) sequence.push("secteurMultiPas");
  return sequence;
}

const LIBELLES: Record<PhasePolygonesArcsSecteurs, string> = {
  cercleEntier: "Cercle entier",
  arcElementaire: "Arc élémentaire",
  arcMultiPas: "Arc multi-pas",
  secteurElementaire: "Secteur élémentaire",
  secteurMultiPas: "Secteur multi-pas",
};

/** Même dispatch que `App5gen7.tsx::releveDeLaPhase` pour les phases NON terminales (booléens
 * `xxxRevele` FIXES, un par phase, `moteur5e/typesPolygonesArcsSecteurs.ts`) — jamais une
 * heuristique sur le score. "secteurMultiPas" est TOUJOURS terminal quand présent (jamais de champ
 * `secteurMultiPasRevele` à la racine de l'état, seulement dans `resultats` une fois l'exercice
 * entier clos) — jamais "déjà clos" tant que l'exercice est en cours, donc jamais atteint ici
 * (`calculerRecapitulatifPolygonesArcsSecteurs` ne l'appelle que sur `precedentes`, qui exclut la
 * phase courante/terminale). */
function phaseRevelee(etat: EtatSessionPolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): boolean {
  switch (phase) {
    case "cercleEntier":
      return etat.cercleEntierRevele;
    case "arcElementaire":
      return etat.arcElementaireRevele;
    case "arcMultiPas":
      return etat.arcMultiPasRevele;
    case "secteurElementaire":
      return etat.secteurElementaireRevele;
    case "secteurMultiPas":
      throw new Error("phaseRevelee : secteurMultiPas est toujours terminal, jamais une phase déjà close");
  }
}

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours — reprend EXACTEMENT les
 * valeurs déjà affichées par l'ancien bloc "état actuel" maison (`segmentsEtatActuel`,
 * `EtapeEcranUnChampPolygone.tsx`, alimenté par `segmentsEtatActuelPolygone`,
 * `ui5e/formatPolygonesArcsSecteurs.ts`) — seulement reformaté en une entrée par écran (libellé +
 * icône ✓/✗ via les booléens `xxxRevele` FIXES) plutôt qu'un flux unique de fragments KaTeX sans
 * label. "Cercle entier" reste une SEULE entrée (circonférence + aire, 2 fragments `valeurs`) —
 * même regroupement que l'écran lui-même (un seul écran, 2 grandeurs confirmées ensemble).
 *
 * NOTE D'ARCHITECTURE (à signaler) : `EtapeEcranUnChampPolygone.tsx` calcule et affiche LUI-MÊME
 * ce bloc en interne (jamais une prop reçue depuis `App5gen7.tsx`) — remplacer son appel local
 * aurait exigé de modifier ce fichier, hors du périmètre autorisé pour cette tâche (seulement
 * `App5gen7.tsx` + ce nouveau fichier). `RecapitulatifPanel` est donc ajouté EN PLUS, juste avant
 * l'écran en cours, sans retirer l'ancien bloc `etat-actuel-box` existant.
 */
export function calculerRecapitulatifPolygonesArcsSecteurs(etat: EtatSessionPolygonesArcsSecteurs): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequenceComplete(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const revele = phaseRevelee(etat, phase);
    if (phase === "cercleEntier") {
      const valeurs = [formatCirconferenceAttendueLatex(exercice), formatAireTotaleAttendueLatex(exercice)];
      return { libelle: LIBELLES.cercleEntier, estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
    }
    const valeur =
      phase === "arcElementaire"
        ? formatArcElementaireAttendueLatex(exercice)
        : phase === "secteurElementaire"
          ? formatSecteurElementaireAttendueLatex(exercice)
          : phase === "arcMultiPas"
            ? (formatArcMultiPasAttendueLatex(exercice) as string)
            : (formatSecteurMultiPasAttendueLatex(exercice) as string);
    return { libelle: LIBELLES[phase], estLatex: true, valeur, revele };
  });
}

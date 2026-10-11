import type { QuantiteArcSecteur } from "../core5e/arcsSecteurs.types";
import type { EtatSessionArcSecteur } from "../moteur5e/typesArcsSecteurs";
import { quantitesManquantes } from "../moteur5e/typesArcsSecteurs";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LABELS, formatValeurQuantiteLatex } from "./formatArcsSecteurs";

/**
 * Construit le récapitulatif des quantités déjà résolues de l'exercice en cours (mode
 * "deuxVersTrois" uniquement — le mode "conversion" n'a qu'un seul écran, jamais de quantité
 * "déjà résolue" avant lui, récapitulatif toujours vide). Reprend EXACTEMENT les valeurs déjà
 * affichées par l'ancien bloc "état actuel" maison (`segmentsEtatActuel`,
 * `EtapeQuantiteArcSecteur.tsx`, alimenté par `segmentsEtatActuelArcSecteur`,
 * `ui5e/formatArcsSecteurs.ts`) — seulement reformaté en une entrée par quantité (libellé + icône
 * ✓/✗ via `etat.revelesPartiels`, dynamique — voir `EtatSessionArcSecteur`) plutôt qu'un flux
 * unique de fragments KaTeX sans label.
 *
 * NOTE D'ARCHITECTURE (à signaler) : `EtapeQuantiteArcSecteur.tsx` calcule et affiche LUI-MÊME ce
 * bloc en interne (`segmentsEtatActuelArcSecteur(exercice, phase)`, jamais une prop reçue depuis
 * `App5gen6.tsx`) — remplacer son appel local aurait exigé de modifier ce fichier, hors du
 * périmètre autorisé pour cette tâche (seulement `App5gen6.tsx` + ce nouveau fichier).
 * `RecapitulatifPanel` est donc ajouté EN PLUS, juste avant l'écran en cours, sans retirer
 * l'ancien bloc `etat-actuel-box` existant (qui continue de s'afficher à l'intérieur de l'écran,
 * inchangé).
 */
export function calculerRecapitulatifArcSecteur(etat: EtatSessionArcSecteur): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  if (exercice.mode !== "deuxVersTrois") return [];

  const manquantes = quantitesManquantes(exercice);
  const dejaResolues = manquantes.slice(0, manquantes.indexOf(etat.phase as QuantiteArcSecteur));

  return dejaResolues.map((quantite) => ({
    libelle: LABELS[quantite],
    estLatex: true,
    valeur: formatValeurQuantiteLatex(quantite, exercice),
    revele: etat.revelesPartiels[quantite] ?? false,
  }));
}

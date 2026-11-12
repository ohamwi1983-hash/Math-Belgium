import { formatTermesEcranLatex } from "./formatEtudierFonction";
import { ordreEcransEtudierFonction } from "../moteur5e/typesEtudierFonction";
import type { EcranEtudierFonction, EtatSessionEtudierFonction } from "../moteur5e/typesEtudierFonction";
import type { EntreeRecapitulatif } from "./recapitulatif";

const LIBELLE_PHASE: Record<EcranEtudierFonction, string> = {
  domaine: "Domaine",
  limites: "Comportement aux bornes",
  calculerFPrime: "Dérivée",
  tableauFPrime: "Variations",
  calculerFSeconde: "Dérivée seconde",
  tableauFSeconde: "Concavité",
  recap: "Synthèse",
  coordonnees: "Points remarquables",
  graphique: "Graphique",
};

/**
 * Récapitulatif « Ce qu'on sait déjà » pour 5gen31 — une entrée par écran déjà clos, avec les VRAIES
 * valeurs confirmées (limites, f'(x), nature des racines, coordonnées…), jamais un simple
 * « confirmé ». L'écran « recap » (sans question) n'y figure pas.
 */
export function calculerRecapitulatifEtudierFonction(etat: EtatSessionEtudierFonction): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const ordre = ordreEcransEtudierFonction(exercice);
  const index = etat.terminee ? ordre.length : ordre.indexOf(etat.phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];
  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of precedentes) {
    const termes = formatTermesEcranLatex(exercice, phase);
    if (termes.length === 0) continue;
    entrees.push({
      libelle: LIBELLE_PHASE[phase],
      estLatex: true,
      valeur: termes.join(" \\quad "),
      ...(termes.length > 1 ? { valeurs: termes } : {}),
      revele: etat.revelesPartiels[phase] ?? false,
    });
  }
  return entrees;
}

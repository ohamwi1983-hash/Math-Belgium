import { formatTermesEtatActuelLatex } from "./formatEtudeLocale";
import { ordreEcransEtudeLocale } from "../moteur5e/typesEtudeLocale";
import type { EcranEtudeLocale, EtatSessionEtudeLocale } from "../moteur5e/typesEtudeLocale";
import type { EntreeRecapitulatif } from "./recapitulatif";

const LIBELLE_PHASE: Record<EcranEtudeLocale, string> = {
  domaine: "Domaine",
  resoudreFPrime: "Racines de f'(x)=0",
  tableauFPrime: "Tableau de signes de f'",
  extremums: "Valeurs aux extremums",
  resoudreFSeconde: "Racines de f''(x)=0",
  tableauFSeconde: "Tableau de signes de f''",
  inflexions: "Valeurs aux points d'inflexion",
};

function entreeUnique(libelle: string, valeur: string, revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur, revele };
}

function entreeMultiple(libelle: string, valeurs: string[], revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
}

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen29 — reprend EXACTEMENT les mêmes valeurs que
 * l'ancien bloc "état actuel" (`components5e/EtatActuelEtudeLocale.tsx`, qui appelle
 * `formatTermesEtatActuelLatex(exercice, phase)` — un flux PLAT cumulé sans frontière de phase),
 * jamais une formule recalculée séparément. Pour retrouver quels termes appartiennent à QUELLE
 * phase (nécessaire pour un libellé + une icône ✓/✗ PAR phase), on appelle cette même fonction à
 * CHAQUE frontière de phase et on isole les nouveaux termes apparus entre deux frontières
 * successives (`cumulApres.slice(cumulAvant.length)`) — jamais une nouvelle logique de formatage,
 * seule la façon de BORNER le flux change.
 *
 * Heuristique de révélation : comme le reste du chantier 5e-4h, `scoresPartiels[phase] === 0`.
 */
export function calculerRecapitulatifEtudeLocale(etat: EtatSessionEtudeLocale): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const ordre = ordreEcransEtudeLocale(exercice);
  const index = ordre.indexOf(etat.phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];

  const entrees: EntreeRecapitulatif[] = [];
  let cumulAvant: string[] = [];
  for (const phase of precedentes) {
    const i = ordre.indexOf(phase);
    const phaseSuivante = ordre[i + 1];
    const cumulApres = formatTermesEtatActuelLatex(exercice, phaseSuivante) ?? [];
    const nouveaux = cumulApres.slice(cumulAvant.length);
    cumulAvant = cumulApres;
    if (nouveaux.length === 0) continue;
    const revele = etat.scoresPartiels[phase] === 0;
    const libelle = LIBELLE_PHASE[phase];
    entrees.push(nouveaux.length === 1 ? entreeUnique(libelle, nouveaux[0], revele) : entreeMultiple(libelle, nouveaux, revele));
  }
  return entrees;
}

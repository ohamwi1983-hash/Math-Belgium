import { formatTermesEtatActuelLatex } from "./formatLectureGraphiqueDerivees";
import { ordreEcransLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";
import type { EcranLectureGraphiqueDerivees, EtatSessionLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";
import type { EntreeRecapitulatif } from "./recapitulatif";

const LIBELLE_PHASE: Record<EcranLectureGraphiqueDerivees, string> = {
  asymptotes: "Comportement aux asymptotes",
  tableauFPrime: "Tableau de signes de f'",
  extremums: "Valeurs aux extremums",
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
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen30 — même principe que `recapitulatifEtudeLocale.ts`
 * (5gen29) : réutilise `formatTermesEtatActuelLatex`, un flux PLAT cumulé, et isole les termes de
 * chaque phase en le rappelant à CHAQUE frontière puis en découpant la différence entre deux
 * frontières successives — jamais une formule recalculée séparément. Icône (✓/✗) pilotée par
 * `etat.revelesPartiels[phase]`, peuplé depuis `etapeCourante.revelee` à la clôture de chaque
 * écran (`sessionLectureGraphiqueDerivees.ts::soumettreEcran`) — jamais `scoresPartiels[phase]
 * === 0` (point A, balayage générique) : la pénalité d'aide de ce générateur est soustraite APRÈS
 * le score de tentatives puis plafonnée à 0, donc une réussite fortement aidée pouvait
 * légitimement tomber à 0 et s'afficher à tort comme "révélée".
 */
export function calculerRecapitulatifLectureGraphiqueDerivees(etat: EtatSessionLectureGraphiqueDerivees): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const ordre = ordreEcransLectureGraphiqueDerivees(exercice);
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
    const revele = etat.revelesPartiels[phase] ?? false;
    const libelle = LIBELLE_PHASE[phase];
    entrees.push(nouveaux.length === 1 ? entreeUnique(libelle, nouveaux[0], revele) : entreeMultiple(libelle, nouveaux, revele));
  }
  return entrees;
}

import { formatTermesEtatActuelLatex } from "./formatExtremaBornes";
import { ORDRE_ECRANS_EXTREMA_BORNES } from "../moteur5e/typesExtremaBornes";
import type { EcranExtremaBornes, EtatSessionExtremaBornes } from "../moteur5e/typesExtremaBornes";
import type { EntreeRecapitulatif } from "./recapitulatif";

const LIBELLE_PHASE: Record<EcranExtremaBornes, string> = {
  deriver: "Dérivée f'(t)",
  tableauFPrime: "Racines de f'(t)=0",
  valeursExtremums: "Valeurs aux extremums",
  valeursBornes: "Valeurs aux bornes",
  comparaison: "Comparaison",
};

function entreeUnique(libelle: string, valeur: string, revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur, revele };
}

function entreeMultiple(libelle: string, valeurs: string[], revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
}

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen34 — même principe que `recapitulatifEtudeLocale.ts`
 * (5gen29) : réutilise `formatTermesEtatActuelLatex`, un flux PLAT cumulé, et isole les termes de
 * chaque phase en le rappelant à CHAQUE frontière puis en découpant la différence entre deux
 * frontières successives — jamais une formule recalculée séparément. "comparaison" (dernier écran)
 * n'est jamais "précédente" (voir `ORDRE_ECRANS_EXTREMA_BORNES`), donc jamais rencontrée ici — même
 * comportement que l'ancien bloc.
 */
export function calculerRecapitulatifExtremaBornes(etat: EtatSessionExtremaBornes): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const ordre = ORDRE_ECRANS_EXTREMA_BORNES;
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

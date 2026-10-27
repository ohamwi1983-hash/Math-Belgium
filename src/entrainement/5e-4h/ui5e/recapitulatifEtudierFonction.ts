import { formatTermesEtatActuelLatex } from "./formatEtudierFonction";
import { ordreEcransEtudierFonction } from "../moteur5e/typesEtudierFonction";
import type { EcranEtudierFonction, EtatSessionEtudierFonction } from "../moteur5e/typesEtudierFonction";
import type { EntreeRecapitulatif } from "./recapitulatif";

const LIBELLE_PHASE: Record<EcranEtudierFonction, string> = {
  domaine: "Domaine",
  limites: "Comportement aux bornes",
  calculerFPrime: "Dérivée f'(x)",
  tableauFPrime: "Tableau de f'",
  calculerFSeconde: "Dérivée f''(x)",
  tableauFSeconde: "Tableau de f''",
  recap: "Synthèse",
  graphique: "Graphique",
};

/** Seules `domaine`/`calculerFPrime`/`calculerFSeconde` poussent une formule KaTeX dans
 * `formatTermesEtatActuelLatex` — les autres (`limites`/`tableauFPrime`/`tableauFSeconde`/`recap`)
 * poussent un texte de confirmation brut ("... : confirmé"), jamais du LaTeX — voir le switch de
 * cette fonction (`ui5e/formatEtudierFonction.ts`). Chaque phase n'y contribue qu'UN seul terme
 * (jamais plusieurs), donc aucun besoin du regroupement `valeurs` utilisé par les autres
 * récapitulatifs de ce chantier. */
const PHASES_LATEX: ReadonlySet<EcranEtudierFonction> = new Set(["domaine", "calculerFPrime", "calculerFSeconde"]);

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen31 — même principe que `recapitulatifEtudeLocale.ts`
 * (5gen29) : réutilise `formatTermesEtatActuelLatex`, un flux PLAT cumulé, et isole le terme de
 * chaque phase en le rappelant à CHAQUE frontière puis en découpant la différence entre deux
 * frontières successives — jamais une formule recalculée séparément. "graphique" (dernier écran)
 * n'est jamais "précédente" (voir `ordreEcransEtudierFonction`), donc jamais rencontrée ici.
 * L'écran dédié "recap" (`EtapeRecapitulatifEtudierFonction.tsx`, synthèse PUREMENT
 * présentationnelle) reste INCHANGÉ — ce fichier ne fait que rappeler, sur les écrans suivants,
 * qu'elle a bien été consultée (même texte que l'ancien bloc "état actuel").
 */
export function calculerRecapitulatifEtudierFonction(etat: EtatSessionEtudierFonction): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const ordre = ordreEcransEtudierFonction(exercice);
  const index = ordre.indexOf(etat.phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];

  const entrees: EntreeRecapitulatif[] = [];
  let cumulAvant: string[] = [];
  for (const phase of precedentes) {
    const i = ordre.indexOf(phase);
    const phaseSuivante = ordre[i + 1];
    const cumulApres = formatTermesEtatActuelLatex(exercice, phaseSuivante, ordre) ?? [];
    const nouveaux = cumulApres.slice(cumulAvant.length);
    cumulAvant = cumulApres;
    if (nouveaux.length === 0) continue;
    entrees.push({
      libelle: LIBELLE_PHASE[phase],
      estLatex: PHASES_LATEX.has(phase),
      valeur: nouveaux[0],
      revele: etat.revelesPartiels[phase] ?? false,
    });
  }
  return entrees;
}

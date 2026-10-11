import type { EtatSession } from "../moteur";
import { formatEnonceAffichage, formatEnonceLatex, formatEquationIsoleeNonDeveloppee } from "./formatEquation";
import { libelleCategorie } from "./categorieLabels";

export interface EntreeRecapitulatif {
  libelle: string;
  valeur: string;
  /** true si `valeur` doit être rendue via KaTeX, false si texte brut */
  estLatex: boolean;
  /**
   * true si cette étape a été "révélée" (tentatives épuisées sans bonne réponse), false si
   * réussie par l'élève — pilote UNIQUEMENT l'icône (✓/✗) affichée par `RecapitulatifPanel` devant
   * la ligne, jamais `valeur` elle-même : `valeur` reste toujours la valeur CONFIRMÉE de cette
   * étape (contrairement à son libellé usuel de "réponse attendue", `valeur` sert aussi de
   * référence de travail pour les étapes suivantes qui en dépendent, ex. le tableau de signes a
   * besoin du sommet confirmé — jamais masquée quand `revele` est `false`). Chaque appelant de
   * `calculerRecapitulatif*` lit cette valeur à l'endroit EXACT où il lit déjà `scoreXxxExercice`
   * pour décider de pousser l'entrée (`etat.xxxRevele`, déjà tracké par le moteur) — jamais une
   * nouvelle valeur inventée.
   */
  revele: boolean;
  /**
   * Version "bloc fitter" de `valeur` (`promptblocfittertousgenerateurs.md`) — tableau de
   * fragments KaTeX (ex. un par fraction/CE/racine) plutôt qu'une seule valeur `\quad`-jointe, pour
   * un retour à la ligne propre entre éléments sur mobile étroit (KaTeX rend en `white-space:
   * nowrap` en interne, voir `.equation-box-termes` dans `App.css`). Prioritaire sur `valeur` quand
   * fourni (implique une entrée LaTeX, `estLatex` alors ignoré). Absent par défaut : comportement
   * historique inchangé pour toutes les autres entrées.
   */
  valeurs?: string[];
}

/**
 * Construit le récapitulatif accumulé des étapes déjà closes pour l'exercice en cours, à
 * afficher en haut de chaque écran (Partie 2 de la spec). S'appuie uniquement sur les champs
 * déjà trackés par le moteur (scoreXxxExercice !== null ⟺ l'étape a eu lieu et est close) :
 * aucun nouvel état n'est nécessaire, ce qui garantit gratuitement les contraintes demandées —
 * toujours la vraie valeur (dérivée de exerciceCourant, jamais de la saisie de l'élève), jamais
 * rien pour une étape qui n'a pas eu lieu, et une réinitialisation automatique au changement
 * d'exercice puisque ces champs sont eux-mêmes remis à null par le moteur à ce moment-là.
 *
 * Bug utilisateur du 26/09 : l'entrée "Équation simplifiée" affichait à tort `formatEnonceLatex`
 * (toujours la forme canonique "ax²+bx+c=0", ignore formeAffichage), au lieu de la vraie forme
 * confirmée par l'élève (`formatEnonceAffichage`, qui la respecte) — visible en contradiction
 * directe avec le bloc "ÉTAT ACTUEL" juste en dessous, qui montre correctement la forme confirmée
 * (voir ui/etatActuel.ts, même correctif).
 */
export function calculerRecapitulatif(etat: EtatSession): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreSimplificationExercice !== null) {
    entrees.push({
      libelle: "Équation simplifiée",
      estLatex: true,
      valeur: formatEnonceAffichage(exercice.enonce, exercice.formeAffichage, exercice.parametresAffichage, exercice.irrationnel),
      // Pas de `simplificationRevele` tracké par le moteur (`moteur/types.ts`) — même heuristique
      // que les 2 exceptions déjà documentées ailleurs sur ce chantier (AppEquationRationnelle/
      // AppInequationRationnelle) : score exactement 0 ⟺ révélée (jamais atteint par une réussite,
      // voir `etapeTentatives.ts` — le score d'une réussite reste toujours strictement positif).
      revele: etat.scoreSimplificationExercice === 0,
    });
  }

  if (etat.scoreIsolementExercice !== null) {
    entrees.push({
      libelle: "Équation isolée",
      estLatex: true,
      valeur: formatEquationIsoleeNonDeveloppee(exercice),
      revele: etat.isolementRevele,
    });
  }

  if (etat.scoreDevelopperExercice !== null) {
    entrees.push({
      libelle: "Équation développée",
      estLatex: true,
      valeur: formatEnonceLatex(exercice.enonce),
      revele: etat.scoreDevelopperExercice === 0,
    });
  }

  if (etat.scoreReconnaissanceExercice !== null) {
    entrees.push({ libelle: "Méthode", estLatex: false, valeur: libelleCategorie(exercice.categorie), revele: etat.categorieRevelee });
  }

  if (etat.scoreChampPrincipalExercice !== null) {
    if (exercice.categorie === "cas_general") {
      entrees.push({ libelle: "Δ", estLatex: false, valeur: `Δ = ${exercice.solution.delta}`, revele: etat.scoreChampPrincipalExercice === 0 });
    } else {
      entrees.push({
        libelle: "Forme factorisée",
        estLatex: true,
        valeur: `${exercice.solution.formeFactorisee} = 0`,
        revele: etat.scoreChampPrincipalExercice === 0,
      });
    }
  }

  // "Zéros" n'a jamais d'entrée récapitulative : champ2 clôture toujours immédiatement
  // l'exercice (prompt-generateurs123groupe.md, point 3 — plus d'étape "factorisation" après,
  // même pour cas_general), donc aucun écran suivant n'aurait à en tenir compte.

  return entrees;
}

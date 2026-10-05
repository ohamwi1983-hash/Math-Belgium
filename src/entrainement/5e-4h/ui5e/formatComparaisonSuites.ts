/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen18 ("Comparaison numérique de deux
 * suites"). 3 branches, séquence fixe à 2 écrans (tableau → conclusion), un contexte narratif tiré
 * dans un bassin de 50 partagé par les 3 branches (`generateurs5e/comparaisonSuites/contextes.ts`).
 * Les phrases de tendance ("croît de X %/...", "diminue de X unités/...") sont générées ICI, de
 * façon générique et invariable (jamais d'accord grammatical calculé), à partir du RÔLE mathématique
 * de la branche — le contexte ne fournit que des groupes nominaux neutres (`sujetA`/`sujetB`).
 */
import type { ExerciceComparaisonSuites } from "../core5e/comparaisonSuites.types";

function capitaliser(texte: string): string {
  return texte.length === 0 ? texte : texte[0].toUpperCase() + texte.slice(1);
}

/** Coefficient multiplicatif `1+pct/100`, toujours affiché à exactement 2 décimales — `pct` étant un
 * pourcentage entier, ce coefficient est mathématiquement une décimale à 2 chiffres exacte, mais
 * `1+pct/100` en flottant IEEE754 brut produit parfois un résidu (ex. `pct=14` ⟹
 * `1.1400000000000001`, bug Playwright constaté) : `.toFixed(2)` force l'arrondi propre annoncé. */
function formatTauxCroissance(pct: number): string {
  return (1 + pct / 100).toFixed(2);
}

function clauseCroissancePct(sujet: string, valeur: number, unite: string, pct: number, periode: string): string {
  return `${sujet} vaut ${Math.round(valeur)} ${unite} et croît de ${pct} %/${periode}`;
}
function clauseCroissanceLineaire(sujet: string, valeur: number, unite: string, delta: number, periode: string): string {
  return `${sujet} vaut ${Math.round(valeur)} ${unite} et croît de ${delta} ${unite}/${periode}`;
}
function clauseDeclinLineaire(sujet: string, valeur: number, unite: string, delta: number, periode: string): string {
  return `${sujet} vaut ${Math.round(valeur)} ${unite} et diminue de ${delta} ${unite}/${periode}`;
}

export function consigneGenerale(exercice: ExerciceComparaisonSuites): string {
  const { contexte } = exercice;
  const intro = contexte.periode === "an" ? `En ${exercice.anneeDepart}, ` : "";
  let clauseA: string;
  let clauseB: string;
  switch (exercice.famille) {
    case "villesCroissance":
      clauseA = clauseCroissancePct(contexte.sujetA, exercice.u1, contexte.unite, exercice.tauxPct, contexte.periode);
      clauseB = clauseCroissanceLineaire(contexte.sujetB, exercice.v1, contexte.unite, exercice.d, contexte.periode);
      break;
    case "stockDemande":
      clauseA = clauseDeclinLineaire(contexte.sujetA, exercice.u1, contexte.unite, exercice.d1, contexte.periode);
      clauseB = clauseCroissanceLineaire(contexte.sujetB, exercice.v1, contexte.unite, exercice.d2, contexte.periode);
      break;
    case "epargneCroissance":
      clauseA = clauseCroissancePct(contexte.sujetA, exercice.u1, contexte.unite, exercice.r1Pct, contexte.periode);
      clauseB = clauseCroissancePct(contexte.sujetB, exercice.v1, contexte.unite, exercice.r2Pct, contexte.periode);
      break;
  }
  const cote = exercice.condition === "uGeV" ? contexte.labelA : contexte.labelB;
  const autre = exercice.condition === "uGeV" ? contexte.labelB : contexte.labelA;
  const question = contexte.periode === "mois" ? "après combien de mois" : "à partir de quelle année";
  return `${intro}${capitaliser(clauseA)}. ${capitaliser(clauseB)}. Détermine ${question} ${cote} dépasse ${autre}.`;
}

export function labelU(exercice: ExerciceComparaisonSuites): string {
  return exercice.contexte.labelA;
}

export function labelV(exercice: ExerciceComparaisonSuites): string {
  return exercice.contexte.labelB;
}

export function formuleU(exercice: ExerciceComparaisonSuites): string {
  switch (exercice.famille) {
    case "villesCroissance":
      return `u_n=${exercice.u1}\\times${formatTauxCroissance(exercice.tauxPct)}^{n-1}`;
    case "stockDemande":
      return `u_n=${exercice.u1}-(n-1)\\times${exercice.d1}`;
    case "epargneCroissance":
      return `u_n=${exercice.u1}\\times${formatTauxCroissance(exercice.r1Pct)}^{n-1}`;
  }
}

export function formuleV(exercice: ExerciceComparaisonSuites): string {
  switch (exercice.famille) {
    case "villesCroissance":
      return `v_n=${exercice.v1}+(n-1)\\times${exercice.d}`;
    case "stockDemande":
      return `v_n=${exercice.v1}+(n-1)\\times${exercice.d2}`;
    case "epargneCroissance":
      return `v_n=${exercice.v1}\\times${formatTauxCroissance(exercice.r2Pct)}^{n-1}`;
  }
}

export function consigneTableau(_exercice: ExerciceComparaisonSuites): string {
  return "Complète le tableau pour les 3 valeurs de n indiquées (arrondis les résultats à l'unité près).";
}

export function consigneConclusion(exercice: ExerciceComparaisonSuites): string {
  const cote = exercice.condition === "uGeV" ? labelU(exercice) : labelV(exercice);
  const question = exercice.contexte.periode === "mois" ? "Après combien de mois" : "À partir de quelle année";
  return `D'après le tableau, quel est le plus petit n à partir duquel ${cote} l'emporte ? ${question} cela se produit-il ?`;
}

export function labelTraduction(exercice: ExerciceComparaisonSuites): string {
  return exercice.uniteContexte === "mois" ? "Nombre de mois =" : "Année =";
}

export function texteAideNiveau1(_exercice: ExerciceComparaisonSuites, phase: "tableau" | "conclusion"): string {
  if (phase === "tableau") {
    return "Rappelle-toi les 2 formules des suites — substitue simplement n par la valeur indiquée sur chaque ligne.";
  }
  return "À l'équilibre exact, cherche la ligne où la condition devient vraie pour la première fois — pas une ligne avant, pas une ligne après.";
}

export function texteAideNiveau2(exercice: ExerciceComparaisonSuites, phase: "tableau" | "conclusion"): string {
  if (phase === "tableau") {
    return `${formuleU(exercice)} \\qquad ${formuleV(exercice)}`;
  }
  if (exercice.contexte.periode === "mois") {
    return `n=${exercice.nTable[1]}`;
  }
  return `n=${exercice.nTable[1]} \\Rightarrow \\text{année}=${exercice.anneeDepart}+(n-1)`;
}

// ============================================================================
// Réponse attendue — pour le bloc "état actuel" de l'écran "conclusion" (rappel du tableau déjà
// rempli à l'écran "tableau", voir `TableComparaisonRecap.tsx`/`EtatActuelComparaisonSuites.tsx")
// et pour l'écran récapitulatif final (`ResultatPanelComparaisonSuites.tsx`) — même convention
// "dérivée PUREMENT de `exercice`, jamais de la saisie de l'élève" que le reste de la plateforme.
// ============================================================================

/** `n=` de la conclusion, en LaTeX — `nSeuil` est toujours un entier exact (index trouvé par
 * simulation, `generateurs5e/comparaisonSuites/simulation.ts`), jamais besoin d'arrondir. */
export function formatConclusionNLatex(exercice: ExerciceComparaisonSuites): string {
  return `n=${exercice.nSeuil}`;
}

/** Traduction contextuelle attendue (année/nombre de mois), en TEXTE BRUT — même label que le champ
 * de saisie (`labelTraduction`), jamais du LaTeX (le label lui-même n'en est pas). `traductionValeur`
 * est toujours un entier exact par construction (année de départ + décalage entier, ou directement
 * `nSeuil`) — `Math.round` défensif, sans incidence sur la valeur réelle. */
export function formatTraductionAttendueTexte(exercice: ExerciceComparaisonSuites): string {
  return `${labelTraduction(exercice)} ${Math.round(exercice.traductionValeur)}`;
}

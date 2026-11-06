/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen18 ("Comparaison numérique de deux
 * suites"). 3 branches, séquence fixe à 2 écrans (tableau → conclusion), un contexte narratif tiré
 * dans un bassin partagé par les 3 branches (`generateurs5e/comparaisonSuites/contextes.ts`).
 * Les phrases de tendance (« croît de X % par an », « diminue de X unités par mois ») sont générées
 * ICI, de façon générique et invariable (jamais d'accord grammatical calculé), à partir du RÔLE
 * mathématique de la branche — le contexte ne fournit que des groupes nominaux neutres
 * (`sujetA`/`sujetB`, `nomA`/`nomB`).
 *
 * Notation du cours : Aₙ et Bₙ (jamais uₙ/vₙ côté élève), dépassement STRICT (« Bₙ > Aₙ »).
 */
import type { ExerciceComparaisonSuites } from "../core5e/comparaisonSuites.types";

function capitaliser(texte: string): string {
  return texte.length === 0 ? texte : texte[0].toUpperCase() + texte.slice(1);
}

/** Entier écrit à la belge : séparateur de milliers = espace fine insécable (« 12 345 »). */
export function entierFr(valeur: number): string {
  const n = Math.round(valeur);
  const signe = n < 0 ? "−" : "";
  return signe + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Même entier, pour KaTeX : groupes de milliers séparés par une espace fine `\,`. */
function entierLatex(valeur: number): string {
  return String(Math.round(valeur)).replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
}

/** Coefficient multiplicatif `1+pct/100` en LaTeX, virgule décimale (`pct` entier ⇒ 2 décimales
 * exactes ; `.toFixed(2)` évite le résidu flottant `1.1400000000000001`). */
function coefficientLatex(pct: number): string {
  return (1 + pct / 100).toFixed(2).replace(".", "{,}");
}

function periodeTexte(exercice: ExerciceComparaisonSuites): string {
  return exercice.contexte.periode === "an" ? "par an" : "par mois";
}

function clauseCroissancePct(sujet: string, valeur: number, unite: string, pct: number, periode: string): string {
  return `${sujet} vaut ${entierFr(valeur)} ${unite} et croît de ${pct} % ${periode}`;
}
function clauseCroissanceLineaire(sujet: string, valeur: number, unite: string, delta: number, periode: string): string {
  return `${sujet} vaut ${entierFr(valeur)} ${unite} et croît de ${entierFr(delta)} ${unite} ${periode}`;
}
function clauseDeclinLineaire(sujet: string, valeur: number, unite: string, delta: number, periode: string): string {
  return `${sujet} vaut ${entierFr(valeur)} ${unite} et diminue de ${entierFr(delta)} ${unite} ${periode}`;
}

/** Côté qui dépasse / côté depasse, en groupe nominal complet (« le parc B », « le parc A »). */
function nomsDepassement(exercice: ExerciceComparaisonSuites): { qui: string; depasse: string } {
  const { contexte } = exercice;
  return exercice.condition === "aDepasseB" ? { qui: contexte.nomA, depasse: contexte.nomB } : { qui: contexte.nomB, depasse: contexte.nomA };
}

/** Condition du cours, en notation Aₙ/Bₙ (texte Unicode, jamais de LaTeX dans une phrase). */
function conditionTexte(exercice: ExerciceComparaisonSuites): string {
  return exercice.condition === "aDepasseB" ? "Aₙ > Bₙ" : "Bₙ > Aₙ";
}

export function consigneGenerale(exercice: ExerciceComparaisonSuites): string {
  const { contexte } = exercice;
  const periode = periodeTexte(exercice);
  let clauseA: string;
  let clauseB: string;
  switch (exercice.famille) {
    case "villesCroissance":
      clauseA = clauseCroissancePct(contexte.sujetA, exercice.u1, contexte.unite, exercice.tauxPct, periode);
      clauseB = clauseCroissanceLineaire(contexte.sujetB, exercice.v1, contexte.unite, exercice.d, periode);
      break;
    case "stockDemande":
      clauseA = clauseDeclinLineaire(contexte.sujetA, exercice.u1, contexte.unite, exercice.d1, periode);
      clauseB = clauseCroissanceLineaire(contexte.sujetB, exercice.v1, contexte.unite, exercice.d2, periode);
      break;
    case "epargneCroissance":
      clauseA = clauseCroissancePct(contexte.sujetA, exercice.u1, contexte.unite, exercice.r1Pct, periode);
      clauseB = clauseCroissancePct(contexte.sujetB, exercice.v1, contexte.unite, exercice.r2Pct, periode);
      break;
  }
  const { qui, depasse } = nomsDepassement(exercice);
  if (contexte.periode === "an") {
    return (
      `En ${exercice.anneeDepart}, ${clauseA}. ${capitaliser(clauseB)}. ` +
      `On note Aₙ et Bₙ ces deux grandeurs au rang n (n = 1 correspond à ${exercice.anneeDepart}). ` +
      `Détermine à partir de quelle année ${qui} dépasse ${depasse}.`
    );
  }
  return (
    `Au cours du 1er mois, ${clauseA}. ${capitaliser(clauseB)}. ` +
    `On note Aₙ et Bₙ ces deux grandeurs au cours du n-ième mois. ` +
    `Détermine au cours du combientième mois ${qui} dépasse ${depasse} pour la première fois.`
  );
}

/** Libellés de colonne courts (sous Aₙ/Bₙ), sans article. */
export function labelU(exercice: ExerciceComparaisonSuites): string {
  return exercice.contexte.labelA;
}

export function labelV(exercice: ExerciceComparaisonSuites): string {
  return exercice.contexte.labelB;
}

export function formuleU(exercice: ExerciceComparaisonSuites): string {
  switch (exercice.famille) {
    case "villesCroissance":
      return `A_n=${entierLatex(exercice.u1)}\\times${coefficientLatex(exercice.tauxPct)}^{n-1}`;
    case "stockDemande":
      return `A_n=${entierLatex(exercice.u1)}-(n-1)\\times${entierLatex(exercice.d1)}`;
    case "epargneCroissance":
      return `A_n=${entierLatex(exercice.u1)}\\times${coefficientLatex(exercice.r1Pct)}^{n-1}`;
  }
}

export function formuleV(exercice: ExerciceComparaisonSuites): string {
  switch (exercice.famille) {
    case "villesCroissance":
      return `B_n=${entierLatex(exercice.v1)}+(n-1)\\times${entierLatex(exercice.d)}`;
    case "stockDemande":
      return `B_n=${entierLatex(exercice.v1)}+(n-1)\\times${entierLatex(exercice.d2)}`;
    case "epargneCroissance":
      return `B_n=${entierLatex(exercice.v1)}\\times${coefficientLatex(exercice.r2Pct)}^{n-1}`;
  }
}

/** Les rangs du tableau, en toutes lettres (« n = 6, 7, 8 et 9 ») — imprimés aussi sur papier. */
function rangsTexte(exercice: ExerciceComparaisonSuites): string {
  const rangs = exercice.nTable.map(String);
  return `${rangs.slice(0, -1).join(", ")} et ${rangs[rangs.length - 1]}`;
}

export function consigneTableau(exercice: ExerciceComparaisonSuites): string {
  return `Calcule Aₙ et Bₙ pour n = ${rangsTexte(exercice)} (arrondis à l'unité).`;
}

export function consigneConclusion(exercice: ExerciceComparaisonSuites): string {
  const traduction =
    exercice.contexte.periode === "an" ? "Traduis ce rang en année." : "Traduis ce rang : au cours du combientième mois cela se produit-il ?";
  return `D'après le tableau, quel est le plus petit rang n tel que ${conditionTexte(exercice)} ? ${traduction}`;
}

export function labelTraduction(exercice: ExerciceComparaisonSuites): string {
  return exercice.uniteContexte === "mois" ? "Numéro du mois =" : "Année =";
}

export function texteAideNiveau1(exercice: ExerciceComparaisonSuites, phase: "tableau" | "conclusion"): string {
  if (phase === "tableau") {
    return "Écris d'abord la formule de chaque suite, puis remplace n par le rang de chaque ligne.";
  }
  return `Compare Aₙ et Bₙ ligne par ligne : le rang cherché est le premier n pour lequel ${conditionTexte(exercice)}.`;
}

/** Aide de niveau 2. Tableau : les deux formules substituées (LaTeX). Conclusion : la MÉTHODE du
 * balayage et la règle de traduction, jamais la valeur de n — `texte` (phrase) + `latex` optionnel. */
export function texteAideNiveau2(exercice: ExerciceComparaisonSuites, phase: "tableau" | "conclusion"): { texte: string; latex: string } {
  if (phase === "tableau") {
    return { texte: "", latex: `${formuleU(exercice)} \\qquad ${formuleV(exercice)}` };
  }
  const cond = conditionTexte(exercice);
  const contraire = exercice.condition === "aDepasseB" ? "Aₙ ≤ Bₙ" : "Bₙ ≤ Aₙ";
  const balayage = `Descends le tableau : à la première ligne où ${cond}, vérifie qu'à la ligne précédente on avait encore ${contraire}. Ce rang n est le rang de bascule.`;
  if (exercice.contexte.periode === "an") {
    return { texte: `${balayage} Puis traduis-le : le rang 1 correspond à ${exercice.anneeDepart}, donc`, latex: `\\text{année}=${exercice.anneeDepart}+(n-1)` };
  }
  return { texte: `${balayage} Puis traduis-le : le rang n est le n-ième mois.`, latex: "" };
}

// ============================================================================
// Réponse attendue — dérivée PUREMENT de `exercice`, jamais de la saisie de l'élève.
// ============================================================================

/** `n=` de la conclusion, en LaTeX — `nSeuil` est toujours un entier exact. */
export function formatConclusionNLatex(exercice: ExerciceComparaisonSuites): string {
  return `n=${exercice.nSeuil}`;
}

/** Traduction contextuelle attendue (année/numéro du mois), en TEXTE BRUT — même label que le champ
 * de saisie (`labelTraduction`). */
export function formatTraductionAttendueTexte(exercice: ExerciceComparaisonSuites): string {
  return `${labelTraduction(exercice)} ${Math.round(exercice.traductionValeur)}`;
}

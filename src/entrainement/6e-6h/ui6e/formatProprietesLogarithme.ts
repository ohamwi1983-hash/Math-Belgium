import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { PhaseProprietesLogarithme, ResultatExerciceProprietesLogarithme } from "../moteur6e/typesProprietesLogarithme";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen13`. Une SEULE famille : le
 * `type`/`sousType` de l'exercice ne change QUE la formule utilisée, jamais le nombre d'écrans
 * (contrairement à `formatExponentiellesProblemes.ts`, 6gen12, qui dispatche PAR FAMILLE) — tout
 * dispatche ici uniquement sur `phase` ∈ {"ecran1","ecran2"}.
 *
 * **Convention de notation** (résout une ambiguïté du prompt) : partout où la réponse CORRECTE de
 * l'écran 1 doit être MONTRÉE mais PAS ENCORE substituée (aide niveau 2 de l'écran 1, qui applique
 * UNE des propriétés en laissant la substitution m/n finale à l'élève — voir `formatExpressionLog`
 * ci-dessous), le fragment LaTeX garde la notation `\log_a(M)`/`\log_a(N)` en toutes lettres. Dès
 * que l'expression doit être montrée sous la forme que l'ÉLÈVE SAISIT réellement (état actuel de
 * l'écran 2, aide 2 de l'écran 2, récapitulatif final), on bascule sur la notation `m`/`n` littérale
 * (`formatExpressionMN`) — jamais les deux mélangées sur un même écran (généralise la convention
 * CLAUDE.md "notation... jamais indiscernables sur un même écran" à ces 2 notations d'une même
 * expression logarithmique).
 */

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export const CONSIGNE_GENERALE = "On donne deux valeurs approchées de logarithmes en base a (base jamais précisée, jamais calculée) : log_a(M) ≈ m et log_a(N) ≈ n.";

/** Décimal FRANÇAIS (virgule) pour l'AFFICHAGE KaTeX seulement (`{,}`, jamais un point litéral qui
 * s'afficherait tel quel) — jamais la valeur de comparaison utilisée par
 * `moteur6e/verificationProprietesLogarithme.ts`, qui reste toujours la valeur EXACTE. */
function formatDecimalKatex(v: number, decimales = 3): string {
  const f = Math.pow(10, decimales);
  const r = Math.round(v * f) / f;
  return String(r).replace(".", "{,}").replace("-{,}", "-0{,}");
}

/** Bloc de données `m,n,M,N` — REDONDANT sur chaque écran (spec explicite). */
export function blocDonnees(exercice: ExerciceProprieteLogarithme): string[] {
  return [`m = ${formatDecimalKatex(exercice.m)}`, `n = ${formatDecimalKatex(exercice.n)}`, `M = ${exercice.M}`, `N = ${exercice.N}`];
}

/** Expression logarithmique DEMANDÉE (valeurs M/N concrètes, jamais résolue numériquement) — bloc
 * séparé rattaché à la consigne générale (même patron que `expressionLatex` de
 * `EtapeChampCycloSimple.tsx`, 6gen2). */
export function expressionDemandeeLatex(exercice: ExerciceProprieteLogarithme): string {
  const { M, N } = exercice;
  switch (exercice.type) {
    case "produit":
      return `\\log_a(${M}\\cdot ${N})`;
    case "quotient":
      return `\\log_a\\left(\\dfrac{${M}}{${N}}\\right)`;
    case "puissance":
      return `\\log_a\\left(${M}^{${exercice.p}}\\right)`;
    case "racine":
      return `\\log_a\\left(\\sqrt[${exercice.k}]{${N}}\\right)`;
    case "compose":
      return exercice.sousType === "racineQuotient" ? `\\log_a\\left(\\sqrt[${exercice.k}]{\\dfrac{${M}}{${N}}}\\right)` : `\\log_a\\left(${M}^{${exercice.p}}\\cdot ${N}\\right)`;
  }
}

/** Expression correcte de l'écran 1, en notation `m`/`n` LITTÉRALE — exactement ce que l'élève doit
 * saisir. Réutilisée pour le bloc "état actuel" de l'écran 2, l'aide 2 de l'écran 1 (rappel de
 * forme) et le récapitulatif final. */
export function formatExpressionMN(exercice: ExerciceProprieteLogarithme): string {
  switch (exercice.type) {
    case "produit":
      return "m+n";
    case "quotient":
      return "m-n";
    case "puissance":
      return `${exercice.p}\\cdot m`;
    case "racine":
      return `\\dfrac{n}{${exercice.k}}`;
    case "compose":
      return exercice.sousType === "racineQuotient" ? `\\dfrac{m-n}{${exercice.k}}` : `${exercice.p}\\cdot m+n`;
  }
}

/** Expression correcte de l'écran 1, en notation `\log_a(M)`/`\log_a(N)` — UNE SEULE des 2
 * propriétés du cas composé y est appliquée (l'autre laissée à l'élève, voir `aideNiveau2`
 * ci-dessous) ; pour un type simple, la substitution finale m/n reste elle aussi à faire (même
 * principe généralisé). */
function formatExpressionLog(exercice: ExerciceProprieteLogarithme): string {
  switch (exercice.type) {
    case "produit":
      return "\\log_a(M)+\\log_a(N)";
    case "quotient":
      return "\\log_a(M)-\\log_a(N)";
    case "puissance":
      return `${exercice.p}\\cdot\\log_a(M)`;
    case "racine":
      return `\\dfrac{\\log_a(N)}{${exercice.k}}`;
    case "compose":
      return exercice.sousType === "racineQuotient" ? `\\dfrac{\\log_a\\!\\left(\\frac{M}{N}\\right)}{${exercice.k}}` : `\\log_a(M^{${exercice.p}})+\\log_a(N)`;
  }
}

/** Valeur numérique CORRECTE de l'écran 2 — recalculée PUREMENT depuis `exercice.m`/`exercice.n`
 * (jamais une saisie élève). Duplique volontairement `moteur6e/verificationProprietesLogarithme.ts`
 * (`referenceEcran1`, ~6 lignes) plutôt que de faire dépendre `ui6e/` de `moteur6e/` pour une seule
 * formule triviale — même principe de petite duplication assumée déjà en place ailleurs sur la
 * plateforme (CLAUDE.md, "Pas de moteur de session unifié"). */
export function valeurCorrecteEcran1(exercice: ExerciceProprieteLogarithme): number {
  const { m, n } = exercice;
  switch (exercice.type) {
    case "produit":
      return m + n;
    case "quotient":
      return m - n;
    case "puissance":
      return exercice.p * m;
    case "racine":
      return n / exercice.k;
    case "compose":
      return exercice.sousType === "racineQuotient" ? (m - n) / exercice.k : exercice.p * m + n;
  }
}

/** Bloc "état actuel" — `null` sur l'écran 1 (rien à rappeler), rappelle l'expression correcte (en
 * notation m/n, celle à substituer) sur l'écran 2. */
export function etatActuel(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string[] | null {
  if (phase === "ecran1") return null;
  return [`\\text{Expression correcte : } ${formatExpressionMN(exercice)}`];
}

const NOM_PROPRIETE: Record<ExerciceProprieteLogarithme["type"], string> = {
  produit: "produit",
  quotient: "quotient",
  puissance: "puissance",
  racine: "racine",
  compose: "composée — 2 propriétés",
};

export function consigneEcran(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string {
  if (phase === "ecran1") {
    return `Écris cette expression en fonction de log_a(M) et/ou log_a(N), en appliquant la ou les propriété(s) du logarithme concernée(s) (ici : ${NOM_PROPRIETE[exercice.type]}). Dans ta réponse, utilise m pour log_a(M) et n pour log_a(N) — jamais "log_a(M)" tel quel (ex : m+n).`;
  }
  return "Substitue m et n dans l'expression CORRECTE de l'étape précédente, puis calcule la valeur numérique (arrondie).";
}

/** 4 lignes empilées (`gathered`), jamais une seule ligne concaténée — une seule ligne dépasserait
 * la largeur du bloc "aide" (piège trouvé par vérification Playwright : coupé net au bord de
 * `.aide-5e`, sans aucun moyen de faire défiler). */
const RAPPEL_PROPRIETES: AideAvecLatex = {
  texte: "Rappel des 4 propriétés de base du logarithme (sans indiquer laquelle s'applique ici) :",
  latex:
    "\\begin{gathered} \\log_a(X\\cdot Y)=\\log_a(X)+\\log_a(Y) \\\\[4pt] \\log_a\\!\\left(\\dfrac{X}{Y}\\right)=\\log_a(X)-\\log_a(Y) \\\\[4pt] \\log_a(X^{p})=p\\cdot\\log_a(X) \\\\[4pt] \\log_a(\\sqrt[k]{X})=\\dfrac{\\log_a(X)}{k} \\end{gathered}",
};

const NOTE_SUBSTITUTION: Record<ExerciceProprieteLogarithme["type"], string> = {
  produit: "Le produit devient une somme — il reste à remplacer chaque terme par m et n :",
  quotient: "Le quotient devient une différence — il reste à remplacer chaque terme par m et n :",
  puissance: "La puissance devient un facteur — il reste à remplacer le terme par m :",
  racine: "La racine devient une division — il reste à remplacer le terme par n :",
  compose: "Une SEULE des 2 propriétés a été appliquée ici — la seconde reste à faire :",
};

export function aideNiveau1(_exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): AideAvecLatex {
  if (phase === "ecran1") return RAPPEL_PROPRIETES;
  return { texte: "Substitue m et n dans l'expression trouvée à l'étape précédente.", latex: null };
}

export function aideNiveau2(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): AideAvecLatex {
  if (phase === "ecran1") {
    return { texte: NOTE_SUBSTITUTION[exercice.type], latex: formatExpressionLog(exercice) };
  }
  const { m, n } = exercice;
  switch (exercice.type) {
    case "produit":
      return { texte: "Substitution faite (addition non calculée) :", latex: `${formatDecimalKatex(m)}+${formatDecimalKatex(n)}` };
    case "quotient":
      return { texte: "Substitution faite (soustraction non calculée) :", latex: `${formatDecimalKatex(m)}-${formatDecimalKatex(n)}` };
    case "puissance":
      return { texte: "Substitution faite (multiplication non calculée) :", latex: `${exercice.p}\\cdot ${formatDecimalKatex(m)}` };
    case "racine":
      return { texte: "Substitution faite (division non calculée) :", latex: `\\dfrac{${formatDecimalKatex(n)}}{${exercice.k}}` };
    case "compose":
      return exercice.sousType === "racineQuotient"
        ? { texte: "Substitution faite (soustraction et division non calculées) :", latex: `\\dfrac{${formatDecimalKatex(m)}-${formatDecimalKatex(n)}}{${exercice.k}}` }
        : { texte: "Substitution faite (calcul final non fait) :", latex: `${exercice.p}\\cdot ${formatDecimalKatex(m)}+${formatDecimalKatex(n)}` };
  }
}

/** Réponse RÉELLEMENT attendue d'un écran donné (récapitulatif final) — jamais dérivée de la
 * saisie élève, toujours reconstruite depuis `exercice`. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string[] {
  if (phase === "ecran1") return [formatExpressionMN(exercice)];
  return [formatDecimalKatex(valeurCorrecteEcran1(exercice))];
}

export const LIBELLE_PHASE: Record<PhaseProprietesLogarithme, string> = {
  ecran1: "Étape 1 (propriété du logarithme)",
  ecran2: "Étape 2 (calcul numérique)",
};

/** Total points du récapitulatif final — COMPLÉMENT de `LigneRecap`/`statutRecap`, jamais un
 * remplacement (CLAUDE.md). Toujours 2 écrans, maximum FIXE (jamais variable par famille,
 * contrairement à 6gen12) — réutilise les scores DÉJÀ calculés par `sessionProprietesLogarithme.ts`. */
export function calculerTotalPointsProprietesLogarithme(resultat: ResultatExerciceProprietesLogarithme): { total: number; maximum: number } {
  return { total: resultat.scoreEcran1 + resultat.scoreEcran2, maximum: 200 };
}

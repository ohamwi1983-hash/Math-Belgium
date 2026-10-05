/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen33 ("Contexte économique").
 * Dépend librement des couches inférieures (jamais l'inverse).
 */
import type { CoutTotalA, CoutTotalDegre3, ExerciceContexteEconomique, ExerciceContexteEconomiqueA, ExerciceContexteEconomiqueB, ExerciceContexteEconomiqueBonus } from "../core5e/contexteEconomique.types";
import type { EcranContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { ordreEcransContexteEconomique } from "../moteur5e/typesContexteEconomique";

// ============================================================================
// Fragments LaTeX de bas niveau — polynôme à partir de coefficients ASCENDANTS.
// ============================================================================

function formatPolynomeVarLatex(coeffs: number[], symbole: string): string {
  let out = "";
  let premier = true;
  for (let d = coeffs.length - 1; d >= 0; d--) {
    const coeff = coeffs[d];
    if (coeff === 0) continue;
    const abs = Math.abs(coeff);
    const signe = coeff < 0 ? "-" : premier ? "" : "+";
    const variable = d === 0 ? "" : d === 1 ? symbole : `${symbole}^{${d}}`;
    const coeffAffiche = abs === 1 && d !== 0 ? "" : `${abs}`;
    out += `${signe}${coeffAffiche}${variable}`;
    premier = false;
  }
  return out === "" ? "0" : out;
}

export function formatCoutTotalLatex(c: CoutTotalA | CoutTotalDegre3, symbole: string): string {
  return c.degre === 2 ? formatPolynomeVarLatex([c.c, c.b, c.a], symbole) : formatPolynomeVarLatex([c.d, c.c, c.b, c.a], symbole);
}

/** C'_T(q) — dérivée du coût total, formatée directement depuis ses coefficients fermés (jamais
 * en construisant un `CoutTotalA` factice). */
export function formatDeriveeCoutTotalLatex(c: CoutTotalA, symbole: string): string {
  return c.degre === 2 ? formatPolynomeVarLatex([c.b, 2 * c.a], symbole) : formatPolynomeVarLatex([c.c, 2 * c.b, 3 * c.a], symbole);
}

/** Nombre affiché "propre" — jamais de décimale superflue (entier affiché sans virgule). */
export function formatNombreLatex(v: number): string {
  if (Number.isInteger(v)) return `${v}`;
  const arrondi = Math.round(v * 10000) / 10000;
  return `${arrondi}`;
}

// ============================================================================
// Consigne générale + objectif persistant.
// ============================================================================

export function consigneGenerale(exercice: ExerciceContexteEconomique): string {
  if (exercice.famille === "A") return "Calcule toi-même toutes les dérivées nécessaires (jamais données) pour comparer coût marginal DISCRET et coût marginal EXACT.";
  if (exercice.famille === "B") return "Calcule toi-même toutes les dérivées nécessaires (jamais données) pour situer le bénéfice maximum.";
  return "Résous l'équation réduite par approximations successives (dichotomie) — aucune forme factorisée simple n'existe ici.";
}

export function questionFinale(exercice: ExerciceContexteEconomique): string {
  if (exercice.famille === "A") return `Objectif : comparer le coût marginal discret et le coût marginal exact en q=${exercice.q0}, puis étudier l'existence d'un extremum de C_T.`;
  if (exercice.famille === "B") return "Objectif : déterminer la quantité qui maximise le bénéfice, puis la valeur de ce bénéfice maximum.";
  return "Objectif : approcher la racine de l'équation réduite par dichotomie.";
}

// ============================================================================
// Bloc de données — affiché en tête de CHAQUE écran (avant tout état actuel).
// ============================================================================

export function formatTermesDonneesLatex(exercice: ExerciceContexteEconomique): string[] {
  if (exercice.famille === "A") return [`C_T(q)=${formatCoutTotalLatex(exercice.coutTotal, "q")}`, `q_0=${exercice.q0}`];
  if (exercice.famille === "B") return [`p(x)=${formatPolynomeVarLatex([exercice.k, exercice.m], "x")}`, `C_T(x)=${formatCoutTotalLatex({ degre: 3, a: exercice.a, b: exercice.b, c: exercice.c, d: exercice.d }, "x")}`];
  return [`C_T(q)=${formatCoutTotalLatex(exercice.coutTotal, "q")}`, `\\text{intervalle de départ : } [${exercice.borneGauche}\\,;\\,${exercice.borneDroite}]`];
}

// ============================================================================
// Libellés/consignes par écran — clés distinctes entre les 3 familles, un seul switch global.
// ============================================================================

export const LIBELLE_ECRAN_CONTEXTE_ECONOMIQUE: Record<EcranContexteEconomique, string> = {
  coutMarginalDiscret: "Coût marginal discret",
  deriveeSymbolique: "Coût marginal exact — expression",
  deriveeValeur: "Coût marginal exact — valeur",
  comparaisonEcart: "Comparaison des 2 approximations",
  extremum: "Extremum de C_T",
  recetteTotale: "Recette totale",
  marginales: "Coût marginal et recette marginale",
  resoudreEgaliteMarginales: "Égalité des marginales",
  beneficeFormule: "Bénéfice — formule",
  beneficeDerivee: "Bénéfice — dérivée et signe",
  tableauSigneBenefice: "Tableau de signes de B'",
  confirmationCoherence: "Cohérence avec l'étape précédente",
  beneficeMaximum: "Valeur du bénéfice maximum",
  poserEquationReduite: "Équation réduite",
  iteration0: "Dichotomie — itération 1",
  iteration1: "Dichotomie — itération 2",
  iteration2: "Dichotomie — itération 3",
  iteration3: "Dichotomie — itération 4",
  racineApprochee: "Racine approchée",
};

export function consigneEcran(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string {
  switch (ecran) {
    case "coutMarginalDiscret":
      return "Calcule C_m(q_0)=C_T(q_0+1)-C_T(q_0), l'approximation DISCRÈTE du coût marginal.";
    case "deriveeSymbolique":
      return "Calcule C'_T(q) — dérive C_T toi-même.";
    case "deriveeValeur":
      return "Évalue C'_T(q_0), l'approximation EXACTE (par la dérivée) du coût marginal.";
    case "comparaisonEcart": {
      const ex = exercice as ExerciceContexteEconomiqueA;
      return `Compare les 2 résultats obtenus (C_m(${ex.q0})=${ex.cmDiscret} et C'_T(${ex.q0})=${ex.cmDerivee}) : écart absolu, puis écart en pourcentage.`;
    }
    case "extremum":
      return "C_T admet-elle un extremum ? Résous C'_T(q)=0 et conclus.";
    case "recetteTotale":
      return "R_T(x)=p(x)\\cdot x — développe.";
    case "marginales":
      return "Calcule C'_T(x) (coût marginal) ET R'_T(x) (recette marginale) — dérive chacune toi-même.";
    case "resoudreEgaliteMarginales":
      return "Résous C'_T(x)=R'_T(x) (2 solutions), puis choisis celle qui correspond à une quantité produite physiquement valable.";
    case "beneficeFormule":
      return "B(x)=R_T(x)-C_T(x) — développe.";
    case "beneficeDerivee":
      return "Calcule B'(x) — dérive B toi-même.";
    case "tableauSigneBenefice":
      return "Détermine le signe de B'(x) de part et d'autre de la solution retenue à l'étape précédente.";
    case "confirmationCoherence":
      return "Le maximum de B se situe-t-il à la MÊME valeur de x que la solution retenue à l'étape 'Égalité des marginales' ?";
    case "beneficeMaximum":
      return "Calcule la valeur du bénéfice maximum, B(x) à la valeur de x retenue.";
    case "poserEquationReduite":
      return "L'équation C_m(q)=C_M(q) (coût marginal = coût moyen) équivaut à q\\cdot C'_T(q)-C_T(q)=0 — pose et développe cette équation réduite P(q)=0.";
    case "iteration0":
    case "iteration1":
    case "iteration2":
    case "iteration3":
      return "Calcule le milieu de l'intervalle courant, détermine le signe de P en ce milieu, puis choisis le sous-intervalle qui contient la racine.";
    case "racineApprochee":
      return "D'après les 4 itérations, donne une valeur approchée de la racine de P.";
  }
}

// ============================================================================
// Aides — niveau 1 (technique/piège), niveau 2 (exemple proche, jamais la réponse).
// ============================================================================

export function texteAideNiveau1(ecran: EcranContexteEconomique): string {
  switch (ecran) {
    case "coutMarginalDiscret":
      return "C_m(q_0) est une DIFFÉRENCE de 2 valeurs de C_T — jamais une dérivée à ce stade.";
    case "deriveeSymbolique":
      return "Dérive terme à terme : la dérivée de a q^n est n a q^{n-1}.";
    case "deriveeValeur":
      return "Remplace q par q_0 dans l'expression de C'_T(q) que tu viens de trouver.";
    case "comparaisonEcart":
      return "L'écart en % se calcule TOUJOURS par rapport à la valeur EXACTE (la dérivée), jamais par rapport à l'approximation discrète.";
    case "extremum":
      return "PIÈGE : ne conclus jamais trop vite à un extremum — pour un coût cubique, vérifie le signe du discriminant Δ de C'_T avant de conclure.";
    case "recetteTotale":
      return "Distribue x sur chaque terme de p(x).";
    case "marginales":
      return "Le coût/la recette MARGINALE, c'est la DÉRIVÉE du coût/de la recette TOTALE — jamais le coût/la recette moyen(ne).";
    case "resoudreEgaliteMarginales":
      return "PIÈGE : ne te contente jamais d'ignorer la racine négative — une quantité produite x doit être STRICTEMENT positive.";
    case "beneficeFormule":
      return "N'oublie pas la parenthèse : B(x)=R_T(x)-C_T(x), le signe '-' se distribue sur TOUS les termes de C_T.";
    case "beneficeDerivee":
      return "B'(x)=R'_T(x)-C'_T(x) — tu as déjà calculé ces 2 dérivées à l'étape précédente.";
    case "tableauSigneBenefice":
      return "Le bénéfice est maximal là où B' passe du + au -.";
    case "confirmationCoherence":
      return "PIÈGE : vérifie que le x où B'(x)=0 est bien EXACTEMENT le même que celui trouvé en résolvant Cm(x)=Rm(x) — ce n'est jamais une coïncidence.";
    case "beneficeMaximum":
      return "Substitue directement la valeur de x dans B(x) — jamais dans B'(x).";
    case "poserEquationReduite":
      return "Distribue q dans C'_T(q), puis soustrais C_T(q) terme à terme — plusieurs termes s'annulent.";
    case "iteration0":
    case "iteration1":
    case "iteration2":
    case "iteration3":
      return "PIÈGE documenté : le sous-intervalle à conserver est celui où P change de signe entre la borne et le milieu — pas l'inverse.";
    case "racineApprochee":
      return "Le milieu du dernier intervalle obtenu est une bonne approximation de la racine.";
  }
}

export function texteAideNiveau2(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string {
  switch (ecran) {
    case "coutMarginalDiscret":
      return "Exemple : si C_T(q)=q²+3q, C_m(2)=C_T(3)-C_T(2)=(9+9)-(4+6)=18-10=8.";
    case "deriveeSymbolique":
      return "Exemple : si C_T(q)=q²+3q, alors C'_T(q)=2q+3.";
    case "deriveeValeur":
      return "Exemple : si C'_T(q)=2q+3 et q_0=2, C'_T(2)=2\\cdot2+3=7.";
    case "comparaisonEcart":
      return "Exemple : discret=8, exact=7 ⟹ écart absolu=1, écart en %=1/7×100≈14.29%.";
    case "extremum": {
      const ex = exercice as ExerciceContexteEconomiqueA;
      return ex.coutTotal.degre === 2
        ? "En degré 2, C'_T(q)=2aq+b est TOUJOURS linéaire — elle a TOUJOURS exactement une racine, jamais 'pas d'extremum'."
        : "Exemple : C'_T(q)=3q²-2q+5 a pour discriminant Δ=(-2)²-4·3·5=4-60=-56<0 — aucune racine réelle, donc pas d'extremum.";
    }
    case "recetteTotale":
      return "Exemple : si p(x)=2x+5, R_T(x)=(2x+5)x=2x²+5x.";
    case "marginales":
      return "Exemple : si C_T(x)=x³-2x et R_T(x)=2x²+5x, alors C'_T(x)=3x²-2 et R'_T(x)=4x+5.";
    case "resoudreEgaliteMarginales":
      return "Exemple : 3x²-2=4x+5 ⟺ 3x²-4x-7=0 ⟺ x=7/3 ou x=-1 — on retient x=7/3 (production positive), on rejette x=-1.";
    case "beneficeFormule":
      return "Exemple : R_T(x)=2x²+5x, C_T(x)=x³-2x ⟹ B(x)=2x²+5x-x³+2x=-x³+2x²+7x.";
    case "beneficeDerivee":
      return "Exemple : B(x)=-x³+2x²+7x ⟹ B'(x)=-3x²+4x+7.";
    case "tableauSigneBenefice":
      return "Exemple : B' positive avant la solution retenue (B croît), négative après (B décroît) ⟹ maximum EN cette solution.";
    case "confirmationCoherence":
      return "C'est un fait mathématique garanti par construction : Cm(x)-Rm(x) et -B'(x) sont EXACTEMENT la même expression.";
    case "beneficeMaximum":
      return "Exemple : B(x)=-x³+2x²+7x, en x=7/3 : calcule chaque terme puis additionne.";
    case "poserEquationReduite":
      return "Exemple : C_T(q)=q³+2q²+5, C'_T(q)=3q²+4q ⟹ P(q)=q(3q²+4q)-(q³+2q²+5)=3q³+4q²-q³-2q²-5=2q³+2q²-5.";
    case "iteration0":
    case "iteration1":
    case "iteration2":
    case "iteration3": {
      const ex = exercice as ExerciceContexteEconomiqueBonus;
      const it = ex.iterations[["iteration0", "iteration1", "iteration2", "iteration3"].indexOf(ecran)];
      return `Ici : milieu=(${formatNombreLatex(it.gauche)}+${formatNombreLatex(it.droite)})/2=${formatNombreLatex(it.milieu)}.`;
    }
    case "racineApprochee":
      return "La précision annoncée correspond exactement à la largeur du dernier intervalle obtenu après les 4 itérations.";
  }
}

// ============================================================================
// Bloc "état actuel" — accumule les faits CONFIRMÉS des écrans déjà traversés (jamais dérivé de la
// saisie brute de l'élève), absent tant que rien n'est confirmé (index<=0).
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string[] | null {
  const ordre = ordreEcransContexteEconomique(exercice);
  const index = ordre.indexOf(ecran);
  if (index <= 0) return null;
  const termes: string[] = [];
  for (let i = 0; i < index; i++) termes.push(...formatReponseAttenduePhaseLatex(exercice, ordre[i]));
  return termes.length === 0 ? null : termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE, par écran RÉELLEMENT traversé. Réutilisée aussi pour le
// bloc "état actuel" (accumulation ci-dessus).
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string[] {
  if (exercice.famille === "A") return formatReponseAttendueA(exercice, ecran);
  if (exercice.famille === "B") return formatReponseAttendueB(exercice, ecran);
  return formatReponseAttendueBonus(exercice, ecran);
}

function formatReponseAttendueA(exercice: ExerciceContexteEconomiqueA, ecran: EcranContexteEconomique): string[] {
  switch (ecran) {
    case "coutMarginalDiscret":
      return [`C_m(${exercice.q0})=${formatNombreLatex(exercice.cmDiscret)}`];
    case "deriveeSymbolique":
      return [`C'_T(q)=${formatDeriveeCoutTotalLatex(exercice.coutTotal, "q")}`];
    case "deriveeValeur":
      return [`C'_T(${exercice.q0})=${formatNombreLatex(exercice.cmDerivee)}`];
    case "comparaisonEcart":
      return [`\\text{écart absolu}=${formatNombreLatex(exercice.ecartAbsolu)}`, `\\text{écart}\\approx${formatNombreLatex(Math.round(exercice.ecartPourcent * 100) / 100)}\\%`];
    case "extremum":
      if (!exercice.extremumExiste) return ["\\text{pas d'extremum}"];
      return exercice.extrema.map((e) => `q=${formatNombreLatex(e.position)} \\Rightarrow \\text{${e.nature === "max" ? "MAX" : "min"}}`);
    default:
      return [];
  }
}

function formatReponseAttendueB(exercice: ExerciceContexteEconomiqueB, ecran: EcranContexteEconomique): string[] {
  const RT = formatPolynomeVarLatex([0, exercice.k, exercice.m], "x");
  const CmLatex = formatPolynomeVarLatex([exercice.c, 2 * exercice.b, 3 * exercice.a], "x");
  const RmLatex = formatPolynomeVarLatex([exercice.k, 2 * exercice.m], "x");
  const BLatex = formatPolynomeVarLatex([-exercice.d, exercice.k - exercice.c, exercice.m - exercice.b, -exercice.a], "x");
  const BPrimeLatex = formatPolynomeVarLatex([exercice.k - exercice.c, 2 * (exercice.m - exercice.b), -3 * exercice.a], "x");
  switch (ecran) {
    case "recetteTotale":
      return [`R_T(x)=${RT}`];
    case "marginales":
      return [`C'_T(x)=${CmLatex}`, `R'_T(x)=${RmLatex}`];
    case "resoudreEgaliteMarginales":
      return [`x=${exercice.xOpt} \\text{ (retenue)}`, `x=${exercice.xNeg} \\text{ (rejetée)}`];
    case "beneficeFormule":
      return [`B(x)=${BLatex}`];
    case "beneficeDerivee":
      return [`B'(x)=${BPrimeLatex}`];
    case "tableauSigneBenefice":
      return [`B'(x)>0 \\text{ pour } 0<x<${exercice.xOpt}`, `B'(x)<0 \\text{ pour } x>${exercice.xOpt}`];
    case "confirmationCoherence":
      return [`\\text{oui, même } x=${exercice.xOpt}`];
    case "beneficeMaximum":
      return [`B(${exercice.xOpt})=${formatNombreLatex(exercice.beneficeMax)}`];
    default:
      return [];
  }
}

const NOMS_ECRANS_ITERATION: EcranContexteEconomique[] = ["iteration0", "iteration1", "iteration2", "iteration3"];

function formatReponseAttendueBonus(exercice: ExerciceContexteEconomiqueBonus, ecran: EcranContexteEconomique): string[] {
  if (ecran === "poserEquationReduite") {
    const pA = 2 * exercice.coutTotal.a;
    return [`P(q)=${formatPolynomeVarLatex([-exercice.coutTotal.d, 0, exercice.coutTotal.b, pA], "q")}`];
  }
  const indexIt = NOMS_ECRANS_ITERATION.indexOf(ecran);
  if (indexIt !== -1) {
    const it = exercice.iterations[indexIt];
    return [`\\text{milieu}=${formatNombreLatex(it.milieu)}`, `P(\\text{milieu})${it.signeMilieu > 0 ? ">0" : "<0"}`, `\\text{on garde } [${formatNombreLatex(it.garderCote === "gauche" ? it.gauche : it.milieu)}\\,;\\,${formatNombreLatex(it.garderCote === "gauche" ? it.milieu : it.droite)}]`];
  }
  if (ecran === "racineApprochee") return [`q\\approx${formatNombreLatex(Math.round(exercice.racineApprochee * 10000) / 10000)}`];
  return [];
}

// ============================================================================
// Précision annoncée — TOUJOURS identique à la tolérance réellement codée (voir CLAUDE.md).
// ============================================================================

export const PRECISION_ECART_POURCENT = "(arrondi au centième accepté si besoin)";
export const PRECISION_EXTREMUM = "(arrondi au centième accepté si besoin)";

export function precisionRacineApprochee(exercice: ExerciceContexteEconomiqueBonus): string {
  return `(réponse acceptée à ${exercice.toleranceFinale.toFixed(2)} près)`;
}

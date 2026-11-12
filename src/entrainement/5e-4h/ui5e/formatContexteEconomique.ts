/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen33 ("Contexte économique").
 * Dépend librement des couches inférieures (jamais l'inverse).
 *
 * Consignes, objectif et énoncé en `RichText` (`$…$` = LaTeX en ligne, rendu par `TexteRiche5e`)
 * — plus de notation clavier ni de TeX brut à l'écran (audit 5e ch. 5, point 58). `consigneEcran`
 * reste une version TEXTE BRUT (dollars retirés) pour l'ancien adaptateur papier, en attendant sa
 * refonte ; les écrans utilisent `consigneEcranRiche`.
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

/** C'_T(q) — dérivée du coût total, formatée directement depuis ses coefficients fermés. */
export function formatDeriveeCoutTotalLatex(c: CoutTotalA, symbole: string): string {
  return c.degre === 2 ? formatPolynomeVarLatex([c.b, 2 * c.a], symbole) : formatPolynomeVarLatex([c.c, 2 * c.b, 3 * c.a], symbole);
}

/** Nombre en LaTeX, notation française : entier tel quel, sinon arrondi (4 décimales au plus,
 * zéros inutiles retirés) avec une virgule `{,}`. */
export function formatNombreLatex(v: number): string {
  if (Number.isInteger(v)) return `${v}`;
  const arrondi = Math.round(v * 10000) / 10000;
  return `${arrondi}`.replace(".", "{,}");
}

/** Même nombre en texte brut (boutons, prose) : virgule décimale. */
export function formatNombreTexte(v: number): string {
  if (Number.isInteger(v)) return `${v}`;
  const arrondi = Math.round(v * 10000) / 10000;
  return `${arrondi}`.replace(".", ",").replace("-", "−");
}

/** Arrondi au centième, notation française (LaTeX). */
function formatCentiemeLatex(v: number): string {
  const arrondi = Math.round(v * 100) / 100;
  if (Math.abs(arrondi - Math.round(arrondi)) < 1e-9) return `${Math.round(arrondi)}`;
  return arrondi.toFixed(2).replace(/0$/, "").replace(".", "{,}");
}

function egalOuEnviron(v: number): string {
  return Math.abs(v - Math.round(v)) < 1e-9 ? "=" : "\\approx";
}

// ============================================================================
// Consigne générale + objectif persistant (RichText).
// ============================================================================

export function consigneGenerale(exercice: ExerciceContexteEconomique): string {
  if (exercice.famille === "A") {
    return "Une entreprise fabrique $q$ unités d'un produit ; son coût total de production, en euros, vaut $C_T(q)$. Le coût marginal en $q_0$ (coût de l'unité supplémentaire) peut s'estimer de deux façons : par la différence $C_T(q_0+1)-C_T(q_0)$, ou par la dérivée $C'_T(q_0)$.";
  }
  if (exercice.famille === "B") {
    return "Une entreprise fabrique et vend $x$ centaines d'objets. Le prix de vente unitaire $p(x)$, en euros, diminue quand la quantité augmente ; le coût total de production vaut $C_T(x)$, en centaines d'euros. La recette totale est $R_T(x)=x\\cdot p(x)$ et le bénéfice $B(x)=R_T(x)-C_T(x)$.";
  }
  return "Une entreprise fabrique $q$ unités ; son coût total vaut $C_T(q)$ euros. Le coût moyen $C_M(q)=\\dfrac{C_T(q)}{q}$ est minimal quand il est égal au coût marginal $C'_T(q)$. Cette condition mène à une équation qu'on ne sait pas résoudre exactement : on approche sa solution par dichotomie.";
}

export function questionFinale(exercice: ExerciceContexteEconomique): string {
  if (exercice.famille === "A") {
    const fin = exercice.minimum.grandeur === "coutMoyen" ? "la production qui rend le coût moyen minimal" : "la production qui rend le coût marginal minimal";
    return `Objectif : comparer les deux estimations du coût marginal en $q_0=${exercice.q0}$, puis trouver ${fin}.`;
  }
  if (exercice.famille === "B") return "Objectif : trouver la quantité qui rend le bénéfice maximal, puis la valeur de ce bénéfice maximal.";
  return "Objectif : approcher par dichotomie la production qui rend le coût moyen minimal.";
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
  coutMarginalDiscret: "Coût marginal par différence",
  deriveeSymbolique: "Coût marginal par la dérivée — expression",
  deriveeValeur: "Coût marginal par la dérivée — valeur",
  comparaisonEcart: "Comparaison des deux estimations",
  extremum: "Minimum économique",
  recetteTotale: "Recette totale",
  marginales: "Coût marginal et recette marginale",
  resoudreEgaliteMarginales: "Égalité des marginales",
  beneficeFormule: "Bénéfice — expression",
  beneficeDerivee: "Bénéfice — dérivée",
  tableauSigneBenefice: "Signe de B'",
  confirmationCoherence: "Cohérence avec l'égalité des marginales",
  beneficeMaximum: "Bénéfice maximal",
  poserEquationReduite: "Équation réduite",
  iteration0: "Dichotomie — étape 1",
  iteration1: "Dichotomie — étape 2",
  iteration2: "Dichotomie — étape 3",
  iteration3: "Dichotomie — étape 4",
  racineApprochee: "Solution approchée",
};

/** Libellé du dernier écran de la famille A selon le minimum demandé. */
export function libelleEcran(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string {
  if (ecran === "extremum" && exercice.famille === "A") return exercice.minimum.grandeur === "coutMoyen" ? "Coût moyen minimal" : "Coût marginal minimal";
  return LIBELLE_ECRAN_CONTEXTE_ECONOMIQUE[ecran];
}

export const PRECISION_CENTIEME = "Donne la valeur exacte, ou arrondie au centième.";

export function consigneEcranRiche(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string {
  switch (ecran) {
    case "coutMarginalDiscret":
      return "Calcule l'estimation par différence du coût marginal : $C_T(q_0+1)-C_T(q_0)$.";
    case "deriveeSymbolique":
      return "Calcule la dérivée $C'_T(q)$.";
    case "deriveeValeur":
      return "Calcule l'estimation par la dérivée : $C'_T(q_0)$.";
    case "comparaisonEcart": {
      const ex = exercice as ExerciceContexteEconomiqueA;
      return `Compare les deux estimations ($${formatNombreLatex(ex.cmDiscret)}$ € par différence, $${formatNombreLatex(ex.cmDerivee)}$ € par la dérivée) : écart absolu, puis écart en pourcentage de l'estimation par la dérivée. Écart en pourcentage arrondi au centième.`;
    }
    case "extremum": {
      const ex = exercice as ExerciceContexteEconomiqueA;
      if (ex.minimum.grandeur === "coutMoyen") {
        return `Le coût moyen est $C_M(q)=\\dfrac{C_T(q)}{q}$. Détermine la production $q$ qui le rend minimal (annule $C'_M(q)$), puis la valeur de ce coût moyen minimal. ${PRECISION_CENTIEME}`;
      }
      return `Le coût marginal $C'_T(q)$ est minimal là où sa propre dérivée $C''_T(q)$ s'annule. Détermine cette production $q$, puis la valeur du coût marginal minimal. ${PRECISION_CENTIEME}`;
    }
    case "recetteTotale":
      return "Calcule la recette totale $R_T(x)=x\\cdot p(x)$ (forme développée).";
    case "marginales":
      return "Calcule le coût marginal $C'_T(x)$ et la recette marginale $R'_T(x)$.";
    case "resoudreEgaliteMarginales":
      return "Résous $C'_T(x)=R'_T(x)$ (deux solutions), puis donne la quantité retenue.";
    case "beneficeFormule":
      return "Calcule le bénéfice $B(x)=R_T(x)-C_T(x)$ (forme développée).";
    case "beneficeDerivee":
      return "Calcule la dérivée $B'(x)$.";
    case "tableauSigneBenefice": {
      const ex = exercice as ExerciceContexteEconomiqueB;
      return `Pour connaître le signe de $B'$ de part et d'autre de la quantité retenue, calcule $B'(${ex.pointTestAvant})$ et $B'(${ex.pointTestApres})$.`;
    }
    case "confirmationCoherence":
      return "Vérifie que le maximum de $B$ est atteint en la quantité retenue à l'égalité des marginales.";
    case "beneficeMaximum":
      return "Calcule le bénéfice maximal : la valeur de $B(x)$ pour la quantité retenue.";
    case "poserEquationReduite":
      return "L'égalité $C'_T(q)=C_M(q)$ équivaut à $q\\cdot C'_T(q)-C_T(q)=0$. Développe et réduis le membre de gauche : c'est $P(q)$.";
    case "iteration0":
    case "iteration1":
    case "iteration2":
    case "iteration3":
      return "Calcule le milieu de l'intervalle courant et le signe de $P$ en ce milieu, puis choisis le sous-intervalle qui contient la solution (un seul essai pour le signe et le sous-intervalle).";
    case "racineApprochee":
      return "D'après les quatre étapes, donne une valeur approchée de la solution de $P(q)=0$.";
  }
}

/** Version TEXTE BRUT de la consigne d'écran (ancien adaptateur papier, en attendant sa refonte) :
 * dollars retirés, quelques commandes LaTeX remplacées par leur équivalent Unicode. */
export function consigneEcran(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string {
  return consigneEcranRiche(exercice, ecran)
    .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\cdot/g, "·")
    .replace(/\{,\}/g, ",")
    .replace(/\$/g, "");
}

// ============================================================================
// Aides — niveau 1 (méthode), niveau 2 (exemple proche ou équation substituée, jamais la réponse).
// ============================================================================

/** Aide fragmentée — texte en français d'un côté, formule KaTeX de l'autre (jamais de formule
 * brute dans le texte), rendue via `<p>{aide.texte}</p> {aide.latex && <Katex expression={aide.latex} block />}`. */
export interface AideFragmentee {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau1(ecran: EcranContexteEconomique, exercice?: ExerciceContexteEconomique): AideFragmentee {
  switch (ecran) {
    case "coutMarginalDiscret":
      return { texte: "C'est une différence de deux valeurs du coût total, sans dérivée :", latex: "C_T(q_0+1)-C_T(q_0)" };
    case "deriveeSymbolique":
      return { texte: "Dérive terme à terme :", latex: "\\left(a\\,q^n\\right)'=n\\,a\\,q^{n-1}" };
    case "deriveeValeur":
      return { texte: "Remplace q par q₀ dans l'expression de la dérivée que tu viens de trouver.", latex: null };
    case "comparaisonEcart":
      return { texte: "L'écart en pourcentage se calcule par rapport à l'estimation par la dérivée :", latex: "\\text{écart en \\%}=\\dfrac{\\text{écart absolu}}{C'_T(q_0)}\\times 100" };
    case "extremum":
      if (exercice && exercice.famille === "A" && exercice.minimum.grandeur === "coutMarginal") {
        return { texte: "Dérive le coût marginal, puis résous :", latex: "C''_T(q)=0" };
      }
      return { texte: "Écris le coût moyen comme une somme, dérive-le, puis résous :", latex: "C_M(q)=\\dfrac{C_T(q)}{q} \\qquad C'_M(q)=0" };
    case "recetteTotale":
      return { texte: "Multiplie chaque terme du prix par x.", latex: null };
    case "marginales":
      return { texte: "Le coût marginal et la recette marginale sont les dérivées du coût total et de la recette totale.", latex: null };
    case "resoudreEgaliteMarginales":
      return { texte: "Ramène tout dans un membre et résous l'équation du deuxième degré. Une quantité produite est positive.", latex: null };
    case "beneficeFormule":
      return { texte: "Le signe « − » se distribue sur tous les termes du coût total :", latex: "B(x)=R_T(x)-C_T(x)" };
    case "beneficeDerivee":
      return { texte: "Tu as déjà calculé les deux dérivées :", latex: "B'(x)=R'_T(x)-C'_T(x)" };
    case "tableauSigneBenefice":
      return { texte: "Remplace x par chaque point test dans ton expression de B'(x).", latex: null };
    case "confirmationCoherence":
      return { texte: "B'(x) = 0 équivaut à R'_T(x) = C'_T(x).", latex: null };
    case "beneficeMaximum":
      return { texte: "Remplace x par la quantité retenue dans B(x), pas dans B'(x).", latex: null };
    case "poserEquationReduite":
      return { texte: "Distribue q dans la dérivée, puis soustrais le coût total terme à terme : le terme en q disparaît.", latex: null };
    case "iteration0":
    case "iteration1":
    case "iteration2":
    case "iteration3":
      return { texte: "On garde le sous-intervalle aux bornes duquel P prend des signes contraires.", latex: null };
    case "racineApprochee":
      return { texte: "Le milieu du dernier intervalle obtenu est une bonne approximation de la solution.", latex: null };
  }
}

export function texteAideNiveau2(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): AideFragmentee {
  switch (ecran) {
    case "coutMarginalDiscret":
      return { texte: "Exemple :", latex: "C_T(q)=q^2+3q+10 \\;\\Rightarrow\\; C_T(3)-C_T(2)=28-20=8" };
    case "deriveeSymbolique":
      return { texte: "Exemple :", latex: "C_T(q)=q^2+3q+10 \\;\\Rightarrow\\; C'_T(q)=2q+3" };
    case "deriveeValeur":
      return { texte: "Exemple :", latex: "C'_T(q)=2q+3,\\ q_0=2 \\;\\Rightarrow\\; C'_T(2)=7" };
    case "comparaisonEcart":
      return { texte: "Exemple :", latex: "8 \\text{ et } 7 \\;\\Rightarrow\\; \\text{écart absolu}=1,\\ \\text{écart en \\%}=\\dfrac{1}{7}\\times100\\approx14{,}29\\ \\%" };
    case "extremum": {
      const ex = exercice as ExerciceContexteEconomiqueA;
      if (ex.minimum.grandeur === "coutMarginal") {
        return { texte: "Avec les données, la dérivée du coût marginal vaut :", latex: `C''_T(q)=${formatPolynomeVarLatex([2 * (ex.coutTotal as CoutTotalDegre3).b, 6 * ex.coutTotal.a], "q")}` };
      }
      const c = ex.coutTotal;
      return { texte: "Avec les données :", latex: `C_M(q)=${c.a === 1 ? "" : c.a}q+${c.b}+\\dfrac{${c.degre === 2 ? c.c : 0}}{q}` };
    }
    case "recetteTotale":
      return { texte: "Exemple :", latex: "p(x)=50-2x \\;\\Rightarrow\\; R_T(x)=(50-2x)\\,x=50x-2x^2" };
    case "marginales":
      return { texte: "Exemple :", latex: "C_T(x)=x^3+2x+5,\\ R_T(x)=50x-2x^2 \\;\\Rightarrow\\; C'_T(x)=3x^2+2,\\ R'_T(x)=50-4x" };
    case "resoudreEgaliteMarginales": {
      const ex = exercice as ExerciceContexteEconomiqueB;
      return { texte: "Avec les données, l'égalité s'écrit :", latex: `${formatPolynomeVarLatex([ex.c, 2 * ex.b, 3 * ex.a], "x")}=${formatPolynomeVarLatex([ex.k, 2 * ex.m], "x")}` };
    }
    case "beneficeFormule":
      return { texte: "Exemple :", latex: "R_T(x)=50x-2x^2,\\ C_T(x)=x^3+2x+5 \\;\\Rightarrow\\; B(x)=-x^3-2x^2+48x-5" };
    case "beneficeDerivee":
      return { texte: "Exemple :", latex: "B(x)=-x^3-2x^2+48x-5 \\;\\Rightarrow\\; B'(x)=-3x^2-4x+48" };
    case "tableauSigneBenefice":
      return { texte: "Si B' est positive avant la quantité retenue et négative après, B croît puis décroît : le bénéfice y est maximal.", latex: null };
    case "confirmationCoherence":
      return { texte: "C'est toujours le cas :", latex: "B'(x)=R'_T(x)-C'_T(x)" };
    case "beneficeMaximum":
      return { texte: "Calcule séparément la recette et le coût pour cette quantité, puis fais la différence.", latex: null };
    case "poserEquationReduite":
      return {
        texte: "Exemple :",
        latex: "C_T(q)=q^3+2q^2+4q+5 \\;\\Rightarrow\\; P(q)=q(3q^2+4q+4)-(q^3+2q^2+4q+5)=2q^3+2q^2-5",
      };
    case "iteration0":
    case "iteration1":
    case "iteration2":
    case "iteration3": {
      const ex = exercice as ExerciceContexteEconomiqueBonus;
      const it = ex.iterations[["iteration0", "iteration1", "iteration2", "iteration3"].indexOf(ecran)];
      return { texte: "Le milieu se calcule ainsi (il reste à évaluer P en ce point) :", latex: `\\dfrac{${formatNombreLatex(it.gauche)}+${formatNombreLatex(it.droite)}}{2}` };
    }
    case "racineApprochee":
      return { texte: "La précision annoncée est la demi-largeur du dernier intervalle obtenu.", latex: null };
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
// Réponse ATTENDUE, par écran (récapitulatif, bannière de validation, fiche des puces).
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string[] {
  if (exercice.famille === "A") return formatReponseAttendueA(exercice, ecran);
  if (exercice.famille === "B") return formatReponseAttendueB(exercice, ecran);
  return formatReponseAttendueBonus(exercice, ecran);
}

function formatReponseAttendueA(exercice: ExerciceContexteEconomiqueA, ecran: EcranContexteEconomique): string[] {
  switch (ecran) {
    case "coutMarginalDiscret":
      return [`C_T(${exercice.q0 + 1})-C_T(${exercice.q0})=${formatNombreLatex(exercice.cmDiscret)}`];
    case "deriveeSymbolique":
      return [`C'_T(q)=${formatDeriveeCoutTotalLatex(exercice.coutTotal, "q")}`];
    case "deriveeValeur":
      return [`C'_T(${exercice.q0})=${formatNombreLatex(exercice.cmDerivee)}`];
    case "comparaisonEcart":
      return [`\\text{écart absolu}=${formatNombreLatex(exercice.ecartAbsolu)}`, `\\text{écart}${egalOuEnviron(exercice.ecartPourcent * 100)}${formatCentiemeLatex(exercice.ecartPourcent)}\\ \\%`];
    case "extremum": {
      const { q, valeur, grandeur } = exercice.minimum;
      const nom = grandeur === "coutMoyen" ? `C_M` : `C'_T`;
      return [`q${egalOuEnviron(q)}${formatCentiemeLatex(q)}`, `${nom}(q)_{\\min}${egalOuEnviron(valeur)}${formatCentiemeLatex(valeur)}`];
    }
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
  const bPrime = (x: number) => 2 * exercice.m * x + exercice.k - (3 * exercice.a * x * x + 2 * exercice.b * x + exercice.c);
  switch (ecran) {
    case "recetteTotale":
      return [`R_T(x)=${RT}`];
    case "marginales":
      return [`C'_T(x)=${CmLatex}`, `R'_T(x)=${RmLatex}`];
    case "resoudreEgaliteMarginales":
      return [`x=${exercice.xOpt} \\text{ (retenue)}`, `x=${exercice.xNeg} \\text{ (rejetée : quantité négative)}`];
    case "beneficeFormule":
      return [`B(x)=${BLatex}`];
    case "beneficeDerivee":
      return [`B'(x)=${BPrimeLatex}`];
    case "tableauSigneBenefice":
      return [`B'(${exercice.pointTestAvant})=${bPrime(exercice.pointTestAvant)}>0`, `B'(${exercice.pointTestApres})=${bPrime(exercice.pointTestApres)}<0`, `\\text{B croît puis décroît : maximum en } x=${exercice.xOpt}`];
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
    return [`\\text{milieu}=${formatNombreLatex(it.milieu)}`, `P(${formatNombreLatex(it.milieu)})${it.signeMilieu > 0 ? ">0" : "<0"}`, `\\text{on garde } [${formatNombreLatex(it.garderCote === "gauche" ? it.gauche : it.milieu)}\\,;\\,${formatNombreLatex(it.garderCote === "gauche" ? it.milieu : it.droite)}]`];
  }
  if (ecran === "racineApprochee") return [`q\\approx${formatNombreLatex(Math.round(exercice.racineApprochee * 10000) / 10000)}`];
  return [];
}

// ============================================================================
// Précision annoncée — TOUJOURS identique à la tolérance réellement codée (voir CLAUDE.md).
// ============================================================================

export const PRECISION_ECART_POURCENT = "";
/** Conservé pour l'ancien adaptateur papier (le texte de précision est déjà dans la consigne). */
export const PRECISION_EXTREMUM = "";

export function precisionRacineApprochee(exercice: ExerciceContexteEconomiqueBonus): string {
  return `(réponse acceptée à ${formatNombreTexte(exercice.toleranceFinale)} près)`;
}

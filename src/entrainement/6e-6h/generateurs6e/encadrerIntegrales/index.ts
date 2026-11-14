import type {
  ExerciceComparerIntegrales,
  ExerciceEncadrerIntegrale,
  ExerciceEncadrerIntegrales,
  ExerciceSigneIntegrale,
  FragmentJustification,
  IssueComparaison,
  VarianteEncadrerIntegrales,
} from "../../core6e/encadrerIntegrales.types";
import { FONCTIONS_ENCADREMENT, FONCTIONS_SIGNE, PAIRES_COMPARAISON, intervalleLatex } from "./catalogue";
import type { IntervalleComparaison, PaireComparaison } from "./catalogue";

/**
 * Couche A (6e) — générateur de `6gen79` « Comparer et encadrer des intégrales ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même
 * tirage, ici comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Verdicts équilibrés (décision de l'utilisateur) : le signe de f (variante `signe`) est tiré à
 * 50/50 ; l'issue de la comparaison (f ≤ g, f ≥ g, f − g change de signe) à 1/3 chacune, AVANT de
 * choisir la paire et l'intervalle — jamais figée par le profil (`forme` ne la contient pas).
 */

function hasard<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

const t = (valeur: string): FragmentJustification => ({ type: "texte", valeur });

/** « x^{2}-x^{3}=x^{2}(1-x) » → « x^{2}(1-x) » (forme factorisée). */
function membreDroit(egalite: string): string {
  return egalite.split("=").slice(1).join("=");
}
const l = (valeur: string): FragmentJustification => ({ type: "latex", valeur });

// ============================================================================
// Signe.
// ============================================================================

export function construireSigne(inverse: boolean): ExerciceSigneIntegrale {
  const signeF = Math.random() < 0.5 ? "positif" : "negatif";
  const fonction = hasard(FONCTIONS_SIGNE);
  const [p, q] = hasard(signeF === "positif" ? fonction.positif : fonction.negatif);
  return {
    variante: "signe",
    idFonction: fonction.id,
    fLatex: fonction.latex,
    fn: fonction.fn,
    p,
    q,
    inverse,
    signeF,
    aide1: fonction.aide1,
    aide2: fonction.aide2,
    justification: fonction.justification(signeF, p, q),
  };
}

// ============================================================================
// Comparer.
// ============================================================================

function justificationComparaison(paire: PaireComparaison, intervalle: IntervalleComparaison, fEstP: boolean, issue: IssueComparaison): FragmentJustification[] {
  const I = intervalleLatex(intervalle.p, intervalle.q);
  const debut = paire.type === "etude" ? [...(paire.etude ?? []), t(" ")] : [];
  if (issue === "change") {
    const diff = paire.type === "facteurs" ? (fEstP ? paire.differencePQ : paire.differenceQP) : null;
    return [
      ...debut,
      t("La différence "),
      l(diff ? `f(x)-g(x)=${membreDroit(diff)}` : "f(x)-g(x)"),
      t(" s'annule en "),
      l(`x=${intervalle.zero}`),
      t(", strictement à l'intérieur de "),
      l(I),
      t(", et y change de signe : on n'a ni "),
      l("f\\le g"),
      t(" ni "),
      l("f\\ge g"),
      t(" sur tout l'intervalle."),
    ];
  }
  const sens = issue === "fSupG" ? "\\ge" : "\\le";
  if (paire.type === "etude") {
    return [...debut, t("En particulier, sur "), l(I), t(" : "), l(`f(x)${sens} g(x)`), t(".")];
  }
  const diff = fEstP ? paire.differencePQ : paire.differenceQP;
  return [
    t("Sur "),
    l(I),
    t(", "),
    l(`f(x)-g(x)=${membreDroit(diff)}`),
    t(" : chaque facteur garde un signe constant sur l'intervalle (tableau de signes), et cette différence y est "),
    t(issue === "fSupG" ? "positive" : "négative"),
    t(", donc "),
    l(`f(x)${sens} g(x)`),
    t(" pour tout x de "),
    l(I),
    t("."),
  ];
}

export function construireComparer(issueImposee?: IssueComparaison): ExerciceComparerIntegrales {
  const issue: IssueComparaison = issueImposee ?? hasard(["fInfG", "fSupG", "change"] as const);
  const combos: { paire: PaireComparaison; intervalle: IntervalleComparaison }[] = [];
  for (const paire of PAIRES_COMPARAISON) {
    for (const intervalle of paire.intervalles) {
      if ((issue === "change") === (intervalle.signe === "change")) combos.push({ paire, intervalle });
    }
  }
  const { paire, intervalle } = hasard(combos);
  // P − Q > 0 et issue f ≥ g → f = P ; P − Q < 0 et f ≥ g → f = Q ; changement : au hasard.
  const fEstP = issue === "change" ? Math.random() < 0.5 : (intervalle.signe === "pos") === (issue === "fSupG");
  const ecritureH = fEstP ? paire.differencePQ : paire.differenceQP;
  const aide1 =
    paire.type === "facteurs"
      ? { texte: "Étudie le signe de la différence ; factorisée, elle s'écrit :", latex: `f(x)-g(x)=${membreDroit(ecritureH)}` }
      : { texte: "Pose h(x) = f(x) − g(x) et étudie ses variations :", latex: ecritureH };
  return {
    variante: "comparer",
    idPaire: paire.id,
    fLatex: fEstP ? paire.pLatex : paire.qLatex,
    gLatex: fEstP ? paire.qLatex : paire.pLatex,
    fn: fEstP ? paire.pn : paire.qn,
    gn: fEstP ? paire.qn : paire.pn,
    p: intervalle.p,
    q: intervalle.q,
    issue,
    aide1,
    aide2: fEstP ? paire.aide2PQ : paire.aide2QP,
    justification: justificationComparaison(paire, intervalle, fEstP, issue),
  };
}

// ============================================================================
// Encadrer, valeur moyenne.
// ============================================================================

export function construireEncadrement(variante: "encadrer" | "moyenne", structure: "monotone" | "variations"): ExerciceEncadrerIntegrale {
  const pool = FONCTIONS_ENCADREMENT.filter((f) => f.structure === structure && (variante === "encadrer" || f.longueur.valeur !== 1));
  const f = hasard(pool);
  return {
    variante,
    idFonction: f.id,
    structure: f.structure,
    fLatex: f.fLatex,
    fn: f.fn,
    a: f.a,
    b: f.b,
    longueur: f.longueur,
    monotonie: f.monotonie,
    deriveeLatex: f.deriveeLatex,
    tableau: f.tableau,
    m: f.m,
    M: f.M,
    borneInf: f.borneInf,
    borneSup: f.borneSup,
    calcul: f.calcul,
  };
}

// ============================================================================
// Catalogue (sélecteur de variante, feuilles d'exercices).
// ============================================================================

export type IdVarianteEncadrerIntegrales = VarianteEncadrerIntegrales;

export const CATALOGUE_VARIANTES: { id: IdVarianteEncadrerIntegrales; label: string }[] = [
  { id: "signe", label: "Signe d'une intégrale sans la calculer" },
  { id: "comparer", label: "Comparer deux intégrales sans calcul" },
  { id: "encadrer", label: "Encadrer une intégrale par m(b − a) et M(b − a)" },
  { id: "moyenne", label: "Encadrer une valeur moyenne" },
];

export function construireAvecVarianteId(id: IdVarianteEncadrerIntegrales): ExerciceEncadrerIntegrales {
  switch (id) {
    case "signe":
      return construireSigne(Math.random() < 0.5);
    case "comparer":
      return construireComparer();
    case "encadrer":
      return construireEncadrement("encadrer", Math.random() < 0.5 ? "monotone" : "variations");
    case "moyenne":
      return construireEncadrement("moyenne", Math.random() < 0.5 ? "monotone" : "variations");
  }
}

/** Tirage libre : les quatre variantes équiprobables. */
export function genererExerciceEncadrerIntegrales(): ExerciceEncadrerIntegrales {
  return construireAvecVarianteId(hasard(CATALOGUE_VARIANTES).id);
}

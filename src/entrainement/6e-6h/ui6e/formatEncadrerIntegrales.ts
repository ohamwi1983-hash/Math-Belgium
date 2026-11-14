import type { ExerciceEncadrerIntegrale, ExerciceEncadrerIntegrales, NombreExact, TexteAvecLatex } from "../core6e/encadrerIntegrales.types";
import type { PhaseChampsEncadrer, PhaseChoixEncadrer, PhaseEncadrerIntegrales } from "../moteur6e/typesEncadrerIntegrales";
import { cibles, optionCorrecte } from "../moteur6e/verificationEncadrerIntegrales";

/**
 * Couche C (6e) — textes de `6gen79` « Comparer et encadrer des intégrales ». SOURCE UNIQUE des
 * consignes, options, aides et réponses attendues : l'écran, le récapitulatif et l'adaptateur de
 * feuilles (`generateurs6e/encadrerIntegrales/exportEvaluation.ts`) en dérivent.
 *
 * Règles permanentes : aucune formule écrite au clavier (les formules vont dans `latex`), « − »
 * typographique, virgule décimale `{,}`, jamais de prose en mode math, aides sans la réponse.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  label: string;
  placeholder: string;
}

export type AideAvecLatex = TexteAvecLatex;

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const PRECISION = " (valeur exacte, ou arrondie au centième).";

// ============================================================================
// Écritures.
// ============================================================================

/** Borne d'intégrale : `\frac` plutôt que `\dfrac` (exposant/indice compact). */
function borne(n: NombreExact): string {
  return n.latex.replace(/\\dfrac/g, "\\frac");
}

export function intervalle(p: NombreExact, q: NombreExact): string {
  return `[${p.latex}\\,;\\,${q.latex}]`;
}

/** Bornes de l'intervalle rangé dans l'ordre croissant. */
export function bornesOrdonnees(e: ExerciceEncadrerIntegrales): [NombreExact, NombreExact] {
  return e.variante === "signe" || e.variante === "comparer" ? [e.p, e.q] : [e.a, e.b];
}

/** Bornes de I telles qu'écrites (échangées pour `signe` inverse). */
function bornesI(e: ExerciceEncadrerIntegrales): [NombreExact, NombreExact] {
  const [p, q] = bornesOrdonnees(e);
  return e.variante === "signe" && e.inverse ? [q, p] : [p, q];
}

export function integraleLatex(e: ExerciceEncadrerIntegrales, fonction = "f"): string {
  const [a, b] = bornesI(e);
  return `\\int_{${borne(a)}}^{${borne(b)}} ${fonction}(x)\\,dx`;
}

function integraleOrdonnee(e: ExerciceEncadrerIntegrales, fonction = "f"): string {
  const [p, q] = bornesOrdonnees(e);
  return `\\int_{${borne(p)}}^{${borne(q)}} ${fonction}(x)\\,dx`;
}

/** Arrondi au centième en LaTeX (« 0{,}37 », « −8 » jamais « −0{,}00 »). */
export function centieme(v: number): string {
  const r = Math.round(v * 100) / 100;
  const s = (Object.is(r, -0) ? 0 : r).toFixed(2).replace(".", "{,}");
  return s;
}

/** Vrai pour un rationnel du catalogue (dénominateurs 2, 3, 4, 5, 10…) : pas d'approximation. */
function estRationnel(v: number): boolean {
  return Math.abs(v * 360 - Math.round(v * 360)) < 1e-9;
}

/** « \dfrac{1}{e}\approx 0{,}37 », ou la seule écriture exacte pour un rationnel. */
export function avecApproximation(n: NombreExact): string {
  return estRationnel(n.valeur) ? n.latex : `${n.latex}\\approx ${centieme(n.valeur)}`;
}

/** Longueur b − a, détaillée (« 2-0=2 », « 2-(-1)=3 »). */
export function longueurDetaillee(e: ExerciceEncadrerIntegrale): string {
  const a = e.a.valeur < 0 ? `\\left(${e.a.latex}\\right)` : e.a.latex;
  return `b-a=${e.b.latex}-${a}=${e.longueur.latex}`;
}

/** Image d'une borne (monotone) : « f(1)=\dfrac{1}{e} ». */
function image(borneX: NombreExact, valeur: NombreExact): string {
  return `f(${borneX.latex})=${valeur.latex}`;
}

// ============================================================================
// Consigne générale et données.
// ============================================================================

export function consigneGenerale(e: ExerciceEncadrerIntegrales): FragmentConsigne[] {
  switch (e.variante) {
    case "signe":
      return [t("Sans calculer l'intégrale "), l("I"), t(", détermine son signe à l'aide des propriétés de l'intégrale.")];
    case "comparer":
      return [t("Sans calculer les intégrales "), l("I"), t(" et "), l("J"), t(", compare-les à l'aide des propriétés de l'intégrale.")];
    case "encadrer":
      return [
        t("La fonction f est définie sur "),
        l(intervalle(e.a, e.b)),
        t(e.structure === "variations" ? " ; son tableau de variations est donné ci-dessous. " : ". "),
        t("Encadre l'intégrale "),
        l("I"),
        t(" sans la calculer, à l'aide du minimum et du maximum de f sur cet intervalle."),
      ];
    case "moyenne":
      return [
        t("La fonction f est définie sur "),
        l(intervalle(e.a, e.b)),
        t(e.structure === "variations" ? " ; son tableau de variations est donné ci-dessous. " : ". "),
        t("On note "),
        l("\\mu"),
        t(" sa valeur moyenne sur cet intervalle. Encadre "),
        l("\\mu"),
        t(" sans calculer d'intégrale, à l'aide du minimum et du maximum de f."),
      ];
  }
}

export function blocDonnees(e: ExerciceEncadrerIntegrales): string[] {
  switch (e.variante) {
    case "signe":
      return [`f(x)=${e.fLatex}`, `I=${integraleLatex(e)}`];
    case "comparer":
      return [`f(x)=${e.fLatex}\\qquad g(x)=${e.gLatex}`, `I=${integraleLatex(e, "f")}\\qquad J=${integraleLatex(e, "g")}`];
    case "encadrer":
      return [`f(x)=${e.fLatex}`, `I=${integraleLatex(e)}`];
    case "moyenne":
      return [`f(x)=${e.fLatex}`, `\\mu=\\dfrac{1}{${e.b.latex}-${e.a.valeur < 0 ? `\\left(${e.a.latex}\\right)` : e.a.latex}}${integraleLatex(e)}`];
  }
}

// ============================================================================
// Écrans.
// ============================================================================

export function libellePhase(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): string {
  switch (phase) {
    case "signeF":
      return "Signe de f sur l'intervalle";
    case "signeOrdonne":
      return "Positivité, bornes dans l'ordre";
    case "conclusionSigne":
      return "Signe de I";
    case "inegalite":
      return "Inégalité entre f et g";
    case "conclusionComparaison":
      return "Comparaison de I et J";
    case "m":
      return "Minimum m";
    case "M":
      return "Maximum M";
    case "mM":
      return "Minimum et maximum";
    case "bornes":
      return "Encadrement de I";
    case "bornesIntegrale":
      return e.variante === "moyenne" ? "Encadrement de l'intégrale" : "Encadrement de I";
    case "bornesMoyenne":
      return "Encadrement de la valeur moyenne";
  }
}

export function consigneEcran(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): FragmentConsigne[] {
  const [p, q] = bornesOrdonnees(e);
  const I = intervalle(p, q);
  switch (phase) {
    case "signeF":
      return [t("Établis le signe de "), l("f(x)"), t(" pour x dans l'intervalle "), l(I), t(" (une seule réponse possible).")];
    case "signeOrdonne":
      return [
        t("Les bornes de "),
        l("I"),
        t(" ne sont pas rangées dans l'ordre croissant. Applique d'abord la propriété de positivité à l'intégrale dont les bornes sont dans l'ordre croissant : quel est le signe de "),
        l(integraleOrdonnee(e)),
        t(" ? (une seule réponse possible)"),
      ];
    case "conclusionSigne":
      return [t("Conclus : quel est le signe de "), l("I"), t(" ? (une seule réponse possible)")];
    case "inegalite":
      return [t("Établis l'inégalité entre "), l("f(x)"), t(" et "), l("g(x)"), t(" pour x dans l'intervalle "), l(I), t(" (une seule réponse possible).")];
    case "conclusionComparaison":
      return [t("Applique la propriété de comparaison et conclus (une seule réponse possible).")];
    case "m":
      return [t("Détermine le minimum "), l("m"), t(" de f sur "), l(I), t(PRECISION)];
    case "M":
      return [t("Détermine le maximum "), l("M"), t(" de f sur "), l(I), t(PRECISION)];
    case "mM":
      return [t("Détermine le minimum "), l("m"), t(" et le maximum "), l("M"), t(" de f sur "), l(I), t(PRECISION)];
    case "bornes":
      return [t("Déduis-en un encadrement de "), l("I"), t(" de la forme "), l("m(b-a)\\le I\\le M(b-a)"), t(" : donne ses deux bornes"), t(PRECISION)];
    case "bornesIntegrale":
      return [t("Encadre l'intégrale "), l(integraleLatex(e)), t(" : donne les bornes "), l("m(b-a)"), t(" et "), l("M(b-a)"), t(PRECISION)];
    case "bornesMoyenne":
      return [t("Déduis-en un encadrement de la valeur moyenne "), l("\\mu"), t(" de f sur "), l(I), t(" : donne ses deux bornes"), t(PRECISION)];
  }
}

export function champsEcran(phase: PhaseChampsEncadrer): ChampDef[] {
  switch (phase) {
    case "m":
      return [{ label: "m =", placeholder: "ex. 1/e ou 0,37" }];
    case "M":
      return [{ label: "M =", placeholder: "ex. 2sqrt(5)" }];
    case "mM":
      return [
        { label: "m =", placeholder: "ex. 1/e ou 0,37" },
        { label: "M =", placeholder: "ex. 2sqrt(5)" },
      ];
    case "bornes":
    case "bornesIntegrale":
      return [
        { label: "Borne inférieure", placeholder: "ex. 3/e^4" },
        { label: "Borne supérieure", placeholder: "ex. 4e^2" },
      ];
    case "bornesMoyenne":
      return [
        { label: "Borne inférieure de μ", placeholder: "ex. 1/5" },
        { label: "Borne supérieure de μ", placeholder: "ex. 2,5" },
      ];
  }
}

// ============================================================================
// Options des écrans à choix fermé (ordre fixe ; l'issue correcte varie d'un exercice à l'autre).
// ============================================================================

export function optionsEcran(e: ExerciceEncadrerIntegrales, phase: PhaseChoixEncadrer): OptionChoix[] {
  const [p, q] = bornesOrdonnees(e);
  const I = intervalle(p, q);
  switch (phase) {
    case "signeF":
      return [
        { id: "positif", fragments: [t("Pour tout x de "), l(I), t(", "), l("f(x)\\ge 0")] },
        { id: "negatif", fragments: [t("Pour tout x de "), l(I), t(", "), l("f(x)\\le 0")] },
        { id: "change", fragments: [l("f"), t(" change de signe sur "), l(I)] },
      ];
    case "signeOrdonne":
      return [
        { id: "positif", fragments: [l(`\\displaystyle ${integraleOrdonnee(e)}\\ge 0`)] },
        { id: "negatif", fragments: [l(`\\displaystyle ${integraleOrdonnee(e)}\\le 0`)] },
        { id: "inconnu", fragments: [t("On ne peut pas connaître son signe sans la calculer")] },
      ];
    case "conclusionSigne":
      return [
        { id: "positif", fragments: [l("I\\ge 0"), t(" : l'intégrale est positive")] },
        { id: "negatif", fragments: [l("I\\le 0"), t(" : l'intégrale est négative")] },
        { id: "nul", fragments: [l("I=0"), t(" : l'intégrale est nulle")] },
        { id: "inconnu", fragments: [t("On ne peut pas connaître le signe de "), l("I"), t(" sans la calculer")] },
      ];
    case "inegalite":
      return [
        { id: "fInfG", fragments: [t("Pour tout x de "), l(I), t(", "), l("f(x)\\le g(x)")] },
        { id: "fSupG", fragments: [t("Pour tout x de "), l(I), t(", "), l("f(x)\\ge g(x)")] },
        { id: "change", fragments: [l("f(x)-g(x)"), t(" change de signe sur "), l(I)] },
      ];
    case "conclusionComparaison":
      return [
        { id: "inf", fragments: [l("I\\le J")] },
        { id: "sup", fragments: [l("I\\ge J")] },
        { id: "egal", fragments: [l("I=J")] },
        { id: "inconnu", fragments: [t("On ne peut pas comparer "), l("I"), t(" et "), l("J"), t(" sans les calculer : la propriété de comparaison ne s'applique pas")] },
      ];
  }
}

export function fragmentsOption(options: OptionChoix[], id: string | null | undefined): FragmentConsigne[] {
  return options.find((o) => o.id === id)?.fragments ?? [];
}

/** Option correcte d'un écran à choix (fragments). */
export function optionCorrecteFragments(e: ExerciceEncadrerIntegrales, phase: PhaseChoixEncadrer): FragmentConsigne[] {
  return fragmentsOption(optionsEcran(e, phase), optionCorrecte(e, phase));
}

// ============================================================================
// Réponses attendues (LaTeX), écrans à champs.
// ============================================================================

export function formatReponseAttendueLatex(e: ExerciceEncadrerIntegrales, phase: PhaseChampsEncadrer): string[] {
  if (e.variante !== "encadrer" && e.variante !== "moyenne") return [];
  const [c0, c1] = cibles(e, phase);
  const mono = e.structure === "monotone";
  const croissante = e.monotonie === "croissante";
  const mLatex = mono ? `m=${image(croissante ? e.a : e.b, e.m)}` : `m=${e.m.latex}`;
  const MLatex = mono ? `M=${image(croissante ? e.b : e.a, e.M)}` : `M=${e.M.latex}`;
  const approx = (n: NombreExact) => (estRationnel(n.valeur) ? "" : `\\approx ${centieme(n.valeur)}`);
  switch (phase) {
    case "m":
      return [`${mLatex}${approx(e.m)}`];
    case "M":
      return [`${MLatex}${approx(e.M)}`];
    case "mM":
      return [`${mLatex}${approx(e.m)}`, `${MLatex}${approx(e.M)}`];
    case "bornes":
      return [`${c0.latex}\\le I\\le ${c1.latex}`];
    case "bornesIntegrale":
      return [`${c0.latex}\\le ${integraleLatex(e)}\\le ${c1.latex}`];
    case "bornesMoyenne":
      return [`${c0.latex}\\le\\mu\\le ${c1.latex}`];
  }
}

// ============================================================================
// Aides (jamais la réponse).
// ============================================================================

function valeursTableau(e: ExerciceEncadrerIntegrale): string {
  return (e.tableau?.valeurs ?? []).map((v) => v.latex).join("\\qquad ");
}

function aideMinMax(e: ExerciceEncadrerIntegrale, quoi: "m" | "M" | "mM", niveau: 1 | 2): AideAvecLatex {
  if (e.structure === "monotone") {
    if (niveau === 1) return { texte: "Étudie le sens de variation de f sur l'intervalle ; sa dérivée vaut :", latex: e.deriveeLatex };
    return { texte: "Une fonction monotone sur un intervalle fermé atteint son minimum et son maximum aux bornes ; calcule les images des bornes :", latex: `f(${e.a.latex})\\qquad f(${e.b.latex})` };
  }
  if (niveau === 1) {
    const qui = quoi === "m" ? "le minimum de f sur l'intervalle est la plus petite" : quoi === "M" ? "le maximum de f sur l'intervalle est la plus grande" : "le minimum de f est la plus petite et le maximum la plus grande";
    return { texte: `Dans le tableau de variations, ${qui} des valeurs écrites aux bornes et aux extremums locaux.` };
  }
  return { texte: "Compare toutes les valeurs du tableau ; au besoin, rappelle-toi que e ≈ 2,718. Les valeurs du tableau sont :", latex: valeursTableau(e) };
}

export function aideNiveau1(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): AideAvecLatex {
  switch (phase) {
    case "signeF":
    case "inegalite":
      return e.variante === "signe" || e.variante === "comparer" ? e.aide1 : { texte: "" };
    case "signeOrdonne":
      return { texte: "Propriété de positivité : si f(x) ≥ 0 pour tout x de [a ; b], avec a < b, alors :", latex: "\\int_a^b f(x)\\,dx\\ge 0" };
    case "conclusionSigne":
      return e.variante === "signe" && e.inverse
        ? { texte: "Échanger les bornes d'une intégrale change son signe :", latex: "\\int_b^a f(x)\\,dx=-\\int_a^b f(x)\\,dx" }
        : { texte: "Propriété de positivité, pour a < b : une fonction positive sur [a ; b] a une intégrale positive, une fonction négative une intégrale négative :", latex: "f\\ge 0\\Rightarrow\\int_a^b f(x)\\,dx\\ge 0" };
    case "conclusionComparaison":
      return { texte: "Propriété de comparaison (croissance de l'intégrale), pour a < b :", latex: "f(x)\\le g(x)\\ \\ \\forall x\\in[a\\,;\\,b]\\ \\Rightarrow\\ \\int_a^b f(x)\\,dx\\le\\int_a^b g(x)\\,dx" };
    case "m":
    case "M":
    case "mM":
      return e.variante === "encadrer" || e.variante === "moyenne" ? aideMinMax(e, phase, 1) : { texte: "" };
    case "bornes":
    case "bornesIntegrale":
      return { texte: "Si m ≤ f(x) ≤ M pour tout x de [a ; b], la croissance de l'intégrale donne :", latex: "m(b-a)\\le\\int_a^b f(x)\\,dx\\le M(b-a)" };
    case "bornesMoyenne":
      return { texte: "La valeur moyenne s'obtient en divisant l'intégrale par la longueur de l'intervalle :", latex: "\\mu=\\dfrac{1}{b-a}\\int_a^b f(x)\\,dx" };
  }
}

export function aideNiveau2(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): AideAvecLatex {
  switch (phase) {
    case "signeF":
    case "inegalite":
      return e.variante === "signe" || e.variante === "comparer" ? e.aide2 : { texte: "" };
    case "signeOrdonne":
      return { texte: "Ici la plus petite borne est en bas : la propriété s'applique telle quelle, avec le signe de f trouvé à l'étape précédente." };
    case "conclusionSigne": {
      if (e.variante === "signe" && e.inverse) {
        const [p, q] = bornesOrdonnees(e);
        return { texte: "Écris I à l'aide de l'intégrale de l'étape précédente :", latex: `I=\\int_{${borne(q)}}^{${borne(p)}} f(x)\\,dx=-\\int_{${borne(p)}}^{${borne(q)}} f(x)\\,dx` };
      }
      return { texte: "Vérifie que les bornes de I sont dans l'ordre croissant (la plus petite en bas) : la propriété s'applique alors directement, avec le signe de f trouvé à l'étape précédente." };
    }
    case "conclusionComparaison":
      return { texte: "Cette propriété exige que l'inégalité entre f et g soit vraie sur TOUT l'intervalle ; si f − g change de signe, elle ne permet aucune conclusion." };
    case "m":
    case "M":
    case "mM":
      return e.variante === "encadrer" || e.variante === "moyenne" ? aideMinMax(e, phase, 2) : { texte: "" };
    case "bornes":
    case "bornesIntegrale":
      return e.variante === "encadrer" || e.variante === "moyenne" ? { texte: "Ici, la longueur de l'intervalle vaut :", latex: longueurDetaillee(e) } : { texte: "" };
    case "bornesMoyenne":
      return e.variante === "moyenne" ? { texte: "Divise chaque membre de l'encadrement de l'intégrale par la longueur de l'intervalle :", latex: longueurDetaillee(e) } : { texte: "" };
  }
}
